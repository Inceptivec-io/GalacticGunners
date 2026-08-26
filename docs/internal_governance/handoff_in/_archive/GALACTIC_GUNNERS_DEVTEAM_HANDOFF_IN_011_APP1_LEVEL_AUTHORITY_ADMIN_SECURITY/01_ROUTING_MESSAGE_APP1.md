HANDOFF BOUNDED APPLICATION:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_011_APP1

PROGRAMME:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_011

TARGET:
feature/v1-config-driven-campaign-platform

PURPOSE:
SEAL CURRENT CONFIG FOUNDATION
+
DJANGO LEVEL AUTHORITY
+
VERSIONING / CHECKSUM
+
GAME RUN LEVEL BINDING
+
LEVEL API
+
HIDDEN ADMIN SECURITY BOUNDARY
+
SECURE IMPORT / EXPORT

============================================================
CURRENT STATE
============================================================

VALID RE-ENTRY:

dev / entry authority:
580428e76ae7af80f7e14f11ed3557675acbca9a

branch:
feature/v1-config-driven-campaign-platform

COMPLETED BUT NOT YET SEALED:

v1.1 archived

v1.2 sole current planning pair

LevelDefinition JSON Schema

semantic TypeScript validator

versioned accepted Level 1 config

game:typecheck PASS

contracts:validate PASS

NO COMMIT / PUSH YET

============================================================
FIRST ACTION — CHECKPOINT EXISTING WORK
============================================================

Inspect worktree.

Verify no unrelated changes.

Run:

npm run game:typecheck

npm run contracts:validate

Then COMMIT current completed H011 foundation as one semantic checkpoint.

PUSH.

Verify:

LOCAL HEAD = REMOTE HEAD

Record:

APP1_FOUNDATION_CHECKPOINT_SHA

Then continue APP1.

============================================================
FOUNDER LEVEL 1 LOCK
============================================================

APP1 MUST NOT CHANGE ACCEPTED LEVEL 1 GAMEPLAY PRESENTATION.

NO MATERIAL CHANGE TO:

player size
scout size
formation
8 bunkers / 256 tiles
shield placement
lower flight lane
spawn
HUD
lasers
nukes
pause
respawn
movement bounds
stellar viewport
playfield proportions

Required:

LEVEL1_RUNTIME_FILES_MUTATED_FOR_GAMEPLAY = NO

LEVEL1_TOPOGRAPHY_REGRESSION = 0

LEVEL1_SCALE_REGRESSION = 0

LEVEL1_VISUAL_REGRESSION = 0

============================================================
APP1 BOUNDARY
============================================================

IMPLEMENT NOW:

Django Level

Django LevelVersion

version lifecycle

published immutability

canonical JSON checksum

server-side LevelDefinition validation

semantic validation

performance/bounds validation

GameRun:

level_id
level_version
level_checksum
seed

migrations

OpenAPI/contracts

PUBLIC READ:

GET levels

GET active published level

GET exact historical published version

NO DRAFT LEAKAGE

ADMIN MUTATION API:

create

clone

validate

publish

rollback

archive

import

export

============================================================
HIDDEN ADMIN ROUTE
============================================================

CANONICAL ONLY:

/inceptivec-gamification-admin

APP1 DELIVERS:

secure admin shell

level list

basic metadata/status/version access

NOT full visual designer yet.

NO ALIASES:

/admin

/admin/game/levels

/editor

/level-editor

PUBLIC DISCOVERABILITY = ZERO

NO:

nav link

footer link

profile link

help link

credits link

sitemap entry

public href

public route index

Use:

noindex,nofollow

where applicable.

DO NOT treat route obscurity as authorization.

============================================================
ADMIN RBAC
============================================================

Django identity authority ONLY.

Required:

anonymous admin API = DENIED

normal player admin API = DENIED

authorized admin = PASS

anonymous hidden web route = DENIED

normal player hidden web route = DENIED

authorized admin hidden route = PASS

NO CLIENT-ONLY AUTHORIZATION.

============================================================
IMPORT
============================================================

JSON import:

SIZE LIMIT
→ PARSE
→ JSON SCHEMA
→ SEMANTIC VALIDATION
→ SECURITY VALIDATION
→ CHECKSUM
→ SAVE DRAFT

NEVER AUTO-PUBLISH.

HOSTILE REJECT:

prototype pollution

unknown fields

unsupported schema

invalid entity

invalid bounds

excessive nesting

excessive arrays

script/HTML executable payload

oversized payload

============================================================
VERSIONING
============================================================

DRAFT
→ VALIDATED
→ PUBLISHED

New publish:

old PUBLISHED
→ SUPERSEDED

new VALIDATED
→ PUBLISHED

active_version
→ new version

PUBLISHED CONTENT IMMUTABLE.

Rollback does not rewrite historical content.

============================================================
AUDIT
============================================================

Record:

create

clone

validate

publish

rollback

archive

import

with:

actor
operation
level/version
timestamp
result

Reuse existing audit authority if present.

============================================================
DATABASE ADMISSION
============================================================

Admit ONE governed accepted Level 1 definition to database.

DO NOT create Levels 2–6 in APP1.

============================================================
DO NOT IMPLEMENT YET
============================================================

NO visual drag/drop editor

NO generic CombatLevelScene migration

NO replacement of accepted Level1 runtime

NO bonus/drop runtime

NO generator

NO Levels 2–6

NO Boarding runtime

NO deployment

NO merge

These are later bounded H011 blocks.

============================================================
TESTS
============================================================

Backend:

model lifecycle

published immutability

checksum

validation

publish/supersede

rollback

archive

import/export

RBAC

draft leakage = 0

GameRun level binding

Web:

hidden route absent from public site

anonymous denied

player denied

admin allowed

noindex/nofollow

Hostile import/security suite.

============================================================
QUALITY
============================================================

npm ci PASS

npm run quality PASS

game:typecheck PASS

contracts:validate PASS

web typecheck/build PASS

backend check PASS

migration check PASS

empty DB migrate PASS

pytest PASS

Docker config/build/up PASS

web/API health PASS

CI GREEN

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

GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_011_APP1

Include:

entry SHA

foundation checkpoint SHA

final SHA

planning proof

models/migrations

Level 1 DB record

checksum algorithm

validation proof

GameRun fields

OpenAPI/API

RBAC

hidden route audit

import hostile results

audit evidence

tests

Docker

CI

Level 1 gameplay mutation = NO

governance debt = 0

PR

local == remote

clean worktree

POST_BOX boundary-only

sealed SHA-256

DO NOT MERGE.

STOP AFTER APP1 RETURN.
