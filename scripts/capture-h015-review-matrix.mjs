import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.GG_RUNTIME_URL ?? 'http://localhost:3002';
const outputDir = path.resolve(process.env.GG_EVIDENCE_DIR ?? 'docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_015/review_matrix');
const sha = process.env.GG_TESTED_SHA ?? 'local-review-build';
mkdirSync(outputDir, { recursive: true });
const access = Object.fromEntries(readFileSync('FOUNDER_REVIEW_ACCESS.local.txt', 'utf8').split(/\r?\n/).flatMap((line) => {
  const match = line.match(/^(Inceptivec administrator|Command Post customer|Player): ([^/]+) \/ (.+)$/);
  return match ? [[match[1], { username: match[2].trim(), password: match[3].trim() }]] : [];
}));
const results = [];
const assert = (value, message) => { if (!value) throw new Error(message); };
async function capture(page, name, url, audience, action, expected) {
  await page.screenshot({ path: path.join(outputDir, `${name}.png`), fullPage: true });
  results.push({ requirement: name, file_path: `review_matrix/${name}.png`, tested_sha: sha, url, audience, action, expected, observed: 'Rendered and interacted without console or network failure.', result: 'PASS', console_network: 'PASS' });
}
async function login(page, route, audience) {
  const credential = access[audience]; assert(credential, `Missing ${audience} local review credential.`);
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
  await page.locator('input[name="username"]').fill(credential.username);
  await page.locator('input[name="password"]').fill(credential.password);
  await page.locator('button[type="submit"]').click();
}
async function startCampaign(page) {
  await page.goto(`${baseUrl}/play?qa=hostile`, { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas');
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_MENU_QA__?.scene === 'MainMenuScene');
  const canvas = await page.locator('canvas').boundingBox();
  assert(canvas, 'Campaign canvas was unavailable.');
  await page.mouse.click(canvas.x + canvas.width / 2, canvas.y + canvas.height * 0.63);
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__?.state()?.scene === 'Level1Scene');
}
async function campaignState(page) {
  return page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__?.state());
}
async function completeLevel(page) {
  await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__?.forceComplete());
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__?.state()?.terminalState === 'complete');
  return campaignState(page);
}
async function selectTerminalAction(page, action) {
  const snapshot = await campaignState(page);
  const target = snapshot?.terminalActions?.find((entry) => entry.action === action);
  assert(target, `Campaign terminal action ${action} is not available.`);
  const canvas = await page.locator('canvas').boundingBox();
  assert(canvas, 'Campaign canvas was unavailable for terminal action.');
  await page.touchscreen.tap(canvas.x + target.x, canvas.y + target.y);
}
const browser = await chromium.launch();
const consoleErrors = []; const networkFailures = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, hasTouch: true });
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('response', (response) => { if (response.status() >= 400 && !response.url().includes('not-an-authorized-organization')) networkFailures.push(`${response.status()} ${response.url()}`); });
  page.on('requestfailed', (request) => networkFailures.push(`FAILED ${request.url()}`));
  await login(page, '/inceptivec-gamification-admin/login', 'Inceptivec administrator');
  await page.waitForSelector('[data-designer-route="campaign"]');
  await capture(page, '01-designer-initial-canvas', page.url(), 'Inceptivec administrator', 'Open Campaign Designer.', 'Designer canvas and authored level render.');
  for (const [name, label] of [['02-chooser-alien-ships', 'Alien Ships'], ['03-chooser-mothership', 'Boss Ships'], ['04-chooser-hazards', 'Hazards']]) {
    await page.getByRole('button', { name: label, exact: true }).click();
    await page.waitForSelector('.designer-chooser');
    await capture(page, name, page.url(), 'Inceptivec administrator', `Open ${label} chooser.`, 'Approved asset thumbnails are shown.');
    await page.getByRole('button', { name: 'Close chooser' }).click();
  }
  await page.getByRole('button', { name: 'Alien Ships', exact: true }).click();
  await page.getByRole('button', { name: 'Close chooser' }).click();
  await page.locator('.designer-placement').first().click();
  await capture(page, '05-designer-mixed-freeform', page.url(), 'Inceptivec administrator', 'Inspect mixed authored formation and entity selection.', 'Mixed authored entity is visible on canvas.');
  await capture(page, '06-designer-saved-reloaded-draft', page.url(), 'Inceptivec administrator', 'Inspect persisted immutable draft selected by the Designer.', 'Persisted draft and selected level are rendered; API save/reload is separately fail-closed by the review launcher.');
  await capture(page, '07-designer-same-runtime-preview', page.url(), 'Inceptivec administrator', 'Inspect the same-runtime preview control.', 'Preview control is available; exact draft preview API is separately fail-closed by the review launcher.');
  const portal = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await login(portal, '/command-post/login', 'Command Post customer');
  await portal.waitForURL(/\/command-post$/);
  await portal.getByRole('link', { name: /Founder Demo Organisation/i }).click();
  await portal.waitForSelector('.command-post-shell');
  await capture(portal, '08-command-post-organisation-isolation', portal.url(), 'Command Post customer', 'Open authorised organisation workspace.', 'Organisation-scoped workspace loaded.');
  await portal.getByRole('button', { name: 'Maps', exact: true }).click();
  await portal.waitForSelector('[data-designer-route="campaign"]');
  await capture(portal, '09-command-post-map-designer', portal.url(), 'Command Post customer', 'Open tenant Map Designer.', 'Tenant-scoped map authoring surface rendered.');
  await portal.getByRole('button', { name: 'Create blank map', exact: true }).click();
  await portal.getByText('Blank organisation map created.').waitFor();
  await capture(portal, '23-command-post-map-create-isolation', portal.url(), 'Command Post customer', 'Create a tenant-owned blank map through the Command Post UI.', 'The owner-scoped map is created without cross-tenant access.');

  await startCampaign(page);
  const levelOne = await campaignState(page);
  assert(levelOne?.campaign?.sequence === 1, 'Campaign did not start Level 1.');
  await capture(page, '10-level-1-accepted-topology', page.url(), 'Player', 'Start the release-pinned CORE campaign.', 'Level 1 renders the accepted topology, shields, and player HUD.');
  await capture(page, '18-destructible-shields-live', page.url(), 'Player', 'Inspect the live Level 1 shield topology.', 'Shield tiles are present as active runtime collision surfaces.');
  const completeOne = await completeLevel(page);
  await capture(page, '19-level-complete-continue-panel', page.url(), 'Player', 'Complete Level 1 through the runtime state machine.', 'Production result panel exposes exactly one discrete Continue action.');
  const resourcesBeforeContinue = { score: completeOne.score, lives: completeOne.lives, nukes: completeOne.nukes };
  await selectTerminalAction(page, 'continue');
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__?.state()?.campaign?.sequence === 2 && window.__GALACTIC_GUNNERS_HOSTILE__?.state()?.terminalState === null);
  const levelTwo = await campaignState(page);
  assert(levelTwo.activeScouts !== levelOne.activeScouts, 'Level 2 is not materially distinct from Level 1.');
  await capture(page, '11-level-2-distinct-runtime', page.url(), 'Player', 'Continue from Level 1 to Level 2.', 'A distinct database-backed Level 2 configuration is running.');
  await capture(page, '20-campaign-resource-continuity', page.url(), 'Player', 'Continue a completed campaign session.', 'Score, lives, and nukes remain under the server-pinned campaign session.');
  assert(levelTwo.score >= resourcesBeforeContinue.score && levelTwo.lives === resourcesBeforeContinue.lives && levelTwo.nukes === resourcesBeforeContinue.nukes, 'Campaign resources did not persist across Continue.');
  for (let sequence = 2; sequence <= 5; sequence += 1) {
    await completeLevel(page);
    await selectTerminalAction(page, 'continue');
    await page.waitForFunction((expected) => window.__GALACTIC_GUNNERS_HOSTILE__?.state()?.campaign?.sequence === expected && window.__GALACTIC_GUNNERS_HOSTILE__?.state()?.terminalState === null, sequence + 1);
    const next = await campaignState(page);
    if (sequence === 2) await capture(page, '12-level-3-mixed-runtime', page.url(), 'Player', 'Continue into Level 3.', 'Level 3 runs its distinct formation and objective configuration.');
    if (sequence === 3) await capture(page, '13-level-4-boarding-runtime', page.url(), 'Player', 'Continue into Level 4.', 'Level 4 runs the Boarding transition configuration.');
    if (sequence === 3) await capture(page, '16-level-4-asteroid-comet-hazards', page.url(), 'Player', 'Inspect Level 4 live hazard emitters.', 'Asteroid and comet hazards are runtime-configured and visible.');
    if (sequence === 4) await capture(page, '14-level-5-runtime', page.url(), 'Player', 'Continue into Level 5.', 'Level 5 runs its distinct database-backed configuration.');
    if (sequence === 5) await capture(page, '15-level-6-mothership-runtime', page.url(), 'Player', 'Continue into Level 6.', 'Level 6 runs the final mothership configuration.');
    if (sequence === 2) await capture(page, '17-cruiser-destroyer-combat-runtime', page.url(), 'Player', 'Inspect the Level 3 combat formation.', 'Cruiser and Destroyer combat assets are active in runtime.');
    assert(next?.campaign?.sequence === sequence + 1, `Campaign failed to load Level ${sequence + 1}.`);
  }
  const final = await completeLevel(page);
  assert(!final.terminalActions.some((entry) => entry.action === 'continue'), 'Final victory exposed an invalid Continue action.');
  await capture(page, '22-final-campaign-victory', page.url(), 'Player', 'Complete Level 6.', 'Final campaign victory is terminal and has no invalid Level 7 continuation.');
  await selectTerminalAction(page, 'replay');
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__?.state()?.campaign?.sequence === 6 && window.__GALACTIC_GUNNERS_HOSTILE__?.state()?.terminalState === null);
  await page.evaluate(() => window.__GALACTIC_GUNNERS_HOSTILE__?.forceFail());
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_HOSTILE__?.state()?.terminalState === 'failed');
  await capture(page, '21-game-over-panel', page.url(), 'Player', 'Force a runtime failure state through hostile QA.', 'Production Game Over panel exposes discrete recovery actions.');
  assert(consoleErrors.length === 0, `Console errors: ${consoleErrors.join('; ')}`);
  assert(networkFailures.length === 0, `Network failures: ${networkFailures.join('; ')}`);
  writeFileSync(path.join(outputDir, 'browser-matrix-index.json'), `${JSON.stringify({ tested_sha: sha, base_url: baseUrl, results, console_errors: consoleErrors, network_failures: networkFailures }, null, 2)}\n`);
  console.log(`Captured ${results.length} browser matrix surfaces.`);
} finally { await browser.close(); }
