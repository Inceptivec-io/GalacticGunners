# ARCHITECTURE / CONTRACT SPECIFICATION

# 1. ONE COMBAT LEVEL RUNTIME

Do not create separate permanent `Level2Scene.ts` ... `Level6Scene.ts`.

Use:

```text
game/src/scenes/CombatLevelScene.ts
game/src/levels/LevelLoader.ts
game/src/levels/LevelRuntimeConfig.ts
game/src/levels/LevelValidator.ts
game/src/levels/registries/
```

Existing Level1Scene may remain temporarily for parity comparison, then cease to be permanent authority after acceptance.

# 2. LEVEL DEFINITION CONTRACT

Create:

`packages/contracts/schemas/level-definition.schema.json`

Conceptual shape:

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
├── seed_policy
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
└── checksum
```

Rules:

```text
additionalProperties = false
arbitrary JS/Python/SQL/HTML/shell = forbidden
unknown enemy = reject
unknown asset ID = reject
unknown pickup = reject
unknown hazard = reject
invalid bounds = reject
invalid spawn = reject
invalid shield matrix = reject
invalid boarding anchor = reject
performance budget breach = reject
```

# 3. SEMANTIC REGISTRIES

Create:

- EnemyTypeRegistry
- PickupTypeRegistry
- HazardTypeRegistry
- AssetReferenceRegistry
- MovementPatternRegistry
- ObjectiveTypeRegistry

Config cannot instantiate unsupported classes.

# 4. LEVEL 1 GOLDEN MIGRATION

Create versioned Level 1 definition reproducing the accepted state:

```text
29 x 2 = 58 enemies
8 bunkers
256 shield tiles
accepted player/scout sizing
accepted lower lane
accepted player spawn
accepted lasers
accepted nukes/rearm
accepted pause
accepted respawn
accepted lives/scoring/HUD
```

Suggested packaged file:

`game/levels/release/level-01.json`

Run current accepted implementation and config runtime at identical viewport/seed.

Compare object geometry, HUD, collisions and screenshots.

# 5. DJANGO MODELS

Create/refine:

```text
Level
- id UUID
- slug unique
- campaign
- sequence
- active_version FK nullable
- archived
- created_at
- updated_at

LevelVersion
- id UUID
- level FK
- version
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

Statuses:

DRAFT
VALIDATED
PUBLISHED
SUPERSEDED
ARCHIVED

Published versions immutable.

# 6. GAME RUN BINDING

Extend GameRun:

```text
level_id
level_version
level_checksum
seed
```

Update migrations/OpenAPI/schemas/tests/docs.

# 7. LEVEL API

Provide semantic equivalent:

```text
GET /api/v1/levels/
GET /api/v1/levels/{slug}/
GET /api/v1/levels/{slug}/versions/{version}/

POST /api/v1/admin/levels/
POST /api/v1/admin/levels/{id}/clone/
POST /api/v1/admin/levels/{id}/validate/
POST /api/v1/admin/levels/{id}/preview/
POST /api/v1/admin/levels/{id}/publish/
POST /api/v1/admin/levels/{id}/rollback/
POST /api/v1/admin/levels/{id}/archive/
POST /api/v1/admin/levels/import/
GET /api/v1/admin/levels/{id}/export/
POST /api/v1/admin/levels/generate/
```

Public/player mutation forbidden.
