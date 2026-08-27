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
    key: 'enemy.cruiser',
    assetId: 'GG-SPRITE-SPRITES-SHIPS-GG-ENEMY-CRUISER-V002-SHEET',
    source: 'assets/sprites/ships/gg_enemy_cruiser_v002_sheet.png',
    runtime: 'sprites/ships/gg_enemy_cruiser_v002_sheet.png',
    sha256: '05DA611A926239711E2310EDCDC1D3C4AF06497D5B96E70761D5102B9D402AE3',
  },
  {
    key: 'enemy.destroyer',
    assetId: 'GG-SPRITE-SPRITES-SHIPS-GG-ENEMY-DESTROYER-V002-SHEET',
    source: 'assets/sprites/ships/gg_enemy_destroyer_v002_sheet.png',
    runtime: 'sprites/ships/gg_enemy_destroyer_v002_sheet.png',
    sha256: '7E0BA8F3763EE030E6BB23B6D7999E28E8F23A86A73564A1580FBD74D538D88C',
  },
  {
    key: 'enemy.mothership',
    assetId: 'GG-SPRITE-SPRITES-SHIPS-GG-BOSS-MOTHERSHIP-NORMAL-V002-SHEET',
    source: 'assets/sprites/ships/gg_boss_mothership_normal_v002_sheet.png',
    runtime: 'sprites/ships/gg_boss_mothership_normal_v002_sheet.png',
    sha256: '5B49D62BE022A2633388BF0F8465CCEDA9A215D678AFBFC5A26E82931DF2974A',
  },
  {
    key: 'enemy.mothership.hit',
    assetId: 'GG-SPRITE-SPRITES-SHIPS-GG-BOSS-MOTHERSHIP-HIT-V002-SHEET',
    source: 'assets/sprites/ships/gg_boss_mothership_HIT_v002_sheet.png',
    runtime: 'sprites/ships/gg_boss_mothership_HIT_v002_sheet.png',
    sha256: 'E829B094078363F051F41929F48E92C3288B98E2CD43425E8A0309B52B989088',
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
    key: 'projectile.nuke',
    assetId: 'GG-SPRITE-SPRITES-OBJECTS-GG-NUKE-PROJECTILE-V002-SHEET',
    source: 'assets/sprites/objects/gg_nuke_projectile_v002_horizontal_upright.png',
    runtime: 'sprites/objects/gg_nuke_projectile_v002_horizontal_upright.png',
    sha256: '3B826087AD38EB6963046260EC384B9507C80E450DFAA3B302B923875B8B21AA',
  },
  {
    key: 'fx.asteroid',
    assetId: 'GG-SPRITE-SPRITES-OBJECTS-GG-ASTEROID-V002-SHEET',
    source: 'assets/sprites/objects/gg_asteroid_v002_sheet.png',
    runtime: 'sprites/objects/gg_asteroid_v002_sheet.png',
    sha256: '0421BFD58EA30608ADF8E0E684B22419F63F6C57DFCC06B59594BE6947625D01',
  },
  {
    key: 'fx.comet',
    assetId: 'GG-SPRITE-SPRITES-OBJECTS-GG-COMET-V002-HORIZONTAL-VERTICAL-FACING',
    source: 'assets/sprites/objects/gg_comet_v002_horizontal_vertical_facing.png',
    runtime: 'sprites/objects/gg_comet_v002_horizontal_vertical_facing.png',
    sha256: 'B9EB2BD211F9A922707CCEEA4E1EB4EAA5B1205249E38D6BBECB76DFBA33978F',
  },
  {
    key: 'shield.tile',
    assetId: 'GG-SPRITE-SPRITES-OBJECTS-GG-SHIELD-TILE-V002',
    source: 'assets/sprites/objects/gg_shield_tile_v002.png',
    runtime: 'sprites/objects/gg_shield_tile_v002.png',
    sha256: 'ECE44E993871F2A474215BDAD8DEC6C5097861F487AF66D685FA1DA2A44402B3',
  },
  {
    key: 'fx.explosionSmall',
    assetId: 'GG-SPRITE-SPRITES-OBJECTS-GG-EXPLOSION-SMALL-V002-SHEET',
    source: 'assets/sprites/objects/gg_explosion_small_v002_horizontal.png',
    runtime: 'sprites/objects/gg_explosion_small_v002_horizontal.png',
    sha256: '895ECEAFF03C8390A3F17FA9D829B7B86A6D0AE0B4D73BBA3CD2D2A267D569CC',
  },
  {
    key: 'fx.nukeBurst',
    assetId: 'GG-SPRITE-SPRITES-OBJECTS-GG-NUKE-BURST-V002-SHEET',
    source: 'assets/sprites/objects/gg_nuke_burst_v002_horizontal.png',
    runtime: 'sprites/objects/gg_nuke_burst_v002_horizontal.png',
    sha256: 'F9E47B6D3875778217620FE0FDDACAA515405D377900BA5F7F2D1271F0A96C53',
  },
  {
    key: 'ui.lifeIcon',
    assetId: 'GG-UI-UI-ICONS-GG-HUD-LIFE-ICON-V002',
    source: 'assets/ui/icons/gg_hud_life_icon_v002.png',
    runtime: 'ui/icons/gg_hud_life_icon_v002.png',
    sha256: '9E0F8607F264ACB9614958D7043C5F69F4A4EBB303D57049203FD481D1EB0408',
  },
  {
    key: 'ui.victoryPanel',
    assetId: 'GG-UI-PANELS-GG-VICTORY-PANEL-V002-NO-VALUES',
    source: 'assets/ui/panels/gg_victory_panel_v002_no_values.png',
    runtime: 'ui/panels/gg_victory_panel_v002_no_values.png',
    sha256: '026305F7C0BC39F161A878E2B52F48953686FCCE67EB65043A001D5A2BA38214',
  },
  {
    key: 'ui.gameOverPanel',
    assetId: 'GG-UI-PANELS-GG-GAME-OVER-PANEL-V002',
    source: 'assets/ui/panels/gg_game_over_panel_v002.png',
    runtime: 'ui/panels/gg_game_over_panel_v002.png',
    sha256: '270826BE7EB07F9D8D6DFD9CE13BC69F7ACB192DCF28133DC69EC0FB60DB888A',
  },
  {
    key: 'ui.mainMenuOff',
    assetId: 'GG-UI-BUTTONS-GG-BUTTON-MAIN-MENU-V002-OFF',
    source: 'assets/ui/buttons/gg_button_main_menu_v002_off.png',
    runtime: 'ui/buttons/gg_button_main_menu_v002_off.png',
    sha256: 'A0A4191E8648FAD316BF7D0FB8A3A5A9460C77693A1DBC240A0B42ED6F969459',
  },
  {
    key: 'ui.mainMenuOnclick',
    assetId: 'GG-UI-BUTTONS-GG-BUTTON-MAIN-MENU-V002-ONCLICK',
    source: 'assets/ui/buttons/gg_button_main_menu_v002_onclick.png',
    runtime: 'ui/buttons/gg_button_main_menu_v002_onclick.png',
    sha256: '89B557B7C42A18CA67F6828B74F1BCBBFA201167BF70CB6521C6BBCED5907A4B',
  },
  {
    key: 'ui.replayOff',
    assetId: 'GG-UI-BUTTONS-GG-BUTTON-REPLAY-V002-OFF',
    source: 'assets/ui/buttons/gg_button_replay_v002_off.png',
    runtime: 'ui/buttons/gg_button_replay_v002_off.png',
    sha256: 'D8FA75ADFCB9FC96CD347DC3E83FE63CD2444C49EADE703D23308FA17D12D54B',
  },
  {
    key: 'ui.replayOnclick',
    assetId: 'GG-UI-BUTTONS-GG-BUTTON-REPLAY-V002-ONCLICK',
    source: 'assets/ui/buttons/gg_button_replay_v002_onclick.png',
    runtime: 'ui/buttons/gg_button_replay_v002_onclick.png',
    sha256: '3F6FE051DC570C0256701C87DDFDF08D80C5B8A07A3081990095A557DA47FA89',
  },
  {
    key: 'ui.tryAgainOff',
    assetId: 'GG-UI-BUTTONS-GG-BUTTON-TRY-AGAIN-V002-OFF',
    source: 'assets/ui/buttons/gg_button_try_again_v002_off.png',
    runtime: 'ui/buttons/gg_button_try_again_v002_off.png',
    sha256: '7621274A675DEE712BBCAD833C6CBAC46869A09DF0B97654F21AF9CF8C4C75E6',
  },
  {
    key: 'ui.tryAgainOnclick',
    assetId: 'GG-UI-BUTTONS-GG-BUTTON-TRY-AGAIN-V002-ONCLICK',
    source: 'assets/ui/buttons/gg_button_try_again_v002_onclick.png',
    runtime: 'ui/buttons/gg_button_try_again_v002_onclick.png',
    sha256: '075772B2DA331FDECEF9B4F4636082EBC67220E0B2D81C8C3394EB559DA67E6E',
  },
  {
    key: 'ui.nukeIcon',
    assetId: 'GG-UI-UI-ICONS-GG-HUD-NUKE-ICON-V002',
    source: 'assets/ui/icons/gg_hud_nuke_icon_v002.png',
    runtime: 'ui/icons/gg_hud_nuke_icon_v002.png',
    sha256: '3D0A6A32EEEC514D7E4BE36B474B5E059347F3C74C5032093D58BA8C3633E08C',
  },
  {
    key: 'ui.pauseIcon',
    assetId: 'GG-UI-UI-ICONS-GG-UI-PAUSE-V002',
    source: 'assets/ui/icons/gg_ui_pause_v002.png',
    runtime: 'ui/icons/gg_ui_pause_v002.png',
    sha256: 'E2ECCAAB8AF581266AA849322B067304C1BBC0A419D795A34A906090492EA9EA',
  },
  {
    key: 'ui.soundOn',
    assetId: 'GG-UI-UI-ICONS-GG-UI-SOUND-ON-V002',
    source: 'assets/ui/icons/gg_ui_sound_on_v002.png',
    runtime: 'ui/icons/gg_ui_sound_on_v002.png',
    sha256: 'AD65B1C61E0ECA378C3A29DFCB3F7D9FB7AC1D0120104E6C17448D35B1C47D5D',
  },
  {
    key: 'ui.soundOff',
    assetId: 'GG-UI-UI-ICONS-GG-UI-SOUND-OFF-V002',
    source: 'assets/ui/icons/gg_ui_sound_off_v002.png',
    runtime: 'ui/icons/gg_ui_sound_off_v002.png',
    sha256: '9CC310E201C728B5ACC8F4B05E4E8FE3D1A1440F1EF9160190DBAF6CEC678E43',
  },
  {
    key: 'pause.screen',
    assetId: 'GG-KEYART-KEY-ART-POSTERS-GG-PAUSE-SCREEN-V2-1-4K-UHD-MASTER',
    source: 'assets/key_art/posters/gg_pause_screen_v2.1_4k_uhd_master.png',
    runtime: 'key_art/gg_pause_screen_v2.1_4k_uhd_master.png',
    sha256: '751008091C1144B657A54EE3B8EBD47C9B3823EFFB679420D5F96E39E7438937',
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
  {
    key: 'audio.nukeFire',
    assetId: 'GG-AUDIO-AUDIO-OWNED-REV2-GG-NUKE-FIRE-V001',
    source: 'assets/audio/owned/rev2/gg_nuke_fire_v001.wav',
    runtime: 'audio/gg_nuke_fire_v001.wav',
    sha256: 'CDECCACB879343A5D3772EFE6ABF6A514F8E7B2CC5C5486C123D4B8906898E1C',
  },
  {
    key: 'audio.nukeBurst',
    assetId: 'GG-AUDIO-AUDIO-OWNED-REV2-GG-NUKE-BURST-V001',
    source: 'assets/audio/owned/rev2/gg_nuke_burst_v001.wav',
    runtime: 'audio/gg_nuke_burst_v001.wav',
    sha256: '46E97A344CBCEF9E775B9FCC81B0895858D29E975C32C416C6E3CD91C8DA6D2B',
  },
];

const h014Matrix = path.join(root, 'docs', 'internal_governance', 'handoff_in', '_archive', 'GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_014', 'GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_014_BOARDING_MODE_PLATFORM_IMPLEMENTATION', 'registers', 'H014_ASSET_USE_MATRIX.csv');
if (existsSync(h014Matrix)) {
  const lines = readFileSync(h014Matrix, 'utf8').trim().split(/\r?\n/).slice(1);
  for (const line of lines) {
    const values = [...line.matchAll(/"([^"]*)"/g)].map((match) => match[1]);
    const [source, destination, sha256, admission] = values;
    if (admission !== 'active' || !destination.startsWith('assets/boarding/') || !/^[a-f0-9]{64}$/i.test(sha256)) continue;
    runtimeAssets.push({
      key: `boarding.${path.basename(destination, path.extname(destination))}`,
      assetId: source,
      source: destination,
      runtime: destination.replace(/^assets\//, 'boarding/'),
      sha256: sha256.toUpperCase(),
    });
  }
}

for (const kind of ['player', 'alien']) {
  for (let index = 1; index <= (kind === 'player' ? 7 : 6); index += 1) {
    const name = `${kind}_${String(index).padStart(3, '0')}_v001.png`;
    const source = `assets/boarding/characters/${name}`;
    runtimeAssets.push({ key: `boarding.character.${kind}.${index}`, assetId: `H014-normalized-${kind}-${index}`, source, runtime: `boarding/characters/${name}`, sha256: sha256(path.join(root, source)) });
  }
}

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
