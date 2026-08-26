HANDOFF REVISION:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV1

TARGET:
PR #4
feature/v1-level1-vertical-slice

REV1 ENTRY HEAD:
fd7a7e00b6ccd4683e90cff9f41676e19f04517d

STATUS:
CTO QUALITY GATE = REV1 REQUIRED

PURPOSE:
Correct the current playable slice to commercial visual/runtime quality and upgrade assurance so CI can detect visible commercial failures.

DO NOT widen scope beyond the existing Boot/MainMenu/bounded Level1 slice.

BLOCKERS TO FIX:

1. Remove ALL player-facing development terminology:
   LEVEL 1 VERTICAL SLICE
   SLICE COMPLETE
   SLICE FAILED
   REPLAY SLICE
   RETRY SLICE
   and equivalent dev/QA/Handoff copy.

2. Remove unintended black cinema bars/canvas seams.
   Full stellar viewport at representative desktop/tablet/mobile layouts.

3. Integrate relevant approved Founder key art now.
   Use:
   GG-KEYART-KEY-ART-POSTERS-GG-HERO-IMAGE-PLAYER-FIGHTING-V002-4K-UHD-MASTER
   assets/key_art/posters/gg_hero_image_player_fighting_v002_4k_uhd_master.png
   SHA:
   054D150DA322ACCDA4256306DB40B30CC0A098D7B307702C5CCFFA6148A5CE8F
   on landing/main-menu commercial composition where appropriate.
   Do not misuse victory/pause art.

4. Recompose home/main menu to commercial standard.
   No sparse tech-demo presentation.

5. Proper Player/Scout sheet frame handling and intended animation.
   No single static crop where approved animated frames exist.
   No diagonal player.
   No sheet bleed.
   Readable production scale.

6. Make InputSystem the single input authority.
   Level1 must stop direct per-frame device polling/key creation.

7. Remove duplicate collision authority.
   One physically truthful collider model.
   Add direct-hit AND near-miss hostile tests.

8. Replace screenshot-only “hostile sweep” with executable hostile test code.

9. Run playable runtime hostile suite in GitHub Actions.
   Green CI must mean `/play` actually passes.

10. Add deterministic visual regression/composition gate:
    landing
    main menu
    Level1 start
    combat
    mission complete
    mission failed
    plus viewport matrix.

11. Classify every Level1 tuning constant:
    exact legacy-preserved source/value
    OR PROVISIONAL_V1_TUNING.
    No unsupported “preserved behaviour” claims.

12. Commercial screen gate:
    VISUAL_COMPOSITION=COMMERCIAL
    ASSET_UTILISATION=INTENTIONAL
    TYPOGRAPHY=PRODUCTION
    SPACING_SCALE_HIERARCHY=PRODUCTION
    PLAYER_FACING_DEV_TERMS=0
    PROTOTYPE_LOOKING_SURFACES=0
    FULL_STELLAR_VIEWPORT=PASS

REQUIRED CI:

backend SUCCESS
client-and-game SUCCESS
docker-smoke SUCCESS
runtime-hostile SUCCESS

REQUIRED RETURN:

GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_010_REV1

Continue PR #4.
OPEN / DRAFT / NOT MERGED.

DO NOT:
Level2
Boss
final Game Over
final Victory
Boarding
auth UI
leaderboard UI
production deploy
tag
merge

RETURN FOR CTO / FOUNDER REVIEW.
