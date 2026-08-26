TWO-STAGE ROUTING — NO IDLE GAP

============================================================
STAGE 1 — CLOSE CURRENT HOTFIX
============================================================

TARGET:
feature/v1-config-driven-campaign-platform

REMOTE HEAD VERIFIED:

e4c4c87ddd1aae6a416b52703075ef2dede5e045

VERIFY:

LOCAL HEAD =
e4c4c87ddd1aae6a416b52703075ef2dede5e045

REMOTE HEAD =
e4c4c87ddd1aae6a416b52703075ef2dede5e045

LOCAL == REMOTE = PASS
WORKTREE = CLEAN

POST_BOX:
BOUNDARY.md
README.md
ONLY

Run exact-head:

npm run game:typecheck
npm run quality
docker compose config
docker compose up --build -d
web/API health
GG_RUNTIME_URL=http://localhost:3002 npm run runtime:hostile

Verify:

PLAYER LASER VISIBLE = PASS
PLAYER LASER REAL HIT = PASS
POOLED BODY ALIGNMENT = PASS
FALSE LEFT-BUNKER DAMAGE = 0
FULL-SCREEN MOVEMENT BOUNDS = PASS
ACCEPTED 50% PLAYER SPEED = PRESERVED
ACCEPTED EQUAL LASER SPEEDS = PRESERVED
PAUSE = PASS
NUKE PROJECTILE/BURST = PASS
ENERGISE = COOLDOWN-ONLY
ZERO-AMMO BLOCK = PASS

Open DRAFT PR:

feature/v1-config-driven-campaign-platform
→ dev

Wait for CI GREEN.

Return:

GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_011_APP1_HOTFIX1_CLOSURE

DO NOT MERGE.

============================================================
STAGE 2 — IMMEDIATELY AFTER FOUNDER MERGE
============================================================

USE:

GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_012_CAMPAIGN_PLATFORM_FORMATION_PACK.zip

SHA-256:

09d36c279035990e004ac5204b46e8ccac495954bcfb73f1501620a5f8caf4e8

AFTER MERGE:

git fetch origin
git switch dev
git pull --ff-only origin dev

RECORD:

H012_ENTRY_SHA = exact dev HEAD

Then:

git switch feature/v1-config-driven-campaign-platform
git merge --ff-only origin/dev
git push origin feature/v1-config-driven-campaign-platform

VERIFY:

dev = H012_ENTRY_SHA
local feature = H012_ENTRY_SHA
remote feature = H012_ENTRY_SHA
worktree clean

If mismatch:
STOP.
NO REBASE.
NO FORCE.
NO RESET.

THEN START H012 IMMEDIATELY.

GATE A:
CONTENT/BACKEND AUTHORITY

GATE B:
GENERIC CONFIG-DRIVEN RUNTIME + LEVEL 1 GOLDEN PARITY

GATE C:
HIDDEN /inceptivec-gamification-admin DESIGNER

GATE D:
NUKE/LIFE DROPS + GENERATOR + LEVELS 1–6

GATE E:
HOSTILE / DOCKER / CI / GOVERNANCE

Do not regress corrected Level 1:
laser spawn/body alignment
laser visibility/hits
bunker collision correctness
movement
player speed
laser speeds
pause
nukes
ENERGISE
zero-ammo rule
topography/sizing

RETURN:

GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_012

OPEN / DRAFT / NOT MERGED.
