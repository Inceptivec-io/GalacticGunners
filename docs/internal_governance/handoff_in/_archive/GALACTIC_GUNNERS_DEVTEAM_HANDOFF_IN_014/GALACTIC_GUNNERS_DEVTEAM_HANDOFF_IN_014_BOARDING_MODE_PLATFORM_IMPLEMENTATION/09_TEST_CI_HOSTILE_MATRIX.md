# Test, CI, and hostile matrix

All existing quality and hostile suites remain mandatory. Add focused Boarding suites to the default quality and GitHub Actions path; a manually run test is not sufficient.

## Unit and contract tests

- JSON Schema accepts supplied fixtures and rejects unknown fields, bad IDs, bad geometry, unreachable exit, disconnected rooms, overlapping blocking geometry, invalid caps/drop weights, missing referenced assets, and checksum mismatch.
- OpenAPI/schema examples validate in CI; generated/client TypeScript types remain in sync.
- Seed derivation and LCG golden vectors match Python and TypeScript.
- State machine permits only the documented transitions and remains idempotent under duplicate callbacks.
- Level 1–6 definitions remain valid; only Level 4 has one Boarding anchor.
- Offer is exactly 8,000 active ms; pause exclusion and boundary behavior are tested.
- Snapshot canonicalization/digest is stable; restore preserves shooter state exactly except allowed delta/source removal.
- Physics constants, input edges/dead zone/reset, timer, damage, invulnerability, caps, drops, exit, and zero score are tested without Phaser.
- Character metadata frame geometry, true alpha, forbidden checker colors/patterns, and runtime manifest hashes are tested.

## Backend tests

- Models, constraints, immutability, fixture data migration, canonical checksums, and admin/read-only protections.
- Start success for authenticated and anonymous flows; ownership/token denial; duplicate/concurrent start; parent/level/anchor/source/interior/resource mismatch.
- Complete success, timeout, player death, abort, all stable rejection codes, unknown fields, oversize trace, idempotent retry, conflicting retry, concurrent completion, and parent application exactly once.
- Detail permission and secret-redaction tests.
- Parent completion blocks unresolved/invalid/offline Boarding and accepts valid Boarding without new score.
- Existing H013 hostile score, leaderboard, moderation, and GameRun tests remain green.

## Phaser/runtime tests

- Designated Level 4 entity disables once and awards only 25 once.
- Envelope/confirm/expiry behaviors, rapid confirm, pause/unpause, blur, controller disconnect, and scene re-entry.
- Full success, timeout with remaining life, timeout to zero lives, projectile/hazard death, pickup caps, container duplicate collision, and return.
- Keyboard, gamepad, and touch parity.
- Missing asset/manifest/definition fails loudly in test and uses recoverable production error path.
- Offline start and dropped completion never produce a validated leaderboard run.

## Hostile cases

At minimum automate: forged seed; wrong checksum/version/anchor/source; replayed token/run; guessed UUID without token; token from another run; client-selected resources; negative/float/decreasing time; event after terminal; teleport exit; rapid fire; phantom hit/kill/pickup; duplicate kill/container/pickup; cap overflow; forged outcome; early/late timeout; success without exit; hidden score event; mutated body under idempotency key; concurrent completions; >512 events; oversized JSON; unknown fields; malformed UUID/hash; expired/inactive/completed parent; and completion before start.

## Commands and CI jobs

Keep `npm run quality` green and add stable scripts:

- `npm run contracts:boarding:validate`
- `npm run test:boarding`
- `npm run runtime:boarding`
- `npm run runtime:boarding:hostile`

GitHub Actions must expose clearly named successful checks for backend, client-and-game, docker-smoke, runtime-hostile, existing H013 hostile families, boarding-contracts, boarding-runtime, and boarding-hostile. Use the repository's pinned toolchain and no unreviewed floating actions.

## Docker and browser proof

Build and start the documented Docker stack from clean state. Prove backend health, frontend load, migrations, seeded Level 1–6 authority, and Level 4 interior publication. Run the complete Boarding journey in a real browser at 1280×720 with console and network capture. Zero uncaught errors, failed required requests, missing assets, mixed content, or accessibility-critical violations.

## Required screenshots

Capture: Level 4 active; disabled ship offer OFF; offer ON/in-envelope; Boarding airlock; corridor combat; damage/invulnerability; opened container/pickup; final-ten-second warning; success tally; return to identical shooter state; timeout return; and zero-life game over. Add a mobile/touch view and a gamepad evidence record. Screenshots alone never replace assertions.
