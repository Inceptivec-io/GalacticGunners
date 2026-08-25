# GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV1 Defect Matrix

Date: 2026-08-25
Branch: feature/v1-level1-vertical-slice
Entry SHA: fd7a7e00b6ccd4683e90cff9f41676e19f04517d

| Defect | Before | Correction | Evidence | Result |
|---|---|---|---|---|
| Player-facing development terminology | Main menu and terminal states exposed "vertical slice" copy. | Replaced with production copy: "DEFEND THE GALAXY", "MISSION CLEARED", "MISSION FAILED", "PLAY AGAIN", "TRY AGAIN". | `browser_runtime/runtime-hostile-verification.json` banned term assertion. | PASS |
| Letterboxed Phaser viewport | `Scale.FIT` centered a fixed 1280x720 canvas. | Runtime now uses `Scale.RESIZE`; scenes lay out from `scale.width`/`scale.height`. | Viewport matrix screenshots and geometry assertions. | PASS |
| Founder hero key art absent | Landing/menu used sparse starfield/logo. | Added `GG-KEYART-KEY-ART-POSTERS-GG-HERO-IMAGE-PLAYER-FIGHTING-V002-4K-UHD-MASTER` to sync manifest and landing/menu runtime. | Manifest and visual matrix. | PASS |
| Player/scout crop fidelity | Cropped static physics images with no intended animation. | Registered explicit named frame rectangles and animated player/scout sprites. | `FRAME_GEOMETRY_AND_ANIMATION.md`; runtime QA frame names. | PASS |
| Direct device polling in Level1 | Scene called keyboard/gamepad APIs directly in update. | Level1 consumes `InputSystem.actions`; device binding occurs once in `InputSystem`. | Source audit; runtime hostile input path. | PASS |
| Mixed collision authorities | Arcade overlap plus manual broad collision envelope. | Manual envelope removed; one Arcade overlap/body model. | Direct/near-miss hostile cases. | PASS |
| Texture-coordinate body offsets | Bodies used offsets from source sheet coordinates. | Bodies are centered and scaled to meaningful visible silhouette/projectile dimensions. | QA body evidence in runtime JSON. | PASS |
| Screenshot-only assurance | Prior suite did not prove hostile semantics. | Playwright hostile/composition suite added and wired to CI as `runtime-hostile`. | `scripts/verify-v1-slice-runtime.mjs`; `.github/workflows/quality.yml`. | PASS |

Asset-byte mutation: root `assets/` canonical bytes were not modified.
Legacy_Game mutation: none.
Founder acceptance: PENDING.
