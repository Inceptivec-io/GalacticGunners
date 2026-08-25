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

1. PLAYER SCALE
REV3 = REV2 x 0.60, tolerance ±0.05.
Reference 1365x768: approx 52x69.
Preserve aspect ratio.

2. SCOUT SCALE
REV3 = REV2 x 1.05–1.10, target 1.075.
Keep 29x2 = 58.

3. LASERS
Canonical sources are horizontal:
player 1912x823
enemy 1536x1024.

Before ±90 rotation:
local width = beam length
local height = beam thickness.

After rotation:
world width = thickness
world height = length.

Target:
player ~42–58 long / 7–11 thick.
enemy ~38–54 long / 7–11 thick.

Arcade physics body must be explicitly world-axis aligned:
body width = beam thickness
body height = beam length/core.

4. HIT REGISTRATION
Current speeds 760/300 are far above accepted legacy-derived baseline:
player = gameplayHeight/3
enemy = gameplayHeight x 0.078125.

Use accepted baseline or justified measured tuning.
No tunnelling.

MANDATORY REAL TEST:
move player under scout with real controls;
press Space;
shot starts at player;
traverses field;
real hit destroys scout;
score +25.

MANDATORY REAL NEAR MISS:
real player-origin shot misses;
score unchanged.

QA target-adjacent injection is not acceptance proof.

5. BUNKERS
REV2 4/128 is wrong.
Restore 8 bunkers.
32 tiles each.
Initial total 256.

6. BUNKER VERTICAL POSITION
Gap below shield bottom must be 2.0–2.25 NEW player heights.
Player can fly below bunkers.
Spawn clear.

7. NUKES
Restore now.

Accepted:
max=2
N keyboard
Y gamepad
REARM 150/150 initial.

Integrate canonical:
gg_nuke_projectile_v002_sheet.png
gg_nuke_burst_v002_sheet.png
gg_hud_nuke_icon_v002.png
gg_nuke_fire_v001.wav
gg_nuke_burst_v001.wav

InputSystem add nuke.
Use semantic NukeSystem/state.
Count -1 once.
No negative count.
Burst multi-kill resolves each scout once.
Each scout scores normal +25 only.
HUD shows icon/count/REARM live.

8. PAUSE
Restore P.
InputSystem add pause.
Preferred PauseScene overlay.
Freeze physics/timers/projectiles/player/score/lives.
P/resume restores exact state.
Use canonical pause/resume presentation where appropriate.

9. HOSTILE SUITE
Must fail on:
wrong player scale;
wrong scout scale;
squashed lasers;
normal shots not hitting;
missing pause;
missing nukes;
wrong rearm;
wrong bunker count;
wrong shield position.

Required CI:
backend SUCCESS
client-and-game SUCCESS
docker-smoke SUCCESS
runtime-hostile SUCCESS

DO NOT:
Level2
Boss
final GameOver
final Victory
Boarding
auth UI
leaderboard UI
deploy
tag
merge

RETURN:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_010_REV3

PR #4 stays OPEN / DRAFT / NOT MERGED.
RETURN FOR CTO / FOUNDER REVIEW.
