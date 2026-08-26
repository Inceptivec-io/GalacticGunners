# GALACTIC GUNNERS MASTER ROADMAP v1.2
## Config-Driven Campaign, Level Authoring & Replayability Baseline

**Product:** Galactic Gunners  
**Institutional Arm:** Inceptivec Gamification  
**Technical/Product Authority:** Galactic Gunners CTO  
**Controlling Final Acceptance Authority:** Founder / Secuvara CTAIO  
**Version:** v1.2 — CURRENT AUTHORITATIVE PLANNING BASELINE  
**Supersedes:** `GALACTIC_GUNNERS_MASTER_ROADMAP_v1.1.md`

---

# 0. SINGLE PROGRAMME CONTROL SURFACE

The Founder steers the programme from exactly:

```text
docs/internal_governance/planning/
├── GALACTIC_GUNNERS_MASTER_ROADMAP_v1.2.md
├── GALACTIC_GUNNERS_MASTER_PLAYLIST_v1.2.md
└── _archive/
```

v1.1 is preserved, not deleted, under:

```text
docs/internal_governance/planning/_archive/v1.1/
```

There is exactly one current Roadmap and one current Playlist.

This v1.2 enhances and absorbs v1.1. It does not fork the programme.

---

# 1. PRODUCT DIRECTION

Galactic Gunners is no longer planned as a fixed sequence of hard-coded scenes.

The production direction is:

```text
COMMERCIAL PHASER GAME
        ↓
CONFIG-DRIVEN LEVEL RUNTIME
        ↓
VERSIONED LEVEL DEFINITIONS
        ↓
SIX-LEVEL RELEASE CAMPAIGN
        ↓
ADMIN LEVEL DESIGNER
        ↓
DATABASE / IMPORT / EXPORT
        ↓
PROCEDURAL DRAFT GENERATION
        ↓
BONUS / DROP / BOARDING PLACEMENT RULES
        ↓
REPLAYABLE / EXTENDABLE LIVE GAME
```

The game engine remains Phaser + TypeScript.

React / Next.js remains the product and administration shell.

Django / DRF / PostgreSQL remains the authoritative backend.

---

# 2. PROGRAMME DOCTRINE

```text
CORRECT FOUNDATION
→ HOSTILE TEST
→ CTO QUALITY GATE
→ FOUNDER ACCEPTANCE
→ NEXT CAPABILITY
```

```text
RUNS != PRODUCTION READY
AUTOMATED PASS != COMMERCIAL ACCEPTANCE
DATA-DRIVEN != UNGOVERNED
RANDOM != NON-DETERMINISTIC
ADMIN-EDITABLE != ARBITRARY CODE EXECUTION
```

Every configurable level must remain:

- schema-valid;
- deterministic when seeded;
- safe to load;
- versioned;
- auditable;
- reversible;
- testable;
- compatible with score validation;
- playable offline where required.

---

# 3. CURRENT PROGRAMME POSITION

The production branch model is:

```text
feature/* → dev → stage → prod
```

`prod` is the default/release authority. `main` is retired.

The production application architecture has been established:

- Next.js product shell;
- Phaser + TypeScript game core;
- Django + DRF;
- PostgreSQL;
- GameRun contract;
- canonical asset/IP estate;
- Docker;
- hostile runtime testing.

The current active gameplay movement is the first v1.0 Level 1 build/extraction sequence.

Before proceeding deeper into campaign construction, the current Handoff 010 family must close with:

```text
FOUNDER ACCEPTED GAMEPLAY/VISUAL STATE
+
REMOTE HOSTILE CI GREEN
+
ZERO GOVERNANCE DEBT
```

---

# 4. RELEASE CAMPAIGN MODEL

v1.0 shall target a **minimum six-level authored campaign**.

This is a release-content baseline, not a hard technical limit.

```text
LEVEL 1
LEVEL 2
LEVEL 3
LEVEL 4
LEVEL 5
LEVEL 6
```

Additional levels must be addable without creating new game-engine code.

Recommended progression grammar:

```text
L1  core defence / foundational combat
L2  increased formation and hazard complexity
L3  mixed alien ship classes
L4  advanced hazards / bonus / boarding-capable opportunities
L5  elite assault / high-pressure composition
L6  campaign finale / mothership or equivalent terminal challenge
```

Exact narrative, placements, enemy populations, rewards and compositions remain governed level content, not permanent code assumptions.

---

# 5. KEY ARCHITECTURAL CHANGE — ONE LEVEL RUNTIME

Do not build:

```text
Level1Scene.ts
Level2Scene.ts
Level3Scene.ts
Level4Scene.ts
Level5Scene.ts
Level6Scene.ts
```

as six duplicated gameplay implementations.

The target is:

```text
CombatLevelScene
        ↓
LevelLoader
        ↓
Validated LevelDefinition
        ↓
LevelRuntimeConfig
```

Special mechanics may use semantic systems or scene families where genuinely required, but normal combat-level variation comes from data.

The current Level 1 implementation becomes the migration denominator into this runtime.

---

# 6. LEVEL DEFINITION — AUTHORITATIVE CONFIG OBJECT

Every playable level is represented by one versioned `LevelDefinition`.

Minimum conceptual shape:

```text
LevelDefinition
├── id
├── slug
├── name
├── version
├── schema_version
├── status
├── sequence
├── campaign
├── seed
├── environment
├── playfield
├── player
├── enemy_formations[]
├── enemy_placements[]
├── shields[]
├── hazards[]
├── projectile_rules
├── wave_rules[]
├── objectives[]
├── bonus_rules[]
├── drop_tables[]
├── boarding_anchors[]
├── audio_theme
├── visual_theme
├── difficulty
├── performance_budget
├── created_by
├── created_at
├── published_at
└── checksum
```

No level definition may contain arbitrary JavaScript, Python, HTML, SQL or executable code.

Configuration is declarative only.

---

# 7. LEVEL SCHEMA

A versioned JSON Schema shall define the transport/storage contract.

Target:

```text
packages/contracts/schemas/
└── level-definition.schema.json
```

Future compatible schemas may include:

```text
enemy-placement.schema.json
formation.schema.json
bonus-rule.schema.json
drop-table.schema.json
boarding-anchor.schema.json
```

Rules:

```text
SCHEMA VERSIONED = YES
ADDITIONAL PROPERTIES = FALSE unless deliberately extensible
ARBITRARY CODE = NO
UNKNOWN ENTITY TYPE = FAIL
UNKNOWN ASSET ID = FAIL
INVALID PLACEMENT = FAIL
IMPOSSIBLE BOUNDS = FAIL
```

---

# 8. LEVEL RUNTIME CONFIGURATION

Level content may control approved semantic parameters including:

## 8.1 Player

- starting position;
- movement bounds;
- starting lives where campaign rules permit;
- starting nukes where campaign rules permit;
- allowed spawn/restart anchors.

## 8.2 Alien placement

For each supported enemy type:

- type;
- quantity;
- position;
- formation;
- row/column layout;
- spacing;
- movement pattern;
- firing profile;
- entry timing;
- difficulty modifiers.

Supported types come from a governed enemy registry.

Config cannot invent a new executable enemy class.

## 8.3 Shields / base tiles

Config may define:

- bunker count;
- bunker anchor;
- matrix;
- tile spacing;
- orientation;
- shield type.

Canonical shield assets remain governed.

## 8.4 Hazards

Examples:

- asteroids;
- comets;
- scripted hazard lanes;
- timed environmental events.

## 8.5 Player start

One or more valid player spawn/restart positions.

## 8.6 Boarding anchors

Future-ready declarative placement:

```text
BoardingAnchor
├── eligible_ship_type
├── position / formation rule
├── boarding_enabled
├── entry_envelope
├── interior_definition_id
└── availability_rule
```

Boarding implementation remains separately gated.

The level system merely reserves/configures where future boardable opportunities may exist.

---

# 9. BONUS / REWARD CONFIGURATION

The level runtime shall support declarative bonus opportunities.

## 9.1 Hidden bonuses behind destructible targets

Example:

```text
HiddenBonusRule
├── host_object_id / host_type
├── reveal_trigger = destroyed
├── bonus_type
├── probability
├── lifetime
└── collection_rule
```

Examples:
- life;
- nuke;
- score bonus;
- future collectible.

## 9.2 Ship drop tables

Alien ships may probabilistically release approved pickup types.

Example:

```text
DropTable
├── id
├── entries[]
│   ├── pickup_type
│   ├── weight
│   ├── min
│   └── max
├── trigger
└── cooldown / cap
```

Supported initial drops may include:

```text
NUKE
LIFE
```

Drops may visually jump/eject from destroyed ships before becoming collectible.

## 9.3 Determinism

Randomness must be seedable.

For a recorded run:

```text
LEVEL VERSION
+
SEED
+
CONFIG CHECKSUM
=
REPLAYABLE CONTENT DENOMINATOR
```

This enables:
- replay;
- debugging;
- hostile reproduction;
- score validation;
- daily/weekly challenge reuse.

---

# 10. SIX RELEASE LEVELS

The six launch levels are authored content built using the same LevelDefinition system.

The code must not care whether the active level is:

```text
1
6
16
60
```

provided the definition is schema-valid and uses supported mechanics.

The six-level campaign should demonstrate progressively:

- baseline formations;
- shield layouts;
- enemy-class combinations;
- hazards;
- bonus placement;
- drop-table behaviour;
- nuke/life pickups;
- boss/finale configuration;
- future boarding anchors without activating Boarding until that programme gate.

---

# 11. ADMIN LEVEL DESIGNER

A Founder/admin-only level-authoring area shall be created in the product administration surface.

Target conceptual route:

```text
/admin/game/levels
```

or equivalent governed administration route.

This is not public player UI.

## 11.1 Capabilities

Admin can:

- create level;
- clone level;
- edit metadata;
- choose playfield template;
- position player start;
- position enemy ships by type;
- create formations;
- place individual enemies;
- place shield bunkers;
- edit shield matrices;
- place hazards;
- place destructible bonus hosts;
- configure drop tables;
- place future boarding anchors;
- set wave timing;
- configure level objectives;
- preview;
- validate;
- simulate;
- save draft;
- publish;
- supersede;
- rollback;
- archive;
- export config;
- import config.

## 11.2 Visual editor

Preferred:

```text
2D GAMEPLAY CANVAS
+
GRID / SNAP
+
DRAG / DROP
+
ENTITY PALETTE
+
PROPERTY INSPECTOR
+
LAYER PANEL
+
VALIDATION PANEL
```

Layers may include:

```text
BACKGROUND
ENEMIES
SHIELDS
HAZARDS
BONUSES
BOARDING
PLAYER SPAWN
UI SAFE AREAS
```

## 11.3 Preview

Admin preview must run through the **same LevelLoader and runtime** as production.

No separate fake preview renderer.

---

# 12. ADMIN SECURITY

Level authoring is privileged.

Required:

```text
DJANGO IDENTITY AUTHORITY = 1
ADMIN RBAC = PASS
PUBLIC LEVEL WRITE = DENIED
AUDIT = PASS
CSRF = PASS
VALIDATION = SERVER-SIDE
ARBITRARY SCRIPTING = 0
```

Every publish operation records:

- actor;
- timestamp;
- previous version;
- new version;
- checksum;
- validation result.

---

# 13. DATABASE MODEL

Recommended authoritative model:

```text
Level
├── id
├── slug
├── campaign
├── active_version
└── lifecycle metadata

LevelVersion
├── id
├── level
├── version
├── schema_version
├── config JSONB
├── seed_policy
├── checksum
├── status
├── created_by
├── created_at
├── published_at
└── supersedes
```

Optional supporting tables may be introduced only if they improve queryability/governance.

Do not prematurely explode every placement into relational tables if versioned JSONB is the clearer content authority.

The database stores the governed definition, not executable scene code.

---

# 14. LEVEL API

Versioned API additions:

```text
GET  /api/v1/levels/
GET  /api/v1/levels/{slug}/
GET  /api/v1/levels/{slug}/versions/{version}/
POST /api/v1/admin/levels/
POST /api/v1/admin/levels/{id}/validate/
POST /api/v1/admin/levels/{id}/preview/
POST /api/v1/admin/levels/{id}/publish/
```

Exact REST design may be refined.

Player runtime endpoints are read-only.

Admin mutation endpoints require privileged authority.

---

# 15. OFFLINE / PACKAGED LEVELS

The game must not become unplayable because the backend is unavailable.

Release levels shall have a packaged/cacheable baseline.

Preferred flow:

```text
BOOT
→ try published backend level manifest
→ validate
→ cache
→ play

IF BACKEND UNAVAILABLE:
→ use last validated cache
OR
→ packaged release-level definitions
```

Never use an unvalidated remote config.

---

# 16. IMPORT / EXPORT

Level definitions may be exported/imported as human-inspectable config files.

Preferred:

```text
.json
```

Every export contains:

- schema version;
- level identity;
- level version;
- checksum;
- config;
- optional provenance metadata.

Import flow:

```text
UPLOAD
→ PARSE
→ SCHEMA VALIDATE
→ SEMANTIC VALIDATE
→ SECURITY VALIDATE
→ PREVIEW
→ SAVE AS DRAFT
```

Import never directly publishes.

---

# 17. PROCEDURAL / AUTO-GENERATED LEVELS

The administration system shall support constrained level generation.

This is not unconstrained AI code generation.

Target:

```text
GeneratorRules
+
Seed
+
Difficulty Target
+
Allowed Entity Registry
+
Placement Constraints
=
Generated LevelDefinition Draft
```

Generator may choose:

- enemy formations;
- supported enemy types;
- bunker patterns;
- hazards;
- bonuses;
- drop tables;
- boarding anchors;
- timing;
- wave composition.

Generator must enforce:

```text
NO OVERLAPPING INVALID SPAWNS
NO PLAYER-SPAWN BLOCKAGE
NO OUT-OF-BOUNDS PLACEMENTS
NO UNSUPPORTED ENTITIES
NO IMPOSSIBLE OBJECTIVES
NO PERFORMANCE-BUDGET BREACH
NO UNREACHABLE REQUIRED PICKUPS
```

Generated levels are **DRAFT** until validated and approved.

---

# 18. FUTURE LIVE REPLAYABILITY

Once the underlying six release levels are accepted, the same machinery can support:

- bonus levels;
- event levels;
- daily challenge;
- weekly challenge;
- seasonal rotations;
- curated community/internal level packs;
- difficulty variants;
- campaign extensions.

No separate engine rewrite is needed.

---

# 19. LEVEL VERSIONING / RUN INTEGRITY

GameRun must bind to:

```text
level_id
level_version
level_checksum
seed
```

Score validation must use the exact definition played.

A published level definition is immutable.

Changes produce a new LevelVersion.

Historical GameRuns continue referencing their original version.

---

# 20. LEVEL VALIDATION ENGINE

Before publication:

```text
SCHEMA = PASS
ENTITY REFERENCES = PASS
ASSET REFERENCES = PASS
BOUNDS = PASS
SPAWNS = PASS
COLLIDERS = PASS
OBJECTIVES = PASS
DROP TABLES = PASS
PERFORMANCE BUDGET = PASS
HOSTILE SIMULATION = PASS
PREVIEW = PASS
```

Fail closed.

---

# 21. HOSTILE LEVEL TESTING

Every level definition must be executable through automated tests.

Required families:

- spawn safety;
- bounds;
- collision reachability;
- shield placement;
- projectile paths;
- pause;
- nuke;
- respawn;
- level completion;
- game-over path;
- bonus reveal;
- drop pickup;
- invalid configuration rejection;
- import tampering rejection;
- generated-level validation;
- deterministic seed replay.

Hostile testing is a gate for both code and level content.

---

# 22. PERFORMANCE BUDGET

Level definitions cannot create unlimited runtime load.

Each schema/runtime validator shall enforce configurable caps such as:

- maximum concurrent enemies;
- maximum active projectiles;
- maximum hazards;
- maximum shield tiles;
- maximum pickups;
- maximum scripted events.

Limits are based on tested target-device performance and may evolve.

Admin UI displays budget usage before publish.

---

# 23. CAMPAIGN / CONTENT SEQUENCE

Recommended v1.0 implementation order:

```text
H010 CLOSE
        ↓
LEVEL DEFINITION SCHEMA
        ↓
LEVEL LOADER / COMBAT LEVEL RUNTIME
        ↓
MIGRATE CURRENT LEVEL 1 INTO CONFIG
        ↓
PROVE ZERO BEHAVIOURAL REGRESSION
        ↓
ADMIN LEVEL DESIGNER MVP
        ↓
DATABASE VERSIONING / PUBLISHING
        ↓
BUILD LEVELS 2–6 THROUGH THE TOOLING
        ↓
BONUS / DROP SYSTEM
        ↓
PROCEDURAL DRAFT GENERATOR
        ↓
CAMPAIGN HARDENING
        ↓
LEADERBOARD / BOARDING / CLIENT EXPANSION
```

This avoids hard-coding five more levels and then rebuilding them again later.

---

# 24. LEVEL 1 MIGRATION GATE

The current accepted Level 1 becomes the reference test.

After conversion to LevelDefinition:

```text
PLAYER MOVEMENT = SAME OR APPROVED BETTER
FORMATION = SAME
SHIELDS = SAME
LASERS = SAME
NUKES = SAME
PAUSE = SAME
RESPAWN = SAME
SCORING = SAME
BONUSES = SAME WHERE PRESENT
VISUAL QUALITY = SAME OR BETTER
HOSTILE TESTS = PASS
```

Only then is the generic LevelRuntime accepted.

---

# 25. ADMIN DESIGNER MVP GATE

Before using the designer to create production campaign levels:

```text
CREATE = PASS
EDIT = PASS
DRAG/DROP = PASS
VALIDATE = PASS
PREVIEW = SAME RUNTIME
SAVE DRAFT = PASS
VERSION = PASS
PUBLISH = PASS
ROLLBACK = PASS
IMPORT = PASS
EXPORT = PASS
RBAC = PASS
AUDIT = PASS
INVALID LEVEL PUBLISH = IMPOSSIBLE
```

---

# 26. SIX-LEVEL CAMPAIGN GATE

v1.0 campaign content is not complete until:

```text
LEVEL 1 = ACCEPTED
LEVEL 2 = ACCEPTED
LEVEL 3 = ACCEPTED
LEVEL 4 = ACCEPTED
LEVEL 5 = ACCEPTED
LEVEL 6 = ACCEPTED

CONFIG-DRIVEN = PASS
NO LEVEL-SPECIFIC DUPLICATED ENGINE = PASS
ALL LEVEL DEFINITIONS VERSIONED = PASS
ALL HOSTILE SUITES = PASS
ALL FOUNDER VISUAL REVIEWS = PASS
```

---

# 27. BOARDING INTEGRATION

Boarding remains a later gated subsystem.

However LevelDefinition now reserves:

- boardable ship eligibility;
- placement;
- boarding anchors;
- interior definition reference;
- availability rules.

This ensures the campaign/content system does not require another architectural rewrite when Boarding is activated.

---

# 28. SCORE / BONUS GOVERNANCE

Global scoring values remain governed separately.

Level config may choose where supported events occur.

Level config does **not** arbitrarily redefine core score values unless a future explicit scoring-policy system is authorised.

For example:

```text
SCOUT_DESTROYED = +25
```

remains global.

A level may place more/fewer scouts, not silently make a scout worth 400 points.

---

# 29. SECURITY / ANTI-CHEAT IMPLICATIONS

Because levels become data-driven:

GameRun records:

```text
GAME VERSION
LEVEL ID
LEVEL VERSION
LEVEL CHECKSUM
SEED
```

Server validation can reproduce expected permissible events.

Client-supplied config is never authoritative.

Published server/package level definitions are authoritative.

---

# 30. AUTHORING / GENERATION GOVERNANCE

No generated or manually authored level reaches players without:

```text
VALIDATE
→ PREVIEW
→ HOSTILE TEST
→ ADMIN APPROVAL
→ PUBLISH
```

Autogeneration accelerates content production; it does not bypass product authority.

---

# 31. REVISED STRATEGIC SEQUENCE

```text
HARDENED V1 GAMEPLAY DENOMINATOR
        ↓
CONFIG-DRIVEN LEVEL RUNTIME
        ↓
ADMIN LEVEL AUTHORING PLATFORM
        ↓
SIX-LEVEL V1 CAMPAIGN
        ↓
BONUS / DROP / PROCEDURAL REPLAYABILITY
        ↓
SERVER-VALIDATED GAME RUNS
        ↓
GLOBAL LEADERBOARD
        ↓
BOARDING MODE
        ↓
NATIVE CLIENTS
        ↓
COMMERCIAL RELEASE
        ↓
ONGOING LEVEL / EVENT CONTENT
```

---

# 32. V1.2 EXIT PRINCIPLE

Galactic Gunners must not become a game where every new level requires Development to modify scene code.

The target capability is:

```text
DESIGN LEVEL
→ VALIDATE
→ PREVIEW
→ SAVE
→ PUBLISH
→ PLAY
```

with no engine-code change for ordinary new combat levels.

That capability is now part of the product architecture, not an optional post-release convenience.
