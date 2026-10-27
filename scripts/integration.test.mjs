import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
const require = createRequire(import.meta.url);
function load(file, imports = {}) {
  const source = readFileSync(new URL("../" + file, import.meta.url), "utf8");
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(js, {
    exports,
    require: (name) => imports[name] ?? require(name),
    process: { env: { NODE_ENV: "test" } },
    fetch,
    Headers,
    AbortSignal,
    URL,
    URLSearchParams,
    TextEncoder,
  });
  return exports;
}
const { createApiClient, ApiError } = load("src/lib/api-client.ts");
const response = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
const ok = (data) => response({ success: true, data });

test("writes include credentials and a CSRF token, without leaking them into the body", async () => {
  const calls = [];
  const api = createApiClient("http://fixture.invalid", async (url, init) => {
    calls.push({ url, init });
    return url.endsWith("csrf-token")
      ? ok({ csrfToken: "csrf-a" })
      : ok({ ticketNumber: "AL-TEST" });
  });
  const result = await api.post("/api/contact/enquiries", {
    name: "Test visitor",
    consent: true,
  });
  assert.equal(result.ticketNumber, "AL-TEST");
  assert.equal(calls.length, 2);
  assert.equal(calls[1].init.credentials, "include");
  assert.equal(calls[1].init.headers.get("x-csrf-token"), "csrf-a");
  assert.equal(JSON.parse(calls[1].init.body).name, "Test visitor");
  assert.equal(calls[1].init.cache, "no-store");
});

test("an expired CSRF token is replaced and the original request is retried", async () => {
  let csrfCount = 0,
    writeCount = 0;
  const api = createApiClient("http://fixture.invalid", async (url, init) => {
    if (url.endsWith("csrf-token")) return ok({ csrfToken: "csrf-" + ++csrfCount });
    writeCount += 1;
    if (writeCount === 1)
      return response({ error: "Expired token", code: "CSRF_INVALID" }, 403);
    assert.equal(init.headers.get("x-csrf-token"), "csrf-2");
    return ok({ saved: true });
  });
  assert.equal((await api.post("/api/legal/consents/cookies", {})).saved, true);
  assert.equal(csrfCount, 2);
  assert.equal(writeCount, 2);
});

test("CSRF failures have a bounded retry", async () => {
  let writes = 0;
  const api = createApiClient("http://fixture.invalid", async (url) => {
    if (url.endsWith("csrf-token")) return ok({ csrfToken: "token" });
    writes += 1;
    return response({ error: "CSRF failed", code: "CSRF_INVALID" }, 403);
  });
  await assert.rejects(
    api.post("/api/contact/enquiries", {}),
    (error) => error.status === 403,
  );
  assert.equal(writes, 2);
});

test("simultaneous expired sessions share a single refresh and preserve CSRF", async () => {
  let refreshed = false,
    refreshes = 0;
  const api = createApiClient("http://fixture.invalid", async (url, init) => {
    if (url.endsWith("csrf-token")) return ok({ csrfToken: "csrf-refresh" });
    if (url.endsWith("/refresh")) {
      refreshes += 1;
      assert.equal(init.headers.get("x-csrf-token"), "csrf-refresh");
      await new Promise((resolve) => setTimeout(resolve, 10));
      refreshed = true;
      return ok({});
    }
    return refreshed ? ok({ id: "customer-1" }) : response({ error: "Expired" }, 401);
  });
  const result = await Promise.all([
    api.get("/api/auth/me"),
    api.get("/api/support/tickets/my"),
  ]);
  assert.equal(refreshes, 1);
  assert.equal(result[0].id, "customer-1");
});

test("a failed login never tries to refresh another session", async () => {
  const urls = [];
  const api = createApiClient("http://fixture.invalid", async (url) => {
    urls.push(url);
    return url.endsWith("csrf-token")
      ? ok({ csrfToken: "token" })
      : response({ error: "Incorrect details" }, 401);
  });
  await assert.rejects(
    api.post("/api/auth/login", { email: "test@example.invalid", password: "wrong" }),
    (error) => error.status === 401,
  );
  assert.equal(
    urls.some((url) => url.endsWith("/refresh")),
    false,
  );
});

test("network failures remain connection errors instead of becoming an expired session", async () => {
  const api = createApiClient("http://fixture.invalid", async () => {
    throw new Error("offline");
  });
  await assert.rejects(
    api.get("/api/auth/me"),
    (error) =>
      error instanceof ApiError && error.status === 0 && /connect/.test(error.message),
  );
});

test("missing production origin fails without contacting Roboroot or a relative endpoint", async () => {
  let called = false;
  const api = createApiClient("", async () => {
    called = true;
    return ok({});
  });
  await assert.rejects(api.get("/api/contact/settings"));
  assert.equal(called, false);
});

test("auth redirects remain inside Albumo and avoid login loops", () => {
  const { safeRedirect } = load("src/features/auth/types.ts");
  for (const value of [
    "https://example.com",
    "//example.com",
    "/\\example.com",
    "/login",
    "/callback",
    "/\nexample.com",
    null,
  ])
    assert.equal(safeRedirect(value), "/account");
  assert.equal(safeRedirect("/support/tickets?view=open"), "/support/tickets?view=open");
});

test("product enquiry safely encodes personal text and selected options", () => {
  const types = load("src/lib/catalogue-types.ts");
  const { buildCatalogueEnquiry } = load("src/lib/catalogue-model.ts", {
    "./catalogue-types": types,
  });
  const product = {
    id: "album",
    title: "Goa & friends",
    basePriceCents: 10000,
    configuration: {
      ...types.emptyConfiguration,
      personalizationEnabled: true,
      allowText: true,
      groups: [
        {
          id: "finish",
          label: "Finish",
          required: true,
          options: [{ id: "matte", label: "Matte", priceAdjustmentCents: 0 }],
        },
      ],
    },
  };
  const url = new URL(
    buildCatalogueEnquiry(product, { finish: "matte" }, 3, "Friends & family #1"),
    "https://albumo.invalid",
  );
  assert.equal(url.pathname, "/contact");
  assert.equal(url.searchParams.get("subject"), "Enquiry: Goa & friends");
  assert.match(url.searchParams.get("message"), /Quantity: 3/);
  assert.match(url.searchParams.get("message"), /Matte/);
  assert.match(url.searchParams.get("message"), /Friends & family #1/);
});

test("support and contact methods use the existing backend route and payload contracts", async () => {
  const calls = [];
  const fake = {
    get: async (...args) => {
      calls.push(["GET", ...args]);
      return [];
    },
    post: async (...args) => {
      calls.push(["POST", ...args]);
      return {};
    },
    request: async (...args) => {
      calls.push(["REQUEST", ...args]);
      return {};
    },
  };
  const { supportApi } = load("src/features/support/support.service.ts", {
    "@/lib/api-client": { api: fake },
  });
  const contact = load("src/features/contact/contact.service.ts", {
    "@/lib/api-client": { api: fake },
  });
  await supportApi.trackTicket("AL/one", "guest@example.invalid");
  await supportApi.reply("AL/one", "My reply", "guest@example.invalid");
  await contact.sendContactRequest({ consent: true, intent: "CUSTOM_PROJECT" });
  await contact.newsletterRequest("unsubscribe", { token: "a".repeat(64) });
  assert.equal(calls[0][1], "/api/support/tickets/AL%2Fone/track");
  assert.equal(calls[1][2].message, "My reply");
  assert.equal(calls[2][1], "/api/contact/enquiries");
  assert.equal(calls[3][1], "/api/contact/newsletter/unsubscribe");
});

const { normalizeMobileInput, indianPhone, secondsRemaining } = load(
  "src/features/auth/phone.ts",
);
test("mobile entry accepts Indian country-code paste but rejects invalid or foreign numbers", () => {
  for (const input of ["9999999999", "+91 99999 99999", "(91) 99999-99999"])
    assert.equal(indianPhone(input), "+919999999999");
  for (const input of [
    "1234567890",
    "+1 202 555 0123",
    "99999",
    "abc9999999999",
    "9999999999999",
  ])
    assert.equal(indianPhone(input), null);
  assert.equal(normalizeMobileInput("91"), "91", "partial entry remains editable");
  assert.equal(secondsRemaining(2000, 1500), 1);
  assert.equal(secondsRemaining(2000, 2001), 0);
});

test("static images resolve to published CDN keys and reject external sources", () => {
  const manifest = JSON.parse(
    readFileSync(new URL("../src/generated/cdn-assets.json", import.meta.url), "utf8"),
  );
  const { cdnImageUrl } = load("src/lib/cdn.ts", {
    "@/generated/cdn-assets.json": { default: manifest },
  });
  const logo = cdnImageUrl("/Albumo Text Logo.png");
  assert.equal(new URL(logo).origin, "https://cdn.albumo.in");
  assert.match(logo, /\/static\/[a-f0-9]{20}\/Albumo%20Text%20Logo\.png$/);
  assert.equal(cdnImageUrl(logo), logo);
  for (const source of [
    "/not-published.png",
    "https://external.invalid/photo.jpg",
    "https://cdn.albumo.in.evil.invalid/image.png",
    logo + "?variant=one",
    "data:image/png;base64,abc",
  ])
    assert.throws(() => cdnImageUrl(source));
});

test("account methods use owner-scoped routes, full addresses, encoded IDs and abort signals", async () => {
  const calls = [];
  const client = {
    get: async (path, options) => {
      calls.push({ path, options, method: "GET" });
      return {};
    },
    post: async (path, body, options) => {
      calls.push({ path, body, options, method: "POST" });
      return {};
    },
    request: async (path, options) => {
      calls.push({ path, options, method: options.method });
      return { success: true, data: options.body };
    },
  };
  const { accountApi } = load("src/features/account/account.service.ts", {
    "@/lib/api-client": { api: client },
  });
  const signal = new AbortController().signal;
  const input = {
    name: "Test visitor",
    phone: "+919999999999",
    line1: "Test street",
    line2: "",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    country: "India",
    isDefault: true,
  };
  await accountApi.getAddresses(signal);
  await accountApi.createAddress(input, signal);
  const saved = await accountApi.updateAddress("address/id", input, signal);
  await accountApi.setDefaultAddress("address/id", signal);
  assert.equal(await accountApi.deleteAddress("address/id", signal), undefined);
  await accountApi.listOrders(signal);
  await accountApi.getOrder("order/id", signal);
  await accountApi.listAlbums("cursor/id", signal);
  assert.equal(saved, input);
  assert.deepEqual(
    calls.map((call) => call.path),
    [
      "/api/addresses",
      "/api/addresses",
      "/api/addresses/address%2Fid",
      "/api/addresses/address%2Fid/default",
      "/api/addresses/address%2Fid",
      "/api/orders/my",
      "/api/orders/order%2Fid",
      "/api/studio/projects?archived=false&limit=12&after=cursor%2Fid",
    ],
  );
  assert(calls.every((call) => call.options.signal === signal));
  assert.equal(
    calls[2].options.body.isDefault,
    true,
    "editing preserves the default flag",
  );
  assert.equal(calls[4].method, "DELETE");
  assert(
    !calls.some((call) => call.path.startsWith("/api/projects")),
    "albums never use the inherited electronics projects API",
  );
});

const catalogueTypes = load("src/lib/catalogue-types.ts");
const catalogue = load("src/lib/catalogue-model.ts", {
  "./catalogue-types": catalogueTypes,
});
test("catalogue prices include required minimums, sale prices and per-item selections", () => {
  const configuration = {
    ...catalogueTypes.emptyConfiguration,
    groups: [
      {
        id: "size",
        label: "Size",
        kind: "dimension",
        required: true,
        defaultOptionId: "",
        options: [
          {
            id: "small",
            label: "8 x 8",
            width: 8,
            height: 8,
            unit: "in",
            description: "",
            priceAdjustmentCents: 10000,
          },
          {
            id: "large",
            label: "12 x 12",
            width: 12,
            height: 12,
            unit: "in",
            description: "",
            priceAdjustmentCents: 30000,
          },
        ],
      },
      {
        id: "cover",
        label: "Cover",
        kind: "cover",
        required: false,
        defaultOptionId: "",
        options: [
          { id: "linen", label: "Linen", description: "", priceAdjustmentCents: 20000 },
        ],
      },
    ],
  };
  const product = catalogue.mapProduct({
    id: "album",
    slug: "travel-album",
    name: "Travel Album",
    categoryId: "travel",
    categoryName: "Travel Books",
    superCategoryId: "albums",
    superCategoryName: "Photo Albums",
    description: "Your story",
    imageUrl: null,
    media: [],
    unitPriceCents: 100000,
    discountedPriceCents: 80000,
    configuration,
    specifications: [],
    countryOfOrigin: null,
    warranty: null,
    typicalUseCase: null,
    isBestSeller: false,
  });
  assert.equal(product.price, 900);
  assert.equal(catalogue.initialSelections(product).size, "");
  assert.equal(
    catalogue.selectedPrice(product, { size: "large", cover: "linen" }),
    130000,
  );
  const link = new URL(
    catalogue.buildCatalogueEnquiry(product, { size: "large", cover: "linen" }, 2, ""),
    "https://albumo.in",
  );
  assert.match(link.searchParams.get("message"), /2600.00/);
  assert.match(link.searchParams.get("message"), /Size: 12 x 12/);
  assert.match(link.searchParams.get("message"), /Cover: Linen/);
});
