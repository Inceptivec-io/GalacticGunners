const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");

const port = 9231;
const runtimeUrl = "http://localhost:8027/";
const viewport = { width: 1366, height: 665 };
const expectedFaviconVersion = "gg-hud-life-v005";
const evidenceDir = path.resolve(
  __dirname,
  "../docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_003_APP4/runtime_semantic",
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
      response.on("data", (chunk) => { data += chunk; });
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

  fs.mkdirSync(evidenceDir, { recursive: true });
  const userDataDir = path.join(os.tmpdir(), "gg-app4-founder-review-cdp-profile");
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
    const networkResponses = [];

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
      if (message.method === "Network.responseReceived" && message.params.response) {
        networkResponses.push({
          url: message.params.response.url,
          status: message.params.response.status,
          mimeType: message.params.response.mimeType,
        });
        if (message.params.response.status >= 400) {
          networkFailures.push({ url: message.params.response.url, status: message.params.response.status });
        }
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
      if (response.result && response.result.exceptionDetails) {
        throw new Error(response.result.exceptionDetails.text || "Runtime.evaluate failed");
      }
      return response.result && response.result.result ? response.result.result.value : null;
    }

    async function screenshot(name) {
      const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
      fs.writeFileSync(path.join(evidenceDir, name), Buffer.from(shot.result.data, "base64"));
    }

    async function touchAt(x, y) {
      await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
      await delay(140);
      await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await delay(700);
    }

    await send("Runtime.enable");
    await send("Log.enable");
    await send("Network.enable");
    await send("Page.enable");
    await send("Emulation.setDeviceMetricsOverride", { width: viewport.width, height: viewport.height, deviceScaleFactor: 1, mobile: false });
    await send("Page.navigate", { url: runtimeUrl });
    await delay(6500);

    const menu = JSON.parse(await evaluate(`(async () => {
      await document.fonts.ready;
      const mainMenu = game.scene.keys.MainMenu;
      const names = ["logoPrimary", "textTitle2", "heroImage", "textPoint", "btnPoint", "textBest", "btnInfo", "btnMute"];
      const bounds = {};
      for (const name of names) {
        const item = mainMenu && mainMenu[name];
        if (!item || !item.getBounds) {
          bounds[name] = null;
          continue;
        }
        const rect = item.getBounds();
        bounds[name] = { x: rect.x, y: rect.y, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom };
      }
      const faviconStatuses = await Promise.all(Array.from(document.querySelectorAll("link[rel~=icon], link[rel='apple-touch-icon']")).map(async (link) => {
        const href = link.getAttribute("href");
        const url = new URL(href, location.href).href;
        const response = await fetch(url, { cache: "reload" });
        return { href, status: response.status, contentType: response.headers.get("content-type") || "" };
      }));
      return JSON.stringify({
        documentTitle: document.title,
        canvasCount: document.querySelectorAll("canvas").length,
        faviconLinks: Array.from(document.querySelectorAll("link[rel~=icon]")).map((link) => link.getAttribute("href")),
        faviconStatuses,
        fontsReady: document.fonts.status,
        fontFaces: Array.from(document.fonts).map((font) => ({ family: font.family, status: font.status })),
        silverFontLoaded: document.fonts.check("80px 'Galactic Gunners Silver Display'"),
        goldFontLoaded: document.fonts.check("80px 'Galactic Gunners Gold Display'"),
        ctaText: mainMenu.textTitle2.text,
        ctaFontFamily: mainMenu.textTitle2.style.fontFamily,
        mainMenuActive: mainMenu.scene.isActive(),
        bounds
      });
    })()`));
    fs.writeFileSync(path.join(evidenceDir, "APP4_MENU_PRELIMINARY_INSPECTION.json"), `${JSON.stringify(menu, null, 2)}\n`);
    await screenshot("APP4_MENU_FAVICON_PRODUCTION_FONT_LAYOUT.png");

    await touchAt(menu.bounds.btnInfo.x + menu.bounds.btnInfo.width / 2, menu.bounds.btnInfo.y + menu.bounds.btnInfo.height / 2);
    const infoOpen = JSON.parse(await evaluate(`JSON.stringify({ active: game.scene.keys.Info.scene.isActive(), back: (() => { const b = game.scene.keys.Info.btnBack.getBounds(); return { x: b.centerX, y: b.centerY }; })() })`));
    await screenshot("APP4_INFO_BACK_TOUCH_SURFACE.png");
    await touchAt(infoOpen.back.x, infoOpen.back.y);
    const infoBackToMenu = await evaluate(`game.scene.keys.MainMenu.scene.isActive()`);

    await touchAt(menu.bounds.heroImage.x + menu.bounds.heroImage.width / 2, menu.bounds.heroImage.y + menu.bounds.heroImage.height / 2);
    await delay(2200);
    await evaluate(`game.scene.keys.Level1.pauseGame()`);
    await delay(700);
    const pauseSurface = JSON.parse(await evaluate(`(() => {
      const paused = game.scene.keys.Paused;
      const b = paused.btnResume.getBounds();
      return JSON.stringify({ active: paused.scene.isActive(), resume: { x: b.centerX, y: b.centerY } });
    })()`));
    await screenshot("APP4_PAUSE_RESUME_TOUCH_SURFACE.png");
    await touchAt(pauseSurface.resume.x, pauseSurface.resume.y);
    const pauseResumeWorks = await evaluate(`game.scene.keys.Level1.scene.isActive() && !game.scene.keys.Paused.scene.isVisible()`);

    const runtime = JSON.parse(await evaluate(`(() => {
      const scene = game.scene.keys.Level1;
      const centerX = scene.game.config.width * 0.5;
      const centerY = scene.game.config.height * 0.5;
      const playerLaser = new PlayerLaser(scene, centerX, centerY);
      const enemyLaser = new EnemyLaser(scene, centerX + 95, centerY);
      const motherLaser = new EnemyMotherShipLaser(scene, centerX + 190, centerY);
      const nuke = new Nuke(scene, centerX - 120, centerY + 90);
      const projectileKey = nuke.texture.key;
      const projectileCountBeforeBurst = scene.children.list.filter((child) => child.texture && child.texture.key === "nuke").length;
      nuke.destroy();
      const nukeExplosion = new NukeExplosion(scene, centerX - 120, centerY - 80);
      const projectileCountAfterBurst = scene.children.list.filter((child) => child.active && child.texture && child.texture.key === "nuke").length;
      const particleManagers = scene.children.list.filter((child) => child.type === "ParticleEmitterManager").length;
      const cometRight = new Comet(scene, centerX - 280, centerY - 60);
      cometRight.setVelocity(200, 0);
      ggOrientCometToVelocity(cometRight);
      const cometLeft = new Comet(scene, centerX - 120, centerY - 60);
      cometLeft.setVelocity(-200, 0);
      ggOrientCometToVelocity(cometLeft);
      scene.children.bringToTop(playerLaser);
      scene.children.bringToTop(enemyLaser);
      scene.children.bringToTop(motherLaser);
      scene.children.bringToTop(nukeExplosion);
      scene.children.bringToTop(cometRight);
      scene.children.bringToTop(cometLeft);
      const textureInfo = (key) => {
        const texture = game.textures.get(key);
        const frames = Object.keys(texture.frames).filter((name) => name !== "__BASE");
        const frameRects = {};
        frames.forEach((name) => {
          const frame = texture.frames[name];
          frameRects[name] = { x: frame.cutX, y: frame.cutY, width: frame.cutWidth, height: frame.cutHeight };
        });
        return { width: texture.source[0].width, height: texture.source[0].height, frames, frameRects };
      };
      const enemyBounds = scene.enemies.getChildren().map((enemy) => {
        const rect = enemy.getBounds();
        return { x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom };
      });
      const xs = enemyBounds.flatMap((r) => [r.x, r.right]);
      const ys = enemyBounds.flatMap((r) => [r.y, r.bottom]);
      return JSON.stringify({
        textures: {
          playerShip: textureInfo("playerShip"),
          alienscout: textureInfo("alienscout"),
          enemyShip: textureInfo("enemyShip"),
          motherShip: textureInfo("motherShip"),
          comet: textureInfo("comet"),
          nuke: textureInfo("nuke"),
          nukeBurst: textureInfo("nukeBurst")
        },
        playerAnimationFrames: game.anims.get("playerShip").frames.map((frame) => frame.frame.name),
        scoutAnimationFrames: game.anims.get("alienscout").frames.map((frame) => frame.frame.name),
        enemyCount: scene.enemies.getChildren().length,
        enemyFormation: { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) },
        playerLaser: { angle: playerLaser.angle, displayWidth: playerLaser.displayWidth, displayHeight: playerLaser.displayHeight, bodyWidth: playerLaser.body.width, bodyHeight: playerLaser.body.height },
        enemyLaser: { angle: enemyLaser.angle, displayWidth: enemyLaser.displayWidth, displayHeight: enemyLaser.displayHeight, bodyWidth: enemyLaser.body.width, bodyHeight: enemyLaser.body.height },
        motherLaser: { angle: motherLaser.angle, displayWidth: motherLaser.displayWidth, displayHeight: motherLaser.displayHeight },
        cometRight: { angle: cometRight.angle, angularVelocity: cometRight.body.angularVelocity },
        cometLeft: { angle: cometLeft.angle, angularVelocity: cometLeft.body.angularVelocity },
        nukeLifecycle: {
          projectileKey,
          projectileCountBeforeBurst,
          projectileCountAfterBurst,
          burstKey: nukeExplosion.texture.key,
          particleManagers
        }
      });
    })()`));
    await screenshot("APP4_FORMATION_LASERS_COMETS_NUKE_LIFECYCLE.png");

    await evaluate(`(() => {
      const scene = game.scene.keys.Level1;
      ["enemies", "enemyLasers", "playerLasers", "starNukes", "explosions", "nukeExplosions", "asteroids", "comets", "shieldTiles", "shieldHoles"].forEach((groupName) => {
        const group = scene[groupName];
        if (group && group.getChildren) group.getChildren().forEach((child) => child.setVisible && child.setVisible(false));
      });
      [textScore, textLives, textNukesLoad, textNukes, restartlevel].forEach((item) => {
        if (item && item.setVisible) item.setVisible(false);
      });
      scene.children.list.forEach((child) => {
        const key = child.texture && child.texture.key;
        if (["sprLaserPlayer", "sprLaserEnemy", "nuke", "nukeBurst", "comet"].includes(key)) child.setVisible(false);
      });
      const startX = 90;
      const startY = 75;
      const keys = [
        ["PLAYER", "playerShip", "0"], ["PLAYER", "playerShip", "1"], ["PLAYER", "playerShip", "2"], ["PLAYER", "playerShip", "3"],
        ["SCOUT", "alienscout", "0"], ["SCOUT", "alienscout", "1"], ["SCOUT", "alienscout", "2"], ["SCOUT", "alienscout", "3"],
        ["DESTROYER", "enemyShip", "0"], ["DESTROYER", "enemyShip", "1"], ["DESTROYER", "enemyShip", "2"],
        ["MOTHERSHIP", "motherShip", "0"], ["MOTHERSHIP", "motherShip", "1"], ["MOTHERSHIP", "motherShip", "2"],
        ["MOTHERSHIP", "motherShip", "3"], ["MOTHERSHIP", "motherShip", "4"], ["MOTHERSHIP", "motherShip", "5"]
      ];
      keys.forEach((item, index) => {
        const col = index % 7;
        const row = Math.floor(index / 7);
        const image = scene.add.image(startX + col * 180, startY + row * 185, item[1], item[2]).setOrigin(0.5).setDepth(80);
        image.setDisplaySize(Math.min(image.width, 150), Math.min(image.height, 140));
        scene.add.text(image.x, image.y + 78, item[0] + " " + item[2], { fontFamily: GG_FONT_DISPLAY, fontSize: 18, color: "#ffffff" }).setOrigin(0.5).setDepth(81);
      });
    })()`);
    await screenshot("APP4_EXPLICIT_SPRITE_FRAME_CONTACT_SHEET.png");

    const victory = JSON.parse(await evaluate(`(() => {
      const scene = game.scene.keys.Level1;
      score = 1234;
      currentLives = 2;
      currentNukes = 3;
      LevelRestart = 1;
      scene.win();
      const children = scene.children.list;
      const texts = children.filter((child) => child.type === "Text").map((child) => ({ text: child.text, fontFamily: child.style ? child.style.fontFamily : "" }));
      const zones = children.filter((child) => child.type === "Zone" && child.ggButtonRole).map((child) => ({ role: child.ggButtonRole, x: child.x, y: child.y, width: child.input.hitArea.width, height: child.input.hitArea.height }));
      return JSON.stringify({ texts, zones });
    })()`));
    await screenshot("APP4_LEVEL_COMPLETE_DYNAMIC_VALUES_DISCRETE_CONTROLS.png");
    const nextZone = victory.zones.find((zone) => zone.role === "NEXT");
    await touchAt(nextZone.x, nextZone.y);
    const levelCompleteNextWorks = await evaluate(`game.scene.keys.Level2.scene.isActive()`);

    await evaluate(`(() => {
      game.scene.stop("Level2");
      game.scene.start("Level1");
      return "started";
    })()`);
    await delay(2200);
    const gameOverSurface = JSON.parse(await evaluate(`(() => {
      const scene = game.scene.keys.Level1;
      score = 777;
      scene.gameOver();
      const buttons = scene.children.list.filter((child) => child.ggButtonOffKey).map((child) => ({ off: child.ggButtonOffKey, on: child.ggButtonOnKey, x: child.x, y: child.y, width: child.displayWidth, height: child.displayHeight }));
      return JSON.stringify({ buttons });
    })()`));
    await screenshot("APP4_GAME_OVER_BUTTON_STATES_DISCRETE_TOUCH.png");
    const tryAgain = gameOverSurface.buttons.find((button) => button.off === "buttonTryAgainOff");
    await touchAt(tryAgain.x, tryAgain.y);
    const gameOverTryAgainWorks = await evaluate(`game.scene.keys.Level1.scene.isActive() && !RIP`);

    const report = {
      runtimeUrl,
      checkedAtUtc: new Date().toISOString(),
      viewport,
      expectedFaviconVersion,
      menu,
      infoOpen,
      infoBackToMenu,
      pauseSurface,
      pauseResumeWorks,
      runtime,
      victory,
      levelCompleteNextWorks,
      gameOverSurface,
      gameOverTryAgainWorks,
      runtimeExceptions,
      networkFailures,
      fontNetworkResponses: networkResponses.filter((item) => item.url.includes(".woff2")),
      faviconNetworkResponses: networkResponses.filter((item) => item.url.includes("favicon")),
    };

    const allBoundsVisible = Object.values(menu.bounds).every((bounds) =>
      bounds && bounds.x >= -1 && bounds.y >= -1 && bounds.right <= viewport.width + 1 && bounds.bottom <= viewport.height + 1
    );
    const hasProductionFontResponses =
      report.fontNetworkResponses.some((item) => item.url.includes("GalacticGunnersGoldDisplay-Regular.woff2") && item.status === 200) &&
      report.fontNetworkResponses.some((item) => item.url.includes("GalacticGunnersSilverDisplay-Regular.woff2") && item.status === 200);
    const hasCurrentFavicons = menu.faviconLinks.every((href) => String(href).includes(expectedFaviconVersion)) &&
      menu.faviconStatuses.every((item) => item.status === 200);
    const hasVictoryValues = victory.texts.some((item) => item.text === "SCORE  1234") &&
      victory.texts.some((item) => item.text === "WAVE  1") &&
      victory.texts.some((item) => item.text === "BONUS  600");
    const victoryZones = victory.zones.map((zone) => zone.role).sort();
    const gameOverButtons = gameOverSurface.buttons.map((button) => button.off).sort();

    report.pass =
      menu.documentTitle === "Galactic Gunners" &&
      menu.canvasCount >= 1 &&
      menu.mainMenuActive === true &&
      menu.silverFontLoaded === true &&
      menu.goldFontLoaded === true &&
      hasProductionFontResponses &&
      String(menu.ctaFontFamily).includes("Galactic Gunners Gold Display") &&
      menu.ctaText === "CAN YOU SAVE THE DAY?" &&
      allBoundsVisible &&
      hasCurrentFavicons &&
      infoOpen.active === true &&
      infoBackToMenu === true &&
      pauseSurface.active === true &&
      pauseResumeWorks === true &&
      runtime.textures.playerShip.frames.length === 4 &&
      runtime.textures.alienscout.frames.length === 4 &&
      runtime.textures.enemyShip.frames.length === 3 &&
      runtime.textures.motherShip.frames.length === 6 &&
      runtime.textures.playerShip.frameRects["0"].width === 494 &&
      runtime.textures.alienscout.frameRects["2"].height === 773 &&
      runtime.playerAnimationFrames.length === 1 &&
      runtime.playerAnimationFrames[0] === "0" &&
      runtime.scoutAnimationFrames.includes("3") &&
      runtime.enemyCount === 58 &&
      runtime.enemyFormation.minX > viewport.width * 0.07 &&
      runtime.enemyFormation.maxX < viewport.width * 0.93 &&
      runtime.playerLaser.angle === -90 &&
      runtime.enemyLaser.angle === 90 &&
      runtime.motherLaser.angle === 90 &&
      runtime.playerLaser.displayWidth >= 68 &&
      runtime.enemyLaser.displayWidth >= 58 &&
      runtime.motherLaser.displayWidth >= 72 &&
      runtime.playerLaser.bodyHeight < runtime.playerLaser.displayHeight &&
      runtime.enemyLaser.bodyHeight < runtime.enemyLaser.displayHeight &&
      Math.abs(Math.abs(runtime.cometRight.angle) - 180) <= 1 &&
      Math.abs(runtime.cometLeft.angle) <= 1 &&
      runtime.cometRight.angularVelocity === 0 &&
      runtime.cometLeft.angularVelocity === 0 &&
      runtime.nukeLifecycle.projectileKey === "nuke" &&
      runtime.nukeLifecycle.projectileCountBeforeBurst >= 1 &&
      runtime.nukeLifecycle.projectileCountAfterBurst === 0 &&
      runtime.nukeLifecycle.burstKey === "nukeBurst" &&
      runtime.nukeLifecycle.particleManagers === 0 &&
      hasVictoryValues &&
      JSON.stringify(victoryZones) === JSON.stringify(["MENU", "NEXT", "REPLAY"]) &&
      levelCompleteNextWorks === true &&
      JSON.stringify(gameOverButtons) === JSON.stringify(["buttonMenuOff", "buttonReplayOff", "buttonTryAgainOff"]) &&
      gameOverSurface.buttons.every((button) => button.width > 120 && button.height > 30) &&
      gameOverTryAgainWorks === true &&
      runtimeExceptions.length === 0 &&
      networkFailures.length === 0;

    fs.writeFileSync(path.join(evidenceDir, "APP4_SEMANTIC_RUNTIME_REPORT.json"), `${JSON.stringify(report, null, 2)}\n`);
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
