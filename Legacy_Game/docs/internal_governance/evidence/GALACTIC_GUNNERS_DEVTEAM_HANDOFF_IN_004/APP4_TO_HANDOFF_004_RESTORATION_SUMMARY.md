# Handoff 004 Restoration Summary

Handoff: `GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_004`
Entry HEAD: `be5bb36235c8c9ccd81917a3e33b0fbd808581b8`
Branch: `feature/GG-COM-001`

## Runtime Corrections

- Restored source/local-frame Arcade body sizing for player, lasers, enemies, scout, cruiser, mothership, nuke and comet.
- Replaced timer-position projectile movement with Arcade body velocity for player, enemy and mothership lasers.
- Left `updateLasers()` as cleanup/culling only.
- Added explicit cruiser atlas metadata from the Founder source sheet and removed blanket `836 x 941` slicing.
- Preserved populations: Level 1 `58`, Level 2 `87`, Boss regular cruisers `72`.
- Applied completion bonus once per level using `(currentLives + currentNukes + LevelRestart) * 100`.
- Routed Boss completion to the single final `Victory` scene.
- Rebuilt `Victory`, `Titles` and `Paused` surfaces with current typography, no forced transitions and explicit controls.
- Corrected Founder-listed copy defects while preserving Gamma10 story intent.
- Isolated touch firing so UI controls do not also fire gameplay lasers.

## QA Toolchain

- Added pinned npm development QA layer with Playwright, Sharp, pixelmatch/pngjs and ESLint.
- Added `tools/verify_sprite_atlases.js`.
- Added `tools/verify_handoff_004_gameplay_and_surface.js`.
- Added `tools/qa_syntax_check.js` and `tools/qa_all.js`.
- Added `docs/internal_governance/testing/GALACTIC_GUNNERS_QA_TOOLCHAIN.md`.

## Verification

Final `npm run qa:all`: PASS.

Evidence:

- `toolchain/QA_ALL_OUTPUT.txt`
- `toolchain/NPM_AUDIT.json`
- `toolchain/NPM_DEPENDENCY_REPORT.json`
- `toolchain/sprite_atlas_report.json`
- `runtime_playwright/handoff_004_collision_report.json`
- `runtime_playwright/handoff_004_browser_report.json`
- `runtime_playwright/handoff_004_visual_report.json`
- `runtime_playwright/*.png`

Founder acceptance remains `PENDING`.
