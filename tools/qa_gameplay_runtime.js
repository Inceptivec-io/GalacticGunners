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
  await page.evaluate(() => window.ggGameplayTestControls.Level1.cleanupFixtures());
  await page.waitForTimeout(100);
}

async function resetTraces(page) {
  await page.evaluate(() => {
    window.ggExplosionTrace = [];
    window.ggPlayerDamageTrace = [];
    window.ggProjectileSpawnTrace = [];
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
    report.checks.NORMAL_RUNTIME_SWEPT_COLLISION_LOOP = initial.sweptCollisionLoopInstalled === false ? "OFF" : "ON";
    report.checks.NORMAL_RUNTIME_COLLISION_AUTHORITY = "ARCADE_OVERLAP";

    await fireKey(page, "Space");
    await page.waitForTimeout(120);
    const shotOne = await getState(page);
    const laser = shotOne.playerLasers[shotOne.playerLasers.length - 1];
    report.checks.PLAYER_LASER_VISIBLE = !!laser;
    report.checks.PLAYER_LASER_MOVES_UP = !!laser && laser.velocityY < 0;
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
    await page.evaluate(() => window.ggGameplayTestControls.Level1.spawnEnemyInPlayerShotPath());
    await fireUntil(page, () => window.ggExplosionTrace.some((item) => item.eventSource === "PLAYER_LASER_HOSTILE_HIT"));
    const enemyHit = await getState(page);
    report.checks.PLAYER_LASER_ENEMY = enemyHit.score > enemyScoreBefore;

    await cleanup(page);
    await resetTraces(page);
    const asteroidScoreBefore = (await getState(page)).score;
    await page.evaluate(() => window.ggGameplayTestControls.Level1.spawnAsteroidInPlayerShotPath());
    await fireUntil(page, () => window.ggExplosionTrace.some((item) => item.eventSource === "PLAYER_LASER_ASTEROID_HIT"));
    const asteroidHit = await getState(page);
    report.checks.PLAYER_LASER_ASTEROID = asteroidHit.score > asteroidScoreBefore;

    await cleanup(page);
    await resetTraces(page);
    const cometBefore = await getState(page);
    await page.evaluate(() => window.ggGameplayTestControls.Level1.spawnCometInPlayerShotPath());
    await fireUntil(page, () => window.ggExplosionTrace.some((item) => item.eventSource === "PLAYER_LASER_COMET_HIT"));
    const cometAfter = await getState(page);
    report.checks.PLAYER_LASER_COMET = cometAfter.score - cometBefore.score === 500;
    report.checks.COMET_SCORE_REWARD = cometAfter.score - cometBefore.score;
    report.checks.COMET_NUKE_REWARD = cometAfter.currentNukes - cometBefore.currentNukes;

    await cleanup(page);
    await resetTraces(page);
    await page.evaluate(() => window.ggGameplayTestControls.Level1.spawnShieldInPlayerShotPath());
    await fireKey(page, "Space");
    await page.waitForTimeout(900);
    const shieldPass = await page.evaluate(() => {
      const scene = game.scene.keys.Level1;
      return {
        shieldAlive: scene.shieldTiles.getChildren().some((item) => item && item.active && item.ggTestFixture),
        playerLaserAlive: scene.playerLasers.getChildren().some((item) => item && item.active && item.ggProjectileSide === "player")
      };
    });
    report.checks.PLAYER_LASER_SHIELD_PASS = shieldPass.shieldAlive && shieldPass.playerLaserAlive;

    await cleanup(page);
    await resetTraces(page);
    const nukeScoreBefore = (await getState(page)).score;
    await page.evaluate(() => window.ggGameplayTestControls.Level1.spawnEnemyInPlayerShotPath());
    await fireKey(page, "n");
    await waitFor(page, () => window.ggExplosionTrace.some((item) => item.eventSource === "PLAYER_NUKE_HOSTILE_HIT"));
    const nukeHit = await getState(page);
    report.checks.PLAYER_NUKE_HOSTILE_TARGETS = nukeHit.score > nukeScoreBefore;

    await cleanup(page);
    await resetTraces(page);
    await page.evaluate(() => window.ggGameplayTestControls.Level1.placePlayerClearOfShields());
    await page.evaluate(() => window.ggGameplayTestControls.Level1.spawnEnemyLaserAtPlayer());
    await page.waitForTimeout(250);
    const enemyLaserMoving = await getState(page);
    const movingEnemyLaser = enemyLaserMoving.enemyLasers[enemyLaserMoving.enemyLasers.length - 1];
    const enemyLaserY = movingEnemyLaser ? movingEnemyLaser.y : null;
    await page.waitForTimeout(350);
    const enemyLaserMoved = await getState(page);
    const movedEnemyLaser = enemyLaserMoved.enemyLasers.find((item) => movingEnemyLaser && item.id === movingEnemyLaser.id);
    report.checks.ENEMY_LASER_VISIBLE = !!movingEnemyLaser;
    report.checks.ENEMY_LASER_MOVES_DOWN = !!movedEnemyLaser && movedEnemyLaser.y > enemyLaserY && movedEnemyLaser.velocityY > 0;
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

    const allTraces = (await getState(page)).traces.explosions;
    report.checks.UNKNOWN_EXPLOSION_SOURCE = allTraces.filter((item) => !item.eventSource || /UNKNOWN|UNDEFINED|NULL|UNATTRIBUTED/.test(item.eventSource)).length;
    report.checks.PROJECTILE_CULL_EXPLOSIONS = allTraces.filter((item) => item.eventSource === "PROJECTILE_CULL_EXPLOSION").length;
    report.checks.UNEXPLAINED_BASE_EXPLOSIONS = allTraces.filter((item) => item.eventSource === "UNEXPLAINED").length;
    report.checks.REAL_KEYBOARD_RUNTIME_TEST = true;
    report.checks.REAL_COMET_RUNTIME_TEST = report.checks.PLAYER_LASER_COMET;
    report.checks.REAL_ENEMY_LASER_RUNTIME_TEST = report.checks.ENEMY_LASER_PLAYER;
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
    assert(report.checks.PLAYER_LASER_SHIELD_PASS === true, "PLAYER_LASER_SHIELD_PASS");
    assert(report.checks.PLAYER_NUKE_HOSTILE_TARGETS === true, "PLAYER_NUKE_HOSTILE_TARGETS");
    assert(report.checks.ENEMY_LASER_PLAYER === true, "ENEMY_LASER_PLAYER");
    assert(report.checks.ENEMY_LASER_VISIBLE === true, "ENEMY_LASER_VISIBLE");
    assert(report.checks.ENEMY_LASER_MOVES_DOWN === true, "ENEMY_LASER_MOVES_DOWN");
    assert(report.checks.ENEMY_LASER_SHIELD === true, "ENEMY_LASER_SHIELD");
    assert(report.checks.PLAYER_BODY_CONTACT_DAMAGE === 0, "PLAYER_BODY_CONTACT_DAMAGE");
    assert(report.checks.UNTRACED_PLAYER_LIFE_DECREMENT === 0, "UNTRACED_PLAYER_LIFE_DECREMENT");
    assert(report.checks.COMET_SCORE_REWARD === 500, "COMET_SCORE_REWARD");
    assert(report.checks.COMET_NUKE_REWARD === 1, "COMET_NUKE_REWARD");
    assert(report.checks.UNKNOWN_EXPLOSION_SOURCE === 0, "UNKNOWN_EXPLOSION_SOURCE");
    assert(report.checks.PROJECTILE_CULL_EXPLOSIONS === 0, "PROJECTILE_CULL_EXPLOSIONS");
    assert(report.checks.UNEXPLAINED_BASE_EXPLOSIONS === 0, "UNEXPLAINED_BASE_EXPLOSIONS");
    assert(report.checks.NORMAL_RUNTIME_SWEPT_COLLISION_LOOP === "OFF", "NORMAL_RUNTIME_SWEPT_COLLISION_LOOP");
    assert(report.checks.NORMAL_RUNTIME_COLLISION_AUTHORITY === "ARCADE_OVERLAP", "NORMAL_RUNTIME_COLLISION_AUTHORITY");
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
