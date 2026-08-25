# Schema Register

| Schema | Canonical source | Migration authority | State |
|---|---|---|---|
| User identity | `backend/accounts/models.py` | Django migrations | GROUNDWORK |
| Player profile | `backend/players/models.py` | Django migrations | GROUNDWORK |
| GameVersion / GameRun / ScoreSubmission | `backend/game_runs/models.py` | Django migrations | GROUNDWORK |
| LeaderboardEntry | `backend/leaderboard/models.py` | Django migrations | GROUNDWORK |
| HTTP API | `packages/contracts/openapi/galactic-gunners-api-v1.yaml` | explicit API versioning | VERIFIED BY HANDOFF 008 |
| JSON payload contracts | `packages/contracts/schemas/` | contract versioning | VERIFIED BY HANDOFF 008 |

No production database state outranks committed models/migrations as change history.
