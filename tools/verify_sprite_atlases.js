const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");

const evidenceRoot = path.resolve("docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_004/toolchain");
const outFile = path.join(evidenceRoot, "sprite_atlas_report.json");
const sprites = [
  { key: "player", source: "assets/images/owned/sprites/gg_player_ship_v002_sheet.png", atlas: "assets/images/owned/sprites/gg_player_ship_v002_atlas.json" },
  { key: "standardEnemy", source: "assets/images/owned/sprites/gg_enemy_destroyer_v002_sheet.png", atlas: "assets/images/owned/sprites/gg_enemy_destroyer_v002_atlas.json" },
  { key: "cruiser", source: "assets/images/owned/sprites/gg_enemy_cruiser_v002_sheet.png", atlas: "assets/images/owned/sprites/gg_enemy_cruiser_v002_atlas.json" },
  { key: "scout", source: "assets/images/owned/sprites/gg_enemy_scout_v002_sheet.png", atlas: "assets/images/owned/sprites/gg_enemy_scout_v002_atlas.json" },
  { key: "mothership", source: "assets/images/owned/sprites/gg_boss_mothership_v002_sheet.png", atlas: "assets/images/owned/sprites/gg_boss_mothership_v002_atlas.json" },
  { key: "asteroid", source: "assets/images/owned/sprites/gg_asteroid_v002_sheet.png", frameWidth: 724, frameHeight: 724 },
  { key: "comet", source: "assets/images/owned/sprites/gg_comet_v002_sheet.png", frameWidth: 837, frameHeight: 470 },
  { key: "nukeProjectile", source: "assets/images/owned/sprites/gg_nuke_projectile_v002_sheet.png", frameWidth: 720, frameHeight: 800 },
  { key: "nukeBurst", source: "assets/images/owned/sprites/gg_nuke_burst_v002_sheet.png", frameWidth: 516, frameHeight: 516 },
  { key: "smallExplosion", source: "assets/images/owned/sprites/gg_explosion_small_v002_sheet.png", frameWidth: 494, frameHeight: 494 },
  { key: "largeExplosion", source: "assets/images/owned/sprites/gg_explosion_large_v002_sheet.png", frameWidth: 512, frameHeight: 512 }
];

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function framesFromAtlas(sprite) {
  const atlas = JSON.parse(fs.readFileSync(sprite.atlas, "utf8"));
  return Object.entries(atlas.frames).map(([name, data]) => ({ name, ...data.frame }));
}

async function contentBounds(image, frame) {
  const raw = await sharp(image)
    .extract({ left: frame.x, top: frame.y, width: frame.w, height: frame.h })
    .ensureAlpha()
    .raw()
    .toBuffer();
  let minX = frame.w;
  let minY = frame.h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < frame.h; y++) {
    for (let x = 0; x < frame.w; x++) {
      if (raw[(y * frame.w + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  const empty = maxX < 0;
  return {
    empty,
    x: empty ? null : minX,
    y: empty ? null : minY,
    w: empty ? 0 : maxX - minX + 1,
    h: empty ? 0 : maxY - minY + 1,
    padding: empty ? null : {
      left: minX,
      top: minY,
      right: frame.w - maxX - 1,
      bottom: frame.h - maxY - 1
    }
  };
}

function gridFrames(sprite, metadata) {
  const frames = [];
  let index = 0;
  for (let y = 0; y + sprite.frameHeight <= metadata.height; y += sprite.frameHeight) {
    for (let x = 0; x + sprite.frameWidth <= metadata.width; x += sprite.frameWidth) {
      frames.push({ name: String(index++), x, y, w: sprite.frameWidth, h: sprite.frameHeight });
    }
  }
  return frames;
}

function detectOverlap(frames) {
  const overlaps = [];
  for (let i = 0; i < frames.length; i++) {
    for (let j = i + 1; j < frames.length; j++) {
      const a = frames[i];
      const b = frames[j];
      const hit = a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
      if (hit) overlaps.push([a.name, b.name]);
    }
  }
  return overlaps;
}

async function inspectSprite(sprite) {
  const source = path.resolve(sprite.source);
  const metadata = await sharp(source).metadata();
  const frames = sprite.atlas ? framesFromAtlas(sprite) : gridFrames(sprite, metadata);
  const inspected = [];
  for (const frame of frames) {
    inspected.push({
      ...frame,
      contentBounds: await contentBounds(source, frame)
    });
  }
  const overlaps = detectOverlap(frames);
  const contentWidths = inspected.filter((f) => !f.contentBounds.empty).map((f) => f.contentBounds.w);
  const contentHeights = inspected.filter((f) => !f.contentBounds.empty).map((f) => f.contentBounds.h);
  return {
    key: sprite.key,
    source: sprite.source,
    sourceSha256: sha256(source),
    sourceDimensions: { width: metadata.width, height: metadata.height },
    alpha: metadata.hasAlpha === true,
    frameCount: inspected.length,
    frames: inspected,
    overlaps,
    stableLogicalAnchor: overlaps.length === 0,
    contentSizeRange: {
      width: { min: Math.min(...contentWidths), max: Math.max(...contentWidths) },
      height: { min: Math.min(...contentHeights), max: Math.max(...contentHeights) }
    }
  };
}

async function main() {
  fs.mkdirSync(evidenceRoot, { recursive: true });
  const report = {
    generatedAt: new Date().toISOString(),
    pass: true,
    sprites: []
  };
  for (const sprite of sprites) {
    const result = await inspectSprite(sprite);
    result.pass = result.alpha && result.frameCount > 0 && result.overlaps.length === 0 && result.frames.every((f) => !f.contentBounds.empty);
    report.sprites.push(result);
    if (!result.pass) report.pass = false;
  }
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
  console.log(`sprite atlas report: ${outFile}`);
  console.log(report.pass ? "qa:sprites PASS" : "qa:sprites FAIL");
  if (!report.pass) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
