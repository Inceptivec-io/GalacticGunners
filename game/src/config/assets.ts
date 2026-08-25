export interface RuntimeAsset {
  key: string;
  assetId: string;
  canonicalPath: string;
  sha256: string;
  runtimePath: string;
}

export const RUNTIME_ASSETS = {
  background: {
    starfield: {
      key: 'background.starfield',
      assetId: 'GG-BACKGROUND-BACKGROUNDS-OWNED-GG-BG-STARFIELD-V002',
      canonicalPath: 'assets/backgrounds/owned/gg_bg_starfield_v002.png',
      sha256: '25BBB12578B10E5AD6E77593656DF3CE8FFD72A15EEABADA8134ED76390301C2',
      runtimePath: '/gg-runtime-assets/backgrounds/gg_bg_starfield_v002.png',
    },
  },
  branding: {
    primaryLogo: {
      key: 'branding.primaryLogo',
      assetId: 'GG-BRAND-BRANDING-LOGOS-GG-LOGO-PRIMARY-V002',
      canonicalPath: 'assets/branding/logos/gg_logo_primary_v002.png',
      sha256: '4815BCBF0325CEBC0DE9B61F4CADBD87D6C791EF54F4B537CF2DA196221AAB76',
      runtimePath: '/gg-runtime-assets/branding/gg_logo_primary_v002.png',
    },
  },
  player: {
    ship: {
      key: 'player.ship',
      assetId: 'GG-SPRITE-SPRITES-SHIPS-GG-PLAYER-SHIP-V002-SHEET',
      canonicalPath: 'assets/sprites/ships/gg_player_ship_v002_sheet.png',
      sha256: 'A3E2EDBDEE85B312AD1766EE00C5A5438F60ABF9DFCD006B2BD8474012DDFF38',
      runtimePath: '/gg-runtime-assets/sprites/ships/gg_player_ship_v002_sheet.png',
    },
  },
  enemy: {
    scout: {
      key: 'enemy.scout',
      assetId: 'GG-SPRITE-SPRITES-SHIPS-GG-ENEMY-SCOUT-V002-SHEET',
      canonicalPath: 'assets/sprites/ships/gg_enemy_scout_v002_sheet.png',
      sha256: 'FBB60A9EB52346CB57CDF22FA1B6088DD24B08F9132540B05DFD0F1612405A7F',
      runtimePath: '/gg-runtime-assets/sprites/ships/gg_enemy_scout_v002_sheet.png',
    },
  },
  projectile: {
    playerLaser: {
      key: 'projectile.playerLaser',
      assetId: 'GG-SPRITE-SPRITES-OBJECTS-GG-PLAYER-LASER-V002',
      canonicalPath: 'assets/sprites/objects/gg_player_laser_v002.png',
      sha256: 'D89ED695599F72F4980538E6AB89AEE2BFA85A6307A392C9FC08E2BDA38D1E13',
      runtimePath: '/gg-runtime-assets/sprites/objects/gg_player_laser_v002.png',
    },
    enemyLaser: {
      key: 'projectile.enemyLaser',
      assetId: 'GG-SPRITE-SPRITES-OBJECTS-GG-ENEMY-LASER-V002',
      canonicalPath: 'assets/sprites/objects/gg_enemy_laser_v002.png',
      sha256: 'C25388AA4C1BAA3123AFCAB5B820718150806749E4AE5F6D8B99331C793578AC',
      runtimePath: '/gg-runtime-assets/sprites/objects/gg_enemy_laser_v002.png',
    },
  },
  fx: {
    explosionSmall: {
      key: 'fx.explosionSmall',
      assetId: 'GG-SPRITE-SPRITES-OBJECTS-GG-EXPLOSION-SMALL-V002-SHEET',
      canonicalPath: 'assets/sprites/objects/gg_explosion_small_v002_sheet.png',
      sha256: '3F8FF2BB76214E234828AB9BE559A21BC5935CC4E6336E558AC35B6380E39049',
      runtimePath: '/gg-runtime-assets/sprites/objects/gg_explosion_small_v002_sheet.png',
    },
  },
  ui: {
    lifeIcon: {
      key: 'ui.lifeIcon',
      assetId: 'GG-UI-UI-ICONS-GG-HUD-LIFE-ICON-V002',
      canonicalPath: 'assets/ui/icons/gg_hud_life_icon_v002.png',
      sha256: '9E0F8607F264ACB9614958D7043C5F69F4A4EBB303D57049203FD481D1EB0408',
      runtimePath: '/gg-runtime-assets/ui/icons/gg_hud_life_icon_v002.png',
    },
  },
  audio: {
    uiConfirm: {
      key: 'audio.uiConfirm',
      assetId: 'GG-AUDIO-AUDIO-OWNED-REV2-GG-UI-CONFIRM-V001',
      canonicalPath: 'assets/audio/owned/rev2/gg_ui_confirm_v001.wav',
      sha256: '5126059176E8D15623C5EFF70DCD8EAF39ED092156E8C5EFA3D55468C5317B93',
      runtimePath: '/gg-runtime-assets/audio/gg_ui_confirm_v001.wav',
    },
    uiSelect: {
      key: 'audio.uiSelect',
      assetId: 'GG-AUDIO-AUDIO-OWNED-REV2-GG-UI-SELECT-V001',
      canonicalPath: 'assets/audio/owned/rev2/gg_ui_select_v001.wav',
      sha256: 'BB382B07D808043ECD484DE8F92C154596F7DA95A11DCE60FB770E2862AF0618',
      runtimePath: '/gg-runtime-assets/audio/gg_ui_select_v001.wav',
    },
    playerLaser: {
      key: 'audio.playerLaser',
      assetId: 'GG-AUDIO-AUDIO-OWNED-REV2-GG-PLAYER-LASER-V001',
      canonicalPath: 'assets/audio/owned/rev2/gg_player_laser_v001.wav',
      sha256: '9EDA7CF68F47E307AB3F7041E1DD59AC5F07E279C32CB1A9C9D3405905247AFF',
      runtimePath: '/gg-runtime-assets/audio/gg_player_laser_v001.wav',
    },
    enemyLaser: {
      key: 'audio.enemyLaser',
      assetId: 'GG-AUDIO-AUDIO-OWNED-REV2-GG-ENEMY-LASER-V001',
      canonicalPath: 'assets/audio/owned/rev2/gg_enemy_laser_v001.wav',
      sha256: 'FCE8F2C8853FF92A6EF2F80D9418C11B34F9601B5EFDA385377080999E6D5942',
      runtimePath: '/gg-runtime-assets/audio/gg_enemy_laser_v001.wav',
    },
    explosionSmall: {
      key: 'audio.explosionSmall',
      assetId: 'GG-AUDIO-AUDIO-OWNED-REV2-GG-EXPLOSION-SMALL-V001',
      canonicalPath: 'assets/audio/owned/rev2/gg_explosion_small_v001.wav',
      sha256: 'AEFFDB12344846F6207C61F0A70F19F9FDF5835D621745A75BD4707012F94FE4',
      runtimePath: '/gg-runtime-assets/audio/gg_explosion_small_v001.wav',
    },
    playerHit: {
      key: 'audio.playerHit',
      assetId: 'GG-AUDIO-AUDIO-OWNED-REV2-GG-PLAYER-HIT-V001',
      canonicalPath: 'assets/audio/owned/rev2/gg_player_hit_v001.wav',
      sha256: '049D14BD1353957D2A859FF4F5C56E5B854B6D75B9D136310559CA45810BF311',
      runtimePath: '/gg-runtime-assets/audio/gg_player_hit_v001.wav',
    },
  },
} as const;

export const REQUIRED_RUNTIME_ASSETS: RuntimeAsset[] = [
  RUNTIME_ASSETS.background.starfield,
  RUNTIME_ASSETS.branding.primaryLogo,
  RUNTIME_ASSETS.player.ship,
  RUNTIME_ASSETS.enemy.scout,
  RUNTIME_ASSETS.projectile.playerLaser,
  RUNTIME_ASSETS.projectile.enemyLaser,
  RUNTIME_ASSETS.fx.explosionSmall,
  RUNTIME_ASSETS.ui.lifeIcon,
  RUNTIME_ASSETS.audio.uiConfirm,
  RUNTIME_ASSETS.audio.uiSelect,
  RUNTIME_ASSETS.audio.playerLaser,
  RUNTIME_ASSETS.audio.enemyLaser,
  RUNTIME_ASSETS.audio.explosionSmall,
  RUNTIME_ASSETS.audio.playerHit,
];

export const FRAME_RECTS = {
  playerStable: { x: 0, y: 0, width: 543, height: 724 },
  scoutStable: { x: 0, y: 0, width: 480, height: 793 },
  explosionSmall: { frameWidth: 493, frameHeight: 797, endFrame: 3 },
} as const;
