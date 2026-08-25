# GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV3 - Scale / Gameplay Correction

Branch: `feature/v1-level1-vertical-slice`

Entry SHA: `771bf384ae3878e292acf8d7e53dca90576b23b3`

Direct commission SHA-256: `7CD02D0795B26EE9BE90659E407980221AB7C2C56E0CD8E6ECDA590E56195B9D`

Transport pack SHA-256: `2A73CE8AD99B36600E942916731D3BBED58C1BFCD205147A6528A36B230D3912`

Transport disposition: PASS - ZIP transport was hashed, inventoried, unpacked into governed handoff-in archive as inspectable files, and removed from POST_BOX.

## REV2 -> REV3 Scale Table

| Surface | REV2 1365x768 | REV3 1365x768 | Ratio | Status |
|---|---:|---:|---:|---|
| Player | 86.4 x 115.2 | 51.84 x 69.12 | 0.600 | PASS |
| Scout | playfield-width contract | 39.409 x 36.257 | exact expected width at 1365x768 | PASS |
| Player laser world | 19 x 81 | 9 x 52 | corrected rotated length/thickness | PASS |
| Enemy laser world | 19 x 81 | 9 x 52 | corrected rotated length/thickness | PASS |

Viewport scale and layout contract values are recorded in `browser_runtime/runtime-hostile-verification.json` for 1365x768, 1440x900, 1920x1080, 2560x1440, 1024x768 and mobile portrait.

## Laser Source / Runtime Geometry

Player laser source: `1912 x 823`, asset `GG-SPRITE-SPRITES-OBJECTS-GG-PLAYER-LASER-V002`, SHA-256 `D89ED695599F72F4980538E6AB89AEE2BFA85A6307A392C9FC08E2BDA38D1E13`.

Enemy laser source: `1536 x 1024`, asset `GG-SPRITE-SPRITES-OBJECTS-GG-ENEMY-LASER-V002`, SHA-256 `C25388AA4C1BAA3123AFCAB5B820718150806749E4AE5F6D8B99331C793578AC`.

Runtime display uses local horizontal beam length/thickness before rotation. Arcade body is vertical after rotation: width = core thickness, height = core length. Hostile evidence verifies rendered world bounds are taller than wide and collider bodies match the vertical beam. Projectile and ship bodies use widened meaningful visual envelopes, and the runtime adds swept laser collision checks so frame-step movement cannot skip player/scout/shield targets.

Projectile speed authority:

- Player laser: `LEVEL_ONE_SLICE.playerLaserSpeed = 760`.
- Enemy laser: `LEVEL_ONE_SLICE.enemyLaserSpeed = 300`.

## Shields

- Bunkers: 8.
- Matrix per bunker: locked 8 x 5 matrix with 32 active tiles.
- Initial shield tiles: 256.
- Shield bottom gap to player movement bottom: 1.18 new player heights at all tested viewports, aligning the base-tile band with the lower legacy-game topology.
- Enemy/player shield hits create owned explosion feedback and leave a dark impact scar after tile removal.

## Nukes

Nuke asset IDs and hashes:

- Projectile: `GG-SPRITE-SPRITES-OBJECTS-GG-NUKE-PROJECTILE-V002-SHEET`, `assets/sprites/objects/gg_nuke_projectile_v002_horizontal_upright.png`, SHA-256 `3B826087AD38EB6963046260EC384B9507C80E450DFAA3B302B923875B8B21AA`.
- Burst: `GG-SPRITE-SPRITES-OBJECTS-GG-NUKE-BURST-V002-SHEET`, `assets/sprites/objects/gg_nuke_burst_v002_horizontal.png`, SHA-256 `F9E47B6D3875778217620FE0FDDACAA515405D377900BA5F7F2D1271F0A96C53`.
- HUD icon: `GG-UI-UI-ICONS-GG-HUD-NUKE-ICON-V002`, `assets/ui/icons/gg_hud_nuke_icon_v002.png`, SHA-256 `3D0A6A32EEEC514D7E4BE36B474B5E059347F3C74C5032093D58BA8C3633E08C`.
- Fire audio: `GG-AUDIO-AUDIO-OWNED-REV2-GG-NUKE-FIRE-V001`, `assets/audio/owned/rev2/gg_nuke_fire_v001.wav`, SHA-256 `CDECCACB879343A5D3772EFE6ABF6A514F8E7B2CC5C5486C123D4B8906898E1C`.
- Burst audio: `GG-AUDIO-AUDIO-OWNED-REV2-GG-NUKE-BURST-V001`, `assets/audio/owned/rev2/gg_nuke_burst_v001.wav`, SHA-256 `46E97A344CBCEF9E775B9FCC81B0895858D29E975C32C416C6E3CD91C8DA6D2B`.

Runtime trace:

- Initial nukes: two visible nuke icons positioned bottom-right, immediately left of the `ENERGISE` bar.
- Initial rearm: full fixed `ENERGISE` bar positioned bottom-right to the right of the nuke icons.
- `N` fires one nuke, decrements count once, resets rearm, displays projectile, detonates into canonical burst and applies normal scout +25 scoring once per destroyed scout.
- Count never becomes negative.
- HUD reflects live nuke count through icon pips only; no visible numeric nuke counter is rendered.
- `ENERGISE` bar reflects rearm state without numeric `REARM` text, and the fill is left-anchored.
- Gamepad Y action path is mapped and exercised through the hostile QA action bridge.

## Founder Review Corrections

- Lives render as three owned ship icon pips only, 15% larger than the previous HUD icon; no visible numeric life counter is rendered.
- Nukes render as owned nuke icon pips only, 15% larger than the previous HUD icon; no visible numeric nuke counter is rendered.
- Nuke pips and the fixed `ENERGISE` bar render as a bottom-right group, with pips growing left of the bar.
- Enemy laser hostile verification covers left, center and right player-body lanes plus a near-miss lane.
- Score remains top-left and sound/mute icon remains top-right.
- Scout ships are rotated to the correct enemy orientation.
- Explosion, nuke projectile and nuke burst runtime sheets use the owned horizontal/upright sheets to avoid boxed/clipped animation.
- Player damage respawn is state-driven and clears active enemy projectiles on hit to prevent life-cascade damage during regeneration.

## Pause

- `P` launches `PauseScene`.
- Level1 sleeps while pause overlay is active.
- Physics, timers, projectiles, score, lives and player position freeze.
- `P` / Resume returns to exact Level1 state.
- Repeated pause/resume does not duplicate listeners or timers in hostile verification.

## Evidence

- Hostile runtime report: `docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV3/browser_runtime/runtime-hostile-verification.json`.
- Hostile runtime report SHA-256: `420124D7B32D17CA86E314500D11EFBA3138CFFA7A6CADBC4419E27DE739CD1F`.
- Screenshots include player/enemy laser mid-flight, nuke projectile, nuke burst, pause overlay, viewport matrix, mission complete/failed and active resize.
- Transport receiving record: `docs/internal_governance/handoff_in/_archive/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV3/TRANSPORT_RECEIVING_RECORD.md`.
- Transport member inventory: `docs/internal_governance/handoff_in/_archive/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV3/transport_pack_member_inventory.json`.

Scope exclusions preserved: Level2, Boss, final GameOver, final Victory, Boarding, auth UI, leaderboard UI, deploy, tag and merge were not performed.

Closure recommendation: PASS TARGET - CTO / Founder review pending.
