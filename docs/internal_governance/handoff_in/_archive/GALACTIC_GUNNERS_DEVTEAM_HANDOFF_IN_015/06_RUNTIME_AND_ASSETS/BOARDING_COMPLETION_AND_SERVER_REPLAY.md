# Boarding Completion and Server Replay Authority

H014 file presence and bounded unit tests are not H015 completion. This document specifies the missing operational slice.

## Entry

On lethal eligible anchor damage:

1. transition source entity to disabled/boardable, award the existing governed Shooter destruction event once and keep it present as disabled;
2. show Boarding offer for exactly 8,000 ms while Shooter continues;
3. require player inside configured entry envelope plus `INTERACT` edge;
4. if offer expires, destroy/remove source normally and continue Shooter;
5. on accept, freeze and serialize the complete Shooter state, including campaign checkpoint, score events, resources, entity/shield/projectile/objective states, timers/RNG and source identity;
6. hash canonical snapshot;
7. call Boarding start API and admit scene only on authorised response;
8. on API failure, safely resume exact Shooter snapshot and resolve source according to non-boarded path without duplicate score.

## Deterministic simulation

- fixed simulation step: 60 Hz integer tick authority;
- use authority physics values `gravity_y=1800` and `jump_velocity=-720` unless the admitted Interior schema explicitly supplies another validated value;
- all entities have stable IDs and deterministic iteration order;
- RNG is derived from server Boarding seed;
- pause records boundaries but does not advance simulation/timer;
- render interpolation is non-authoritative.

Required gameplay:

- left/right acceleration, grounded jump and collision against declared platforms/walls;
- player projectile spawn, travel, collision and rate limit;
- deterministic alien patrol/target/fire/projectile/hit/death;
- existing life-based player hit, temporary invulnerability and respawn;
- four governed containers with once-only deterministic contents;
- bounded LIFE/NUKE collection up to global caps;
- explicit exit interaction after required path/objective conditions;
- exact timer, timeout, player-death and abort paths;
- HUD timer/lives/nukes and result/return state.

All keyboard, touch and gamepad actions flow through `InputSystem`; scene code does not read raw keyboard as sole authority.

## Trace

Client records bounded ordered input/state events sufficient for replay, not claimed counters as authority. Each event contains sequence, tick/at_ms, stable type/entity/target and bounded type-specific values. The final submission includes exact start snapshot digest and idempotency key.

## Server validation

Within an atomic completion service:

1. lock BoardingRun and parent GameRun/CampaignRun;
2. authenticate owner/capability and idempotency;
3. load exact immutable LevelVersion and InteriorVersion/checksums;
4. verify start Shooter digest/resources/eligible source;
5. replay the trace through the shared deterministic rules or a backend parity implementation with golden fixtures;
6. derive outcome, duration, kills, containers, pickups and end resources;
7. compare submitted terminal declaration only as a consistency check;
8. persist one immutable `BoardingSubmission` whether accepted or rejected;
9. persist bounded append-only validation/audit detail;
10. return server-derived return state.

Rejected semantic submission transitions BoardingRun to `REJECTED`, `validation_result=INVALID`, records stable rejection code, and can never apply return/reward. Malformed transport may return 400 without a domain submission only when no run-semantic payload can be safely associated.

## Outcomes

| Outcome | Return |
|---|---|
| SUCCESS | validated LIFE/NUKE resources; source removed; Boarding score delta 0; resume Shooter |
| TIMEOUT | lose exactly one life from Boarding start/earned state; if >0 resume Shooter, else Game Over |
| PLAYER_DEAD | life result derived by simulation; if 0 Game Over, otherwise resume only if governed simulation permits |
| ABORTED | no fabricated reward; restore/resolve using server-derived policy; unvalidated abort cannot rank |

Return application uses transaction/idempotency plus a client one-shot coordinator. `return_applied` changes once. Shooter validates snapshot digest and source identity before applying; mismatches fail closed and invalidate the parent rankability rather than guessing.

## Test fixtures

Provide golden traces for success, timeout with lives remaining, timeout last life, player death, abort, pickup caps, all containers, duplicate completion, changed event ordering, changed tick, impossible fire rate, impossible movement, forged counter, wrong checksum/digest/token and concurrent double submit. Both client and backend consume the same golden expected result fixtures.

