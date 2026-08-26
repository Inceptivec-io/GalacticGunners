HANDOFF REVISION:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV3

TARGET:
PR #4
feature/v1-level1-vertical-slice

REV3 ENTRY HEAD:
771bf384ae3878e292acf8d7e53dca90576b23b3

STATUS:
CTO QUALITY GATE = REV3 REQUIRED

PRIMARY PRIORITY:
SCALE / GAMEPLAY COMPOSITION.

============================================================
1. PLAYER SCALE
============================================================

REV3 = REV2 x 0.60
tolerance ±0.05.

Founder target:
approximately 40% smaller.

Reference 1365x768:

REV2 approx:
86 x 115

REV3 target:
approx 52 x 69

Preserve sprite aspect ratio.

============================================================
2. SCOUT SCALE
============================================================

REV3 = REV2 x 1.05–1.10

Target:
1.075

Keep:

29 columns
2 rows
58 total enemies

Do not reduce population or spread formation wider to compensate.

============================================================
3. LASER VISUAL ORIENTATION
============================================================

Canonical source images are horizontal:

PLAYER LASER:
1912 x 823

ENEMY LASER:
1536 x 1024

Before ±90 rotation:

local width  = beam LENGTH
local height = beam THICKNESS

After rotation:

world width  = THICKNESS
world height = LENGTH

Current logic is effectively reversed.

Target world appearance:

PLAYER:
42–58 px long
7–11 px thick

ENEMY:
38–54 px long
7–11 px thick

Preserve the source/visible-alpha aspect.

NO SQUASH.

============================================================
4. PHYSICS BODY MUST MATCH ROTATED LASER
============================================================

Phaser Arcade bodies do NOT rotate with the sprite.

Therefore after visual rotation:

body width  = beam/core thickness
body height = beam/core length

Required physics-debug proof:

sprite/core aligned with collider
no hidden oversized body
no sideways collider
no post-resize divergence

============================================================
5. NORMAL LASERS MUST ACTUALLY HIT
============================================================

Current speeds:

player = 760
enemy  = 300

Accepted legacy-derived baseline:

player =
gameplayHeight / 3

enemy =
gameplayHeight x 0.078125

Use those as baseline or justify measured v1 tuning.

No projectile tunnelling.

MANDATORY REAL TEST:

1. Start Level1 normally.
2. Move the REAL player beneath a scout using normal controls.
3. Press SPACE.
4. Laser originates from player weapon/nose.
5. Laser traverses the full normal combat distance.
6. Actual Phaser collision resolves.
7. Scout dies.
8. Score = +25 exactly.

MANDATORY REAL NEAR-MISS:

1. Offset player from scout.
2. Press SPACE.
3. Laser traverses field.
4. Scout remains alive.
5. Score remains unchanged.

Target-adjacent QA spawning is NOT acceptance proof.

If required:
implement a narrow swept-projectile collision system.

Do NOT reintroduce broad invisible hit envelopes.

============================================================
6. BUNKERS
============================================================

REV2 currently:

4 bunkers
128 initial shield tiles

This is wrong.

Accepted Level 1 baseline:

8 bunkers.

Locked matrix per bunker remains.

Expected:

32 active tiles per bunker
x 8
=
256 initial shield tiles

Required:

LEVEL1_BUNKERS = 8
INITIAL_SHIELD_TILES = 256

Update hostile tests accordingly.

============================================================
7. SHIELD VERTICAL POSITION
============================================================

Founder target:

move shield/bunker line slightly closer to the bottom,
while retaining a clear lower flight lane.

Required gap:

shield bottom
→ player movement bottom

=
approximately 2.0–2.25 NEW player ship heights.

Derive this from the new player size.

Do not use arbitrary percentage placement only.

Required:

SHIELD_BOTTOM_GAP_PLAYER_HEIGHTS = 2.0–2.25
PLAYER_SPAWN_CLEAR = PASS
PLAYER_CAN_FLY_BELOW_BUNKERS = PASS

============================================================
8. NUKES — RESTORE NOW
============================================================

Nukes are foundational and currently absent.

Accepted baseline:

MAX NUKES = 2

KEYBOARD:
N

GAMEPAD:
Y

INITIAL REARM:
150/150

Resolve exact canonical asset IDs/hashes for:

gg_nuke_projectile_v002_sheet.png

gg_nuke_burst_v002_sheet.png

gg_hud_nuke_icon_v002.png

gg_nuke_fire_v001.wav

gg_nuke_burst_v001.wav

Only canonical ACTIVE_PRODUCTION /
CLEARED_PROJECT_USE assets.

Extend InputSystem:

nuke

Create semantic NukeSystem or equivalent.

Initial:

currentNukes = 2
maxNukes = 2
rearmProgress = 150
rearmMax = 150

On valid fire:

currentNukes -= 1

rearm resets

canonical nuke projectile

canonical fire audio

canonical nuke burst

canonical burst audio

Nuke count must never become negative.

============================================================
9. NUKE COMBAT
============================================================

Nuke projectile travels forward/up.

On valid detonation:

canonical burst appears.

Burst may destroy multiple scouts.

Each scout:
resolves ONCE
scores normal SCOUT +25 ONCE.

No additional invented nuke score.

No projectile + burst duplicate score.

============================================================
10. NUKE / REARM HUD
============================================================

Display canonical nuke icon.

Display current nuke count.

Display:

REARM current/max

Initial:

2

REARM 150/150

After firing:
count changes;
rearm resets/progresses;
HUD reflects live state.

No fake values.

============================================================
11. PAUSE
============================================================

P currently does nothing.

Restore:

P = PAUSE

InputSystem must expose:

pause

Also support accepted controller pause/start action.

Preferred:

Level1Scene
→ pause
→ PauseScene overlay
→ resume exact Level1 state

Do not rely on the paused Level1 update loop to detect resume.

Use canonical assets where appropriate:

gg_pause_screen_v2.1_4k_uhd_master.png

gg_ui_pause_v002.png

gg_ui_resume_v002.png

Required:

P → PAUSE

physics freezes

enemy timers freeze

projectiles freeze

player freezes

score freezes

lives freeze

P / Resume → exact state resumes

Repeated pause/resume:
no duplicate timers
no duplicate listeners

============================================================
12. HOSTILE SCALE GATES
============================================================

Across viewport matrix:

PLAYER_SCALE_RELATIVE_REV2 =
0.60 ±0.05

SCOUT_SCALE_RELATIVE_REV2 =
1.05–1.10

Also:

no clipping

no aspect distortion

no formation overlap

58 enemies retained

Return screenshots:

LEGACY

REV2

REV3

at equivalent viewport.

============================================================
13. LASER VISUAL REGRESSION
============================================================

CI must fail if:

player laser is wider than long

enemy laser is wider than long

beam is visibly squashed

physics body diverges from visible beam

laser appears as short blob/dash instead of elongated asset

Capture:

player laser mid-flight

enemy laser mid-flight

physics-debug equivalents

============================================================
14. REV3 HOSTILE SUITE
============================================================

Required executable cases:

SCALE:

player 40% smaller

scouts 5–10% larger

58 enemies

8 bunkers

256 shield tiles

shield lower-lane gap =
2.0–2.25 player heights

NORMAL LASERS:

real player-origin direct hit

real player-origin near miss

correct vertical beam aspect

correct body alignment

projectile cleanup

NUKES:

initial count = 2

N fires

gamepad Y path

count decrements once

count never negative

nuke projectile visible

nuke burst visible

multi-kill resolves each scout once

score exact

rearm resets

rearm progresses

HUD matches nuke state

PAUSE:

P pauses

positions freeze

timers freeze

score/lives freeze

resume works

repeat pause/resume clean

RETAIN EXISTING:

four-direction flight

diagonal normalization

player respawn

invulnerability

shield collisions

resize

backend/offline

terminal/menu/replay

console/network clean

============================================================
15. CI
============================================================

Required:

backend = SUCCESS

client-and-game = SUCCESS

docker-smoke = SUCCESS

runtime-hostile = SUCCESS

A build with:

wrong scale

squashed lasers

normal shots not hitting

missing pause

missing nukes

wrong rearm

wrong bunker count

wrong shield position

MUST FAIL CI.

============================================================
16. BOUNDARY
============================================================

DO NOT:

Level2

Boss

final Game Over

final Victory

Boarding

auth UI

leaderboard UI

deploy

tag

merge

============================================================
RETURN
============================================================

RETURN:

GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_010_REV3

Include:

final pushed SHA

REV2→REV3 scale table

viewport scale ratios

laser source dimensions

laser rendered dimensions

laser collider dimensions

real-origin direct-hit trace

real-origin near-miss trace

projectile-speed derivation

8-bunker / 256-tile proof

shield lower-lane ratio

nuke asset IDs/paths/hashes

nuke runtime trace

REARM trace

pause/resume trace

physics-debug screenshots

hostile-suite output

GitHub Actions run/jobs

Founder preview URL

governance debt = 0

Legacy_Game mutation = NO

canonical asset-byte mutation = NO

local HEAD == remote

worktree clean

POST_BOX boundary-only

sealed Handoff-Out SHA-256

PR #4 remains:

OPEN
DRAFT
NOT MERGED

RETURN FOR CTO / FOUNDER REVIEW.