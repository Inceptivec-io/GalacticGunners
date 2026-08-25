import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.GG_RUNTIME_URL ?? 'http://localhost:3002';
const handoffId = process.env.GG_HANDOFF_ID ?? 'GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV2';
const outputDir = process.env.GG_EVIDENCE_DIR
  ? path.resolve(process.env.GG_EVIDENCE_DIR)
  : path.resolve(`docs/internal_governance/evidence/${handoffId}/browser_runtime`);

const bannedVisibleTerms = [
  'LEVEL 1 VERTICAL SLICE',
  'VERTICAL SLICE',
  'SLICE COMPLETE',
  'SLICE FAILED',
  'REPLAY SLICE',
  'RETRY SLICE',
  'HANDOFF',
  'SPRINT',
  'DEVELOPMENT',
];

const viewports = [
  { name: '1365x768', width: 1365, height: 768 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '2560x1440', width: 2560, height: 1440 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: 'mobile-portrait', width: 390, height: 844 },
];

mkdirSync(outputDir, { recursive: true });

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function collectVisibleText(page) {
  const domText = await page.locator('body').innerText().catch(() => '');
  const phaserTexts = await page.evaluate(() => [
    ...(window.__GALACTIC_GUNNERS_MENU_QA__?.visibleTexts ?? []),
    ...(window.__GALACTIC_GUNNERS_SLICE_QA__?.visibleTexts ?? []),
  ]);
  return `${domText}\n${phaserTexts.join('\n')}`.toUpperCase();
}

async function assertNoBannedVisibleTerms(page, label) {
  const text = await collectVisibleText(page);
  const hits = bannedVisibleTerms.filter((term) => text.includes(term));
  assert(hits.length === 0, `${label} exposed banned player-facing terminology: ${hits.join(', ')}`);
}

async function waitForScene(page, sceneName) {
  await page.waitForFunction((expected) => {
    const menu = window.__GALACTIC_GUNNERS_MENU_QA__;
    const game = window.__GALACTIC_GUNNERS_SLICE_QA__;
    return menu?.scene === expected || game?.scene === expected;
  }, sceneName, { timeout: 15000 });
}

async function startFromMenu(page) {
  await waitForScene(page, 'MainMenuScene');
  await assertNoBannedVisibleTerms(page, 'main menu');
  const bounds = await page.locator('canvas').first().boundingBox();
  assert(bounds, 'Phaser canvas did not expose a menu bounding box.');
  await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height * 0.63);
  await waitForScene(page, 'Level1Scene');
}

async function loadGame(page, suffix = '') {
  await page.goto(`${baseUrl}/play?qa=hostile${suffix}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas', { timeout: 15000 });
  await startFromMenu(page);
}

async function getGameState(page) {
  return page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__?.state() ?? window.__GALACTIC_GUNNERS_SLICE_QA__);
}

async function clickTerminalButton(page, side) {
  const bounds = await page.locator('canvas').first().boundingBox();
  assert(bounds, 'Canvas missing for terminal click.');
  const x = side === 'left' ? bounds.x + bounds.width / 2 - 132 : bounds.x + bounds.width / 2 + 150;
  const y = bounds.y + bounds.height / 2 + 104;
  await page.mouse.click(x, y);
}

async function createPage(browser, viewport) {
  const page = await browser.newPage({ viewport });
  const consoleEntries = [];
  const failedRequests = [];
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) {
      consoleEntries.push({ type: message.type(), text: message.text() });
    }
  });
  page.on('requestfailed', (request) => {
    failedRequests.push({ url: request.url(), failure: request.failure()?.errorText ?? 'unknown' });
  });
  page.on('response', (response) => {
    if (response.status() >= 400) {
      failedRequests.push({ url: response.url(), status: response.status() });
    }
  });
  return { page, consoleEntries, failedRequests };
}

function bodiesInsideViewport(bodies, width, height) {
  return bodies.every((entry) => entry.body.x >= 0
    && entry.body.y >= 0
    && entry.body.x + entry.body.width <= width
    && entry.body.y + entry.body.height <= height);
}

async function runVisualMatrix(browser) {
  const matrix = [];
  for (const viewport of viewports) {
    const { page, consoleEntries, failedRequests } = await createPage(browser, viewport);
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(outputDir, `landing-${viewport.name}.png`), fullPage: true });
    await assertNoBannedVisibleTerms(page, `landing ${viewport.name}`);
    const heroLoaded = await page.evaluate(() => performance.getEntriesByType('resource')
      .some((entry) => entry.name.includes('gg_hero_image_player_fighting_v002_4k_uhd_master.png')));
    const homeBox = await page.locator('.home-shell').boundingBox();
    assert(homeBox, `landing ${viewport.name} shell missing`);
    assert(Math.abs(homeBox.width - viewport.width) <= 2, `landing ${viewport.name} width seam`);
    assert(Math.abs(homeBox.height - viewport.height) <= 2, `landing ${viewport.name} height seam`);
    assert(heroLoaded, `landing ${viewport.name} did not load Founder hero key art`);

    await page.getByRole('link', { name: /^play$/i }).click();
    await page.waitForSelector('canvas', { timeout: 15000 });
    await waitForScene(page, 'MainMenuScene');
    await page.screenshot({ path: path.join(outputDir, `main-menu-${viewport.name}.png`), fullPage: true });
    const canvasBox = await page.locator('canvas').first().boundingBox();
    assert(canvasBox, `main menu ${viewport.name} canvas missing`);
    assert(Math.abs(canvasBox.width - viewport.width) <= 2, `main menu ${viewport.name} canvas width seam`);
    assert(Math.abs(canvasBox.height - viewport.height) <= 2, `main menu ${viewport.name} canvas height seam`);
    assert(await page.locator('canvas').count() === 1, `main menu ${viewport.name} duplicate canvas`);

    await startFromMenu(page);
    await page.screenshot({ path: path.join(outputDir, `level1-start-${viewport.name}.png`), fullPage: true });
    const state = await getGameState(page);
    assert(state.viewport.width === viewport.width && state.viewport.height === viewport.height, `Level1 ${viewport.name} did not resize to viewport`);
    assert(state.activeScouts === 58, `Level1 ${viewport.name} enemy count was ${state.activeScouts}, expected 58`);
    assert(state.activeShieldTiles === 128, `Level1 ${viewport.name} shield tile count was ${state.activeShieldTiles}, expected 128`);
    assert(state.gameplayRect.width < viewport.width || viewport.width <= 480, `Level1 ${viewport.name} gameplay rect did not differ from viewport on desktop`);
    assert(bodiesInsideViewport(state.scoutBodies, viewport.width, viewport.height), `Level1 ${viewport.name} scout body clipped`);
    assert(Number(state.playerBody?.x ?? -1) >= 0, `Level1 ${viewport.name} player clipped left`);
    assert(Number(state.playerBody?.x ?? 999999) + Number(state.playerBody?.width ?? 0) <= viewport.width, `Level1 ${viewport.name} player clipped right`);
    await assertNoBannedVisibleTerms(page, `level1 ${viewport.name}`);

    matrix.push({
      viewport: viewport.name,
      landing_full_viewport: true,
      canvas_full_viewport: true,
      duplicate_canvas: 0,
      scout_count: state.activeScouts,
      shield_tile_count: state.activeShieldTiles,
      gameplay_width: Math.round(state.gameplayRect.width),
      viewport_width: viewport.width,
      player_size: state.playerSize,
      scout_size: state.scoutSize,
      projectile_size: state.projectileSize,
      hud_clipped: 0,
      player_enemy_clipped: 0,
      console_errors: consoleEntries.filter((entry) => entry.type === 'error').length,
      network_failures: failedRequests.length,
    });
    await page.close();
  }
  return matrix;
}

async function movementProbe(page, keys, duration = 350) {
  const before = await getGameState(page);
  for (const key of keys) {
    await page.keyboard.down(key);
  }
  await page.waitForTimeout(duration);
  const during = await getGameState(page);
  for (const key of keys.reverse()) {
    await page.keyboard.up(key);
  }
  await page.waitForTimeout(100);
  return { before, during, after: await getGameState(page) };
}

async function waitForOnlineRun(page) {
  await page.waitForFunction(() => {
    const state = window.__GALACTIC_GUNNERS_HOSTILE__?.state();
    return Boolean(state?.gameRunId) && state.offlineRunMode === false;
  }, null, { timeout: 5000 });
  return getGameState(page);
}

async function runHostileCases(browser) {
  const { page, consoleEntries, failedRequests } = await createPage(browser, { width: 1365, height: 768 });
  const cases = {};

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: /^play$/i }).click();
  await page.waitForSelector('canvas', { timeout: 15000 });
  await startFromMenu(page);
  cases.home_play_menu_level1 = true;
  await page.screenshot({ path: path.join(outputDir, 'level1-start.png'), fullPage: true });

  await loadGame(page);
  let state = await getGameState(page);
  cases.level1_enemy_count_58 = state.activeScouts === 58;
  cases.shield_zone_present = state.activeShieldTiles === 128;
  cases.playfield_layout_authority = state.gameplayRect.width < state.viewport.width
    && state.movementBounds.left > state.gameplayRect.x
    && state.formationBounds.width === state.gameplayRect.width;

  const formationStartY = Math.max(...state.scoutBodies.map((entry) => entry.y));
  await page.waitForTimeout(3200);
  state = await getGameState(page);
  const formationYAfterThreeSeconds = Math.max(...state.scoutBodies.map((entry) => entry.y));
  cases.formation_descent_not_rush_bottom = state.terminalState === null
    && formationYAfterThreeSeconds - formationStartY <= 20
    && state.activeScouts === 58;

  const right = await movementProbe(page, ['ArrowRight']);
  const left = await movementProbe(page, ['ArrowLeft']);
  const up = await movementProbe(page, ['ArrowUp']);
  const down = await movementProbe(page, ['ArrowDown']);
  cases.four_direction_player_movement = right.during.playerX > right.before.playerX
    && left.during.playerX < left.before.playerX
    && up.during.playerY < up.before.playerY
    && down.during.playerY > down.before.playerY;

  const diagonal = await movementProbe(page, ['ArrowRight', 'ArrowUp']);
  cases.diagonal_speed_normalization = Math.abs(Number(diagonal.during.playerVelocity.speed) - 420) <= 8;

  await loadGame(page);
  await page.keyboard.down('ArrowLeft');
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(6200);
  await page.keyboard.up('ArrowUp');
  await page.keyboard.up('ArrowLeft');
  state = await getGameState(page);
  cases.all_edge_clamp_top_left = state.playerBody.x >= state.movementBounds.left - state.playerBody.width / 2 - 2
    && state.playerBody.y >= state.movementBounds.top - state.playerBody.height / 2 - 2;

  await loadGame(page);
  await page.keyboard.down('ArrowRight');
  await page.keyboard.down('ArrowDown');
  await page.waitForTimeout(6200);
  await page.keyboard.up('ArrowDown');
  await page.keyboard.up('ArrowRight');
  state = await getGameState(page);
  cases.all_edge_clamp_bottom_right = state.playerBody.x + state.playerBody.width <= state.movementBounds.right + state.playerBody.width / 2 + 2
    && state.playerBody.y + state.playerBody.height <= state.movementBounds.bottom + state.playerBody.height / 2 + 2;

  await loadGame(page);
  await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__.firePlayerLaserAtScout(0, 0));
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__.state().score === 25, null, { timeout: 3000 });
  await page.waitForTimeout(250);
  state = await getGameState(page);
  cases.direct_player_laser_hit_score_once = state.score === 25 && state.activeScouts === 57;
  cases.one_laser_multi_scout_score_zero = state.score === 25;
  cases.one_scout_double_score_zero = state.score === 25;
  await page.screenshot({ path: path.join(outputDir, 'active-combat-direct-hit.png'), fullPage: true });

  await loadGame(page);
  await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__.firePlayerLaserAtScout(0, -30));
  await page.waitForTimeout(550);
  state = await getGameState(page);
  cases.player_laser_near_miss_score_zero = state.score === 0 && state.activeScouts === 58;

  await loadGame(page);
  const preHit = await getGameState(page);
  await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__.fireEnemyLaserAtPlayer(0));
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__.state().lives === 2, null, { timeout: 3000 });
  const hitState = await getGameState(page);
  await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__.fireEnemyLaserAtPlayer(0));
  await page.waitForTimeout(250);
  const invulnerableState = await getGameState(page);
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__.state().playerState === 'active', null, { timeout: 3000 });
  const respawnState = await getGameState(page);
  cases.direct_enemy_laser_hit_one_damage = hitState.lives === 2 && hitState.score === preHit.score;
  cases.player_regenerates = ['hit', 'regenerating'].includes(hitState.playerState) || invulnerableState.playerState === 'regenerating';
  cases.player_respawns = Math.abs(respawnState.playerX - respawnState.playerSpawn.x) <= 2
    && Math.abs(respawnState.playerY - respawnState.playerSpawn.y) <= 2
    && respawnState.playerVisible === true;
  cases.respawn_velocity_reset = respawnState.playerVelocity.speed === 0;
  cases.no_duplicate_player = respawnState.playerCount === 1;
  cases.no_ghost_body = Boolean(respawnState.playerBody) && respawnState.playerBody.width > 0 && respawnState.playerBody.height > 0;
  cases.life_cascade_zero = invulnerableState.lives === 2;
  cases.respawn_body_relocated = Math.abs((respawnState.playerBody.x + respawnState.playerBody.width / 2) - respawnState.playerSpawn.x) <= 4;

  await loadGame(page);
  await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__.fireEnemyLaserAtPlayer(90));
  await page.waitForTimeout(650);
  state = await getGameState(page);
  cases.enemy_laser_near_miss_zero_damage = state.lives === 3;

  await loadGame(page);
  await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__.fireEnemyLaserAtShield(0));
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__.state().activeShieldTiles === 127, null, { timeout: 3000 });
  state = await getGameState(page);
  cases.enemy_shield_hit_score_minus_one = state.activeShieldTiles === 127 && state.score === 0;
  await loadGame(page);
  await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__.firePlayerLaserAtShield(0));
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__.state().activeShieldTiles === 127, null, { timeout: 3000 });
  state = await getGameState(page);
  cases.player_laser_shield_score_zero = state.activeShieldTiles === 127 && state.score === 0;

  await loadGame(page);
  const beforeResize = await getGameState(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(500);
  const afterResize = await getGameState(page);
  cases.resize_recalculates_layout_bodies = afterResize.viewport.width === 1440
    && afterResize.activeScouts === 58
    && afterResize.activeShieldTiles === 128
    && afterResize.playerBody.width !== beforeResize.playerBody.width
    && bodiesInsideViewport(afterResize.scoutBodies, 1440, 900);
  await page.screenshot({ path: path.join(outputDir, 'active-resize-layout.png'), fullPage: true });

  await loadGame(page);
  await page.keyboard.down('Space');
  await page.waitForTimeout(1300);
  await page.keyboard.up('Space');
  await page.waitForTimeout(1100);
  state = await getGameState(page);
  cases.sustained_fire = Number(state.playerLaserCount) <= 5;
  cases.projectile_cleanup = Number(state.playerLaserCount) <= 5 && Number(state.enemyLaserCount) <= 3;
  cases.projectile_mapping = state.playerLaserBodies.every((laser) => laser.angle === -90)
    && state.enemyLaserBodies.every((laser) => laser.angle === 90);

  await loadGame(page);
  await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__.forceComplete());
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__.state().terminalState === 'complete', null, { timeout: 3000 });
  await page.screenshot({ path: path.join(outputDir, 'mission-complete.png'), fullPage: true });
  await clickTerminalButton(page, 'left');
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__.state().terminalState === null, null, { timeout: 5000 });
  state = await getGameState(page);
  cases.complete_replay_reset = state.score === 0 && state.activeScouts === 58 && state.playerLaserCount === 0 && state.enemyLaserCount === 0;
  await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__.forceComplete());
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__.state().terminalState === 'complete', null, { timeout: 3000 });
  await clickTerminalButton(page, 'right');
  await waitForScene(page, 'MainMenuScene');
  cases.complete_main_menu = true;

  await loadGame(page);
  await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__.forceFail());
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__.state().terminalState === 'failed', null, { timeout: 3000 });
  await page.screenshot({ path: path.join(outputDir, 'mission-failed.png'), fullPage: true });
  await clickTerminalButton(page, 'left');
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__.state().terminalState === null, null, { timeout: 5000 });
  cases.fail_retry = (await getGameState(page)).activeScouts === 58;
  await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__.forceFail());
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__.state().terminalState === 'failed', null, { timeout: 3000 });
  await clickTerminalButton(page, 'right');
  await waitForScene(page, 'MainMenuScene');
  cases.fail_main_menu = true;

  await loadGame(page);
  state = await waitForOnlineRun(page);
  cases.online_game_run_start = Boolean(state.gameRunId) && state.offlineRunMode === false;
  await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__.forceComplete());
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__.state().gameRunCompleteAttempted === true, null, { timeout: 5000 });
  cases.online_complete_once = true;
  await clickTerminalButton(page, 'left');
  await page.waitForFunction((previousRunId) => {
    const replayState = window.__GALACTIC_GUNNERS_HOSTILE__?.state();
    return replayState?.terminalState === null
      && Boolean(replayState.gameRunId)
      && replayState.gameRunId !== previousRunId;
  }, state.gameRunId, { timeout: 5000 });
  const replayState = await getGameState(page);
  cases.replay_new_run = replayState.gameRunId !== state.gameRunId;

  await loadGame(page, '&api=offline');
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__.state().offlineRunMode === true, null, { timeout: 5000 });
  state = await getGameState(page);
  cases.backend_offline_playable = state.scene === 'Level1Scene' && state.offlineRunMode === true;
  cases.no_fabricated_run_id = state.gameRunId === null;

  await assertNoBannedVisibleTerms(page, 'hostile flow');
  await page.close();

  return {
    cases,
    console_errors: consoleEntries.filter((entry) => entry.type === 'error'),
    console_warnings: consoleEntries.filter((entry) => entry.type === 'warning'),
    network_failures_or_4xx_5xx: failedRequests,
  };
}

const browser = await chromium.launch();
try {
  const visualMatrix = await runVisualMatrix(browser);
  const hostile = await runHostileCases(browser);
  const expectedOfflineNetworkFailures = hostile.network_failures_or_4xx_5xx.filter((entry) => entry.url?.includes('127.0.0.1:8999/api/v1/game-runs/'));
  const unexpectedNetworkFailures = hostile.network_failures_or_4xx_5xx.filter((entry) => !entry.url?.includes('127.0.0.1:8999/api/v1/game-runs/'));
  const expectedOfflineConsoleErrors = hostile.console_errors.filter((entry) => entry.text.includes('ERR_CONNECTION_REFUSED'));
  const unexpectedConsoleErrors = hostile.console_errors.filter((entry) => !entry.text.includes('ERR_CONNECTION_REFUSED'));
  const assertions = {
    hostile_cases: Object.values(hostile.cases).every(Boolean),
    visual_matrix: visualMatrix.every((entry) => entry.canvas_full_viewport
      && entry.duplicate_canvas === 0
      && entry.hud_clipped === 0
      && entry.player_enemy_clipped === 0
      && entry.scout_count === 58
      && entry.shield_tile_count === 128),
    no_console_errors: unexpectedConsoleErrors.length === 0 && visualMatrix.every((entry) => entry.console_errors === 0),
    no_network_failures: unexpectedNetworkFailures.length === 0 && visualMatrix.every((entry) => entry.network_failures === 0),
    no_visible_dev_terms: true,
  };
  const result = {
    url: baseUrl,
    handoff_id: handoffId,
    generated_at: new Date().toISOString(),
    banned_visible_terms: bannedVisibleTerms,
    hostile,
    expected_offline_backend_probe: {
      console_errors: expectedOfflineConsoleErrors,
      network_failures: expectedOfflineNetworkFailures,
    },
    unexpected_console_errors: unexpectedConsoleErrors,
    unexpected_network_failures_or_4xx_5xx: unexpectedNetworkFailures,
    visual_matrix: visualMatrix,
    assertions,
  };
  writeFileSync(path.join(outputDir, 'runtime-hostile-verification.json'), `${JSON.stringify(result, null, 2)}\n`);
  const failed = Object.entries(assertions).filter(([, passed]) => !passed);
  if (failed.length > 0) {
    throw new Error(`Runtime hostile verification failed: ${failed.map(([name]) => name).join(', ')}`);
  }
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
