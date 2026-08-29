import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.GG_RUNTIME_URL ?? 'http://localhost:3002';
const testedSha = process.env.GG_TESTED_SHA ?? 'UNSPECIFIED';
const outputDir = path.resolve(process.env.GG_EVIDENCE_DIR
  ?? 'docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_015/rectification/boarding_success');
mkdirSync(outputDir, { recursive: true });
function assert(value, message) { if (!value) throw new Error(message); }
function fileHash(file) { return createHash('sha256').update(readFileSync(file)).digest('hex'); }
async function state(page) { return page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__?.state()); }

async function waitForRenderedFrames(page, frames = 3) {
  await page.evaluate(async (frameCount) => {
    for (let frame = 0; frame < frameCount; frame += 1) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
  }, frames);
}
async function clickAction(page, action) {
  const snapshot = await state(page);
  const actionState = snapshot.terminalActions.find((entry) => entry.action === action);
  assert(actionState, `Missing ${action} action.`);
  const canvas = await page.locator('canvas').boundingBox();
  assert(canvas, 'Canvas unavailable.');
  await page.mouse.click(canvas.x + actionState.x, canvas.y + actionState.y);
}
async function startLevelFour(page) {
  await page.goto(`${baseUrl}/play?qa=hostile`, { waitUntil: 'networkidle', timeout: 20_000 });
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_MENU_QA__?.scene === 'MainMenuScene');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__?.state()?.scene === 'Level1Scene');
  for (let sequence = 1; sequence < 4; sequence += 1) {
    await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__?.forceComplete());
    await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__?.state()?.terminalState === 'complete');
    await clickAction(page, 'continue');
    await page.waitForFunction((next) => window.__GALACTIC_GUNNERS_HOSTILE__?.state()?.campaign?.sequence === next, sequence + 1);
  }
  await page.waitForFunction(() => Boolean(window.__GALACTIC_GUNNERS_HOSTILE__?.state()?.gameRunId));
  const launch = await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__?.triggerBoarding());
  assert(launch?.launched, `Boarding launch failed: ${JSON.stringify(launch)}`);
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_BOARDING_QA__?.state()?.active === true, undefined, { timeout: 15_000 });
}

const browser = await chromium.launch({
  headless: true,
  args: [
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
  ],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, hasTouch: true, isMobile: true });
await page.bringToFront();
const cdp = await page.context().newCDPSession(page);
await cdp.send('Emulation.setFocusEmulationEnabled', { enabled: true });
await cdp.send('Emulation.setIdleOverride', { isUserActive: true, isScreenUnlocked: true });
const consoleErrors = [];
const networkFailures = [];
page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', (error) => consoleErrors.push(`PAGEERROR ${error.stack || error.message}`));
page.on('response', (response) => { if (response.status() >= 400) networkFailures.push(`${response.status()} ${response.url()}`); });
page.on('requestfailed', (request) => networkFailures.push(`FAILED ${request.url()}`));
try {
  await startLevelFour(page);
  const canvas = await page.locator('canvas').boundingBox();
  assert(canvas, 'Canvas unavailable for physical Boarding input.');
  await page.keyboard.down('d');
  await page.keyboard.down('Space');
  let reachedExit = false;
  const deadline = Date.now() + 120_000;
  let sample = 0;
  while (Date.now() < deadline) {
    // Keep the browser in an active-input state while the real held movement
    // and fire controls drive the Phaser scene. This does not mutate game state.
    await page.mouse.move(canvas.x + canvas.width / 2 + (sample % 2), canvas.y + canvas.height / 2);
    await page.waitForTimeout(100);
    sample += 1;
    if (sample % 18 === 0) await page.keyboard.press('w');
    const progress = await page.evaluate(() => window.__GALACTIC_GUNNERS_BOARDING_QA__?.state() ?? null);
    if (progress?.active && progress.activeAliens === 0 && progress.exitUnlocked && progress.player.x >= 3968) {
      reachedExit = true;
      break;
    }
    if (sample % 50 === 0) console.log(JSON.stringify({ phase: 'boarding_success_progress', sample, player: progress?.player, playerPhysics: progress?.playerPhysics, simulationPlayerX: progress?.simulationPlayerX, elapsedMs: progress?.elapsedMs, activeAliens: progress?.activeAliens, exitUnlocked: progress?.exitUnlocked, consoleErrors }));
  }
  assert(reachedExit, 'Boarding player did not reach the physical exit while holding right movement.');
  await page.keyboard.up('Space');
  await page.keyboard.up('d');
  const boarding = await page.evaluate(() => window.__GALACTIC_GUNNERS_BOARDING_QA__?.state() ?? null);
  assert(boarding?.active, `Boarding ended before completion route: ${JSON.stringify(boarding)}`);
  assert(boarding.activeAliens === 0, `Live Boarding combat did not clear every alien: ${JSON.stringify(boarding)}`);
  assert(boarding.exitUnlocked && boarding.player.x >= 3968, `Exit was not physically reachable: ${JSON.stringify(boarding)}`);
  const exitCapture = path.join(outputDir, '01-boarding-exit-unlocked.png');
  await waitForRenderedFrames(page);
  await page.screenshot({ path: exitCapture, fullPage: true });
  await page.keyboard.down('e');
  await page.waitForTimeout(250);
  await page.keyboard.up('e');
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__?.state()?.scene === 'Level1Scene', undefined, { timeout: 15_000 });
  const returned = await state(page);
  assert(returned.campaign.sequence === 4 && returned.terminalState === null, 'Successful Boarding did not return to active Level 4 Shooter.');
  const returnCapture = path.join(outputDir, '02-boarding-success-return.png');
  // The scene state changes before the WebGL canvas necessarily presents the
  // next frame on a loaded CI runner. Capture only after the confirmed Shooter
  // state has had multiple animation frames to render.
  await waitForRenderedFrames(page);
  await page.screenshot({ path: returnCapture, fullPage: true });
  assert(fileHash(exitCapture) !== fileHash(returnCapture), 'Boarding exit-unlocked and Shooter-return captures are visually identical.');
  assert(consoleErrors.length === 0 && networkFailures.length === 0, `Console errors: ${consoleErrors.join(' | ')}; network failures: ${networkFailures.join(' | ')}`);
  const result = { tested_sha: testedSha, generated_at: new Date().toISOString(), result: 'PASS', combat_cleared: true, physical_exit: true, server_return: true, exit_unlocked_before_traversal: true, exit_unlocked_capture_sha256: fileHash(exitCapture), shooter_return_capture_sha256: fileHash(returnCapture), consoleErrors, networkFailures };
  writeFileSync(path.join(outputDir, 'boarding-success-browser-verification.json'), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
} finally { await browser.close(); }
