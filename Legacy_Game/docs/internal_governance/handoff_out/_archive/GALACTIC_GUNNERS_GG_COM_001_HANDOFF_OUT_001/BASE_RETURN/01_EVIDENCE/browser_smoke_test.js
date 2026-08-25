const http = require("http");
const fs = require("fs");

function requestJson(path, method = "GET") {
  return new Promise((resolve, reject) => {
    const request = http.request(
      { hostname: "127.0.0.1", port: 9222, path, method },
      (response) => {
        let data = "";
        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", () => {
          try {
            resolve(data ? JSON.parse(data) : {});
          } catch {
            resolve({ text: data });
          }
        });
      },
    );
    request.on("error", reject);
    request.end();
  });
}

async function main() {
  const target = await requestJson("/json/new?http://127.0.0.1:8000/", "PUT");
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  const events = [];

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
      return;
    }
    if (message.method) {
      events.push(message);
    }
  };

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const messageId = ++id;
      pending.set(messageId, resolve);
      ws.send(JSON.stringify({ id: messageId, method, params }));
    });
  }

  async function evaluate(expression) {
    const response = await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (response.error) {
      return { error: response.error.message };
    }
    if (!response.result) {
      return { error: "Missing CDP Runtime.evaluate result" };
    }
    if (response.result.exceptionDetails) {
      return { error: response.result.exceptionDetails.text };
    }
    return response.result.result.value;
  }

  const checks = [];
  async function check(name, expression) {
    checks.push({ name, result: await evaluate(expression) });
  }

  await send("Runtime.enable");
  await send("Page.enable");
  await send("Log.enable");
  await send("Page.navigate", { url: "http://127.0.0.1:8000/" });
  await new Promise((resolve) => setTimeout(resolve, 4500));

  await check("document ready", "document.readyState");
  await check("canvas count", 'document.querySelectorAll("canvas").length');
  await check("body has canvas", '!!document.querySelector("canvas")');
  await check("Phaser version", "window.Phaser && Phaser.VERSION");
  await check("game exists", "!!window.game");
  await check("registered scenes", 'Object.keys(game.scene.keys).join(",")');
  await check("main menu active", "game.scene.keys.MainMenu.scene.isActive()");
  await check(
    "audio cache loaded",
    '["sndBtn","sndExplode","sndLaserPlayer","sndLaserEnemy","nukefiring"].map((key) => game.cache.audio.exists(key)).join(",")',
  );

  await evaluate('game.scene.start("Info")');
  await new Promise((resolve) => setTimeout(resolve, 500));
  await check("info screen active", "game.scene.keys.Info.scene.isActive()");

  await evaluate('game.scene.start("Level1")');
  await new Promise((resolve) => setTimeout(resolve, 800));
  await check("level 1 active", "game.scene.keys.Level1.scene.isActive()");
  await send("Input.dispatchKeyEvent", {
    type: "keyDown",
    windowsVirtualKeyCode: 80,
    nativeVirtualKeyCode: 80,
    code: "KeyP",
    key: "p",
  });
  await new Promise((resolve) => setTimeout(resolve, 500));
  await check("pause scene active after P", "game.scene.keys.Paused.scene.isActive()");
  await check("level 1 visible while pause overlay active", "game.scene.keys.Level1.scene.isVisible()");
  await evaluate('game.scene.resume("Level1"); game.scene.stop("Paused")');
  await new Promise((resolve) => setTimeout(resolve, 300));
  await check(
    "level 1 resumed",
    'game.scene.keys.Level1.scene.isActive() && !game.scene.keys.Paused.scene.isActive()',
  );

  await send("Input.dispatchKeyEvent", {
    type: "keyDown",
    windowsVirtualKeyCode: 32,
    nativeVirtualKeyCode: 32,
    code: "Space",
    key: " ",
  });
  await send("Input.dispatchKeyEvent", {
    type: "keyUp",
    windowsVirtualKeyCode: 32,
    nativeVirtualKeyCode: 32,
    code: "Space",
    key: " ",
  });
  await send("Input.dispatchKeyEvent", {
    type: "keyDown",
    windowsVirtualKeyCode: 78,
    nativeVirtualKeyCode: 78,
    code: "KeyN",
    key: "n",
  });
  await send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x: 200,
    y: 200,
    button: "left",
    clickCount: 1,
  });
  await send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: 200,
    y: 200,
    button: "left",
    clickCount: 1,
  });
  await check("keyboard/touch events dispatched", "true");

  await evaluate('game.scene.start("Level2")');
  await new Promise((resolve) => setTimeout(resolve, 800));
  await check("level 2 active", "game.scene.keys.Level2.scene.isActive()");

  await evaluate('game.scene.start("BossLevel")');
  await new Promise((resolve) => setTimeout(resolve, 800));
  await check("boss level active", "game.scene.keys.BossLevel.scene.isActive()");

  await evaluate('game.scene.start("Victory")');
  await new Promise((resolve) => setTimeout(resolve, 500));
  await check("victory active", "game.scene.keys.Victory.scene.isActive()");

  await evaluate('game.scene.start("Titles")');
  await new Promise((resolve) => setTimeout(resolve, 500));
  await check("titles active", "game.scene.keys.Titles.scene.isActive()");

  await evaluate('game.scene.start("Level1"); RIP = true; LevelRestart = 1');
  await new Promise((resolve) => setTimeout(resolve, 500));
  await check("game-over/restart state reachable", "RIP === true && LevelRestart === 1");

  const screenshot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(
    "_EXTERNAL_GalacticGunners/_GalacticGunners_MAIN_POST_BOX/_WORK_00000001_POST_BOX/evidence/GALACTIC_GUNNERS_GG_COM_001_HANDOFF_IN_001/browser-smoke.png",
    Buffer.from(screenshot.result.data, "base64"),
  );

  const badEvents = events.filter((event) => {
    const serialized = JSON.stringify(event);
    return (
      (event.method === "Runtime.exceptionThrown" || event.method === "Log.entryAdded") &&
      /error|exception|failed/i.test(serialized)
    );
  });

  const result = {
    checks,
    badEvents: badEvents.map((event) => event.params).slice(0, 10),
  };
  fs.writeFileSync(
    "_EXTERNAL_GalacticGunners/_GalacticGunners_MAIN_POST_BOX/_WORK_00000001_POST_BOX/evidence/GALACTIC_GUNNERS_GG_COM_001_HANDOFF_IN_001/browser-smoke-result.json",
    JSON.stringify(result, null, 2),
  );
  console.log(JSON.stringify(result, null, 2));

  await requestJson(`/json/close/${target.id}`);
  ws.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
