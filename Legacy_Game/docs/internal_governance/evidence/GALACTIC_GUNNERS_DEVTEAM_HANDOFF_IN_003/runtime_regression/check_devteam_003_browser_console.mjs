import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const evidenceDir = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, "$1");
const chromePath = process.env.GG_CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const cdpPort = process.env.GG_DOCKER_CDP_PORT || "9237";
const runtimeUrl = process.env.GG_DOCKER_RUNTIME_URL || "http://localhost:8027/";
const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "gg-devteam-003-cdp-"));

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    }).on("error", reject);
  });
}

async function waitForCdp() {
  const started = Date.now();
  while (Date.now() - started < 15000) {
    try {
      return await getJson(`http://127.0.0.1:${cdpPort}/json/version`);
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
  throw new Error("Timed out waiting for Chrome CDP");
}

const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  `--remote-debugging-port=${cdpPort}`,
  `--user-data-dir=${userDataDir}`,
  "about:blank"
], { stdio: "ignore" });

const consoleEvents = [];
const networkFailures = [];
const responses = [];

try {
  await waitForCdp();
  const pages = await getJson(`http://127.0.0.1:${cdpPort}/json`);
  const target = pages.find((page) => page.type === "page") || pages[0];
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let nextId = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const callbacks = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) callbacks.reject(new Error(JSON.stringify(msg.error)));
      else callbacks.resolve(msg.result);
      return;
    }

    if (msg.method === "Runtime.consoleAPICalled") {
      consoleEvents.push({
        type: msg.params.type,
        text: msg.params.args.map((arg) => arg.value || arg.description || "").join(" ")
      });
    }
    if (msg.method === "Runtime.exceptionThrown") {
      const details = msg.params.exceptionDetails;
      consoleEvents.push({
        type: "exception",
        text: details.text || details.exception?.description || "exception",
        description: details.exception?.description || "",
        url: details.url || "",
        lineNumber: details.lineNumber,
        columnNumber: details.columnNumber
      });
    }
    if (msg.method === "Network.loadingFailed") networkFailures.push(msg.params);
    if (msg.method === "Network.responseReceived") {
      responses.push({ url: msg.params.response.url, status: msg.params.response.status });
    }
  };

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  function send(method, params = {}) {
    const id = nextId++;
    ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
  }

  async function evaluate(expression) {
    return send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  }

  await send("Runtime.enable");
  await send("Page.enable");
  await send("Network.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1366,
    height: 768,
    deviceScaleFactor: 1,
    mobile: false
  });
  await send("Page.navigate", { url: runtimeUrl });
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const textureCheck = await evaluate(`(() => {
    const keys = [
      'playerShip','alienscout','enemyCruiser','enemyShip','motherShip','asteroid','comet',
      'nuke','nukeBurst','sprExplosion','sprLaserPlayer','sprLaserEnemy','sprShieldTile',
      'backgroundstars','sound','mute','BtnInfo','BtnPoint',
      'logoPrimary','menuTitlecard','gameOver','fireworks','hudLife','hudNuke'
    ];
    return keys.map((key) => [key, game.textures.exists(key)]);
  })()`);

  const missingTextures = textureCheck.result.value.filter((entry) => !entry[1]).map((entry) => entry[0]);
  const badResponses = responses.filter((response) => response.status >= 400);
  const exceptions = consoleEvents.filter((event) => event.type === "exception");
  const status = missingTextures.length === 0 && badResponses.length === 0 && networkFailures.length === 0 && exceptions.length === 0 ? "PASS" : "FAIL";

  const result = {
    runtimeUrl,
    consoleEvents,
    networkFailures,
    badResponses,
    textureCheck: textureCheck.result.value,
    missingTextures,
    status
  };

  fs.writeFileSync(path.join(evidenceDir, "browser-console-network-result.json"), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  ws.close();
  if (status !== "PASS") process.exitCode = 1;
} finally {
  chrome.kill();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  try {
    fs.rmSync(userDataDir, { recursive: true, force: true });
  } catch (error) {
    console.warn(`Temporary Chrome profile cleanup deferred: ${error.message}`);
  }
}
