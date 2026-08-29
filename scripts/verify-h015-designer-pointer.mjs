import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.GG_RUNTIME_URL ?? 'http://localhost:3002';
const testedSha = process.env.GG_TESTED_SHA ?? 'UNSPECIFIED';
const outputDir = path.resolve(process.env.GG_EVIDENCE_DIR
  ?? 'docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_015/rectification/stage-3');
mkdirSync(outputDir, { recursive: true });
const access = Object.fromEntries(readFileSync('FOUNDER_REVIEW_ACCESS.local.txt', 'utf8').split(/\r?\n/).flatMap((line) => {
  const match = line.match(/^Inceptivec administrator: ([^/]+) \/ (.+)$/);
  return match ? [['admin', { username: match[1].trim(), password: match[2].trim() }]] : [];
}));
const assert = (value, message) => { if (!value) throw new Error(message); };
const coordinate = (label) => (label.match(/at (\d+), (\d+)/) ?? []).slice(1).map(Number);
const viewportRect = (locator) => locator.evaluate((element) => {
  const { x, y, width, height } = element.getBoundingClientRect();
  return { x, y, width, height };
});

const browser = await chromium.launch({ headless: true, args: ['--disable-gpu', '--disable-dev-shm-usage'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });

try {
  assert(access.admin, 'Founder review administrator credential is unavailable.');
  await page.goto(`${baseUrl}/inceptivec-gamification-admin/login`, { waitUntil: 'networkidle' });
  await page.locator('input[name="username"]').fill(access.admin.username);
  await page.locator('input[name="password"]').fill(access.admin.password);
  await page.locator('button[type="submit"]').click();
  await page.waitForSelector('[data-designer-route="campaign"]');
  const zoom = page.locator('input[aria-label="Canvas zoom"]');
  const cases = [];

  for (const level of [0.5, 0.75, 1, 1.25, 1.5]) {
    await zoom.fill(String(level));
    await zoom.dispatchEvent('input');
    const entity = page.locator('button[aria-label^="SCOUT at"]').first();
    const before = await entity.getAttribute('aria-label');
    const [x, y] = coordinate(before);
    const box = await viewportRect(entity);
    const field = await viewportRect(page.locator('.designer-playfield'));
    assert(box && field, `Designer geometry unavailable at ${level * 100}% zoom.`);
    const deltaX = field.width * 16 / 1280;
    const deltaY = field.height * 16 / 720;
    const start = { clientX: box.x + box.width / 2, clientY: box.y + box.height / 2, pointerId: 1, pointerType: 'mouse', button: 0, buttons: 1 };
    await entity.dispatchEvent('pointerdown', start);
    await page.locator('.designer-playfield').dispatchEvent('pointermove', { ...start, clientX: start.clientX + deltaX, clientY: start.clientY + deltaY });
    await page.locator('.designer-playfield').dispatchEvent('pointerup', { ...start, clientX: start.clientX + deltaX, clientY: start.clientY + deltaY, buttons: 0 });
    const after = await entity.getAttribute('aria-label');
    const [nextX, nextY] = coordinate(after);
    const expectedX = Math.round((x + 16) / 16) * 16;
    const expectedY = Math.round((y + 16) / 16) * 16;
    assert(nextX === expectedX && nextY === expectedY,
      `Pointer mapping drift at ${level * 100}%: ${before} -> ${after}.`);
    await page.getByRole('button', { name: 'Undo' }).click();
    assert(await entity.getAttribute('aria-label') === before, `Undo did not restore the completed drag at ${level * 100}%.`);
    await page.getByRole('button', { name: 'Redo' }).click();
    assert(await entity.getAttribute('aria-label') === after, `Redo did not restore the completed drag at ${level * 100}%.`);
    cases.push({ zoom: level, input: 'mouse-pointer-capture', before, after, undo_redo: true });
  }

  const captureEntity = page.locator('button[aria-label^="SCOUT at"]').first();
  const captureBefore = await captureEntity.getAttribute('aria-label');
  const captureBox = await viewportRect(captureEntity);
  const captureField = await viewportRect(page.locator('.designer-playfield'));
  assert(captureBox && captureField, 'Pointer capture geometry unavailable.');
  const captureStart = { clientX: captureBox.x + captureBox.width / 2, clientY: captureBox.y + captureBox.height / 2, pointerId: 2, pointerType: 'mouse', button: 0, buttons: 1 };
  await captureEntity.dispatchEvent('pointerdown', captureStart);
  await page.locator('.designer-playfield').dispatchEvent('pointermove', { ...captureStart, clientX: captureField.x - 24, clientY: captureField.y - 24 });
  await page.locator('.designer-playfield').dispatchEvent('pointermove', { ...captureStart, clientX: captureField.x + captureField.width / 2, clientY: captureField.y + captureField.height / 2 });
  await page.locator('.designer-playfield').dispatchEvent('pointerup', { ...captureStart, clientX: captureField.x + captureField.width / 2, clientY: captureField.y + captureField.height / 2, buttons: 0 });
  const captureAfter = await captureEntity.getAttribute('aria-label');
  assert(captureAfter !== captureBefore, 'Pointer capture did not retain a drag that left the playfield.');
  await page.getByRole('button', { name: 'Undo' }).click();
  assert(await captureEntity.getAttribute('aria-label') === captureBefore, 'Pointer-capture drag did not produce exactly one undoable change.');

  const touchEntity = page.locator('button[aria-label^="SCOUT at"]').first();
  const touchBefore = await touchEntity.getAttribute('aria-label');
  const touchBox = await viewportRect(touchEntity);
  const touchField = await viewportRect(page.locator('.designer-playfield'));
  assert(touchBox && touchField, 'Touch Designer geometry unavailable.');
  const dx = touchField.width * 16 / 1280;
  const dy = touchField.height * 16 / 720;
  const touchStart = { clientX: touchBox.x + touchBox.width / 2, clientY: touchBox.y + touchBox.height / 2, pointerId: 3, pointerType: 'touch', button: 0, buttons: 1 };
  await touchEntity.dispatchEvent('pointerdown', touchStart);
  await page.locator('.designer-playfield').dispatchEvent('pointermove', { ...touchStart, clientX: touchStart.clientX + dx, clientY: touchStart.clientY + dy });
  await page.locator('.designer-playfield').dispatchEvent('pointerup', { ...touchStart, clientX: touchStart.clientX + dx, clientY: touchStart.clientY + dy, buttons: 0 });
  const touchAfter = await touchEntity.getAttribute('aria-label');
  assert(touchAfter !== touchBefore, 'Touch drag did not update an authored object.');

  await page.getByRole('button', { name: 'Alien Ships', exact: true }).click();
  await page.waitForSelector('.designer-chooser');
  const thumbnailSources = await page.locator('.designer-chooser .tool-button img').evaluateAll((images) => images.map((image) => image.getAttribute('src')));
  assert(thumbnailSources.length > 0 && thumbnailSources.every((source) => source?.includes('/designer-previews/') || source?.includes('ui/icons/')),
    `Designer palette contains a raw animation sheet thumbnail: ${JSON.stringify(thumbnailSources)}`);
  await page.getByRole('button', { name: 'Close chooser' }).click();
  await page.screenshot({ path: path.join(outputDir, 'designer-pointer-and-thumbnails.png'), fullPage: true });
  assert(errors.length === 0, `Console errors: ${errors.join(' | ')}`);
  const result = { tested_sha: testedSha, generated_at: new Date().toISOString(), zoom_cases: cases, touch_drag: { before: touchBefore, after: touchAfter }, thumbnail_sources: thumbnailSources, console_errors: errors, result: 'PASS' };
  writeFileSync(path.join(outputDir, 'designer-pointer-verification.json'), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
} finally { await browser.close(); }
