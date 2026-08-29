import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const baseUrl = process.env.GG_RUNTIME_URL ?? 'http://localhost:3002';
const testedSha = process.env.GG_TESTED_SHA ?? 'UNSPECIFIED';
const outputDir = path.resolve(process.env.GG_EVIDENCE_DIR
  ?? 'docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_015/rectification/designer_roundtrip');
mkdirSync(outputDir, { recursive: true });
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
  page.setDefaultTimeout(10_000);
  const consoleErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto(`${baseUrl}/inceptivec-gamification-admin/login`, { waitUntil: 'networkidle' });
  await page.locator('input[name="username"]').fill(admin.username);
  await page.locator('input[name="password"]').fill(admin.password);
  await page.locator('button[type="submit"]').click();
  await page.waitForSelector('[data-designer-route="campaign"]');
  await page.waitForFunction(() => document.querySelectorAll('button.designer-placement').length > 1);
  const initial = await page.evaluate(async () => (await fetch('/api/v1/admin/levels/authority/', { credentials: 'same-origin' })).json());
  const level = initial.results[0];
  const original = level.editable_version ?? level.versions?.[0] ?? level.active_version;
  const targetEntity = original.config.entities.find((entity) => entity.entity_type === 'SCOUT') ?? original.config.entities[0];
  assert(targetEntity, 'The editable campaign definition has no entity available for the mixed-composition roundtrip.');
  const replacementType = targetEntity.entity_type === 'CRUISER' ? 'SCOUT' : 'CRUISER';
  const saveChangedDraft = async () => {
    await page.locator(`[aria-label="${targetEntity.entity_type} at ${targetEntity.x}, ${targetEntity.y}"]`).click();
    const entityType = page.locator('.designer-inspector').getByLabel('Type');
    await entityType.selectOption(replacementType);
    assert(await entityType.inputValue() === replacementType, 'Designer entity composition edit did not retain before save.');
    await page.locator(`[aria-label="${replacementType} at ${targetEntity.x}, ${targetEntity.y}"]`).waitFor();
    await page.locator('.designer-formation-box').first().click();
    const layout = page.locator('.designer-inspector').getByLabel('Layout');
    await layout.selectOption('WEDGE');
    assert(await layout.inputValue() === 'WEDGE', 'Designer formation layout edit did not retain before save.');
    await page.getByRole('button', { name: 'Hazards', exact: true }).click();
    await page.getByRole('button', { name: 'Add recurring ASTEROID' }).click();
    await page.locator('[aria-label^="ASTEROID emitter at"]').last().click();
    const minimumSpeed = page.locator('.designer-inspector').getByLabel('Minimum speed');
    await minimumSpeed.fill('173');
    await minimumSpeed.blur();
    assert(Number(await minimumSpeed.inputValue()) === 173, 'Designer hazard property edit did not retain before save.');
    const draftResponse = page.waitForResponse((response) =>
      response.request().method() === 'POST' && /\/api\/v1\/admin\/levels\/[^/]+\/drafts\/$/.test(new URL(response.url()).pathname),
    );
    await page.getByRole('button', { name: 'Save immutable draft' }).click();
    const response = await draftResponse;
    const draftBody = await response.json();
    const conflict = response.status() === 409;
    assert(conflict || response.status() === 201, `Unexpected immutable draft status: ${response.status()} ${JSON.stringify(draftBody)}.`);
    if (conflict) {
      const authority = await page.evaluate(async () => (await fetch('/api/v1/admin/levels/authority/', { credentials: 'same-origin' })).json());
      const current = authority.results.find((item) => item.id === level.id);
      console.error(JSON.stringify({ designer_conflict: { latest: current?.versions?.[0], editable: current?.editable_version, active: current?.active_version } }));
    }
    if (!conflict) console.log(JSON.stringify({ designer_draft_response: { version: draftBody.version, checksum: draftBody.checksum, entity: draftBody.config?.entities?.find((entity) => entity.id === targetEntity.id), formation: draftBody.config?.formations?.[0], hazards: draftBody.config?.hazard_emitters } }));
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
  assert(saved.config.entities.find((entity) => entity.id === targetEntity.id)?.entity_type === replacementType, 'Reloaded draft lost the authored mixed enemy composition.');
  assert(saved.config.formations[0]?.layout === 'WEDGE', 'Reloaded draft lost the authored formation layout.');
  assert(saved.config.hazard_emitters.some((emitter) => emitter.hazard_type === 'ASTEROID' && emitter.speed_min === 173), 'Reloaded draft lost the authored hazard property.');
  await page.screenshot({ path: path.join(outputDir, '01-designer-immutable-draft.png'), fullPage: true });
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
  await preview.screenshot({ path: path.join(outputDir, '02-designer-exact-checksum-preview.png'), fullPage: true });
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
  await page.screenshot({ path: path.join(outputDir, '03-core-published-gameplay.png'), fullPage: true });
  await page.goto(`${baseUrl}/inceptivec-gamification-admin`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-designer-route="campaign"]');
  const rollbackAuthority = await page.evaluate(async () => (await fetch('/api/v1/admin/levels/authority/', { credentials: 'same-origin' })).json());
  const rollbackLevel = rollbackAuthority.results.find((item) => item.id === level.id);
  const rollbackSource = rollbackLevel?.versions?.find((version) => ['PUBLISHED', 'SUPERSEDED'].includes(version.status));
  assert(rollbackSource, 'Designer history has no published or superseded version available for rollback.');
  page.once('dialog', (dialog) => dialog.accept());
  const historicalVersion = page.locator('.designer-version-history > div').filter({ hasText: new RegExp(`^v${rollbackSource.version} ${rollbackSource.status}`) });
  await historicalVersion.getByRole('button', { name: 'Restore as new version' }).click();
  await page.getByText(/rollback completed through the authenticated version workflow/).waitFor();
  const afterRollback = await page.evaluate(async () => (await fetch('/api/v1/admin/levels/authority/', { credentials: 'same-origin' })).json());
  const restored = afterRollback.results.find((item) => item.id === level.id).versions[0];
  assert(restored.checksum === rollbackSource.checksum, 'Rollback did not restore the selected immutable configuration.');
  assert(consoleErrors.length === 0, `Console errors: ${consoleErrors.join('; ')}`);
  const result = { tested_sha: testedSha, generated_at: new Date().toISOString(), result: 'PASS', draft_checksum: saved.checksum, gameplay_checksum: playState.campaign.checksum, rollback_source_version: rollbackSource.version, console_errors: consoleErrors };
  writeFileSync(path.join(outputDir, 'designer-runtime-roundtrip.json'), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
} finally { await browser.close(); }
