# MODELS / CONTRACTS / API

## Django models

Level:
- id UUID
- slug unique
- name
- campaign
- sequence
- active_version FK nullable
- archived
- created_at
- updated_at

LevelVersion:
- id UUID
- level FK
- version
- schema_version
- config JSONB
- checksum SHA-256
- seed_policy
- status DRAFT|VALIDATED|PUBLISHED|SUPERSEDED|ARCHIVED
- created_by
- created_at
- published_at nullable
- supersedes nullable

Invariants:
- UNIQUE(level, version)
- PUBLISHED immutable
- active_version belongs to same Level
- archived excluded from normal public listing
- server recomputes checksum

GameRun add:
- level_id
- level_version
- level_checksum
- seed

## LevelDefinition JSON

Top-level:

{
  "schema_version": "1.0",
  "level": {
    "id": "level-01",
    "slug": "gamma-10-defence",
    "name": "Gamma 10 Defence",
    "campaign": "v1",
    "sequence": 1
  },
  "seed_policy": {"mode": "fixed", "default_seed": 1001},
  "environment": {},
  "playfield": {},
  "player": {},
  "enemy_formations": [],
  "enemy_placements": [],
  "shields": [],
  "hazards": [],
  "waves": [],
  "objectives": [],
  "bonus_rules": [],
  "drop_tables": [],
  "boarding_anchors": [],
  "difficulty": {},
  "performance_budget": {},
  "metadata": {}
}

Rules:
- additionalProperties=false
- bounded strings/arrays
- normalized coordinate ranges where used
- known registry enums only
- unknown entity/asset/pickup/hazard = FAIL
- arbitrary JS/Python/SQL/shell/HTML executable content = FAIL
- prototype-pollution keys = FAIL

## Public API

GET /api/v1/levels/
GET /api/v1/levels/{slug}/
GET /api/v1/levels/{slug}/versions/{version}/

Published only. Draft leakage = 0.

## Admin API

POST /api/v1/admin/levels/
POST /api/v1/admin/levels/{id}/clone/
POST /api/v1/admin/levels/{id}/validate/
POST /api/v1/admin/levels/{id}/publish/
POST /api/v1/admin/levels/{id}/rollback/
POST /api/v1/admin/levels/{id}/archive/
POST /api/v1/admin/levels/import/
GET  /api/v1/admin/levels/{id}/export/
POST /api/v1/admin/levels/generate/

Use existing error envelope:
{ "code": "...", "detail": "...", "errors": {...} }

Admin auth:
anonymous denied
normal player denied
authorized level admin allowed
Django identity authority only.
