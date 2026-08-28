import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const baseUrl = process.env.GG_RUNTIME_URL ?? 'http://localhost:3002';
const access = Object.fromEntries(readFileSync('FOUNDER_REVIEW_ACCESS.local.txt', 'utf8').split(/\r?\n/).flatMap((line) => {
  const match = line.match(/^(Inceptivec administrator): ([^/]+) \/ (.+)$/);
  return match ? [[match[1], { username: match[2].trim(), password: match[3].trim() }]] : [];
}));
const admin = access['Inceptivec administrator'];
if (!admin) throw new Error('Founder review administrator credential is unavailable.');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto(`${baseUrl}/inceptivec-gamification-admin/login`, { waitUntil: 'networkidle' });
  await page.locator('input[name="username"]').fill(admin.username);
  await page.locator('input[name="password"]').fill(admin.password);
  await page.locator('button[type="submit"]').click();
  await page.waitForSelector('[data-designer-route="campaign"]');
  const initial = await page.evaluate(async () => (await fetch('/api/v1/admin/levels/authority/', { credentials: 'same-origin' })).json());
  const level = initial.results[0];
  const original = level.active_version;
  const saveChangedDraft = async () => {
    // Use an individually selectable, non-overlapping scout and a visual
    // runtime property that does not perturb the accepted formation topology.
    await page.locator('[aria-label="SCOUT at 50, 170"]').click();
    const rotation = page.locator('.designer-inspector label').filter({ hasText: /^Rotation/ }).locator('input');
    const currentRotation = Number(await rotation.inputValue());
    await rotation.fill(String((currentRotation + 10) % 360));
    const draftResponse = page.waitForResponse((response) =>
      response.request().method() === 'POST' && /\/api\/v1\/admin\/levels\/[^/]+\/drafts\/$/.test(new URL(response.url()).pathname),
    );
    await page.getByRole('button', { name: 'Save immutable draft' }).click();
    const response = await draftResponse;
    const conflict = response.status() === 409;
    assert(conflict || response.status() === 201, `Unexpected immutable draft status: ${response.status()}.`);
    if (conflict) {
      const authority = await page.evaluate(async () => (await fetch('/api/v1/admin/levels/authority/', { credentials: 'same-origin' })).json());
      const current = authority.results.find((item) => item.id === level.id);
      console.error(JSON.stringify({ designer_conflict: { latest: current?.versions?.[0], editable: current?.editable_version, active: current?.active_version } }));
    }
    return conflict;
  };
  const conflicted = await saveChangedDraft();
  if (conflicted) {
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('[data-designer-route="campaign"]');
    assert(!(await saveChangedDraft()), 'Designer did not recover from a version conflict after reload.');
  }
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('[data-designer-route="campaign"]');
  const afterSave = await page.evaluate(async () => (await fetch('/api/v1/admin/levels/authority/', { credentials: 'same-origin' })).json());
  const saved = afterSave.results.find((item) => item.id === level.id).versions[0];
  console.log(JSON.stringify({ designer_save: {
    active: { version: original.version, checksum: original.checksum },
    latest: { version: saved?.version, checksum: saved?.checksum },
  } }));
  assert(saved && saved.checksum !== original.checksum, 'Designer save did not create a distinct immutable draft.');
  const popup = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Same-runtime preview' }).click();
  const preview = await popup;
  const previewErrors = [];
  preview.on('console', (message) => { if (message.type() === 'error') previewErrors.push(message.text()); });
  preview.on('pageerror', (error) => previewErrors.push(error.message));
  await preview.bringToFront();
  await preview.waitForSelector('canvas');
  await preview.waitForFunction(() => window.__GALACTIC_GUNNERS_SLICE_QA__?.campaign?.preview === true, { timeout: 15000 }).catch(async () => {
    const status = await preview.locator('.game-status').textContent().catch(() => null);
    const qa = await preview.evaluate(() => ({ menu: window.__GALACTIC_GUNNERS_MENU_QA__, slice: window.__GALACTIC_GUNNERS_SLICE_QA__ }));
    throw new Error(`Preview runtime did not publish its unranked QA state: ${JSON.stringify({ status, qa, previewErrors })}`);
  });
  const previewState = await preview.evaluate(() => window.__GALACTIC_GUNNERS_SLICE_QA__);
  assert(previewState.campaign.checksum === saved.checksum && previewState.gameRunId === null, 'Preview was not exact-checksum and unranked.');
  assert(previewErrors.length === 0, `Preview console errors: ${previewErrors.join('; ')}`);
  await preview.close();
  await page.getByRole('button', { name: 'Validate', exact: true }).click();
  await page.getByText(/validate completed through the authenticated version workflow/).waitFor();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Publish', exact: true }).click();
  await page.getByText(/publish completed through the authenticated version workflow/).waitFor();
  await page.bringToFront();
  await page.goto(`${baseUrl}/play?qa=hostile`, { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas');
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_MENU_QA__?.scene === 'MainMenuScene', { timeout: 15000 });
  const canvas = await page.locator('canvas').boundingBox();
  assert(canvas, 'Campaign canvas was not available for the real Play control.');
  await page.mouse.click(canvas.x + (canvas.width / 2), canvas.y + (canvas.height * 0.63));
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_SLICE_QA__?.campaign?.checksum, { timeout: 15000 });
  const playState = await page.evaluate(() => window.__GALACTIC_GUNNERS_SLICE_QA__);
  assert(playState.campaign.checksum === saved.checksum, 'A new campaign did not receive the published authored checksum.');
  await page.goto(`${baseUrl}/inceptivec-gamification-admin`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-designer-route="campaign"]');
  page.once('dialog', (dialog) => dialog.accept());
  const historicalVersion = page.locator('.designer-version-history > div').filter({ hasText: new RegExp(`^v${original.version} SUPERSEDED`) });
  await historicalVersion.getByRole('button', { name: 'Restore as new version' }).click();
  await page.getByText(/rollback completed through the authenticated version workflow/).waitFor();
  const afterRollback = await page.evaluate(async () => (await fetch('/api/v1/admin/levels/authority/', { credentials: 'same-origin' })).json());
  const restored = afterRollback.results.find((item) => item.id === level.id).versions[0];
  assert(restored.checksum === original.checksum, 'Rollback did not restore the original immutable configuration.');
  assert(consoleErrors.length === 0, `Console errors: ${consoleErrors.join('; ')}`);
  console.log(JSON.stringify({ result: 'PASS', draft_checksum: saved.checksum, gameplay_checksum: playState.campaign.checksum, rollback_source_version: original.version }, null, 2));
} finally { await browser.close(); }
