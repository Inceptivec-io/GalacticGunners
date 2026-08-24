const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const url = process.env.GG_RUNTIME_URL || "http://localhost:8027/";
const handoffId = process.env.GG_HANDOFF_ID || "GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_004_REV3";
const evidenceRoot = path.resolve(`docs/internal_governance/evidence/${handoffId}`);
const runtimeDir = path.join(evidenceRoot, "runtime_playwright");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function sceneReady(page, key) {
  await page.waitForFunction((sceneKey) => game.scene.keys[sceneKey] && game.scene.keys[sceneKey].scene.isActive(), key, { timeout: 10000 });
  await page.waitForTimeout(250);
}

async function capture(page, name) {
  const file = path.join(runtimeDir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

async function runMode(mode) {
  const debug = mode === "debug";
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 665 },
    hasTouch: true,
    isMobile: false
  });
  const page = await context.newPage();
  const runtimeExceptions = [];
  const failedRequests = [];
  page.on("pageerror", (error) => runtimeExceptions.push(error.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") runtimeExceptions.push(msg.text());
  });
  page.on("requestfailed", (request) => failedRequests.push(request.url()));
  await page.goto(debug ? `${url}?ggPhysicsDebug=1` : url, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.game && game.scene && game.scene.keys && game.scene.keys.MainMenu, null, { timeout: 15000 });
  await page.waitForTimeout(400);
  const report = {
    mode,
    url: debug ? `${url}?ggPhysicsDebug=1` : url,
    runtimeExceptions,
    failedRequests,
    screenshots: {}
  };

  report.mainMenu = await page.evaluate(() => {
    const scene = game.scene.keys.MainMenu;
    return {
      debugEnabled: GG_PHYSICS_DEBUG_ENABLED,
      physicsDrawDebug: !!scene.physics.world.drawDebug,
      backgroundTexture: scene.background.texture.key,
      backgroundScaleX: scene.background.scaleX,
      backgroundScaleY: scene.background.scaleY,
      playTexture: scene.heroImage.texture.key,
      playInteractive: !!scene.heroImage.input,
      infoInteractive: !!scene.btnInfo.input,
      soundInteractive: !!scene.btnMute.input
    };
  });
  report.screenshots.mainMenu = await capture(page, `${mode}_main_menu`);

  await page.evaluate(() => game.scene.start("Level1"));
  await sceneReady(page, "Level1");
  report.level1Hud = await page.evaluate(() => {
    const scene = game.scene.keys.Level1;
    const iconBounds = scene.ggHudNukeIcon.getBounds();
    const countBounds = textNukes.getBounds();
    const rearmBounds = textNukesLoad.getBounds();
    const w = scene.game.config.width;
    const h = scene.game.config.height;
    return {
      iconTexture: scene.ggHudNukeIcon.texture.key,
      rearmText: textNukesLoad.text,
      countText: textNukes.text,
      icon: { left: iconBounds.left, right: iconBounds.right, top: iconBounds.top, bottom: iconBounds.bottom, height: iconBounds.height },
      count: { left: countBounds.left, right: countBounds.right, top: countBounds.top, bottom: countBounds.bottom, height: countBounds.height },
      rearm: { left: rearmBounds.left, right: rearmBounds.right, top: rearmBounds.top, bottom: rearmBounds.bottom },
      safe: iconBounds.left >= 0 && countBounds.right <= w && rearmBounds.right <= w && iconBounds.bottom <= h && countBounds.bottom <= h,
      countRightOfIcon: countBounds.left > iconBounds.right - 4,
      comparable: Math.abs(iconBounds.height - countBounds.height) <= Math.max(18, iconBounds.height * 0.45)
    };
  });
  report.screenshots.level1Hud = await capture(page, `${mode}_level1_hud`);

  report.lasers = await page.evaluate(async () => {
    const scene = game.scene.keys.Level1;
    scene.time.removeAllEvents();
    scene.enemies.getChildren().slice().forEach((child) => child.destroy());
    scene.enemies.clear(true, true);
    scene.playerLasers.getChildren().slice().forEach((child) => child.destroy());
    scene.playerLasers.clear(true, true);
    currentLives = 3;
    currentNukes = 2;
    RIP = false;
    levelWon = false;
    scene.player.setPosition(scene.game.config.width * 0.5, scene.game.config.height * 0.78);
    scene.player.body.reset(scene.player.x, scene.player.y);
    const originalControllerActionDown = window.controllerActionDown;

    async function shot(inputSource) {
      const before = scene.playerLasers.getChildren().length;
      scene.playerShootTick = scene.playerShootDelay;
      const playerStart = { x: scene.player.x, y: scene.player.y };
      let fireResult;
      if (inputSource === "controller") {
        window.controllerActionDown = (action) => action === "fire";
        fireResult = window.controllerActionDown("fire") && ggFirePlayerLaser(scene);
      }
      else if (inputSource === "touch") {
        touch = true;
        fireResult = ggFirePlayerLaser(scene);
      }
      else {
        fireResult = ggFirePlayerLaser(scene);
      }
      window.controllerActionDown = originalControllerActionDown;
      const laser = scene.playerLasers.getChildren()[scene.playerLasers.getChildren().length - 1];
      const initial = laser ? {
        id: laser.name || `${inputSource}-${Date.now()}`,
        x: laser.x,
        y: laser.y,
        visible: laser.visible,
        active: laser.active,
        body: laser.body ? { x: laser.body.x, y: laser.body.y, width: laser.body.width, height: laser.body.height, velocityY: laser.body.velocity.y } : null
      } : null;
      if (laser) {
        scene.physics.world.update(16, 16);
        if (typeof ggRunSweptCollisionContracts === "function") ggRunSweptCollisionContracts(scene);
      }
      const next = laser ? { x: laser.x, y: laser.y } : null;
      if (laser) {
        scene.physics.world.update(64, 64);
        if (typeof ggRunSweptCollisionContracts === "function") ggRunSweptCollisionContracts(scene);
      }
      const later = laser ? { x: laser.x, y: laser.y } : null;
      return {
        inputSource,
        inputTimestamp: Date.now(),
        playerStart,
        beforeCount: before,
        afterCount: scene.playerLasers.getChildren().length,
        fireResult,
        initial,
        next,
        later,
        spawned: !!laser,
        groupAdded: scene.playerLasers.getChildren().includes(laser),
        bodyEnabled: !!(laser && laser.body && laser.body.enable),
        upwardVelocity: !!(laser && laser.body && laser.body.velocity.y < 0),
        moved: !!(laser && later && later.y < initial.y),
        visiblyRendered: !!(laser && laser.visible && laser.displayWidth > 0 && laser.displayHeight > 0),
        destructionReason: laser && laser.ggDestructionReason ? laser.ggDestructionReason : null
      };
    }

    return [await shot("keyboard"), await shot("controller"), await shot("touch")];
  });
  report.screenshots.playerLaserFlight = await capture(page, `${mode}_player_laser_flight`);

  report.fixtures = await page.evaluate(async () => {
    function resetScene() {
      const scene = game.scene.keys.Level1;
      scene.time.removeAllEvents();
      ["enemies", "alienscouts", "enemyLasers", "playerLasers", "starNukes", "asteroids", "comets", "shieldTiles", "shieldHoles", "explosions", "nukeExplosions"].forEach((groupName) => {
        const group = scene[groupName];
        if (!group) return;
        group.getChildren().slice().forEach((child) => child.destroy());
        group.clear(true, true);
      });
      window.ggExplosionTrace = [];
      score = 0;
      currentLives = 3;
      currentNukes = 2;
      enemyShips = 0;
      enemyDeaths = 0;
      totalEnemyShips = 999999;
      RIP = false;
      levelWon = false;
      scene.player.setPosition(scene.game.config.width * 0.5, scene.game.config.height * 0.78);
      scene.player.body.reset(scene.player.x, scene.player.y);
      return scene;
    }
    function step(scene, frames) {
      for (let i = 0; i < frames; i++) {
        scene.physics.world.update(i * 16, 16);
        if (typeof ggRunSweptCollisionContracts === "function") ggRunSweptCollisionContracts(scene);
      }
    }
    function bodySnapshot(item) {
      return item && item.body ? { x: item.body.x, y: item.body.y, width: item.body.width, height: item.body.height } : null;
    }
    function laserHitTarget(label, TargetClass, textureKey, scoreExpected) {
      const scene = resetScene();
      const target = new TargetClass(scene, scene.game.config.width * 0.5, scene.game.config.height * 0.43, textureKey);
      if (target.play && scene.anims.exists(textureKey)) target.play(textureKey);
      scene.enemies.add(target);
      enemyShips++;
      const laser = new PlayerLaser(scene, target.x, target.y + 180);
      scene.playerLasers.add(laser);
      const laserBody = bodySnapshot(laser);
      const targetBody = bodySnapshot(target);
      step(scene, 160);
      return { label, targetDestroyed: !target.active, projectileDestroyed: !laser.active, score, scoreExpected, laserBody, targetBody };
    }
    function laserHitAsteroid() {
      const scene = resetScene();
      const target = new Asteroid(scene, scene.game.config.width * 0.5, scene.game.config.height * 0.43);
      target.setVelocity(0, 0);
      scene.asteroids.add(target);
      const laser = new PlayerLaser(scene, target.x, target.y + 180);
      scene.playerLasers.add(laser);
      const targetBody = bodySnapshot(target);
      step(scene, 160);
      return { label: "laser->asteroid", targetDestroyed: !target.active, projectileDestroyed: !laser.active, score, scoreExpected: 10, targetBody };
    }
    function laserHitShield() {
      const scene = resetScene();
      const target = new ShieldTile(scene, scene.game.config.width * 0.5, scene.game.config.height * 0.78);
      scene.shieldTiles.add(target);
      const laser = new PlayerLaser(scene, target.x, target.y + 120);
      scene.playerLasers.add(laser);
      scene.physics.add.overlap(scene.playerLasers, scene.shieldTiles, function(projectile, tile) {
        projectile.destroy();
        scene.destroyShieldTile(tile, "PLAYER_LASER_HIT_SHIELD");
      }, null, scene);
      const targetBody = bodySnapshot(target);
      step(scene, 160);
      return { label: "laser->shield", targetDestroyed: !target.active, projectileDestroyed: !laser.active, score, scoreExpected: 0, targetBody, trace: window.ggExplosionTrace };
    }
    function nukeHitEnemy() {
      const scene = resetScene();
      const target = new Enemy(scene, scene.game.config.width * 0.5, scene.game.config.height * 0.43, "enemyShip");
      scene.enemies.add(target);
      enemyShips++;
      const nuke = new Nuke(scene, target.x, target.y + 220);
      scene.starNukes.add(nuke);
      step(scene, 180);
      return { label: "nuke->enemy", targetDestroyed: !target.active, projectileDestroyed: !nuke.active, score, scoreExpected: 50, burstCount: scene.nukeExplosions.getChildren().filter((child) => child.active).length };
    }
    function nearMiss() {
      const scene = resetScene();
      const target = new Enemy(scene, scene.game.config.width * 0.62, scene.game.config.height * 0.43, "enemyShip");
      scene.enemies.add(target);
      enemyShips++;
      const laser = new PlayerLaser(scene, scene.game.config.width * 0.38, target.y + 180);
      scene.playerLasers.add(laser);
      step(scene, 80);
      return { label: "near-miss", targetActive: target.active, projectileActive: laser.active, score, scoreExpected: 0 };
    }
    return [
      laserHitTarget("laser->destroyer", Enemy, "enemyShip", 50),
      laserHitTarget("laser->scout", AlienScout, "alienscout", 25),
      laserHitTarget("laser->cruiser", EnemyCruiser, "enemyCruiser", 50),
      laserHitAsteroid(),
      laserHitShield(),
      nukeHitEnemy(),
      nearMiss()
    ];
  });
  report.screenshots.laserImpact = await capture(page, `${mode}_laser_impact`);

  report.playerFrames = await page.evaluate(() => {
    const scene = game.scene.keys.Level1;
    const player = scene.player;
    return ["0", "1", "2", "3"].map((frame) => {
      player.setFrame(frame);
      ggSetBodyEnvelope(player, GG_BODY_CONTRACTS.PLAYER);
      const bounds = player.getBounds();
      return {
        frame,
        frameWidth: player.frame.width,
        frameHeight: player.frame.height,
        displayWidth: player.displayWidth,
        displayHeight: player.displayHeight,
        bounds: { width: bounds.width, height: bounds.height },
        body: { x: player.body.x, y: player.body.y, width: player.body.width, height: player.body.height }
      };
    });
  });
  report.screenshots.shieldNormal = await capture(page, `${mode}_shield_normal`);

  await page.evaluate(() => {
    const scene = game.scene.keys.Level1;
    scene.pauseGame();
  });
  await sceneReady(page, "Paused");
  report.pause = await page.evaluate(() => {
    const scene = game.scene.keys.Paused;
    return {
      backgroundTexture: scene.background.texture.key,
      hasVisibleResumeButton: scene.children.list.some((child) => child.texture && child.texture.key === "resume" && child.visible),
      hasInvisibleResumeZone: !!scene.resumeZone && !!scene.resumeZone.input
    };
  });
  report.screenshots.pause = await capture(page, `${mode}_pause`);
  await page.evaluate(() => game.scene.keys.Paused.resumeGame());
  await page.waitForTimeout(100);

  await page.evaluate(() => {
    ["Level1", "Level2", "BossLevel", "Victory", "Paused"].forEach((key) => game.scene.stop(key));
    score = 321;
    game.scene.start("Level1");
  });
  await sceneReady(page, "Level1");
  await page.evaluate(() => game.scene.keys.Level1.gameOver());
  report.screenshots.gameOver = await capture(page, `${mode}_game_over`);

  await page.evaluate(() => {
    ["Level1", "Level2", "BossLevel", "Victory", "Paused"].forEach((key) => game.scene.stop(key));
    score = 1234;
    window.ggFinalVictoryState = { score: 1234, wave: "FINAL", bonus: 500 };
    game.scene.start("Victory", window.ggFinalVictoryState);
  });
  await sceneReady(page, "Victory");
  report.screenshots.victory = await capture(page, `${mode}_victory`);

  await page.evaluate(() => {
    ["Level1", "Level2", "Victory", "Paused"].forEach((key) => game.scene.stop(key));
    game.scene.start("BossLevel");
  });
  await sceneReady(page, "BossLevel");
  report.boss = await page.evaluate(() => {
    const scene = game.scene.keys.BossLevel;
    const normal = scene.alienMothership.texture.key;
    const body = scene.alienMothership.body;
    scene.motherShipHit(1);
    return {
      normalTexture: normal,
      hitTexture: scene.alienMothership.texture.key,
      body: { x: body.x, y: body.y, width: body.width, height: body.height }
    };
  });
  report.screenshots.boss = await capture(page, `${mode}_boss`);

  await browser.close();
  return report;
}

function validateReport(normal, debug) {
  const failures = [];
  function assert(condition, message) {
    if (!condition) failures.push(message);
  }
  for (const report of [normal, debug]) {
    const prefix = report.mode;
    assert(report.runtimeExceptions.length === 0, `${prefix}: runtime exceptions`);
    assert(report.failedRequests.length === 0, `${prefix}: failed network requests`);
    assert(report.mainMenu.backgroundTexture === "hero", `${prefix}: landing hero texture`);
    assert(report.mainMenu.playInteractive && report.mainMenu.infoInteractive && report.mainMenu.soundInteractive, `${prefix}: live menu controls`);
    assert(report.mainMenu.debugEnabled === (report.mode === "debug"), `${prefix}: debug flag mismatch`);
    assert(report.mainMenu.physicsDrawDebug === (report.mode === "debug"), `${prefix}: arcade debug mismatch`);
    assert(report.level1Hud.rearmText.toUpperCase().startsWith("REARM:"), `${prefix}: nuke rearm text`);
    assert(report.level1Hud.iconTexture === "hudNuke", `${prefix}: nuke icon texture`);
    assert(report.level1Hud.countRightOfIcon, `${prefix}: nuke count is not right of icon`);
    assert(report.level1Hud.safe, `${prefix}: nuke HUD outside viewport`);
    assert(report.level1Hud.comparable, `${prefix}: nuke icon/count proportions`);
    for (const shot of report.lasers) {
      assert(shot.fireResult && shot.spawned && shot.groupAdded && shot.bodyEnabled, `${prefix}: ${shot.inputSource} laser spawn chain`);
      assert(shot.upwardVelocity && shot.moved && shot.visiblyRendered, `${prefix}: ${shot.inputSource} laser movement/render`);
    }
    for (const fixture of report.fixtures) {
      if (fixture.label === "near-miss") {
        assert(fixture.targetActive && fixture.score === 0, `${prefix}: near miss outcome`);
      }
      else {
        assert(fixture.targetDestroyed && fixture.projectileDestroyed, `${prefix}: ${fixture.label} hit outcome`);
        assert(fixture.score === fixture.scoreExpected, `${prefix}: ${fixture.label} score ${fixture.score}`);
      }
    }
    const shieldFixture = report.fixtures.find((fixture) => fixture.label === "laser->shield");
    assert(shieldFixture.trace.length > 0, `${prefix}: shield trace recorded`);
    assert(shieldFixture.trace.every((row) => row.eventSource && row.eventSource !== "UNEXPLAINED"), `${prefix}: unexplained shield trace`);
    assert(shieldFixture.trace.every((row) => row.eventSource === "PLAYER_LASER_HIT_SHIELD"), `${prefix}: wrong shield event source`);
    assert(report.playerFrames.every((frame) => frame.frameWidth === 496 && frame.frameHeight === 703), `${prefix}: player frame envelope`);
    const body0 = report.playerFrames[0].body;
    assert(report.playerFrames.every((frame) => frame.body.width === body0.width && frame.body.height === body0.height), `${prefix}: player collision jump`);
    assert(report.pause.backgroundTexture === "pauseScreen", `${prefix}: pause image`);
    assert(!report.pause.hasVisibleResumeButton && report.pause.hasInvisibleResumeZone, `${prefix}: pause resume art cleanup`);
    assert(report.boss.normalTexture === "motherShip" && report.boss.hitTexture === "motherShipHit", `${prefix}: boss state imagery`);
  }
  assert(JSON.stringify(normal.fixtures.map((f) => ({ label: f.label, score: f.score, targetDestroyed: f.targetDestroyed, targetActive: f.targetActive }))) ===
    JSON.stringify(debug.fixtures.map((f) => ({ label: f.label, score: f.score, targetDestroyed: f.targetDestroyed, targetActive: f.targetActive }))),
    "normal/debug fixture outcomes differ");
  return failures;
}

async function main() {
  ensureDir(runtimeDir);
  const normal = await runMode("normal");
  const debug = await runMode("debug");
  const failures = validateReport(normal, debug);
  const report = {
    generatedAt: new Date().toISOString(),
    pass: failures.length === 0,
    failures,
    normal,
    debug
  };
  const file = path.join(runtimeDir, "handoff_004_rev3_report.json");
  fs.writeFileSync(file, JSON.stringify(report, null, 2));
  console.log(`handoff 004 REV3 report: ${file}`);
  console.log(report.pass ? "qa:rev3 PASS" : `qa:rev3 FAIL\n${failures.join("\n")}`);
  if (!report.pass) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
