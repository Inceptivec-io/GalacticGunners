# Data models and migrations

Create a Django app named `boarding`; add it to settings and package inclusion. Follow the repository's UUID, timestamp, enum, constraint, index, immutable-version, service, and audit conventions. Generate and commit migrations; do not hand-edit migration history.

## `Interior`

| Field | Type | Rules |
|---|---|---|
| `id` | UUID primary key | generated |
| `slug` | SlugField(64) | unique, immutable after first version |
| `name` | CharField(120) | required |
| `ship_type` | enum string | only `ALIEN_FRIGATE` in H014 |
| `active_version` | nullable FK `InteriorVersion` | `PROTECT`, must belong to this interior and be published |
| timestamps | repository convention | required |

## `InteriorVersion`

| Field | Type | Rules |
|---|---|---|
| `id` | UUID primary key | generated |
| `interior` | FK `Interior` | `PROTECT`, indexed |
| `version` | PositiveInteger | unique with interior; starts at 1 |
| `definition` | JSONField | validates against supplied InteriorDefinition schema |
| `checksum` | CharField(64) | lowercase SHA-256 of RFC 8785/JCS canonical definition bytes |
| `status` | enum | `DRAFT`, `PUBLISHED`, `RETIRED` |
| `published_at` | nullable datetime | required iff published/retired |
| timestamps | repository convention | required |

Published versions are immutable. Database and service constraints reject checksum mismatch, version mutation, cross-interior active version, and duplicate `(interior, version)`.

## `BoardingRun`

| Field | Type | Rules |
|---|---|---|
| `id` | UUID primary key | server generated |
| `game_run` | FK existing `GameRun` | `PROTECT`, indexed |
| `player` | nullable FK existing player/user identity | same ownership convention as parent |
| `level` / `level_version` | FKs existing authority | `PROTECT` |
| `level_checksum` | CharField(64) | immutable copy |
| `source_entity_id` | CharField(128) | exact deterministic ID |
| `source_entity_type` | CharField(32) | `scout` |
| `source_ship_type` | enum | `ALIEN_FRIGATE` |
| `anchor_id` | CharField(96) | LevelDefinition anchor ID |
| `interior_version` | FK `InteriorVersion` | `PROTECT` |
| `interior_checksum` | CharField(64) | immutable copy |
| `seed` | PositiveBigInteger | unsigned 32-bit, server-derived |
| `status` | enum | `ACTIVE`, `COMPLETED`, `REJECTED` |
| `outcome` | nullable enum | `SUCCESS`, `TIMEOUT`, `PLAYER_DEAD`, `ABORTED` |
| `started_at`, `completed_at` | datetimes | completion required only when terminal |
| `time_limit_ms` | PositiveInteger | exactly 60000 |
| `duration_ms` | nullable PositiveInteger | 0..60000 for terminal client summary |
| `lives_start`, `lives_end` | PositiveSmallInteger | 0..3; start copied from parent state |
| `nukes_start`, `nukes_end` | PositiveSmallInteger | 0..2 |
| `aliens_killed` | PositiveSmallInteger | 0..6 |
| `containers_opened` | PositiveSmallInteger | 0..4 |
| `lives_found`, `nukes_found` | PositiveSmallInteger | deterministic pickup counts |
| `score_events` | JSONField | must be exactly `[]` |
| `shooter_state_digest` | CharField(64) | lowercase hex supplied at start and immutable |
| `return_state` | JSONField | server-normalized validated delta only |
| `validation_result` | enum | `PENDING`, `VALID`, `INVALID` |
| `validation_code` | CharField(64) | stable code; blank while pending |
| `capability_token_hash` | nullable CharField(64) | SHA-256 of 32-byte random token for anonymous parent runs; null iff authenticated parent ownership is authoritative; never returned |
| timestamps | repository convention | required |

Unique constraint: `(game_run, level_version, anchor_id, source_entity_id)`. Check constraints enforce all caps, status/terminal consistency, empty score events, and checksum/digest formats where supported; service validation duplicates security-critical checks.

## `BoardingSubmission`

| Field | Type | Rules |
|---|---|---|
| `id` | UUID primary key | generated |
| `boarding_run` | OneToOne FK | `PROTECT` |
| `idempotency_key` | CharField(64) | unique per run; normalized opaque ASCII |
| `raw_summary` | JSONField | immutable exact validated request body |
| `summary_hash` | CharField(64) | JCS SHA-256 |
| `accepted` | Boolean | required |
| `rejection_code` | CharField(64) | blank iff accepted |
| `validated_at` | datetime | required |

Same idempotency key plus identical hash returns the stored response. Same key plus different hash rejects `IDEMPOTENCY_CONFLICT`. A second key after terminal completion returns the stored terminal result without reapplying effects.

## `BoardingRunEvent` — required append-only audit

| Field | Type | Rules |
|---|---|---|
| `id` | UUID primary key | generated |
| `boarding_run` | FK `BoardingRun` | `PROTECT`, indexed |
| `sequence` | PositiveInteger | unique with run, contiguous from zero |
| `event_type` | enum | `STARTED`, `VALIDATED`, `REJECTED`, `RETURN_APPLIED`, `RETRY_OBSERVED` |
| `payload` | JSONField | server-authored, redacted public facts only |
| `payload_hash` | CharField(64) | JCS SHA-256 |
| `created_at` | datetime | server generated |

This model is immutable after insert, is never a score authority, and never stores capability material, headers, raw browser traces, email, IP address, or shooter snapshot. Admin is read-only. The service writes audit events in the same transaction as the state transition they describe.

## Seed derivation

Derive the unsigned 32-bit Boarding seed on the server as the first four bytes, big-endian, of:

`SHA-256(game_run.seed + ":" + source_entity_id + ":" + interior_checksum)`

Return it from start. Both server replay and client use the existing LCG: `state = (1664525 * state + 1013904223) >>> 0`.

## Migration and seed data

Create a data migration that admits `fixtures/interior-alien-frigate-v1.json`, calculates its canonical checksum, publishes version 1, and assigns it active. The migration must be idempotent and must fail on conflicting existing content rather than overwrite it.

The expected RFC 8785/JCS SHA-256 of the supplied fixture is `e9b1af65f0daef6725a7ddf4683b5f6d503e25dabc97aef1212102e6b1e994f3`. Python, TypeScript, migration, and database values must all match.
