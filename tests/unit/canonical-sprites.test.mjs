import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
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
    assert.equal(asset.geometry.per_frame_refit, false, `${asset.asset_key}: per-frame refit is prohibited`);
    assert.ok(asset.geometry.common_scale_factor > 0, `${asset.asset_key}: common family scale`);
    assert.ok(asset.geometry.envelope_width > 0 && asset.geometry.envelope_height > 0, `${asset.asset_key}: family envelope`);
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

test('Boarding consumes generated state sheets and contains no legacy character crop authority', () => {
  const scene = readFileSync(path.join(root, 'game/src/scenes/BoardingScene.ts'), 'utf8');
  const boardingDefinitions = readCatalogue().filter((asset) =>
    asset.asset_key.startsWith('boarding.'),
  );
  assert.equal(boardingDefinitions.length, 13);
  assert.doesNotMatch(scene, /setCrop\s*\(/);
  assert.doesNotMatch(scene, /characters\/(player|alien)_00\d_v001\.png/);
  for (const state of [
    'boarding.player.idle.play',
    'boarding.player.walk.play',
    'boarding.player.jump.play',
    'boarding.player.fire.play',
    'boarding.player.hit_death.play',
    'boarding.alien.idle.play',
    'boarding.alien.fire.play',
    'boarding.alien.hit_death.play',
  ]) {
    assert.match(scene, new RegExp(state.replaceAll('.', '\\.')));
  }
});

test('canonical compiler rejects a supplied definition with source dimension drift', () => {
  const authority = path.join(root, 'docs/internal_governance/handoff_in/_archive/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_015/12_CANONICAL_SPRITESHEET_DEFINITION_AND_CORRECTION_PACK_v1.0/unpacked');
  const temporaryAuthority = mkdtempSync(path.join(os.tmpdir(), 'gg-sprite-authority-'));
  for (const filename of [
    'SHOOTER_SPRITESHEET_DEFINITIONS.csv',
    'BOARDING_SPRITESHEET_DEFINITIONS.csv',
    'BOARDING_SOURCE_SLICES.csv',
  ]) {
    copyFileSync(path.join(authority, filename), path.join(temporaryAuthority, filename));
  }
  const definition = path.join(temporaryAuthority, 'SHOOTER_SPRITESHEET_DEFINITIONS.csv');
  writeFileSync(
    definition,
    readFileSync(definition, 'utf8').replace('2172x724', '2173x724'),
  );
  try {
    assert.throws(
      () => execFileSync(process.execPath, ['scripts/compile-canonical-sprites.mjs'], {
        cwd: root,
        env: { ...process.env, GG_SPRITE_AUTHORITY_DIR: temporaryAuthority },
        stdio: 'pipe',
      }),
      (error) => {
        assert.match(
          String(error.stderr),
          /Source dimension drift: player\.ship/,
        );
        return true;
      },
    );
  } finally {
    rmSync(temporaryAuthority, { recursive: true, force: true });
  }
});

test('canonical compiler rejects a changed admitted source hash before extraction', () => {
  const source = path.join(root, 'assets/sprites/ships/gg_player_ship_v002_sheet.png');
  const original = readFileSync(source);
  const altered = Buffer.from(original);
  altered[altered.length - 1] ^= 0x01;
  try {
    writeFileSync(source, altered);
    assert.throws(
      () => execFileSync(process.execPath, ['scripts/compile-canonical-sprites.mjs'], {
        cwd: root,
        stdio: 'pipe',
      }),
      (error) => {
        assert.match(String(error.stderr), /Source hash drift: player\.ship/);
        return true;
      },
    );
  } finally {
    writeFileSync(source, original);
  }
});
