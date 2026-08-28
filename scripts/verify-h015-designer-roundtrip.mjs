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
    await page.locator('.designer-placement').first().click();
    const x = page.locator('.designer-inspector label').filter({ hasText: /^X/ }).locator('input');
    const currentX = Number(await x.inputValue());
    await x.fill(String(currentX + 8));
    await page.getByRole('button', { name: 'Save immutable draft' }).click();
    await page.waitForTimeout(350);
    return page.getByText('Reload the latest level version before saving.').isVisible().catch(() => false);
  };
  const conflicted = await saveChangedDraft();
  if (conflicted) {
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('[data-designer-route="campaign"]');
    assert(!(await saveChangedDraft()), 'Designer did not recover from a version conflict after reload.');
  }
  await page.getByText(/Draft v\d+ saved with immutable checksum/).waitFor();
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('[data-designer-route="campaign"]');
  const afterSave = await page.evaluate(async () => (await fetch('/api/v1/admin/levels/authority/', { credentials: 'same-origin' })).json());
  const saved = afterSave.results.find((item) => item.id === level.id).editable_version;
  assert(saved && saved.checksum !== original.checksum, 'Designer save did not create a distinct immutable draft.');
  const popup = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Same-runtime preview' }).click();
  const preview = await popup;
  await preview.waitForFunction(() => window.__GALACTIC_GUNNERS_SLICE_QA__?.campaign?.preview === true);
  const previewState = await preview.evaluate(() => window.__GALACTIC_GUNNERS_SLICE_QA__);
  assert(previewState.campaign.checksum === saved.checksum && previewState.gameRunId === null, 'Preview was not exact-checksum and unranked.');
  await preview.close();
  await page.getByRole('button', { name: 'Validate', exact: true }).click();
  await page.getByText(/validate completed through the authenticated version workflow/).waitFor();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Publish', exact: true }).click();
  await page.getByText(/publish completed through the authenticated version workflow/).waitFor();
  await page.goto(`${baseUrl}/play?qa=hostile`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__GALACTIC_GUNNERS_SLICE_QA__?.campaign?.checksum);
  const playState = await page.evaluate(() => window.__GALACTIC_GUNNERS_SLICE_QA__);
  assert(playState.campaign.checksum === saved.checksum, 'A new campaign did not receive the published authored checksum.');
  await page.goto(`${baseUrl}/inceptivec-gamification-admin`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-designer-route="campaign"]');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Restore as new version' }).first().click();
  await page.getByText(/rollback completed through the authenticated version workflow/).waitFor();
  assert(consoleErrors.length === 0, `Console errors: ${consoleErrors.join('; ')}`);
  console.log(JSON.stringify({ result: 'PASS', draft_checksum: saved.checksum, gameplay_checksum: playState.campaign.checksum, rollback_source_version: original.version }, null, 2));
} finally { await browser.close(); }
