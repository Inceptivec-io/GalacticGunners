import fs from "node:fs";
import path from "node:path";
import http from "node:http";

const evidenceDir = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, "$1");

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

const cdpPort = process.env.GG_CDP_PORT || "9226";
const pages = await getJson(`http://127.0.0.1:${cdpPort}/json`);
const target = pages.find((page) => page.type === "page") || pages[0];
const ws = new WebSocket(target.webSocketDebuggerUrl);
let nextId = 1;
const pending = new Map();
const consoleEvents = [];
const networkFailures = [];
const responses = [];

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
      columnNumber: details.columnNumber,
      stackTrace: details.stackTrace || null
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

async function screenshot(name) {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  fs.writeFileSync(path.join(evidenceDir, `${name}.png`), Buffer.from(shot.data, "base64"));
}

async function scene(name, screenshotName) {
  await evaluate(`(() => {
    game.scene.getScenes(true).forEach((scene) => {
      if (scene.scene.key !== '${name}') game.scene.stop(scene.scene.key);
    });
    game.scene.start('${name}');
    return true;
  })()`);
  await new Promise((resolve) => setTimeout(resolve, 1800));
  await screenshot(screenshotName);
}

await send("Runtime.enable");
await send("Page.enable");
await send("Network.enable");
await send("Log.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 1366,
  height: 768,
  deviceScaleFactor: 1,
  mobile: false
});

await send("Page.navigate", { url: "http://localhost:8026/index.html" });
await new Promise((resolve) => setTimeout(resolve, 4500));

await screenshot("01_main_menu");
await scene("Info", "02_info");
await scene("Level1", "03_level1");
await evaluate(`(() => {
  const s = game.scene.getScene('Level1');
  if (s && s.player) {
    currentNukes = 1;
    const n = new Nuke(s, s.player.x, s.player.y);
    s.starNukes.add(n);
    if (s.sfx && s.sfx.nukeFiring) s.sfx.nukeFiring.play();
  }
  return true;
})()`);
await screenshot("04_level1_nuke");
await evaluate("(() => { game.scene.getScene('Level1').pauseGame(); return true; })()");
await screenshot("05_paused");
await evaluate("(() => { game.scene.getScene('Paused').resumeGame(); return true; })()");
await new Promise((resolve) => setTimeout(resolve, 700));
await screenshot("06_resumed_level1");
await scene("Level2", "07_level2");
await scene("BossLevel", "08_boss");
await evaluate("(() => { game.scene.getScene('BossLevel').gameOver(); return true; })()");
await screenshot("09_game_over");
await scene("Victory", "10_victory");

const textureCheck = await evaluate(`(() => {
  const keys = [
    'playerShip','alienscout','enemyCruiser','enemyShip','motherShip','asteroid',
    'nuke','sprExplosion','backgroundstars','sound','mute','BtnInfo','BtnPoint',
    'logoPrimary','menuTitlecard','gameOver','fireworks'
  ];
  return keys.map((key) => [key, game.textures.exists(key)]);
})()`);
const activeScenes = await evaluate("game.scene.getScenes(true).map((scene) => scene.scene.key)");
const result = {
  url: "http://localhost:8026/index.html",
  screenshots: fs.readdirSync(evidenceDir).filter((file) => file.endsWith(".png")).sort(),
  consoleEvents,
  networkFailures,
  badResponses: responses.filter((response) => response.status >= 400),
  textureCheck: textureCheck.result.value,
  activeScenes: activeScenes.result.value
};

fs.writeFileSync(path.join(evidenceDir, "browser-regression-result.json"), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
ws.close();
