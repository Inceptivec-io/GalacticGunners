# ASSURANCE / HOSTILE / GOVERNANCE / RETURN

# 1. LEVEL 1 GOLDEN GATE

Permanent semantic golden tests must fail if accepted topography/sizing changes without explicit baseline authority.

Viewport comparisons:

- 1365×768
- 1440×900
- 1920×1080
- 2560×1440
- 1024×768

Compare:

- player X/Y/size;
- enemy count/X/Y/size;
- formation bounds;
- bunker count/positions;
- shield tile count/size;
- HUD anchors;
- laser sizes/bodies;
- nuke state/HUD;
- pause;
- movement bounds;
- respawn;
- score;
- terminal flow.

Required:

```text
LEVEL1_LAYOUT_DIFF = PASS
LEVEL1_BEHAVIOUR_DIFF = 0
LEVEL1_HOSTILE = PASS
```

# 2. LEVEL CONTENT VALIDATION

For every publishable definition:

```text
SCHEMA = PASS
ENTITY REFERENCES = PASS
ASSET REFERENCES = PASS
SPAWNS = PASS
BOUNDS = PASS
SHIELDS = PASS
OBJECTIVES = PASS
DROP TABLES = PASS
PERFORMANCE BUDGET = PASS
HOSTILE SIMULATION = PASS
PREVIEW = PASS
```

# 3. SECURITY HOSTILE

Reject malicious imports:

- script tags;
- javascript URLs;
- HTML injection;
- SQL payloads;
- Python/shell strings where executable content prohibited;
- prototype pollution keys;
- oversized arrays;
- deep nesting;
- unknown schema fields.

# 4. ADMIN SECURITY

```text
PUBLIC LINKS TO HIDDEN ADMIN = 0
SITEMAP ENTRY = 0
ANONYMOUS ADMIN ACCESS = DENIED
PLAYER ADMIN ACCESS = DENIED
ADMIN RBAC = PASS
AUDIT = PASS
```

# 5. QUALITY

```text
npm ci = PASS
npm run quality = PASS
game tests = PASS
web typecheck/build = PASS
contracts = PASS

backend check = PASS
makemigrations --check = PASS
migrate empty DB = PASS
pytest = PASS

docker compose config/build/runtime = PASS

runtime-hostile = PASS
level-definition-hostile = PASS
admin-hostile = PASS
import-hostile = PASS
generator-hostile = PASS

GitHub Actions = GREEN
GOVERNANCE_DEBT_COUNT = 0
```

# 6. PLANNING CURRENTNESS

Admit:

```text
planning/
├── GALACTIC_GUNNERS_MASTER_ROADMAP_v1.2.md
├── GALACTIC_GUNNERS_MASTER_PLAYLIST_v1.2.md
└── _archive/
    └── v1.1/
        ├── GALACTIC_GUNNERS_MASTER_ROADMAP_v1.1.md
        └── GALACTIC_GUNNERS_MASTER_PLAYLIST_v1.1.md
```

Exactly one current Roadmap and Playlist.

# 7. PR

Open:

HEAD:
`feature/v1-config-driven-campaign-platform`

BASE:
`dev`

Title:
`Build Galactic Gunners config-driven campaign and level authoring platform`

Leave:

OPEN / DRAFT / NOT MERGED.

# 8. RETURN

Return:

`GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_011`

Include:

- exact entry dev SHA;
- final pushed SHA;
- planning v1.2 admission;
- LevelDefinition schema;
- Level 1 config;
- Level 1 old/new golden comparison;
- zero-regression results;
- Level/LevelVersion models/migrations;
- GameRun level binding;
- API;
- hidden admin route proof;
- route non-discoverability audit;
- RBAC tests;
- designer screenshots;
- same-runtime preview;
- import/export;
- deterministic seed;
- generator;
- bonus/drop system;
- dormant BoardingAnchor;
- Levels 1–6 draft inventory;
- hostile results;
- GitHub CI;
- governance debt;
- PR URL/state;
- local == remote;
- clean worktree;
- POST_BOX boundary-only;
- sealed SHA-256.

DO NOT MERGE.
