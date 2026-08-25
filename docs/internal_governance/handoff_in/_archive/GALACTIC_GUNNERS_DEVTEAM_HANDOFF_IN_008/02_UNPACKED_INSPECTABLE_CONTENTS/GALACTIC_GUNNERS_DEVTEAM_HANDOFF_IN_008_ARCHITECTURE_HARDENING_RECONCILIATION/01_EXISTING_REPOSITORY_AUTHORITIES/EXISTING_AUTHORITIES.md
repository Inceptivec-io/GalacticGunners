# EXISTING REPOSITORY AUTHORITIES — REFINE, DO NOT FORK

Development must begin by reading and reconciling the existing authorities listed below.

## Root / orchestration

- `AGENTS.md`
- `README.md`
- `package.json`
- `package-lock.json`
- `.env.example`
- `.gitignore`
- `.dockerignore`
- `docker-compose.yml`
- `.github/workflows/quality.yml`

## Production architecture

- `apps/web/`
- `apps/web/Dockerfile`
- `game/`
- `game/src/`
- `backend/`
- `backend/AGENTS.md`
- `backend/Dockerfile`
- `backend/pyproject.toml`

## Existing Django identity/domain models

REFINE THESE EXACT FILES WHERE REQUIRED:

- `backend/accounts/models.py`
  - existing `User(AbstractUser)`

- `backend/players/models.py`
  - existing `PlayerProfile`

- `backend/game_runs/models.py`
  - existing `GameVersion`
  - existing `GameRun`
  - existing `ScoreSubmission`

- `backend/leaderboard/models.py`
  - existing `LeaderboardEntry`

Do not create competing `models_v2.py`, `new_models.py`, alternate apps, or duplicate domain concepts.

## Existing API contract

REFINE:

`packages/contracts/openapi/galactic-gunners-api-v1.yaml`

Existing API prefix:

`/api/v1`

Existing routes already include:

- `GET /health/`
- `POST /game-runs/`
- `POST /game-runs/{runId}/complete/`
- `GET /leaderboard/`

Retain the semantic API version. Harden this existing contract rather than creating a second v1 definition.

## Existing JSON Schemas

REFINE IN PLACE:

- `packages/contracts/schemas/game-run.schema.json`
- `packages/contracts/schemas/score-submission.schema.json`
- `packages/contracts/schemas/score-event.schema.json`
- `packages/contracts/schemas/leaderboard-entry.schema.json`

Do not create schema names containing handoff/sprint numbers.

## Existing contract validator

REFINE:

`scripts/validate-contracts.mjs`

## Existing architecture/currentness/governance

Read and update all applicable material under:

- `docs/internal_governance/architecture/`
- `docs/internal_governance/currentness/`
- `docs/internal_governance/guides/`
- `docs/internal_governance/registers/`
- `docs/internal_governance/standards/`

Existing GG standards are retained and refined, not replaced.

## Legacy and asset boundaries

Read:

- `Legacy_Game/README.md`
- `Legacy_Game/LEGACY_SOURCE_COORDINATE.md`
- `assets/README.md`
- `assets/OWNERSHIP_PROVENANCE_AND_IP_BASELINE.md`
- `assets/registers/`

`Legacy_Game/` and `assets/` are inputs/reference authorities only for this sprint. Runtime integration is out of scope.
