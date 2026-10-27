// Isolated admin catalogue checks. No real backend or credentials are loaded.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
const root = path.resolve(process.cwd(), "../admin-frontend");
const originalNextEnv = readFileSync(path.join(root, "next-env.d.ts"), "utf8");
const apiPort = 4106,
  webPort = 3110,
  origin = "http://localhost:" + webPort;
const adminCategories = [
  {
    id: "albums",
    name: "Photo Albums",
    description: "",
    imageUrl: "",
    isActive: true,
    subcategories: [],
  },
];
const adminProducts = [];
const fixture = createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "content-type,x-csrf-token");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  if (req.method === "OPTIONS") return res.writeHead(204).end();
  let raw = "";
  for await (const chunk of req) raw += chunk;
  const body = raw ? JSON.parse(raw) : {};
  const url = new URL(req.url, "http://localhost");
  const send = (value, status = 200) =>
    res
      .writeHead(status, { "content-type": "application/json" })
      .end(JSON.stringify(value));
  const ok = (data) => send({ success: true, data });
  if (req.method !== "GET" && req.headers["x-csrf-token"] !== "fixture-csrf")
    return send({ error: "CSRF missing" }, 403);
  if (url.pathname === "/api/auth/csrf-token") return ok({ csrfToken: "fixture-csrf" });
  if (url.pathname === "/api/auth/me")
    return ok({
      role: "ADMIN",
      name: "Catalogue reviewer",
      email: "admin@example.invalid",
    });
  if (url.pathname === "/api/categories/manage") return ok(adminCategories);
  if (url.pathname === "/api/components/manage") {
    const data = adminProducts.filter(
      (p) => String(p.isActive) === url.searchParams.get("isActive"),
    );
    return send({
      success: true,
      data,
      pagination: { page: 1, totalPages: 1, total: data.length },
    });
  }
  if (url.pathname === "/api/categories/albums/subcategories" && req.method === "POST") {
    const category = { ...body, id: "cmg00000000000000000000001", categoryId: "albums" };
    adminCategories[0].subcategories.push(category);
    return ok(category);
  }
  if (url.pathname === "/api/components" && req.method === "POST") {
    const product = {
      ...body,
      id: "product-test",
      slug: "adventure-photo-album",
      sku: null,
      discountedPriceCents: body.discountedPriceCents ?? null,
    };
    adminProducts.push(product);
    return ok(product);
  }
  if (url.pathname === "/api/components/manage/product-test") return ok(adminProducts[0]);
  if (url.pathname === "/api/components/manage/product-test/media") return ok([]);
  if (url.pathname === "/api/components/product-test" && req.method === "PATCH") {
    Object.assign(adminProducts[0], body);
    return ok(adminProducts[0]);
  }
  return send({ error: "Unknown fixture route" }, 404);
});
await new Promise((resolve) => fixture.listen(apiPort, "localhost", resolve));
const artifacts = path.join(root, ".artifacts", "catalogue-qa");
await mkdir(artifacts, { recursive: true });
const next = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "dev", "--webpack", "--port", String(webPort)],
  {
    cwd: root,
    windowsHide: true,
    env: {
      ...process.env,
      ALBUMO_TEST_MODE: "1",
      NEXT_PUBLIC_API_URL: "http://localhost:" + apiPort,
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
      const res = await fetch(origin + "/categories");
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
      data.error
        ? entry.reject(new Error(data.error.message))
        : entry.resolve(data.result);
    }
  });
  function command(method, params = {}) {
    const id = ++nextId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error("CDP timeout: " + method));
      }, 25_000);
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
    await delay(200);
  };
  async function fill(name, value) {
    await evaluate(
      "(() => { const el = document.querySelector('main [name=" +
        JSON.stringify(name) +
        "]'); if(!el) throw new Error('Missing field'); const prototype = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(prototype, 'value').set.call(el, " +
        JSON.stringify(value) +
        "); el.dispatchEvent(new Event('input', {bubbles:true})); el.dispatchEvent(new Event('change', {bubbles:true})); })()",
    );
  }
  async function submit() {
    await evaluate(
      "(() => { const form = document.querySelector('main form'); if(!form.reportValidity()) throw new Error('Invalid fixture form'); form.requestSubmit(); })()",
    );
  }
  const clickText = (text) =>
    evaluate(
      "(() => { const button = [...document.querySelectorAll('button, main a')].find(el => el.textContent.trim() === " +
        JSON.stringify(text) +
        "); if(!button) throw new Error('Missing action'); button.click(); })()",
    );
  await command("Runtime.enable");
  await command("Page.enable");
  await command("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });

  async function field(label, value) {
    await evaluate(
      "(() => {const label=[...document.querySelectorAll('main label')].find(el=>el.textContent.trim().toLowerCase().startsWith(" +
        JSON.stringify(label.toLowerCase()) +
        "));const el=label?.querySelector('input,textarea,select');if(!el)throw Error('Missing labelled control');const proto=el.tagName==='SELECT'?HTMLSelectElement.prototype:el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(el," +
        JSON.stringify(value) +
        ");el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));})()",
    );
    await delay(150);
  }
  const capture = async (name) => {
    const shot = await command("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: false,
    });
    await writeFile(
      path.join(artifacts, name + ".png"),
      Buffer.from(shot.data, "base64"),
    );
  };
  await go("/categories");
  await waitFor("document.querySelector('main').textContent.includes('Photo Albums')");
  await clickText("Add category");
  await field("Name", "Adventure Books");
  await field("Add an option group", "dimension");
  await field("Choice 1", "Square 8 x 8");
  await field("Width", "8");
  await field("Height", "8");
  await field("Extra price", "250");
  assert(
    await evaluate(
      "getComputedStyle(document.querySelector('main form button:not([type])')).backgroundColor !== 'rgba(0, 0, 0, 0)'",
    ),
    "Primary save button has a visible background",
  );
  await capture("category-preset-desktop");
  await clickText("Save changes");
  await waitFor("!document.querySelector('main form')");
  assert.equal(
    adminCategories[0].subcategories.at(-1).configuration.groups[0].options[0]
      .priceAdjustmentCents,
    25000,
  );
  await go("/products/new");
  await field("Product name", "Adventure Photo Album");
  await waitFor(
    "[...document.querySelectorAll('main option')].some(el=>el.value==='albums')",
  );
  await field("Super category", "albums");
  await field("Category", "cmg00000000000000000000001");
  await waitFor(
    "document.querySelector('main').textContent.includes('Square 8 x 8') || [...document.querySelectorAll('main input')].some(el=>el.value==='Square 8 x 8')",
  );
  await field("Base price", "1000");
  await capture("product-editor-desktop");
  await clickText("Save draft");
  await waitFor("location.pathname==='/products'");
  assert.equal(adminProducts.length, 1);
  assert.equal(adminProducts[0].subcategoryId, "cmg00000000000000000000001");
  assert.equal(adminProducts[0].configuration.groups[0].options[0].width, 8);
  assert.equal(adminProducts[0].isActive, false);
  await go("/products/product-test");
  await waitFor(
    "[...document.querySelectorAll('main input')].some(el=>el.value==='Adventure Photo Album')",
  );
  await field("Extra price", "350");
  await command("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await delay(500);
  await waitFor("document.querySelector('aside').getBoundingClientRect().right <= 1");
  await capture("product-editor-mobile");
  assert(
    await evaluate("document.documentElement.scrollWidth <= innerWidth + 1"),
    "Mobile admin form overflow",
  );
  await clickText("Save product");
  await waitFor("location.pathname==='/products'");
  assert.equal(
    adminProducts[0].configuration.groups[0].options[0].priceAdjustmentCents,
    35000,
  );
  assert.equal(
    adminCategories[0].subcategories.at(-1).configuration.groups[0].options[0]
      .priceAdjustmentCents,
    25000,
    "Editing product does not mutate category preset",
  );
  assert.equal(pageErrors.length, 0, pageErrors.join("\n"));
  console.log(
    "PASS admin category preset, product create/edit persistence, draft media and mobile form layout",
  );
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
