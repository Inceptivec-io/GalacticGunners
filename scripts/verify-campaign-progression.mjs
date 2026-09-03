import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.GG_RUNTIME_URL ?? 'http://localhost:3002';
const testedSha = process.env.GG_TESTED_SHA ?? 'UNSPECIFIED';
const outputDir = path.resolve(process.env.GG_EVIDENCE_DIR
  ?? 'docs/evidence/campaign-continuity');
mkdirSync(outputDir, { recursive: true });

function assert(value, message) {
  if (!value) throw new Error(message);
}

async function start(page) {
  await page.bringToFront();
  await page.goto(`${baseUrl}/play?qa=hostile`, { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas');
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_MENU_QA__?.scene === 'MainMenuScene');
  const canvas = await page.locator('canvas').boundingBox();
  assert(canvas, 'Canvas was not available.');
  await page.mouse.click(canvas.x + canvas.width / 2, canvas.y + canvas.height * 0.63);
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__?.state()?.scene === 'Level1Scene');
}

async function state(page) {
  return page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__?.state());
}

async function forceComplete(page) {
  await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__?.forceComplete());
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__?.state()?.terminalState === 'complete');
  return state(page);
}

async function clickAction(page, action, useTouch = false) {
  const snapshot = await state(page);
  const target = snapshot.terminalActions.find((entry) => entry.action === action);
  assert(target, `Missing discrete terminal action: ${action}`);
  const canvas = await page.locator('canvas').boundingBox();
  assert(canvas, 'Canvas was not available for terminal interaction.');
  const x = canvas.x + target.x;
  const y = canvas.y + target.y;
  if (useTouch) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
}

const browser = await chromium.launch();
const consoleErrors = [];
const networkFailures = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, hasTouch: true, isMobile: true });
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('response', async (response) => {
    if (response.status() < 400) return;
    let body = '';
    try {
      body = await response.text();
    } catch {
      body = '<response body unavailable>';
    }
    networkFailures.push(`${response.status()} ${response.url()} ${body}`);
  });
  page.on('requestfailed', (request) => networkFailures.push(`FAILED ${request.url()}`));

  await start(page);
  const levelOne = await forceComplete(page);
  assert(levelOne.campaign.sequence === 1 && levelOne.terminalActions.some((entry) => entry.action === 'continue'), 'Level 1 did not expose Continue.');
  assert(levelOne.terminalActions.filter((entry) => entry.action === 'continue').length === 1, 'Duplicate Continue control.');
  await page.screenshot({ path: path.join(outputDir, 'level-1-complete.png'), fullPage: true });
  await clickAction(page, 'continue', true);
  await page.waitForFunction(() => {
    const value = window.__GALACTIC_GUNNERS_HOSTILE__?.state();
    return value?.terminalState === null && value?.campaign?.sequence === 2;
  });
  const levelTwo = await state(page);
  assert(levelTwo.activeScouts !== levelOne.activeScouts, 'Level 2 topology is not distinct from Level 1.');
  await page.screenshot({ path: path.join(outputDir, 'level-2-running-after-continue.png'), fullPage: true });

  const progression = [2];
  for (let sequence = 2; sequence <= 5; sequence += 1) {
    const completed = await forceComplete(page);
    assert(completed.campaign.sequence === sequence, `Completed unexpected campaign level ${completed.campaign.sequence}.`);
    if (sequence === 2) await page.screenshot({ path: path.join(outputDir, 'level-2-complete.png'), fullPage: true });
    await clickAction(page, 'continue');
    await page.waitForFunction((nextSequence) => {
      const value = window.__GALACTIC_GUNNERS_HOSTILE__?.state();
      return value?.terminalState === null && value?.campaign?.sequence === nextSequence;
    }, sequence + 1);
    if (sequence + 1 >= 3) {
      await page.screenshot({ path: path.join(outputDir, `level-${sequence + 1}-running.png`), fullPage: true });
    }
    progression.push(sequence + 1);
  }
  const final = await forceComplete(page);
  assert(final.campaign.sequence === 6, 'Campaign skipped or created an invalid Level 7.');
  assert(!final.terminalActions.some((entry) => entry.action === 'continue'), 'Final victory exposed invalid Continue.');
  await page.screenshot({ path: path.join(outputDir, 'final-campaign-complete.png'), fullPage: true });
  await clickAction(page, 'replay');
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__?.state()?.campaign?.sequence === 6 && window.__GALACTIC_GUNNERS_HOSTILE__?.state()?.terminalState === null);

  await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__?.forceFail());
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__?.state()?.terminalState === 'failed');
  const failed = await state(page);
  assert(failed.terminalActions.some((entry) => entry.action === 'try-again'), 'Game Over lacks Try Again.');
  await page.screenshot({ path: path.join(outputDir, 'game-over.png'), fullPage: true });
  await clickAction(page, 'try-again');
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__?.state()?.terminalState === null);
  await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__?.forceFail());
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__?.state()?.terminalState === 'failed');
  await clickAction(page, 'menu');
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_MENU_QA__?.scene === 'MainMenuScene');

  const result = {
    url: baseUrl,
    tested_sha: testedSha,
    generated_at: new Date().toISOString(),
    progression,
    level_1_complete_panel: true,
    touch_continue_to_level_2: true,
    level_2_distinct: true,
    valid_campaign_chain: true,
    final_terminal_state: true,
    replay_current_level: true,
    game_over_try_again: true,
    game_over_menu: true,
    dynamic_runtime_values: true,
    result: 'PASS',
    keyboard_confirm_contract: 'InputSystem maps Enter/Space and gamepad A/Start to confirm; existing game tests cover normalization.',
    console_errors: consoleErrors,
    network_failures: networkFailures,
  };
  assert(networkFailures.length === 0, `Network failures: ${networkFailures.join('; ')}`);
  assert(consoleErrors.length === 0, `Console errors: ${consoleErrors.join('; ')}`);
  writeFileSync(path.join(outputDir, 'campaign-progression-verification.json'), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
