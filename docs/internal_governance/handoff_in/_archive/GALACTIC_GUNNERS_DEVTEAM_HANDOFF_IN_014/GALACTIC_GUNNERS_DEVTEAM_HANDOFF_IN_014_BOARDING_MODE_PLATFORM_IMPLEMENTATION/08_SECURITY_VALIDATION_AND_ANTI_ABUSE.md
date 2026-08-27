# Security, validation, and anti-abuse

## Trust boundary

Treat every browser field and event as hostile. IDs and checksums bind a submission; they do not prove it. Server authority reconstructs the allowed result from published immutable definitions, server-derived seed, parent GameRun state, and the ordered trace.

## Authentication and capabilities

- Authenticated access requires ownership of the parent GameRun.
- Anonymous access requires a constant-time comparison of `SHA-256(X-Boarding-Token)` with the stored hash.
- Generate tokens with a cryptographically secure RNG; log neither plaintext tokens nor request headers.
- Apply existing API throttling plus a specific start/complete throttle keyed by authenticated user or privacy-safe client key.
- All detail/start/complete responses are `Cache-Control: no-store`.

## Start validation

Within one transaction and parent row lock, verify active parent status; exact level/version/checksum; exact Level 4 anchor; deterministic source ID and type; published interior/version/checksum; lives 1..3 and nukes 0..2 equal authoritative parent snapshot; digest format; and absence of a prior attempt. Never accept client-selected seed or time limit.

## Replay validation

Reject:

- non-integer, negative, decreasing, duplicate-sequence, or post-terminal event times;
- impossible travel/interactions based on conservative reachability bounds;
- fire faster than cooldown, hits without a legal live projectile, duplicate kills, duplicate container opens, or pickups without the resolved drop;
- events referencing absent/wrong-type IDs;
- actions during pause, invulnerability violations, more than six alien kills/four containers, or resource cap overflow;
- success without exit overlap/interaction, timeout before/after exactly 60,000 ms, or inconsistent zero-life outcome;
- any score event or score/multiplier delta;
- digest/binding/checksum mismatch.

Do not rely solely on wall-clock duration because client play may be offline or paused. Wall-clock is a secondary anomaly signal. Re-run the fixed-step simulation from the submitted input-state changes; compare every supplied derived event and terminal counter to replay. Collision comparisons use the exact fixture colliders plus a two-pixel integer tolerance solely for cross-runtime rounding. No other spatial or timing tolerance is permitted. Python and TypeScript golden fixtures must agree at every step.

## Concurrency and idempotency

Use `transaction.atomic()` and `select_for_update()` on BoardingRun and parent GameRun. Unique constraints are the final duplicate barrier. Completion creates submission, terminalizes BoardingRun, and applies parent resource state in the same transaction. Concurrent identical requests produce one effect and equivalent responses.

## Payload and error hygiene

Enforce the 262,144-byte request limit and 512-event limit before deep parsing. Reject unknown fields and overlong strings. Return stable public codes and a correlation ID; never expose stack traces, SQL, token hashes, or validation replay state. Security logs contain run IDs, codes, and hashes, not secrets or full raw payloads.

## Parent validation integration

The parent completion service must require all referenced Boarding runs to be `COMPLETED/VALID`, confirm their return deltas are already applied exactly once, and continue H013's authoritative score event reconstruction. Local/offline, rejected, aborted, or unresolved Boarding makes leaderboard eligibility false.
