import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
const root = process.cwd(),
  artifacts = path.join(root, ".artifacts"),
  origin = "http://localhost:3112",
  api = "http://localhost:4112";
await mkdir(artifacts, { recursive: true });
const originalConfig = readFileSync(path.join(root, "tsconfig.json"), "utf8");
const originalEnv = readFileSync(path.join(root, "next-env.d.ts"), "utf8");
const pic =
  "data:image/svg+xml;base64," +
  Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="600" height="600" fill="#e6d9c3"/><circle cx="300" cy="220" r="100" fill="#c63f65"/><path d="M0 600L250 280L600 600" fill="#557367"/></svg>',
  ).toString("base64");
const options = [
  { kind: "dimension", label: "Size", value: "8 x 8 in", width: 8, height: 8 },
  { label: "Cover", value: "Hard cover" },
  { label: "Paper", value: "Matte" },
  { label: "Pages", value: "20 pages" },
];
const design = {
  title: "Our summer",
  revision: 3,
  configuration: { options },
  document: {
    template: "travel",
    cover: { title: "Our summer", photo: { assetId: "photo", x: 50, y: 50 } },
    pages: Array.from({ length: 20 }, (_, i) => ({
      id: String(i),
      caption: "A moment worth keeping.",
      photos: [{ assetId: "photo", x: 50, y: 50 }],
    })),
  },
  photos: [{ id: "photo", previewUrl: pic }],
};
let lines = [
    {
      id: "album",
      kind: "album",
      productId: "product",
      name: "Everyday album",
      quantity: 1,
      unitPriceCents: 19000,
      totalCents: 19000,
      version: 1,
      projectId: "project",
      revision: 3,
      albumTitle: "Our summer",
      options,
      imageUrl: pic,
      issues: [],
    },
  ],
  order = null,
  createCalls = 0,
  paymentCalls = 0,
  guest = false;
const address = {
  id: "address",
  name: "Asha",
  phone: "9876543210",
  line1: "12 Test Road",
  line2: "",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "400001",
  country: "India",
  isDefault: true,
};
const quote = () => ({
  lines,
  subtotalCents: lines.reduce((n, l) => n + l.totalCents, 0),
  shippingCents: 5000,
  discountCents: 0,
  totalCents: lines.reduce((n, l) => n + l.totalCents, 0) + 5000,
  quoteHash: "a".repeat(64),
  policyVersion: "2026-09-02",
  couponLabel: null,
});
const fixture = createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "content-type,x-csrf-token");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
  if (req.method === "OPTIONS") return res.writeHead(204).end();
  res.setHeader("Content-Type", "application/json");
  const send = (data, status = 200) => {
    res.statusCode = status;
    res.end(
      JSON.stringify({
        success: status < 400,
        ...(status < 400 ? { data } : { error: data }),
      }),
    );
  };
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const body = chunks.length ? JSON.parse(Buffer.concat(chunks)) : {};
  if (req.url === "/api/auth/me")
    return guest
      ? send("Sign in", 401)
      : send({
          id: "fixture",
          name: "Asha",
          email: "asha@example.invalid",
          role: "STUDENT",
          emailVerified: true,
        });
  if (req.url === "/api/auth/refresh") return send("Sign in", 401);
  if (req.url === "/api/auth/csrf-token") return send({ csrfToken: "fixture" });
  if (req.url === "/api/components/catalogue/categories") return send([]);
  if (req.url === "/api/components/catalogue")
    return send({ categories: [], products: [] });
  if (req.url === "/api/addresses") return send([address]);
  if (req.url === "/api/checkout/albums/album" && req.method === "PATCH") {
    lines =
      body.quantity === null
        ? []
        : lines.map((l) => ({
            ...l,
            quantity: body.quantity,
            totalCents: 19000 * body.quantity,
            version: l.version + 1,
          }));
    return send({ updated: true });
  }
  if (req.url === "/api/checkout/cart" || req.url === "/api/checkout/quote")
    return send(quote());
  if (req.url?.endsWith("/design") && req.url.startsWith("/api/checkout/"))
    return send(design);
  if (req.url === "/api/checkout/orders" && req.method === "POST") {
    createCalls++;
    assert.equal(body.shippingAddressId, "address");
    assert.equal(body.designAccepted, true);
    assert.equal(body.legalConsent.accepted, true);
    order = {
      id: "order-fixture",
      status: "PENDING_PAYMENT",
      totalAmountCents: quote().totalCents,
      address,
      checkoutAttempt: { summary: quote() },
      trackingAwb: null,
      trackingUrl: null,
      payments: [{ status: "CREATED" }],
      items: lines.map((l) => ({
        id: "item",
        description: l.name,
        quantity: l.quantity,
        subtotalCents: l.totalCents,
        album: { title: l.albumTitle, revision: l.revision, options: l.options },
      })),
    };
    lines = [];
    return send("Response interrupted after order was saved", 502);
  }
  if (req.url?.startsWith("/api/checkout/attempts/"))
    return order ? send({ orderId: order.id }) : send("No order", 404);
  if (req.url === "/api/checkout/orders/order-fixture")
    return order ? send(order) : send("No order", 404);
  if (req.url === "/api/payments/order-fixture/initiate") {
    paymentCalls++;
    return send("Payment provider temporarily unavailable. Try again.", 503);
  }
  if (req.url?.startsWith("/api/legal/")) return send({});
  return send("Fixture route unavailable", 404);
});
await new Promise((r) => fixture.listen(4112, "127.0.0.1", r));
const next = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "dev", "--webpack", "--port", "3112"],
  {
    cwd: root,
    windowsHide: true,
    env: {
      ...process.env,
      NODE_ENV: "development",
      NODE_OPTIONS: "--max-old-space-size=640",
      ALBUMO_TEST_MODE: "1",
      ALBUMO_API_URL: api,
      NEXT_PUBLIC_API_URL: api,
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let log = "",
  chrome,
  socket;
next.stdout.on("data", (c) => (log += c));
next.stderr.on("data", (c) => (log += c));
async function until(fn, label, count = 240) {
  for (let i = 0; i < count; i++) {
    if (await fn()) return;
    await delay(250);
  }
  throw new Error("Timed out: " + label);
}
try {
  await until(async () => {
    try {
      return (await fetch(origin + "/cart")).ok;
    } catch {
      return false;
    }
  }, "Storefront ready");
  const binary = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  ].find(existsSync);
  assert(binary);
  const profile = path.join(artifacts, "checkout-browser-" + Date.now());
  chrome = spawn(
    binary,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--remote-debugging-port=0",
      "--user-data-dir=" + profile,
      "about:blank",
    ],
    { windowsHide: true, stdio: "ignore" },
  );
  const portFile = path.join(profile, "DevToolsActivePort");
  let port;
  await until(() => {
    try {
      port = readFileSync(portFile, "utf8").split(/\r?\n/)[0];
      return /^\d+$/.test(port);
    } catch {
      return false;
    }
  }, "Chrome port");
  const target = await (
    await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })
  ).json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r, j) => {
    socket.addEventListener("open", r, { once: true });
    socket.addEventListener("error", j, { once: true });
  });
  // Browser checkout regression fixture.
  let id = 0;
  const pending = new Map(),
    errors = [];
  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    if (data.method === "Runtime.exceptionThrown")
      errors.push(
        data.params.exceptionDetails.exception?.description ||
          data.params.exceptionDetails.text,
      );
    const entry = pending.get(data.id);
    if (entry) {
      clearTimeout(entry.timer);
      pending.delete(data.id);
      if (data.error) entry.reject(new Error(data.error.message));
      else entry.resolve(data.result);
    }
  });
  function command(method, params = {}) {
    return new Promise((resolve, reject) => {
      const requestId = ++id;
      const timer = setTimeout(() => {
        pending.delete(requestId);
        reject(new Error("CDP timeout: " + method));
      }, 60_000);
      pending.set(requestId, { resolve, reject, timer });
      socket.send(JSON.stringify({ id: requestId, method, params }));
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

  const waitFor = (expression, label = expression) =>
    until(() => evaluate(expression), label);
  const click = async (label) => {
    await waitFor(
      `Array.from(document.querySelectorAll('button')).some(b=>b.textContent.trim()===${JSON.stringify(label)}&&!b.disabled)`,
    );
    await evaluate(
      `Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()===${JSON.stringify(label)}).click()`,
    );
  };
  const fill = async (selector, value) =>
    evaluate(
      `(()=>{const e=document.querySelector(${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(e.tagName==='SELECT'?HTMLSelectElement.prototype:e.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event(e.tagName==='SELECT'?'change':'input',{bubbles:true}));})()`,
    );
  await command("Runtime.enable");
  await command("Page.enable");
  await command("Emulation.setFocusEmulationEnabled", { enabled: true });

  for (const width of [1440, 390, 320]) {
    await command("Emulation.setDeviceMetricsOverride", {
      width,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: width < 800,
    });
    await command("Page.navigate", { url: origin + "/cart" });
    await waitFor(`document.querySelector('main')?.textContent.includes('Our summer')`);
    await delay(300);
    assert(
      await evaluate("document.documentElement.scrollWidth<=innerWidth+1"),
      "Cart overflow " + width,
    );
    const shot = await command("Page.captureScreenshot", { format: "png" });
    await writeFile(
      path.join(artifacts, "checkout-cart-" + width + ".png"),
      Buffer.from(shot.data, "base64"),
    );
  }
  await click("Review saved design");
  await waitFor(`document.querySelector('main')?.textContent.includes('Page 20')`);
  assert(
    await evaluate(`document.querySelector('.saved-design .template-travel')!==null`),
  );
  await click("Close saved design");
  await fill("main select", "2");
  await until(() => lines[0].quantity === 2, "Quantity changed");
  await command("Page.navigate", { url: origin + "/checkout" });
  await waitFor(
    `document.querySelector('main')?.textContent.includes('Delivery address')`,
  );
  assert(
    await evaluate("document.documentElement.scrollWidth<=innerWidth+1"),
    "Checkout overflow 320",
  );
  await fill("main select", "address");
  await evaluate(
    `document.querySelectorAll('main input[type=checkbox]').forEach(e=>e.click())`,
  );
  await click("Place order");
  await waitFor(`location.pathname==='/orders/order-fixture'`);
  await waitFor(
    `document.querySelector('main')?.textContent.includes('pending payment')`,
  );
  assert.equal(createCalls, 1);
  await command("Page.navigate", {
    url: origin + "/checkout/success?orderId=order-fixture",
  });
  await waitFor(
    `document.querySelector('main')?.textContent.includes('pending payment')`,
  );
  assert(
    !(await evaluate(
      `document.querySelector('main')?.textContent.includes('Payment confirmed.')`,
    )),
  );
  await evaluate(
    `Array.from(document.querySelectorAll('button')).find(b=>b.textContent.startsWith('Pay ')).click()`,
  );
  await waitFor(
    `document.querySelector('[role=alert]')?.textContent.includes('temporarily unavailable')`,
  );
  assert.equal(paymentCalls, 1);
  assert.equal(createCalls, 1);
  order.status = "PAID";
  await command("Page.navigate", { url: origin + "/orders/order-fixture" });
  await waitFor(
    `document.querySelector('main')?.textContent.includes('Payment confirmed.')`,
  );
  await click("Review saved design");
  await waitFor(`document.querySelector('main')?.textContent.includes('Page 20')`);
  for (const width of [1440, 390]) {
    await command("Emulation.setDeviceMetricsOverride", {
      width,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: width < 800,
    });
    assert(
      await evaluate("document.documentElement.scrollWidth<=innerWidth+1"),
      "Order overflow",
    );
    const shot = await command("Page.captureScreenshot", { format: "png" });
    await writeFile(
      path.join(artifacts, "checkout-order-" + width + ".png"),
      Buffer.from(shot.data, "base64"),
    );
  }
  await command("Page.navigate", { url: origin + "/cart" });
  await waitFor(
    `document.querySelector('main')?.textContent.includes('A story is waiting')`,
  );
  guest = true;
  await command("Page.navigate", { url: origin + "/cart" });
  await waitFor(
    `document.querySelector('main')?.textContent.includes('Sign in to continue')`,
  );
  assert.equal(errors.length, 0, errors.join("\n"));
  console.log(
    "PASS: responsive cart, saved design, quantity, delivery, lost-response recovery, payment retry, verified status, empty cart and sign-in gate.",
  );
} finally {
  socket?.close();
  for (const child of [chrome, next])
    if (child?.pid)
      spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
        windowsHide: true,
        stdio: "ignore",
      });
  fixture.closeAllConnections();
  await new Promise((r) => fixture.close(r));
  await writeFile(path.join(root, "next-env.d.ts"), originalEnv);
  await writeFile(path.join(root, "tsconfig.json"), originalConfig);
  await writeFile(path.join(artifacts, "checkout-browser.log"), log);
}
