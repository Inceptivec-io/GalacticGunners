# GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV3 - Quality Results

Branch: `feature/v1-level1-vertical-slice`

Runtime URL: `http://localhost:3002`

## Local Gates

- `npm run quality`: PASS.
- `docker compose up --build -d`: PASS.
- `GG_RUNTIME_URL=http://localhost:3002 GG_HANDOFF_ID=GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV3 npm run runtime:hostile`: PASS.

## Hostile Runtime Coverage

- REV3 player scale relative to REV2: 0.600 across viewport matrix.
- REV3 scout width: matches expected playfield-width contract across viewport matrix.
- 58 enemies retained.
- 8 bunkers and 256 initial shield tiles.
- Shield lower-lane gap: 1.18 new player heights, matching lower legacy-game base-tile topology.
- Real-origin player laser direct hit: PASS.
- Real-origin player laser near miss: PASS.
- Player/enemy laser visual/body mapping, widened body envelopes and swept collision checks: PASS.
- Enemy laser left/center/right player-body lane hits: PASS.
- Icon-only lives HUD, icon-only nuke HUD, bottom-right nuke pips growing left of the fixed `ENERGISE` rearm bar, and sound top-right: PASS.
- Correct scout orientation: PASS.
- Nuke initial icons, `N` fire, gamepad Y action path, upright projectile, unclipped burst, score exactness, non-negative count, bottom-right `ENERGISE` bar and HUD: PASS.
- Shield-hit explosion/scar feedback and unclipped small explosion animation: PASS.
- Pause/resume freeze and repeat cleanliness: PASS.
- Retained movement, diagonal normalization, respawn, shield collision, resize, terminal/menu/replay, online/offline backend and console/network checks: PASS.
- Unexpected browser console errors: 0.
- Unexpected network failures or HTTP 4xx/5xx: 0.

Expected offline backend probe intentionally records `ERR_CONNECTION_REFUSED` against `127.0.0.1:8999` as offline fallback evidence.
