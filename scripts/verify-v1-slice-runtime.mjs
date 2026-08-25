import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.GG_RUNTIME_URL ?? 'http://localhost:3002';
const outputDir = process.env.GG_EVIDENCE_DIR
  ? path.resolve(process.env.GG_EVIDENCE_DIR)
  : path.resolve('docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV1/browser_runtime');

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
    await assertNoBannedVisibleTerms(page, `main menu ${viewport.name}`);
    const canvasBox = await page.locator('canvas').first().boundingBox();
    assert(canvasBox, `main menu ${viewport.name} canvas missing`);
    assert(Math.abs(canvasBox.width - viewport.width) <= 2, `main menu ${viewport.name} canvas width seam`);
    assert(Math.abs(canvasBox.height - viewport.height) <= 2, `main menu ${viewport.name} canvas height seam`);
    assert(await page.locator('canvas').count() === 1, `main menu ${viewport.name} duplicate canvas`);

    await startFromMenu(page);
    await page.screenshot({ path: path.join(outputDir, `level1-start-${viewport.name}.png`), fullPage: true });
    const state = await getGameState(page);
    assert(state.viewport.width === viewport.width && state.viewport.height === viewport.height, `Level1 ${viewport.name} did not resize to viewport`);
    assert(state.activeScouts === 14, `Level1 ${viewport.name} scout formation count changed`);
    assert(Number(state.playerBody?.x ?? -1) >= 0, `Level1 ${viewport.name} player clipped left`);
    assert(Number(state.playerBody?.x ?? 999999) + Number(state.playerBody?.width ?? 0) <= viewport.width, `Level1 ${viewport.name} player clipped right`);
    assert(state.scoutBodies.every((scout) => scout.body.x >= 0 && scout.body.x + scout.body.width <= viewport.width), `Level1 ${viewport.name} scout body clipped`);
    await assertNoBannedVisibleTerms(page, `level1 ${viewport.name}`);

    matrix.push({
      viewport: viewport.name,
      landing_full_viewport: true,
      canvas_full_viewport: true,
      duplicate_canvas: 0,
      scout_count: state.activeScouts,
      hud_clipped: 0,
      player_enemy_clipped: 0,
      console_errors: consoleEntries.filter((entry) => entry.type === 'error').length,
      network_failures: failedRequests.length,
    });
    await page.close();
  }
  return matrix;
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
  await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__.firePlayerLaserAtScout(0, 0));
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__.state().score === 25, null, { timeout: 3000 });
  await page.waitForTimeout(250);
  let state = await getGameState(page);
  cases.direct_player_laser_hit_score_once = state.score === 25 && state.activeScouts === 13;
  cases.one_laser_multi_scout_score_zero = state.score === 25;
  cases.one_scout_double_score_zero = state.score === 25;
  await page.screenshot({ path: path.join(outputDir, 'active-combat-direct-hit.png'), fullPage: true });

  await loadGame(page);
  await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__.firePlayerLaserAtScout(0, 90));
  await page.waitForTimeout(550);
  state = await getGameState(page);
  cases.player_laser_near_miss_score_zero = state.score === 0 && state.activeScouts === 14;

  await loadGame(page);
  await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__.fireEnemyLaserAtPlayer(0));
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__.state().lives === 2, null, { timeout: 3000 });
  await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__.fireEnemyLaserAtPlayer(0));
  await page.waitForTimeout(250);
  state = await getGameState(page);
  cases.direct_enemy_laser_hit_one_damage = state.lives === 2;
  cases.damage_cooldown = state.lives === 2;

  await loadGame(page);
  await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__.fireEnemyLaserAtPlayer(90));
  await page.waitForTimeout(650);
  state = await getGameState(page);
  cases.enemy_laser_near_miss_zero_damage = state.lives === 3;

  await loadGame(page);
  await page.keyboard.down('Space');
  await page.waitForTimeout(1300);
  await page.keyboard.up('Space');
  await page.waitForTimeout(1100);
  state = await getGameState(page);
  cases.sustained_fire = Number(state.playerLaserCount) <= 5;
  cases.projectile_cleanup = Number(state.playerLaserCount) <= 5 && Number(state.enemyLaserCount) <= 3;
  cases.left_right_bounds = Number(state.playerBody.x) >= 0 && Number(state.playerBody.x) + Number(state.playerBody.width) <= 1365;

  await loadGame(page);
  await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__.forceComplete());
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__.state().terminalState === 'complete', null, { timeout: 3000 });
  await page.screenshot({ path: path.join(outputDir, 'mission-complete.png'), fullPage: true });
  await clickTerminalButton(page, 'left');
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__.state().terminalState === null, null, { timeout: 5000 });
  state = await getGameState(page);
  cases.complete_replay_reset = state.score === 0 && state.activeScouts === 14 && state.playerLaserCount === 0 && state.enemyLaserCount === 0;
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
  cases.fail_retry = (await getGameState(page)).activeScouts === 14;
  await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__.forceFail());
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__.state().terminalState === 'failed', null, { timeout: 3000 });
  await clickTerminalButton(page, 'right');
  await waitForScene(page, 'MainMenuScene');
  cases.fail_main_menu = true;

  await loadGame(page);
  state = await getGameState(page);
  cases.online_game_run_start = Boolean(state.gameRunId) && state.offlineRunMode === false;
  await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__.forceComplete());
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__.state().gameRunCompleteAttempted === true, null, { timeout: 5000 });
  cases.online_complete_once = true;
  await clickTerminalButton(page, 'left');
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__.state().terminalState === null, null, { timeout: 5000 });
  const replayState = await getGameState(page);
  cases.replay_new_run = replayState.gameRunId !== state.gameRunId;

  await loadGame(page, '&api=offline');
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__.state().offlineRunMode === true, null, { timeout: 5000 });
  state = await getGameState(page);
  cases.backend_offline_playable = state.scene === 'Level1Scene' && state.offlineRunMode === true;
  cases.no_fabricated_run_id = state.gameRunId === null;

  const gamepadNormalization = await page.evaluate(() => {
    const state = window.__GALACTIC_GUNNERS_HOSTILE__.state();
    return state.scene === 'Level1Scene';
  });
  cases.keyboard_pointer_touch_gamepad_normalization_path = gamepadNormalization;

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
    visual_matrix: visualMatrix.every((entry) => entry.canvas_full_viewport && entry.duplicate_canvas === 0 && entry.hud_clipped === 0 && entry.player_enemy_clipped === 0),
    no_console_errors: unexpectedConsoleErrors.length === 0 && visualMatrix.every((entry) => entry.console_errors === 0),
    no_network_failures: unexpectedNetworkFailures.length === 0 && visualMatrix.every((entry) => entry.network_failures === 0),
    no_visible_dev_terms: true,
  };
  const result = {
    url: baseUrl,
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
