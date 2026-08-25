# API CONTRACT SPECIFICATION

Refine existing:

`packages/contracts/openapi/galactic-gunners-api-v1.yaml`

Base path remains:

`/api/v1`

The OpenAPI file must become complete enough to validate request/response structure rather than containing description-only responses.

## 1. Health

```http
GET /api/v1/health/
```

200:

```json
{
  "status": "ok",
  "service": "galactic-gunners-api",
  "api_version": "v1"
}
```

No secrets, database URLs or infrastructure details.

## 2. Start Game Run

```http
POST /api/v1/game-runs/
Content-Type: application/json
```

Request:

```json
{
  "game_version": "1.0.0-dev",
  "client_type": "web"
}
```

Response 201:

```json
{
  "id": "<uuid>",
  "game_version": "1.0.0-dev",
  "client_type": "web",
  "started_at": "<date-time>",
  "completed_at": null,
  "score": 0,
  "validity": "pending"
}
```

### Foundation auth behaviour

This sprint may support:
- authenticated user if auth exists in request;
- guest/null player where allowed.

Do not build full registration/login product flows merely to exercise GameRun.

The auth policy must be explicitly documented.

## 3. Complete Game Run

```http
POST /api/v1/game-runs/{runId}/complete/
```

Request:

```json
{
  "claimed_score": 1250,
  "level_reached": "boss",
  "lives_used": 2,
  "nukes_used": 1,
  "victory": true,
  "event_summary": {}
}
```

Response 200:

```json
{
  "id": "<uuid>",
  "score": 1250,
  "level_reached": "boss",
  "lives_used": 2,
  "nukes_used": 1,
  "victory": true,
  "validity": "valid",
  "completed_at": "<date-time>"
}
```

For this foundation sprint, a minimal deterministic validation policy is acceptable, but it must be server-owned and explicitly documented.

Do not claim anti-cheat security that has not been implemented.

Required error semantics:

```text
400 invalid payload
404 unknown run/version where applicable
409 already completed / incompatible lifecycle mutation
422 semantic validation rejection if selected by project convention
```

Choose one stable API error model and document it.

## 4. Leaderboard

```http
GET /api/v1/leaderboard/
```

Query parameters:

```text
limit   integer, default 20, min 1, max 100
offset  integer, default 0, min 0
```

Response:

```json
{
  "count": 1,
  "results": [
    {
      "run_id": "<uuid>",
      "display_name": "PLAYER",
      "score": 1250,
      "published_at": "<date-time>"
    }
  ]
}
```

Ordering:

```text
score DESC
published_at ASC
```

Only valid published entries.

## Contract requirements

OpenAPI must define:
- components/schemas;
- request bodies;
- response schemas;
- parameter bounds;
- response codes;
- standard error schema;
- UUID/date-time formats;
- nullable fields accurately;
- API version metadata.

Do not create `/api/v2`.
