HANDOFF / LARGE BOUNDED SPRINT:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_012

NAME:
CAMPAIGN PLATFORM FORMATION SPRINT

TARGET:
feature/v1-config-driven-campaign-platform

ENTRY:
ONLY AFTER H011 APP1 HOTFIX1 CTO PASS

THIS IS A LARGE DELIVERY BLOCK.

EXPECTED OUTPUT:
A USABLE CONFIG-DRIVEN CAMPAIGN PLATFORM END-TO-END.

============================================================
GATE A — CONTENT AUTHORITY
============================================================

Implement:

Django Level
Django LevelVersion
immutable published versions
canonical JSON SHA-256
server LevelDefinition validation
GameRun level/version/checksum/seed
public published-level API
admin mutation API
RBAC
secure import/export
audit
accepted Level1 DB admission

COMMIT/PUSH
record H012_GATE_A_SHA

============================================================
GATE B — GENERIC GAME RUNTIME
============================================================

Implement:

CombatLevelScene
LevelLoader
LevelRuntimeConfig
semantic registries
remote/cache/package level resolver

Migrate accepted Level1 into config.

Golden compare accepted old runtime vs config runtime.

MUST PASS:

LEVEL1_TOPOGRAPHY_REGRESSION=0
LEVEL1_SCALE_REGRESSION=0
LEVEL1_BEHAVIOUR_REGRESSION=0
LEVEL1_VISUAL_REGRESSION=0

Do NOT build duplicated Level2Scene..Level6Scene.

COMMIT/PUSH
record H012_GATE_B_SHA

============================================================
GATE C — HIDDEN ADMIN DESIGNER
============================================================

ONLY ROUTE:

/inceptivec-gamification-admin

NO PUBLIC LINKS
NO SITEMAP
NO PUBLIC ALIASES
NOINDEX/NOFOLLOW
AUTH + ADMIN RBAC

Build:

level list
create/clone
2D playfield canvas
grid/snap
drag/drop
player spawn
enemy placement
formation editor
bunkers
shield matrix
hazards
bonus hosts
drop tables
dormant BoardingAnchor
inspector
layers
validation
performance budget
same-runtime preview
save/publish/rollback/archive
import/export
generate draft

COMMIT/PUSH
record H012_GATE_C_SHA

============================================================
GATE D — REPLAYABILITY / SIX LEVELS
============================================================

Implement:

NUKE pickup
LIFE pickup
seeded weighted drops
visible ejection/jump
collection
caps
no duplicate awards
deterministic RNG

Procedural generator:
DRAFT ONLY
NO AUTO-PUBLISH

Create meaningful config-driven:

Level1 exact accepted denominator
Level2 escalation
Level3 mixed fleet where supported
Level4 hazards/rewards/boarding metadata
Level5 elite assault
Level6 finale where supported

Do not fake unsupported mechanics.
Return exact blockers.

COMMIT/PUSH
record H012_GATE_D_SHA

============================================================
GATE E — HARDEN
============================================================

Run:

backend tests
client/game tests
contracts
runtime-hostile
level-definition-hostile
admin-hostile
generator-hostile
security/import hostile
offline fallback matrix
Level1 golden viewport matrix
Docker full stack
GitHub CI

GOVERNANCE_DEBT_COUNT=0

Open DRAFT PR:

head:
feature/v1-config-driven-campaign-platform

base:
dev

title:
Build Galactic Gunners config-driven campaign and level authoring platform

DO NOT MERGE.

============================================================
RETURN
============================================================

RETURN:

GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_012

Include:

H012_ENTRY_SHA
H012_GATE_A_SHA
H012_GATE_B_SHA
H012_GATE_C_SHA
H012_GATE_D_SHA
H012_FINAL_SHA

all models
migrations
schema
OpenAPI
Level1 golden parity
admin designer evidence
RBAC/non-discoverability
import/export
drop system
generator
Levels1-6 inventory/status
offline evidence
all hostile results
Docker
CI
PR
governance debt=0
local==remote
clean worktree
POST_BOX boundary-only
sealed SHA-256

RETURN FOR CTO / FOUNDER REVIEW.
