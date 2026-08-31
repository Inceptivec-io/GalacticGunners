import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
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
  const thumbnail = path.join(output, 'thumbnails', `${row.asset_key.replaceAll('.', '-')}.png`); mkdirSync(path.dirname(thumbnail), { recursive: true }); writeFileSync(thumbnail, await sharp(derivative).extract({ left: 0, top: 0, width: cellWidth, height: cellHeight }).png().toBuffer());
  return { ...row, source_sha256: sourceHash, derivative_sha256: hash(derivative), thumbnail_path: `/gg-runtime-assets/generated/thumbnails/${path.basename(thumbnail)}`, thumbnail_sha256: hash(readFileSync(thumbnail)), frame_count: declared.length, background_method: method, max_texture_axis: 4096 };
}

rmSync(output, { recursive: true, force: true });
const catalogue = [];
for (const row of [...shooter, ...boarding]) {
  try { catalogue.push(await compile(row)); }
  catch (error) { throw new Error(`${row.asset_key}: ${error instanceof Error ? error.message : String(error)}`); }
}
writeFileSync(path.join(output, 'sprite-catalogue.json'), `${JSON.stringify({ version: 1, generated_by: 'compile-canonical-sprites.mjs', assets: catalogue }, null, 2)}\n`);
console.log(`Compiled ${catalogue.length} canonical sprite derivatives.`);
