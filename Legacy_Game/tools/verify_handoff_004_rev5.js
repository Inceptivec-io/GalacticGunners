const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const url = process.env.GG_RUNTIME_URL || "http://localhost:8027/";
const handoffId = process.env.GG_HANDOFF_ID || "GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_004_REV5";
const evidenceRoot = path.resolve(`docs/internal_governance/evidence/${handoffId}`);
const runtimeDir = path.join(evidenceRoot, "runtime_playwright");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readAssetSource(file) {
  return fs.readFileSync(path.resolve(file), "utf8");
}

function sourceAudit() {
  const files = ["assets/js/level1.js", "assets/js/level2.js", "assets/js/bosslevel.js"];
  const failures = [];
  const data = Object.fromEntries(files.map((file) => [file, readAssetSource(file)]));
  const runtime = readAssetSource("assets/js/gg_runtime.js");
  const preloader = readAssetSource("assets/js/preloader.js");
  const menu = readAssetSource("assets/js/mainmenu.js");

  for (const [file, source] of Object.entries(data)) {
    if (!source.includes("ggHandlePlayerFiring(this, fireDown, nukeDown);")) failures.push(`${file}: shared immediate-fire helper not installed`);
    if (source.includes("createExplosion(laser.x, laser.y)")) failures.push(`${file}: projectile cull still creates explosion`);
    if (!source.includes("ggClampPlayerToWorld(this);")) failures.push(`${file}: player clamp not installed`);
    if (source.includes("destroyShieldTile(tile, \"PLAYER_LASER_HIT_SHIELD\")")) failures.push(`${file}: player laser still destroys shield`);
    if (/scene\.onLifeDown\(\)|this\.onLifeDown\(\)/.test(source.match(/overlap\(this\.player,[\s\S]{0,500}/g)?.join("\n") || "")) {
      failures.push(`${file}: direct player body overlap contains life damage`);
    }
  }
  if (!runtime.includes("function ggResolveEnemyLaserPlayerHit")) failures.push("gg_runtime.js: enemy laser resolver missing");
  if (!runtime.includes("projectile.ggResolved = true")) failures.push("gg_runtime.js: projectile idempotency missing");
  if (!runtime.includes("score = ggScoreValue(score + amount);")) failures.push("gg_runtime.js: score clamp not enforced");
  if (!preloader.includes("gg_hero_image_player_fighting_v002_4k_uhd_master.png")) failures.push("preloader.js: REV5 hero not preloaded");
  if (!preloader.includes("gg_pause_screen_v2.1_4k_uhd_master.png")) failures.push("preloader.js: REV5 pause not preloaded");
  if (!menu.includes("gg_hero_image_player_fighting_v002_4k_uhd_master.png")) failures.push("mainmenu.js: REV5 hero not used");
  for (const file of files.concat(["assets/js/preloader.js", "assets/js/mainmenu.js"])) {
    const source = file.endsWith("preloader.js") ? preloader : file.endsWith("mainmenu.js") ? menu : data[file];
    if (source && source.includes("gg_victory_scene_aliens_v001")) failures.push(`${file}: future victory alien master is active runtime`);
    if (source && source.includes("gg_victory_scene_player_v001")) failures.push(`${file}: future victory player master is active runtime`);
  }
  return { pass: failures.length === 0, failures };
}

async function sceneReady(page, key) {
  await page.waitForFunction((sceneKey) => {
    const scene = game.scene.keys[sceneKey];
    return scene && scene.scene && scene.scene.isActive();
  }, key, { timeout: 10000 });
  await page.waitForTimeout(300);
}

async function capture(page, name) {
  ensureDir(runtimeDir);
  const file = path.join(runtimeDir, name.endsWith(".png") ? name : `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

async function runtimeAudit() {
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

  const report = { url, runtimeExceptions, failedRequests, screenshots: {} };
  try {
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForFunction(() => window.game && game.scene && game.scene.keys && game.scene.keys.MainMenu, null, { timeout: 15000 });
    await page.waitForTimeout(700);

    report.mainMenu = await page.evaluate(() => {
      const scene = game.scene.keys.MainMenu;
      const w = scene.game.config.width;
      const h = scene.game.config.height;
      const heroTexture = game.textures.get("hero");
      const heroSource = heroTexture && heroTexture.source && heroTexture.source[0] ? heroTexture.source[0].url || "" : "";
      const coverScale = Math.max(w / scene.background.width, h / scene.background.height);
      const containScale = Math.min(w / scene.background.width, h / scene.background.height);
      return {
        heroSource,
        scaleX: scene.background.scaleX,
        scaleY: scene.background.scaleY,
        containScale,
        coverScale,
        fitsEntireHero: Math.abs(scene.background.scaleX - containScale) < 0.01,
        notDistorted: Math.abs(scene.background.scaleX - scene.background.scaleY) < 0.001,
        futureVictoryLoaded: game.textures.exists("gg_victory_scene_aliens_v001_4k_uhd_master") || game.textures.exists("gg_victory_scene_player_v001_4k_uhd_master")
      };
    });
    report.screenshots.mainMenu = await capture(page, "REV5_main_menu_hero_fit.png");

    await page.evaluate(() => game.scene.start("Level1"));
    await sceneReady(page, "Level1");
    report.level1 = await page.evaluate(async () => {
      function wait(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
      function resetScene() {
        const scene = game.scene.keys.Level1;
        scene.time.removeAllEvents();
        ["enemies", "enemyLasers", "playerLasers", "starNukes", "asteroids", "comets", "shieldTiles", "shieldHoles", "explosions", "nukeExplosions"].forEach((groupName) => {
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
        window.ggExplosionTrace = [];
        if (scene.physics.world.resume) scene.physics.world.resume();
        if (!scene.player || !scene.player.body) scene.createPlayer();
        scene.player.setPosition(scene.game.config.width * 0.5, scene.game.config.height * 0.76);
        scene.player.body.reset(scene.player.x, scene.player.y);
        return scene;
      }
      function step(scene, frames) {
        for (let i = 0; i < frames; i++) {
          scene.physics.world.update(i * 16, 16);
          ggRunSweptCollisionContracts(scene);
        }
      }

      let scene = resetScene();
      const bodyBefore = currentLives;
      const asteroid = new Asteroid(scene, scene.player.x, scene.player.y);
      scene.asteroids.add(asteroid);
      const enemy = new Enemy(scene, scene.player.x, scene.player.y, "enemyShip");
      scene.enemies.add(enemy);
      const comet = new Comet(scene, scene.player.x, scene.player.y);
      scene.comets.add(comet);
      step(scene, 4);
      const bodyOverlap = {
        livesBefore: bodyBefore,
        livesAfter: currentLives,
        playerActive: scene.player.active,
        explosions: window.ggExplosionTrace.length
      };

      scene = resetScene();
      const playerLaserCountBefore = scene.playerLasers.getChildren().length;
      scene.ggFireHeld = false;
      scene.playerShootTick = 0;
      ggHandlePlayerFiring(scene, true, false);
      const firstKeyboardShot = {
        before: playerLaserCountBefore,
        after: scene.playerLasers.getChildren().length
      };
      for (let i = 0; i < 650; i++) ggHandlePlayerFiring(scene, true, false);
      const heldFire = {
        projectileCount: scene.playerLasers.getChildren().length,
        livesAfter: currentLives
      };

      scene = resetScene();
      const playerLaser = new PlayerLaser(scene, scene.player.x, 8);
      scene.playerLasers.add(playerLaser);
      const enemyLaser = new EnemyLaser(scene, scene.player.x, scene.game.config.height - 8);
      scene.enemyLasers.add(enemyLaser);
      scene.updateLasers();
      await wait(220);
      const silentCull = {
        playerLaserActive: playerLaser.active,
        enemyLaserActive: enemyLaser.active,
        explosions: window.ggExplosionTrace.length
      };

      scene = resetScene();
      const shieldTile = new ShieldTile(scene, scene.player.x, scene.player.y - 120);
      scene.shieldTiles.add(shieldTile);
      const shieldPlayerLaser = new PlayerLaser(scene, shieldTile.x, shieldTile.y + 80);
      scene.playerLasers.add(shieldPlayerLaser);
      step(scene, 80);
      const playerLaserShieldPass = {
        shieldActive: shieldTile.active,
        laserSide: shieldPlayerLaser.ggProjectileSide,
        scoreAfter: score
      };

      scene = resetScene();
      const shieldTileEnemy = new ShieldTile(scene, scene.player.x, scene.player.y - 120);
      scene.shieldTiles.add(shieldTileEnemy);
      const shieldEnemyLaser = new EnemyLaser(scene, shieldTileEnemy.x, shieldTileEnemy.y - 70);
      scene.enemyLasers.add(shieldEnemyLaser);
      scene.physics.add.overlap(scene.enemyLasers, scene.shieldTiles, function(projectile, target) {
        projectile.destroy();
        scene.destroyShieldTile(target, "ENEMY_LASER_HIT_SHIELD");
      }, null, scene);
      step(scene, 100);
      const enemyLaserShieldDamage = {
        shieldActive: shieldTileEnemy.active,
        laserActive: shieldEnemyLaser.active,
        scoreAfter: score
      };

      scene = resetScene();
      const beforeHitLives = currentLives;
      const hostileLaser = new EnemyLaser(scene, scene.player.x, scene.player.y - 110);
      scene.enemyLasers.add(hostileLaser);
      step(scene, 140);
      const enemyLaserPlayerDamage = {
        livesBefore: beforeHitLives,
        livesAfter: currentLives,
        laserActive: hostileLaser.active,
        playerHitExplosions: window.ggExplosionTrace.filter((item) => item.eventSource === "PLAYER_HIT_BY_REAL_COLLISION").length
      };

      scene = resetScene();
      scene.player.setPosition(-200, scene.game.config.height + 200);
      scene.player.body.reset(scene.player.x, scene.player.y);
      ggClampPlayerToWorld(scene);
      const bounds = scene.player.body;
      const playerClamp = {
        left: bounds.x,
        right: bounds.x + bounds.width,
        top: bounds.y,
        bottom: bounds.y + bounds.height,
        worldWidth: scene.game.config.width,
        worldHeight: scene.game.config.height
      };

      scene.pauseGame();
      await wait(120);
      const pauseScene = game.scene.keys.Paused;
      const pauseTexture = game.textures.get("pauseScreen");
      const pauseSource = pauseTexture && pauseTexture.source && pauseTexture.source[0] ? pauseTexture.source[0].url || "" : "";
      const pause = {
        active: pauseScene.scene.isActive(),
        texture: pauseScene.background.texture.key,
        source: pauseSource
      };
      if (pauseScene.scene.isActive()) pauseScene.resumeGame();

      return {
        bodyOverlap,
        firstKeyboardShot,
        heldFire,
        silentCull,
        playerLaserShieldPass,
        enemyLaserShieldDamage,
        enemyLaserPlayerDamage,
        playerClamp,
        pause
      };
    });
    report.screenshots.level1 = await capture(page, "REV5_level1_runtime_contracts.png");
  } finally {
    await browser.close();
  }
  return report;
}

async function main() {
  ensureDir(runtimeDir);
  const source = sourceAudit();
  const runtime = await runtimeAudit();
  const failures = source.failures.slice();

  function assert(condition, message) {
    if (!condition) failures.push(message);
  }

  assert(runtime.runtimeExceptions.length === 0, "runtime exceptions");
  assert(runtime.failedRequests.length === 0, "failed requests");
  assert(runtime.mainMenu.heroSource === "" || runtime.mainMenu.heroSource.includes("gg_hero_image_player_fighting_v002_4k_uhd_master.png"), "REV5 hero source not loaded");
  assert(runtime.mainMenu.fitsEntireHero && runtime.mainMenu.notDistorted, "REV5 hero does not fit without distortion");
  assert(!runtime.mainMenu.futureVictoryLoaded, "future victory masters loaded at runtime");
  assert(runtime.level1.bodyOverlap.livesAfter === runtime.level1.bodyOverlap.livesBefore, "player body overlap caused damage");
  assert(runtime.level1.bodyOverlap.playerActive && runtime.level1.bodyOverlap.explosions === 0, "player body overlap produced combat effect");
  assert(runtime.level1.firstKeyboardShot.after === runtime.level1.firstKeyboardShot.before + 1, "first shot not immediate");
  assert(runtime.level1.heldFire.projectileCount > 1 && runtime.level1.heldFire.livesAfter === 3, "continuous fire not stable");
  assert(!runtime.level1.silentCull.playerLaserActive && !runtime.level1.silentCull.enemyLaserActive, "out-of-bounds projectile not culled");
  assert(runtime.level1.silentCull.explosions === 0, "out-of-bounds cull created explosion");
  assert(runtime.level1.playerLaserShieldPass.shieldActive && runtime.level1.playerLaserShieldPass.scoreAfter === 0, "player laser did not pass shield");
  assert(!runtime.level1.enemyLaserShieldDamage.shieldActive && !runtime.level1.enemyLaserShieldDamage.laserActive, "enemy laser did not damage shield");
  assert(runtime.level1.enemyLaserShieldDamage.scoreAfter === 0, "enemy shield damage score was not clamped");
  assert(runtime.level1.enemyLaserPlayerDamage.livesAfter === runtime.level1.enemyLaserPlayerDamage.livesBefore - 1, "enemy laser did not damage player exactly once");
  assert(!runtime.level1.enemyLaserPlayerDamage.laserActive && runtime.level1.enemyLaserPlayerDamage.playerHitExplosions === 1, "enemy laser/player hit resolution incorrect");
  assert(runtime.level1.playerClamp.left >= -1 && runtime.level1.playerClamp.top >= -1, "player clamp allows negative bounds");
  assert(runtime.level1.playerClamp.right <= runtime.level1.playerClamp.worldWidth + 1, "player clamp allows right overflow");
  assert(runtime.level1.playerClamp.bottom <= runtime.level1.playerClamp.worldHeight + 1, "player clamp allows bottom overflow");
  assert(runtime.level1.pause.active && runtime.level1.pause.texture === "pauseScreen", "pause scene not active with pause texture");
  assert(runtime.level1.pause.source === "" || runtime.level1.pause.source.includes("gg_pause_screen_v2.1_4k_uhd_master.png"), "REV5 pause source not loaded");

  const report = {
    generatedAt: new Date().toISOString(),
    handoffId,
    source,
    runtime,
    pass: failures.length === 0,
    failures
  };
  const file = path.join(runtimeDir, "handoff_004_rev5_report.json");
  fs.writeFileSync(file, JSON.stringify(report, null, 2));
  console.log(`handoff 004 REV5 report: ${file}`);
  console.log(report.pass ? "qa:rev5 PASS" : `qa:rev5 FAIL\n${failures.join("\n")}`);
  if (!report.pass) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
