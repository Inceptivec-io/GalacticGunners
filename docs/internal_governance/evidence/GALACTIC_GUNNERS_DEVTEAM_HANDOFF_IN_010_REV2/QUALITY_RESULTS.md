# GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV2 - Quality Results

Branch: `feature/v1-level1-vertical-slice`

Runtime URL: `http://localhost:3002`

## Local Gates

- `npm run quality`: PASS.
- `docker compose up --build -d`: PASS.
- Focused semantic clamp probe: PASS.
- `GG_RUNTIME_URL=http://localhost:3002 GG_HANDOFF_ID=GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV2 npm run runtime:hostile`: PASS.

## Hostile Runtime Coverage

- HOME -> PLAY -> MENU -> LEVEL1: PASS.
- Level1 enemies `29 x 2 = 58`: PASS.
- Shield zone `128` active tiles: PASS.
- PlayfieldLayout authority: PASS.
- Formation descent does not rush bottom within first 3.2 seconds: PASS.
- Four-direction player movement: PASS.
- Diagonal speed normalization: PASS.
- All-edge semantic clamps: PASS.
- Player laser direct hit: PASS.
- Player laser near miss: PASS.
- Enemy laser direct hit and one-life damage: PASS.
- Enemy laser near miss: PASS.
- Player regeneration, respawn, visibility, body relocation, velocity reset: PASS.
- Life cascade: 0.
- Enemy laser shield hit destroys one tile and score clamps at zero: PASS.
- Player laser shield hit destroys one tile with score zero: PASS.
- Resize recalculates layout and bodies: PASS.
- Projectile cleanup and orientation mapping: PASS.
- Complete/replay/menu and fail/retry/menu: PASS.
- Online game run start/complete/replay: PASS.
- Offline backend playable without fabricated run ID: PASS.
- Unexpected browser console errors: 0.
- Unexpected network failures or HTTP 4xx/5xx: 0.

## Viewport Matrix

PASS: 1365x768, 1440x900, 1920x1080, 2560x1440, 1024x768, mobile portrait.

## Notes

The expected offline backend probe intentionally attempts `http://127.0.0.1:8999/api/v1/game-runs/` and records `ERR_CONNECTION_REFUSED` as expected evidence for offline fallback behavior.
