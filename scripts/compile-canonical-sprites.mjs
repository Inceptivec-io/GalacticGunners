import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const authority = path.join(root, 'docs/internal_governance/handoff_in/_archive/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_015/12_CANONICAL_SPRITESHEET_DEFINITION_AND_CORRECTION_PACK_v1.0/unpacked');
const output = path.join(root, 'apps/web/public/gg-runtime-assets/generated');
const parseLine = (line) => {
  const values = []; let value = ''; let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') quoted = !quoted;
    else if (character === ',' && !quoted) { values.push(value); value = ''; }
    else value += character;
  }
  values.push(value); return values;
};
const csv = (name) => {
  const rows = readFileSync(path.join(authority, name), 'utf8').trim().split(/\r?\n/).map(parseLine);
  return rows.slice(1).map((values) => Object.fromEntries(rows[0].map((key, index) => [key, values[index] ?? ''])));
};
const hash = (value) => createHash('sha256').update(value).digest('hex').toUpperCase();
const dimensions = (value) => value.split('x').map(Number);
const shooter = csv('SHOOTER_SPRITESHEET_DEFINITIONS.csv');
const boarding = csv('BOARDING_SPRITESHEET_DEFINITIONS.csv');
const slices = Object.fromEntries(csv('BOARDING_SOURCE_SLICES.csv').map((row) => [row.asset_key, row]));

function frames(row) {
  const count = Number(row.source_frames);
  const [sourceWidth, sourceHeight] = dimensions(row.source_size);
  if (row.asset_key.startsWith('boarding.')) {
    const boundaries = slices[row.asset_key]?.source_slice_boundaries_x?.split(',').map(Number);
    if (!boundaries || boundaries.length !== count + 1 || boundaries[0] !== 0 || boundaries.at(-1) !== sourceWidth) throw new Error(`Invalid declared Boarding boundaries: ${row.asset_key}`);
    return boundaries.slice(0, -1).map((left, index) => ({ left, top: 0, width: boundaries[index + 1] - left, height: sourceHeight }));
  }
  const explicit = [...row.source_slice.matchAll(/\d+/g)].map((match) => Number(match[0]));
  if (row.source_slice.startsWith('x boundaries')) {
    const bounds = explicit.slice(-5);
    return bounds.slice(0, -1).map((left, index) => ({ left, top: 0, width: bounds[index + 1] - left, height: sourceHeight }));
  }
  if (row.source_slice.startsWith('x=')) {
    const xs = explicit.slice(0, count);
    const width = explicit.at(-2); const height = explicit.at(-1);
    return xs.map((left) => ({ left, top: 0, width, height }));
  }
  if (count === 1) return [{ left: 0, top: 0, width: sourceWidth, height: sourceHeight }];
  const [width, height] = explicit.slice(1, 3);
  return Array.from({ length: count }, (_, index) => ({ left: index * width, top: 0, width, height }));
}

async function transparent(image, method) {
  if (!method?.startsWith('remove')) return image.ensureAlpha().png().toBuffer();
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let index = 0; index < data.length; index += 4) {
    const [r, g, b] = [data[index], data[index + 1], data[index + 2]];
    const spread = Math.max(r, g, b) - Math.min(r, g, b);
    if (spread < 24 && (r + g + b) / 3 > 150) data[index + 3] = 0;
  }
  return sharp(data, { raw: info }).png().toBuffer();
}

async function compile(row) {
  const source = path.join(root, row.source_path);
  if (!existsSync(source)) throw new Error(`Missing source: ${row.source_path}`);
  const sourceBytes = readFileSync(source); const sourceHash = hash(sourceBytes);
  const sourceMeta = await sharp(source).metadata();
  const [expectedWidth, expectedHeight] = dimensions(row.source_size);
  if (sourceMeta.width !== expectedWidth || sourceMeta.height !== expectedHeight) throw new Error(`Source dimension drift: ${row.asset_key}`);
  const declared = frames(row);
  if (declared.length !== Number(row.source_frames)) throw new Error(`Frame count drift: ${row.asset_key}`);
  const [sheetWidth, sheetHeight] = dimensions(row.derivative_size);
  const [cellWidth, cellHeight] = dimensions(row.cell_size);
  if (sheetWidth > 4096 || sheetHeight > 4096 || sheetWidth !== cellWidth * declared.length || sheetHeight !== cellHeight) throw new Error(`Portable derivative contract invalid: ${row.asset_key}`);
  const method = slices[row.asset_key]?.background_method ?? 'source alpha; alpha-trim';
  const framesPng = [];
  for (const area of declared) {
    const frame = sharp(await transparent(sharp(source).extract(area), method));
    let trimmed;
    try { trimmed = await frame.trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer(); }
    catch { trimmed = await frame.png().toBuffer(); }
    const inset = row.asset_key.startsWith('boarding.') ? 32 : 24;
    const meta = await sharp(trimmed).metadata();
    const ratio = Math.min((cellWidth - inset * 2) / meta.width, (cellHeight - inset * 2) / meta.height);
    const art = await sharp(trimmed).resize(Math.max(1, Math.floor(meta.width * ratio)), Math.max(1, Math.floor(meta.height * ratio))).png().toBuffer();
    const artMeta = await sharp(art).metadata();
    framesPng.push({ input: art, left: Math.floor((cellWidth - artMeta.width) / 2), top: row.asset_key.startsWith('boarding.') ? cellHeight - inset - artMeta.height : Math.floor((cellHeight - artMeta.height) / 2) });
  }
  const derivative = await sharp({ create: { width: sheetWidth, height: sheetHeight, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite(framesPng.map((frame, index) => ({ ...frame, left: frame.left + index * cellWidth }))).png({ compressionLevel: 9, adaptiveFiltering: false }).toBuffer();
  const destination = path.join(root, row.derivative_path); mkdirSync(path.dirname(destination), { recursive: true }); writeFileSync(destination, derivative);
  const thumbnailDirectory = path.join(output, 'thumbnails');
  const thumbnail = path.join(thumbnailDirectory, `${row.asset_key.replaceAll('.', '-')}.png`);
  mkdirSync(thumbnailDirectory, { recursive: true });
  writeFileSync(thumbnail, await sharp(derivative).extract({ left: 0, top: 0, width: cellWidth, height: cellHeight }).png().toBuffer());
  const variants = row.asset_key === 'fx.asteroid' || row.asset_key === 'fx.comet'
    ? await Promise.all(Array.from({ length: declared.length }, async (_, index) => {
      const label = row.asset_key === 'fx.asteroid' ? 'ASTEROID' : 'COMET';
      const variantFile = path.join(thumbnailDirectory, `${row.asset_key.replaceAll('.', '-')}-variant-${String(index + 1).padStart(2, '0')}.png`);
      writeFileSync(variantFile, await sharp(derivative).extract({ left: index * cellWidth, top: 0, width: cellWidth, height: cellHeight }).png().toBuffer());
      return { variant_id: `${label}_VARIANT_${String(index + 1).padStart(2, '0')}`, canonical_frame_index: index, thumbnail_path: `/gg-runtime-assets/generated/thumbnails/${path.basename(variantFile)}`, thumbnail_sha256: hash(readFileSync(variantFile)) };
    }))
    : [];
  return { ...row, source_sha256: sourceHash, derivative_sha256: hash(derivative), thumbnail_path: `/gg-runtime-assets/generated/thumbnails/${path.basename(thumbnail)}`, thumbnail_sha256: hash(readFileSync(thumbnail)), frame_count: declared.length, background_method: method, max_texture_axis: 4096, variants };
}

rmSync(output, { recursive: true, force: true });
const catalogue = [];
for (const row of [...shooter, ...boarding]) {
  try { catalogue.push(await compile(row)); }
  catch (error) { throw new Error(`${row.asset_key}: ${error instanceof Error ? error.message : String(error)}`); }
}
writeFileSync(path.join(output, 'sprite-catalogue.json'), `${JSON.stringify({ version: 1, generated_by: 'compile-canonical-sprites.mjs', assets: catalogue }, null, 2)}\n`);
const runtimeManifestPath = path.join(root, 'apps/web/public/gg-runtime-assets/manifest.json');
if (existsSync(runtimeManifestPath)) {
  const runtimeManifest = JSON.parse(readFileSync(runtimeManifestPath, 'utf8'));
  const derivatives = new Map(catalogue.map((asset) => [asset.asset_key, asset]));
  runtimeManifest.assets = runtimeManifest.assets.map((asset) => {
    const derivative = derivatives.get(asset.key);
    if (!derivative) return asset;
    return {
      ...asset,
      runtime_path: `/${derivative.derivative_path.replace(/^apps\/web\/public\//, '')}`,
      runtime_sha256: derivative.derivative_sha256,
      thumbnail_path: derivative.thumbnail_path,
      thumbnail_sha256: derivative.thumbnail_sha256,
      sprite_catalogue_key: derivative.asset_key,
      frame_count: derivative.frame_count,
    };
  });
  writeFileSync(runtimeManifestPath, `${JSON.stringify(runtimeManifest, null, 2)}\n`);
}
const runtimeCatalogue = catalogue.map((asset) => ({
  assetKey: asset.asset_key,
  runtimePath: `/${asset.derivative_path.replace(/^apps\/web\/public\//, '')}`,
  derivativePath: asset.derivative_path,
  derivativeSha256: asset.derivative_sha256,
  sourcePath: asset.source_path,
  sourceSha256: asset.source_sha256,
  thumbnailPath: asset.thumbnail_path,
  thumbnailSha256: asset.thumbnail_sha256,
  frameCount: asset.frame_count,
  frameWidth: Number(asset.cell_size.split('x')[0]),
  frameHeight: Number(asset.cell_size.split('x')[1]),
  state: asset.state,
  authoredDirection: asset.authored_direction,
  frameRate: Number(asset.fps),
  repeat: asset.repeat === 'true',
  static: Number(asset.source_frames) === 1 || asset.asset_key === 'fx.asteroid' || asset.asset_key === 'fx.comet',
  variants: asset.variants,
}));
const generatedTypeScript = `// Generated by scripts/compile-canonical-sprites.mjs. Do not edit by hand.\n\nexport interface GeneratedSpriteDefinition {\n  readonly assetKey: string;\n  readonly runtimePath: string;\n  readonly derivativePath: string;\n  readonly derivativeSha256: string;\n  readonly sourcePath: string;\n  readonly sourceSha256: string;\n  readonly thumbnailPath: string;\n  readonly thumbnailSha256: string;\n  readonly frameCount: number;\n  readonly frameWidth: number;\n  readonly frameHeight: number;\n  readonly state: string;\n  readonly authoredDirection: string;\n  readonly frameRate: number;\n  readonly repeat: boolean;\n  readonly static: boolean;\n}\n\nexport const GENERATED_SPRITE_CATALOGUE: readonly GeneratedSpriteDefinition[] = ${JSON.stringify(runtimeCatalogue, null, 2)} as const;\n\nexport const GENERATED_SPRITE_BY_KEY = new Map(\n  GENERATED_SPRITE_CATALOGUE.map((definition) => [definition.assetKey, definition]),\n);\n\nexport const GENERATED_SPRITE_ASSET_KEYS = new Set(\n  GENERATED_SPRITE_CATALOGUE.map((definition) => definition.assetKey),\n);\n`;
writeFileSync(
  path.join(root, 'game/src/config/generatedSpriteCatalogue.ts'),
  generatedTypeScript.replace(
    '  readonly static: boolean;\n}',
    '  readonly static: boolean;\n  readonly variants: readonly { readonly variant_id: string; readonly canonical_frame_index: number; readonly thumbnail_path: string; readonly thumbnail_sha256: string }[];\n}',
  ),
);
console.log(`Compiled ${catalogue.length} canonical sprite derivatives.`);
