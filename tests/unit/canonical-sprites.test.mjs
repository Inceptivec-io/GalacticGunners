import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const cataloguePath = path.join(root, 'apps/web/public/gg-runtime-assets/generated/sprite-catalogue.json');
const digest = (file) => createHash('sha256').update(readFileSync(file)).digest('hex').toUpperCase();
const readCatalogue = () => JSON.parse(readFileSync(cataloguePath, 'utf8')).assets;

test('canonical compiler emits all 27 declared portable RGBA derivatives', async () => {
  const assets = readCatalogue();
  assert.equal(assets.length, 27);
  assert.equal(new Set(assets.map((asset) => asset.asset_key)).size, 27);
  for (const asset of assets) {
    const output = path.join(root, asset.derivative_path);
    const thumbnail = path.join(root, 'apps/web/public', asset.thumbnail_path.replace(/^\//, ''));
    assert.equal(existsSync(output), true, `${asset.asset_key}: derivative missing`);
    assert.equal(existsSync(thumbnail), true, `${asset.asset_key}: thumbnail missing`);
    const metadata = await sharp(output).metadata();
    const [width, height] = asset.derivative_size.split('x').map(Number);
    assert.equal(metadata.width, width, `${asset.asset_key}: derivative width`);
    assert.equal(metadata.height, height, `${asset.asset_key}: derivative height`);
    assert.equal(metadata.hasAlpha, true, `${asset.asset_key}: derivative must retain alpha`);
    assert.ok(width <= 4096 && height <= 4096, `${asset.asset_key}: portability limit`);
    assert.equal(digest(output), asset.derivative_sha256, `${asset.asset_key}: derivative digest`);
  }
});

test('canonical compiler is deterministic across a repeated clean generation', () => {
  const before = new Map(readCatalogue().map((asset) => [asset.asset_key, asset.derivative_sha256]));
  execFileSync(process.execPath, ['scripts/compile-canonical-sprites.mjs'], {
    cwd: root,
    stdio: 'pipe',
  });
  const after = new Map(readCatalogue().map((asset) => [asset.asset_key, asset.derivative_sha256]));
  assert.deepEqual(after, before);
});
