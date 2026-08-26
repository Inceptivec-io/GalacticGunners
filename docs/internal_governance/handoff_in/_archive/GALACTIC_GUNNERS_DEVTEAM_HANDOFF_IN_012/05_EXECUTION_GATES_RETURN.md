# EXECUTION GATES / RETURN

## Gate A — Content authority

Complete:
Level
LevelVersion
lifecycle
checksum
server validation
GameRun binding
public/admin APIs
RBAC
import/export
audit
Level1 DB admission

Commit/push:
H012_GATE_A_SHA

## Gate B — Generic runtime

Complete:
LevelLoader
LevelRuntimeConfig
registries
CombatLevelScene
offline resolver
Level1 config migration
old/new golden parity

Do not continue if Level1 regression exists.

Commit/push:
H012_GATE_B_SHA

## Gate C — Hidden admin designer

Complete:
hidden route
RBAC
designer canvas
drag/drop
inspectors/layers
formation/shield/hazard/bonus/boarding tools
validation
same-runtime preview
lifecycle controls

Commit/push:
H012_GATE_C_SHA

## Gate D — Replayability / campaign

Complete:
NUKE/LIFE pickups
seeded drops
bonus hosts
generator
Levels2-6 meaningful drafts
packaged/candidate definitions

Commit/push:
H012_GATE_D_SHA

## Gate E — Harden

Complete:
all hostile suites
Docker full stack
GitHub CI
docs/currentness
governance debt=0
draft PR
sealed return

Final:
H012_FINAL_SHA

At every gate:
commit
push
local==remote
worktree clean

## Exit

Return:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_012

Mandatory:
LEVEL AUTHORITY PASS
VERSIONING PASS
PUBLISHED IMMUTABILITY PASS
CHECKSUM PASS
GAMERUN LEVEL BINDING PASS

GENERIC RUNTIME PASS
LEVEL1 CONFIG MIGRATION PASS
LEVEL1 TOPOGRAPHY REGRESSION 0
LEVEL1 SCALE REGRESSION 0
LEVEL1 BEHAVIOUR REGRESSION 0

HIDDEN ADMIN PASS
PUBLIC ADMIN DISCOVERABILITY 0
RBAC PASS
DESIGNER PASS
SAME-RUNTIME PREVIEW PASS
IMPORT/EXPORT PASS

NUKE/LIFE DROP PASS
DETERMINISTIC RNG PASS
GENERATOR DRAFT PASS
AUTO-PUBLISH NO

LEVEL1 VALIDATED
LEVEL2 VALIDATED OR EXACT BLOCKER
LEVEL3 VALIDATED OR EXACT BLOCKER
LEVEL4 VALIDATED OR EXACT BLOCKER
LEVEL5 VALIDATED OR EXACT BLOCKER
LEVEL6 VALIDATED OR EXACT BLOCKER

OFFLINE FALLBACK PASS
HOSTILE PASS
DOCKER PASS
CI GREEN
GOVERNANCE_DEBT_COUNT=0

PR:
head feature/v1-config-driven-campaign-platform
base dev
title Build Galactic Gunners config-driven campaign and level authoring platform
OPEN/DRAFT/NOT MERGED

Return evidence:
entry SHA
Gate A/B/C/D SHAs
final SHA
schema/hash
models/migrations
API/OpenAPI
Level1 golden proof
admin screenshots
RBAC/non-discoverability proof
import/export
generator seeds/checksums
drop-system traces
six-level inventory
offline evidence
hostile evidence
Docker
CI
PR
local==remote
clean worktree
POST_BOX boundary-only
sealed SHA-256

DO NOT MERGE.
