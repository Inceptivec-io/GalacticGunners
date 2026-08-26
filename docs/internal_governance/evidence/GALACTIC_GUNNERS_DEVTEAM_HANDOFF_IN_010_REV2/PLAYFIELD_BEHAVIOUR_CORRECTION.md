# GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV2 - Playfield Behaviour Correction

Branch: `feature/v1-level1-vertical-slice`

Entry SHA: `6c1964a3148ab7743552c4f608ea8117730b499f`

Inbound transport SHA-256: `93B80D335B13294DC8C6890030020BDB2CD3DA0998B6B09F123F99CF525980CD`

## Corrections

- Added one semantic `PlayfieldLayout` authority for viewport, gameplay rect, HUD safe rect, player spawn, movement bounds, formation bounds, shield zone and runtime scale/body sizes.
- Restored Level1 composition to `29 x 2 = 58` active scouts.
- Restored four-direction player movement for keyboard, touch/pointer and gamepad normalization paths with diagonal speed normalization.
- Implemented player hit/regeneration lifecycle with one-hit/one-life, score delta zero, respawn at approved spawn, input reset, velocity reset, temporary invulnerability and no duplicate/ghost player.
- Restored shield bunkers using canonical `gg_shield_tile_v002.png` in the locked 8x5 matrix, four bunkers, 128 active tiles.
- Corrected enemy formation movement so the 58-enemy wave travels inside a bounded corridor before each controlled drop; the formation no longer rushes to the bottom in 2-3 seconds.
- Preserved the bottom-screen enemy reach rule as terminal game-over.
- Tightened hostile runtime tests for semantic movement bounds, stable formation descent, shields, respawn and projectile collision families.

## Scope Boundaries

- `Legacy_Game` mutation: NO.
- Canonical root `assets/` byte mutation: NO.
- Level2: NOT STARTED.
- Boss: NOT STARTED.
- Final GameOver / final Victory: NOT STARTED.
- Boarding: NOT STARTED.
- Auth UI / leaderboard UI: NOT STARTED.
- Deploy / tag / merge: NOT PERFORMED.

## Evidence

- Runtime hostile report: `docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV2/browser_runtime/runtime-hostile-verification.json`.
- Runtime hostile report SHA-256: `7DA59CCAEBA8F47E36AB5F04A64F4BC5C19FDF81D3A5CD440DE66FBA948B863C`.
- Browser screenshots: `docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV2/browser_runtime/`.

Closure recommendation: PASS TARGET - CTO / Founder review pending.
