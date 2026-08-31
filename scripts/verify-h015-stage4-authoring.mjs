import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const baseUrl = process.env.GG_RUNTIME_URL ?? 'http://localhost:3002';
const lines = readFileSync('FOUNDER_REVIEW_ACCESS.local.txt', 'utf8').split(/\r?\n/);
const credential = lines.map((line) => line.match(/^Inceptivec administrator: ([^/]+) \/ (.+)$/)).find(Boolean);
if (!credential) throw new Error('Founder review administrator credential is unavailable.');
const [, username, password] = credential;
const assert = (value, message) => { if (!value) throw new Error(message); };

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
try {
  await page.goto(`${baseUrl}/inceptivec-gamification-admin/login`, { waitUntil: 'networkidle' });
  await page.locator('input[name="username"]').fill(username.trim());
  await page.locator('input[name="password"]').fill(password.trim());
  await page.locator('button[type="submit"]').click();
  await page.waitForSelector('[data-designer-route="campaign"]');
  const surface = page.locator('[aria-label="Level configuration"]');
  await surface.waitFor();
  for (const label of [
    'Name', 'Slug', 'Sequence', 'Deterministic seed', 'Grid size', 'Background asset',
    'Starting lives', 'Starting nukes', 'Nuke rearm maximum', 'Completion reward profile',
    'Scoring profile', 'Drop rules', 'Objectives', 'Boarding anchors',
  ]) assert(await surface.getByText(label, { exact: false }).count() > 0, `Missing typed Stage 4 control: ${label}`);
  await page.locator('[aria-label="SCOUT at 50, 170"]').click();
  for (const label of ['Type', 'Asset', 'X', 'Y', 'Width', 'Height', 'Rotation', 'Z index', 'Tags', 'Formation']) {
    assert(await page.locator('.designer-inspector').getByText(label, { exact: false }).count() > 0, `Missing entity control: ${label}`);
  }
  await page.getByRole('button', { name: 'Hazards', exact: true }).click();
  await page.getByRole('button', { name: 'ASTEROID_VARIANT_01', exact: true }).click();
  const emitter = page.locator('[aria-label^="ASTEROID emitter at"]').last();
  await emitter.click();
  for (const label of ['Spawn jitter', 'Minimum angular velocity', 'Maximum angular velocity', 'Entry edges', 'Spawn pattern', 'Fixed spawn points', 'Despawn margin', 'Collision damage']) {
    assert(await page.locator('.designer-inspector').getByText(label, { exact: false }).count() > 0, `Missing emitter control: ${label}`);
  }
  const before = await page.evaluate(async () => (await fetch('/api/v1/admin/levels/authority/', { credentials: 'same-origin' })).json());
  const level = before.results[0];
  await page.getByRole('button', { name: 'Refresh authority' }).click();
  await page.waitForTimeout(200);
  const seed = page.locator('[aria-label="Level configuration"]').getByLabel('Deterministic seed');
  await seed.fill(String(Number(await seed.inputValue()) + 1));
  const saved = page.waitForResponse((response) => response.request().method() === 'POST' && /\/api\/v1\/admin\/levels\/[^/]+\/drafts\/$/.test(new URL(response.url()).pathname));
  await page.getByRole('button', { name: 'Save immutable draft' }).click();
  const response = await saved;
  assert(response.status() === 201, `Immutable authoring save returned ${response.status()}.`);
  const draft = await response.json();
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('[data-designer-route="campaign"]');
  const authority = await page.evaluate(async () => (await fetch('/api/v1/admin/levels/authority/', { credentials: 'same-origin' })).json());
  const reloaded = authority.results.find((item) => item.id === level.id)?.versions?.[0];
  assert(reloaded?.checksum === draft.checksum && reloaded?.config?.seed === draft.config.seed, 'Saved immutable authoring configuration did not reload exactly.');
  assert(errors.length === 0, `Console errors: ${errors.join(' | ')}`);
  console.log(JSON.stringify({ result: 'PASS', level_id: level.id, draft_checksum: draft.checksum, persisted_seed: draft.config.seed }, null, 2));
} finally { await browser.close(); }
