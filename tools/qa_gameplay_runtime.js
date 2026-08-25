const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const modeArg = process.argv.find((arg) => arg.startsWith("--mode="));
const mode = modeArg ? modeArg.split("=")[1] : "gameplay";
const baseUrl = process.env.GG_RUNTIME_URL || "http://localhost:8027/";
const handoffId = process.env.GG_HANDOFF_ID || "GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_005";
const evidenceRoot = path.resolve("docs/internal_governance/evidence", handoffId, "runtime_gameplay_recovery");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function qaUrl(extraParams = {}) {
  const url = new URL(baseUrl);
  url.searchParams.set("ggGameplayTest", "1");
  Object.entries(extraParams).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
}

async function waitForLevel1(page) {
  await page.waitForFunction(() => window.game && game.scene && game.scene.keys && game.scene.keys.MainMenu && game.scene.keys.MainMenu.heroImage, null, { timeout: 15000 });
  const playPoint = await page.evaluate(() => {
    const scene = game.scene.keys.MainMenu;
    if (!scene || !scene.heroImage) return { x: 683, y: 520 };
    return { x: scene.heroImage.x, y: scene.heroImage.y };
  });
  await page.mouse.click(playPoint.x, playPoint.y);
  await page.waitForFunction(() => game.scene.keys.Level1 && game.scene.keys.Level1.scene.isActive(), null, { timeout: 15000 });
  await page.waitForFunction(() => window.ggGameplayTestControls && window.ggGameplayTestControls.Level1, null, { timeout: 10000 });
  await page.mouse.click(683, 610);
  await page.waitForTimeout(350);
}

async function capture(page, filename) {
  ensureDir(evidenceRoot);
  const file = path.join(evidenceRoot, filename);
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

async function getState(page) {
  return page.evaluate(() => window.ggGameplayTestControls.Level1.state());
}

async function cleanup(page) {
  await page.evaluate(() => window.ggGameplayTestControls.Level1.clearRuntimeCollisionField());
  await page.waitForTimeout(100);
}

async function resetTraces(page) {
  await page.evaluate(() => {
    window.ggExplosionTrace = [];
    window.ggPlayerDamageTrace = [];
    window.ggProjectileSpawnTrace = [];
    window.ggProjectileClashTrace = [];
    window.ggGameOverTrace = [];
  });
}

async function fireKey(page, key = "Space", holdMs = 90) {
  await page.keyboard.up(key).catch(() => {});
  await page.waitForTimeout(60);
  await page.keyboard.down(key);
  await page.waitForTimeout(holdMs);
  await page.keyboard.up(key);
  await page.waitForTimeout(160);
}

async function waitFor(page, predicateSource, timeout = 5000) {
  await page.waitForFunction(predicateSource, null, { timeout });
}

async function waitMaybe(page, predicateSource, timeout = 3000) {
  try {
    await waitFor(page, predicateSource, timeout);
    return true;
  } catch {
    return false;
  }
}

async function fireUntil(page, predicateSource, attempts = 4) {
  for (let i = 0; i < attempts; i++) {
    await fireKey(page, "Space");
    try {
      await waitFor(page, predicateSource, 1800);
      return true;
    } catch (error) {
      if (i === attempts - 1) throw error;
    }
  }
  return false;
}

async function hostileCollisionMatrix(page) {
  const offsets = [-28, -14, 0, 14, 28];
  const matrix = { playerLaserEnemy: [], playerLaserComet: [], nukeEnemy: [], enemyLaserPlayer: [] };

  for (const offset of offsets) {
    await cleanup(page);
    await resetTraces(page);
    await page.evaluate((xOffset) => {
      const scene = game.scene.keys.Level1;
      window.ggGameplayTestControls.Level1.placePlayerClearOfShields();
      RIP = false;
      levelWon = false;
      enemyDeaths = 0;
      enemyShips = 1;
      totalEnemyShips = 100;
      const enemy = new Enemy(scene, scene.player.x + xOffset, scene.player.y - 150, "enemyShip");
      enemy.ggTestFixture = true;
      ggAssignEntityId(scene, enemy, "ENEMY");
      if (enemy.body) enemy.body.setVelocity(0, 0);
      scene.enemies.add(enemy);
    }, offset);
    await fireKey(page, "Space");
    matrix.playerLaserEnemy.push({ offset, hit: await waitMaybe(page, () => window.ggExplosionTrace.some((item) => item.eventSource === "PLAYER_LASER_HOSTILE_HIT")) });
  }

  for (const offset of offsets) {
    await cleanup(page);
    await resetTraces(page);
    await page.evaluate((xOffset) => {
      const scene = game.scene.keys.Level1;
      window.ggGameplayTestControls.Level1.placePlayerClearOfShields();
      RIP = false;
      levelWon = false;
      const comet = new Comet(scene, scene.player.x + xOffset, scene.player.y - 150);
      comet.ggTestFixture = true;
      ggAssignEntityId(scene, comet, "COMET");
      if (comet.body) {
        comet.body.setVelocity(0, 0);
        comet.body.angularVelocity = 0;
      }
      scene.comets.add(comet);
    }, offset);
    await fireKey(page, "Space");
    matrix.playerLaserComet.push({ offset, hit: await waitMaybe(page, () => window.ggExplosionTrace.some((item) => item.eventSource === "PLAYER_LASER_COMET_HIT")) });
  }

  for (const offset of offsets) {
    await cleanup(page);
    await resetTraces(page);
    await page.evaluate((xOffset) => {
      const scene = game.scene.keys.Level1;
      window.ggGameplayTestControls.Level1.placePlayerClearOfShields();
      RIP = false;
      levelWon = false;
      enemyDeaths = 0;
      enemyShips = 1;
      totalEnemyShips = 100;
      currentNukes = 1;
      ggRefreshHud(scene);
      const enemy = new Enemy(scene, scene.player.x + xOffset, scene.player.y - 165, "enemyShip");
      enemy.ggTestFixture = true;
      ggAssignEntityId(scene, enemy, "ENEMY");
      if (enemy.body) enemy.body.setVelocity(0, 0);
      scene.enemies.add(enemy);
      const nuke = ggSpawnPlayerNuke(scene);
      if (nuke) nuke.ggTestFixture = true;
    }, offset);
    matrix.nukeEnemy.push({ offset, hit: await waitMaybe(page, () => window.ggExplosionTrace.some((item) => item.eventSource === "PLAYER_NUKE_HOSTILE_HIT"), 4000) });
  }

  for (const offset of offsets) {
    await cleanup(page);
    await resetTraces(page);
    await page.evaluate((xOffset) => {
      const scene = game.scene.keys.Level1;
      window.ggGameplayTestControls.Level1.placePlayerClearOfShields();
      RIP = false;
      levelWon = false;
      currentLives = 3;
      const enemy = new Enemy(scene, scene.player.x + xOffset, scene.player.y - 80, "enemyShip");
      enemy.ggTestFixture = true;
      ggAssignEntityId(scene, enemy, "ENEMY");
      if (enemy.body) enemy.body.setVelocity(0, 0);
      scene.enemies.add(enemy);
      const laser = ggSpawnEnemyLaser(scene, enemy, EnemyLaser);
      laser.ggTestFixture = true;
    }, offset);
    matrix.enemyLaserPlayer.push({ offset, hit: await waitMaybe(page, () => window.ggPlayerDamageTrace.some((item) => item.projectileSide === "enemy")) });
  }

  return matrix;
}

async function bossHostileCollisionMatrix(page) {
  const offsets = [-28, 0, 28];
  await page.evaluate(() => {
    game.scene.stop("Level1");
    game.scene.start("BossLevel");
  });
  await page.waitForFunction(() => game.scene.keys.BossLevel && game.scene.keys.BossLevel.scene.isActive() && game.scene.keys.BossLevel.player && game.scene.keys.BossLevel.alienMothership, null, { timeout: 15000 });
  await page.waitForFunction(() => window.ggGameplayTestControls && window.ggGameplayTestControls.BossLevel, null, { timeout: 10000 });
  await page.waitForTimeout(500);

  const matrix = { playerLaserMothership: [], nukeMothership: [], playerLaserCruiser: [], nukeCruiser: [], scoutBodyPlayer: null, mothershipHitFrame: null };

  matrix.mothershipHitFrame = await page.evaluate(() => {
    const scene = game.scene.keys.BossLevel;
    const normal = scene.textures.getFrame("motherShip", "0");
    const hit = scene.textures.getFrame("motherShipHit", "0");
    return {
      normalWidth: normal.width,
      normalHeight: normal.height,
      hitWidth: hit.width,
      hitHeight: hit.height,
      hitCutX: hit.cutX
    };
  });

  for (const offset of offsets) {
    await page.evaluate((xOffset) => {
      const scene = game.scene.keys.BossLevel;
      window.ggGameplayTestControls.BossLevel.clearRuntimeCollisionField();
      window.ggExplosionTrace = [];
      RIP = false;
      levelWon = false;
      motherShipAlive = true;
      motherShipLives = maxMotherShipLives;
      scene.alienMothership.setPosition(scene.game.config.width * 0.5, scene.game.config.height * 0.2);
      if (scene.alienMothership.body) scene.alienMothership.body.reset(scene.alienMothership.x, scene.alienMothership.y);
      scene.tweens.killTweensOf(scene.alienMothership);
      const laser = new PlayerLaser(scene, scene.alienMothership.x + xOffset, scene.alienMothership.y + 180);
      laser.ggTestFixture = true;
      scene.playerLasers.add(laser);
      if (laser.body) laser.body.setVelocityY(-280);
    }, offset);
    matrix.playerLaserMothership.push({ offset, hit: await waitMaybe(page, () => window.ggExplosionTrace.some((item) => item.eventSource === "PLAYER_LASER_MOTHERSHIP_HIT")) });
  }

  for (const offset of offsets) {
    await page.evaluate((xOffset) => {
      const scene = game.scene.keys.BossLevel;
      window.ggGameplayTestControls.BossLevel.clearRuntimeCollisionField();
      window.ggExplosionTrace = [];
      RIP = false;
      levelWon = false;
      motherShipAlive = true;
      motherShipLives = maxMotherShipLives;
      scene.alienMothership.setPosition(scene.game.config.width * 0.5, scene.game.config.height * 0.2);
      if (scene.alienMothership.body) scene.alienMothership.body.reset(scene.alienMothership.x, scene.alienMothership.y);
      scene.tweens.killTweensOf(scene.alienMothership);
      const nuke = new Nuke(scene, scene.alienMothership.x + xOffset, scene.alienMothership.y + 190);
      nuke.ggTestFixture = true;
      scene.starNukes.add(nuke);
      if (nuke.body) nuke.body.setVelocityY(-320);
    }, offset);
    matrix.nukeMothership.push({ offset, hit: await waitMaybe(page, () => window.ggExplosionTrace.some((item) => item.eventSource === "PLAYER_NUKE_MOTHERSHIP_HIT")) });
  }

  for (const offset of offsets) {
    await page.evaluate((xOffset) => {
      const scene = game.scene.keys.BossLevel;
      window.ggGameplayTestControls.BossLevel.clearRuntimeCollisionField();
      window.ggExplosionTrace = [];
      RIP = false;
      levelWon = false;
      enemyDeaths = 0;
      enemyShips = 1;
      totalEnemyShips = 100;
      const cruiser = new EnemyCruiser(scene, scene.player.x + xOffset, scene.player.y - 170, "enemyCruiser");
      cruiser.ggTestFixture = true;
      scene.enemies.add(cruiser);
      const laser = new PlayerLaser(scene, cruiser.x, cruiser.y + 150);
      laser.ggTestFixture = true;
      scene.playerLasers.add(laser);
      if (laser.body) laser.body.setVelocityY(-260);
    }, offset);
    matrix.playerLaserCruiser.push({ offset, hit: await waitMaybe(page, () => window.ggExplosionTrace.some((item) => item.eventSource === "PLAYER_LASER_HOSTILE_HIT")) });
  }

  for (const offset of offsets) {
    await page.evaluate((xOffset) => {
      const scene = game.scene.keys.BossLevel;
      window.ggGameplayTestControls.BossLevel.clearRuntimeCollisionField();
      window.ggExplosionTrace = [];
      RIP = false;
      levelWon = false;
      enemyDeaths = 0;
      enemyShips = 1;
      totalEnemyShips = 100;
      const cruiser = new EnemyCruiser(scene, scene.player.x + xOffset, scene.player.y - 170, "enemyCruiser");
      cruiser.ggTestFixture = true;
      scene.enemies.add(cruiser);
      const nuke = new Nuke(scene, cruiser.x, cruiser.y + 170);
      nuke.ggTestFixture = true;
      scene.starNukes.add(nuke);
      if (nuke.body) nuke.body.setVelocityY(-320);
    }, offset);
    matrix.nukeCruiser.push({ offset, hit: await waitMaybe(page, () => window.ggExplosionTrace.some((item) => item.eventSource === "PLAYER_NUKE_HOSTILE_HIT")) });
  }

  matrix.scoutBodyPlayer = await page.evaluate(() => {
    const scene = game.scene.keys.BossLevel;
    window.ggGameplayTestControls.BossLevel.clearRuntimeCollisionField();
    window.ggPlayerDamageTrace = [];
    RIP = false;
    levelWon = false;
    currentLives = 3;
    const scout = new AlienScout(scene, scene.player.x, scene.player.y);
    scout.ggTestFixture = true;
    ggAssignEntityId(scene, scout, "SCOUT");
    scene.alienscouts.add(scout);
    ggRunSweptCollisionContracts(scene);
    return {
      scoutActive: scout.active,
      damageCount: (window.ggPlayerDamageTrace || []).filter((item) => item.eventSource === undefined || item.projectileSide === "hostile-body").length
    };
  });

  return matrix;
}

async function startGameplayScene(page, sceneKey) {
  await page.evaluate((key) => {
    ["Level1", "Level2", "BossLevel", "MainMenu", "Paused"].forEach((activeKey) => {
      if (game.scene.keys[activeKey]) game.scene.stop(activeKey);
    });
    RIP = false;
    levelWon = false;
    currentLives = 3;
    game.scene.start(key);
  }, sceneKey);
  await page.waitForFunction((key) => {
    return game.scene.keys[key] && game.scene.keys[key].scene.isActive() &&
      window.ggGameplayTestControls && window.ggGameplayTestControls[key];
  }, sceneKey, { timeout: 15000 });
  await page.waitForTimeout(300);
}

async function hostileBottomBreachMatrix(page) {
  const cases = [
    { sceneKey: "Level1", ctorName: "Enemy", groupName: "enemies", texture: "enemyShip", label: "level1Enemy" },
    { sceneKey: "Level2", ctorName: "EnemyCruiser", groupName: "enemies", texture: "enemyCruiser", label: "level2Cruiser" },
    { sceneKey: "BossLevel", ctorName: "EnemyCruiser", groupName: "enemies", texture: "enemyCruiser", label: "bossCruiser" },
    { sceneKey: "BossLevel", ctorName: "AlienScout", groupName: "alienscouts", texture: "alienScout", label: "bossScout" }
  ];
  const matrix = {};
  for (const testCase of cases) {
    await startGameplayScene(page, testCase.sceneKey);
    await resetTraces(page);
    matrix[testCase.label] = await page.evaluate((config) => {
      const scene = game.scene.keys[config.sceneKey];
      window.ggGameplayTestControls[config.sceneKey].clearRuntimeCollisionField();
      RIP = false;
      levelWon = false;
      currentLives = 3;
      scene.ggBottomBreachGameOver = false;
      const y = scene.game.config.height + 8;
      let hostile;
      if (config.ctorName === "AlienScout") hostile = new AlienScout(scene, scene.game.config.width * 0.5, y);
      else if (config.ctorName === "EnemyCruiser") hostile = new EnemyCruiser(scene, scene.game.config.width * 0.5, y, config.texture);
      else hostile = new Enemy(scene, scene.game.config.width * 0.5, y, config.texture);
      hostile.ggTestFixture = true;
      ggAssignEntityId(scene, hostile, `${config.label}_BOTTOM_BREACH`);
      if (hostile.body) hostile.body.setVelocity(0, 0);
      scene[config.groupName].add(hostile);
      ggRunSweptCollisionContracts(scene);
      const trace = (window.ggGameOverTrace || []).find((item) => item.reason === "HOSTILE_BOTTOM_BREACH");
      return {
        rip: RIP,
        currentLives,
        traceReason: trace ? trace.reason : null,
        hostileType: trace ? trace.hostileType : null,
        hostileBottom: trace && trace.hostileBounds ? trace.hostileBounds.bottom : null
      };
    }, testCase);
  }
  return matrix;
}

async function runBrowser(extraParams = {}) {
  ensureDir(evidenceRoot);
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
  await page.goto(qaUrl(extraParams), { waitUntil: "networkidle" });
  return { browser, page, runtimeExceptions, failedRequests };
}

async function gameplayAudit() {
  const { browser, page, runtimeExceptions, failedRequests } = await runBrowser();
  const report = { mode: "gameplay", runtimeExceptions, failedRequests, checks: {}, screenshots: {} };
  try {
    await waitForLevel1(page);
    await page.evaluate(() => {
      window.ggExplosionTrace = [];
      window.ggPlayerDamageTrace = [];
      window.ggProjectileSpawnTrace = [];
      window.ggGameplayTestControls.Level1.suppressEnemyFire(true);
    });

    const initial = await getState(page);
    report.checks.PROJECTILE_SWEPT_COLLISION_LOOP = initial.sweptCollisionLoopInstalled === true ? "ON" : "OFF";
    report.checks.NORMAL_RUNTIME_COLLISION_AUTHORITY = "ARCADE_OVERLAP_PLUS_PROJECTILE_SWEEP";

    await cleanup(page);
    await resetTraces(page);
    await page.evaluate(() => window.ggGameplayTestControls.Level1.placePlayerClearOfShields());
    await fireUntil(page, () => window.ggGameplayTestControls.Level1.state().playerLasers.length > 0, 3);
    const shotOne = await getState(page);
    const laser = shotOne.playerLasers[shotOne.playerLasers.length - 1];
    report.checks.PLAYER_LASER_VISIBLE = !!laser;
    report.checks.PLAYER_LASER_MOVES_UP = !!laser && laser.velocityY < 0;
    report.checks.PLAYER_LASER_BODY_CORE = !!laser && laser.body && laser.body.width >= 8 && laser.body.height >= 18;
    report.screenshots.playerLaser = await capture(page, "player_laser_visible_moves_up.png");

    await page.keyboard.down("Space");
    await page.waitForTimeout(1500);
    await page.keyboard.up("Space");
    await page.waitForTimeout(500);
    const repeat = await getState(page);
    report.checks.PLAYER_LASER_REPEAT_FIRE = repeat.traces.projectileSpawns.filter((item) => item.projectileType === "PLAYER_LASER").length > 1;

    await page.waitForTimeout(3000);
    await cleanup(page);
    await resetTraces(page);
    const bodyBefore = await getState(page);
    await page.evaluate(() => window.ggGameplayTestControls.Level1.spawnPlayerBodyContacts());
    await page.waitForTimeout(650);
    const bodyAfter = await getState(page);
    report.checks.PLAYER_BODY_CONTACT_DAMAGE = bodyAfter.currentLives - bodyBefore.currentLives;

    await cleanup(page);
    await resetTraces(page);
    const enemyScoreBefore = (await getState(page)).score;
    await page.evaluate(() => window.ggGameplayTestControls.Level1.placePlayerClearOfShields());
    await page.evaluate(() => window.ggGameplayTestControls.Level1.spawnEnemyInPlayerShotPath());
    await fireUntil(page, () => window.ggExplosionTrace.some((item) => item.eventSource === "PLAYER_LASER_HOSTILE_HIT"));
    const enemyHit = await getState(page);
    report.checks.PLAYER_LASER_ENEMY = enemyHit.score > enemyScoreBefore;

    await cleanup(page);
    await resetTraces(page);
    const asteroidScoreBefore = (await getState(page)).score;
    await page.evaluate(() => window.ggGameplayTestControls.Level1.placePlayerClearOfShields());
    await page.evaluate(() => window.ggGameplayTestControls.Level1.spawnAsteroidInPlayerShotPath());
    await fireUntil(page, () => window.ggExplosionTrace.some((item) => item.eventSource === "PLAYER_LASER_ASTEROID_HIT"));
    const asteroidHit = await getState(page);
    report.checks.PLAYER_LASER_ASTEROID = asteroidHit.score > asteroidScoreBefore;

    await cleanup(page);
    await resetTraces(page);
    const cometBefore = await getState(page);
    await page.evaluate(() => window.ggGameplayTestControls.Level1.placePlayerClearOfShields());
    await page.evaluate(() => window.ggGameplayTestControls.Level1.spawnCometInPlayerShotPath());
    await fireUntil(page, () => window.ggExplosionTrace.some((item) => item.eventSource === "PLAYER_LASER_COMET_HIT"));
    const cometAfter = await getState(page);
    report.checks.PLAYER_LASER_COMET = cometAfter.score - cometBefore.score === 500;
    report.checks.COMET_SCORE_REWARD = cometAfter.score - cometBefore.score;
    report.checks.COMET_NUKE_REWARD = cometAfter.currentNukes - cometBefore.currentNukes;

    await cleanup(page);
    await resetTraces(page);
    const shieldScoreBeforePlayerShot = (await getState(page)).score;
    await page.evaluate(() => window.ggGameplayTestControls.Level1.placePlayerClearOfShields());
    await page.evaluate(() => window.ggGameplayTestControls.Level1.spawnShieldInPlayerShotPath());
    await fireKey(page, "Space");
    await page.waitForTimeout(900);
    const shieldCollision = await page.evaluate(() => {
      const scene = game.scene.keys.Level1;
      return {
        shieldAlive: scene.shieldTiles.getChildren().some((item) => item && item.active && item.ggTestFixture),
        playerLaserAlive: scene.playerLasers.getChildren().some((item) => item && item.active && item.ggProjectileSide === "player")
      };
    });
    const shieldScoreAfterPlayerShot = (await getState(page)).score;
    report.checks.PLAYER_LASER_SHIELD_COLLISION = !shieldCollision.shieldAlive && !shieldCollision.playerLaserAlive;
    report.checks.PLAYER_LASER_SHIELD_SCORE_MUTATION = shieldScoreAfterPlayerShot - shieldScoreBeforePlayerShot;

    await cleanup(page);
    await resetTraces(page);
    const projectileClash = await page.evaluate(() => {
      const scene = game.scene.keys.Level1;
      const playerLaser = new PlayerLaser(scene, scene.player.x, scene.player.y - 155);
      const enemyLaser = new EnemyLaser(scene, scene.player.x, scene.player.y - 155);
      playerLaser.ggTestFixture = true;
      enemyLaser.ggTestFixture = true;
      scene.playerLasers.add(playerLaser);
      scene.enemyLasers.add(enemyLaser);
      if (playerLaser.body) playerLaser.body.setVelocity(0, 0);
      if (enemyLaser.body) enemyLaser.body.setVelocity(0, 0);
      ggRunSweptCollisionContracts(scene);
      return {
        playerLaserActive: playerLaser.active,
        enemyLaserActive: enemyLaser.active,
        clashCount: (window.ggProjectileClashTrace || []).length
      };
    });
    report.checks.PLAYER_ENEMY_LASER_CLASH = projectileClash.playerLaserActive === false && projectileClash.enemyLaserActive === false && projectileClash.clashCount > 0;

    await cleanup(page);
    await resetTraces(page);
    const nukeScoreBefore = (await getState(page)).score;
    await page.evaluate(() => {
      window.ggGameplayTestControls.Level1.placePlayerClearOfShields();
      RIP = false;
      levelWon = false;
      enemyDeaths = 0;
      enemyShips = 1;
      totalEnemyShips = 100;
      currentNukes = 1;
      ggRefreshHud(game.scene.keys.Level1);
    });
    await page.evaluate(() => window.ggGameplayTestControls.Level1.spawnEnemyInPlayerShotPath());
    await fireKey(page, "n");
    await waitFor(page, () => window.ggExplosionTrace.some((item) => item.eventSource === "PLAYER_NUKE_HOSTILE_HIT"));
    const nukeHit = await getState(page);
    report.checks.PLAYER_NUKE_HOSTILE_TARGETS = nukeHit.score > nukeScoreBefore;

    await cleanup(page);
    await resetTraces(page);
    await page.evaluate(() => {
      const scene = game.scene.keys.Level1;
      window.ggGameplayTestControls.Level1.placePlayerClearOfShields();
      const laser = new EnemyLaser(scene, scene.game.config.width * 0.5, scene.game.config.height * 0.18);
      laser.ggTestFixture = true;
      ggSetProjectileIdentity(scene, laser, "enemy", "ENEMY_LASER", null);
      scene.enemyLasers.add(laser);
      if (laser.body) laser.body.setVelocityY(ggEnemyLaserVelocity(scene));
    });
    await page.waitForTimeout(250);
    const enemyLaserMoving = await getState(page);
    const movingEnemyLaser = enemyLaserMoving.enemyLasers[enemyLaserMoving.enemyLasers.length - 1];
    const enemyLaserY = movingEnemyLaser ? movingEnemyLaser.y : null;
    await page.waitForTimeout(350);
    const enemyLaserMoved = await getState(page);
    const movedEnemyLaser = enemyLaserMoved.enemyLasers.find((item) => movingEnemyLaser && item.id === movingEnemyLaser.id);
    report.checks.ENEMY_LASER_VISIBLE = !!movingEnemyLaser;
    report.checks.ENEMY_LASER_MOVES_DOWN = !!movedEnemyLaser && movedEnemyLaser.y > enemyLaserY && movedEnemyLaser.velocityY > 0;
    report.checks.ENEMY_LASER_BODY_CORE = !!movingEnemyLaser && movingEnemyLaser.body && movingEnemyLaser.body.width >= 8 && movingEnemyLaser.body.height >= 18;
    await page.waitForTimeout(2000);
    const playerDamage = await getState(page);
    const damageTrace = playerDamage.traces.damage[playerDamage.traces.damage.length - 1];
    report.checks.ENEMY_LASER_PLAYER = !!damageTrace && damageTrace.projectileSide === "enemy" && damageTrace.livesAfter === damageTrace.livesBefore - 1;
    report.checks.UNTRACED_PLAYER_LIFE_DECREMENT = report.checks.ENEMY_LASER_PLAYER ? 0 : 1;

    await cleanup(page);
    await resetTraces(page);
    const shieldScoreBefore = (await getState(page)).score;
    await page.evaluate(() => window.ggGameplayTestControls.Level1.spawnEnemyLaserAtShield());
    await page.waitForTimeout(1600);
    const shieldDamage = await getState(page);
    report.checks.ENEMY_LASER_SHIELD = shieldDamage.score <= shieldScoreBefore;

    const hostileMatrix = await hostileCollisionMatrix(page);
    report.hostileCollisionMatrix = hostileMatrix;
    report.checks.HOSTILE_PLAYER_LASER_ENEMY_HITS = hostileMatrix.playerLaserEnemy.filter((item) => item.hit).length;
    report.checks.HOSTILE_PLAYER_LASER_COMET_HITS = hostileMatrix.playerLaserComet.filter((item) => item.hit).length;
    report.checks.HOSTILE_NUKE_ENEMY_HITS = hostileMatrix.nukeEnemy.filter((item) => item.hit).length;
    report.checks.HOSTILE_ENEMY_LASER_PLAYER_HITS = hostileMatrix.enemyLaserPlayer.filter((item) => item.hit).length;
    report.checks.ENEMY_LASER_PLAYER = report.checks.HOSTILE_ENEMY_LASER_PLAYER_HITS === 5;
    report.checks.UNTRACED_PLAYER_LIFE_DECREMENT = report.checks.ENEMY_LASER_PLAYER ? 0 : 1;

    const bossMatrix = await bossHostileCollisionMatrix(page);
    report.bossHostileCollisionMatrix = bossMatrix;
    report.checks.BOSS_PLAYER_LASER_MOTHERSHIP_HITS = bossMatrix.playerLaserMothership.filter((item) => item.hit).length;
    report.checks.BOSS_NUKE_MOTHERSHIP_HITS = bossMatrix.nukeMothership.filter((item) => item.hit).length;
    report.checks.BOSS_PLAYER_LASER_CRUISER_HITS = bossMatrix.playerLaserCruiser.filter((item) => item.hit).length;
    report.checks.BOSS_NUKE_CRUISER_HITS = bossMatrix.nukeCruiser.filter((item) => item.hit).length;
    report.checks.BOSS_SCOUT_BODY_PLAYER_CONTACT = bossMatrix.scoutBodyPlayer && bossMatrix.scoutBodyPlayer.scoutActive === false && bossMatrix.scoutBodyPlayer.damageCount > 0;
    report.checks.BOSS_MOTHERSHIP_HIT_FRAME_CROP = bossMatrix.mothershipHitFrame && bossMatrix.mothershipHitFrame.hitWidth === 362 && bossMatrix.mothershipHitFrame.hitCutX === 362;

    const bottomBreachMatrix = await hostileBottomBreachMatrix(page);
    report.hostileBottomBreachMatrix = bottomBreachMatrix;
    report.checks.HOSTILE_BOTTOM_BREACH_LEVEL1 = bottomBreachMatrix.level1Enemy && bottomBreachMatrix.level1Enemy.rip === true && bottomBreachMatrix.level1Enemy.currentLives === 0 && bottomBreachMatrix.level1Enemy.traceReason === "HOSTILE_BOTTOM_BREACH";
    report.checks.HOSTILE_BOTTOM_BREACH_LEVEL2 = bottomBreachMatrix.level2Cruiser && bottomBreachMatrix.level2Cruiser.rip === true && bottomBreachMatrix.level2Cruiser.currentLives === 0 && bottomBreachMatrix.level2Cruiser.traceReason === "HOSTILE_BOTTOM_BREACH";
    report.checks.HOSTILE_BOTTOM_BREACH_BOSS_CRUISER = bottomBreachMatrix.bossCruiser && bottomBreachMatrix.bossCruiser.rip === true && bottomBreachMatrix.bossCruiser.currentLives === 0 && bottomBreachMatrix.bossCruiser.traceReason === "HOSTILE_BOTTOM_BREACH";
    report.checks.HOSTILE_BOTTOM_BREACH_BOSS_SCOUT = bottomBreachMatrix.bossScout && bottomBreachMatrix.bossScout.rip === true && bottomBreachMatrix.bossScout.currentLives === 0 && bottomBreachMatrix.bossScout.traceReason === "HOSTILE_BOTTOM_BREACH";

    const allTraces = await page.evaluate(() => window.ggExplosionTrace || []);
    report.checks.UNKNOWN_EXPLOSION_SOURCE = allTraces.filter((item) => !item.eventSource || /UNKNOWN|UNDEFINED|NULL|UNATTRIBUTED/.test(item.eventSource)).length;
    report.checks.PROJECTILE_CULL_EXPLOSIONS = allTraces.filter((item) => item.eventSource === "PROJECTILE_CULL_EXPLOSION").length;
    report.checks.UNEXPLAINED_BASE_EXPLOSIONS = allTraces.filter((item) => item.eventSource === "UNEXPLAINED").length;
    report.checks.REAL_KEYBOARD_RUNTIME_TEST = true;
    report.checks.REAL_COMET_RUNTIME_TEST = report.checks.PLAYER_LASER_COMET;
    report.checks.REAL_ENEMY_LASER_RUNTIME_TEST = report.checks.HOSTILE_ENEMY_LASER_PLAYER_HITS === 5;
    report.screenshots.runtime = await capture(page, "gameplay_runtime_after_collision_matrix.png");
  } finally {
    await browser.close();
  }
  return report;
}

async function visualAudit(debug = false) {
  const { browser, page, runtimeExceptions, failedRequests } = await runBrowser(debug ? { ggPhysicsDebug: "1" } : {});
  const report = { mode: debug ? "debug" : "visual", runtimeExceptions, failedRequests, checks: {}, screenshots: {} };
  try {
    await waitForLevel1(page);
    await page.evaluate(() => {
      window.ggGameplayTestControls.Level1.suppressEnemyFire(true);
      window.ggGameplayTestControls.Level1.placePlayerClearOfShields();
      window.ggGameplayTestControls.Level1.spawnEnemyLaserAtPlayer();
    });
    await fireKey(page, "Space");
    await page.waitForTimeout(180);
    report.screenshots[debug ? "physicsDebug" : "visual"] = await capture(page, debug ? "physics_debug_visual.png" : "gameplay_visual_runtime.png");
    const state = await getState(page);
    report.checks.PLAYER_LASER_VISIBLE = state.playerLasers.length > 0 || state.traces.projectileSpawns.some((item) => item.projectileType === "PLAYER_LASER");
    report.checks.ENEMY_LASER_VISIBLE = state.enemyLasers.length > 0 || state.traces.projectileSpawns.some((item) => item.projectileType === "ENEMY_LASER");
    report.checks.PHYSICS_DEBUG_VISUAL = debug ? true : "N/A";
  } finally {
    await browser.close();
  }
  return report;
}

function assertReport(report) {
  const failures = [];
  function assert(condition, message) {
    if (!condition) failures.push(message);
  }
  assert(report.runtimeExceptions.length === 0, "runtime exceptions");
  assert(report.failedRequests.length === 0, "failed network requests");
  if (report.mode === "gameplay") {
    assert(report.checks.PLAYER_LASER_VISIBLE === true, "PLAYER_LASER_VISIBLE");
    assert(report.checks.PLAYER_LASER_MOVES_UP === true, "PLAYER_LASER_MOVES_UP");
    assert(report.checks.PLAYER_LASER_REPEAT_FIRE === true, "PLAYER_LASER_REPEAT_FIRE");
    assert(report.checks.PLAYER_LASER_ENEMY === true, "PLAYER_LASER_ENEMY");
    assert(report.checks.PLAYER_LASER_ASTEROID === true, "PLAYER_LASER_ASTEROID");
    assert(report.checks.PLAYER_LASER_COMET === true, "PLAYER_LASER_COMET");
    assert(report.checks.PLAYER_LASER_SHIELD_COLLISION === true, "PLAYER_LASER_SHIELD_COLLISION");
    assert(report.checks.PLAYER_LASER_SHIELD_SCORE_MUTATION === 0, "PLAYER_LASER_SHIELD_SCORE_MUTATION");
    assert(report.checks.PLAYER_ENEMY_LASER_CLASH === true, "PLAYER_ENEMY_LASER_CLASH");
    assert(report.checks.PLAYER_NUKE_HOSTILE_TARGETS === true, "PLAYER_NUKE_HOSTILE_TARGETS");
    assert(report.checks.HOSTILE_PLAYER_LASER_ENEMY_HITS === 5, "HOSTILE_PLAYER_LASER_ENEMY_HITS");
    assert(report.checks.HOSTILE_PLAYER_LASER_COMET_HITS === 5, "HOSTILE_PLAYER_LASER_COMET_HITS");
    assert(report.checks.HOSTILE_NUKE_ENEMY_HITS === 5, "HOSTILE_NUKE_ENEMY_HITS");
    assert(report.checks.HOSTILE_ENEMY_LASER_PLAYER_HITS === 5, "HOSTILE_ENEMY_LASER_PLAYER_HITS");
    assert(report.checks.BOSS_PLAYER_LASER_MOTHERSHIP_HITS === 3, "BOSS_PLAYER_LASER_MOTHERSHIP_HITS");
    assert(report.checks.BOSS_NUKE_MOTHERSHIP_HITS === 3, "BOSS_NUKE_MOTHERSHIP_HITS");
    assert(report.checks.BOSS_PLAYER_LASER_CRUISER_HITS === 3, "BOSS_PLAYER_LASER_CRUISER_HITS");
    assert(report.checks.BOSS_NUKE_CRUISER_HITS === 3, "BOSS_NUKE_CRUISER_HITS");
    assert(report.checks.BOSS_SCOUT_BODY_PLAYER_CONTACT === true, "BOSS_SCOUT_BODY_PLAYER_CONTACT");
    assert(report.checks.BOSS_MOTHERSHIP_HIT_FRAME_CROP === true, "BOSS_MOTHERSHIP_HIT_FRAME_CROP");
    assert(report.checks.HOSTILE_BOTTOM_BREACH_LEVEL1 === true, "HOSTILE_BOTTOM_BREACH_LEVEL1");
    assert(report.checks.HOSTILE_BOTTOM_BREACH_LEVEL2 === true, "HOSTILE_BOTTOM_BREACH_LEVEL2");
    assert(report.checks.HOSTILE_BOTTOM_BREACH_BOSS_CRUISER === true, "HOSTILE_BOTTOM_BREACH_BOSS_CRUISER");
    assert(report.checks.HOSTILE_BOTTOM_BREACH_BOSS_SCOUT === true, "HOSTILE_BOTTOM_BREACH_BOSS_SCOUT");
    assert(report.checks.ENEMY_LASER_PLAYER === true, "ENEMY_LASER_PLAYER");
    assert(report.checks.ENEMY_LASER_VISIBLE === true, "ENEMY_LASER_VISIBLE");
    assert(report.checks.ENEMY_LASER_MOVES_DOWN === true, "ENEMY_LASER_MOVES_DOWN");
    assert(report.checks.ENEMY_LASER_SHIELD === true, "ENEMY_LASER_SHIELD");
    assert(report.checks.PLAYER_BODY_CONTACT_DAMAGE === -1, "PLAYER_BODY_CONTACT_DAMAGE");
    assert(report.checks.UNTRACED_PLAYER_LIFE_DECREMENT === 0, "UNTRACED_PLAYER_LIFE_DECREMENT");
    assert(report.checks.COMET_SCORE_REWARD === 500, "COMET_SCORE_REWARD");
    assert(report.checks.COMET_NUKE_REWARD === 1, "COMET_NUKE_REWARD");
    assert(report.checks.UNKNOWN_EXPLOSION_SOURCE === 0, "UNKNOWN_EXPLOSION_SOURCE");
    assert(report.checks.PROJECTILE_CULL_EXPLOSIONS === 0, "PROJECTILE_CULL_EXPLOSIONS");
    assert(report.checks.UNEXPLAINED_BASE_EXPLOSIONS === 0, "UNEXPLAINED_BASE_EXPLOSIONS");
    assert(report.checks.PROJECTILE_SWEPT_COLLISION_LOOP === "ON", "PROJECTILE_SWEPT_COLLISION_LOOP");
    assert(report.checks.NORMAL_RUNTIME_COLLISION_AUTHORITY === "ARCADE_OVERLAP_PLUS_PROJECTILE_SWEEP", "NORMAL_RUNTIME_COLLISION_AUTHORITY");
    assert(report.checks.PLAYER_LASER_BODY_CORE === true, "PLAYER_LASER_BODY_CORE");
    assert(report.checks.ENEMY_LASER_BODY_CORE === true, "ENEMY_LASER_BODY_CORE");
    assert(report.checks.REAL_KEYBOARD_RUNTIME_TEST === true, "REAL_KEYBOARD_RUNTIME_TEST");
    assert(report.checks.REAL_COMET_RUNTIME_TEST === true, "REAL_COMET_RUNTIME_TEST");
    assert(report.checks.REAL_ENEMY_LASER_RUNTIME_TEST === true, "REAL_ENEMY_LASER_RUNTIME_TEST");
  } else {
    assert(report.checks.PLAYER_LASER_VISIBLE === true, "PLAYER_LASER_VISIBLE");
    assert(report.checks.ENEMY_LASER_VISIBLE === true, "ENEMY_LASER_VISIBLE");
    if (report.mode === "debug") assert(report.checks.PHYSICS_DEBUG_VISUAL === true, "PHYSICS_DEBUG_VISUAL");
  }
  report.pass = failures.length === 0;
  report.failures = failures;
  return report;
}

async function main() {
  ensureDir(evidenceRoot);
  let report;
  if (mode === "gameplay") report = await gameplayAudit();
  else if (mode === "visual") report = await visualAudit(false);
  else if (mode === "debug") report = await visualAudit(true);
  else throw new Error(`Unknown mode: ${mode}`);
  report = assertReport(report);
  const file = path.join(evidenceRoot, `qa_gameplay_${mode}_report.json`);
  fs.writeFileSync(file, JSON.stringify(report, null, 2));
  console.log(`${mode} report: ${file}`);
  console.log(report.pass ? `qa:gameplay${mode === "gameplay" ? "" : `:${mode}`} PASS` : `qa:gameplay${mode === "gameplay" ? "" : `:${mode}`} FAIL\n${report.failures.join("\n")}`);
  if (!report.pass) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
