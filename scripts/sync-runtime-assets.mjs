import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.join(root, 'apps', 'web', 'public', 'gg-runtime-assets');

const runtimeAssets = [
  {
    key: 'background.starfield',
    assetId: 'GG-BACKGROUND-BACKGROUNDS-OWNED-GG-BG-STARFIELD-V002',
    source: 'assets/backgrounds/owned/gg_bg_starfield_v002.png',
    runtime: 'backgrounds/gg_bg_starfield_v002.png',
    sha256: '25BBB12578B10E5AD6E77593656DF3CE8FFD72A15EEABADA8134ED76390301C2',
  },
  {
    key: 'branding.primaryLogo',
    assetId: 'GG-BRAND-BRANDING-LOGOS-GG-LOGO-PRIMARY-V002',
    source: 'assets/branding/logos/gg_logo_primary_v002.png',
    runtime: 'branding/gg_logo_primary_v002.png',
    sha256: '4815BCBF0325CEBC0DE9B61F4CADBD87D6C791EF54F4B537CF2DA196221AAB76',
  },
  {
    key: 'keyArt.heroBattle',
    assetId: 'GG-KEYART-KEY-ART-POSTERS-GG-HERO-IMAGE-PLAYER-FIGHTING-V002-4K-UHD-MASTER',
    source: 'assets/key_art/posters/gg_hero_image_player_fighting_v002_4k_uhd_master.png',
    runtime: 'key_art/gg_hero_image_player_fighting_v002_4k_uhd_master.png',
    sha256: '054D150DA322ACCDA4256306DB40B30CC0A098D7B307702C5CCFFA6148A5CE8F',
  },
  {
    key: 'player.ship',
    assetId: 'GG-SPRITE-SPRITES-SHIPS-GG-PLAYER-SHIP-V002-SHEET',
    source: 'assets/sprites/ships/gg_player_ship_v002_sheet.png',
    runtime: 'sprites/ships/gg_player_ship_v002_sheet.png',
    sha256: 'A3E2EDBDEE85B312AD1766EE00C5A5438F60ABF9DFCD006B2BD8474012DDFF38',
  },
  {
    key: 'enemy.scout',
    assetId: 'GG-SPRITE-SPRITES-SHIPS-GG-ENEMY-SCOUT-V002-SHEET',
    source: 'assets/sprites/ships/gg_enemy_scout_v002_sheet.png',
    runtime: 'sprites/ships/gg_enemy_scout_v002_sheet.png',
    sha256: 'FBB60A9EB52346CB57CDF22FA1B6088DD24B08F9132540B05DFD0F1612405A7F',
  },
  {
    key: 'projectile.playerLaser',
    assetId: 'GG-SPRITE-SPRITES-OBJECTS-GG-PLAYER-LASER-V002',
    source: 'assets/sprites/objects/gg_player_laser_v002.png',
    runtime: 'sprites/objects/gg_player_laser_v002.png',
    sha256: 'D89ED695599F72F4980538E6AB89AEE2BFA85A6307A392C9FC08E2BDA38D1E13',
  },
  {
    key: 'projectile.enemyLaser',
    assetId: 'GG-SPRITE-SPRITES-OBJECTS-GG-ENEMY-LASER-V002',
    source: 'assets/sprites/objects/gg_enemy_laser_v002.png',
    runtime: 'sprites/objects/gg_enemy_laser_v002.png',
    sha256: 'C25388AA4C1BAA3123AFCAB5B820718150806749E4AE5F6D8B99331C793578AC',
  },
  {
    key: 'fx.explosionSmall',
    assetId: 'GG-SPRITE-SPRITES-OBJECTS-GG-EXPLOSION-SMALL-V002-SHEET',
    source: 'assets/sprites/objects/gg_explosion_small_v002_sheet.png',
    runtime: 'sprites/objects/gg_explosion_small_v002_sheet.png',
    sha256: '3F8FF2BB76214E234828AB9BE559A21BC5935CC4E6336E558AC35B6380E39049',
  },
  {
    key: 'ui.lifeIcon',
    assetId: 'GG-UI-UI-ICONS-GG-HUD-LIFE-ICON-V002',
    source: 'assets/ui/icons/gg_hud_life_icon_v002.png',
    runtime: 'ui/icons/gg_hud_life_icon_v002.png',
    sha256: '9E0F8607F264ACB9614958D7043C5F69F4A4EBB303D57049203FD481D1EB0408',
  },
  {
    key: 'font.goldDisplay',
    assetId: 'GG-FONT-FONTS-GOLD-DISPLAY-V1-0-GALACTICGUNNERS-GOLD-DISPLAY-FONT-V1-0-PRODUCTION-WEB-GALACTICGUNNERSGOL-2',
    source: 'assets/fonts/gold_display_v1.0/GalacticGunners_Gold_Display_Font_v1.0_PRODUCTION/web/GalacticGunnersGoldDisplay-Regular.woff2',
    runtime: 'fonts/GoldDisplay/GalacticGunnersGoldDisplay-Regular.woff2',
    sha256: '8EF834D1046F7C95F0A257512B33E80030F98BF6E2A21B22B2DC25B774089F4B',
  },
  {
    key: 'font.silverDisplay',
    assetId: 'GG-FONT-FONTS-SILVER-DISPLAY-V1-0-GALACTICGUNNERS-SILVER-DISPLAY-FONT-V1-0-PRODUCTION-WEB-GALACTICGUNNER-2',
    source: 'assets/fonts/silver_display_v1.0/GalacticGunners_Silver_Display_Font_v1.0_PRODUCTION/web/GalacticGunnersSilverDisplay-Regular.woff2',
    runtime: 'fonts/SilverDisplay/GalacticGunnersSilverDisplay-Regular.woff2',
    sha256: '908926163A1455032D9D5D7E11FA6C470204408B56EE65534BBA9FAA8E4762F1',
  },
  {
    key: 'font.hud',
    assetId: 'GG-FONT-FONTS-HUD-V1-0-GALACTICGUNNERSHUD-FONT-V1-0-PRODUCTION-WEB-GALACTICGUNNERSHUD-REGULAR-2',
    source: 'assets/fonts/hud_v1.0/GalacticGunnersHUD_Font_v1.0_PRODUCTION/web/GalacticGunnersHUD-Regular.woff',
    runtime: 'fonts/HUD/GalacticGunnersHUD-Regular.woff',
    sha256: 'F890F251A422B1291516B1D2433AAADCAD7B27A66CD3746AB2538A9B4331D2FD',
  },
  {
    key: 'audio.uiConfirm',
    assetId: 'GG-AUDIO-AUDIO-OWNED-REV2-GG-UI-CONFIRM-V001',
    source: 'assets/audio/owned/rev2/gg_ui_confirm_v001.wav',
    runtime: 'audio/gg_ui_confirm_v001.wav',
    sha256: '5126059176E8D15623C5EFF70DCD8EAF39ED092156E8C5EFA3D55468C5317B93',
  },
  {
    key: 'audio.uiSelect',
    assetId: 'GG-AUDIO-AUDIO-OWNED-REV2-GG-UI-SELECT-V001',
    source: 'assets/audio/owned/rev2/gg_ui_select_v001.wav',
    runtime: 'audio/gg_ui_select_v001.wav',
    sha256: 'BB382B07D808043ECD484DE8F92C154596F7DA95A11DCE60FB770E2862AF0618',
  },
  {
    key: 'audio.playerLaser',
    assetId: 'GG-AUDIO-AUDIO-OWNED-REV2-GG-PLAYER-LASER-V001',
    source: 'assets/audio/owned/rev2/gg_player_laser_v001.wav',
    runtime: 'audio/gg_player_laser_v001.wav',
    sha256: '9EDA7CF68F47E307AB3F7041E1DD59AC5F07E279C32CB1A9C9D3405905247AFF',
  },
  {
    key: 'audio.enemyLaser',
    assetId: 'GG-AUDIO-AUDIO-OWNED-REV2-GG-ENEMY-LASER-V001',
    source: 'assets/audio/owned/rev2/gg_enemy_laser_v001.wav',
    runtime: 'audio/gg_enemy_laser_v001.wav',
    sha256: 'FCE8F2C8853FF92A6EF2F80D9418C11B34F9601B5EFDA385377080999E6D5942',
  },
  {
    key: 'audio.explosionSmall',
    assetId: 'GG-AUDIO-AUDIO-OWNED-REV2-GG-EXPLOSION-SMALL-V001',
    source: 'assets/audio/owned/rev2/gg_explosion_small_v001.wav',
    runtime: 'audio/gg_explosion_small_v001.wav',
    sha256: 'AEFFDB12344846F6207C61F0A70F19F9FDF5835D621745A75BD4707012F94FE4',
  },
  {
    key: 'audio.playerHit',
    assetId: 'GG-AUDIO-AUDIO-OWNED-REV2-GG-PLAYER-HIT-V001',
    source: 'assets/audio/owned/rev2/gg_player_hit_v001.wav',
    runtime: 'audio/gg_player_hit_v001.wav',
    sha256: '049D14BD1353957D2A859FF4F5C56E5B854B6D75B9D136310559CA45810BF311',
  },
];

function sha256(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex').toUpperCase();
}

if (existsSync(outputRoot)) {
  rmSync(outputRoot, { recursive: true, force: true });
}
mkdirSync(outputRoot, { recursive: true });

const manifest = [];
for (const asset of runtimeAssets) {
  const sourcePath = path.join(root, asset.source);
  if (!existsSync(sourcePath)) {
    throw new Error(`Missing canonical asset: ${asset.source}`);
  }
  const actualSha = sha256(sourcePath);
  if (actualSha !== asset.sha256) {
    throw new Error(`Hash mismatch for ${asset.source}: expected ${asset.sha256}, got ${actualSha}`);
  }
  const destinationPath = path.join(outputRoot, asset.runtime);
  mkdirSync(path.dirname(destinationPath), { recursive: true });
  copyFileSync(sourcePath, destinationPath);
  const runtimeSha = sha256(destinationPath);
  if (runtimeSha !== asset.sha256) {
    throw new Error(`Runtime copy hash mismatch for ${asset.runtime}: expected ${asset.sha256}, got ${runtimeSha}`);
  }
  manifest.push({
    key: asset.key,
    asset_id: asset.assetId,
    canonical_path: asset.source.replaceAll(path.sep, '/'),
    canonical_sha256: asset.sha256,
    runtime_path: `/gg-runtime-assets/${asset.runtime.replaceAll(path.sep, '/')}`,
    runtime_sha256: runtimeSha,
  });
}

writeFileSync(
  path.join(outputRoot, 'manifest.json'),
  `${JSON.stringify({ generated_by: 'scripts/sync-runtime-assets.mjs', assets: manifest }, null, 2)}\n`,
);

console.log(`Synced ${manifest.length} canonical Galactic Gunners runtime assets.`);
