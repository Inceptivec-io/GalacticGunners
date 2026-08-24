const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const { PNG } = require("pngjs");
const pixelmatchModule = require("pixelmatch");
const pixelmatch = pixelmatchModule.default || pixelmatchModule;

const modeArg = process.argv.find((arg) => arg.startsWith("--mode="));
const mode = modeArg ? modeArg.split("=")[1] : "all";
const url = process.env.GG_RUNTIME_URL || "http://localhost:8027/";
const evidenceRoot = path.resolve(process.env.GG_HANDOFF_ID
  ? `docs/internal_governance/evidence/${process.env.GG_HANDOFF_ID}`
  : "docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_004_REV1");
const runtimeDir = path.join(evidenceRoot, "runtime_playwright");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function waitForGame(page) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.game && game.scene && game.scene.keys && game.scene.keys.MainMenu && game.scene.keys.MainMenu.textTitle2, null, { timeout: 15000 });
}

async function capture(page, name) {
  const file = path.join(runtimeDir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

async function sceneReady(page, key) {
  await page.waitForFunction((sceneKey) => {
    const scene = game.scene.keys[sceneKey];
    return scene && scene.scene && scene.scene.isActive();
  }, key, { timeout: 10000 });
  await page.waitForTimeout(250);
}

async function runCollisionSuite(page) {
  return page.evaluate(async () => {
    function wait(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function startScene(key) {
      ["Level1", "Level2", "BossLevel", "Victory", "Titles", "Paused", "Info"].forEach((sceneKey) => {
        if (game.scene.keys[sceneKey] && sceneKey !== key) game.scene.stop(sceneKey);
      });
      game.scene.start(key);
      await wait(700);
      const scene = game.scene.keys[key];
      scene.time.removeAllEvents();
      ["enemies", "alienscouts", "enemyLasers", "playerLasers", "starNukes", "asteroids", "comets", "shieldTiles", "shieldHoles"].forEach((groupName) => {
        const group = scene[groupName];
        if (!group) return;
        group.getChildren().slice().forEach((child) => child.destroy());
        group.clear(true, true);
      });
      enemyShips = 0;
      enemyDeaths = 0;
      totalEnemyShips = 999999;
      return scene;
    }

    function step(scene, frames) {
      for (let i = 0; i < frames; i++) {
        scene.physics.world.update(i * 16, 16);
      }
    }

    async function playerLaserTrials(sceneKey, EnemyClass, textureKey, trials) {
      const scene = await startScene(sceneKey);
      currentLives = 999;
      currentNukes = 99;
      RIP = false;
      levelWon = false;
      totalEnemyShips = 999999;
      let hits = 0;
      let doubleScore = 0;
      for (let i = 0; i < trials; i++) {
        const x = scene.game.config.width * (0.18 + (i % 64) * 0.01);
        const y = scene.game.config.height * 0.42;
        const beforeScore = score;
        const beforeDeaths = enemyDeaths;
        const enemy = new EnemyClass(scene, x, y, textureKey);
        if (enemy.play && scene.anims.exists(textureKey)) enemy.play(textureKey);
        scene.enemies.add(enemy);
        enemyShips++;
        const laser = new PlayerLaser(scene, x, y + 140);
        scene.playerLasers.add(laser);
        step(scene, 90);
        await wait(0);
        if (!enemy.active && !laser.active && enemyDeaths === beforeDeaths + 1) hits++;
        if (score - beforeScore > GG_SCORE_EVENTS.SHIP_DESTROYED && textureKey !== "alienscout") doubleScore++;
      }
      return { sceneKey, trials, hits, doubleScore };
    }

    async function enemyLaserPlayerTrials(sceneKey, trials) {
      const scene = await startScene(sceneKey);
      currentLives = 999;
      RIP = false;
      levelWon = false;
      let hits = 0;
      let doubleLife = 0;
      for (let i = 0; i < trials; i++) {
        scene.player.setPosition(scene.game.config.width * 0.5, scene.game.config.height * 0.72);
        scene.player.body.reset(scene.player.x, scene.player.y);
        const beforeLives = currentLives;
        const laser = new EnemyLaser(scene, scene.player.x, scene.player.y - 130);
        scene.enemyLasers.add(laser);
        step(scene, 180);
        await wait(0);
        if (!laser.active && currentLives === beforeLives - 1) hits++;
        if (beforeLives - currentLives > 1) doubleLife++;
      }
      return { sceneKey, trials, hits, doubleLife };
    }

    async function specialPaths() {
      const scene = await startScene("BossLevel");
      currentLives = 999;
      currentNukes = 99;
      RIP = false;
      levelWon = false;
      motherShipLives = maxMotherShipLives;
      motherShipAlive = true;
      const beforeMotherLives = motherShipLives;
      const beforeScore = score;
      const laser = new PlayerLaser(scene, scene.alienMothership.x, scene.alienMothership.y + 180);
      scene.playerLasers.add(laser);
      step(scene, 120);
      const playerToMothership = {
        decrementedOnce: motherShipLives === beforeMotherLives - 1,
        scoreDelta: score - beforeScore,
        laserDestroyed: !laser.active
      };

      const motherLaserBeforeLives = currentLives;
      const motherLaser = new EnemyMotherShipLaser(scene, scene.player.x, scene.player.y - 140);
      scene.enemyLasers.add(motherLaser);
      step(scene, 220);

      const normalEnemy = new EnemyCruiser(scene, scene.game.config.width * 0.5, scene.game.config.height * 0.42, "enemyCruiser");
      scene.enemies.add(normalEnemy);
      const nuke = new Nuke(scene, normalEnemy.x, normalEnemy.y + 180);
      scene.starNukes.add(nuke);
      const projectilesBefore = scene.children.list.filter((child) => child.active && child.texture && child.texture.key === "nuke").length;
      step(scene, 160);
      const projectilesAfter = scene.children.list.filter((child) => child.active && child.texture && child.texture.key === "nuke").length;
      const burstCount = scene.nukeExplosions.getChildren().filter((child) => child.active && child.texture && child.texture.key === "nukeBurst").length;
      const particleManagers = scene.children.list.filter((child) => child.type === "ParticleEmitterManager").length;

      return {
        playerToMothership,
        motherLaserToPlayer: {
          hit: currentLives === motherLaserBeforeLives - 1,
          laserDestroyed: !motherLaser.active
        },
        nukeLifecycle: {
          projectilesBefore,
          projectilesAfter,
          burstCount,
          nukeProjectileDestroyed: !nuke.active,
          targetDestroyed: !normalEnemy.active,
          particleManagers
        }
      };
    }

    const level1 = await playerLaserTrials("Level1", Enemy, "enemyShip", 100);
    const level2 = await playerLaserTrials("Level2", Enemy, "enemyShip", 100);
    const bossCruiser = await playerLaserTrials("BossLevel", EnemyCruiser, "enemyCruiser", 100);
    const enemyToPlayer = await enemyLaserPlayerTrials("Level1", 100);
    const specials = await specialPaths();

    return { level1, level2, bossCruiser, enemyToPlayer, specials };
  });
}

async function runSurfaceSuite(page) {
  const report = {};
  await waitForGame(page);
  report.fonts = await page.evaluate(async () => {
    await document.fonts.ready;
    return {
      goldWoff2: await fetch("assets/fonts/production/gold/GalacticGunnersGoldDisplay-Regular.woff2", { cache: "reload" }).then((r) => r.status),
      silverWoff2: await fetch("assets/fonts/production/silver/GalacticGunnersSilverDisplay-Regular.woff2", { cache: "reload" }).then((r) => r.status),
      goldCheck: document.fonts.check("32px 'Galactic Gunners Gold Display'"),
      silverCheck: document.fonts.check("32px 'Galactic Gunners Silver Display'"),
      menuCta: game.scene.keys.MainMenu.textTitle2.style.fontFamily
    };
  });
  await capture(page, "main_menu");

  await page.evaluate(() => game.scene.start("Info"));
  await sceneReady(page, "Info");
  report.infoFont = await page.evaluate(() => game.scene.keys.Info.textInfo.style.fontFamily);
  await capture(page, "info");

  await page.evaluate(() => {
    ["Info", "Level2", "BossLevel", "Victory", "Titles", "Paused"].forEach((key) => game.scene.stop(key));
    game.scene.start("Level1");
  });
  await sceneReady(page, "Level1");
  await capture(page, "level1_formation");
  report.level1 = await page.evaluate(() => ({
    population: game.scene.keys.Level1.enemies.getChildren().length,
    playerScale: GG_SCALES.PLAYER,
    enemyScale: game.scene.keys.Level1.enemies.getChildren()[0].scaleX,
    baselineEnemyScale: GG_SCALES.ENEMY,
    enemyAngle: game.scene.keys.Level1.enemies.getChildren()[0].angle,
    enemyBounds: game.scene.keys.Level1.enemies.getChildren().map((enemy) => enemy.getBounds()).reduce((acc, bounds) => ({
      minLeft: Math.min(acc.minLeft, bounds.left),
      maxRight: Math.max(acc.maxRight, bounds.right)
    }), { minLeft: Infinity, maxRight: -Infinity }),
    nukeHud: {
      iconTexture: game.scene.keys.Level1.ggHudNukeIcon.texture.key,
      countText: textNukes.text
    },
    playerAnimation: (() => {
      const scene = game.scene.keys.Level1;
      const player = scene.player;
      const idleFrame = player.frame.name;
      ggSetPlayerMovementState(scene, true);
      const movingAnim = player.anims.currentAnim.key;
      ggSetPlayerMovementState(scene, false);
      const returnAnim = player.anims.currentAnim.key;
      return { idleFrame, movingAnim, returnAnim };
    })(),
    playerLaserScale: GG_SCALES.PLAYER_LASER,
    enemyLaserScale: GG_SCALES.ENEMY_LASER
  }));

  report.pauseCycles = await page.evaluate(async () => {
    function wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
    const scene = game.scene.keys.Level1;
    let clean = true;
    for (let i = 0; i < 20; i++) {
      scene.pauseGame();
      await wait(60);
      const paused = game.scene.keys.Paused;
      if (!paused.scene.isActive()) clean = false;
      paused.resumeGame();
      await wait(60);
      if (paused.scene.isActive() || !scene.scene.isActive()) clean = false;
    }
    return { cycles: 20, clean };
  });

  await page.evaluate(() => {
    ["Level1", "Info", "BossLevel", "Victory", "Titles", "Paused"].forEach((key) => game.scene.stop(key));
    game.scene.start("Level2");
  });
  await sceneReady(page, "Level2");
  await capture(page, "level2_formation");
  report.level2Population = await page.evaluate(() => game.scene.keys.Level2.enemies.getChildren().length);

  await page.evaluate(() => {
    ["Level1", "Level2", "Info", "Victory", "Titles", "Paused"].forEach((key) => game.scene.stop(key));
    game.scene.start("BossLevel");
  });
  await sceneReady(page, "BossLevel");
  await capture(page, "boss_formation");
  report.bossPopulation = await page.evaluate(() => game.scene.keys.BossLevel.enemies.getChildren().length);
  report.bossStateImagery = await page.evaluate(async () => {
    function wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
    const scene = game.scene.keys.BossLevel;
    const normalTexture = scene.alienMothership.texture.key;
    scene.motherShipHit(1);
    const hitTexture = scene.alienMothership.texture.key;
    await wait(240);
    const restoredTexture = scene.alienMothership.texture.key;
    return { normalTexture, hitTexture, restoredTexture };
  });
  report.nukeAndComets = await page.evaluate(() => {
    const scene = game.scene.keys.BossLevel;
    const cometVariants = [];
    for (let i = 0; i < 24; i++) {
      const comet = new Comet(scene, 100, 100);
      cometVariants.push(comet.frame.name);
      comet.destroy();
    }
    const right = new Comet(scene, 100, 100);
    right.setVelocity(180, 80);
    ggOrientCometToVelocity(right);
    const rightRotation = right.rotation;
    right.destroy();
    const left = new Comet(scene, 100, 100);
    left.setVelocity(-180, 80);
    ggOrientCometToVelocity(left);
    const leftRotation = left.rotation;
    left.destroy();
    return {
      nukeFrameTotal: game.textures.get("nuke").frameTotal,
      cometFrameTotal: game.textures.get("comet").frameTotal,
      cometVariants: Array.from(new Set(cometVariants)).sort(),
      rightRotation,
      leftRotation
    };
  });

  await page.evaluate(() => {
    ["Level1", "Level2", "BossLevel", "Info", "Titles", "Paused"].forEach((key) => game.scene.stop(key));
    window.ggFinalVictoryState = { score: 12345, wave: "FINAL", bonus: 700 };
    score = 12345;
    finalScore = 12345;
    game.scene.start("Victory", window.ggFinalVictoryState);
  });
  await sceneReady(page, "Victory");
  await capture(page, "final_victory");
  report.victory = await page.evaluate(() => ({
    active: game.scene.keys.Victory.scene.isActive(),
    score,
    finalScore,
    hasNoForcedTimer: !game.scene.keys.Victory.time.getAllEvents || game.scene.keys.Victory.time.getAllEvents().length <= 1,
    values: game.scene.keys.Victory.children.list
      .filter((child) => child.type === "Text")
      .map((child) => ({ text: child.text, x: Math.round(child.x), y: Math.round(child.y) })),
    controls: game.scene.keys.Victory.children.list
      .filter((child) => child.ggButtonRole)
      .map((child) => ({ role: child.ggButtonRole, x: Math.round(child.x), y: Math.round(child.y), width: Math.round(child.input.hitArea.width), height: Math.round(child.input.hitArea.height) }))
  }));

  await page.evaluate(() => {
    ["Level1", "Level2", "BossLevel", "Info", "Victory", "Paused"].forEach((key) => game.scene.stop(key));
    score = 12345;
    game.scene.start("Titles");
  });
  await sceneReady(page, "Titles");
  await capture(page, "titles_credits");
  report.titles = await page.evaluate(() => ({
    active: game.scene.keys.Titles.scene.isActive(),
    scorePreserved: score === 12345,
    timers: game.scene.keys.Titles.time.getAllEvents ? game.scene.keys.Titles.time.getAllEvents().length : 0
  }));

  return report;
}

async function runVisualSuite(page) {
  await waitForGame(page);
  const a = path.join(runtimeDir, "visual_stability_a.png");
  const b = path.join(runtimeDir, "visual_stability_b.png");
  await page.screenshot({ path: a, fullPage: false });
  await page.waitForTimeout(100);
  await page.screenshot({ path: b, fullPage: false });
  const imgA = PNG.sync.read(fs.readFileSync(a));
  const imgB = PNG.sync.read(fs.readFileSync(b));
  const diff = new PNG({ width: imgA.width, height: imgA.height });
  const pixels = pixelmatch(imgA.data, imgB.data, diff.data, imgA.width, imgA.height, { threshold: 0.2 });
  const diffFile = path.join(runtimeDir, "visual_stability_diff.png");
  fs.writeFileSync(diffFile, PNG.sync.write(diff));
  return { screenshotA: a, screenshotB: b, diffFile, differingPixels: pixels, pass: pixels < imgA.width * imgA.height * 0.02 };
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

  const report = { generatedAt: new Date().toISOString(), mode, url, pass: true, runtimeExceptions, failedRequests };
  try {
    await waitForGame(page);
    if (mode === "all" || mode === "collision") report.collision = await runCollisionSuite(page);
    if (mode === "all" || mode === "browser") report.browser = await runSurfaceSuite(page);
    if (mode === "all" || mode === "visual") report.visual = await runVisualSuite(page);
  } finally {
    await browser.close();
  }

  const collision = report.collision;
  if (collision) {
    const ok = collision.level1.hits === 100 && collision.level2.hits === 100 && collision.bossCruiser.hits === 100 &&
      collision.enemyToPlayer.hits === 100 && collision.level1.doubleScore === 0 && collision.level2.doubleScore === 0 &&
      collision.bossCruiser.doubleScore === 0 && collision.enemyToPlayer.doubleLife === 0 &&
      collision.specials.playerToMothership.decrementedOnce &&
      collision.specials.motherLaserToPlayer.hit &&
      collision.specials.nukeLifecycle.projectilesBefore === 1 &&
      collision.specials.nukeLifecycle.projectilesAfter === 0 &&
      collision.specials.nukeLifecycle.burstCount >= 1 &&
      collision.specials.nukeLifecycle.particleManagers === 0;
    if (!ok) report.pass = false;
  }
  if (report.browser) {
    const ok = report.browser.fonts.goldWoff2 === 200 && report.browser.fonts.silverWoff2 === 200 &&
      report.browser.fonts.goldCheck && report.browser.fonts.silverCheck &&
      report.browser.level1.population === 58 && report.browser.level1.enemyScale > report.browser.level1.baselineEnemyScale &&
      Math.abs(Math.abs(report.browser.level1.enemyAngle) - 180) < 0.01 && report.browser.level1.enemyBounds.minLeft >= -1 &&
      report.browser.level1.enemyBounds.maxRight <= 1367 && report.browser.level1.nukeHud.iconTexture === "hudNuke" &&
      report.browser.level1.playerAnimation.idleFrame === "0" &&
      report.browser.level1.playerAnimation.movingAnim === "playerShipThrust" &&
      report.browser.level1.playerAnimation.returnAnim === "playerShipReturn" &&
      report.browser.level2Population === 87 &&
      report.browser.bossPopulation === 72 && report.browser.pauseCycles.clean &&
      report.browser.bossStateImagery.normalTexture === "motherShip" &&
      report.browser.bossStateImagery.hitTexture === "motherShipHit" &&
      report.browser.bossStateImagery.restoredTexture === "motherShip" &&
      report.browser.nukeAndComets.nukeFrameTotal === 7 &&
      report.browser.nukeAndComets.cometFrameTotal === 7 &&
      report.browser.nukeAndComets.cometVariants.length >= 4 &&
      report.browser.victory.active && report.browser.victory.controls.length >= 3 &&
      report.browser.titles.scorePreserved;
    if (!ok) report.pass = false;
  }
  if (report.visual && !report.visual.pass) report.pass = false;
  if (runtimeExceptions.length || failedRequests.length) report.pass = false;

  const file = path.join(runtimeDir, `handoff_004_${mode}_report.json`);
  fs.writeFileSync(file, JSON.stringify(report, null, 2));
  console.log(`handoff 004 ${mode} report: ${file}`);
  console.log(report.pass ? `qa:${mode} PASS` : `qa:${mode} FAIL`);
  if (!report.pass) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
