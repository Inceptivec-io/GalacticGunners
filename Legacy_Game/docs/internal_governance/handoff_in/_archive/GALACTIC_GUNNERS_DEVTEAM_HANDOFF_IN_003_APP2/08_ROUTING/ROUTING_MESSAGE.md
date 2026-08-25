HANDOFF / COMMISSION:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_003_APP2

PARENT LINEAGE:
DEVTEAM-003 → APP1 → APP2

PURPOSE:
Correct the remaining Founder-rejected visual/runtime defects:
sprite-sheet misuse, player animation, comet rendering, explosion rendering, playfield scaling, full-viewport background, edge containment, Game Over controls, result routing and final-score consistency.

TARGET:
C:\Users\Michael\dev\GalacticGunners

REMOTE:
https://github.com/Inceptivec-io/GalacticGunners.git

BRANCH:
feature/GG-COM-001

DO NOT CREATE A NEW BRANCH.
DO NOT CREATE A NEW WORKTREE.
DO NOT MERGE.

FIRST:

- read root AGENTS.md;
- git fetch origin;
- verify feature/GG-COM-001;
- verify local HEAD == origin/feature/GG-COM-001;
- verify no uncommitted implementation work;
- record exact APP2 entry HEAD;
- capture current pre-APP2 runtime defect baseline.

If state cannot be reconciled:
STOP — ENTRY_STATE_MISMATCH.

APP2 IS A CORRECTION MOVEMENT, NOT A REDESIGN.

PRESERVE:
- Founder-supplied v002 visual direction;
- APP1 accepted audio;
- locked scoring;
- player damage/lives;
- shield tile destruction;
- comet +500 and +1 nuke;
- current branch/governance;
- Docker preview workflow.

PLAYER SHIP:

Current use is wrong.

Correct it so:
- frame slicing is exact;
- ship stays correctly oriented;
- no crude rotation/cycling artefact;
- animation reads as controlled flashing/activity/thruster life;
- hitbox does not drift between frames;
- no source-sheet bleed.

Do not merely make the frames move.
Make them behave intentionally.

ENEMIES / BOSS:

Verify scout, cruiser, destroyer, mothership, asteroid:
- correct frame dimensions;
- no strip/sheet rendered directly;
- correct origin;
- correct scale;
- intentional activity.

COMET:

Current runtime incorrectly renders multiple comet variants together.

LOCKED RULE:

ONE SPAWN = ONE COMET VARIANT.

At each spawn:
- choose one approved comet variant;
- render only that one;
- one matching collider;
- randomise variant across spawns.

DO NOT render the source strip.
DO NOT use four comets as one object.

Comet gameplay remains:
+500 score
+1 nuke.

EXPLOSIONS:

Current square/block explosions are rejected.

Correct:
- spritesheet slicing;
- frame width/height;
- transparency/alpha;
- animation order;
- scaling;
- fade/cleanup.

Required visual:
rounded/blooming/fading explosion with transparent edges.

NO:
- square tiles;
- black rectangles;
- visible sprite-frame boxes.

Small and large explosions must visibly differ.

PLAYFIELD / SCALE:

Current screen underuses the available space.

Improve:
- player scale;
- enemy scale;
- comet scale;
- explosion scale;
- projectile readability;
- enemy formation placement;
- vertical spacing;
- bunker visual balance.

Materially reduce the large dead middle area.

Do not change gameplay merely to fill space.

FULL VIEWPORT:

Current black cinema-style bars/dead areas are rejected.

The entire visible runtime should feel like one galactic stellar environment.

Correct:
- page/body background;
- canvas scaling;
- Phaser scale mode/container;
- viewport fill;
- resize behaviour.

Required:
FULL_VIEWPORT_STELLAR_COVERAGE = PASS
UNINTENDED_BLACK_BARS = 0

VIEWPORT CONTAINMENT:

Ensure:
- player;
- enemies;
- comets;
- explosions;
- HUD;
- result screens;
- buttons

remain inside intended visual/safe boundaries.

No important UI off-screen.
No page overflow artefacts.
No HUD clipping.

GAME OVER:

Current duplicate control systems are rejected.

The embedded panel buttons are the authoritative visible buttons:

MAIN MENU
REPLAY
TRY AGAIN

REMOVE the separate textual:

RESTART
MENU

Do not show duplicate controls.

Bind real event hit areas to the embedded buttons.

FUNCTION:

MAIN MENU
→ Main menu/title.

REPLAY
→ Direct gameplay restart/replay.
→ MUST NOT go to menu.

TRY AGAIN
→ Direct gameplay restart/re-entry.
→ MUST NOT go to menu.

If Replay and Try Again currently have no meaningful code distinction:
do not invent a new system silently.
Route both to direct gameplay rather than menu and record the semantic consolidation for Founder review.

SCORE CONSISTENCY:

Current result screen shows inconsistent score values.

LOCKED RULE:

ONE AUTHORITATIVE FINAL SCORE.

At result transition:
- freeze final score;
- stop later gameplay callbacks changing it;
- show the same final score everywhere if HUD remains visible.

Preferred:
hide/suppress gameplay HUD beneath result screen and show final score only in the result panel.

NOT ALLOWED:

HUD SCORE != RESULT SCORE

Investigate delayed score mutation from:
- explosion callbacks;
- enemy cleanup;
- collisions;
- timers;
- late rewards.

No silent post-result score mutation.

RESULT SCENES:

Game Over and Victory are runtime states.

Static art is only the visual shell.

Dynamic:
- scores;
- buttons;
- selection;
- state;
- actions

must remain event-driven.

AUDIO:

Preserve APP1 audio integration.
Do not replace accepted audio.

SCORING:

Preserve all locked scoring:

Laser target +5
Asteroid +10
Scout +25
Ship +50
Mothership hit +50
Mothership destroyed +1000
Comet +500
Comet +1 nuke
Enemy hit destroying shield tile -1

Player damage score penalty = NONE.

TEST:

Prove:
- player sprite corrected;
- enemy sheets correct;
- single comet per spawn;
- multiple comet variants observed;
- explosions no longer square;
- alpha/fade correct;
- scale/playfield improved;
- full stellar viewport;
- no black bars;
- no edge overflow;
- Game Over duplicate text buttons removed;
- Main Menu routes to menu;
- Replay routes directly to gameplay;
- Try Again routes directly to gameplay;
- final score consistent;
- APP1 audio preserved;
- scoring preserved;
- no new console/network/asset failures.

DOCKER:

At final exact pushed APP2 HEAD:

cd C:\Users\Michael\dev\GalacticGunners
docker compose down
docker compose up --build -d

Verify:

http://localhost:8027/

Docker MUST be rebuilt from the final pushed APP2 HEAD and left ready for Founder preview.

Capture final screenshots including:

- title;
- Level 1;
- corrected player;
- corrected explosion;
- at least two different comet variants from separate spawns;
- corrected Game Over;
- Victory.

RETURN:

GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_003_APP2

Required final state:

PLAYER_FRAME_SLICING = CORRECT
PLAYER_ROTATION_ARTIFACT = 0
PLAYER_ANIMATION = INTENTIONAL
PLAYER_SCALE = ACCEPTABLE

ENEMY_SHEET_BLEED = 0

COMET_OBJECTS_PER_SPAWN = 1
COMET_VARIANT_RANDOMISATION = PASS
COMET_SHEET_BLEED = 0

VISIBLE_SQUARE_EXPLOSION_BLOCKS = 0
EXPLOSION_ALPHA_ARTIFACTS = 0
SMALL/LARGE_EXPLOSION_DIFFERENTIATION = PASS

FULL_VIEWPORT_STELLAR_COVERAGE = PASS
UNINTENDED_BLACK_BARS = 0
CANVAS_PAGE_SEAM = 0
IMPORTANT_UI_OFFSCREEN = 0
HUD_CLIPPING = 0
PAGE_OVERFLOW_ARTIFACTS = 0

DUPLICATE_TEXT_RESULT_BUTTONS = 0
MAIN_MENU -> MENU = PASS
REPLAY -> DIRECT_GAMEPLAY = PASS
TRY_AGAIN -> DIRECT_GAMEPLAY = PASS

AUTHORITATIVE_FINAL_SCORE_COUNT = 1
POST_RESULT_SCORE_MUTATION = 0
VISIBLE_SCORE_CONTRADICTION = 0

SHIELD_MATRIX = PRESERVED
LOCKED_SCORE_MODEL = PRESERVED
PLAYER_DAMAGE_LOGIC = UNCHANGED
APP1_AUDIO = PRESERVED
SOUND_TOGGLE = PASS

DOCKER_REBUILT = PASS
FOUNDER URL = http://localhost:8027/
DOCKER_HEAD = FINAL PUSHED HEAD

POST_BOX_PAYLOAD = 0
WORKTREE = CLEAN
ALL AUTHORISED WORK = COMMITTED + PUSHED
LOCAL HEAD = REMOTE feature/GG-COM-001 HEAD
ACTIVE_FEATURE_BRANCHES = 1

FOUNDER VISUAL ACCEPTANCE = PENDING
FOUNDER FUNCTIONAL ACCEPTANCE = PENDING
FOUNDER AUDIO-IN-CONTEXT ACCEPTANCE = PENDING

Do not merge.

Founder Michael retains acceptance, PR finalisation and merge authority.
