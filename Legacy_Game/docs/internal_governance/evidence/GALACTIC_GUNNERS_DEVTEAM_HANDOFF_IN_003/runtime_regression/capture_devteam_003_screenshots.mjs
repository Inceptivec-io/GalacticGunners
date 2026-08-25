import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const evidenceDir = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, "$1");
const chromePath = process.env.GG_CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const cdpPort = process.env.GG_DOCKER_CDP_PORT || "9238";
const runtimeUrl = process.env.GG_DOCKER_RUNTIME_URL || "http://localhost:8027/";
const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "gg-devteam-003-shots-"));

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (error) { reject(error); }
      });
    }).on("error", reject);
  });
}

async function waitForCdp() {
  const started = Date.now();
  while (Date.now() - started < 15000) {
    try { return await getJson(`http://127.0.0.1:${cdpPort}/json/version`); }
    catch { await new Promise((resolve) => setTimeout(resolve, 300)); }
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

  async function screenshot(name) {
    const shot = await send("Page.captureScreenshot", { format: "png", fromSurface: true });
    fs.writeFileSync(path.join(evidenceDir, name), Buffer.from(shot.data, "base64"));
  }

  await send("Runtime.enable");
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1366,
    height: 768,
    deviceScaleFactor: 1,
    mobile: false
  });
  await send("Page.navigate", { url: runtimeUrl });
  await new Promise((resolve) => setTimeout(resolve, 5000));
  await screenshot("screenshot_01_main_menu.png");

  await evaluate(`void game.scene.start('Level1')`);
  await new Promise((resolve) => setTimeout(resolve, 2500));
  await screenshot("screenshot_02_level1_runtime.png");

  await evaluate(`void game.scene.start('Info')`);
  await new Promise((resolve) => setTimeout(resolve, 1500));
  await screenshot("screenshot_03_info_scene.png");

  await evaluate(`void game.scene.start('Victory')`);
  await new Promise((resolve) => setTimeout(resolve, 1500));
  await screenshot("screenshot_04_victory_scene.png");

  const manifest = {
    runtimeUrl,
    screenshots: [
      "screenshot_01_main_menu.png",
      "screenshot_02_level1_runtime.png",
      "screenshot_03_info_scene.png",
      "screenshot_04_victory_scene.png"
    ],
    status: "PASS"
  };
  fs.writeFileSync(path.join(evidenceDir, "screenshot-capture-result.json"), JSON.stringify(manifest, null, 2));
  console.log(JSON.stringify(manifest, null, 2));
  ws.close();
} finally {
  chrome.kill();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  try { fs.rmSync(userDataDir, { recursive: true, force: true }); }
  catch (error) { console.warn(`Temporary Chrome profile cleanup deferred: ${error.message}`); }
}
