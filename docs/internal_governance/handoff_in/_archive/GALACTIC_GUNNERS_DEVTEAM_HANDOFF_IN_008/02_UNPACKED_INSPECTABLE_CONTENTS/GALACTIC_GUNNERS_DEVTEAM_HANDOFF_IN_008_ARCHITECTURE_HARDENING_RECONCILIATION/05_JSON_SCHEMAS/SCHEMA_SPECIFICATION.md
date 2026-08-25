# JSON SCHEMA SPECIFICATION

REFINE EXISTING FILES IN PLACE:

- `packages/contracts/schemas/game-run.schema.json`
- `packages/contracts/schemas/score-submission.schema.json`
- `packages/contracts/schemas/score-event.schema.json`
- `packages/contracts/schemas/leaderboard-entry.schema.json`

Use JSON Schema draft 2020-12 unless the existing validator requires a compatible declared draft.

All production schemas should use:

```json
"additionalProperties": false
```

unless there is a documented compatibility reason not to.

## `game-run.schema.json`

Required logical shape:

```text
id                  uuid
game_version        string 1..32
client_type         enum web/windows/macos/android/ios/unknown
started_at          date-time
completed_at        date-time | null
score               integer >= 0
level_reached       string <= 32
lives_used          integer >= 0
nukes_used          integer >= 0
victory             boolean
validity            enum pending/valid/rejected
```

## `score-submission.schema.json`

Required:

```text
run_id              uuid
claimed_score       integer >= 0
level_reached       string <= 32
lives_used          integer >= 0
nukes_used          integer >= 0
victory             boolean
event_summary       object
idempotency_key     optional bounded string
```

The schema validates structure, not legitimacy of the score.

## `score-event.schema.json`

This is the canonical score-event contract foundation.

Required event envelope:

```text
event_type          semantic enum
sequence            integer >= 0
occurred_at_ms      integer >= 0
points_delta        integer
target_type         semantic enum when applicable
metadata            bounded object
```

Scoring event types must accommodate the locked game scoring vocabulary without forcing gameplay implementation in this sprint:

```text
laser_target_hit
asteroid_destroyed
scout_destroyed
ship_destroyed
mothership_hit
mothership_destroyed
comet_destroyed
comet_nuke_bonus
shield_tile_hit
```

Do not encode handoff numbers.

Do not encode mutable display copy as identifiers.

## `leaderboard-entry.schema.json`

Required:

```text
run_id              uuid
display_name        string 1..64
score               integer >= 0
published_at        date-time
```

## Cross-contract consistency

Names/types/enums used in OpenAPI and standalone schemas must agree.

Contract validator must fail if:
- JSON cannot parse;
- schema draft invalid;
- required schema missing;
- OpenAPI cannot parse;
- local `$ref` cannot resolve;
- required core component missing;
- duplicate schema identity exists.

If exact deep OpenAPI-vs-JSON-Schema semantic equivalence is not automatically checked, document that limitation and add targeted tests.
