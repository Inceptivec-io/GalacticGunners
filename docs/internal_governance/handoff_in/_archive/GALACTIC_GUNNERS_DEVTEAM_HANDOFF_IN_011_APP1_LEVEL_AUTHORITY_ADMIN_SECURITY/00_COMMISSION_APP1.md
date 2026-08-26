# GALACTIC GUNNERS DEVTEAM HANDOFF IN 011 APP1
## Level Authority, Versioning, API & Hidden Admin Security Boundary

Repository:
`Inceptivec-io/GalacticGunners`

Programme:
Handoff 011 — Config-Driven Campaign Platform

Execution branch:
`feature/v1-config-driven-campaign-platform`

Authoritative branch entry:
`580428e76ae7af80f7e14f11ed3557675acbca9a`

Current status entering APP1:

- Handoff 011 REV1 re-entry valid;
- v1.1 Roadmap/Playlist archived unchanged;
- v1.2 admitted as sole current Roadmap/Playlist;
- `LevelDefinition` JSON schema added;
- semantic TypeScript validator added;
- versioned Level 1 configuration added;
- `npm run game:typecheck` PASS;
- `npm run contracts:validate` PASS;
- current completed work is not yet committed/pushed.

# PURPOSE

Turn the config schema work into an authoritative, versioned backend content system and secure hidden administration boundary.

This APP1 deliberately stops before:

- visual drag/drop level designer;
- CombatLevelScene generic runtime migration;
- Level 1 runtime parity migration;
- bonus/drop runtime;
- procedural generator;
- Levels 2–6 authoring.

Those remain later bounded Handoff 011 blocks.

# 0. FIRST ACTION — SEAL CURRENT FOUNDATION

Before new APP1 implementation:

1. inspect current worktree;
2. inventory all Handoff 011 work already completed;
3. verify no unrelated changes;
4. run:
   - `npm run game:typecheck`;
   - `npm run contracts:validate`;
5. commit the completed schema/config/currentness foundation as ONE semantic checkpoint;
6. push branch;
7. verify local HEAD == remote;
8. continue APP1 from that exact pushed checkpoint.

Do not squash unrelated history.
Do not mutate accepted Level 1 runtime/topography.

Record:

```text
APP1_FOUNDATION_CHECKPOINT_SHA
```

# 1. FOUNDER GOLDEN LOCK — LEVEL 1

No material change to accepted H010 Level 1.

APP1 must not change gameplay runtime visuals or topology.

Required:

```text
LEVEL1_RUNTIME_FILES_MUTATED_FOR_GAMEPLAY = NO
LEVEL1_TOPOGRAPHY_REGRESSION = 0
LEVEL1_SCALE_REGRESSION = 0
LEVEL1_VISUAL_REGRESSION = 0
```

Config/schema/backend work may reference Level 1 but not alter its accepted presentation.

# 2. DJANGO LEVEL AUTHORITY

Implement semantic backend models:

```text
Level
LevelVersion
```

Preferred model:

```text
Level
- id UUID
- slug unique
- campaign
- sequence
- active_version FK nullable
- archived boolean
- created_at
- updated_at

LevelVersion
- id UUID
- level FK
- version integer/string governed
- schema_version
- config JSONB
- checksum
- seed_policy
- status
- created_by
- created_at
- published_at nullable
- supersedes nullable
```

Lifecycle statuses:

```text
DRAFT
VALIDATED
PUBLISHED
SUPERSEDED
ARCHIVED
```

Published `LevelVersion` is immutable.

Any content change after publish creates a new version.

No overwrite-in-place of published content.

# 3. SERVER-SIDE LEVEL VALIDATION

Backend must validate every saved/published config against:

1. JSON Schema;
2. semantic registry constraints;
3. bounds;
4. player spawn;
5. formation/bunker/hazard references;
6. allowed pickup types;
7. allowed BoardingAnchor shape;
8. performance-budget limits;
9. checksum computation.

Do not trust TypeScript/client validation.

Required:

```text
CLIENT VALIDATION = UX ONLY
SERVER VALIDATION = AUTHORITATIVE
INVALID CONFIG SAVE/PUBLISH = DENIED
```

# 4. CHECKSUM / CANONICAL SERIALISATION

Define deterministic canonical serialisation.

Checksum must be stable for semantically identical stored config.

Use a documented algorithm, preferably SHA-256 over canonical JSON.

Required:

```text
SAME CONFIG → SAME CHECKSUM
MUTATED CONFIG → DIFFERENT CHECKSUM
```

Store checksum on `LevelVersion`.

# 5. GAME RUN LEVEL BINDING

Extend existing GameRun authority with:

```text
level_id
level_version
level_checksum
seed
```

Migration must preserve existing data safely.

If nullable is required for historical rows, document migration semantics.

New level-aware runs must bind exact level identity/version/checksum/seed.

Update:

- Django model;
- serializer;
- OpenAPI;
- client contract;
- tests;
- currentness/docs.

# 6. LEVEL READ API

Implement read endpoints, semantic equivalent:

```text
GET /api/v1/levels/
GET /api/v1/levels/{slug}/
GET /api/v1/levels/{slug}/versions/{version}/
```

Player-facing read behaviour:

- only PUBLISHED versions;
- archived levels excluded by default;
- exact version endpoint can resolve immutable published historical versions where permitted;
- no draft leakage.

# 7. HIDDEN ADMIN API

Implement server-authorized mutation endpoints, semantic equivalent:

```text
POST /api/v1/admin/levels/
POST /api/v1/admin/levels/{id}/clone/
POST /api/v1/admin/levels/{id}/validate/
POST /api/v1/admin/levels/{id}/publish/
POST /api/v1/admin/levels/{id}/rollback/
POST /api/v1/admin/levels/{id}/archive/
POST /api/v1/admin/levels/import/
GET  /api/v1/admin/levels/{id}/export/
```

Preview/generator endpoints may be stubbed ONLY as explicit `NOT_IMPLEMENTED` contracts if required by future UI, but do not fake functionality.

# 8. ADMIN IDENTITY / RBAC

Django identity remains sole authority.

Create/refine explicit permission such as:

```text
can_manage_game_levels
```

or equivalent semantic role/permission.

Required:

```text
ANONYMOUS ADMIN API = 401/403
AUTHENTICATED NORMAL PLAYER = 403
AUTHORIZED ADMIN = PASS
```

No authorization decision only in Next.js/client code.

# 9. HIDDEN WEB ADMIN ROUTE — SECURITY SHELL ONLY

Establish the canonical web namespace:

```text
/inceptivec-gamification-admin
```

APP1 scope is **security shell and authenticated level list/basic metadata surface**, not full visual editor.

No aliases:

```text
/admin
/admin/game/levels
/editor
/level-editor
```

No public discoverability.

Required:

```text
PUBLIC_NAV_LINK = 0
FOOTER_LINK = 0
PLAYER_PROFILE_LINK = 0
HELP_LINK = 0
CREDITS_LINK = 0
SITEMAP_ENTRY = 0
PUBLIC_HTML_HREF = 0
PUBLIC_ROUTE_INDEX_ENTRY = 0
```

Apply:

```text
robots meta = noindex,nofollow
```

where appropriate.

Do not expose route in robots.txt merely to "hide" it.

# 10. WEB ACCESS BEHAVIOUR

Direct route:

```text
anonymous
→ generic denied/not-found/auth-required behaviour
```

Must not leak privileged level data.

```text
normal authenticated player
→ denied
```

```text
authorized admin
→ hidden admin shell
→ level list / level metadata access
```

Do not add public redirects advertising the hidden route.

# 11. LEVEL IMPORT / EXPORT — BACKEND ONLY IN APP1

Implement secure JSON import/export backend contracts.

Import pipeline:

```text
UPLOAD/JSON
→ SIZE LIMIT
→ PARSE
→ SCHEMA VALIDATE
→ SEMANTIC VALIDATE
→ SECURITY VALIDATE
→ CHECKSUM
→ SAVE AS DRAFT
```

Never auto-publish.

Reject:

- unknown fields;
- prototype-pollution keys;
- excessive nesting;
- excessive arrays;
- script/HTML payload where disallowed;
- executable strings in prohibited fields;
- malformed UTF;
- oversized payload;
- unsupported schema version.

Export includes:

```text
schema_version
level identity
level version
checksum
config
```

# 12. VERSIONING / PUBLISH / ROLLBACK

Publish flow:

```text
DRAFT
→ VALIDATE
→ VALIDATED
→ PUBLISH
→ PUBLISHED
```

Publishing a new version:

```text
previous PUBLISHED
→ SUPERSEDED
new VALIDATED
→ PUBLISHED
Level.active_version
→ new version
```

Rollback:

- never mutates historical version content;
- may reactivate a prior immutable published version through a governed operation;
- audit actor/timestamp/reason.

# 13. AUDIT

Record privileged level operations:

- create;
- clone;
- validate;
- publish;
- rollback;
- archive;
- import.

Evidence:

```text
actor
operation
level
level_version
timestamp
result
before/after reference where applicable
```

Use existing audit architecture if present rather than creating a duplicate system.

# 14. MIGRATIONS / SEED DATA

Create migrations.

Provide one governed Level / LevelVersion record for the accepted Level 1 config.

Do NOT create Levels 2–6 yet in APP1.

The seed/admission must be idempotent or fixture-controlled.

# 15. TESTING

Backend:

- model lifecycle;
- published immutability;
- unique version;
- checksum;
- schema failure;
- semantic failure;
- invalid bounds;
- invalid entity;
- publish;
- supersede;
- rollback;
- archive;
- import;
- export;
- RBAC;
- anonymous denial;
- player denial;
- admin success;
- draft not publicly readable;
- archived exclusion;
- historical version read.

GameRun:

- new level fields;
- checksum/version/seed serialisation;
- historical-null compatibility if required.

Web:

- hidden route not linked publicly;
- noindex/nofollow;
- anonymous denied;
- normal player denied;
- admin shell allowed.

Hostile import:

- prototype pollution;
- script payload;
- huge nesting;
- huge arrays;
- unknown schema;
- invalid checksum tampering where relevant.

# 16. QUALITY

Required:

```text
npm ci = PASS
npm run quality = PASS
npm run game:typecheck = PASS
npm run contracts:validate = PASS
web typecheck/build = PASS

backend manage.py check = PASS
makemigrations --check = PASS
migrate empty DB = PASS
pytest = PASS

docker compose config = PASS
docker compose build = PASS
docker compose up = PASS
web health = PASS
API health = PASS
```

Add CI coverage for the new backend/admin contracts.

# 17. CURRENTNESS / GOVERNANCE

Update currentness truth:

```text
H010 = ACCEPTED / MERGED
H011 = ACTIVE
H011 APP1 = LEVEL AUTHORITY / ADMIN SECURITY RETURNED FOR REVIEW
v1.2 = SOLE CURRENT PLANNING AUTHORITY
GOVERNANCE_DEBT_COUNT = 0
```

# 18. PR

Continue same execution branch.

At APP1 return, open the Handoff 011 PR if one does not already exist:

HEAD:
`feature/v1-config-driven-campaign-platform`

BASE:
`dev`

Title:
`Build Galactic Gunners config-driven campaign and level authoring platform`

State:
`OPEN / DRAFT / NOT MERGED`

# 19. RETURN

Return:

`GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_011_APP1`

Include:

- original H011 entry SHA;
- APP1 foundation checkpoint SHA;
- final pushed SHA;
- planning-currentness proof;
- Level/LevelVersion models;
- migrations;
- Level 1 DB admission;
- checksum algorithm;
- server validation;
- GameRun extensions;
- OpenAPI changes;
- public level API;
- admin level API;
- RBAC proof;
- hidden route proof;
- public discoverability audit;
- import/export hostile results;
- audit evidence;
- test counts/results;
- Docker results;
- CI run;
- Level 1 runtime/topography mutation count;
- governance debt;
- PR URL/state;
- local == remote;
- clean worktree;
- POST_BOX boundary-only;
- sealed return SHA-256.

DO NOT MERGE.
Do not begin APP2 without CTO/Founder gate.
