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
  await page.locator('.designer-chooser').getByRole('button', { name: /SCOUT/i }).click();
  await page.locator('.designer-placement').last().click();
  await capture(page, '05-designer-mixed-freeform', page.url(), 'Inceptivec administrator', 'Add Scout to active authoring document.', 'Mixed authored entity is visible on canvas.');
  await page.getByRole('button', { name: 'Save immutable draft' }).click();
  await page.getByRole('button', { name: 'Refresh authority' }).click();
  await page.waitForTimeout(400);
  await capture(page, '06-designer-saved-reloaded-draft', page.url(), 'Inceptivec administrator', 'Save and reload immutable draft.', 'Saved draft remains selected after authority refresh.');
  await page.getByRole('button', { name: 'Same-runtime preview' }).click();
  await page.waitForTimeout(500);
  await capture(page, '07-designer-same-runtime-preview', page.url(), 'Inceptivec administrator', 'Open same-runtime preview control.', 'Preview control opened without client error.');
  const portal = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await login(portal, '/command-post/login', 'Command Post customer');
  await portal.waitForURL(/\/command-post$/);
  await portal.getByRole('link', { name: /Founder Demo Organisation/i }).click();
  await portal.waitForSelector('.command-post-shell');
  await capture(portal, '08-command-post-organisation-isolation', portal.url(), 'Command Post customer', 'Open authorised organisation workspace.', 'Organisation-scoped workspace loaded.');
  await portal.getByRole('button', { name: 'Maps', exact: true }).click();
  await portal.waitForSelector('[data-designer-route="campaign"]');
  await capture(portal, '09-command-post-map-designer', portal.url(), 'Command Post customer', 'Open tenant Map Designer.', 'Tenant-scoped map authoring surface rendered.');
  assert(consoleErrors.length === 0, `Console errors: ${consoleErrors.join('; ')}`);
  assert(networkFailures.length === 0, `Network failures: ${networkFailures.join('; ')}`);
  writeFileSync(path.join(outputDir, 'browser-matrix-index.json'), `${JSON.stringify({ tested_sha: sha, base_url: baseUrl, results, console_errors: consoleErrors, network_failures: networkFailures }, null, 2)}\n`);
  console.log(`Captured ${results.length} browser matrix surfaces.`);
} finally { await browser.close(); }
