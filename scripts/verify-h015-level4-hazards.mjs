import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.GG_RUNTIME_URL ?? 'http://localhost:3002';
const testedSha = process.env.GG_TESTED_SHA ?? 'UNSPECIFIED';
const outputDir = path.resolve(process.env.GG_EVIDENCE_DIR
  ?? 'docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_015/rectification/level4_hazards');
mkdirSync(outputDir, { recursive: true });

function assert(value, message) { if (!value) throw new Error(message); }

async function state(page) { return page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__?.state()); }

async function startFromMenu(page) {
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_MENU_QA__?.scene === 'MainMenuScene', null, { timeout: 30_000 });
  // Keep the input active through Phaser's next update. A press/release in one
  // browser tick can otherwise be missed on a loaded container runner.
  await page.keyboard.down('Enter');
  try {
    await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__?.state()?.scene === 'Level1Scene', null, { timeout: 30_000 });
  } catch (error) {
    const diagnostic = await page.evaluate(() => ({
      menuScene: window.__GALACTIC_GUNNERS_MENU_QA__?.scene ?? null,
      hostileScene: window.__GALACTIC_GUNNERS_HOSTILE__?.state?.()?.scene ?? null,
      canvasCount: document.querySelectorAll('canvas').length,
    }));
    throw new Error(`Level 4 runtime bootstrap failed: ${JSON.stringify(diagnostic)}. ${error.message}`);
  } finally {
    await page.keyboard.up('Enter');
  }
}

async function clickAction(page, action) {
  const snapshot = await state(page);
  const target = snapshot.terminalActions.find((entry) => entry.action === action);
  assert(target, `Missing terminal action ${action}.`);
  const canvas = await page.locator('canvas').boundingBox();
  assert(canvas, 'Canvas is unavailable.');
  await page.mouse.click(canvas.x + target.x, canvas.y + target.y);
}

const browser = await chromium.launch({ headless: true, args: ['--disable-gpu', '--disable-dev-shm-usage'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const consoleErrors = [];
const networkFailures = [];
page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('response', (response) => { if (response.status() >= 400) networkFailures.push(`${response.status()} ${response.url()}`); });
page.on('requestfailed', (request) => networkFailures.push(`FAILED ${request.url()}`));

try {
  await page.goto(`${baseUrl}/play?qa=hostile`, { waitUntil: 'networkidle', timeout: 20_000 });
  await startFromMenu(page);
  for (let sequence = 1; sequence < 4; sequence += 1) {
    await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__?.forceComplete());
    await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__?.state()?.terminalState === 'complete');
    await clickAction(page, 'continue');
    await page.waitForFunction((next) => window.__GALACTIC_GUNNERS_HOSTILE__?.state()?.campaign?.sequence === next, sequence + 1);
  }
  const before = await state(page);
  assert(before.campaign.sequence === 4, `Expected Level 4, received ${before.campaign.sequence}.`);
  assert(before.hazardBodies.length >= 2 && before.hazardBodies.every((hazard) => hazard.type === 'comet'),
    `Level 4 did not visibly instantiate its configured comet hazards: ${JSON.stringify(before.hazardBodies)}`);
  assert(before.hazardBodies.every((hazard) => hazard.body.width > 10 && hazard.body.height > 10),
    `Level 4 hazard collision bodies are not meaningful: ${JSON.stringify(before.hazardBodies)}`);
  assert(before.hazardBodies.every((hazard) => Math.abs(hazard.body.velocityX) > 0 || Math.abs(hazard.body.velocityY) > 0),
    `Level 4 hazard emitters produced stationary hazards: ${JSON.stringify(before.hazardBodies)}`);
  await page.waitForFunction(() => {
    const snapshot = window.__GALACTIC_GUNNERS_HOSTILE__?.state();
    return snapshot?.hazardBodies?.some((hazard) => hazard.x >= 0 && hazard.x <= window.innerWidth
      && hazard.y >= 0 && hazard.y <= window.innerHeight);
  }, null, { timeout: 5_000 });
  const liveBefore = await state(page);
  await page.screenshot({ path: path.join(outputDir, '01-level4-live-comets.png'), fullPage: true });

  const fired = await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__?.firePlayerLaserAtHazard(0));
  assert(fired?.fired, `Could not fire at Level 4 hazard: ${JSON.stringify(fired)}`);
  try {
    await page.waitForFunction((count) => (window.__GALACTIC_GUNNERS_HOSTILE__?.state()?.hazardBodies?.length ?? 0) === count, liveBefore.hazardBodies.length - 1, { timeout: 3_000 });
  } catch (error) {
    const diagnostic = await state(page);
    throw new Error(`Configured comet did not resolve after a helper-fired player laser. fired=${JSON.stringify(fired)} state=${JSON.stringify({
      score: diagnostic?.score,
      hazardBodies: diagnostic?.hazardBodies,
      playerLaserBodies: diagnostic?.playerLaserBodies,
    })} original=${error.message}`);
  }
  const after = await state(page);
  assert(after.score > liveBefore.score, `Hazard destruction did not apply a runtime score event: ${liveBefore.score} -> ${after.score}.`);
  assert(after.terminalState === null && after.campaign.sequence === 4, 'Hazard collision interrupted Level 4 gameplay.');
  await page.screenshot({ path: path.join(outputDir, '02-level4-comet-destroyed.png'), fullPage: true });

  assert(consoleErrors.length === 0 && networkFailures.length === 0,
    `Console errors: ${consoleErrors.join(' | ')}; network failures: ${networkFailures.join(' | ')}`);
  const result = {
    tested_sha: testedSha, base_url: baseUrl, generated_at: new Date().toISOString(),
    level_4_reached: true, configured_comets_visible: true, meaningful_hazard_bodies: true, hazard_motion: true,
    player_laser_hazard_collision: true, hazard_destroyed: true, score_applied: true,
    level_4_continues: true, console_errors: consoleErrors, network_failures: networkFailures, result: 'PASS',
  };
  writeFileSync(path.join(outputDir, 'level4-hazard-browser-verification.json'), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
