HANDOFF:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_012

ACTION:
EXECUTE NOW

POST_BOX PACKAGE:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_012_EXECUTE_NOW.zip

WORKING BRANCH:
feature/v1-config-driven-campaign-platform

============================================================
START
============================================================

git fetch origin
git switch feature/v1-config-driven-campaign-platform
git status --short

IF WORKTREE CLEAN:

git merge --ff-only origin/feature/v1-config-driven-campaign-platform

RECORD CURRENT HEAD AS:

H012_ENTRY_SHA

LOCAL-BEHIND-REMOTE = RECONCILE AND CONTINUE
NEW POST_BOX ZIP = INGEST AND CONTINUE
NO PRIOR HASH = NOT A BLOCKER
NO PRIOR REGISTRATION = NOT A BLOCKER

DO NOT EXECUTE ROUTING FROM THE OLDER H012/HOTFIX ZIPs.

THIS PACKAGE SUPERSEDES THEM FOR EXECUTION.

============================================================
ENVIRONMENT FILES
============================================================

COPY LOCALLY FROM:

LOCAL_ENVIRONMENT_FILES/env.feature
LOCAL_ENVIRONMENT_FILES/env.dev
LOCAL_ENVIRONMENT_FILES/env.stage

TO REPOSITORY ROOT.

DO NOT COMMIT.
DO NOT ARCHIVE THEIR CONTENTS.
DO NOT PRINT PASSWORDS IN EVIDENCE.

============================================================
GATE A
============================================================

COMPLETE:

Level
LevelVersion
immutable published versions
canonical checksum
server-side LevelDefinition validation
GameRun level/version/checksum/seed binding
public level APIs
admin APIs
Django RBAC
secure import/export
audit
accepted Level 1 DB admission
migrations
OpenAPI
tests

COMMIT
PUSH
RECORD H012_GATE_A_SHA
CONTINUE

============================================================
GATE B
============================================================

COMPLETE:

CombatLevelScene
LevelLoader
LevelRuntimeConfig
LevelValidator
LevelChecksum
semantic registries
remote/cache/package resolver
accepted Level 1 config migration

MANDATORY:

LEVEL1_TOPOGRAPHY_REGRESSION = 0
LEVEL1_SCALE_REGRESSION = 0
LEVEL1_BEHAVIOUR_REGRESSION = 0
LEVEL1_VISUAL_REGRESSION = 0

PRESERVE CURRENT ACCEPTED:

58 enemies
8 bunkers / 256 tiles
player/scout scale
movement bounds
laser visibility
projectile/body alignment
correct bunker collision
player/laser speeds
pause
nukes
Energise
zero-ammo behavior
respawn
HUD
stellar viewport

COMMIT
PUSH
RECORD H012_GATE_B_SHA
CONTINUE

============================================================
GATE C
============================================================

BUILD HIDDEN ADMIN DESIGNER ONLY AT:

/inceptivec-gamification-admin

REQUIRE DJANGO AUTH/RBAC.

PUBLIC DISCOVERABILITY = 0.

BUILD:

level list
create/clone
2D canvas
grid/snap/zoom
drag/drop
player spawn
enemy placement
formation editor
bunkers/shield matrix
hazards
bonus hosts
drop tables
dormant BoardingAnchor
inspector
layers
validation
performance budget
same-runtime preview
save/validate/publish/rollback/archive
import/export
generate draft

COMMIT
PUSH
RECORD H012_GATE_C_SHA
CONTINUE

============================================================
GATE D
============================================================

IMPLEMENT:

NUKE pickup
LIFE pickup
hidden bonus hosts
seeded weighted drops
pickup ejection
collection/caps
duplicate-award prevention
deterministic RNG
procedural DRAFT generator
NO AUTO-PUBLISH

CREATE MEANINGFUL CONFIG-DRIVEN:

Level 1
Level 2
Level 3
Level 4
Level 5
Level 6

NO DUPLICATED LevelN SCENES.
NO FAKE UNSUPPORTED MECHANICS.

COMMIT
PUSH
RECORD H012_GATE_D_SHA
CONTINUE

============================================================
GATE E
============================================================

RUN:

backend tests
client/game tests
contracts
runtime-hostile
level-definition-hostile
admin-hostile
generator-hostile
security/import-hostile
offline fallback
six-level runtime validation
Level 1 golden viewport matrix
Docker full stack
GitHub CI

GOVERNANCE_DEBT_COUNT = 0

OPEN DRAFT PR:

feature/v1-config-driven-campaign-platform
→ dev

TITLE:

Build Galactic Gunners config-driven campaign and level authoring platform

============================================================
STOP ONLY FOR REAL FAILURE
============================================================

STOP ONLY FOR:

unexplained dirty worktree
non-fast-forward divergence
real authority conflict
failed required assurance/security
data-loss/destructive uncertainty
unresolvable implementation/spec contradiction

DO NOT STOP FOR ROUTINE SYNCHRONIZATION OR POST_BOX HOUSEKEEPING.

============================================================
RETURN
============================================================

GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_012

INCLUDE:

H012_ENTRY_SHA
H012_GATE_A_SHA
H012_GATE_B_SHA
H012_GATE_C_SHA
H012_GATE_D_SHA
H012_FINAL_SHA
models/migrations/schema/API
Level 1 parity
admin designer
RBAC/non-discoverability
import/export
drop/generator
Levels 1-6
offline
hostile
Docker
CI
PR
governance debt
local == remote
clean worktree
POST_BOX boundary-only

DO NOT MERGE.

START NOW.
