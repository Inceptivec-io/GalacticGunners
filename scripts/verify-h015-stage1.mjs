import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.GG_RUNTIME_URL ?? 'http://localhost:3002';
const outputDir = path.resolve(process.env.GG_EVIDENCE_DIR ?? 'docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_015/rectification/stage-1');
mkdirSync(outputDir, { recursive: true });

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const browser = await chromium.launch({ headless: true, args: ['--disable-gpu', '--disable-dev-shm-usage'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});

try {
  await page.goto(`${baseUrl}/play?qa=hostile`, { waitUntil: 'domcontentloaded', timeout: 15_000 });
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_MENU_QA__?.scene === 'MainMenuScene', { timeout: 10_000 });
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => Boolean(window.__GALACTIC_GUNNERS_HOSTILE__), { timeout: 5_000 });
  const initial = await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__.state());
  assert(initial.scene === 'Level1Scene', `Expected Level1Scene, received ${initial.scene}`);
  await page.screenshot({ path: path.join(outputDir, '01-shooter-active.png') });

  await page.keyboard.press('p');
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_PAUSE_QA__?.scene === 'PauseScene', { timeout: 5_000 });
  const pauseState = await page.evaluate(() => window.__GALACTIC_GUNNERS_PAUSE_QA__);
  assert(Array.isArray(pauseState.visibleTexts) && pauseState.visibleTexts.includes('RESUME') && pauseState.visibleTexts.includes('RESTART') && pauseState.visibleTexts.includes('MAIN MENU'), 'Pause controls are incomplete.');
  await page.screenshot({ path: path.join(outputDir, '02-pause-visible.png') });

  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !window.__GALACTIC_GUNNERS_PAUSE_QA__ && window.__GALACTIC_GUNNERS_SLICE_QA__?.scene === 'Level1Scene', { timeout: 5_000 });
  await page.screenshot({ path: path.join(outputDir, '03-pause-resumed.png') });

  assert(errors.length === 0, `Console errors: ${errors.join(' | ')}`);
  console.log(JSON.stringify({ stage: 'H015_STAGE_1_PAUSE', result: 'PASS', initial, pauseState, consoleErrors: errors }, null, 2));
} finally {
  await browser.close();
}
