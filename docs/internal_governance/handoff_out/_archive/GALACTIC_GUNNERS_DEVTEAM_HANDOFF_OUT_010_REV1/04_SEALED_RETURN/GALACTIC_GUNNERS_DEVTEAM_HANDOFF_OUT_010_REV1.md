# GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_010_REV1

Handoff In: GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV1
Branch: feature/v1-level1-vertical-slice
Entry SHA: fd7a7e00b6ccd4683e90cff9f41676e19f04517d
PR: #4
Merge status: DO NOT MERGE - Founder only
Founder acceptance: PENDING

## Closure Summary

REV1 commercial runtime quality gate correction is complete for the bounded Boot/MainMenu/Level1 slice.

Corrected:

- player-facing development terminology removed from visible DOM/Phaser text;
- full viewport Phaser runtime implemented with `Scale.RESIZE`;
- Founder hero key art admitted to deterministic runtime asset sync and used on landing/menu;
- main menu upgraded to production copy/composition using approved assets and fonts;
- player/scout named frame rectangles and animations implemented;
- Level1 gameplay consumes normalized `InputSystem` actions;
- Level1 direct device polling removed;
- manual broad projectile collision envelope removed;
- one Arcade body collision authority retained;
- body sizes corrected to visible world-pixel silhouettes/projectile cores;
- executable hostile runtime and visual/composition suite added;
- GitHub Actions `runtime-hostile` gate added.

## Key Art Authority

Asset ID:
GG-KEYART-KEY-ART-POSTERS-GG-HERO-IMAGE-PLAYER-FIGHTING-V002-4K-UHD-MASTER

Canonical path:
`assets/key_art/posters/gg_hero_image_player_fighting_v002_4k_uhd_master.png`

SHA-256:
054D150DA322ACCDA4256306DB40B30CC0A098D7B307702C5CCFFA6148A5CE8F

Runtime path:
`/gg-runtime-assets/key_art/gg_hero_image_player_fighting_v002_4k_uhd_master.png`

## Verification Summary

Local gates:

- `npm ci`: PASS
- `npm run quality`: PASS
- `docker compose up --build -d`: PASS
- backend container `manage.py check`: PASS
- backend container migration check: PASS
- backend container migrate: PASS
- backend container pytest: PASS, 11/11
- `GG_RUNTIME_URL=http://localhost:3002 npm run runtime:hostile`: PASS

Hostile runtime PASS includes:

- HOME -> PLAY -> MENU -> LEVEL1;
- COMPLETE -> REPLAY;
- COMPLETE -> MAIN MENU;
- FAIL -> RETRY;
- FAIL -> MAIN MENU;
- replay reset / no stale projectiles;
- direct hit / near miss;
- exact score and life damage;
- damage cooldown;
- online start/complete/replay run behavior;
- offline backend playable without fabricated run ID;
- keyboard/pointer/touch/gamepad normalization path;
- unexpected console errors 0;
- unexpected network failures 0.

Viewport matrix PASS:
1365x768, 1440x900, 1920x1080, 2560x1440, 1024x768, mobile portrait.

## Evidence Locations

- `docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV1/DEFECT_MATRIX.md`
- `docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV1/FRAME_GEOMETRY_AND_ANIMATION.md`
- `docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV1/INPUT_COLLISION_ARCHITECTURE.md`
- `docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV1/TUNING_PROVENANCE.md`
- `docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV1/QUALITY_RESULTS.md`
- `docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV1/browser_runtime/`
- `docs/internal_governance/handoff_in/_archive/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV1/`

## Boundary And Scope

POST_BOX: boundary controls only after intake.
Transport ZIP preserved in repository: NO.
Root asset byte mutation: NO.
Legacy_Game mutation: NO.
Full Level1: NOT CLAIMED.
Level2/Boss/final GameOver/final Victory/Boarding/auth/leaderboard/deploy/tag/merge: NOT STARTED.

## Final Push Fields

Final pushed HEAD:
Recorded externally after final push to avoid a Git self-reference loop.

Local HEAD == origin/feature/v1-level1-vertical-slice:
Recorded externally after final push.

Worktree clean:
Recorded externally after final push.

GitHub Actions:
To be recorded externally after push; required jobs are backend, client-and-game, docker-smoke and runtime-hostile.
