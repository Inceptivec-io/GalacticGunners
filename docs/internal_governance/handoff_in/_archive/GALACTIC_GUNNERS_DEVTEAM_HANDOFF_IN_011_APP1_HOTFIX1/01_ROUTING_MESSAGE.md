URGENT BOUNDED HOTFIX:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_011_APP1_HOTFIX1

TARGET:
feature/v1-config-driven-campaign-platform

ENTRY:
ac60eb016543b11cb28bdf4f57c6385625901ebb

STATUS:
APP1 BLOCK 2 = PAUSED

FOUNDER-OBSERVED DEFECT:

Pressing FIRE produces no correctly visible player laser and removes left-side bunker tiles.

============================================================
ROOT CAUSE
============================================================

The player laser is pooled.

Current flow requests/repositions the pooled sprite but re-enables the Arcade body without explicitly resetting that recycled body to the NEW spawn coordinate.

Swept collision then trusts stale body/previous-body coordinates.

Result:

VISIBLE SPAWN != PHYSICS SPAWN

and collisions can resolve against the wrong left-side shield.

============================================================
FIX
============================================================

For EVERY pooled projectile activation:

obtain object

setPosition(current spawn x,y)

set active/visible

set orientation/visual size

enable body

body.reset(current x,y)

set final WORLD-AXIS collider size

set previousBodyCenterX/Y FROM RESET BODY

clear spent/resolved state

apply velocity

Apply to:

PLAYER LASERS

ENEMY LASERS

NUKES

Do NOT rely on group.get(x,y,texture) to synchronize recycled body state.

============================================================
DO NOT CHANGE
============================================================

player scale

scout scale

58-enemy topology

8 bunkers

256 tiles

shield placement

laser visual dimensions

laser speeds

HUD

nukes presentation

pause

respawn

Level 1 topology

NO wider collider workaround.

============================================================
MANDATORY HOSTILE TESTS
============================================================

NORMAL INPUT — LEFT:

move player left
Space
visible laser exists
sprite X = player X
body X = sprite X
no unrelated shield loss

NORMAL INPUT — CENTRE:

same

NORMAL INPUT — RIGHT:

same

DELIBERATE SHIELD HIT:

place player beneath known shield tile
Space
only actual intersected tile destroyed
left bunker unaffected unless physically targeted

CLEAR GAP SHOT:

player under gap / aligned scout
Space
shield loss = 0
scout destroyed
score +25

POOL REUSE:

20+ fire/expire/reuse cycles
vary left/centre/right

each activation:

body center = current sprite center
previous-body center = reset body center

STALE PROJECTILE BODY = 0

NUKE REUSE:

different X positions
body follows actual nuke spawn

============================================================
DEBUG
============================================================

Use physics debug.

Return screenshots:

left laser

centre laser

right laser

deliberate shield hit

clear gap shot

nuke

show sprite/body alignment.

============================================================
QUALITY
============================================================

game:typecheck PASS

npm run quality PASS

runtime-hostile PASS

New spawn/body assertions must be part of runtime-hostile.

============================================================
RETURN
============================================================

Commit/push this hotfix only.

RETURN:

GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_011_APP1_HOTFIX1

Include:

entry SHA

final SHA

exact root cause

changed files

spawn/body invariant

left/centre/right results

shield-hit result

gap-shot result

20-cycle recycle result

nuke recycle result

physics debug evidence

runtime-hostile result

local == remote

worktree clean

Level 1 scale/topography mutation = NO

STOP AFTER HOTFIX.

DO NOT RESUME APP1 BLOCK 2 UNTIL CTO/FOUNDER GATE.
