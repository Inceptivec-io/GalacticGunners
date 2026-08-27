# Game-core and client implementation

## File and ownership shape

Implement the minimum cohesive additions described in `13_IMPLEMENTATION_FILE_PLAN.md`. Keep deterministic rules in game-core modules that can execute without Phaser or the DOM. Phaser consumes those rules and renders state. Network transport is isolated behind a typed Boarding client.

## Coordinator boundary

Add a `BoardingCoordinator` owned by the runtime session. It is the only component allowed to move between shooter and Boarding states. It:

1. Observes the configured source entity's lethal transition.
2. Opens/closes the offer and handles confirm.
3. Captures a canonical shooter snapshot and digest.
4. Calls start or activates explicit offline mode.
5. Pauses the shooter and starts `BoardingScene` with the immutable start payload.
6. Accepts one terminal scene result.
7. Calls complete or queues one immutable retry.
8. Applies one validated/local-offline return delta and resumes or game-overs.

Scene code must not directly mutate GameRun validation or leaderboard state.

## Simulation

Use the existing fixed-step/update conventions and `SeededRng`. Define typed entities for player, alien, projectile, container, hazard, pickup, door, spawn, and exit. Use stable definition IDs from the fixture. Record a compact ordered event trace containing integer `at_ms`, monotonic `sequence`, enum event type, definition/entity ID, and only event-specific integer/string data. No floating-point positions are submitted as authority.

The server replays events against the definition and seed. Client-visible animation is not authoritative.

## Shooter snapshot canonicalization

Add a versioned schema and serializer. Sort object keys and all entity collections by stable ID before JCS hashing. Reject NaN, Infinity, functions, Phaser objects, timestamps, and unordered maps. Snapshot capture and restore need round-trip tests and a before/after digest equality test, excluding the explicitly applied return delta and removal of the source ship.

## Scene construction

`BoardingScene` loads only manifest-listed assets. Build static collision from fixture geometry and decorative layers from admitted assets. Camera follows player horizontally, clamps to 0..4096, never scrolls vertically, and uses no shake that changes collision/input.

HUD shows global lives/nukes and integer ceiling seconds remaining. Warning begins at 10 seconds. Pause uses the existing pause conventions and freezes the simulation clock. On success show tally, then require Return to Ship confirmation. Timeout/player death transitions without a success tally.

## Input

Extend `InputSystem` with a context/profile rather than changing shooter mappings. Edge-trigger jump, interact, pause, and fire initiation; held movement remains level-triggered. Apply a 0.2 gamepad axis dead zone. Reset held/edge states on blur, pause, scene transition, and controller disconnect. Prevent browser scroll/default only while the game surface owns focus.

## Accessibility and reduced motion

Expose accessible names and instructions for canvas controls in the shell. All critical prompts have text, not color alone. Preserve visible focus. With reduced motion, remove decorative flashes/camera effects but preserve timing and collision. Audio mute/volume conventions continue to apply.

## Actual duration

Remove any hardcoded completion duration from the shared session path. Track active gameplay time monotonically and exclude pause/Boarding intervals from shooter duration. Boarding duration is its own active clock. Existing level completion tests must prove no regression.

## Network failure rules

- Start failure: set `onlineValidation=false`, continue local Boarding, and prevent later leaderboard submission.
- Completion transient failure: persist exactly one immutable summary keyed by run ID and idempotency key; retry on session re-entry while the token remains available.
- Completion validation rejection: show a non-destructive validation message, preserve evidence, mark parent invalid, and return using the server-normalized terminal state if supplied.
- Never retry a changed body under the same key.

## No silent fallbacks

Missing definition, checksum, required asset, animation metadata, anchor, or API field is a hard development/test error. Production may show the existing recoverable error shell, but must not substitute placeholder art or fabricate a successful Boarding result.
