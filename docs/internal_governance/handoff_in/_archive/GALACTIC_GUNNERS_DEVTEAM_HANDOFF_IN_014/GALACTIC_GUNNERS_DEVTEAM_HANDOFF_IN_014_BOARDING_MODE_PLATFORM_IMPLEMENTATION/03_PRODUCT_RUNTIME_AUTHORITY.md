# Product and runtime authority

## Authoritative state machine

| State | Entry | Permitted exit |
|---|---|---|
| `SHOOTER_ACTIVE` | Level 4 begins or Boarding returns | `BOARDING_OFFERED`, normal level/game terminal states |
| `BOARDING_OFFERED` | Designated scout receives lethal hit | `BOARDING_STARTING` on valid confirm; `SHOOTER_ACTIVE` on expiry/ignore |
| `BOARDING_STARTING` | Player confirms inside entry envelope | `BOARDING_ACTIVE`; fail closed to invalid/offline recovery |
| `BOARDING_ACTIVE` | Snapshot accepted locally and scene ready | `BOARDING_RESOLVING`, pause overlay only |
| `BOARDING_RESOLVING` | Success, timeout, or zero lives | `SHOOTER_RESUMING` or `GAME_OVER` |
| `SHOOTER_RESUMING` | Valid return state applied once | `SHOOTER_ACTIVE` |
| `GAME_OVER` | Player death with zero lives | existing game-over flow only |

Transitions are single-flight and idempotent. Input is reset on every scene boundary. Repeated confirm, completion, collision, pickup, or network callbacks must not duplicate effects.

## Level 4 boarding anchor

Add an optional `boarding_anchors` array to the shared LevelDefinition contract. Levels without it remain valid and unchanged. Level 4 contains exactly one:

```json
{
  "id": "level-04-alien-frigate-01",
  "source_selector": {"formation_index": 0, "row": 0, "column": 14},
  "source_entity_type": "scout",
  "source_ship_type": "ALIEN_FRIGATE",
  "source_entity_id": "level-04:formation-0:r0:c14",
  "interior": {"slug": "alien-frigate", "version": 1, "checksum": "e9b1af65f0daef6725a7ddf4683b5f6d503e25dabc97aef1212102e6b1e994f3"},
  "entry_envelope": {"width_px": 160, "height_px": 128},
  "offer_duration_ms": 8000
}
```

The published level checksum includes this object and the published interior checksum. The runtime derives the entity ID exactly as `${level.slug}:formation-${formationIndex}:r${row}:c${column}` and must match the configured ID.

## Offer and score behavior

- On the designated scout's first lethal hit, award its existing standard scout kill value of 25 exactly once, stop its weapons/movement, and enter `BOARDING_OFFERED` instead of immediate removal.
- Render the admitted Board Ship prompt and a 160×128 world envelope centered on the disabled ship.
- The offer lasts exactly 8,000 active shooter milliseconds. Shooter pause time does not consume it.
- Boarding begins only when the player is inside the envelope and presses confirm/interact.
- Ignoring or expiring the offer removes the disabled ship and resumes ordinary Level 4 behavior. There is no later attempt.
- Boarding enemies, containers, success, and pickups add zero points and do not alter multipliers.
- The attached score/bonus pickup art is `admitted-dormant`.

## Shooter preservation boundary

At entry, freeze and serialize the full mutable shooter state: level identity/version/checksum, seed and RNG state, entity IDs/transforms/health/fire clocks, projectiles, pickups, player transform/lives/nukes/invulnerability, score/multiplier/event sequence, formation timers, level timer, offer state, and audio state. Produce a canonical SHA-256 `shooter_state_digest`.

Pause the shooter scene; do not reconstruct it from an approximation. Boarding time is excluded from shooter clocks. On return, apply only the validated life/nuke delta, remove the boarded source ship, restore all other state exactly, reset input, resume audio, and continue. The pre-entry score and event sequence must remain unchanged during Boarding.

## Boarding rules

- Reference viewport: 1280×720. World: 4096×720. Grid: 64 px.
- Fixed step: 60 Hz. Gravity: 1,800 px/s². Player horizontal speed: 260 px/s. Jump velocity: −720 px/s.
- Player projectile speed: 800 px/s. Fire cooldown: 250 ms. Alien speed: 110 px/s. Alien projectile speed: 420 px/s.
- Seeded alien fire intervals are uniformly selected from inclusive 900–1,500 ms using the repository's existing LCG and persisted RNG state.
- Time limit: exactly 60,000 active Boarding milliseconds. Pauses do not consume it.
- Player uses the existing global life counter; there is no health bar. A hit loses one life exactly once, followed by 420 ms respawn and 1,200 ms invulnerability if a life remains.
- At zero lives, outcome is `PLAYER_DEAD` and the existing game-over flow receives control.
- Timeout loses one life exactly once. Resume the shooter if a life remains; otherwise game over.
- Success requires interact/confirm while overlapping the exit zone. Apply deterministically earned life/nuke pickups, capped at 3 lives and 2 nukes, then return.
- Breakable containers have one hit point and open once. Hazard contact uses the same damage gate as hostile projectiles.
- No friendly fire, melee, crouch, ladders, camera vertical movement, or fall-out zones in v1.

## Deterministic drops

Each container definition supplies an ordered weighted table containing only `LIFE`, `NUKE`, or `EMPTY`. Resolve once using the persisted Boarding RNG state at the container's destruction. A pickup is counted only after collision with the player. Caps do not convert excess items to score.

RNG consumption order is authoritative: on scene initialization, schedule one fire interval for each live alien in ascending entity ID order; when an alien fires, consume one value to schedule that alien's next interval; when a container opens, consume one value for its ordered weighted drop table; no visual effect, audio, animation, or client-only behavior may consume this RNG. Fire interval is `900 + (state % 601)`. Drop roll is `state % 100`, resolved against cumulative weights over `[0,99]`. See `fixtures/rng-golden-vectors.json`.

## Input map

| Action | Keyboard | Xbox/Haute gamepad | Touch |
|---|---|---|---|
| Move left/right | A/D or arrows | D-pad or left stick | bottom-left left/right zones |
| Jump | W or Up | A / button 0 | bottom-right jump zone |
| Fire | Space | X / button 2 | bottom-right fire zone |
| Interact/confirm | Enter | A / button 0 when an interaction is available | admitted contextual Board/Return button |
| Pause | P or Escape | Start / button 9 | pause control in existing shell |
| Back in pause | Escape | B / button 1 | existing back control |

When interaction and jump share button 0, interaction has priority only while a valid interaction is in range. Touch zones are Phaser Graphics primitives with visible focus/pressed states and accessible shell labels; they are not new art.

## Offline behavior

If Boarding start cannot reach the API, play the deterministic local flow but mark the parent GameSession offline and permanently ineligible for validated leaderboard submission. If completion delivery fails after an online start, retain one immutable local completion for retry, mark the session unvalidated until acknowledgement, and never silently promote it to leaderboard-valid state.

## Performance budget

At 1280×720 on the repository's CI/browser reference environment, target 60 Hz and fail if the p95 active-simulation frame exceeds 16.7 ms over a 60-second run. Enforce fixture caps of 6 live enemies, 32 simultaneous projectiles, 4 containers, 2 hazards, and 512 trace events. Ten consecutive shooter→Boarding→shooter cycles may not increase retained JS heap by more than 32 MiB or increase active listener/timer counts. Boarding asset preload must complete within 5 seconds on the Docker hostile-run environment with a warm application shell. Record measurements; do not hide a failed budget by lowering fixture load.

## Telemetry

Emit structured events: `boarding_offer_shown`, `boarding_start_requested`, `boarding_started`, `boarding_completed_local`, `boarding_validation_accepted`, `boarding_validation_rejected`, `boarding_retry_queued`, `boarding_retry_succeeded`, and `boarding_return_applied`. Common fields are UTC timestamp, correlation ID, client type/version, game version, parent run UUID, Boarding run UUID when known, anchor ID, interior version/checksum, online-validation boolean, and state transition. Terminal fields add outcome, active duration, counters, resources before/after, and public validation code. Never emit a capability token/hash, raw event trace, email, display name, IP address, or shooter snapshot.
