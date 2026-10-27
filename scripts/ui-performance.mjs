// Local production comparison. API requests are intercepted; no real accounts are used.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { setTimeout as delay } from "node:timers/promises";

const label = process.argv[2];
assert(/^[a-z0-9-]+$/.test(label || ""), "Pass a result label, for example before-ui.");
const root = process.cwd();
const origin = "http://localhost:3109";
const artifacts = path.join(root, ".artifacts", "ui-performance");
await mkdir(artifacts, { recursive: true });
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "--port", "3109"],
  {
    cwd: root,
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let log = "";
server.stdout.on("data", (chunk) => {
  log += chunk;
});
server.stderr.on("data", (chunk) => {
  log += chunk;
});
let browser, socket;
try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(origin)).ok) {
        ready = true;
        break;
      }
    } catch {}
    if (server.exitCode !== null) throw Error(log);
    await delay(500);
  }
  assert(ready, "Production server did not start");
  const executable = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  ].find((file) => file && existsSync(file));
  assert(executable, "Chrome or Edge is required");
  browser = spawn(
    executable,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--remote-debugging-port=0",
      "--user-data-dir=" + path.join(artifacts, "profile-" + process.pid),
      "about:blank",
    ],
    { windowsHide: true, stdio: ["ignore", "ignore", "pipe"] },
  );
  const endpoint = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Error("Browser startup timeout")), 20000);
    browser.stderr.on("data", (chunk) => {
      const match = String(chunk).match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]);
      }
    });
  });
  const debug = new URL(endpoint);
  debug.protocol = "http:";
  const target = await (
    await fetch(debug.origin + "/json/new?about:blank", { method: "PUT" })
  ).json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  let id = 0;
  const pending = new Map();
  function command(method, params = {}) {
    return new Promise((resolve, reject) => {
      const requestId = ++id;
      const timer = setTimeout(() => {
        pending.delete(requestId);
        reject(Error("CDP timeout: " + method));
      }, 30000);
      pending.set(requestId, { resolve, reject, timer });
      socket.send(JSON.stringify({ id: requestId, method, params }));
    });
  }
  socket.addEventListener("message", async (event) => {
    const message = JSON.parse(event.data);
    if (pending.has(message.id)) {
      const item = pending.get(message.id);
      pending.delete(message.id);
      clearTimeout(item.timer);
      message.error
        ? item.reject(Error(message.error.message))
        : item.resolve(message.result);
    }
    if (message.method === "Fetch.requestPaused") {
      const request = message.params;
      const pathname = new URL(request.request.url).pathname;
      let data = {};
      let status = 200;
      if (pathname === "/api/contact/settings")
        data = {
          email: "hello@example.invalid",
          newsletterEnabled: true,
          phone: "",
          whatsapp: "",
          hours: "",
        };
      else if (pathname === "/api/auth/config")
        data = { google: false, github: false, whatsappOtp: true };
      else if (pathname === "/api/auth/csrf-token") data = { csrfToken: "local-only" };
      else if (pathname === "/api/auth/me" || pathname === "/api/auth/refresh")
        status = 401;
      await command("Fetch.fulfillRequest", {
        requestId: request.requestId,
        responseCode: status,
        responseHeaders: [
          { name: "Content-Type", value: "application/json" },
          { name: "Access-Control-Allow-Origin", value: origin },
          { name: "Access-Control-Allow-Credentials", value: "true" },
          { name: "Access-Control-Allow-Headers", value: "content-type,x-csrf-token" },
        ],
        body: Buffer.from(
          JSON.stringify({
            success: status === 200,
            data,
            error: status === 401 ? "Sign in" : undefined,
          }),
        ).toString("base64"),
      });
    }
  });
  async function evaluate(expression) {
    const result = await command("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails) throw Error(result.exceptionDetails.text);
    return result.result.value;
  }
  await command("Page.enable");
  await command("Runtime.enable");
  await command("Network.enable");
  await command("Fetch.enable", { patterns: [{ urlPattern: "*/api/*" }] });
  await command("Network.setCacheDisabled", { cacheDisabled: true });
  await command("Network.emulateNetworkConditions", {
    offline: false,
    latency: 80,
    downloadThroughput: 200000,
    uploadThroughput: 93750,
    connectionType: "cellular4g",
  });
  await command("Emulation.setCPUThrottlingRate", { rate: 4 });
  await command("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await command("Page.addScriptToEvaluateOnNewDocument", {
    source: `window.__uiMetrics = { lcp: 0, blocking: 0 };
    new PerformanceObserver(list => { for (const item of list.getEntries()) window.__uiMetrics.lcp = item.startTime; }).observe({type:"largest-contentful-paint", buffered:true});
    new PerformanceObserver(list => { for (const item of list.getEntries()) window.__uiMetrics.blocking += Math.max(0,item.duration-50); }).observe({type:"longtask", buffered:true});`,
  });
  const routes = {};
  for (const route of ["/", "/login"]) {
    const html = await (await fetch(origin + route)).text();
    const assets = [
      ...new Set(
        [...html.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+\.(?:js|css))"/g)].map(
          (match) => match[1],
        ),
      ),
    ];
    const sizes = { javascriptGzipBytes: 0, cssGzipBytes: 0 };
    for (const asset of assets) {
      const bytes = await readFile(
        path.join(root, ".next", asset.replace("/_next/", "")),
      );
      sizes[asset.endsWith(".js") ? "javascriptGzipBytes" : "cssGzipBytes"] +=
        gzipSync(bytes).length;
    }
    const samples = [];
    for (let sample = 0; sample < 3; sample++) {
      await command("Network.clearBrowserCache");
      await command("Page.navigate", { url: origin + route });
      let loaded = false;
      for (let i = 0; i < 180; i++) {
        if (
          await evaluate(
            "location.pathname === " +
              JSON.stringify(route) +
              ' && document.readyState === "complete" && !!document.querySelector("main h1") && !!document.querySelector("section[aria-label=\\"Cookie preferences\\"]")',
          )
        ) {
          loaded = true;
          break;
        }
        await delay(250);
      }
      assert(loaded, "Page did not hydrate: " + route);
      await delay(1000);
      samples.push(
        await evaluate(
          '({fcp: performance.getEntriesByName("first-contentful-paint")[0]?.startTime, lcp: window.__uiMetrics.lcp, blocking: window.__uiMetrics.blocking})',
        ),
      );
    }
    const median = (key) => samples.map((item) => item[key]).sort((a, b) => a - b)[1];
    routes[route] = {
      ...sizes,
      medianFcpMs: median("fcp"),
      medianLcpMs: median("lcp"),
      medianObservedBlockingMs: median("blocking"),
      samples,
    };
    console.log(label, route, JSON.stringify(routes[route]));
  }
  const result = {
    label,
    buildId: (await readFile(".next/BUILD_ID", "utf8")).trim(),
    measuredAt: new Date().toISOString(),
    method:
      "3 cold-browser samples per route, production build, 390x844, 4x CPU slowdown, 1.6 Mbps download/80ms latency; API intercepted. Local lab comparison, not field Core Web Vitals. Gzip sizes cover initial HTML-linked JS/CSS; observed blocking is not Lighthouse TBT.",
    routes,
  };
  await writeFile(path.join(artifacts, label + ".json"), JSON.stringify(result, null, 2));
} finally {
  socket?.close();
  browser?.kill();
  server.kill();
  await writeFile(path.join(artifacts, label + "-server.log"), log);
}
