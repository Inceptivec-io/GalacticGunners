import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.GG_RUNTIME_URL ?? 'http://localhost:3002';
const testedSha = process.env.GG_TESTED_SHA ?? 'UNSPECIFIED';
const outputDir = path.resolve(process.env.GG_EVIDENCE_DIR
  ?? 'docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_015/rectification/boarding');
mkdirSync(outputDir, { recursive: true });

function assert(value, message) {
  if (!value) throw new Error(message);
}

async function start(page) {
  await page.goto(`${baseUrl}/play?qa=hostile`, { waitUntil: 'networkidle', timeout: 20_000 });
  await page.waitForSelector('canvas');
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_MENU_QA__?.scene === 'MainMenuScene');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__?.state()?.scene === 'Level1Scene');
}

async function state(page) {
  return page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__?.state());
}

async function clickAction(page, action) {
  const snapshot = await state(page);
  const target = snapshot.terminalActions.find((entry) => entry.action === action);
  assert(target, `Missing ${action} action.`);
  const canvas = await page.locator('canvas').boundingBox();
  assert(canvas, 'Canvas not available.');
  await page.mouse.click(canvas.x + target.x, canvas.y + target.y);
}

async function reachLevelFour(page) {
  for (let sequence = 1; sequence < 4; sequence += 1) {
    await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__?.forceComplete());
    await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__?.state()?.terminalState === 'complete');
    await clickAction(page, 'continue');
    await page.waitForFunction((next) => {
      const value = window.__GALACTIC_GUNNERS_HOSTILE__?.state();
      return value?.terminalState === null && value?.campaign?.sequence === next;
    }, sequence + 1);
  }
}

const browser = await chromium.launch({ headless: true, args: ['--disable-gpu', '--disable-dev-shm-usage'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, hasTouch: true, isMobile: true });
const consoleErrors = [];
const networkFailures = [];
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('response', (response) => {
  if (response.status() >= 400) networkFailures.push(`${response.status()} ${response.url()}`);
});
page.on('requestfailed', (request) => networkFailures.push(`FAILED ${request.url()}`));

try {
  await start(page);
  await reachLevelFour(page);
  const levelFour = await state(page);
  assert(levelFour.campaign.sequence === 4, 'Did not reach the distinct Level 4 campaign definition.');
  assert(levelFour.activeScouts > 0, 'Level 4 has no active Boarding anchor candidate.');
  await page.waitForFunction(() => Boolean(window.__GALACTIC_GUNNERS_HOSTILE__?.state()?.gameRunId), undefined, { timeout: 15_000 });

  const launch = await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__?.triggerBoarding());
  assert(launch?.launched && launch.offerPresented, `Boarding did not launch: ${JSON.stringify(launch)}`);
  await page.waitForFunction(() => Boolean(window.__GALACTIC_GUNNERS_BOARDING_QA__), undefined, { timeout: 15_000 });
  await page.waitForTimeout(750);
  const active = await page.evaluate(() => window.__GALACTIC_GUNNERS_BOARDING_QA__?.state());
  assert(active.active, `Boarding did not become active: ${JSON.stringify(active)}`);
  assert(active.serverRunId, 'Boarding did not receive a server-authoritative run.');
  assert(!active.serverError, `Boarding server error: ${active.serverError}`);
  assert(active.touchControls.length === 5, `Expected five touch controls, received ${JSON.stringify(active.touchControls)}`);
  await page.screenshot({ path: path.join(outputDir, '01-boarding-active.png'), fullPage: true });

  const canvas = await page.locator('canvas').boundingBox();
  assert(canvas, 'Canvas not available for touch control verification.');
  const fire = active.touchControls.find((control) => control.id === 'boarding-touch-fire');
  assert(fire, 'Boarding Fire touch control is absent.');
  await page.touchscreen.tap(
    canvas.x + fire.x * canvas.width / active.viewport.width,
    canvas.y + fire.y * canvas.height / active.viewport.height,
  );
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_BOARDING_QA__?.state()?.lastTouchInput === 'fire');
  await page.waitForTimeout(500);
  const afterTouchFire = await page.evaluate(() => window.__GALACTIC_GUNNERS_BOARDING_QA__?.state());
  assert(afterTouchFire.playerShotsFired > 0, `Touch Fire did not activate a projectile: ${JSON.stringify(afterTouchFire)}`);
  await page.screenshot({ path: path.join(outputDir, '01a-boarding-touch-fire.png'), fullPage: true });

  await page.keyboard.press('p');
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_PAUSE_QA__?.scene === 'PauseScene');
  await page.screenshot({ path: path.join(outputDir, '02-boarding-pause.png'), fullPage: true });
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_BOARDING_QA__?.state()?.active === true);

  await page.keyboard.press('Escape');
  await page.waitForFunction(() => {
    const value = window.__GALACTIC_GUNNERS_HOSTILE__?.state();
    return value?.scene === 'Level1Scene' && value?.campaign?.sequence === 4;
  }, undefined, { timeout: 15_000 });
  const returned = await state(page);
  assert(returned.terminalState === null, 'Boarding abort did not return to active Shooter gameplay.');
  await page.screenshot({ path: path.join(outputDir, '03-boarding-abort-return.png'), fullPage: true });

  assert(consoleErrors.length === 0 && networkFailures.length === 0,
    `Console errors: ${consoleErrors.join(' | ')}; network failures: ${networkFailures.join(' | ')}`);
  const result = {
    tested_sha: testedSha,
    base_url: baseUrl,
    generated_at: new Date().toISOString(),
    level_4_reached: true,
    boarding_offer_to_active: true,
    server_authoritative_run: true,
    touch_controls_visible_and_fire: true,
    boarding_pause_resume: true,
    abort_returns_to_level_4_shooter: true,
    console_errors: consoleErrors,
    network_failures: networkFailures,
    result: 'PASS',
  };
  writeFileSync(path.join(outputDir, 'boarding-browser-verification.json'), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
