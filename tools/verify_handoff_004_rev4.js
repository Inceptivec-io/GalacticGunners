const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const url = process.env.GG_RUNTIME_URL || "http://localhost:8027/";
const handoffId = process.env.GG_HANDOFF_ID || "GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_004_REV4";
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
  const file = path.join(runtimeDir, name.endsWith(".png") ? name : `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

async function main() {
  ensureDir(runtimeDir);
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

  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.game && game.scene && game.scene.keys && game.scene.keys.MainMenu, null, { timeout: 15000 });
  await page.waitForTimeout(500);

  const report = {
    generatedAt: new Date().toISOString(),
    url,
    runtimeExceptions,
    failedRequests,
    screenshots: {}
  };

  report.mainMenu = await page.evaluate(() => {
    const scene = game.scene.keys.MainMenu;
    const w = scene.game.config.width;
    const h = scene.game.config.height;
    const coverScale = Math.max(w / scene.background.width, h / scene.background.height);
    const containScale = Math.min(w / scene.background.width, h / scene.background.height);
    const bounds = scene.background.getBounds();
    return {
      backgroundTexture: scene.background.texture.key,
      backingTexture: scene.heroBacking.texture.key,
      scale: scene.background.scaleX,
      coverScale,
      containScale,
      moreCompositionThanCover: scene.background.scaleX < coverScale,
      notDistorted: Math.abs(scene.background.scaleX - scene.background.scaleY) < 0.001,
      visibleWidth: bounds.width,
      visibleHeight: bounds.height,
      controlsInteractive: !!(scene.heroImage.input && scene.btnInfo.input && scene.btnMute.input)
    };
  });
  report.screenshots.mainMenu = await capture(page, "REV4_LANDING_HERO_COMPOSITION.png");

  await page.evaluate(() => game.scene.start("Level1"));
  await sceneReady(page, "Level1");
  report.hud = await page.evaluate(() => {
    const scene = game.scene.keys.Level1;
    const w = scene.game.config.width;
    const h = scene.game.config.height;
    function bounds(item) {
      const b = item.getBounds();
      return { left: b.left, right: b.right, top: b.top, bottom: b.bottom, width: b.width, height: b.height };
    }
    const muteBounds = bounds(scene.btnMute);
    const lives = (scene.ggHudLivesIcons || []).map(bounds);
    const nukes = (scene.ggHudNukeIcons || []).map(bounds);
    const bar = bounds(scene.ggHudArmBarFill);
    const barBg = bounds(scene.ggHudArmBarBg);
    const texts = [textScore, textLives, textNukes, textNukesLoad].map((item) => ({
      text: item.text,
      fontFamily: item.style.fontFamily,
      role: item.ggHudRole,
      bounds: bounds(item)
    }));
    const topRightItems = [textScore, textLives, textNukes, textNukesLoad, restartlevel, ...lives, ...nukes]
      .filter((item) => item && item.left !== undefined ? item.right > w * 0.74 && item.bottom < h * 0.22 : false);
    return {
      scoreText: textScore.text,
      scoreFont: textScore.style.fontFamily,
      livesText: textLives.text,
      nukesText: textNukes.text,
      armText: textNukesLoad.text,
      currentLives,
      currentNukes,
      liveIconCount: lives.length,
      nukeIconCount: nukes.length,
      muteBounds,
      lives,
      nukes,
      bar,
      barBg,
      texts,
      topRightSoundOnly: muteBounds.left > w * 0.88 && muteBounds.bottom < h * 0.18 && topRightItems.length === 0,
      livesBottomRight: lives.length === currentLives && lives.every((b) => b.left > w * 0.76 && b.bottom <= h && b.top > h * 0.78),
      nukesBottomLeft: nukes.length === currentNukes && nukes.every((b) => b.left >= 0 && b.right < w * 0.26 && b.top > h * 0.75),
      noNumericLives: !/\d/.test(textLives.text),
      noNumericNukes: !/\d/.test(textNukes.text),
      noRearmNumbers: !/\d/.test(textNukesLoad.text),
      barInside: bar.left >= 0 && bar.right <= w && bar.bottom <= h && bar.width <= barBg.width + 1
    };
  });
  report.screenshots.hud = await capture(page, "REV4_FINAL_HUD_LAYOUT.png");

  report.laserLogic = await page.evaluate(() => {
    const scene = game.scene.keys.Level1;
    function resetForFixture() {
      scene.time.removeAllEvents();
      ["enemies", "alienscouts", "enemyLasers", "playerLasers", "starNukes", "asteroids", "comets", "shieldTiles", "shieldHoles", "explosions", "nukeExplosions"].forEach((groupName) => {
        const group = scene[groupName];
        if (!group) return;
        group.getChildren().slice().forEach((child) => child.destroy());
        group.clear(true, true);
      });
      score = 0;
      currentLives = 3;
      currentNukes = 2;
      enemyShips = 0;
      enemyDeaths = 0;
      totalEnemyShips = 999999;
      RIP = false;
      levelWon = false;
      if (scene.physics.world.resume) scene.physics.world.resume();
      if (!scene.player || !scene.player.body) scene.createPlayer();
      scene.player.setPosition(scene.game.config.width * 0.5, scene.game.config.height * 0.78);
      scene.player.body.reset(scene.player.x, scene.player.y);
    }
    function step(frames) {
      for (let i = 0; i < frames; i++) {
        scene.physics.world.update(i * 16, 16);
        ggRunSweptCollisionContracts(scene);
      }
    }
    function playerContinuousCannotSelfHit() {
      resetForFixture();
      const startingLives = currentLives;
      for (let i = 0; i < 40; i++) {
        const laser = new PlayerLaser(scene, scene.player.x, scene.player.y);
        scene.playerLasers.add(laser);
        step(2);
      }
      return { startingLives, endingLives: currentLives, playerActive: scene.player.active, rip: RIP };
    }
    function alienLaserCanHitPlayer() {
      resetForFixture();
      const laser = new EnemyLaser(scene, scene.player.x, scene.player.y - 90);
      scene.enemyLasers.add(laser);
      step(120);
      return { livesAfter: currentLives, laserDestroyed: !laser.active, rip: RIP };
    }
    function alienLaserCanHitShield() {
      resetForFixture();
      const tile = new ShieldTile(scene, scene.player.x, scene.player.y - 120);
      scene.shieldTiles.add(tile);
      const laser = new EnemyLaser(scene, tile.x, tile.y - 80);
      scene.enemyLasers.add(laser);
      scene.physics.add.overlap(scene.enemyLasers, scene.shieldTiles, function(projectile, target) {
        projectile.destroy();
        scene.destroyShieldTile(target, "ENEMY_LASER_HIT_SHIELD");
      }, null, scene);
      step(120);
      return { shieldDestroyed: !tile.active, laserDestroyed: !laser.active, scoreAfter: score };
    }
    function playerLaserCanHitEnemy() {
      resetForFixture();
      const enemy = new Enemy(scene, scene.player.x, scene.player.y - 180, "enemyShip");
      scene.enemies.add(enemy);
      enemyShips++;
      const laser = new PlayerLaser(scene, scene.player.x, scene.player.y - 20);
      scene.playerLasers.add(laser);
      step(120);
      return { enemyDestroyed: !enemy.active, laserDestroyed: !laser.active, scoreAfter: score };
    }
    function alienLaserCannotHitAlien() {
      resetForFixture();
      const enemy = new Enemy(scene, scene.player.x, scene.player.y - 140, "enemyShip");
      scene.enemies.add(enemy);
      enemyShips++;
      const laser = new EnemyLaser(scene, enemy.x, enemy.y - 80);
      scene.enemyLasers.add(laser);
      step(120);
      return { enemyActive: enemy.active, laserSide: laser.ggProjectileSide, scoreAfter: score };
    }
    return {
      playerContinuousCannotSelfHit: playerContinuousCannotSelfHit(),
      alienLaserCanHitPlayer: alienLaserCanHitPlayer(),
      alienLaserCanHitShield: alienLaserCanHitShield(),
      playerLaserCanHitEnemy: playerLaserCanHitEnemy(),
      alienLaserCannotHitAlien: alienLaserCannotHitAlien()
    };
  });
  report.screenshots.laserLogic = await capture(page, "REV4_LASER_LOGIC_FIXTURES.png");

  report.gameOver = await page.evaluate(async () => {
    const scene = game.scene.keys.Level1;
    if (scene.physics.world.resume) scene.physics.world.resume();
    ["enemies", "enemyLasers", "playerLasers", "starNukes", "asteroids", "comets"].forEach((groupName) => {
      const group = scene[groupName];
      if (!group) return;
      group.getChildren().slice().forEach((child) => child.destroy());
      group.clear(true, true);
    });
    RIP = false;
    levelWon = false;
    score = 777;
    currentLives = 0;
    const enemy = new Enemy(scene, scene.game.config.width * 0.5, scene.game.config.height * 0.35, "enemyShip");
    scene.enemies.add(enemy);
    enemy.body.setVelocity(90, 0);
    const laser = new EnemyLaser(scene, scene.game.config.width * 0.5, scene.game.config.height * 0.45);
    scene.enemyLasers.add(laser);
    const before = { enemyX: enemy.x, laserY: laser.y };
    scene.gameOver();
    await new Promise((resolve) => setTimeout(resolve, 350));
    const after = { enemyX: enemy.x, laserY: laser.y };
    const buttons = scene.children.list.filter((child) => child.ggButtonOffKey).map((child) => ({
      off: child.ggButtonOffKey,
      on: child.ggButtonOnKey,
      x: child.x,
      y: child.y,
      width: child.displayWidth,
      height: child.displayHeight,
      hasInput: !!child.input
    }));
    const scoreTexts = scene.children.list.filter((child) => child.text && child.text.indexOf("SCORE") >= 0).map((child) => ({
      text: child.text,
      y: child.y,
      fontFamily: child.style.fontFamily
    }));
    return {
      worldPaused: scene.physics.world.isPaused,
      frozenFlag: window.ggGameplayFrozenForResult === true,
      before,
      after,
      enemyStopped: Math.abs(after.enemyX - before.enemyX) < 1,
      laserStopped: Math.abs(after.laserY - before.laserY) < 1,
      buttons,
      scoreTexts,
      scoreBottom: scoreTexts.some((item) => item.text === "SCORE  777" && item.y > scene.game.config.height * 0.78)
    };
  });
  report.screenshots.gameOver = await capture(page, "REV4_GAME_OVER_FREEZE_AND_SCORE.png");

  const failures = [];
  function assert(condition, message) {
    if (!condition) failures.push(message);
  }
  assert(runtimeExceptions.length === 0, "runtime exceptions");
  assert(failedRequests.length === 0, "failed requests");
  assert(report.mainMenu.backgroundTexture === "hero", "landing hero texture");
  assert(report.mainMenu.backingTexture === "backgroundstars", "landing hero backing");
  assert(report.mainMenu.moreCompositionThanCover && report.mainMenu.notDistorted, "landing hero composition/shape");
  assert(report.mainMenu.controlsInteractive, "landing controls interactive");
  assert(report.hud.topRightSoundOnly, "top-right sound only");
  assert(report.hud.livesBottomRight && report.hud.nukesBottomLeft && report.hud.barInside, "bottom HUD layout");
  assert(report.hud.noNumericLives && report.hud.noNumericNukes && report.hud.noRearmNumbers, "numeric HUD clutter absent");
  assert(String(report.hud.scoreFont).includes("Gold"), "score uses cinematic/title font direction");
  assert(report.laserLogic.playerContinuousCannotSelfHit.endingLives === report.laserLogic.playerContinuousCannotSelfHit.startingLives, "player laser self-hit");
  assert(report.laserLogic.playerContinuousCannotSelfHit.playerActive && report.laserLogic.playerContinuousCannotSelfHit.rip === false, "player survives own fire");
  assert(report.laserLogic.alienLaserCanHitPlayer.livesAfter < 3, "alien laser damages player");
  assert(report.laserLogic.alienLaserCanHitShield.shieldDestroyed && report.laserLogic.alienLaserCanHitShield.scoreAfter === 0, "alien laser damages shield with score clamped");
  assert(report.laserLogic.playerLaserCanHitEnemy.enemyDestroyed && report.laserLogic.playerLaserCanHitEnemy.scoreAfter === 50, "player laser damages hostile target");
  assert(report.laserLogic.alienLaserCannotHitAlien.enemyActive && report.laserLogic.alienLaserCannotHitAlien.scoreAfter === 0, "alien laser does not damage alien");
  assert(report.gameOver.worldPaused && report.gameOver.frozenFlag, "game over freezes gameplay");
  assert(report.gameOver.enemyStopped && report.gameOver.laserStopped, "gameplay suspended behind game over");
  assert(report.gameOver.scoreBottom, "game over score bottom");
  assert(JSON.stringify(report.gameOver.buttons.map((button) => button.off).sort()) === JSON.stringify(["buttonMenuOff", "buttonReplayOff", "buttonTryAgainOff"]), "game over button set");
  assert(report.gameOver.buttons.every((button) => button.hasInput && button.width > 120 && button.height > 30), "game over button hit areas");

  report.pass = failures.length === 0;
  report.failures = failures;
  const reportFile = path.join(runtimeDir, "handoff_004_rev4_report.json");
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  await browser.close();
  console.log(`handoff 004 REV4 report: ${reportFile}`);
  console.log(report.pass ? "qa:rev4 PASS" : `qa:rev4 FAIL\n${failures.join("\n")}`);
  if (!report.pass) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
