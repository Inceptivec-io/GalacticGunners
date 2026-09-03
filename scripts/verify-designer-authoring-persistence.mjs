import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.GG_RUNTIME_URL ?? 'http://localhost:3002';
const testedSha = process.env.GG_TESTED_SHA ?? 'UNSPECIFIED';
const outputDir = path.resolve(process.env.GG_EVIDENCE_DIR ?? 'docs/evidence/designer-authoring-persistence');
mkdirSync(outputDir, { recursive: true });
const lines = readFileSync('FOUNDER_REVIEW_ACCESS.local.txt', 'utf8').split(/\r?\n/);
const credential = lines.map((line) => line.match(/^Inceptivec administrator: ([^/]+) \/ (.+)$/)).find(Boolean);
if (!credential) throw new Error('Founder review administrator credential is unavailable.');
const [, username, password] = credential;
const assert = (value, message) => { if (!value) throw new Error(message); };
const canonicalize = (value) => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  return value;
};

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
  ]) assert(await surface.getByText(label, { exact: false }).count() > 0, `Missing typed Designer control: ${label}`);
  await page.locator('[aria-label="SCOUT at 50, 170"]').click();
  for (const label of ['Type', 'Asset', 'X', 'Y', 'Width', 'Height', 'Rotation', 'Z index', 'Tags', 'Formation']) {
    assert(await page.locator('.designer-inspector').getByText(label, { exact: false }).count() > 0, `Missing entity control: ${label}`);
  }
  await page.getByRole('button', { name: 'Hazards', exact: true }).click();
  await page.getByRole('button', { name: 'ASTEROID_VARIANT_01', exact: true }).click();
  const emitter = page.locator('[aria-label^="ASTEROID emitter at"]').last();
  await emitter.click();
  for (const label of ['Spawn jitter', 'Minimum spin magnitude', 'Maximum spin magnitude', 'Spin direction', 'Entry edges', 'Spawn pattern', 'Fixed spawn points', 'Despawn margin', 'Collision damage']) {
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
  const responseBody = await response.text();
  const requestBody = response.request().postData() ?? '';
  assert(
    response.status() === 201,
    `Immutable authoring save returned ${response.status()}: ${responseBody}; request=${requestBody}`,
  );
  const draft = JSON.parse(responseBody);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('[data-designer-route="campaign"]');
  const authority = await page.evaluate(async (levelId) => (
    await fetch(`/api/v1/admin/levels/authority/?level_id=${encodeURIComponent(levelId)}`, { credentials: 'same-origin' })
  ).json(), level.id);
  const selectedLevel = authority.results.find((item) => item.id === level.id);
  const reloaded = selectedLevel?.authority_version;
  assert(reloaded, 'Selected level did not return its complete authority_version.');
  assert(reloaded.version === draft.version, 'Reloaded authority version differs from saved immutable draft.');
  assert(reloaded.status === draft.status, 'Reloaded authority status differs from saved immutable draft.');
  assert(reloaded.checksum === draft.checksum, 'Reloaded authority checksum differs from saved immutable draft.');
  assert(reloaded.config?.seed === draft.config.seed, 'Reloaded authority seed differs from saved immutable draft.');
  assert(
    JSON.stringify(canonicalize(reloaded.config)) === JSON.stringify(canonicalize(draft.config)),
    'Saved immutable authoring configuration did not reload canonically.',
  );
  assert(errors.length === 0, `Console errors: ${errors.join(' | ')}`);
  const result = {
    result: 'PASS',
    tested_sha: testedSha,
    level_id: level.id,
    draft_checksum: draft.checksum,
    authority_version: draft.version,
    authority_status: draft.status,
    persisted_seed: draft.config.seed,
    complete_canonical_config_match: true,
    verifier_contract: 'selected authority_version',
  };
  writeFileSync(
    path.join(outputDir, 'designer-authoring-persistence-verification.json'),
    `${JSON.stringify(result, null, 2)}\n`,
  );
  console.log(JSON.stringify(result, null, 2));
} finally { await browser.close(); }
