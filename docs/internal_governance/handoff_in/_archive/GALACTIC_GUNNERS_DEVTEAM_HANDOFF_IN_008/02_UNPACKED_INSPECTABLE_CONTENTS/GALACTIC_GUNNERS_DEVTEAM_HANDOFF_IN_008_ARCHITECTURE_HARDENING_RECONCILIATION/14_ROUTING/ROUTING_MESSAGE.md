HANDOFF / COMMISSION:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_008

PURPOSE:
STEP 5 — PRODUCTION ARCHITECTURE HARDENING / RECONCILIATION

THIS IS ONE BOUNDED SPRINT.

REPOSITORY:
Inceptivec-io/GalacticGunners

BASE:
feature/production-architecture-foundation

VERIFIED BASE SHA:
c49a3108e7084daa1872c15fa3d6641af60c6f2a

EXECUTION BRANCH:
feature/architecture-hardening-reconciliation

EXPECTED ENTRY SHA:
c49a3108e7084daa1872c15fa3d6641af60c6f2a

============================================================
FIRST ACTION
============================================================

Read:

AGENTS.md
backend/AGENTS.md

Fetch/reconcile all refs.

Verify:
- base SHA;
- execution branch;
- local/remote;
- clean/known worktree;
- active POST_BOX state;
- applicable current standards/registers.

If entry state materially differs:
STOP — SOURCE_STATE_MISMATCH.

============================================================
CRITICAL RULE: REFINE EXISTING AUTHORITIES
============================================================

DO NOT FORK EXISTING MODELS, SCHEMAS, CONTRACTS OR APPS.

The repository ALREADY contains the authorities below.

REFINE THEM IN PLACE.

BACKEND MODELS:

backend/accounts/models.py
- existing User(AbstractUser)

backend/players/models.py
- existing PlayerProfile

backend/game_runs/models.py
- existing GameVersion
- existing GameRun
- existing ScoreSubmission

backend/leaderboard/models.py
- existing LeaderboardEntry

API CONTRACT:

packages/contracts/openapi/galactic-gunners-api-v1.yaml

EXISTING ROUTES:
GET  /health/
POST /game-runs/
POST /game-runs/{runId}/complete/
GET  /leaderboard/

JSON SCHEMAS:

packages/contracts/schemas/game-run.schema.json
packages/contracts/schemas/score-submission.schema.json
packages/contracts/schemas/score-event.schema.json
packages/contracts/schemas/leaderboard-entry.schema.json

CONTRACT VALIDATOR:

scripts/validate-contracts.mjs

ROOT/ORCHESTRATION:

package.json
package-lock.json
docker-compose.yml
.env.example
.github/workflows/quality.yml

APPLICATION ROOTS:

apps/web/
game/
backend/

Do not create:
models_v2.py
new_models.py
alternate API v1 contracts
duplicate schemas
second web app
second game package
second backend.

ENHANCE / APPEND / REFINE.

============================================================
TARGET ARCHITECTURE
============================================================

Next.js
= product/web shell

Phaser + TypeScript
= game core

Django + DRF
= authoritative backend

Django User
= authoritative identity

PostgreSQL
= authoritative persistence

packages/contracts/
= interface authority

Supabase Auth
= NOT identity authority

Legacy_Game/
= reference only

assets/
= canonical asset/IP authority, but NOT integrated into runtime in this sprint.

============================================================
BACKEND MODELS
============================================================

Refine existing models to production-foundation quality.

User:
- UUID primary key
- AbstractUser remains authority

PlayerProfile:
- UUID PK
- OneToOne User
- display_name <=64, unique
- timestamps

GameVersion:
- UUID PK
- version unique <=32
- build_hash <=64
- is_active
- released_at nullable
- created_at

GameRun:
- UUID PK
- player nullable FK User SET_NULL
- game_version PROTECT
- client_type constrained
- started_at
- completed_at nullable
- score >=0
- level_reached <=32
- lives_used >=0
- nukes_used >=0
- victory bool
- validity = pending|valid|rejected
- validation_result object

ScoreSubmission:
- UUID PK
- OneToOne GameRun
- claimed_score >=0
- event_summary object
- payload_hash where implemented
- idempotency_key bounded/nullable
- submitted_at

LeaderboardEntry:
- UUID PK
- OneToOne GameRun
- score >=0 indexed
- display_name snapshot or documented deterministic profile read
- published_at

DATABASE CONSTRAINTS:
Use durable DB constraints/indexes where appropriate.

MIGRATIONS REQUIRED.

============================================================
GAME RUN INVARIANTS
============================================================

START:
completed_at = null
validity = pending

COMPLETE:
completed_at != null

PUBLISHABLE:
completed_at != null
validity = valid
score >= 0

Client cannot directly declare `valid`.

Backend owns completion/validation.

Only valid completed runs enter leaderboard publication.

============================================================
API
============================================================

REFINE EXISTING:

packages/contracts/openapi/galactic-gunners-api-v1.yaml

Keep:
/api/v1

Harden:

GET /health/
POST /game-runs/
POST /game-runs/{runId}/complete/
GET /leaderboard/

Define complete:
- request bodies;
- response schemas;
- components;
- UUID/date-time formats;
- nullable fields;
- query bounds;
- standard error schema;
- 2xx/4xx semantics.

Do NOT create /api/v2.

Leaderboard:
limit default 20, min1 max100
offset default0 min0

Ordering:
score DESC
published_at ASC

Only valid published runs.

============================================================
JSON SCHEMAS
============================================================

REFINE EXISTING FILES:

game-run.schema.json
score-submission.schema.json
score-event.schema.json
leaderboard-entry.schema.json

No handoff IDs in permanent identifiers.

Use additionalProperties=false unless documented otherwise.

Required score-event semantic vocabulary:

laser_target_hit
asteroid_destroyed
scout_destroyed
ship_destroyed
mothership_hit
mothership_destroyed
comet_destroyed
comet_nuke_bonus
shield_tile_hit

Locked scoring foundation:

LASER TARGET              +5
ASTEROID                  +10
SCOUT                     +25
SHIP                      +50
MOTHERSHIP HIT            +50
MOTHERSHIP DESTROYED      +1000
COMET                     +500
COMET BONUS               +1 NUKE
ALIEN HIT ON SHIELD TILE  -1

MINIMUM SCORE = 0
PLAYER DAMAGE PENALTY = NONE

Do not implement legacy gameplay in this sprint.

============================================================
WEB
============================================================

REFINE:

apps/web/

Requirements:
- strict TypeScript;
- successful typecheck;
- successful production build;
- Phaser mounted client-side only;
- no server-side Phaser instantiation;
- centralized API client boundary;
- centralized public config;
- no server secrets exposed through NEXT_PUBLIC.

Foundation API client methods:

health
startGameRun
completeGameRun
getLeaderboard

Do not build final product UI.

============================================================
GAME CORE
============================================================

REFINE:

game/
game/src/

Existing semantic folders include:

audio/
config/
entities/
input/
scenes/
services/
systems/

Retain/refine them.

DO NOT PORT LEGACY GAMEPLAY.

Required:
- independent typecheck;
- explicit public entry;
- 0 imports from Legacy_Game;
- 0 React/Next imports in simulation/runtime core;
- API access behind services;
- input abstraction;
- typed scoring config;
- typed input-capability foundation.

Input capability foundation supports coexistence:

keyboard
pointer
touch
gamepad

NO MANUAL TOUCH/NON-TOUCH MODE SELECTOR in future architecture.

============================================================
DATABASE / MIGRATIONS
============================================================

PostgreSQL authoritative.

Expected model apps:

accounts
players
game_runs
leaderboard

Required:

migrations committed
python manage.py check PASS
python manage.py makemigrations --check PASS
migrate from empty DB PASS
pytest PASS

Do not create a duplicate generic model app.

============================================================
CONFIG / ENV / DOCKER
============================================================

REFINE EXISTING:

.env.example
docker-compose.yml
backend/Dockerfile
apps/web/Dockerfile
backend settings
web config

Environment contract includes:

POSTGRES_DB
POSTGRES_USER
POSTGRES_PASSWORD
DATABASE_URL
DJANGO_SETTINGS_MODULE
DJANGO_SECRET_KEY
DJANGO_ALLOWED_HOSTS
DJANGO_DEBUG
DJANGO_CORS_ALLOWED_ORIGINS if used
NEXT_PUBLIC_API_BASE_URL

NO REAL SECRETS.

Docker target:

docker compose up --build

Services:

db
backend
web

Required proof:

docker compose config PASS
docker compose build PASS
db healthy
backend healthy
web reachable
GET /api/v1/health/ = 200
database connectivity PASS

============================================================
CI / QUALITY
============================================================

REFINE:

.github/workflows/quality.yml
package.json

Root npm quality must aggregate the intended JS/TS/contract gates.

Use deterministic install:
npm ci

Client/game CI must cover:
- contract validation
- game typecheck
- web typecheck
- web build
- tests if configured

Backend CI must cover:
- install
- Django check
- makemigrations --check
- pytest
- lint/format if configured

Provide full-stack Docker smoke proof in CI or an evidenced equivalent.

Do not delete checks to get green CI.

============================================================
ASSURANCE
============================================================

Required:

ROOT_LOCKFILE_PRESENT = PASS
NPM_CI = PASS

OPENAPI_PARSE = PASS
OPENAPI_LOCAL_REFS = PASS
JSON_SCHEMAS_PARSE = PASS
CONTRACT_VALIDATION = PASS

DJANGO_CHECK = PASS
MAKEMIGRATIONS_CHECK = PASS
MIGRATE_EMPTY_DB = PASS
PYTEST = PASS
MODEL_CONSTRAINT_TESTS = PASS
GAME_RUN_LIFECYCLE_TESTS = PASS
LEADERBOARD_VALIDITY_FILTER_TEST = PASS

HEALTH_200 = PASS
START_RUN_201 = PASS
COMPLETE_RUN_200 = PASS
DUPLICATE_COMPLETE_REJECTED_OR_IDEMPOTENT = PASS
UNKNOWN_RUN_404 = PASS
INVALID_PAYLOAD_4XX = PASS
LEADERBOARD_200 = PASS
INVALID_RUN_NOT_PUBLISHED = PASS

WEB_TYPECHECK = PASS
WEB_BUILD = PASS

GAME_TYPECHECK = PASS
GAME_IMPORTS_FROM_LEGACY = 0
GAME_IMPORTS_FROM_NEXT_REACT = 0
SCORING_CONFIG_TEST = PASS
INPUT_CAPABILITY_MODEL_PRESENT = PASS

DOCKER_COMPOSE_CONFIG = PASS
DOCKER_BUILD = PASS
DB_HEALTHY = PASS
BACKEND_HEALTHY = PASS
WEB_REACHABLE = PASS
API_HEALTH_REACHABLE = PASS

REAL_SECRETS_COMMITTED = 0
BROWSER_EXPOSED_SERVER_SECRETS = 0

LEGACY_GAME_MUTATED = NO
ASSET_RUNTIME_INTEGRATION_PERFORMED = NO

GOVERNANCE_DEBT_COUNT = 0

============================================================
GOVERNANCE CURRENTNESS
============================================================

Do not finish code and leave documentation for later.

Exit requires:

IMPLEMENTATION CURRENT
=
DOCUMENTATION CURRENT
=
SCHEMAS CURRENT
=
STANDARDS CURRENT
=
GUIDES CURRENT
=
REGISTERS CURRENT
=
EVIDENCE CURRENT

GOVERNANCE_DEBT_COUNT = 0

Refine current documents.
Do not create unnecessary competing currentness documents.

Final programme truth must remain:

v0.1 legacy = contained/reference
asset/IP baseline = canonical/accepted
production architecture = hardened/reconciled
promotion to dev = NOT YET PERFORMED
v1.0 gameplay build = NOT YET STARTED

============================================================
EXCLUSIONS
============================================================

DO NOT:

- start v1.0 gameplay implementation;
- port legacy scenes;
- integrate production assets into gameplay;
- build Boarding Mode;
- build payments/subscriptions;
- package native/console releases;
- mutate accepted Legacy_Game;
- delete Legacy_Game;
- promote branches;
- retire main;
- merge.

============================================================
PR
============================================================

Open exactly one PR:

HEAD:
feature/architecture-hardening-reconciliation

BASE:
feature/production-architecture-foundation

TITLE:
Harden and reconcile Galactic Gunners production architecture foundation

Leave:

OPEN
DRAFT
NOT MERGED

============================================================
RETURN
============================================================

Return:

GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_008

Include:

- entry HEAD;
- final pushed HEAD;
- exact existing authorities refined;
- model/migration summary;
- OpenAPI/schema reconciliation;
- API smoke results;
- game/web/backend checks;
- Docker full-stack evidence;
- security/config audit;
- Legacy_Game dependency/mutation audit;
- asset integration audit;
- governance debt count;
- GitHub Actions run ID/results;
- PR number/URL/state;
- local HEAD == remote;
- clean worktree;
- POST_BOX state;
- sealed SHA-256.

DO NOT MERGE.

RETURN FOR CTO / FOUNDER REVIEW.
