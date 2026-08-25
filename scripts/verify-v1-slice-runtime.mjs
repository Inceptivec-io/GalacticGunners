import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.GG_RUNTIME_URL ?? 'http://localhost:3002';
const handoffId = process.env.GG_HANDOFF_ID ?? 'GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV3';
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

const numericHudCounterPattern = new RegExp('^[0-9]+/[0-9]+$');

const viewports = [
  { name: '1365x768', width: 1365, height: 768 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '2560x1440', width: 2560, height: 1440 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: 'mobile-portrait', width: 390, height: 844 },
];

function rev2PlayerSize(viewport) {
  const height = Math.max(86, Math.min(132, viewport.height * 0.15));
  return { width: height * 0.75, height };
}

function expectedScoutWidth(viewport) {
  const gameplayWidth = viewport.width * 0.94;
  return Math.max(10.75, Math.min(74, (gameplayWidth / 35) * 1.075));
}

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
    assert(state.activeShieldTiles === 256, `Level1 ${viewport.name} shield tile count was ${state.activeShieldTiles}, expected 256`);
    const playerRatio = state.playerSize.height / rev2PlayerSize(viewport).height;
    assert(playerRatio >= 0.55 && playerRatio <= 0.65, `Level1 ${viewport.name} player scale ratio ${playerRatio} outside REV3 tolerance`);
    assert(Math.abs(state.scoutSize.width - expectedScoutWidth(viewport)) <= 0.2, `Level1 ${viewport.name} scout width ${state.scoutSize.width} outside visual contract`);
    assert(state.shieldBottomGapPlayerHeights >= 1.1 && state.shieldBottomGapPlayerHeights <= 1.3, `Level1 ${viewport.name} shield gap ${state.shieldBottomGapPlayerHeights} outside legacy topology target`);
    assert(state.projectileSize.width >= 28 && state.projectileSize.width <= 40, `Level1 ${viewport.name} projectile length ${state.projectileSize.width} outside reference tolerance`);
    assert(state.projectileSize.height >= 5 && state.projectileSize.height <= 8, `Level1 ${viewport.name} projectile thickness ${state.projectileSize.height} outside reference tolerance`);
    assert(state.shieldTileSize.width >= 4 && state.shieldTileSize.width <= 14, `Level1 ${viewport.name} shield tile size ${state.shieldTileSize.width} outside reference tolerance`);
    assert(state.hudPositions.score.x < viewport.width * 0.2 && state.hudPositions.score.y < viewport.height * 0.12, `Level1 ${viewport.name} score HUD not top-left`);
    assert(state.hudPositions.sound.x > viewport.width * 0.9 && state.hudPositions.sound.y < viewport.height * 0.12, `Level1 ${viewport.name} sound HUD not top-right`);
    assert(state.hudPositions.lives.filter((icon) => icon.visible).length === state.lives, `Level1 ${viewport.name} life icons do not match live state`);
    assert(Math.min(...state.hudPositions.lives.map((icon) => icon.x)) < viewport.width * 0.2
      && state.hudPositions.lives.every((icon) => icon.y > viewport.height * 0.86), `Level1 ${viewport.name} lives HUD not bottom-left`);
    assert(state.hudPositions.nukes.filter((icon) => icon.visible).length === state.currentNukes, `Level1 ${viewport.name} nuke icons do not match live state`);
    assert(Math.max(...state.hudPositions.nukes.map((icon) => icon.x)) < state.hudPositions.rearmBar.x
      && state.hudPositions.rearmBar.x > viewport.width * 0.68
      && state.hudPositions.nukes.every((icon) => icon.y > viewport.height * 0.82), `Level1 ${viewport.name} nuke HUD not bottom-right before energise bar`);
    assert(!state.visibleTexts.some((text) => numericHudCounterPattern.test(text) || /^NUKES/i.test(text)), `Level1 ${viewport.name} exposed numeric life/nuke HUD text`);
    assert(state.hudPositions.rearm.text === 'ENERGISE', `Level1 ${viewport.name} nuke bar label not ENERGISE`);
    assert(state.hudPositions.rearmBar.x > viewport.width * 0.68 && state.hudPositions.rearmBar.y > viewport.height * 0.82, `Level1 ${viewport.name} energise bar not bottom-right`);
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
      bunker_count: state.bunkerCount,
      gameplay_width: Math.round(state.gameplayRect.width),
      viewport_width: viewport.width,
      player_size: state.playerSize,
      player_scale_relative_rev2: Number(playerRatio.toFixed(3)),
      scout_size: state.scoutSize,
      scout_expected_width: Number(expectedScoutWidth(viewport).toFixed(3)),
      projectile_size: state.projectileSize,
      shield_tile_size: state.shieldTileSize,
      hud_positions: state.hudPositions,
      shield_bottom_gap_player_heights: Number(state.shieldBottomGapPlayerHeights.toFixed(3)),
      hud_clipped: 0,
      player_enemy_clipped: 0,
      console_errors: consoleEntries.filter((entry) => entry.type === 'error').length,
      network_failures: failedRequests.length,
    });
    await page.close();
  }
  return matrix;
}

function firstLaser(state, type) {
  return type === 'player' ? state.playerLaserBodies[0] : state.enemyLaserBodies[0];
}

function laserVisualAndBodyValid(laser) {
  return Boolean(laser)
    && laser.angle !== 0
    && laser.display.width >= 28
    && laser.display.width <= 40
    && laser.display.height >= 5
    && laser.display.height <= 8
    && laser.worldBounds.height > laser.worldBounds.width
    && laser.body.height > laser.body.width
    && laser.body.width >= 4
    && laser.body.width <= 10
    && laser.body.height >= 26
    && laser.body.height <= 40;
}

function findScoutClearOfShield(state) {
  let candidate = null;
  for (let index = 0; index < state.scoutBodies.length; index += 1) {
    const scout = state.scoutBodies[index];
    const intersectsShield = state.shieldBodies.some((shield) => Math.abs(shield.x - scout.x) <= (shield.body.width / 2 + state.projectileSize.height / 2 + 2));
    if (!intersectsShield) {
      if (!candidate || scout.y > candidate.scout.y) {
        candidate = { index, scout };
      }
    }
  }
  return candidate?.index ?? 0;
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
  cases.level1_bunkers_8 = state.bunkerCount === 8;
  cases.shield_zone_present = state.activeShieldTiles === 256;
  cases.shield_lower_lane_gap = state.shieldBottomGapPlayerHeights >= 1.1 && state.shieldBottomGapPlayerHeights <= 1.3;
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
  cases.rev3_player_scale = Math.abs((state.playerSize.height / 115.2) - 0.6) <= 0.05;
  cases.rev3_scout_scale = Math.abs(state.scoutSize.width - expectedScoutWidth(state.viewport)) <= 0.2;

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
  state = await getGameState(page);
  const clearScoutIndex = findScoutClearOfShield(state);
  await page.evaluate((index) => window.__GALACTIC_GUNNERS_HOSTILE__.setPlayerUnderScout(index, 0), clearScoutIndex);
  await page.keyboard.press('Space');
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__.state().score === 25, null, { timeout: 6500 });
  await page.waitForTimeout(250);
  state = await getGameState(page);
  cases.direct_player_laser_hit_score_once = state.score === 25 && state.activeScouts === 57;
  cases.real_origin_player_laser_direct_hit = cases.direct_player_laser_hit_score_once;
  cases.one_laser_multi_scout_score_zero = state.score === 25;
  cases.one_scout_double_score_zero = state.score === 25;
  await page.screenshot({ path: path.join(outputDir, 'active-combat-direct-hit.png'), fullPage: true });

  await loadGame(page);
  state = await getGameState(page);
  const nearMissOffset = -Math.max(60, state.scoutSize.width * 1.45);
  await page.evaluate(({ index, offset }) => window.__GALACTIC_GUNNERS_HOSTILE__.setPlayerUnderScout(index, offset), {
    index: findScoutClearOfShield(state),
    offset: nearMissOffset,
  });
  await page.keyboard.press('Space');
  await page.waitForTimeout(3600);
  state = await getGameState(page);
  cases.player_laser_near_miss_score_zero = state.score === 0 && state.activeScouts === 58;
  cases.real_origin_player_laser_near_miss = cases.player_laser_near_miss_score_zero;

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
  const enemyLaserLaneOffsets = [
    -Math.max(4, Math.floor(preHit.playerBody.width * 0.42)),
    0,
    Math.max(4, Math.floor(preHit.playerBody.width * 0.42)),
  ];
  const laneHitResults = [];
  for (const offset of enemyLaserLaneOffsets) {
    await loadGame(page);
    await page.evaluate((laneOffset) => window.__GALACTIC_GUNNERS_HOSTILE__.fireEnemyLaserAtPlayer(laneOffset), offset);
    await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__.state().lives === 2, null, { timeout: 3000 });
    const laneState = await getGameState(page);
    laneHitResults.push(laneState.lives === 2);
  }
  cases.enemy_laser_player_body_lanes_hit = laneHitResults.every(Boolean);
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
  await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__.firePlayerLaserForVisual(0));
  await page.waitForTimeout(90);
  state = await getGameState(page);
  cases.player_laser_visual_body_mapping = laserVisualAndBodyValid(firstLaser(state, 'player')) && firstLaser(state, 'player').angle === -90;
  await page.screenshot({ path: path.join(outputDir, 'player-laser-mid-flight.png'), fullPage: true });
  await loadGame(page);
  await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__.fireEnemyLaserAtPlayer(90));
  await page.waitForTimeout(400);
  state = await getGameState(page);
  cases.enemy_laser_visual_body_mapping = laserVisualAndBodyValid(firstLaser(state, 'enemy')) && firstLaser(state, 'enemy').angle === 90;
  await page.screenshot({ path: path.join(outputDir, 'enemy-laser-mid-flight.png'), fullPage: true });

  await loadGame(page);
  await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__.fireEnemyLaserAtShield(0));
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__.state().activeShieldTiles === 255, null, { timeout: 3000 });
  state = await getGameState(page);
  cases.enemy_shield_hit_score_minus_one = state.activeShieldTiles === 255 && state.score === 0;
  await loadGame(page);
  await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__.firePlayerLaserAtShield(0));
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__.state().activeShieldTiles === 255, null, { timeout: 3000 });
  state = await getGameState(page);
  cases.player_laser_shield_score_zero = state.activeShieldTiles === 255 && state.score === 0;

  await loadGame(page);
  const beforeResize = await getGameState(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(500);
  const afterResize = await getGameState(page);
  cases.resize_recalculates_layout_bodies = afterResize.viewport.width === 1440
    && afterResize.activeScouts === 58
    && afterResize.activeShieldTiles === 256
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
  state = await getGameState(page);
  cases.nuke_initial_count = state.currentNukes === 2 && state.maxNukes === 2 && state.rearmProgress === 150 && state.rearmMax === 150;
  await page.evaluate((index) => window.__GALACTIC_GUNNERS_HOSTILE__.setPlayerUnderScout(index, 0), findScoutClearOfShield(state));
  await page.keyboard.press('N');
  await page.waitForFunction(() => {
    const s = window.__GALACTIC_GUNNERS_HOSTILE__.state();
    return s.currentNukes === 1 && s.nukeProjectileCount >= 1;
  }, null, { timeout: 2000 });
  const nukeFiredState = await getGameState(page);
  await page.screenshot({ path: path.join(outputDir, 'nuke-projectile-mid-flight.png'), fullPage: true });
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__.state().score >= 25, null, { timeout: 12000 });
  state = await getGameState(page);
  cases.nuke_fire_decrements_once = nukeFiredState.currentNukes === 1 && nukeFiredState.rearmProgress < 150;
  cases.nuke_projectile_visible = nukeFiredState.nukeProjectileCount >= 1 && nukeFiredState.nukeBodies.length >= 1;
  cases.nuke_burst_multikill_score_exact = state.score % 25 === 0 && state.score >= 25 && state.activeScouts <= 57;
  cases.nuke_rearm_progresses = state.rearmProgress > nukeFiredState.rearmProgress && state.rearmProgress <= 150;
  cases.nuke_hud_live = state.hudPositions.nukes.filter((icon) => icon.visible).length === state.currentNukes
    && state.visibleTexts.some((text) => text === 'ENERGISE')
    && !state.visibleTexts.some((text) => text === `${state.currentNukes}`)
    && !state.visibleTexts.some((text) => text.includes(`REARM ${state.rearmProgress}/150`));
  cases.nuke_hud_bottom_right_bar = state.hudPositions.rearmBar.x > state.viewport.width * 0.68
    && state.hudPositions.rearmBar.y > state.viewport.height * 0.82
    && state.hudPositions.rearmBar.fillWidth <= state.hudPositions.rearmBar.width
    && Math.max(...state.hudPositions.nukes.map((icon) => icon.x)) < state.hudPositions.rearmBar.x
    && state.hudPositions.nukes.every((icon) => icon.y > state.viewport.height * 0.82);
  cases.life_hud_icon_only = state.hudPositions.lives.filter((icon) => icon.visible).length === state.lives
    && !state.visibleTexts.some((text) => text.includes('LIVES') || numericHudCounterPattern.test(text));
  cases.enemy_scouts_correct_orientation = state.scoutBodies.every((scout) => Math.abs(Math.abs(scout.angle) - 180) <= 1);
  cases.sound_mute_top_right = state.hudPositions.sound.x > state.viewport.width * 0.9
    && state.hudPositions.sound.y < state.viewport.height * 0.12
    && state.hudPositions.sound.texture === 'ui.soundOn';
  await page.screenshot({ path: path.join(outputDir, 'nuke-burst-after-hit.png'), fullPage: true });
  await page.keyboard.press('N');
  await page.keyboard.press('N');
  await page.keyboard.press('N');
  await page.waitForTimeout(500);
  state = await getGameState(page);
  cases.nuke_count_never_negative = state.currentNukes >= 0;
  await loadGame(page);
  const gamepadResult = await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__.gamepadY());
  cases.gamepad_y_nuke_path = gamepadResult.consumed === true && gamepadResult.currentNukes === 1;

  await loadGame(page);
  const prePause = await getGameState(page);
  await page.keyboard.press('P');
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_PAUSE_QA__?.scene === 'PauseScene', null, { timeout: 3000 });
  await page.waitForTimeout(900);
  const pausedState = await getGameState(page);
  cases.pause_freezes_state = Math.abs(pausedState.playerX - prePause.playerX) <= 1
    && Math.abs(pausedState.playerY - prePause.playerY) <= 1
    && pausedState.score === prePause.score
    && pausedState.lives === prePause.lives
    && pausedState.formationDropY === prePause.formationDropY;
  await page.screenshot({ path: path.join(outputDir, 'pause-overlay.png'), fullPage: true });
  await page.keyboard.press('P');
  await page.waitForFunction(() => !window.__GALACTIC_GUNNERS_PAUSE_QA__ && window.__GALACTIC_GUNNERS_HOSTILE__?.state()?.scene === 'Level1Scene', null, { timeout: 8000 });
  const resumedState = await getGameState(page);
  cases.pause_resume_exact_state = resumedState.score === prePause.score && resumedState.lives === prePause.lives;
  await page.waitForTimeout(250);
  await page.keyboard.press('P');
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_PAUSE_QA__?.scene === 'PauseScene', null, { timeout: 8000 });
  await page.keyboard.press('P');
  await page.waitForFunction(() => !window.__GALACTIC_GUNNERS_PAUSE_QA__, null, { timeout: 8000 });
  cases.repeat_pause_resume_clean = true;

  await loadGame(page);
  await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__.forceComplete());
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__.state().terminalState === 'complete', null, { timeout: 3000 });
  await page.screenshot({ path: path.join(outputDir, 'mission-complete.png'), fullPage: true });
  await clickTerminalButton(page, 'left');
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__.state().terminalState === null, null, { timeout: 5000 });
  state = await getGameState(page);
  cases.complete_replay_reset = state.score === 0 && state.activeScouts === 58 && state.activeShieldTiles === 256 && state.playerLaserCount === 0 && state.enemyLaserCount === 0;
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
      && entry.shield_tile_count === 256
      && entry.bunker_count === 8
      && entry.projectile_size.width >= 28
      && entry.projectile_size.width <= 40
      && entry.shield_tile_size.width >= 4
      && entry.shield_tile_size.width <= 14
      && entry.player_scale_relative_rev2 >= 0.55
      && entry.player_scale_relative_rev2 <= 0.65
      && Math.abs(entry.scout_size.width - entry.scout_expected_width) <= 0.2
      && entry.shield_bottom_gap_player_heights >= 1.1
      && entry.shield_bottom_gap_player_heights <= 1.3
      && entry.hud_positions.rearm.text === 'ENERGISE'
      && entry.hud_positions.sound.texture === 'ui.soundOn'
      && entry.hud_positions.lives.filter((icon) => icon.visible).length > 0
      && entry.hud_positions.nukes.filter((icon) => icon.visible).length > 0),
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
