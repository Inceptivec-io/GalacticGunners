import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.GG_RUNTIME_URL ?? 'http://localhost:3002';
const outputDir = process.env.GG_EVIDENCE_DIR
  ? path.resolve(process.env.GG_EVIDENCE_DIR)
  : path.resolve('docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010/browser_runtime');

mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1365, height: 768 } });
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

await page.goto(`${baseUrl}/play`, { waitUntil: 'networkidle' });
await page.waitForSelector('canvas', { timeout: 15000 });
await page.screenshot({ path: path.join(outputDir, '01-main-menu.png'), fullPage: true });

const canvas = page.locator('canvas').first();
const bounds = await canvas.boundingBox();
if (!bounds) {
  throw new Error('Phaser canvas did not expose a bounding box.');
}

await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height * 0.58);
await page.waitForFunction(() => window.__GALACTIC_GUNNERS_SLICE_QA__?.scene === 'Level1Scene', null, { timeout: 15000 });
await page.screenshot({ path: path.join(outputDir, '02-level1-start.png'), fullPage: true });

for (let i = 0; i < 12; i += 1) {
  await page.keyboard.press('Space');
  await page.waitForTimeout(260);
}

await page.waitForFunction(() => {
  const state = window.__GALACTIC_GUNNERS_SLICE_QA__;
  return typeof state?.score === 'number' && state.score >= 25;
}, null, { timeout: 12000 });

await page.screenshot({ path: path.join(outputDir, '03-after-scout-collision.png'), fullPage: true });
const qaState = await page.evaluate(() => window.__GALACTIC_GUNNERS_SLICE_QA__);
const canvasCount = await page.locator('canvas').count();
const title = await page.title();

const result = {
  url: `${baseUrl}/play`,
  title,
  canvas_count: canvasCount,
  qa_state: qaState,
  console_errors_or_warnings: consoleEntries,
  network_failures_or_4xx_5xx: failedRequests,
  assertions: {
    canvas_present: canvasCount === 1,
    level1_started: qaState?.scene === 'Level1Scene',
    player_laser_scout_collision_scored: Number(qaState?.score ?? 0) >= 25,
    scout_count_decremented: Number(qaState?.activeScouts ?? 999) < 14,
    no_console_errors: consoleEntries.filter((entry) => entry.type === 'error').length === 0,
    no_network_failures: failedRequests.length === 0,
  },
};

writeFileSync(path.join(outputDir, 'runtime-verification.json'), `${JSON.stringify(result, null, 2)}\n`);
await browser.close();

const failed = Object.entries(result.assertions).filter(([, passed]) => !passed);
if (failed.length > 0) {
  throw new Error(`Runtime verification failed: ${failed.map(([name]) => name).join(', ')}`);
}

console.log(JSON.stringify(result, null, 2));
