# Boarding API contract

The normative OpenAPI fragment is `contracts/openapi-boarding-v1.yaml`. All responses use JSON. Route prefix is `/api/v1`. Unknown fields are rejected. UUIDs use canonical lowercase form. Timestamps use UTC RFC 3339.

Maximum JSON request body is 262,144 bytes. Maximum completion trace is 512 events. Throttle start at 10 requests/minute, complete at 20 requests/minute, and detail at 60 requests/minute per authenticated user or privacy-safe anonymous client key, in addition to existing global throttles. Return `429` with `Retry-After` when exceeded.

## Start

`POST /api/v1/game-runs/{game_run_id}/boarding-runs/start/`

Request contains the exact anchor/source/interior bindings, shooter digest, and bounded starting resources. The server row-locks the parent GameRun and verifies it is active, uncompleted, version-bound, owned or anonymously addressable under the existing parent capability, and eligible for this anchor. It derives the seed and creates at most one run.

Success is `201`. An identical retry returns `200` and the same run without minting a new token; for security, the original plaintext token can be returned only when the retry presents it. Otherwise return the existing run metadata without a token and require the caller to retain its original.

The initial response returns a base64url, no-padding 32-byte random `boarding_token` exactly once for anonymous play. Store only SHA-256. Authenticated callers may omit token use but must own the parent run.

Stable failures include `PARENT_RUN_NOT_ACTIVE`, `LEVEL_BINDING_MISMATCH`, `ANCHOR_NOT_FOUND`, `SOURCE_ENTITY_MISMATCH`, `INTERIOR_NOT_PUBLISHED`, `INTERIOR_CHECKSUM_MISMATCH`, `RESOURCE_STATE_INVALID`, and `BOARDING_ATTEMPT_EXISTS`.

## Complete

`POST /api/v1/boarding-runs/{boarding_run_id}/complete/`

Requires `Idempotency-Key`. Anonymous callers also send `X-Boarding-Token`. The server locks run and parent, parses the supplied event trace, replays deterministic drops/fire timing and legal transitions, validates outcome/duration/resource deltas/caps/counters/empty score events, and writes the terminal result atomically. It applies the normalized return delta to the parent run exactly once.

`SUCCESS` requires exit interaction before 60,000 ms. `TIMEOUT` requires `duration_ms=60000` and exactly one life loss. `PLAYER_DEAD` requires `lives_end=0`. `ABORTED` is reserved for explicit runtime invalidation, makes the parent unvalidated, and never awards resources.

Validation rejection is an immutable `422` terminal result with a stable code; malformed/auth failures do not mutate the run. Codes include `INVALID_EVENT_SEQUENCE`, `INVALID_DURATION`, `INVALID_OUTCOME`, `INVALID_RESOURCE_DELTA`, `INVALID_DROP`, `INVALID_COUNTER`, `SCORE_EVENT_FORBIDDEN`, `SHOOTER_DIGEST_MISMATCH`, and `IDEMPOTENCY_CONFLICT`.

## Event trace semantics

`sequence` starts at zero and increments by one. `at_ms` is integer active-simulation time and never decreases; equal times are ordered by sequence. `INPUT_CHANGED` records the complete horizontal state (`-1`, `0`, `1`) and edge actions pressed on that step. All other events are deterministic simulation outputs, not client claims applied directly. For `PLAYER_FIRE`, `entity_id=player` and `target_id` is the intended target when one exists. For hit/kill/open/pickup/exit events, `entity_id` is the affected definition/entity and `target_id=player` identifies the player actor where applicable. `value` is allowed only for container/drop and pickup events. Pause start/end preserves active `at_ms`; server replay excludes the paused interval.

Server replay consumes `INPUT_CHANGED`, definition, seed, and fixed-step constants to reproduce derived events and the terminal summary. Derived events supplied by the client must match the replay exactly; they are evidence and discrepancy detection, never authority.

## Detail

`GET /api/v1/boarding-runs/{boarding_run_id}/`

Authenticated callers must own the parent. Anonymous callers require `X-Boarding-Token`. Return binding, state, validated counters, normalized return state, and public interior definition. Never return capability hash, raw token, private ownership data, or server validation internals useful for bypass.

## Parent completion

A parent `GameRun` with an online Boarding run cannot become leaderboard-valid until Boarding is terminal and `validation_result=VALID`. A rejected, aborted, missing, or locally completed/unacknowledged Boarding run makes the parent ineligible. Existing H013 score validation remains authoritative and continues to reject unrecognized score events.
