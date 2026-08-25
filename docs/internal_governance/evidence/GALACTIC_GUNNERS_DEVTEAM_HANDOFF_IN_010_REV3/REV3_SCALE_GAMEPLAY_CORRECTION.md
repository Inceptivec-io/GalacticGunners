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
| Scout | 32.0 x 29.44 | 34.4 x 31.648 | 1.075 | PASS |
| Player laser world | 19 x 81 | 9 x 52 | corrected rotated length/thickness | PASS |
| Enemy laser world | 19 x 81 | 9 x 52 | corrected rotated length/thickness | PASS |

Viewport scale ratios are recorded in `browser_runtime/runtime-hostile-verification.json` for 1365x768, 1440x900, 1920x1080, 2560x1440, 1024x768 and mobile portrait.

## Laser Source / Runtime Geometry

Player laser source: `1912 x 823`, asset `GG-SPRITE-SPRITES-OBJECTS-GG-PLAYER-LASER-V002`, SHA-256 `D89ED695599F72F4980538E6AB89AEE2BFA85A6307A392C9FC08E2BDA38D1E13`.

Enemy laser source: `1536 x 1024`, asset `GG-SPRITE-SPRITES-OBJECTS-GG-ENEMY-LASER-V002`, SHA-256 `C25388AA4C1BAA3123AFCAB5B820718150806749E4AE5F6D8B99331C793578AC`.

Runtime display uses local horizontal beam length/thickness before rotation. Arcade body is vertical after rotation: width = core thickness, height = core length. Hostile evidence verifies rendered world bounds are taller than wide and collider bodies match the vertical beam.

Projectile speed derivation:

- Player laser: `gameplayRect.height / 3`.
- Enemy laser: `gameplayRect.height * 0.078125`.

## Shields

- Bunkers: 8.
- Matrix per bunker: locked 8 x 5 matrix with 32 active tiles.
- Initial shield tiles: 256.
- Shield bottom gap to player movement bottom: 2.12 new player heights at all tested viewports.

## Nukes

Nuke asset IDs and hashes:

- Projectile: `GG-SPRITE-SPRITES-OBJECTS-GG-NUKE-PROJECTILE-V002-SHEET`, `assets/sprites/objects/gg_nuke_projectile_v002_sheet.png`, SHA-256 `811291512550286B626EA37CEF6EB4135F7B570DE78777FEB26537761883B008`.
- Burst: `GG-SPRITE-SPRITES-OBJECTS-GG-NUKE-BURST-V002-SHEET`, `assets/sprites/objects/gg_nuke_burst_v002_sheet.png`, SHA-256 `0758B63ABB31A3BB164106F180F3E423C2FAFCD98631AB05A3A8855BBC3E1743`.
- HUD icon: `GG-UI-UI-ICONS-GG-HUD-NUKE-ICON-V002`, `assets/ui/icons/gg_hud_nuke_icon_v002.png`, SHA-256 `3D0A6A32EEEC514D7E4BE36B474B5E059347F3C74C5032093D58BA8C3633E08C`.
- Fire audio: `GG-AUDIO-AUDIO-OWNED-REV2-GG-NUKE-FIRE-V001`, `assets/audio/owned/rev2/gg_nuke_fire_v001.wav`, SHA-256 `CDECCACB879343A5D3772EFE6ABF6A514F8E7B2CC5C5486C123D4B8906898E1C`.
- Burst audio: `GG-AUDIO-AUDIO-OWNED-REV2-GG-NUKE-BURST-V001`, `assets/audio/owned/rev2/gg_nuke_burst_v001.wav`, SHA-256 `46E97A344CBCEF9E775B9FCC81B0895858D29E975C32C416C6E3CD91C8DA6D2B`.

Runtime trace:

- Initial nukes: 2/2.
- Initial rearm: 150/150.
- `N` fires one nuke, decrements count once, resets rearm, displays projectile, detonates into canonical burst and applies normal scout +25 scoring once per destroyed scout.
- Count never becomes negative.
- HUD reflects live nuke count and rearm state.
- Gamepad Y action path is mapped and exercised through the hostile QA action bridge.

## Pause

- `P` launches `PauseScene`.
- Level1 sleeps while pause overlay is active.
- Physics, timers, projectiles, score, lives and player position freeze.
- `P` / Resume returns to exact Level1 state.
- Repeated pause/resume does not duplicate listeners or timers in hostile verification.

## Evidence

- Hostile runtime report: `docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV3/browser_runtime/runtime-hostile-verification.json`.
- Hostile runtime report SHA-256: `B2F60C25AF54E3F631155F684CE9CB168BFB30A783513822513AE5CC1D601658`.
- Screenshots include player/enemy laser mid-flight, nuke projectile, nuke burst, pause overlay, viewport matrix, mission complete/failed and active resize.
- Transport receiving record: `docs/internal_governance/handoff_in/_archive/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV3/TRANSPORT_RECEIVING_RECORD.md`.
- Transport member inventory: `docs/internal_governance/handoff_in/_archive/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV3/transport_pack_member_inventory.json`.

Scope exclusions preserved: Level2, Boss, final GameOver, final Victory, Boarding, auth UI, leaderboard UI, deploy, tag and merge were not performed.

Closure recommendation: PASS TARGET - CTO / Founder review pending.
