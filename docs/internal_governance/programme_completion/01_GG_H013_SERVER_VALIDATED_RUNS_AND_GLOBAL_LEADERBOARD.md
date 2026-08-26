# GG-H013 — SERVER-VALIDATED RUNS + GLOBAL LEADERBOARD

## Outcome

Deliver server-authoritative run validation and a production global leaderboard in one PR.

## Domain models

Extend/confirm:

```text
GameRun
- id UUID
- player nullable
- client_type
- game_version
- level_id
- level_version
- level_checksum
- seed
- started_at
- completed_at
- score
- lives_used
- nukes_used
- level_reached
- victory
- validity_state
- validation_result JSONB
- submitted_at
```

```text
ScoreSubmission
- id
- game_run one-to-one
- submitted_score
- event_summary JSONB
- submitted_at
- validation_status
- expected_score
- rejection_code nullable
```

```text
LeaderboardEntry
- id
- player/profile
- game_run
- score
- campaign
- campaign_version
- rank_materialization fields if required
- accepted_at
- season nullable
```

Published leaderboard entries must reference ACCEPTED GameRuns only.

## Validation contract

Server recomputes permissible score from event summary and exact level version/checksum/seed.

Core governed scoring remains:

```text
LASER TARGET +5
ASTEROID +10
SCOUT +25
SHIP +50
MOTHERSHIP HIT +50
MOTHERSHIP DESTROYED +1000
COMET +500
COMET BONUS +1 NUKE
ALIEN HIT ON SHIELD TILE -1
```

No player-damage score penalty.

Reject:
- unknown run;
- duplicate completion;
- wrong level checksum;
- impossible duration;
- impossible kill/event counts;
- impossible nuke/life state;
- impossible progression;
- impossible score arithmetic;
- unsupported client/game version;
- malformed event summary.

## API

Required semantic endpoints:

```text
POST /api/v1/game-runs/
POST /api/v1/game-runs/{id}/complete/
GET  /api/v1/game-runs/{id}/
GET  /api/v1/leaderboard/
GET  /api/v1/leaderboard/me/
GET  /api/v1/leaderboard/around-me/
```

Leaderboard query supports:
- campaign;
- level/campaign-complete scope where relevant;
- period/season if enabled;
- page/cursor;
- authenticated personal position.

## Player UI

Next.js surfaces:
- leaderboard page;
- top players;
- player position;
- score;
- campaign completion status;
- graceful anonymous state;
- graceful offline/backend-unavailable state.

No development terminology.

## Identity/privacy

Django identity remains sole identity authority.
Display name must not require exposing email or unnecessary personal data.
Admin/moderation can invalidate fraudulent entries with audit trail.

## Degraded/offline

Game remains playable if leaderboard unavailable.
Offline run may remain local/unranked unless a secure later submission path is explicitly validated.
Do not silently rank unverifiable offline data.

## Anti-abuse

Required:
- duplicate submission protection;
- rate limiting;
- invalid-run rejection;
- admin invalidate/reinstate with audit;
- leaderboard pagination limits.

## Hostile tests

- forged score;
- duplicated run;
- altered level checksum;
- impossible nuke count;
- impossible duration;
- impossible progression;
- valid exact score;
- ties/rank ordering;
- personal rank;
- anonymous behavior;
- backend outage gameplay fallback;
- moderation audit.

## Exit gate

```text
CLIENT SCORE TRUST = NO
SERVER SCORE VALIDATION = PASS
VALIDATED RUN DENOMINATOR = REPRODUCIBLE
GLOBAL LEADERBOARD = PASS
INVALID RUN ON LEADERBOARD = 0
OFFLINE GAMEPLAY = PASS
RBAC/AUDIT = PASS
CI = GREEN
```

PR target: `dev`, Draft, not merged by Development.
