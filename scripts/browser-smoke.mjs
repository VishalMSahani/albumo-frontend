// Local-only browser checks. The real backend and its .env are never loaded.
import assert from "node:assert/strict";
import { catalogueFixture } from "./catalogue-fixture.mjs";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const root = process.cwd();
const originalNextEnv = readFileSync(path.join(root, "next-env.d.ts"), "utf8");
const apiPort = 4105,
  webPort = 3108;
const origin = "http://localhost:" + webPort;
const accountOnly = process.argv.includes("--account-only");
const footerOnly = process.argv.includes("--footer-only");
assert(!(accountOnly && footerOnly), "Choose either --account-only or --footer-only");
const footerSocialCase =
  process.argv.find((value) => value.startsWith("--footer-social="))?.split("=")[1] ||
  "default";
assert(
  ["default", "valid", "invalid", "invalid-paths"].includes(footerSocialCase),
  "Unknown footer social scenario",
);
assert(
  footerSocialCase === "default" || footerOnly,
  "Social scenarios require --footer-only",
);
// The latest saved contract pins Instagram/YouTube; only Facebook remains configurable.
// All profile URLs are inspected as hrefs, never opened.
const fixedSocials = {
  instagram: "https://www.instagram.com/albumo.in/",
  youtube: "https://www.youtube.com/channel/UCqcZS0pMcszuWQRsxfwCd2A",
};
const socialFixtures = {
  valid: { facebook: "https://www.facebook.com/browser-fixture" },
  invalid: { facebook: "https://www.facebook.com.example.invalid/browser-fixture" },
  "invalid-paths": { facebook: "http://www.facebook.com/browser-fixture" },
};
const configuredSocials = socialFixtures[footerSocialCase] || {};
const footerScreenshots = [
  "footer-1440.png",
  "footer-390.png",
  "home-closing-1440.png",
  "home-closing-390.png",
];
const cdnManifest = JSON.parse(
  readFileSync(path.join(root, "src/generated/cdn-assets.json"), "utf8"),
);
const publishedImage = (source) =>
  new URL("https://cdn.albumo.in/" + cdnManifest.files[source].key).href;
const footerCategory = {
  id: "fixture gifts & albums/one",
  name: "Fixture gifts & albums",
  description: "",
  imageUrl: null,
  subcategories: [],
};
let footerFixtureMode = false;
let contactMode = "ready";
let newsletterEnabled = true;
let newsletterMode = "ready";
let newsletterSaveGate = null;
let footerContactOverrides = {};
const events = [];
const skippedChecks = accountOnly
  ? []
  : [
      "Instagram environment override cases: unsupported by the latest pinned-link contract",
      "YouTube environment override cases: unsupported by the latest pinned-link contract",
    ];
const tickets = new Map();
const user = {
  id: "fixture-user",
  name: "Asha",
  email: "asha@example.invalid",
  role: "STUDENT",
  emailVerified: true,
  phone: "+919999999999",
  phoneVerified: true,
  hasPassword: true,
  createdAt: "2025-01-15T09:00:00.000Z",
};
const addresses = new Map([
  [
    "address-home",
    {
      id: "address-home",
      userId: user.id,
      name: "Asha",
      phone: "+919999999999",
      line1: "12 Test Lane",
      line2: "",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      country: "India",
      isDefault: true,
    },
  ],
  [
    "address-work",
    {
      id: "address-work",
      userId: user.id,
      name: "Asha Work",
      phone: "+919999999999",
      line1: "34 Fixture Road",
      line2: "Second floor",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411001",
      country: "India",
      isDefault: false,
    },
  ],
]);
const accountOrders = [
  {
    id: "fixture-order-delivered",
    status: "DELIVERED",
    orderType: "COMPONENTS_ONLY",
    totalAmountCents: 249900,
    createdAt: "2026-01-12T09:00:00.000Z",
    updatedAt: "2026-01-18T09:00:00.000Z",
    deliveredAt: "2026-01-18T09:00:00.000Z",
    trackingAwb: "TEST-AWB-001",
    trackingUrl: "https://tracking.example.invalid/TEST-AWB-001",
    address: addresses.get("address-home"),
    items: [
      {
        id: "fixture-item-1",
        description: "Fixture keepsake product",
        quantity: 1,
        unitPriceCents: 249900,
        subtotalCents: 249900,
        component: null,
      },
    ],
    payments: [],
  },
  {
    id: "fixture-order-shipped",
    status: "SHIPPED",
    orderType: "COMPONENTS_ONLY",
    totalAmountCents: 129900,
    createdAt: "2026-01-10T09:00:00.000Z",
    updatedAt: "2026-01-12T09:00:00.000Z",
    address: addresses.get("address-home"),
    items: [
      {
        id: "fixture-item-2",
        description: "Another fixture product",
        quantity: 2,
        unitPriceCents: 64950,
        subtotalCents: 129900,
        component: null,
      },
    ],
    payments: [],
  },
];
const albumProjects = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Our coastal weekend",
    occasion: "TRAVEL",
    revision: 2,
    archivedAt: null,
    createdAt: "2026-01-12T09:00:00.000Z",
    updatedAt: "2026-01-18T09:00:00.000Z",
    productId: "fixture-product",
    pageCount: 24,
    minimumPhotos: 24,
    recommendedPhotos: 30,
    configuration: {
      schemaVersion: 1,
      productId: "fixture-product",
      productName: "Fixture photo book",
      format: "Portrait",
      options: [],
      quantity: 1,
      pageCount: 24,
      minimumPhotos: 24,
      recommendedPhotos: 30,
      personalText: "",
    },
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    title: "The everyday things",
    occasion: "EVERYDAY",
    revision: 0,
    archivedAt: null,
    createdAt: "2026-01-10T09:00:00.000Z",
    updatedAt: "2026-01-10T09:00:00.000Z",
    productId: null,
    pageCount: null,
    minimumPhotos: null,
    recommendedPhotos: null,
    configuration: null,
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    title: "Family celebrations",
    occasion: "FAMILY",
    revision: 1,
    archivedAt: null,
    createdAt: "2025-12-10T09:00:00.000Z",
    updatedAt: "2025-12-10T09:00:00.000Z",
    productId: null,
    pageCount: null,
    minimumPhotos: null,
    recommendedPhotos: null,
    configuration: null,
  },
];
let accountMode = "ready";
let failAddressDelete = false;
let nameSaveDelay = 0;
let passwordSaveDelay = 0;
let authRestoreGate = null;
const publicUser = () =>
  Object.fromEntries(
    Object.entries(user).filter(([key]) => !["hasPassword", "createdAt"].includes(key)),
  );
const article = {
  id: "article-1",
  slug: "choosing-photos",
  title: "Choosing photos for your album",
  excerpt: "A few simple ways to choose photographs worth keeping.",
  category: "PRODUCT",
  content:
    "Use your original photographs.\n\nA mix of wide views and little details tells a lovely story.",
  isFeatured: true,
  viewCount: 0,
  updatedAt: new Date().toISOString(),
};
let catalogueMode = "ready";
let otpAvailable = true;
let shortChallenge = false;
let challengeCounter = 0;
const challenges = new Map();
const fixture = createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "content-type,x-csrf-token");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  if (req.method === "OPTIONS") {
    res.writeHead(204).end();
    return;
  }
  let raw = "";
  for await (const chunk of req) raw += chunk;
  const body = raw ? JSON.parse(raw) : {};
  const url = new URL(req.url, "http://localhost");
  const signedIn = req.headers.cookie?.includes("fixture_session=yes");
  const send = (data, status = 200) => {
    res
      .writeHead(status, { "content-type": "application/json" })
      .end(JSON.stringify(data));
  };
  const ok = (data) => send({ success: true, data });
  events.push({ path: url.pathname, method: req.method, body });
  if (req.method !== "GET" && req.headers["x-csrf-token"] !== "fixture-csrf")
    return send(
      { success: false, code: "CSRF_MISSING", error: "Missing secure session" },
      403,
    );
  if (url.pathname === "/api/studio/projects/public-settings")
    return ok({ print: { targetDpi: 300, minimumDpi: 150, bleedMm: 3, safeMm: 5 }, retention: { enabled: true, days: 90 } });
  if (url.pathname === "/api/components/catalogue/categories")
    return ok(
      footerFixtureMode
        ? [...catalogueFixture.categories, footerCategory]
        : catalogueFixture.categories,
    );
  if (url.pathname === "/api/components/catalogue") {
    if (catalogueMode === "unavailable") return send({ error: "Unavailable" }, 503);
    return ok(
      catalogueMode === "empty"
        ? { ...catalogueFixture, products: [] }
        : catalogueFixture,
    );
  }
  if (url.pathname === "/api/auth/csrf-token") return ok({ csrfToken: "fixture-csrf" });
  if (url.pathname === "/api/contact/settings") {
    if (contactMode === "unavailable")
      return send({ error: "Contact settings unavailable. Try again." }, 503);
    return ok({
      email: "hello@example.invalid",
      phone: footerFixtureMode ? "+91 98765 43210" : "",
      whatsapp: footerFixtureMode ? "919876543210" : "",
      hours: "Monday to Friday",
      newsletterEnabled,
      ...(footerFixtureMode ? footerContactOverrides : {}),
    });
  }
  if (url.pathname === "/api/auth/config")
    return ok({ google: false, github: false, whatsappOtp: otpAvailable });
  if (url.pathname === "/api/auth/me") {
    if (req.method === "GET" && authRestoreGate) await authRestoreGate;
    if (!signedIn) return send({ error: "Please sign in" }, 401);
    if (req.method === "PATCH") {
      Object.assign(user, body);
      const updated = publicUser();
      if (nameSaveDelay) await delay(nameSaveDelay);
      return ok(updated);
    }
    return ok(user);
  }
  if (url.pathname === "/api/auth/password") {
    if (!signedIn) return send({ error: "Please sign in" }, 401);
    assert.equal(body.currentPassword, user.hasPassword ? "example-password" : undefined);
    assert.equal(body.newPassword, "new-example-password");
    user.hasPassword = true;
    if (passwordSaveDelay) await delay(passwordSaveDelay);
    return send({ success: true, message: "Password saved" });
  }
  if (url.pathname === "/api/addresses" || url.pathname.startsWith("/api/addresses/")) {
    if (!signedIn) return send({ error: "Please sign in" }, 401);
    if (accountMode === "unavailable")
      return send({ error: "Address service unavailable. Try again." }, 503);
    if (req.method === "GET")
      return ok(accountMode === "empty" ? [] : [...addresses.values()]);
    const id = url.pathname.split("/")[3];
    if (url.pathname.endsWith("/default")) {
      for (const address of addresses.values()) address.isDefault = address.id === id;
      return ok(addresses.get(id));
    }
    if (req.method === "DELETE") {
      if (failAddressDelete)
        return send(
          { error: "This address is used by an order and cannot be removed." },
          409,
        );
      addresses.delete(id);
      return send({ success: true, message: "Address deleted" });
    }
    for (const key of ["name", "phone", "line1", "city", "state", "pincode"])
      assert(body[key]?.trim(), key + " is present");
    assert.match(body.pincode, /^\d{6}$/);
    const saved = {
      ...body,
      id: id || "address-new-" + addresses.size,
      userId: user.id,
      isDefault: !!body.isDefault,
    };
    if (saved.isDefault)
      for (const address of addresses.values()) address.isDefault = false;
    addresses.set(saved.id, saved);
    return ok(saved);
  }
  if (url.pathname === "/api/orders/my") {
    if (!signedIn) return send({ error: "Please sign in" }, 401);
    if (accountMode === "unavailable")
      return send({ error: "Order service unavailable. Try again." }, 503);
    return ok(accountMode === "empty" ? [] : accountOrders);
  }
  if (url.pathname.startsWith("/api/orders/")) {
    if (!signedIn) return send({ error: "Please sign in" }, 401);
    return ok(accountOrders.find((order) => order.id === url.pathname.split("/")[3]));
  }
  if (url.pathname === "/api/studio/projects") {
    if (!signedIn) return send({ error: "Please sign in" }, 401);
    if (accountMode === "unavailable")
      return send({ error: "Album service unavailable. Try again." }, 503);
    if (accountMode === "empty") return ok({ items: [], nextCursor: null });
    return ok(
      url.searchParams.get("after")
        ? { items: albumProjects.slice(2), nextCursor: null }
        : { items: albumProjects.slice(0, 2), nextCursor: albumProjects[1].id },
    );
  }
  if (url.pathname === "/api/auth/refresh")
    return signedIn ? ok({ user }) : send({ error: "Please sign in" }, 401);
  if (url.pathname === "/api/auth/login") {
    if (body.password !== "example-password")
      return send({ error: "Incorrect sign-in details." }, 401);
    res.setHeader("Set-Cookie", "fixture_session=yes; Path=/; HttpOnly; SameSite=Lax");
    return ok({ user: publicUser(), expiresIn: 900 });
  }
  if (url.pathname === "/api/auth/logout") {
    res.setHeader("Set-Cookie", "fixture_session=; Path=/; Max-Age=0");
    return ok({});
  }
  if (
    url.pathname === "/api/auth/phone/start" ||
    url.pathname === "/api/auth/otp/request"
  ) {
    if (body.phone === "+919999999997")
      return send(
        {
          error: "We could not send the WhatsApp code. Please try again.",
          code: "OTP_DELIVERY_FAILED",
        },
        503,
      );
    assert.equal(body.legalConsent.accepted, true);
    assert.match(body.phone, /^\+91[6-9][0-9]{9}$/);
    const challengeId = "fixture-challenge-" + ++challengeCounter;
    challenges.set(challengeId, body.phone);
    return ok({
      kind: "otp",
      challengeId,
      maskedPhone: "+91 ••••••" + body.phone.slice(-4),
      expiresIn: shortChallenge ? 1 : 300,
      resendAfter: 2,
    });
  }
  if (url.pathname === "/api/auth/otp/verify") {
    if (!challenges.has(body.challengeId) || body.code !== "123456")
      return send(
        {
          error: "That code is incorrect or expired. Request a new code if needed.",
          code: "OTP_INVALID",
        },
        400,
      );
    const number = challenges.get(body.challengeId);
    challenges.delete(body.challengeId);
    if (number === "+919999999998")
      return ok({ kind: "signup", registrationToken: "fixture-one-use-proof" });
    res.setHeader("Set-Cookie", "fixture_session=yes; Path=/; HttpOnly; SameSite=Lax");
    return ok({
      user: { ...publicUser(), phone: number, phoneVerified: true },
      expiresIn: 900,
    });
  }
  if (url.pathname === "/api/auth/otp/complete-signup") {
    assert.equal(body.registrationToken, "fixture-one-use-proof");
    assert.equal(body.name, "Asha New");
    assert.equal(body.email, "new@example.invalid");
    assert.equal(body.password, "example-password");
    res.setHeader("Set-Cookie", "fixture_session=yes; Path=/; HttpOnly; SameSite=Lax");
    return ok({ user: publicUser(), expiresIn: 900 });
  }
  if (
    url.pathname === "/api/legal/consents/cookies" ||
    url.pathname === "/api/legal/consents/claim"
  )
    return ok({ id: "consent-fixture" });
  if (url.pathname === "/api/support/knowledge-base")
    return ok(
      [article].filter(
        (item) =>
          !url.searchParams.get("search") ||
          item.title.toLowerCase().includes(url.searchParams.get("search").toLowerCase()),
      ),
    );
  if (url.pathname === "/api/support/knowledge-base/choosing-photos") return ok(article);
  if (url.pathname === "/api/support/tickets/my")
    return signedIn ? ok([...tickets.values()]) : send({ error: "Please sign in" }, 401);
  if (
    url.pathname === "/api/contact/enquiries" ||
    (url.pathname === "/api/support/tickets" && req.method === "POST")
  ) {
    if (body.subject === "Connection failure test")
      return send({ error: "Please try your enquiry again." }, 503);
    const number = "AL-TEST-" + (tickets.size + 1);
    const date = new Date().toISOString();
    const ticket = {
      id: number,
      ticketNumber: number,
      subject: body.subject,
      description: body.description || body.message,
      requesterName: body.name,
      requesterEmail: body.email,
      status: "OPEN",
      createdAt: date,
      lastActivityAt: date,
      messages: [
        {
          id: number + "-1",
          sender: "CUSTOMER",
          authorName: body.name,
          body: body.description || body.message,
          createdAt: date,
        },
      ],
    };
    tickets.set(number, ticket);
    return ok(
      url.pathname.includes("enquiries")
        ? { ticketNumber: number, email: body.email }
        : ticket,
    );
  }
  const ticketRoute = url.pathname.match(
    /^\/api\/support\/tickets\/([^/]+)\/(track|messages)$/,
  );
  if (ticketRoute) {
    const ticket = tickets.get(decodeURIComponent(ticketRoute[1]));
    if (!ticket || (!signedIn && body.email !== ticket.requesterEmail))
      return send({ error: "Ticket not found for this email." }, 404);
    if (ticketRoute[2] === "messages")
      ticket.messages.push({
        id: "reply-" + ticket.messages.length,
        sender: "CUSTOMER",
        body: body.message,
        createdAt: new Date().toISOString(),
      });
    return ok(ticket);
  }
  if (url.pathname.startsWith("/api/contact/newsletter/")) {
    if (url.pathname.endsWith("/subscribe") && footerFixtureMode) {
      assert.equal(req.method, "POST");
      assert.equal(body.source, "FOOTER");
      assert.equal(body.consent, true);
      assert.equal(body.website, "");
      assert.match(body.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      if (!newsletterEnabled)
        return send({ error: "Newsletter sign-ups are paused." }, 503);
      if (newsletterMode === "unavailable")
        return send({ error: "Newsletter service unavailable. Try again." }, 503);
      if (newsletterSaveGate) await newsletterSaveGate;
    }
    return send({ success: true, message: "Your newsletter preference has been saved." });
  }
  return send({ error: "Unknown fixture route" }, 404);
});
await new Promise((resolve) => fixture.listen(apiPort, "localhost", resolve));
const artifacts = path.join(root, ".artifacts", "albumo-qa");
await mkdir(artifacts, { recursive: true });
const next = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "dev", "--port", String(webPort)],
  {
    cwd: root,
    windowsHide: true,
    env: {
      ...process.env,
      ALBUMO_TEST_MODE: "1",
      ALBUMO_API_URL: "http://localhost:" + apiPort,
      NEXT_PUBLIC_API_URL: "http://localhost:" + apiPort,
      NEXT_PUBLIC_FACEBOOK_URL: configuredSocials.facebook || "",
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let nextLog = "";
next.stdout.on("data", (chunk) => {
  nextLog += chunk;
});
next.stderr.on("data", (chunk) => {
  nextLog += chunk;
});
let chrome, socket;
try {
  let serving = false;
  for (let count = 0; count < 90; count++) {
    try {
      const res = await fetch(origin + "/contact");
      if (res.ok) {
        serving = true;
        break;
      }
    } catch {}
    if (next.exitCode !== null) throw new Error("Preview failed: " + nextLog);
    await delay(500);
  }
  assert(serving, "Preview did not become ready");
  const executable = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  ].find((value) => value && existsSync(value));
  assert(executable, "Install Chrome/Edge or set CHROME_PATH");
  chrome = spawn(
    executable,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--remote-debugging-port=0",
      "--user-data-dir=" + path.join(artifacts, "browser-profile-" + process.pid),
      "about:blank",
    ],
    { windowsHide: true, stdio: ["ignore", "ignore", "pipe"] },
  );
  const wsUrl = await new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Browser startup timed out")),
      20_000,
    );
    chrome.stderr.on("data", (chunk) => {
      const match = chunk.toString().match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]);
      }
    });
  });
  const debugOrigin = new URL(wsUrl);
  debugOrigin.protocol = "http:";
  const target = await (
    await fetch(debugOrigin.origin + "/json/new?about:blank", { method: "PUT" })
  ).json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  let nextId = 0;
  const pending = new Map();
  const pageErrors = [];
  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    if (data.method === 'Fetch.requestPaused') {
      void command('Fetch.fulfillRequest', { requestId: data.params.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'text/html' }], body: Buffer.from('<main>Studio handoff verified</main>').toString('base64') });
      return;
    }
    if (data.method === "Runtime.exceptionThrown")
      pageErrors.push(
        data.params.exceptionDetails.text +
          " " +
          (data.params.exceptionDetails.exception?.description || ""),
      );
    if (data.id && pending.has(data.id)) {
      const entry = pending.get(data.id);
      clearTimeout(entry.timer);
      pending.delete(data.id);
      if (data.error) entry.reject(new Error(data.error.message));
      else entry.resolve(data.result);
    }
  });
  function command(method, params = {}) {
    const id = ++nextId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => {
          pending.delete(id);
          reject(
            new Error("CDP timeout: " + method + (params.url ? " " + params.url : "")),
          );
        },
        method === "Page.navigate" ? 60_000 : 25_000,
      );
      pending.set(id, { resolve, reject, timer });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }
  async function evaluate(expression) {
    const result = await command("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails)
      throw new Error(
        result.exceptionDetails.exception?.description || result.exceptionDetails.text,
      );
    return result.result?.value;
  }
  async function waitFor(expression, label = expression) {
    for (let i = 0; i < 120; i++) {
      if (await evaluate(expression)) return;
      await delay(250);
    }
    if (label === "Storefront CDN images") console.error(await evaluate("[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>({src:i.currentSrc||i.src,loading:i.loading,complete:i.complete}))"));
    throw new Error("Timed out: " + label);
  }
  const go = async (route) => {
    await command("Page.navigate", { url: origin + route });
    await waitFor(
      "location.pathname === " +
        JSON.stringify(route.split("?")[0].split("#")[0]) +
        " && !!document.querySelector('main h1')",
      route,
    );
    await waitFor(
      "!!document.querySelector('footer a[href=\"mailto:hello@example.invalid\"]')",
      "hydration",
    );
    await delay(200);
  };
  async function fill(name, value, scope = "main") {
    await evaluate(
      "(() => { const el = document.querySelector(" +
        JSON.stringify(scope + " [name=" + JSON.stringify(name) + "]") +
        "); if(!el) throw new Error('Missing field'); const prototype = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(prototype, 'value').set.call(el, " +
        JSON.stringify(value) +
        "); el.dispatchEvent(new Event('input', {bubbles:true})); el.dispatchEvent(new Event('change', {bubbles:true})); })()",
    );
  }
  async function submit(selector = "main form") {
    await evaluate(
      "(() => { const form = document.querySelector(" +
        JSON.stringify(selector) +
        "); if(!form.reportValidity()) throw new Error('Invalid fixture form'); form.requestSubmit(); })()",
    );
  }
  const clickText = (text) =>
    evaluate(
      "(() => { const button = [...document.querySelectorAll('button, main a')].find(el => el.textContent.trim() === " +
        JSON.stringify(text) +
        "); if(!button) throw new Error('Missing action'); button.focus(); button.click(); })()",
    );
  async function clickLink(selector, visibleOnly = false) {
    const lookup = visibleOnly
      ? "[...document.querySelectorAll(" +
        JSON.stringify(selector) +
        ")].find(el => el.getClientRects().length > 0)"
      : "document.querySelector(" + JSON.stringify(selector) + ")";
    const point = await evaluate(
      "(async () => { const link = " +
        lookup +
        "; if (!(link instanceof HTMLAnchorElement)) throw new Error('Missing navigation link'); link.scrollIntoView({block: 'center', behavior: 'instant'}); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); const rect = link.getBoundingClientRect(); if (!rect.width || !rect.height) throw new Error('Navigation link is hidden'); const x = rect.left + rect.width / 2; const y = rect.top + rect.height / 2; if (!link.contains(document.elementFromPoint(x, y))) throw new Error('Navigation link is covered'); return {x, y}; })()",
    );
    await command("Input.dispatchMouseEvent", { type: "mouseMoved", ...point });
    await command("Input.dispatchMouseEvent", {
      type: "mousePressed",
      button: "left",
      clickCount: 1,
      ...point,
    });
    await command("Input.dispatchMouseEvent", {
      type: "mouseReleased",
      button: "left",
      clickCount: 1,
      ...point,
    });
  }
  const navbarWidths = [320, 360, 390, 768, 1023, 1024, 1100, 1280, 1440];
  async function assertNavbar(expectedName, { truncated = false } = {}) {
    const signedIn = expectedName !== undefined;
    const name = expectedName?.trim() || "";
    const selector = signedIn
      ? 'header a[href="/account"]'
      : 'header a[href="/login?redirect=/account"]';
    await waitFor(
      "!!document.querySelector(" + JSON.stringify(selector) + ")",
      signedIn ? "Authenticated navbar Profile" : "Guest navbar Sign in",
    );
    if (signedIn)
      await waitFor(
        "document.querySelector(" +
          JSON.stringify(selector) +
          ")?.getAttribute('aria-label') === " +
          JSON.stringify(name ? "Profile: " + name : "Profile"),
        "Navbar name update: " + (name || "nameless profile"),
      );
    await evaluate("document.fonts.ready");
    const state = await evaluate(`(() => {
      const header = document.querySelector('header');
      const visible = el => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
      const profile = header.querySelector('a[href="/account"]');
      const guest = header.querySelector('a[href="/login?redirect=/account"]');
      const link = ${signedIn ? "profile" : "guest"};
      const name = ${JSON.stringify(name)};
      const nameElement = profile && [...profile.querySelectorAll('span')].find(el => el.childElementCount === 0 && el.textContent.trim() === name);
      const nameStyle = nameElement && getComputedStyle(nameElement);
      const style = getComputedStyle(link);
      return {
        profileVisible: visible(profile), guestVisible: visible(guest),
        profileCount: header.querySelectorAll('a[href="/account"]').length,
        guestCount: header.querySelectorAll('a[href="/login?redirect=/account"]').length,
        text: link.textContent.trim(), ariaLabel: link.getAttribute('aria-label'), title: link.getAttribute('title'),
        labels: profile ? [...profile.querySelectorAll('span')].filter(el => el.childElementCount === 0).map(el => el.textContent.trim()) : [],
        truncated: !!nameElement && nameElement.scrollWidth > nameElement.clientWidth && nameStyle.textOverflow === 'ellipsis' && ['hidden', 'clip'].includes(nameStyle.overflowX) && nameStyle.whiteSpace === 'nowrap',
        loading: !!header.querySelector('[data-account-loading]'),
        darkPill: link.classList.contains('bg-ink') && !['transparent', 'rgba(0, 0, 0, 0)', 'rgb(255, 255, 255)'].includes(style.backgroundColor) && parseFloat(style.borderTopLeftRadius) >= link.getBoundingClientRect().height / 2 - 1,
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1 || header.scrollWidth > header.clientWidth + 1,
        outside: [...header.querySelectorAll('a, button')].filter(visible).some(el => { const rect = el.getBoundingClientRect(); return rect.left < -1 || rect.right > window.innerWidth + 1; }),
        width: window.innerWidth,
      };
    })()`);
    assert.equal(state.profileVisible, signedIn, "Navbar Profile visibility");
    assert.equal(state.guestVisible, !signedIn, "Navbar Sign in visibility");
    assert.equal(
      state.profileCount,
      signedIn ? 1 : 0,
      "Only authenticated users have a Profile link",
    );
    assert.equal(state.guestCount, signedIn ? 0 : 1, "Only guests have a Sign in link");
    assert(!state.loading, "Loaded navbar replaces its placeholder");
    if (signedIn) {
      assert.deepEqual(
        state.labels,
        name ? ["Profile", name] : ["Profile"],
        "Literal Profile and trimmed user name",
      );
      assert.equal(state.ariaLabel, name ? "Profile: " + name : "Profile");
      assert.equal(
        state.title,
        name || null,
        "Full profile name remains available as a title",
      );
      assert(
        !state.text.includes("Sign in") && !state.text.includes("Account"),
        "Authenticated users keep Profile, never guest Sign in or Account",
      );
      if (truncated)
        assert(
          state.truncated,
          "Long navbar name is visually clipped with ellipsis at " + state.width,
        );
    } else {
      assert.equal(state.text, "Sign in");
      assert(state.darkPill, "Guest Sign in is a filled dark pill");
    }
    assert(
      !state.overflow && !state.outside,
      "Navbar and body fit viewport at " + state.width,
    );
  }
  async function assertNavbarLoading(expectedName) {
    let release;
    authRestoreGate = new Promise((resolve) => {
      release = resolve;
    });
    try {
      await go("/account");
      await waitFor(
        "document.querySelector('main [role=status]')?.textContent.includes('Checking your account')",
        "Fixture session restore is held",
      );
      const loading = await evaluate(`(() => {
        const placeholder = document.querySelector('header [data-account-loading]');
        return {
          visible: !!placeholder && placeholder.getClientRects().length > 0,
          noninteractive: !!placeholder && placeholder.tagName === 'SPAN' && placeholder.getAttribute('aria-hidden') === 'true' && placeholder.tabIndex < 0 && !placeholder.closest('a, button') && !placeholder.querySelector('a, button, input, [tabindex]'),
          accountLinks: document.querySelectorAll('header a[href="/account"], header a[href="/login?redirect=/account"]').length,
        };
      })()`);
      assert(
        loading.visible && loading.noninteractive,
        "Auth loading uses a noninteractive account placeholder",
      );
      assert.equal(
        loading.accountLinks,
        0,
        "Auth loading never shows guest Sign in prematurely",
      );
    } finally {
      authRestoreGate = null;
      release();
    }
    await assertNavbar(expectedName);
  }
  const accountSections = [
    ["profile", "Profile"],
    ["orders", "Orders"],
    ["albums", "Albums & projects"],
    ["addresses", "Address book"],
  ];
  const accountNavigation =
    'aside[aria-label="Account navigation"] nav[aria-label="Your account"]';
  const accountBackLink = '#account-panel a[href="/account"]';
  async function assertAccountLayout(width, tab = null) {
    const label = accountSections.find(([id]) => id === (tab || "profile"))[1];
    await waitFor(
      "!!document.querySelector('aside[aria-label=\"Account navigation\"]') && document.querySelector('#account-panel')?.getAttribute('aria-label') === " +
        JSON.stringify(label),
      "Account workspace: " + width + " / " + (tab || "menu"),
    );
    const layout = await evaluate(`(() => {
      const aside = document.querySelector('aside[aria-label="Account navigation"]');
      const nav = aside.querySelector('nav[aria-label="Your account"]');
      const panel = document.querySelector('#account-panel');
      const heading = document.querySelector('main h1');
      const visible = el => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
      const rect = el => { const box = el.getBoundingClientRect(); return {left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height}; };
      return {
        heading: heading.textContent.trim(),
        subtitle: heading.parentElement.querySelector(':scope > p')?.textContent.trim() || null,
        text: document.querySelector('main').textContent.replace(/\\s+/g, ' ').trim(),
        sidebarVisible: visible(aside),
        panelVisible: visible(panel),
        panelLabel: panel.getAttribute('aria-label'),
        sidebar: rect(aside),
        workspace: rect(aside.parentElement),
        nav: rect(nav),
        navScrollWidth: nav.scrollWidth,
        navClientWidth: nav.clientWidth,
        links: [...nav.querySelectorAll('a')].map(link => ({
          label: link.textContent.trim(),
          href: link.getAttribute('href'),
          current: link.getAttribute('aria-current'),
          visible: visible(link),
          ...rect(link),
        })),
        backLinks: [...document.querySelectorAll('main a')].filter(link => link.textContent.trim() === 'Back to account' && visible(link)).map(link => link.getAttribute('href')),
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      };
    })()`);
    const desktop = width >= 1024;
    const context = width + " / " + (tab || "menu");
    assert.equal(layout.heading, "Your account", "Account heading at " + context);
    assert.equal(layout.subtitle, null, "No account heading subtitle at " + context);
    for (const copy of [
      "Overview",
      "Your little corner",
      "Your albums, orders and everyday details. All together.",
      "A place for your memories",
      "Good to see you",
      "Pick up a story you’ve started",
      "Start something lovely",
      "Every good story starts with a little inspiration.",
      "Your active Studio drafts, ready when you are.",
      "Order updates and the details that matter.",
      "Your details stay with your account",
      "Room for a new story",
      "Something worth keeping",
    ])
      assert(
        !layout.text.includes(copy),
        "Removed account copy: " + copy + " / " + context,
      );
    assert.deepEqual(
      layout.links.map(({ label, href }) => ({ label, href })),
      accountSections.map(([id, label]) => ({ label, href: "/account?tab=" + id })),
      "Exactly four ordered account navigation links at " + context,
    );
    assert.equal(layout.panelLabel, label, "Active panel label at " + context);
    assert.equal(layout.panelVisible, desktop || !!tab, "Panel visibility at " + context);
    assert.equal(
      layout.sidebarVisible,
      desktop || !tab,
      "Sidebar visibility at " + context,
    );
    assert.deepEqual(
      layout.backLinks,
      !desktop && tab ? ["/account"] : [],
      "Mobile-only Back to account link at " + context,
    );
    if (desktop || tab)
      assert.deepEqual(
        layout.links
          .filter(({ current }) => current === "page")
          .map(({ label }) => label),
        [label],
        "Active account navigation at " + context,
      );
    assert(!layout.overflow, "Account has no horizontal overflow at " + context);
    await assertNavbar(user.name);
    if (!desktop && !tab) {
      assert(
        Math.abs(layout.sidebar.width - layout.workspace.width) <= 1,
        "Mobile account menu fills the workspace at " + width,
      );
      assert(
        layout.navScrollWidth <= layout.navClientWidth + 1,
        "Mobile account navigation does not scroll horizontally at " + width,
      );
      for (const [index, link] of layout.links.entries()) {
        assert(link.visible, "Mobile account navigation link is visible: " + link.label);
        assert(
          Math.abs(link.left - layout.nav.left) <= 1 &&
            Math.abs(link.right - layout.nav.right) <= 1,
          "Mobile account navigation link fills its row: " + link.label + " / " + width,
        );
        assert(link.height >= 44, "Mobile navigation has a usable target: " + link.label);
        if (index)
          assert(
            link.top >= layout.links[index - 1].bottom - 1,
            "Mobile navigation is vertically ordered at " + width,
          );
      }
    }
  }
  async function captureAccount(name) {
    await evaluate("window.scrollTo({ top: 0, left: 0, behavior: 'instant' })");
    await evaluate("document.fonts.ready");
    await evaluate(
      "new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))",
    );
    const shot = await command("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: false,
    });
    await writeFile(
      path.join(artifacts, name + ".png"),
      Buffer.from(shot.data, "base64"),
    );
  }
  const footerNewsletter = 'footer section[aria-labelledby="footer-newsletter-title"]';
  async function scrollClosing(selector) {
    await evaluate(
      "document.querySelector(" +
        JSON.stringify(selector) +
        ").scrollIntoView({block: 'start', behavior: 'instant'})",
    );
    await evaluate(
      "new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))",
    );
    await evaluate("document.fonts.ready");
    await waitFor(
      "[...document.querySelector(" +
        JSON.stringify(selector) +
        ").querySelectorAll('img')].every(image => image.complete && image.naturalWidth > 0)",
      "Published closing-section images: " + selector,
    );
    await waitFor(
      "[...document.querySelector(" +
        JSON.stringify(selector) +
        ").querySelectorAll('[data-reveal]')].every(el => parseFloat(getComputedStyle(el).opacity) >= 0.99)",
      "Closing section is revealed: " + selector,
    );
    await evaluate(
      "new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))",
    );
  }
  async function captureClosing(selector, name) {
    await scrollClosing(selector);
    const clip = await evaluate(
      "(() => { const box = document.querySelector(" +
        JSON.stringify(selector) +
        ").getBoundingClientRect(); return {x: box.left + scrollX, y: box.top + scrollY, width: box.width, height: box.height, scale: 1}; })()",
    );
    // Section-only captures exclude unrelated fixed chrome; layout and focus tests use the untouched UI.
    const overlays =
      await evaluate(`(() => ['header', 'body > a[href="#main-content"]', 'nextjs-portal'].flatMap(selector => [...document.querySelectorAll(selector)].map((el, index) => {
      const snapshot = {selector, index, opacity: el.style.getPropertyValue('opacity'), priority: el.style.getPropertyPriority('opacity')};
      el.style.setProperty('opacity', '0', 'important'); return snapshot;
    })))()`);
    try {
      await evaluate(
        "new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))",
      );
      const shot = await command("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: true,
        clip,
      });
      await writeFile(
        path.join(artifacts, name + ".png"),
        Buffer.from(shot.data, "base64"),
      );
    } finally {
      await evaluate(
        "(" +
          JSON.stringify(overlays) +
          ").forEach(snapshot => { const el = document.querySelectorAll(snapshot.selector)[snapshot.index]; if (el) { if (snapshot.opacity) el.style.setProperty('opacity', snapshot.opacity, snapshot.priority); else el.style.removeProperty('opacity'); } })",
      );
    }
  }
  async function pressKey(key, code, windowsVirtualKeyCode) {
    for (const type of ["keyDown", "keyUp"])
      await command("Input.dispatchKeyEvent", {
        type,
        key,
        code,
        windowsVirtualKeyCode,
        ...(type === "keyDown" && key === "Enter"
          ? { text: "\r", unmodifiedText: "\r" }
          : {}),
      });
  }
  async function assertFooterSocials(whatsapp = "919876543210") {
    const social = await evaluate(`(() => {
      const section = document.querySelector('footer section[aria-labelledby="footer-social-title"]');
      return {width: innerWidth, inBrand: !!section?.closest('[data-footer-card="brand"]'), slots: [...(section?.querySelectorAll('a, span[role="link"]') || [])].map(el => {
        const box = el.getBoundingClientRect();
        return {label: el.textContent.trim().split(' (')[0].trim(), tag: el.tagName, href: el.getAttribute('href'), target: el.getAttribute('target'), rel: el.getAttribute('rel'), role: el.getAttribute('role'), disabled: el.getAttribute('aria-disabled'), title: el.getAttribute('title'), tabIndex: el.tabIndex, interactiveChild: !!el.querySelector('a, button, input, [tabindex]'), visible: el.getClientRects().length > 0, left: box.left, right: box.right, top: box.top, height: box.height};
      })};
    })()`);
    assert(social.inBrand, "Social links stay in the left brand card");
    assert.deepEqual(
      social.slots.map((slot) => slot.label),
      ["Facebook", "Instagram", "YouTube", "WhatsApp"],
      "Four ordered compact social slots",
    );
    for (const [index, slot] of social.slots.entries()) {
      const platform = ["facebook", "instagram", "youtube", "whatsapp"][index];
      const expected =
        platform === "whatsapp"
          ? whatsapp && /^[1-9]\d{7,14}$/.test(whatsapp)
            ? "https://wa.me/" + whatsapp
            : undefined
          : fixedSocials[platform] ||
            (footerSocialCase === "valid" ? configuredSocials[platform] : undefined);
      assert(
        slot.visible &&
          slot.height >= 43.5 &&
          slot.left >= -1 &&
          slot.right <= social.width + 1,
        "Visible 44px social target: " + slot.label,
      );
      if (expected) {
        assert.equal(slot.tag, "A", "Configured social profile is a real anchor");
        assert.equal(
          slot.href,
          expected,
          "Explicitly configured social URL: " + slot.label,
        );
        const url = new URL(slot.href);
        assert(
          url.protocol === "https:" &&
            !url.username &&
            !url.password &&
            !url.port &&
            url.pathname !== "/",
          "Safe social URL: " + slot.label,
        );
        const hosts = {
          facebook: ["facebook.com", "www.facebook.com", "m.facebook.com"],
          instagram: ["instagram.com", "www.instagram.com"],
          youtube: ["youtube.com", "www.youtube.com"],
          whatsapp: ["wa.me"],
        };
        assert(
          hosts[platform].includes(url.hostname),
          "Exact platform host: " + slot.label,
        );
        assert(
          slot.target === "_blank" &&
            slot.rel?.split(" ").includes("noopener") &&
            slot.rel?.split(" ").includes("noreferrer"),
          "Safe external-link attributes: " + slot.label,
        );
      } else {
        assert(
          slot.tag === "SPAN" &&
            slot.role === "link" &&
            slot.disabled === "true" &&
            slot.tabIndex === -1 &&
            slot.href === null &&
            !slot.interactiveChild,
          "Unconfigured or invalid profile is noninteractive: " + slot.label,
        );
        assert.equal(
          slot.title,
          slot.label + " profile is not connected yet",
          "Honest disabled social explanation",
        );
      }
    }
    assert(
      social.slots[1].left >= social.slots[0].right - 1 &&
        Math.abs(social.slots[1].top - social.slots[0].top) <= 1 &&
        social.slots[2].top >= social.slots[0].top + social.slots[0].height - 1,
      "Compact two-column social grid",
    );
  }
  async function runFooterSocialSmoke() {
    const previous = footerFixtureMode;
    footerFixtureMode = true;
    try {
      for (const width of [320, 390, 1440]) {
        await command("Emulation.setDeviceMetricsOverride", {
          width,
          height: width >= 1024 ? 1000 : 844,
          deviceScaleFactor: 1,
          mobile: width < 1024,
        });
        await go("/contact");
        await scrollClosing("footer");
        await assertFooterSocials();
        assert(
          await evaluate(
            "location.origin === " +
              JSON.stringify(origin) +
              ' && !document.querySelector(\'footer [data-footer-card="navigation"] a[href^="https://wa.me/"]\') && document.documentElement.scrollWidth <= innerWidth + 1',
          ),
          "Social variants stay local, fit the page and do not duplicate WhatsApp",
        );
      }
      console.log(
        "PASS footer social environment scenario: " +
          footerSocialCase +
          " (no external navigation)",
      );
    } finally {
      footerFixtureMode = previous;
    }
  }
  async function assertFooterLayout(width, route) {
    await scrollClosing("footer");
    const layout = await evaluate(`(() => {
      const footer = document.querySelector('footer');
      const brand = footer.querySelector('[data-footer-card="brand"]');
      const navigation = footer.querySelector('[data-footer-card="navigation"]');
      const shop = footer.querySelector('nav[aria-label="Shop"]');
      const help = footer.querySelector('nav[aria-label="Here to help"]');
      const newsletter = footer.querySelector('section[aria-labelledby="footer-newsletter-title"]');
      const rect = el => { if (!el) return null; const box = el.getBoundingClientRect(); return {left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width}; };
      const visible = el => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
      const context = canvas.getContext('2d', {willReadFrequently: true});
      const rgba = color => { context.clearRect(0, 0, 1, 1); context.fillStyle = color; context.fillRect(0, 0, 1, 1); const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data; return [r, g, b, a / 255]; };
      const over = (fg, bg) => [0, 1, 2].map(i => fg[i] * fg[3] + bg[i] * (1 - fg[3])).concat(1);
      const background = el => { const layers = []; for (let parent = el; parent; parent = parent.parentElement) layers.unshift(rgba(getComputedStyle(parent).backgroundColor)); return layers.reduce((bg, fg) => over(fg, bg), [255, 255, 255, 1]); };
      const luminance = rgb => rgb.slice(0, 3).map(value => { const channel = value / 255; return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4; }).reduce((sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i], 0);
      const contrast = el => { const style = getComputedStyle(el); const bg = background(el); const fg = rgba(style.color); for (let parent = el; parent; parent = parent.parentElement) fg[3] *= parseFloat(getComputedStyle(parent).opacity); const a = luminance(over(fg, bg)); const b = luminance(bg); return {text: el.textContent.trim().slice(0, 55), ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05), required: parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.66 && parseFloat(style.fontWeight) >= 700) ? 3 : 4.5}; };
      const email = newsletter?.querySelector('input[name=email]');
      const consent = newsletter?.querySelector('input[name=consent]');
      const honeypot = newsletter?.querySelector('input[name=website]');
      const logo = brand?.querySelector('img');
      const rootStyle = getComputedStyle(document.documentElement);
      return {
        cardCount: footer.querySelectorAll('[data-footer-card]').length,
        siblings: !!brand && !!navigation && brand.parentElement === navigation.parentElement,
        brand: rect(brand), navigation: rect(navigation), shop: rect(shop), help: rect(help),
        footerColor: rgba(getComputedStyle(footer).backgroundColor), brandColor: brand && rgba(getComputedStyle(brand).backgroundColor),
        ink: rgba(rootStyle.getPropertyValue('--color-ink').trim()), berry: rgba(rootStyle.getPropertyValue('--color-berry').trim()),
        headings: [...footer.querySelectorAll('h2, h3')].map(el => el.textContent.trim()),
        hrefs: [...footer.querySelectorAll('a')].map(el => el.getAttribute('href')),
        shopHrefs: shop && [...shop.querySelectorAll('a')].map(el => el.getAttribute('href')),
        helpHrefs: help && [...help.querySelectorAll('a')].map(el => el.getAttribute('href')),
        partnerHrefs: [...footer.querySelectorAll('nav[aria-label="Explore the partner network"] a')].map(el => el.getAttribute('href')),
        contactText: navigation?.textContent,
        brandHrefs: brand && [...brand.querySelectorAll('a')].map(link => link.getAttribute('href')),
        partnerDisclosure: !!footer.querySelector('details') && footer.querySelector('details summary')?.textContent.trim() === 'Partners' && !footer.querySelector('details').open,
        rightWhatsApp: !!navigation?.querySelector('a[href^="https://wa.me/"]'),
        newsletterHeading: newsletter?.querySelector('h2')?.textContent.trim(),
        newsletterInline: !!email && !!newsletter?.querySelector('button[type=submit]') && newsletter.querySelector('button[type=submit]').getBoundingClientRect().left >= email.getBoundingClientRect().right - 1 && Math.abs(newsletter.querySelector('button[type=submit]').getBoundingClientRect().top - email.getBoundingClientRect().top) <= 1,
        actionText: newsletter?.querySelector('button[type=submit]')?.textContent.trim(),
        whatsappSafe: !!footer.querySelector('a[href="https://wa.me/919876543210"][target="_blank"][rel~="noopener"][rel~="noreferrer"]'),
        logo: logo?.currentSrc, logoFilter: logo && getComputedStyle(logo).filter,
        nativeNewsletter: !!navigation?.contains(newsletter) && !!email && email.type === 'email' && email.required && email.labels.length > 0 && !!consent && consent.type === 'checkbox' && consent.required && consent.labels.length > 0 && !!honeypot && honeypot.tabIndex === -1 && honeypot.getClientRects().length === 0,
        cookieButton: [...footer.querySelectorAll('button')].some(el => el.textContent.trim() === 'Cookie settings' && visible(el)),
        copyright: footer.textContent.includes('© ' + new Date().getFullYear()),
        contrasts: [...footer.querySelectorAll('nav a, h2, p, label, button')].filter(visible).map(contrast),
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1 || footer.scrollWidth > footer.clientWidth + 1,
        outside: [...footer.querySelectorAll('a, input, button')].filter(visible).some(el => { const box = el.getBoundingClientRect(); return box.left < -1 || box.right > innerWidth + 1; }),
        linkSizes: [...footer.querySelectorAll('nav a, section[aria-labelledby="footer-contact-title"] a, section[aria-labelledby="footer-newsletter-title"] a[href="/newsletter"], details summary')].filter(visible).map(el => ({text: el.textContent.trim(), height: el.getBoundingClientRect().height})),
        actionSizes: [...footer.querySelectorAll('button, a[href="#main-content"]')].filter(visible).map(el => ({text: el.textContent.trim(), height: el.getBoundingClientRect().height})),
      };
    })()`);
    const context = route + " / " + width;
    assert.equal(layout.cardCount, 2, "Two footer cards at " + context);
    assert(
      layout.siblings && layout.shop && layout.help,
      "Sibling footer cards and named navigation groups at " + context,
    );
    if (width >= 1024) {
      assert(
        layout.navigation.left >= layout.brand.right - 1 &&
          Math.abs(layout.navigation.top - layout.brand.top) <= 1,
        "Footer cards are side-by-side from lg at " + context,
      );
    } else {
      assert(
        layout.navigation.top >= layout.brand.bottom - 1,
        "Footer cards stack below lg at " + context,
      );
      assert(
        layout.help.left >= layout.shop.right - 1 &&
          Math.abs(layout.help.top - layout.shop.top) <= 1,
        "Shop and help stay side-by-side on mobile at " + context,
      );
    }
    assert.deepEqual(
      layout.footerColor,
      layout.ink,
      "Footer uses dark ink at " + context,
    );
    assert.deepEqual(
      layout.brandColor,
      layout.berry,
      "Brand card uses berry at " + context,
    );
    assert(
      layout.headings.includes("Get in touch"),
      "Full footer contact section heading",
    );
    for (const href of [
      "mailto:hello@example.invalid",
      "tel:+919876543210",
      "https://wa.me/919876543210",
      "/newsletter",
      "/terms-and-conditions",
      "/privacy-policy",
      "/shipping-policy",
      "/refund-policy",
      "/cancellation-policy",
      "/cookie-policy",
      "/disclaimer",
    ])
      assert(
        layout.hrefs.includes(href),
        "Preserved footer route " + href + " / " + context,
      );
    for (const category of [...catalogueFixture.categories, footerCategory])
      assert(
        layout.shopHrefs.includes(
          "/products?category=" + encodeURIComponent(category.id),
        ),
        "Encoded footer category: " + category.id,
      );
    for (const href of ["/products", "/occasions", "/about"])
      assert(layout.shopHrefs.includes(href), "Preserved Shop route " + href);
    assert.deepEqual(
      layout.helpHrefs,
      ["/help", "/contact", "/support/tickets", "/account"],
      "Purposeful help routes without redundant product/new-ticket/partner links",
    );
    for (const href of [
      "/partners",
      "/partners#discover",
      ...[
        "travel-agencies",
        "photographers",
        "wedding-planners",
        "corporate-events",
        "real-estate",
        "creative-businesses",
      ].map((slug) => "/partners/" + slug),
    ])
      assert(
        layout.partnerHrefs.includes(href),
        "Preserved partner-network route " + href,
      );
    assert(
      layout.contactText.includes("Monday to Friday") && layout.whatsappSafe,
      "Full contact hours and safe WhatsApp link at " + context,
    );
    assert(
      layout.brandHrefs.includes("https://wa.me/919876543210"),
      "Brand card uses the real fixture WhatsApp social link",
    );
    assert(
      layout.partnerDisclosure,
      "Partner network is a compact initially-closed native details disclosure",
    );
    assert(
      !layout.rightWhatsApp,
      "WhatsApp is only in the left social card, not duplicated in right contact details",
    );
    assert(
      layout.newsletterHeading === "Newsletter" &&
        layout.newsletterInline &&
        layout.actionText === "Join",
      "Compact right-card newsletter keeps email and Join inline",
    );
    await assertFooterSocials();
    assert.equal(
      layout.logo,
      publishedImage("/Albumo Text Logo.png"),
      "Footer keeps the published logo",
    );
    assert(
      layout.logoFilter.includes("brightness(0)") &&
        layout.logoFilter.includes("invert(1)"),
      "Footer logo is white-treated",
    );
    assert(
      layout.nativeNewsletter && layout.cookieButton && layout.copyright,
      "Real compact newsletter, Cookie settings and copyright at " + context,
    );
    for (const text of layout.contrasts)
      assert(
        text.ratio + 0.01 >= text.required,
        "Footer text contrast " +
          text.ratio.toFixed(2) +
          ": " +
          text.text +
          " / " +
          context,
      );
    for (const link of layout.linkSizes)
      assert(
        link.height >= (width >= 1024 ? 31.5 : 43.5),
        "Responsive footer link target: " + link.text + " / " + context,
      );
    for (const action of layout.actionSizes)
      assert(
        action.height >= 43.5,
        "44px footer action target: " + action.text + " / " + context,
      );
    assert(!layout.overflow && !layout.outside, "Footer and body fit at " + context);
  }
  async function runFooterSmoke() {
    const previous = {
      footerFixtureMode,
      contactMode,
      newsletterEnabled,
      newsletterMode,
      footerContactOverrides,
    };
    footerFixtureMode = true;
    contactMode = "ready";
    newsletterEnabled = true;
    newsletterMode = "ready";
    try {
      await go("/");
      if (
        await evaluate(
          "!!document.querySelector('section[aria-label=\"Cookie preferences\"]')",
        )
      )
        await clickText("Essential only");
      await waitFor(
        "!document.querySelector('section[aria-label=\"Cookie preferences\"]')",
      );
      for (const width of [320, 390, 768, 1023, 1024, 1440]) {
        await command("Emulation.setDeviceMetricsOverride", {
          width,
          height: width >= 1024 ? 1000 : 844,
          deviceScaleFactor: 1,
          mobile: width < 1024,
        });
        for (const route of ["/", "/account", "/contact"]) {
          await go(route);
          await assertFooterLayout(width, route);
          const cta = 'section[aria-labelledby="home-cta-title"]';
          assert.equal(
            await evaluate(
              "document.querySelectorAll(" + JSON.stringify(cta) + ").length",
            ),
            route === "/" ? 1 : 0,
            "Home-only closing section at " + route,
          );
          if (route === "/") {
            await scrollClosing(cta);
            const closing = await evaluate(`(() => {
              const section = document.querySelector('section[aria-labelledby="home-cta-title"]');
              const heading = section.querySelector('#home-cta-title').closest('[data-reveal]').getBoundingClientRect();
              const artwork = section.querySelector('img').closest('[data-reveal]').getBoundingClientRect();
              const links = [...section.querySelectorAll('a[href="/products"]')].filter(link => link.getClientRects().length > 0);
              return {visibleLinks: links.length, columns: artwork.left >= heading.right - 1, stacked: artwork.top >= heading.bottom - 1, mobileActionAfterArt: links.length === 1 && links[0].getBoundingClientRect().top >= artwork.bottom - 1};
            })()`);
            assert.equal(
              closing.visibleLinks,
              1,
              "Exactly one home closing product action is visible at " + width,
            );
            assert(
              width >= 768
                ? closing.columns
                : closing.stacked && closing.mobileActionAfterArt,
              "Home closing section has desktop columns / stacked mobile artwork and action at " +
                width,
            );
            assert.deepEqual(
              await evaluate(
                "[...document.querySelectorAll('section[aria-labelledby=\"home-cta-title\"] img')].map(image => image.currentSrc)",
              ),
              [publishedImage("/hero1.png")],
              "Closing section uses one published hero1 artwork, not unpublished photographs",
            );
            if (width === 390 || width === 1440)
              await captureClosing(cta, "home-closing-" + width);
          } else if (route === "/account" && (width === 390 || width === 1440)) {
            await captureClosing("footer", "footer-" + width);
          }
        }
      }
      await command("Emulation.setDeviceMetricsOverride", {
        width: 390,
        height: 844,
        deviceScaleFactor: 1,
        mobile: true,
      });
      await command("Emulation.setEmulatedMedia", {
        features: [{ name: "prefers-reduced-motion", value: "reduce" }],
      });
      await go("/");
      await scrollClosing('section[aria-labelledby="home-cta-title"]');
      assert(
        await evaluate(
          "matchMedia('(prefers-reduced-motion: reduce)').matches && [...document.querySelectorAll('section[aria-labelledby=\"home-cta-title\"], section[aria-labelledby=\"home-cta-title\"] [data-reveal]')].every(el => el.getClientRects().length > 0 && parseFloat(getComputedStyle(el).opacity) >= 0.99)",
        ),
        "Reduced-motion users see the home closing section",
      );
      await clickLink(
        'section[aria-labelledby="home-cta-title"] a[href="/products"]',
        true,
      );
      await waitFor(
        "location.pathname === '/products' && !!document.querySelector('main h1')",
        "Home closing CTA navigates to products",
      );
      await command("Emulation.setEmulatedMedia", { features: [] });
      await go("/contact");
      await fill("email", "", footerNewsletter);
      const subscriptionCount = () =>
        events.filter(
          (item) =>
            item.path === "/api/contact/newsletter/subscribe" && item.method === "POST",
        ).length;
      const requestNewsletter = () =>
        evaluate(
          "document.querySelector(" +
            JSON.stringify(footerNewsletter + " form") +
            ").requestSubmit()",
        );
      const beforeInvalid = subscriptionCount();
      await requestNewsletter();
      assert(
        await evaluate(
          "document.querySelector(" +
            JSON.stringify(footerNewsletter + " input[name=email]") +
            ").validity.valueMissing",
        ),
        "Footer email is natively required",
      );
      await fill("email", "not-an-email", footerNewsletter);
      await requestNewsletter();
      assert(
        await evaluate(
          "document.querySelector(" +
            JSON.stringify(footerNewsletter + " input[name=email]") +
            ").validity.typeMismatch",
        ),
        "Footer email syntax is validated natively",
      );
      await fill("email", "footer-reader@example.invalid", footerNewsletter);
      await requestNewsletter();
      assert(
        await evaluate(
          "document.querySelector(" +
            JSON.stringify(footerNewsletter + " input[name=consent]") +
            ").validity.valueMissing",
        ),
        "Footer subscription requires consent",
      );
      assert.equal(
        subscriptionCount(),
        beforeInvalid,
        "Invalid footer forms never call the subscription API",
      );
      await evaluate(
        "document.querySelector(" +
          JSON.stringify(footerNewsletter + " input[name=consent]") +
          ").click()",
      );
      newsletterMode = "unavailable";
      await requestNewsletter();
      await waitFor(
        "document.querySelector(" +
          JSON.stringify(footerNewsletter + " [role=alert]") +
          ")?.textContent.includes('Newsletter service unavailable')",
        "Footer newsletter server error",
      );
      assert(
        await evaluate(
          "document.querySelector(" +
            JSON.stringify(footerNewsletter + " input[name=email]") +
            ").value === 'footer-reader@example.invalid' && document.querySelector(" +
            JSON.stringify(footerNewsletter + " input[name=consent]") +
            ").checked && !document.querySelector(" +
            JSON.stringify(footerNewsletter + " form button") +
            ").disabled",
        ),
        "Footer error preserves values and enables recovery",
      );
      newsletterMode = "ready";
      let release;
      newsletterSaveGate = new Promise((resolve) => {
        release = resolve;
      });
      const beforeLocked = subscriptionCount();
      const idleSubmitWidth = await evaluate(
        "document.querySelector(" +
          JSON.stringify(footerNewsletter + " form button") +
          ").getBoundingClientRect().width",
      );
      try {
        await evaluate(
          "(() => { const form = document.querySelector(" +
            JSON.stringify(footerNewsletter + " form") +
            "); form.requestSubmit(); form.requestSubmit(); })()",
        );
        await waitFor(
          "document.querySelector(" +
            JSON.stringify(footerNewsletter + " form button") +
            ")?.textContent.includes('Please wait...')",
          "Footer submit lock and pending feedback",
        ).catch(async (failure) => {
          failure.message +=
            "\n" +
            JSON.stringify(
              await evaluate(
                "document.querySelector(" +
                  JSON.stringify(footerNewsletter) +
                  ").outerHTML",
              ),
            ) +
            "\n" +
            JSON.stringify(events.filter((item) => item.path.includes("newsletter")));
          throw failure;
        });
        const pending = await evaluate(
          "(() => { const button = document.querySelector(" +
            JSON.stringify(footerNewsletter + " form button") +
            "); return {width: button.getBoundingClientRect().width, disabled: button.disabled && button.type === 'submit', busy: button.getAttribute('aria-busy') === 'true' && button.closest('form').getAttribute('aria-busy') === 'true', busyText: [...button.querySelectorAll('span')].some(span => span.textContent.trim() === 'Please wait...' && span.classList.contains('sr-only'))}; })()",
        );
        assert(
          Math.abs(pending.width - idleSubmitWidth) <= 1 &&
            pending.busyText &&
            pending.disabled &&
            pending.busy,
          "Native Join stays fixed-width, disabled and aria-busy with accessible sr-only pending text",
        );
      } finally {
        newsletterSaveGate = null;
        release();
      }
      await waitFor(
        "document.querySelector(" +
          JSON.stringify(footerNewsletter + " [role=status]") +
          ")?.textContent.includes('preference has been saved')",
        "Footer newsletter real mock subscription success",
      );
      assert.equal(
        subscriptionCount(),
        beforeLocked + 1,
        "Concurrent footer submissions issue exactly one request",
      );
      assert.deepEqual(
        events.filter((item) => item.path === "/api/contact/newsletter/subscribe").at(-1)
          .body,
        {
          email: "footer-reader@example.invalid",
          website: "",
          consent: true,
          source: "FOOTER",
        },
        "Footer submits the real newsletter contract",
      );
      await clickLink(footerNewsletter + ' a[href="/newsletter"]');
      await waitFor(
        "location.pathname === '/newsletter' && !!document.querySelector('main h1')",
        "Footer management link remains functional",
      );
      newsletterEnabled = false;
      await go("/contact");
      await waitFor(
        "document.querySelector(" +
          JSON.stringify(footerNewsletter) +
          ")?.textContent.includes('sign-ups are paused')",
        "Newsletter disabled by contact settings",
      );
      assert(
        !(await evaluate(
          "!!document.querySelector(" + JSON.stringify(footerNewsletter + " form") + ")",
        )),
        "Paused newsletter does not offer a subscription form",
      );
      newsletterEnabled = true;
      await go("/contact");
      await waitFor(
        "!!document.querySelector(" +
          JSON.stringify(footerNewsletter + " input[name=email]") +
          ")",
        "Footer subscription recovers when settings are enabled",
      );
      contactMode = "unavailable";
      await command("Page.navigate", { url: origin + "/contact" });
      await waitFor(
        "document.querySelector('footer [data-footer-card=\"navigation\"]')?.textContent.includes('Contact details are unavailable')",
        "Footer contact-settings failure",
      );
      contactMode = "ready";
      await evaluate(
        "[...document.querySelectorAll('footer [data-footer-card=\"navigation\"] button')].find(button => button.textContent.trim() === 'Try again').click()",
      );
      await waitFor(
        "!!document.querySelector('footer a[href=\"mailto:hello@example.invalid\"]')",
        "Contact settings retry restores the existing hydration signal",
      );
      await assertFooterLayout(390, "/contact");
      for (const whatsapp of ["919876543210", "00000000", "invalid-number"]) {
        footerContactOverrides = { email: "", phone: "", whatsapp };
        // These deliberate no-email settings do not have the normal mailto hydration signal.
        await command("Page.navigate", { url: origin + "/contact" });
        await waitFor(
          "document.querySelector('footer section[aria-labelledby=\"footer-contact-title\"]')?.textContent.includes('Send us a message')",
          "Footer fallback respects omitted or invalid WhatsApp",
        );
        assert(
          await evaluate(
            '!!document.querySelector(\'footer section[aria-labelledby="footer-contact-title"] a[href="/contact"]\') && !document.querySelector(\'footer [data-footer-card="navigation"] a[href^="https://wa.me/"]\')',
          ),
          "Right-card contact fallback does not disappear behind omitted/invalid WhatsApp",
        );
        await assertFooterSocials(whatsapp);
      }
      footerContactOverrides = {};
      await go("/contact");
      await evaluate("document.querySelector('footer details summary').focus()");
      await pressKey("Enter", "Enter", 13);
      await waitFor(
        "document.querySelector('footer details')?.open === true",
        "Keyboard opens partner directory disclosure",
      );
      assert(
        await evaluate(
          "[...document.querySelectorAll('footer nav[aria-label=\"Explore the partner network\"] a')].every(link => link.getClientRects().length > 0)",
        ),
        "Expanded partner disclosure exposes its preserved routes",
      );
      await pressKey("Enter", "Enter", 13);
      await waitFor(
        "document.querySelector('footer details')?.open === false",
        "Keyboard closes compact partner disclosure",
      );
      await evaluate(
        "document.querySelector('footer nav[aria-label=\"Shop\"] a').focus()",
      );
      await pressKey("Tab", "Tab", 9);
      assert(
        await evaluate(
          "document.activeElement.closest('footer') && document.activeElement.matches(':focus-visible') && (parseFloat(getComputedStyle(document.activeElement).outlineWidth) >= 2 || getComputedStyle(document.activeElement).boxShadow !== 'none')",
        ),
        "Footer links have a visible keyboard focus treatment",
      );
      const categoryHref = "/products?category=" + encodeURIComponent(footerCategory.id);
      await clickLink('footer nav[aria-label="Shop"] a[href="' + categoryHref + '"]');
      await waitFor(
        "location.pathname === '/products' && new URLSearchParams(location.search).get('category') === " +
          JSON.stringify(footerCategory.id),
        "Encoded footer category Link navigation",
      );
      await clickLink('footer nav[aria-label="Here to help"] a[href="/contact"]');
      await waitFor(
        "location.pathname === '/contact' && !!document.querySelector('main h1')",
        "Footer Contact us Link navigation",
      );
      await scrollClosing("footer");
      await evaluate(
        "[...document.querySelectorAll('footer button')].find(button => button.textContent.trim() === 'Cookie settings').focus()",
      );
      await clickText("Cookie settings");
      await waitFor(
        "!!document.querySelector('[role=dialog]') && document.querySelector('[role=dialog]').contains(document.activeElement)",
        "Footer Cookie settings takes dialog focus",
      );
      assert(
        await evaluate(
          "document.querySelector('[role=dialog]').getAttribute('aria-labelledby')?.split(' ').some(id => document.getElementById(id)?.textContent.includes('Your cookie choices'))",
        ),
        "Cookie dialog keeps its accessible title",
      );
      await evaluate("document.querySelector('[role=dialog] a').focus()");
      await pressKey("Tab", "Tab", 9);
      assert(
        await evaluate(
          "document.querySelector('[role=dialog]').contains(document.activeElement)",
        ),
        "Cookie dialog traps keyboard focus",
      );
      await pressKey("Escape", "Escape", 27);
      await waitFor(
        "!document.querySelector('[role=dialog]') && document.activeElement?.textContent.trim() === 'Cookie settings'",
        "Cookie settings restores footer trigger focus",
      );
      if (
        await evaluate("!!document.querySelector('footer a[href=\"#main-content\"]')")
      ) {
        await clickLink('footer a[href="#main-content"]');
        await waitFor(
          "location.hash === '#main-content' && scrollY < document.querySelector('footer').offsetTop - 100",
          "Footer Back to top remains functional",
        );
      } else {
        skippedChecks.push(
          "Footer Back to top navigation: control omitted in the latest UI version",
        );
        console.log("SKIP footer Back to top navigation: control omitted in latest UI");
      }
      console.log(
        "PASS responsive dark two-card footer, preserved navigation/contact/policies, newsletter validation/lock/error/pause/recovery, keyboard/cookie focus and home-only published closing artwork/reduced motion",
      );
    } finally {
      newsletterSaveGate = null;
      ({
        footerFixtureMode,
        contactMode,
        newsletterEnabled,
        newsletterMode,
        footerContactOverrides,
      } = previous);
      await command("Emulation.setEmulatedMedia", { features: [] });
    }
  }
  await command("Runtime.enable");
  await command("Page.enable");
  await command("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });

  if (!footerOnly) {
    await assertNavbarLoading();
    for (const width of navbarWidths) {
      await command("Emulation.setDeviceMetricsOverride", {
        width,
        height: width >= 1024 ? 1000 : 844,
        deviceScaleFactor: 1,
        mobile: width < 1024,
      });
      await go("/account");
      await assertNavbar();
      if (width === 390) {
        await captureAccount("navbar-guest-390");
        await evaluate(
          "document.querySelector('button[aria-controls=mobile-navigation]').click()",
        );
        await waitFor("document.querySelector('#mobile-navigation')?.hidden === false");
        await clickLink('header a[href="/login?redirect=/account"]');
        await waitFor(
          "location.pathname === '/login' && !!document.querySelector('main input[name=phone]')",
        );
        assert.equal(
          await evaluate("new URLSearchParams(location.search).get('redirect')"),
          "/account",
          "Navbar guest Sign in preserves the account redirect",
        );
        await waitFor(
          "document.querySelector('#mobile-navigation')?.hidden === true && document.querySelector('button[aria-controls=mobile-navigation]')?.getAttribute('aria-expanded') === 'false'",
          "Navbar Sign in closes the mobile disclosure",
        );
        await assertNavbar();
      }
    }
    await command("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: false,
    });
    if (!accountOnly) {
      // Storefront checks cover the shared typography and actual shopping controls.
      await go("/");
      await clickText("Essential only");
      await waitFor(
        "!document.querySelector('section[aria-label=\"Cookie preferences\"]')",
      );
      for (const width of [1440, 768, 390, 320]) {
        await command("Emulation.setDeviceMetricsOverride", {
          width,
          height: width > 800 ? 1000 : 844,
          deviceScaleFactor: 1,
          mobile: width < 800,
        });
        for (const route of ["/", "/products", "/products/layflat"]) {
          await go(route);
          await assertNavbar();
          assert(
            await evaluate(
              "document.documentElement.scrollWidth <= window.innerWidth + 1",
            ),
            "Storefront overflow at " + route + " / " + width,
          );
          assert.equal(
            await evaluate("getComputedStyle(document.body).backgroundColor"),
            "rgb(255, 255, 255)",
          );
          assert(
            await evaluate("parseFloat(getComputedStyle(document.body).fontSize) >= 16"),
            "Readable body typography",
          );
          if (width < 1100) {
            assert(
              await evaluate(
                "[...document.querySelectorAll('header a')].find(a => a.textContent.includes('Find your photo book')).getClientRects().length === 0",
              ),
              "Desktop shopping button is hidden on mobile",
            );
          }
          await evaluate("document.fonts.ready");
          if (width === 1440 || width === 390) {
            // Full-page captures must load images outside the current viewport too.
            await evaluate("document.querySelectorAll('img[loading=lazy]').forEach(i=>i.loading='eager')");
            await evaluate("window.scrollTo(0, document.body.scrollHeight)");
            await waitFor(
              "[...document.images].every(image => image.complete && image.naturalWidth > 0)",
              "Storefront CDN images",
            );
            await evaluate("window.scrollTo(0, 0)");
            const capture = await command("Page.captureScreenshot", {
              format: "png",
              captureBeyondViewport: true,
              clip: {
                x: 0,
                y: 0,
                width,
                height: await evaluate("document.documentElement.scrollHeight"),
                scale: 1,
              },
            });
            const name =
              route === "/" ? "home" : route === "/products" ? "collection" : "product";
            const viewport = await command("Page.captureScreenshot", {
              format: "png",
              captureBeyondViewport: false,
            });
            await writeFile(
              path.join(artifacts, name + "-" + width + "-viewport.png"),
              Buffer.from(viewport.data, "base64"),
            );
            await writeFile(
              path.join(artifacts, name + "-" + width + ".png"),
              Buffer.from(capture.data, "base64"),
            );
          }
        }
      }
      await command("Emulation.setDeviceMetricsOverride", {
        width: 1440,
        height: 1000,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await go("/products?category=travel");
      assert.equal(
        await evaluate(
          "document.querySelector('nav[aria-label=\"Categories\"] [aria-current=page]')?.textContent.trim()",
        ),
        "Travel Books",
      );
      assert.equal(
        await evaluate("document.querySelectorAll('#product-grid article').length"),
        2,
      );
      await fill("product-search", "mini");
      await waitFor("document.querySelectorAll('#product-grid article').length === 1");
      assert(
        await evaluate(
          "document.querySelector('#product-grid article h3').textContent.includes('Mini')",
        ),
      );
      await fill("product-search", "no-such-product");
      await waitFor(
        "document.querySelector('#product-grid').textContent.includes('No products found')",
      );
      await clickText("Clear search");
      await waitFor("document.querySelectorAll('#product-grid article').length === 2");
      await go("/products?category=invalid");
      assert.equal(
        await evaluate("document.querySelectorAll('#product-grid article').length"),
        5,
      );
      await evaluate(
        "(() => { const select = document.querySelector('[name=product-sort]'); select.value = 'price-low'; select.dispatchEvent(new Event('change', { bubbles: true })); })()",
      );
      await waitFor(
        "document.querySelector('#product-grid article h3').textContent.includes('Photo Keychain')",
      );
      await evaluate(
        "(() => { const select = document.querySelector('[name=product-sort]'); select.value = 'price-high'; select.dispatchEvent(new Event('change', { bubbles: true })); })()",
      );
      await waitFor(
        "document.querySelector('#product-grid article h3').textContent.includes('XL Layflat')",
      );
      await go("/products/layflat");
      await evaluate(
        "document.querySelectorAll('input[name=\"size-layflat\"]')[1].click()",
      );
      await evaluate("document.querySelector('input[name=cover][value=linen]').click()");
      await fill("quantity", "2");
      await command('Fetch.enable', { patterns: [{ urlPattern: 'http://localhost:3001/start*', requestStage: 'Request' }] });
      await clickText("Design Now");
      await waitFor("location.pathname === '/start' && document.body.textContent.includes('Studio handoff verified')");
      const handoff = new URL(await evaluate('location.href'));
      assert.equal(handoff.searchParams.get('product'), 'layflat');
      assert.equal(handoff.searchParams.get('quantity'), '2');
      assert.equal(JSON.parse(handoff.searchParams.get('choices')).cover, 'linen');
      assert.equal(Object.values(JSON.parse(handoff.searchParams.get('choices'))).includes('square'), true);
      await command('Fetch.disable');
      console.log(
        "PASS white storefront, readable text, responsive layouts, category links, search, sorting and product selection",
      );

      catalogueMode = "empty";
      await go("/products");
      await waitFor(
        "document.querySelector('#product-grid').textContent.includes('Our collection is taking shape')",
      );
      catalogueMode = "unavailable";
      await go("/products");
      await waitFor(
        "document.querySelector('#product-grid').textContent.includes('temporarily unavailable')",
      );
      catalogueMode = "ready";
      await go("/products");
      await waitFor("document.querySelectorAll('#product-grid article').length === 5");
      console.log(
        "PASS empty catalogue, API failure and recovery without sample-product fallback",
      );

      for (const route of ["/", "/products/layflat"]) {
        await go(route);
        await evaluate("document.querySelectorAll('img[loading=lazy]').forEach(i=>i.loading='eager')");
        await evaluate("window.scrollTo(0, document.body.scrollHeight)");
        await waitFor(
          "[...document.images].length > 0 && [...document.images].every(image => image.complete && image.naturalWidth > 0)",
          "CDN images loaded",
        );
        const sources = await evaluate(
          "[...document.images].map(image => image.currentSrc)",
        );
        assert(
          sources.every((source) => new URL(source).origin === "https://cdn.albumo.in"),
          "Every rendered image must come directly from the CDN at " + route + ': ' + sources.filter(source => new URL(source).origin !== 'https://cdn.albumo.in').join(', '),
        );
        assert(
          sources.every((source) => !new URL(source).pathname.startsWith("/_next/image")),
          "Images bypass Next.js processing",
        );
        const icon = await evaluate("document.querySelector('link[rel=icon]')?.href");
        assert.equal(new URL(icon).origin, "https://cdn.albumo.in");
        await evaluate("window.scrollTo(0, 0)");
      }
      console.log("PASS home and product images and favicon load directly from the CDN");

      await go("/contact");
      await waitFor(
        "!document.querySelector('section[aria-label=\"Cookie preferences\"]')",
      );
      await waitFor("!!document.querySelector('main input[name=name]')");
      await evaluate("document.fonts.ready");
      const screenshot = await command("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: false,
      });
      await writeFile(
        path.join(artifacts, "contact-desktop.png"),
        Buffer.from(screenshot.data, "base64"),
      );
      const enquiriesBefore = events.filter(
        (item) => item.path === "/api/contact/enquiries",
      ).length;
      await clickText("Start the conversation");
      await waitFor("!!document.querySelector('main input[aria-invalid=true]')");
      assert.equal(
        events.filter((item) => item.path === "/api/contact/enquiries").length,
        enquiriesBefore,
        "Invalid form does not submit",
      );
      assert(
        await evaluate(
          "(() => { const input = document.querySelector('main input[name=name]'); return input.labels.length > 0 && input.getAttribute('aria-describedby')?.split(' ').some(id => document.getElementById(id)?.textContent.length > 0); })()",
        ),
        "Invalid fields have a label and associated validation message",
      );
      await fill("name", "Asha Test");
      await fill("email", "asha@example.invalid");
      await fill("subject", "Connection failure test");
      await fill("message", "We would love an album for our group trip to Goa.");
      await evaluate("document.querySelector('main input[name=consent]').click()");
      await clickText("Start the conversation");
      await waitFor(
        "document.querySelector('main [role=alert]')?.textContent.includes('try your enquiry')",
      );
      assert.equal(
        await evaluate("document.querySelector('main textarea').value"),
        "We would love an album for our group trip to Goa.",
      );
      await fill("subject", "Our group trip album");
      await submit();
      await waitFor(
        "document.querySelector('main')?.textContent.includes('Your conversation has started')",
      );
      await clickText("View conversation");
      await waitFor("!!document.querySelector('main textarea')");
      assert.equal(
        await evaluate(
          "[...document.querySelectorAll('main ol p')].filter(el => el.textContent === 'We would love an album for our group trip to Goa.').length",
        ),
        1,
        "Initial message is not duplicated",
      );
      await evaluate(
        "(() => { const el = document.querySelector('main textarea'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(el, 'We have a few more photos to include.'); el.dispatchEvent(new Event('input', {bubbles:true})); })()",
      );
      await submit();
      await waitFor(
        "document.querySelector('main ol')?.textContent.includes('a few more photos')",
      );
      console.log("PASS contact error recovery, guest tracking, and reply");

      await go("/support/new");
      await fill("name", "Asha Test");
      await fill("email", "asha@example.invalid");
      await fill("subject", "A question about paper");
      await fill(
        "description",
        "Could you help us choose the right finish for our album?",
      );
      await submit();
      await waitFor(
        "document.querySelector('main')?.textContent.includes('Your conversation has started')",
      );
      console.log("PASS standalone support request");

      await go("/login?redirect=/support/tickets");
      await clickText("Sign in with a password");
      await fill("email", "asha@example.invalid");
      await fill("password", "example-password");
      await clickText("Show");
      assert.equal(
        await evaluate("document.querySelector('main input[name=password]').type"),
        "text",
      );
      await clickText("Hide");
      assert.equal(
        await evaluate("document.querySelector('main input[name=password]').type"),
        "password",
      );
      await evaluate("document.querySelector('main input[type=checkbox]').click()");
      await submit();
      await waitFor(
        "location.pathname === '/support/tickets' && document.querySelector('main')?.textContent.includes('Our group trip album')",
      );
      console.log("PASS sign-in and account ticket history");
    } else {
      await go("/account?tab=orders");
      await clickText("Essential only");
      await clickLink('main a[href^="/login?"]');
      await waitFor(
        "location.pathname === '/login' && !!document.querySelector('main input[name=phone]')",
      );
      assert.equal(
        await evaluate("new URLSearchParams(location.search).get('redirect')"),
        "/account?tab=orders",
      );
      await clickText("Sign in with a password");
      await fill("email", "asha@example.invalid");
      await fill("password", "example-password");
      await evaluate("document.querySelector('main input[name=legalConsent]').click()");
      await submit();
      await waitFor(
        "location.pathname === '/account' && new URLSearchParams(location.search).get('tab') === 'orders' && document.querySelector('#account-panel')?.getAttribute('aria-label') === 'Orders'",
      );
    }

    await assertNavbar(user.name);
    await assertNavbarLoading(user.name);
    // Cover the lg boundary as well as actual mobile menu -> section Link clicks.
    for (const width of [1440, 1024, 1023, 768, 390, 320]) {
      await command("Emulation.setDeviceMetricsOverride", {
        width,
        height: width >= 1024 ? 1000 : 844,
        deviceScaleFactor: 1,
        mobile: width < 1024,
      });
      await go("/account");
      await assertAccountLayout(width);
      if (width === 1440 || width === 390) await captureAccount("account-" + width);

      for (const invalidTab of ["unknown-section", "overview", ""]) {
        await go("/account?tab=" + invalidTab);
        await assertAccountLayout(width);
      }
      await go("/account");
      await assertAccountLayout(width);
      for (const [tab] of accountSections) {
        await clickLink(accountNavigation + ' a[href="/account?tab=' + tab + '"]');
        const selectedRoute =
          "location.pathname === '/account' && new URLSearchParams(location.search).get('tab') === " +
          JSON.stringify(tab);
        await waitFor(selectedRoute, "Account Link to " + tab + " / " + width);
        await assertAccountLayout(width, tab);
        if (width < 1024)
          await waitFor(
            "document.activeElement === document.querySelector('#account-panel')",
            "Mobile section receives focus: " + tab + " / " + width,
          );
        const ready = {
          profile: "!!document.querySelector('#account-panel input[name=name]')",
          orders:
            "document.querySelector('#account-panel')?.textContent.includes('Fixture keepsake product') && !!document.querySelector('#account-panel input[name=account-order-search]')",
          albums:
            "document.querySelector('#account-panel')?.textContent.includes('Our coastal weekend')",
          addresses:
            "document.querySelector('#account-panel')?.textContent.includes('12 Test Lane')",
        };
        await waitFor(ready[tab], "Account section data: " + tab);
        if (width === 390 && tab === "orders") await captureAccount("account-orders-390");
        if (width < 1024) {
          // Browser history must also change visibility, including an explicit Profile.
          await evaluate("history.back()");
          await waitFor(
            "location.pathname === '/account' && location.search === ''",
            "Browser back to account menu / " + width,
          );
          await assertAccountLayout(width);
          await evaluate("history.forward()");
          await waitFor(selectedRoute, "Browser forward to " + tab + " / " + width);
          await assertAccountLayout(width, tab);
          await waitFor(
            "document.activeElement === document.querySelector('#account-panel')",
            "History restores mobile panel focus: " + tab + " / " + width,
          );
          await clickLink(accountBackLink);
          await waitFor(
            "location.pathname === '/account' && location.search === ''",
            "Back to account Link / " + width,
          );
          await assertAccountLayout(width);
          await waitFor(
            "document.activeElement?.getAttribute('href') === " +
              JSON.stringify("/account?tab=" + tab),
            "Back Link restores section-link focus: " + tab + " / " + width,
          );
        }
      }
    }
    console.log(
      "PASS four ordered account sections, desktop default Profile, vertical mobile menu, Link drill-down/back/history, invalid query fallback and lg breakpoint",
    );
    await command("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await go("/account?tab=profile");
    await waitFor("!!document.querySelector('main input[name=name]')");
    assert(
      await evaluate(
        "document.querySelector('main input[name=email]').readOnly && document.querySelector('main input[name=phone]').readOnly",
      ),
    );
    const originalNavbarName = user.name;
    try {
      for (const fixtureName of ["", null, "   ", "  Asha Fixture  "]) {
        user.name = fixtureName;
        await go("/account?tab=profile");
        await assertNavbar(fixtureName);
      }
      user.name = originalNavbarName;
      await go("/account?tab=profile");
      await waitFor("!!document.querySelector('main input[name=name]')");
      const longName = "Asha " + "VeryLongUnbrokenFamilyName".repeat(3);
      await fill("name", longName);
      await submit();
      await waitFor(
        "document.querySelector('main [role=status]')?.textContent.includes('Your name has been updated')",
      );
      await assertNavbar(longName, { truncated: true });
      for (const width of navbarWidths) {
        await command("Emulation.setDeviceMetricsOverride", {
          width,
          height: width >= 1024 ? 1000 : 844,
          deviceScaleFactor: 1,
          mobile: width < 1024,
        });
        await go("/account");
        await assertNavbar(longName, { truncated: true });
        if (width === 390) {
          await evaluate(
            "document.querySelector('button[aria-controls=mobile-navigation]').click()",
          );
          await waitFor("document.querySelector('#mobile-navigation')?.hidden === false");
          await clickLink('header a[href="/account"]');
          await waitFor(
            "document.querySelector('#mobile-navigation')?.hidden === true",
            "Profile Link closes the disclosure even on the current account route",
          );
          await assertNavbar(longName, { truncated: true });
        }
      }
      await command("Emulation.setDeviceMetricsOverride", {
        width: 1440,
        height: 1000,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await go("/account?tab=profile");
      await waitFor("!!document.querySelector('main input[name=name]')");
      await fill("name", originalNavbarName);
      await submit();
      await waitFor(
        "document.querySelector('main [role=status]')?.textContent.includes('Your name has been updated')",
      );
      await assertNavbar(originalNavbarName);
    } finally {
      user.name = originalNavbarName;
    }
    console.log(
      "PASS navbar nameless/trimmed-name fallback, live long-name save, full accessible name/title and truncation without overflow at 320–1440px",
    );
    await fill("name", "Asha Updated");
    await submit();
    await waitFor(
      "document.querySelector('main [role=status]')?.textContent.includes('Your name has been updated')",
    );
    assert.equal(
      events
        .filter((item) => item.path === "/api/auth/me" && item.method === "PATCH")
        .at(-1).body.name,
      "Asha Updated",
    );
    await assertNavbar("Asha Updated");
    await fill("name", "Asha");
    await submit();
    await waitFor(
      "document.querySelector('main aside')?.textContent.includes('Asha') && !document.querySelector('main aside')?.textContent.includes('Asha Updated')",
    );
    await assertNavbar("Asha");
    await waitFor("!!document.querySelector('main details summary')");
    await evaluate("document.querySelector('main details summary').click()");
    await fill("currentPassword", "example-password");
    await fill("newPassword", "new-example-password");
    await fill("confirmation", "different-password");
    await submit("main details form");
    await waitFor(
      "document.querySelector('main details [role=alert]')?.textContent.includes('do not match')",
    );
    await fill("confirmation", "new-example-password");
    await submit("main details form");
    await waitFor(
      "document.querySelector('main details [role=status]')?.textContent.includes('Other sessions')",
    );
    await assertNavbar("Asha");
    console.log(
      "PASS profile updates, live navbar name, read-only identity fields, and password validation/save",
    );
    for (const [nameDelay, passwordDelay] of [
      [300, 0],
      [0, 300],
    ]) {
      nameSaveDelay = nameDelay;
      passwordSaveDelay = passwordDelay;
      await go("/account?tab=profile");
      await waitFor("!!document.querySelector('main details summary')");
      await fill("name", "Asha Concurrent " + nameDelay);
      await evaluate("document.querySelector('main details summary').click()");
      await fill("currentPassword", "example-password");
      await fill("newPassword", "new-example-password");
      await fill("confirmation", "new-example-password");
      await submit("main details form");
      await submit();
      await waitFor(
        "document.querySelector('main details [role=status]')?.textContent.includes('Other sessions') && document.querySelector('main form [role=status]')?.textContent.includes('Your name')",
      );
      assert(
        await evaluate(
          "document.querySelector('main aside')?.textContent.includes(" +
            JSON.stringify("Asha Concurrent " + nameDelay) +
            ")",
        ),
        "Concurrent saves keep the latest name",
      );
      await assertNavbar("Asha Concurrent " + nameDelay);
    }
    nameSaveDelay = 0;
    passwordSaveDelay = 0;
    user.name = "Asha";
    console.log("PASS concurrent profile/password updates in both completion orders");

    await go("/account?tab=addresses");
    await waitFor("document.querySelector('main')?.textContent.includes('Asha Work')");
    await clickText("Add address");
    await waitFor("!!document.querySelector('[role=dialog] input[name=name]')");
    assert(
      await evaluate(
        "document.querySelector('[role=dialog]').contains(document.activeElement)",
      ),
      "Address dialog takes focus",
    );
    for (const [name, value] of Object.entries({
      name: "Asha Gift",
      phone: "+919999999999",
      line1: "56 Sample Avenue",
      line2: "Near the park",
      city: "Jaipur",
      state: "Rajasthan",
      pincode: "302001",
    }))
      await fill(name, value, "[role=dialog]");
    const writesBefore = events.filter(
      (item) => item.path === "/api/addresses" && item.method === "POST",
    ).length;
    await fill("pincode", "123", "[role=dialog]");
    await clickText("Save address");
    await waitFor("!!document.querySelector('[role=dialog] input[aria-invalid=true]')");
    assert.equal(
      events.filter((item) => item.path === "/api/addresses" && item.method === "POST")
        .length,
      writesBefore,
    );
    await fill("pincode", "302001", "[role=dialog]");
    await submit("[role=dialog] form");
    await waitFor(
      "!document.querySelector('[role=dialog]') && document.querySelector('main')?.textContent.includes('Asha Gift')",
    );
    await evaluate(
      "[...document.querySelectorAll('main article')].find(el => el.textContent.includes('Asha Gift')).querySelector('button').click()",
    );
    await waitFor("!!document.querySelector('[role=dialog] input[name=line1]')");
    await fill("line1", "78 Updated Avenue", "[role=dialog]");
    await submit("[role=dialog] form");
    await waitFor(
      "!document.querySelector('[role=dialog]') && document.querySelector('main')?.textContent.includes('78 Updated Avenue')",
    );
    await evaluate(
      "[...document.querySelectorAll('main article')].find(el => el.textContent.includes('Asha Gift')).querySelectorAll('button')[2].click()",
    );
    await waitFor(
      "[...document.querySelectorAll('main article')].find(el => el.textContent.includes('Asha Gift'))?.textContent.includes('Default')",
    );
    assert.equal([...addresses.values()].filter((item) => item.isDefault).length, 1);
    await evaluate(
      "[...document.querySelectorAll('main article')].find(el => el.textContent.includes('Asha Gift')).querySelectorAll('button')[1].click()",
    );
    await waitFor("!!document.querySelector('[role=alertdialog]')");
    assert.equal(
      await evaluate("document.activeElement.textContent.trim()"),
      "Keep address",
      "Destructive confirmation focuses the safe option",
    );
    failAddressDelete = true;
    await clickText("Remove address");
    await waitFor(
      "document.querySelector('[role=alertdialog] [role=alert]')?.textContent.includes('cannot be removed')",
    );
    assert(
      await evaluate("!!document.querySelector('[role=alertdialog]')"),
      "Failed deletion preserves the dialog",
    );
    failAddressDelete = false;
    await clickText("Remove address");
    await waitFor(
      "!document.querySelector('[role=alertdialog]') && !document.querySelector('main')?.textContent.includes('Asha Gift')",
    );
    await clickText("Add address");
    await waitFor("!!document.querySelector('[role=dialog]')");
    await command("Input.dispatchKeyEvent", {
      type: "keyDown",
      key: "Escape",
      code: "Escape",
      windowsVirtualKeyCode: 27,
    });
    await command("Input.dispatchKeyEvent", {
      type: "keyUp",
      key: "Escape",
      code: "Escape",
      windowsVirtualKeyCode: 27,
    });
    await waitFor("!document.querySelector('[role=dialog]')");
    await waitFor(
      "document.activeElement.textContent.trim() === 'Add address'",
      "Address dialog focus restoration",
    );
    assert.equal(
      await evaluate("document.activeElement.textContent.trim()"),
      "Add address",
      "Address dialog restores focus",
    );
    console.log(
      "PASS address create/edit/default/delete, native validation, failure recovery, and dialog focus",
    );

    await go("/account?tab=orders");
    await waitFor("!!document.querySelector('main input[name=account-order-search]')");
    await fill("account-order-search", "does not exist");
    await waitFor(
      "document.querySelector('main')?.textContent.includes('No orders match')",
    );
    await fill("account-order-search", "Fixture keepsake");
    await waitFor(
      "document.querySelector('main')?.textContent.includes('Fixture keepsake product') && !document.querySelector('main')?.textContent.includes('Another fixture product')",
    );
    await fill("account-order-search", "");
    await evaluate(
      "(() => { const select = document.querySelector('main select'); select.value = 'DELIVERED'; select.dispatchEvent(new Event('change', {bubbles:true})); })()",
    );
    await waitFor(
      "!document.querySelector('main')?.textContent.includes('Another fixture product')",
    );
    await evaluate("document.querySelector('main details summary').click()");
    await waitFor(
      "document.querySelector('main details[open]')?.textContent.includes('Order summary')",
    );
    assert(
      await evaluate(
        "document.querySelector('main details[open]')?.textContent.includes('12 Test Lane')",
      ),
    );
    assert(
      await evaluate(
        "!!document.querySelector('main a[href=\"https://tracking.example.invalid/TEST-AWB-001\"]')",
      ),
    );
    await go("/account?tab=albums");
    await waitFor(
      "document.querySelector('main')?.textContent.includes('Our coastal weekend')",
    );
    assert.equal(
      await evaluate(
        "document.querySelector('main a[href*=\"/projects/11111111\"]').origin",
      ),
      "http://localhost:3001",
    );
    await clickText("Load more albums");
    await waitFor(
      "document.querySelector('main')?.textContent.includes('Family celebrations')",
    );
    assert.equal(
      events.filter((item) => item.path === "/api/studio/projects").at(-1).method,
      "GET",
    );
    console.log(
      "PASS order search/status/details/tracking and Studio album continuation/pagination",
    );

    for (const [tab, marker] of [
      ["albums", "No saved albums yet."],
      ["orders", "No orders yet."],
      ["addresses", "No saved addresses."],
    ]) {
      accountMode = "empty";
      await go("/account?tab=" + tab);
      await waitFor(
        "document.querySelector('main')?.textContent.includes(" +
          JSON.stringify(marker) +
          ")",
      );
      await assertAccountLayout(1440, tab);
      accountMode = "unavailable";
      await go("/account?tab=" + tab);
      await waitFor(
        "document.querySelector('main [role=alert]')?.textContent.includes('service unavailable')",
      );
      accountMode = "ready";
      await clickText("Try again");
      await waitFor(
        "!document.querySelector('main [role=alert]') && !document.querySelector('main [role=status]')?.textContent.includes('Loading your')",
      );
    }
    console.log(
      "PASS account empty states, independent API errors/retries, and responsive sections at 320–1440px",
    );

    user.hasPassword = false;
    await go("/account");
    await clickText("Sign out");
    await waitFor(
      "!!document.querySelector('main a[href=\"/login?redirect=/account\"]')",
    );
    await assertNavbar();
    for (const [route, tab] of [
      ["/account", null],
      ["/account?campaign=smoke", null],
      ["/account?tab=", null],
      ["/account?tab=unknown-section", null],
      ["/account?tab=overview", null],
      ...accountSections.map(([tab]) => ["/account?tab=" + tab, tab]),
    ]) {
      await go(route);
      await waitFor("!!document.querySelector('main a[href^=\"/login?\"]')");
      const redirect = tab ? encodeURIComponent("/account?tab=" + tab) : "/account";
      for (const destination of ["login", "register"])
        assert.equal(
          await evaluate(
            "document.querySelector('main a[href^=\"/" +
              destination +
              "?\"]')?.getAttribute('href')",
          ),
          "/" + destination + "?redirect=" + redirect,
          "Guest " + destination + " redirect at " + route,
        );
      assert.equal(
        await evaluate("document.querySelector('main h1').textContent.trim()"),
        "Your account",
        "Guest account heading at " + route,
      );
      assert(
        !(await evaluate(
          "document.querySelector('main').textContent.includes('Good times. In good company.')",
        )),
        "No old guest account marketing heading",
      );
    }
    await command("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    });
    await go("/account?tab=orders");
    await clickLink('main a[href^="/login?"]');
    await waitFor(
      "location.pathname === '/login' && !!document.querySelector('main input[name=phone]')",
    );
    assert.equal(
      await evaluate("new URLSearchParams(location.search).get('redirect')"),
      "/account?tab=orders",
      "Guest mobile Orders sign-in preserves the requested section",
    );
    await command("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: false,
    });
    console.log(
      "PASS guest account redirects discard invalid tabs and preserve all four valid sections, including mobile Orders",
    );
    await go("/login?redirect=" + encodeURIComponent("/account?tab=profile"));
    await fill("phone", "9999999999");
    await evaluate("document.querySelector('main input[name=legalConsent]').click()");
    await submit();
    await waitFor("!!document.querySelector('main input[name=code]')");
    await fill("code", "123456");
    await submit();
    await waitFor(
      "location.pathname === '/account' && document.querySelector('main details summary')?.textContent.includes('Backup password')",
    );
    await evaluate("document.querySelector('main details summary').click()");
    assert(
      !(await evaluate("!!document.querySelector('main input[name=currentPassword]')")),
      "Passwordless OTP users do not need a nonexistent password",
    );
    await fill("name", "Asha Passwordless");
    await fill("newPassword", "new-example-password");
    await fill("confirmation", "new-example-password");
    nameSaveDelay = 300;
    await submit();
    await submit("main details form");
    await waitFor(
      "document.querySelector('main details [role=status]')?.textContent.includes('Other sessions') && document.querySelector('main form [role=status]')?.textContent.includes('Your name')",
    );
    assert(
      await evaluate(
        "document.querySelector('main aside')?.textContent.includes('Asha Passwordless') && document.querySelector('main details summary')?.textContent.includes('Password') && !document.querySelector('main details summary')?.textContent.includes('Backup')",
      ),
    );
    await assertNavbar("Asha Passwordless");
    nameSaveDelay = 0;
    user.name = "Asha";
    console.log(
      "PASS passwordless SPA OTP metadata, backup-password creation, live navbar name, and signed-out section return",
    );

    if (!accountOnly) {
      // Cookie/session checks here use fixture accounts and never contact Meta.
      async function signOutFixture() {
        await go("/account");
        await clickText("Sign out");
        await waitFor(
          "!!document.querySelector('main a[href=\"/login?redirect=/account\"]')",
        );
        await assertNavbar();
      }
      async function startMobile(number, route = "/login") {
        await go(route);
        assert(
          await evaluate("!!document.querySelector('main input[name=phone]')"),
          "Mobile is the first sign-in step",
        );
        assert(
          !(await evaluate("!!document.querySelector('main input[name=password]')")),
          "No password on the first step",
        );
        await fill("phone", number);
        await evaluate("document.querySelector('main input[name=legalConsent]').click()");
        await submit();
      }
      await signOutFixture();
      await startMobile("+91 99999 99999", "/login?redirect=/support/tickets");
      await waitFor("!!document.querySelector('main input[name=code]')");
      assert.equal(
        events.filter((item) => item.path === "/api/auth/phone/start").at(-1).body.phone,
        "+919999999999",
      );
      await fill("code", "000000");
      await submit();
      await waitFor(
        "document.querySelector('main [role=alert]')?.textContent.includes('incorrect or expired')",
      );
      assert.equal(
        await evaluate("document.querySelector('main input[name=code]').value"),
        "",
      );
      await waitFor(
        "[...document.querySelectorAll('main button')].some(el => el.textContent.trim() === 'Send a new code' && !el.disabled)",
      );
      await clickText("Send a new code");
      await waitFor(
        "document.querySelector('main [role=status]')?.textContent.includes('new code')",
      );
      await fill("code", "123456");
      await submit();
      await waitFor(
        "location.pathname === '/support/tickets' && document.querySelector('main')?.textContent.includes('Our group trip album')",
      );
      const latest = events
        .filter((item) => item.path === "/api/auth/otp/request")
        .at(-1);
      assert.equal(latest.body.phone, "+919999999999");
      console.log(
        "PASS mobile-first sign-in, Indian number paste, wrong code, resend, and redirect",
      );
      await signOutFixture();

      shortChallenge = true;
      await startMobile("9999999999");
      await waitFor(
        "document.querySelector('main input[name=code]')?.getAttribute('aria-describedby')?.split(' ').some(id => document.getElementById(id)?.textContent.includes('expired'))",
      );
      assert(
        await evaluate("document.querySelector('main button[type=submit]').disabled"),
        "Expired codes cannot be submitted",
      );
      shortChallenge = false;
      await clickText("Change number");
      assert.equal(
        await evaluate("document.querySelector('main input[name=phone]').value"),
        "9999999999",
      );
      await fill("phone", "9999999997");
      await submit();
      await waitFor(
        "document.querySelector('main [role=alert]')?.textContent.includes('could not send')",
      );
      assert(
        await evaluate("!!document.querySelector('main input[name=phone]')"),
        "Delivery errors stay on the number step",
      );
      console.log("PASS code expiry, change number, and delivery error recovery");

      await startMobile("9999999998", "/register?redirect=/account");
      await waitFor("!!document.querySelector('main input[name=code]')");
      await fill("code", "123456");
      await submit();
      await waitFor("!!document.querySelector('main input[name=confirmation]')");
      await fill("name", "Asha New");
      await fill("email", "new@example.invalid");
      await fill("password", "example-password");
      await fill("confirmation", "different-password");
      const signupBefore = events.filter(
        (item) => item.path === "/api/auth/otp/complete-signup",
      ).length;
      await submit();
      await waitFor(
        "document.querySelector('main [role=alert]')?.textContent.includes('do not match')",
      );
      assert.equal(
        events.filter((item) => item.path === "/api/auth/otp/complete-signup").length,
        signupBefore,
      );
      await fill("confirmation", "example-password");
      await submit();
      await waitFor(
        "location.pathname === '/account' && location.search === '' && document.querySelector('#account-panel')?.getAttribute('aria-label') === 'Profile' && !!document.querySelector('#account-panel input[name=name]')",
      );
      console.log("PASS new customer phone proof, details validation, and signup");
      await signOutFixture();

      otpAvailable = false;
      await go("/login");
      await waitFor(
        "document.querySelector('main [role=status]')?.textContent.includes('temporarily unavailable')",
      );
      assert(
        await evaluate("document.querySelector('main button[type=submit]').disabled"),
      );
      await clickText("Sign in with a password");
      await clickText("Forgot password?");
      await waitFor(
        "document.querySelector('main h1')?.textContent.includes('A fresh start')",
      );
      await clickText("Back to sign in");
      await waitFor("!!document.querySelector('main input[name=phone]')");
      await clickText("Sign in with a password");
      await fill("email", "asha@example.invalid");
      await fill("password", "example-password");
      await evaluate("document.querySelector('main input[name=legalConsent]').click()");
      await submit();
      await waitFor(
        "location.pathname === '/account' && location.search === '' && document.querySelector('#account-panel')?.getAttribute('aria-label') === 'Profile' && !!document.querySelector('#account-panel input[name=name]')",
      );
      otpAvailable = true;
      console.log("PASS unavailable WhatsApp fallback");

      await go("/help");
      await waitFor(
        "document.querySelector('main')?.textContent.includes('Choosing photos')",
      );
      await fill("search", "doesnotexist");
      await submit();
      await waitFor(
        "document.querySelector('main')?.textContent.includes('No articles match')",
      );
      await go("/help/choosing-photos");
      await waitFor(
        "document.querySelector('main article')?.textContent.includes('Use your original photographs')",
      );
      console.log("PASS help search, empty state, and article");

      await go("/newsletter");
      await fill("email", "asha@example.invalid");
      await evaluate("document.querySelector('main input[name=consent]').click()");
      await submit();
      await waitFor(
        "document.querySelector('main [role=status]')?.textContent.includes('preference has been saved')",
      );
      const before = events.filter((item) => item.path.endsWith("/unsubscribe")).length;
      await go("/newsletter/unsubscribe#token=" + "a".repeat(64));
      assert.equal(
        events.filter((item) => item.path.endsWith("/unsubscribe")).length,
        before,
        "Opening an unsubscribe URL must not submit it",
      );
      await clickText("Unsubscribe");
      await waitFor(
        "document.querySelector('main')?.textContent.includes('unsubscribed from our newsletter')",
      );
      console.log("PASS newsletter and explicit unsubscribe confirmation");

      await command("Emulation.setDeviceMetricsOverride", {
        width: 390,
        height: 844,
        deviceScaleFactor: 1,
        mobile: true,
      });
      for (const route of [
        "/",
        "/products",
        "/products/layflat",
        "/about",
        "/occasions",
        "/contact",
        "/help",
        "/support/new",
        "/terms-and-conditions",
        "/account",
        "/login",
        "/register",
      ]) {
        await go(route);
        assert(
          await evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1"),
          "No horizontal overflow at " + route,
        );
        await assertNavbar(user.name);
        if (route === '/products/layflat') {
          await waitFor("document.body.textContent.includes('Photo quality & storage')");
          assert(await evaluate("document.body.textContent.includes('300 DPI') && document.body.textContent.includes('90 days')"), 'Admin policy appears on product page');
        }
      }
      await go("/login");
      const mobileAuth = await command("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: false,
      });
      await writeFile(
        path.join(artifacts, "auth-mobile.png"),
        Buffer.from(mobileAuth.data, "base64"),
      );
      await command("Emulation.setDeviceMetricsOverride", {
        width: 1440,
        height: 1000,
        deviceScaleFactor: 1,
        mobile: false,
      });
      const desktopAuth = await command("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: false,
      });
      await writeFile(
        path.join(artifacts, "auth-desktop.png"),
        Buffer.from(desktopAuth.data, "base64"),
      );
      await command("Emulation.setDeviceMetricsOverride", {
        width: 390,
        height: 844,
        deviceScaleFactor: 1,
        mobile: true,
      });
      await go("/contact");
      const mobile = await command("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: false,
      });
      await writeFile(
        path.join(artifacts, "contact-mobile.png"),
        Buffer.from(mobile.data, "base64"),
      );
      await evaluate(
        "document.querySelector('button[aria-controls=mobile-navigation]').click()",
      );
      await waitFor("document.querySelector('#mobile-navigation')?.hidden === false");
      await evaluate(
        "document.querySelector('button[aria-controls=mobile-navigation]').click()",
      );
      await evaluate(
        "[...document.querySelectorAll('footer button')].find(button => button.textContent.trim() === 'Cookie settings').focus()",
      );
      await clickText("Cookie settings");
      await waitFor("!!document.querySelector('[role=dialog]')");
      await waitFor(
        "document.querySelector('[role=dialog]').contains(document.activeElement)",
      );
      assert(
        await evaluate(
          "document.querySelector('[role=dialog]').getAttribute('aria-labelledby')?.split(' ').some(id => document.getElementById(id)?.textContent.includes('Your cookie choices'))",
        ),
        "Dialog has an accessible name",
      );
      assert(
        await evaluate(
          "document.querySelector('[role=dialog] input[name=essential]').disabled",
        ),
        "Essential cookies cannot be disabled",
      );
      assert(
        await evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1"),
        "Dialog fits mobile screen",
      );
      const dialogCapture = await command("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: false,
      });
      await writeFile(
        path.join(artifacts, "cookie-dialog-mobile.png"),
        Buffer.from(dialogCapture.data, "base64"),
      );
      await evaluate("document.querySelector('[role=dialog] a').focus()");
      await command("Input.dispatchKeyEvent", {
        type: "keyDown",
        key: "Tab",
        code: "Tab",
        windowsVirtualKeyCode: 9,
      });
      await command("Input.dispatchKeyEvent", {
        type: "keyUp",
        key: "Tab",
        code: "Tab",
        windowsVirtualKeyCode: 9,
      });
      assert(
        await evaluate(
          "document.querySelector('[role=dialog]').contains(document.activeElement)",
        ),
        "Tab stays inside the dialog",
      );
      await evaluate(
        "document.querySelector('[role=dialog] input[name=analytics]').click()",
      );
      await clickText("Save my choices");
      await waitFor(
        "document.querySelector('[role=dialog] [role=status]')?.textContent.includes('saved')",
      );
      assert(
        await evaluate(
          "JSON.parse(localStorage.getItem('albumo-cookie-preferences')).preferences.analytics === true",
        ),
        "Cookie choice is persisted",
      );

      await command("Input.dispatchKeyEvent", {
        type: "keyDown",
        key: "Escape",
        code: "Escape",
        windowsVirtualKeyCode: 27,
      });
      await command("Input.dispatchKeyEvent", {
        type: "keyUp",
        key: "Escape",
        code: "Escape",
        windowsVirtualKeyCode: 27,
      });
      await waitFor("!document.querySelector('[role=dialog]')");
      await waitFor("document.activeElement?.textContent.trim() === 'Cookie settings'");
      console.log(
        "PASS mobile layouts, navigation, dialog focus trapping, focus restoration and consent persistence",
      );
    } else {
      await go("/account");
      await clickText("Sign out");
      await waitFor(
        "!!document.querySelector('main a[href=\"/login?redirect=/account\"]')",
      );
      assert(
        !(await evaluate(
          "document.querySelector('main')?.textContent.includes('Our coastal weekend')",
        )),
        "Sign-out clears private account collections",
      );
      await assertNavbar();
    }
  }
  if (!accountOnly) {
    if (footerSocialCase === "default") await runFooterSmoke();
    else await runFooterSocialSmoke();
  }
  assert.equal(pageErrors.length, 0, pageErrors.join("\n"));
  await writeFile(
    path.join(
      artifacts,
      footerOnly
        ? footerSocialCase === "default"
          ? "footer-browser-result.json"
          : "footer-social-" + footerSocialCase + "-result.json"
        : accountOnly
          ? "account-browser-result.json"
          : "browser-result.json",
    ),
    JSON.stringify(
      {
        passed: true,
        suite: footerOnly ? "footer" : accountOnly ? "account" : "storefront",
        ...(footerOnly ? { socialScenario: footerSocialCase } : {}),
        requests: events.length,
        skippedChecks,
        screenshots: footerOnly
          ? footerSocialCase === "default"
            ? footerScreenshots
            : []
          : accountOnly
            ? [
                "account-1440.png",
                "account-390.png",
                "account-orders-390.png",
                "navbar-guest-390.png",
              ]
            : [
                "account-1440.png",
                "account-390.png",
                "account-orders-390.png",
                "navbar-guest-390.png",
                "home-1440.png",
                "home-390.png",
                "collection-1440.png",
                "collection-390.png",
                "product-1440.png",
                "product-390.png",
                "contact-desktop.png",
                "contact-mobile.png",
                "auth-desktop.png",
                "auth-mobile.png",
                "cookie-dialog-mobile.png",
                ...footerScreenshots,
              ],
      },
      null,
      2,
    ),
  );
  console.log("Browser checks passed.");
} finally {
  socket?.close();
  if (chrome) chrome.kill();
  next.kill();
  fixture.closeAllConnections();
  await new Promise((resolve) => fixture.close(resolve));
  await writeFile(path.join(artifacts, "preview.log"), nextLog);
  const configPath = path.join(root, "tsconfig.json");
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  config.include = config.include.filter((value) => !value.startsWith(".next-smoke/"));
  await writeFile(configPath, JSON.stringify(config, null, 2) + "\n");
  if (readFileSync(path.join(root, "next-env.d.ts"), "utf8").includes(".next-smoke"))
    await writeFile(path.join(root, "next-env.d.ts"), originalNextEnv);
}
