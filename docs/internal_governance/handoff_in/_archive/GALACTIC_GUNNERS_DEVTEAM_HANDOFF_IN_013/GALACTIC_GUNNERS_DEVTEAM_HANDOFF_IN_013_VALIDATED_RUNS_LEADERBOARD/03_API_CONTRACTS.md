# H013 API CONTRACTS

Base:
`/api/v1/`

Use existing API/error conventions.

## 1. Start GameRun

### POST `/game-runs/`

Request:

```json
{
  "game_version": "1.0.0",
  "client_type": "web",
  "level_slug": "level-01",
  "level_version": 1,
  "level_checksum": "...",
  "seed": 12345
}
```

Response:

```json
{
  "id": "uuid",
  "validation_state": "ACTIVE",
  "started_at": "...",
  "level": {
    "slug": "level-01",
    "version": 1,
    "checksum": "..."
  },
  "seed": 12345
}
```

Server resolves level authority.
Do not trust arbitrary client level metadata.

## 2. Complete GameRun

### POST `/game-runs/{id}/complete/`

Request:

```json
{
  "completed_at": "...",
  "duration_ms": 185240,
  "victory": true,
  "level_reached": 3,
  "score": 4785,
  "lives_end": 2,
  "nukes_end": 1,
  "event_summary": {
    "scout_kills": 116,
    "ship_kills": 2,
    "asteroid_kills": 4,
    "mothership_hits": 0,
    "mothership_kills": 0,
    "comet_kills": 1,
    "shield_enemy_hits": 15,
    "nuke_uses": 3,
    "life_pickups": 1,
    "nuke_pickups": 1,
    "levels_completed": [1,2]
  },
  "trace_digest": "..."
}
```

Response accepted:

```json
{
  "run_id": "uuid",
  "validation_state": "VALIDATED",
  "validated_score": 4785,
  "leaderboard_eligible": true,
  "rejection_codes": []
}
```

Response rejected:

```json
{
  "run_id": "uuid",
  "validation_state": "REJECTED",
  "validated_score": null,
  "leaderboard_eligible": false,
  "rejection_codes": ["SCORE_ARITHMETIC_MISMATCH"]
}
```

## 3. Player leaderboard display name

### GET `/player/leaderboard-profile/`

### PATCH `/player/leaderboard-profile/`

Request:

```json
{
  "display_name": "STARFIRE"
}
```

Rules:
- trim;
- normalize;
- minimum/maximum length;
- allowed character set;
- profanity/reserved-word validation;
- uniqueness policy specified below.

Recommended:
- display names need not be globally unique if ranking entry remains tied to player/run identity;
- normalized offensive/reserved names denied;
- duplicate names permitted unless product UX strongly requires uniqueness.

Do not expose email/real identity publicly.

## 4. Global leaderboard

### GET `/leaderboard/`

Query:

```text
?limit=100
?offset=0
?around_me=true
```

Initial v1 is global all-time unless an existing season model is already governed.

Response:

```json
{
  "results": [
    {
      "rank": 1,
      "display_name": "STARFIRE",
      "score": 120500,
      "campaign_level_reached": 6,
      "victory": true,
      "accepted_at": "..."
    }
  ],
  "total": 1250,
  "player": {
    "rank": 82,
    "best_score": 45100
  }
}
```

Do not return:
- email;
- internal user ID unless opaque/public-safe;
- IP;
- moderation details;
- validation internals.

## 5. Player best

### GET `/leaderboard/me/`

Return:
- best validated entry;
- rank;
- recent validated submissions optionally;
- suppressed entries only if useful to the player and safe.

## 6. Admin moderation APIs

Under:

`/api/v1/admin/leaderboard/`

Required semantic operations:

```text
GET  /entries/
POST /entries/{id}/suppress/
POST /entries/{id}/restore/
POST /players/{id}/suppress/
POST /players/{id}/restore/
POST /players/{id}/rename/
GET  /audit/
GET  /rejected-runs/
GET  /runs/{id}/validation/
```

All require privileged Django permission.

Suggested permission:

`can_moderate_leaderboard`

Do not rely on hidden route alone.

## 7. Validation-detail API

Admin-only:

### GET `/api/v1/admin/game-runs/{id}/validation/`

Return:
- content denominator;
- submitted score;
- expected score;
- individual check results;
- rejection codes;
- summary;
- trace digest;
- audit.

## 8. Error envelope

Use existing standard:

```json
{
  "code": "SCORE_VALIDATION_FAILED",
  "detail": "The submitted run could not be validated.",
  "errors": {
    "score": ["Expected 4750; received 4785."]
  }
}
```
