HANDOFF REVISION / RE-ENTRY:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_011_REV1

PREVIOUS RETURN:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_011
STATUS:
STOP - ENTRY_GATE_NOT_SATISFIED

THAT STOP WAS CORRECT.

THE BLOCKING CONDITION IS NOW CLOSED.

============================================================
VERIFIED MERGE / SOURCE AUTHORITY
============================================================

PR #4:
MERGED

MERGE COMMIT / CURRENT dev:

580428e76ae7af80f7e14f11ed3557675acbca9a

ACCEPTED H010 FEATURE HEAD INCLUDED:

3598fea39a94e7641b699b51b1e3be91bd7af42e

HANDOFF 010:
CLOSED / PASS

FOUNDER ACCEPTANCE:
PASS

CTO FINAL GATE:
PASS

REMOTE HOSTILE CI:
PASS

============================================================
EXECUTION BRANCH
============================================================

feature/v1-config-driven-campaign-platform

This branch has been created from EXACT:

580428e76ae7af80f7e14f11ed3557675acbca9a

FIRST VERIFY:

branch =
feature/v1-config-driven-campaign-platform

entry HEAD =
580428e76ae7af80f7e14f11ed3557675acbca9a

dev =
580428e76ae7af80f7e14f11ed3557675acbca9a

worktree clean

POST_BOX known/controlled

If mismatch:

STOP — SOURCE_STATE_MISMATCH

============================================================
FIRST EXECUTABLE MOVEMENT:
PLANNING CURRENTNESS
============================================================

Current dev still has v1.1 live.

Before campaign-platform implementation:

ARCHIVE UNCHANGED:

GALACTIC_GUNNERS_MASTER_ROADMAP_v1.1.md
→
docs/internal_governance/planning/_archive/v1.1/GALACTIC_GUNNERS_MASTER_ROADMAP_v1.1.md

GALACTIC_GUNNERS_MASTER_PLAYLIST_v1.1.md
→
docs/internal_governance/planning/_archive/v1.1/GALACTIC_GUNNERS_MASTER_PLAYLIST_v1.1.md

ADMIT AS SOLE CURRENT:

docs/internal_governance/planning/GALACTIC_GUNNERS_MASTER_ROADMAP_v1.2.md

docs/internal_governance/planning/GALACTIC_GUNNERS_MASTER_PLAYLIST_v1.2.md

Use the Founder-supplied v1.2 pair already issued.

VERIFY:

CURRENT ROADMAP COUNT = 1
CURRENT PLAYLIST COUNT = 1

CURRENT ROADMAP = v1.2
CURRENT PLAYLIST = v1.2

v1.1 ARCHIVED = PASS
v1.1 CONTENT PRESERVED = PASS

OTHER LIVE PLANNING OBJECTS = 0

ONLY THEN CONTINUE.

============================================================
FOUNDER GOLDEN LOCK — LEVEL 1
============================================================

DO NOT MATERIALly CHANGE ACCEPTED LEVEL 1:

player scale

scout scale

29 x 2 = 58 enemies

formation topology / placement

8 bunkers

256 tiles

bunker spacing

bunker vertical position

lower flight lane

player spawn

movement bounds

HUD

laser visual scale

laser collision mapping

nuke HUD / rearm presentation

pause

respawn

full stellar viewport

playfield proportions

REQUIRED:

LEVEL1_TOPOGRAPHY_REGRESSION = 0

LEVEL1_SCALE_REGRESSION = 0

LEVEL1_VISUAL_REGRESSION = 0

LEVEL1_BEHAVIOUR_REGRESSION = 0

The generic LevelDefinition migration must reproduce this accepted state.

============================================================
CONTINUE ORIGINAL HANDOFF 011 IN FULL
============================================================

IMPLEMENT:

LevelDefinition JSON Schema

semantic registries

semantic validation

CombatLevelScene

LevelLoader

LevelRuntimeConfig

accepted Level 1 as versioned config

old/new Level 1 golden parity test

Django Level

Django LevelVersion

published-version immutability

GameRun:

level_id
level_version
level_checksum
seed

level read/admin API

HIDDEN ADMIN ROUTE ONLY:

/inceptivec-gamification-admin

NO:

/admin
/admin/game/levels
/editor
/level-editor

or public aliases.

PUBLIC ADMIN DISCOVERABILITY = ZERO.

NO:

navigation link
footer link
profile link
help link
credits link
site-search entry
sitemap entry
public route index
public HTML href

NOINDEX / NOFOLLOW where applicable.

DO NOT rely on URL secrecy for security.

DIRECT ADMIN ROUTE:

anonymous = DENIED
normal player = DENIED
authorized admin = PASS

ADMIN API:
server-side RBAC required.

============================================================
ADMIN LEVEL DESIGNER
============================================================

Provide:

level list

create

clone

2D gameplay canvas

grid / snap

entity palette

drag / drop

property inspector

layers

validation panel

same-runtime preview

save draft

version

publish

rollback

archive

JSON import

JSON export

generate draft

Layers:

background
player spawn
enemies
shields
hazards
bonuses
boarding
safe-area guides

============================================================
CONFIG-DRIVEN GAME
============================================================

Ordinary new combat levels MUST NOT require duplicated Phaser scene code.

TARGET:

CombatLevelScene
→ LevelLoader
→ Validated LevelDefinition
→ LevelRuntimeConfig
→ LevelVersion

Config includes:

player spawn

enemy type / placement / formation

shield bunkers / tile matrix

hazards

waves

objectives

bonus rules

drop tables

future BoardingAnchor

themes

difficulty

performance budget

checksum / seed

DECLARATIVE ONLY.

NO arbitrary executable code.

============================================================
BONUS / DROP
============================================================

Initial pickups:

NUKE
LIFE

Support:

hidden bonus behind destroyed object

seeded ship drop

visible eject/jump from destroyed ship

collection

caps

no duplicate award

deterministic event outcome

============================================================
PROCEDURAL GENERATOR
============================================================

Generate LevelDefinition DRAFT only.

Inputs:

seed

difficulty

allowed entity registry

enemy budget

shield constraints

hazards

bonus/drop constraints

future boarding-anchor constraints

performance budget

Then:

schema validate

semantic validate

performance validate

hostile simulate

preview

admin approval

AUTO-PUBLISH = NO

============================================================
SIX CAMPAIGN DRAFTS
============================================================

Create:

Level 1
Level 2
Level 3
Level 4
Level 5
Level 6

Level 1:
EXACT ACCEPTED H010 DENOMINATOR.

Levels 2–6:
config-driven,
valid,
playable,
Founder-preview drafts.

Do not fake unsupported mechanics.

============================================================
OFFLINE
============================================================

Package six definitions.

Published remote definition:

validate
→ cache
→ use

Backend unavailable:

validated cache
OR packaged fallback

Invalid remote:

REJECT
→ fallback

============================================================
HOSTILE ASSURANCE
============================================================

Required:

runtime-hostile PASS

level-definition-hostile PASS

admin-hostile PASS

import-hostile PASS

generator-hostile PASS

Level 1 golden-regression PASS

security injection tests PASS

anonymous admin denial PASS

normal-player admin denial PASS

public admin-route references = 0

GitHub Actions GREEN

GOVERNANCE_DEBT_COUNT = 0

============================================================
PR
============================================================

HEAD:

feature/v1-config-driven-campaign-platform

BASE:

dev

TITLE:

Build Galactic Gunners config-driven campaign and level authoring platform

OPEN / DRAFT / NOT MERGED

============================================================
RETURN
============================================================

RETURN:

GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_011_REV1

Include original H011 evidence PLUS:

exact entry dev SHA

branch creation proof

v1.1 archive hashes/inventory

v1.2 live hashes/inventory

current Roadmap count = 1

current Playlist count = 1

Level 1 golden topology/scale proof

Level 1 zero-regression proof

final pushed SHA

all hostile suites

GitHub Actions

PR URL/state

local == remote

clean worktree

POST_BOX boundary-only

sealed return SHA-256

DO NOT MERGE.

RETURN FOR CTO / FOUNDER REVIEW.
