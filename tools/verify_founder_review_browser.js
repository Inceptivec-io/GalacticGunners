const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");

const port = 9231;
const runtimeUrl = "http://localhost:8027/";
const viewport = { width: 1366, height: 665 };
const expectedFaviconVersion = "gg-hud-life-v004";
const writeEvidence = process.env.GG_VERIFY_NO_WRITE !== "1";
const evidenceDir = path.resolve(
  __dirname,
  "../docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_003_APP3_REV1/runtime_semantic",
);

const chromeCandidates = [
  path.join(process.env.ProgramFiles || "", "Google/Chrome/Application/chrome.exe"),
  path.join(process.env["ProgramFiles(x86)"] || "", "Google/Chrome/Application/chrome.exe"),
  path.join(process.env.LOCALAPPDATA || "", "Google/Chrome/Application/chrome.exe"),
  path.join(process.env.ProgramFiles || "", "Microsoft/Edge/Application/msedge.exe"),
  path.join(process.env["ProgramFiles(x86)"] || "", "Microsoft/Edge/Application/msedge.exe"),
];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requestJson(pathname, method = "GET") {
  return new Promise((resolve, reject) => {
    const request = http.request({ hostname: "127.0.0.1", port, path: pathname, method }, (response) => {
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
    });
    request.on("error", reject);
    request.end();
  });
}

async function main() {
  const chrome = chromeCandidates.find((candidate) => candidate && fs.existsSync(candidate));
  if (!chrome) throw new Error("No Chrome/Edge executable found for CDP browser verification.");

  if (writeEvidence) fs.mkdirSync(evidenceDir, { recursive: true });
  const userDataDir = path.join(os.tmpdir(), "gg-founder-review-cdp-profile");
  fs.rmSync(userDataDir, { recursive: true, force: true });
  fs.mkdirSync(userDataDir, { recursive: true });

  const browser = spawn(chrome, [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "--disable-gpu",
    "--no-first-run",
    "--disable-default-apps",
    "about:blank",
  ]);

  try {
    await delay(2500);
    const target = await requestJson(`/json/new?${runtimeUrl}`, "PUT");
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    let id = 0;
    const pending = new Map();
    const runtimeExceptions = [];
    const networkFailures = [];

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id && pending.has(message.id)) {
        pending.get(message.id)(message);
        pending.delete(message.id);
        return;
      }
      if (message.method === "Runtime.exceptionThrown") runtimeExceptions.push(message.params);
      if (message.method === "Log.entryAdded" && message.params.entry.level === "error") runtimeExceptions.push(message.params.entry);
      if (message.method === "Network.loadingFailed" && !message.params.canceled) networkFailures.push(message.params);
      if (message.method === "Network.responseReceived" && message.params.response && message.params.response.status >= 400) {
        networkFailures.push({ url: message.params.response.url, status: message.params.response.status });
      }
    };

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
      if (response.result && response.result.exceptionDetails) return { error: response.result.exceptionDetails.text };
      return response.result && response.result.result ? response.result.result.value : null;
    }

    async function screenshot(name) {
      const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
      if (writeEvidence) fs.writeFileSync(path.join(evidenceDir, name), Buffer.from(shot.result.data, "base64"));
    }

    async function touchAt(x, y) {
      await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
      await delay(120);
      await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await delay(500);
    }

    await send("Runtime.enable");
    await send("Log.enable");
    await send("Network.enable");
    await send("Page.enable");
    await send("Emulation.setDeviceMetricsOverride", { width: viewport.width, height: viewport.height, deviceScaleFactor: 1, mobile: false });
    await send("Page.navigate", { url: runtimeUrl });
    await delay(6500);

    const rawMenu = await evaluate(`(async () => {
      await document.fonts.ready;
      const mainMenu = window.game && game.scene.keys.MainMenu;
      const names = ["logoPrimary", "textTitle2", "heroImage", "textPoint", "btnPoint", "textBest", "btnInfo", "btnMute"];
      const bounds = {};
      for (const name of names) {
        const item = mainMenu && mainMenu[name];
        if (item && item.getBounds) {
          const rect = item.getBounds();
          bounds[name] = { x: rect.x, y: rect.y, width: rect.width, height: rect.height, right: rect.x + rect.width, bottom: rect.y + rect.height };
        } else {
          bounds[name] = null;
        }
      }
      return JSON.stringify({
        documentTitle: document.title,
        readyState: document.readyState,
        canvasCount: document.querySelectorAll("canvas").length,
        faviconLinks: Array.from(document.querySelectorAll("link[rel~=icon]")).map((link) => ({
          href: link.getAttribute("href"),
          type: link.getAttribute("type") || "",
          sizes: link.getAttribute("sizes") || ""
        })),
        appleTouchIconLinked: !!document.querySelector("link[rel='apple-touch-icon']"),
        rootFaviconIcoLinked: Array.from(document.querySelectorAll("link[rel~=icon]")).some((link) => (link.getAttribute("href") || "").startsWith("/favicon.ico")),
        fontsReady: document.fonts.status,
        silverFontLoaded: document.fonts.check("80px GalacticGunnersSilverProduction"),
        goldFontLoaded: document.fonts.check("80px GalacticGunnersGoldProduction"),
        ctaText: mainMenu && mainMenu.textTitle2 ? mainMenu.textTitle2.text : null,
        ctaFontFamily: mainMenu && mainMenu.textTitle2 && mainMenu.textTitle2.style ? mainMenu.textTitle2.style.fontFamily : null,
        mainMenuActive: !!(mainMenu && mainMenu.scene.isActive()),
        bounds
      });
    })()`);
    const menu = typeof rawMenu === "string" ? JSON.parse(rawMenu) : rawMenu;
    await screenshot("APP3_MENU_FONT_FAVICON_BOUNDS.png");

    await evaluate(`game.scene.start("Level1")`);
    await delay(1800);
    const rawRuntime = await evaluate(`(() => {
      const scene = game.scene.keys.Level1;
      const centerX = scene.game.config.width * 0.5;
      const centerY = scene.game.config.height * 0.5;
      const playerLaser = new PlayerLaser(scene, centerX, centerY);
      const enemyLaser = new EnemyLaser(scene, centerX + 90, centerY);
      const nuke = new Nuke(scene, centerX - 90, centerY + 80);
      const smallExplosion = new Explosion(scene, centerX - 180, centerY, false);
      const largeExplosion = new Explosion(scene, centerX + 180, centerY, true);
      const nukeExplosion = new NukeExplosion(scene, centerX, centerY - 120);
      scene.playerLasers.add(playerLaser);
      scene.enemyLasers.add(enemyLaser);
      scene.starNukes.add(nuke);
      scene.explosions.add(smallExplosion);
      scene.explosions.add(largeExplosion);
      scene.nukeExplosions.add(nukeExplosion);
      const enemyBounds = scene.enemies.getChildren().map((enemy) => {
        const rect = enemy.getBounds();
        return { x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom };
      });
      const xs = enemyBounds.flatMap((r) => [r.x, r.right]);
      const ys = enemyBounds.flatMap((r) => [r.y, r.bottom]);
      const textureInfo = (key) => {
        const texture = game.textures.get(key);
        return {
          width: texture.source[0].width,
          height: texture.source[0].height,
          frames: Object.keys(texture.frames).filter((name) => name !== "__BASE").length
        };
      };
      return JSON.stringify({
        textures: {
          playerShip: textureInfo("playerShip"),
          alienscout: textureInfo("alienscout"),
          comet: textureInfo("comet"),
          sprExplosion: textureInfo("sprExplosion"),
          sprExplosionLarge: textureInfo("sprExplosionLarge"),
          nuke: textureInfo("nuke"),
          nukeBurst: textureInfo("nukeBurst")
        },
        playerAnimationFrames: game.anims.get("playerShip").frames.map((frame) => frame.frame.name),
        enemyCount: scene.enemies.getChildren().length,
        enemyFormation: { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) },
        playerLaser: { angle: playerLaser.angle, displayWidth: playerLaser.displayWidth, displayHeight: playerLaser.displayHeight, bodyWidth: playerLaser.body.width, bodyHeight: playerLaser.body.height },
        enemyLaser: { angle: enemyLaser.angle, displayWidth: enemyLaser.displayWidth, displayHeight: enemyLaser.displayHeight, bodyWidth: enemyLaser.body.width, bodyHeight: enemyLaser.body.height },
        nuke: { angle: nuke.angle, angularVelocity: nuke.body.angularVelocity, displayWidth: nuke.displayWidth, displayHeight: nuke.displayHeight },
        fxKeys: {
          smallExplosion: smallExplosion.texture.key,
          largeExplosion: largeExplosion.texture.key,
          nukeExplosion: nukeExplosion.texture.key
        }
      });
    })()`);
    const runtime = typeof rawRuntime === "string" ? JSON.parse(rawRuntime) : rawRuntime;
    await screenshot("APP3_LEVEL1_FORMATION_PROJECTILES_FX.png");

    const rawVictory = await evaluate(`(() => {
      const scene = game.scene.keys.Level1;
      score = 1234;
      currentLives = 2;
      currentNukes = 3;
      LevelRestart = 1;
      scene.win();
      const children = scene.children.list;
      const texts = children.filter((child) => child.type === "Text").map((child) => ({ text: child.text, x: child.x, y: child.y, role: child.ggButtonRole || "" }));
      const images = children.filter((child) => child.type === "Image").map((child) => ({ key: child.texture.key, x: child.x, y: child.y, off: child.ggButtonOffKey || "" }));
      const zones = children.filter((child) => child.type === "Zone" && child.ggButtonRole).map((child) => ({ role: child.ggButtonRole, x: child.x, y: child.y, width: child.input.hitArea.width, height: child.input.hitArea.height }));
      const next = zones.find((item) => item.role === "NEXT");
      return JSON.stringify({ texts, images, zones, next });
    })()`);
    const victory = typeof rawVictory === "string" ? JSON.parse(rawVictory) : rawVictory;
    await screenshot("APP3_LEVEL1_VICTORY_DYNAMIC_CONTROLS.png");
    if (victory.next) await touchAt(victory.next.x, victory.next.y);
    const nextTouchResult = await evaluate(`game.scene.keys.Level2 && game.scene.keys.Level2.scene.isActive()`);

    await evaluate(`game.scene.stop("Level2"); game.scene.stop("BossLevel"); game.scene.start("Level1")`);
    await delay(2200);
    const rawGameOver = await evaluate(`(() => {
      const scene = game.scene.keys.Level1;
      score = 777;
      scene.gameOver();
      const buttons = scene.children.list
        .filter((child) => child.ggButtonOffKey)
        .map((child) => ({ key: child.texture.key, off: child.ggButtonOffKey, on: child.ggButtonOnKey, x: child.x, y: child.y, width: child.displayWidth, height: child.displayHeight }));
      return JSON.stringify({ buttons });
    })()`);
    const gameOver = typeof rawGameOver === "string" ? JSON.parse(rawGameOver) : rawGameOver;
    await screenshot("APP3_GAME_OVER_BUTTON_STATES.png");

    const report = {
      runtimeUrl,
      checkedAtUtc: new Date().toISOString(),
      viewport,
      expectedFaviconVersion,
      menu,
      runtime,
      victory,
      nextTouchResult,
      gameOver,
      runtimeExceptions,
      networkFailures,
    };

    const allBoundsVisible = Object.values(menu.bounds).every((bounds) =>
      bounds && bounds.x >= -1 && bounds.y >= -1 && bounds.right <= viewport.width + 1 && bounds.bottom <= viewport.height + 1
    );
    const hasVictoryValues = victory.texts.some((item) => item.text === "SCORE  1234") &&
      victory.texts.some((item) => item.text === "WAVE  1") &&
      victory.texts.some((item) => item.text === "BONUS  600");
    const hasNoVictoryLogoOverlay = !victory.images.some((item) => item.key === "hero" || item.key === "logoPrimary" || item.off);
    const gameOverButtons = gameOver.buttons.map((button) => button.off).sort();
    const expectedGameOverButtons = ["buttonMenuOff", "buttonReplayOff", "buttonTryAgainOff"].sort();
    const victoryZones = victory.zones.map((zone) => zone.role).sort();
    const expectedVictoryZones = ["MENU", "NEXT", "REPLAY"].sort();

    report.pass =
      menu.documentTitle === "Galactic Gunners" &&
      menu.rootFaviconIcoLinked === true &&
      menu.faviconLinks.every((link) => String(link.href).includes(expectedFaviconVersion)) &&
      menu.appleTouchIconLinked === true &&
      menu.silverFontLoaded === true &&
      menu.goldFontLoaded === true &&
      menu.ctaText === "CAN YOU SAVE THE DAY?" &&
      String(menu.ctaFontFamily).includes("GalacticGunnersGoldProduction") &&
      menu.mainMenuActive === true &&
      menu.canvasCount >= 1 &&
      allBoundsVisible &&
      runtime.textures.playerShip.width === 2172 &&
      runtime.textures.playerShip.height === 724 &&
      runtime.playerAnimationFrames.length === 1 &&
      String(runtime.playerAnimationFrames[0]) === "0" &&
      runtime.textures.alienscout.width === 1983 &&
      runtime.textures.alienscout.height === 793 &&
      runtime.textures.comet.frames === 4 &&
      runtime.textures.sprExplosion.frames === 8 &&
      runtime.textures.sprExplosionLarge.frames === 6 &&
      runtime.textures.nuke.frames === 4 &&
      runtime.textures.nukeBurst.frames === 10 &&
      runtime.enemyCount === 22 &&
      runtime.enemyFormation.minX > viewport.width * 0.1 &&
      runtime.enemyFormation.maxX < viewport.width * 0.93 &&
      runtime.playerLaser.angle === -90 &&
      runtime.enemyLaser.angle === 90 &&
      runtime.playerLaser.displayHeight > 10 &&
      runtime.enemyLaser.displayHeight > 10 &&
      runtime.nuke.angularVelocity === 0 &&
      runtime.fxKeys.smallExplosion === "sprExplosion" &&
      runtime.fxKeys.largeExplosion === "sprExplosionLarge" &&
      runtime.fxKeys.nukeExplosion === "nukeBurst" &&
      hasVictoryValues &&
      hasNoVictoryLogoOverlay &&
      victory.next &&
      JSON.stringify(victoryZones) === JSON.stringify(expectedVictoryZones) &&
      nextTouchResult === true &&
      JSON.stringify(gameOverButtons) === JSON.stringify(expectedGameOverButtons) &&
      gameOver.buttons.every((button) => button.width > 120 && button.height > 30) &&
      runtimeExceptions.length === 0 &&
      networkFailures.length === 0;

    if (writeEvidence) fs.writeFileSync(path.join(evidenceDir, "APP3_SEMANTIC_RUNTIME_REPORT.json"), `${JSON.stringify(report, null, 2)}\n`);
    await send("Browser.close");
    console.log(JSON.stringify(report, null, 2));
    if (!report.pass) process.exitCode = 1;
  } finally {
    browser.kill();
    await delay(1000);
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 500 });
    } catch {
      // Windows can briefly hold the headless browser profile after Browser.close.
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
