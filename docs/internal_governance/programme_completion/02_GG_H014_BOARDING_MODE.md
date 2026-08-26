# GG-H014 — BOARDING MODE COMPLETE VERTICAL PRODUCT SLICE

## Outcome

Deliver Boarding Mode as a complete, bounded, production subsystem integrated into the existing shooter campaign without contaminating ordinary combat-level logic.

## Trigger / eligibility

Boarding can activate only from a valid `BoardingAnchor` on a supported eligible ship/entity.

Required shooter-side state:

```text
BoardingEligibility
- level_id
- level_version
- source_entity_id
- source_ship_type
- anchor_id
- source_entity_state
- boarding_available
- entry_envelope
```

No Boarding prompt/entry on ineligible entities.

## State transition

```text
SHOOTER ACTIVE
→ ELIGIBLE SHIP DISABLED / BOARDING AVAILABLE
→ PLAYER ENTERS BOARDING ENVELOPE + CONFIRMS
→ FREEZE/SERIALIZE SHOOTER STATE
→ BOARDING SCENE FAMILY
→ SUCCESS / TIMEOUT / PLAYER DEATH
→ RESTORE SHOOTER STATE OR GAME OVER
```

Shooter state preservation includes:
- score;
- lives;
- nukes;
- current level/version/checksum/seed;
- enemy states required for deterministic return;
- shield state;
- campaign progression state.

## BoardingRun model

```text
BoardingRun
- id UUID
- game_run FK
- level_id/version/checksum
- source_entity_id
- ship_type
- interior_definition_id
- seed
- started_at
- completed_at
- time_limit_ms
- outcome SUCCESS|TIMEOUT|PLAYER_DEAD|ABORTED
- aliens_killed
- containers_opened
- lives_found
- nukes_found
- score_events JSONB
- return_state JSONB
```

## InteriorDefinition

Declarative, versioned schema:

```text
InteriorDefinition
- id
- version
- schema_version
- ship_type
- seed
- rooms[]
- connectors[]
- spawn
- exit
- enemies[]
- containers[]
- hazards[]
- pickups[]
- performance_budget
- checksum
```

Room types may include:
- airlock;
- corridor;
- cargo;
- engine;
- weapons;
- crew;
- bridge;
- reactor.

No arbitrary executable code.

## Graph constraints

Generated/assembled interior must guarantee:
- player spawn reachable to exit;
- no required room unreachable;
- no overlapping invalid geometry;
- valid connectors;
- performance budget;
- no impossible objective.

## Player mechanics

Boarding player supports:
- left/right movement;
- jump;
- fire;
- collision with platforms/walls;
- enemy/projectile damage model;
- temporary invulnerability after hit where specified;
- pickup collection;
- exit interaction.

Exact controls must map through existing InputSystem abstraction for keyboard/touch/gamepad.

## Timer / failure

Initial Boarding encounter target: 30–60 seconds, configurable by approved content.

Timeout rule:
- lose one existing life;
- if lives remain, return to shooter;
- if no lives remain, Game Over.

Escape/success returns to shooter and applies earned approved rewards/events exactly once.

## Health

Before coding, use one explicit v1 rule:

```text
BOARDING PLAYER DAMAGE MODEL = EXISTING LIFE-BASED HIT MODEL
```

Do not invent RPG health/armor unless separately authorised.

## Boarding scoring/rewards

Core shooter scoring remains governed separately.
Boarding-specific scoring values must live in one configuration contract, not scattered constants.

If no approved exact Boarding score values exist at implementation start, Boarding score additions remain `0` and only approved LIFE/NUKE pickup effects are active; Development must not invent values.

## API

Semantic endpoints:

```text
POST /api/v1/boarding-runs/
POST /api/v1/boarding-runs/{id}/complete/
GET  /api/v1/boarding-runs/{id}/
```

Server validates:
- source GameRun;
- source eligible anchor/entity;
- interior version/checksum;
- duration;
- pickup/event summary;
- duplicate completion.

## Assets required before implementation

Repository must identify canonical:
- boarding player sprite or approved derivation;
- boarding alien sprites;
- projectile sprites;
- platform/wall tiles;
- airlock/door;
- container/crate/barrel;
- interior background/material kit;
- pickup LIFE/NUKE assets;
- boarding HUD/timer elements;
- boarding entry/exit audio;
- enemy hit/death audio.

If a required visual does not exist, CTO/Founder asset specification must be written before Development creates placeholder art.

## Tests

Required:
- eligibility/no eligibility;
- enter/exit;
- shooter state freeze/restore;
- timer timeout with life decrement;
- timeout last life → Game Over;
- success → shooter;
- deterministic interior seed;
- reachable graph;
- jump/fire/collision;
- pickup once;
- no duplicate reward;
- resize/input/device matrix;
- hostile malformed InteriorDefinition rejection;
- API authorization/validation.

## Exit gate

```text
BOARDING ENTRY = PASS
BOARDING RUNTIME = PASS
INTERIOR GRAPH VALIDATION = PASS
SHOOTER STATE RESTORE = PASS
TIMEOUT/LIFE RULE = PASS
REWARDS ONCE = PASS
DETERMINISM = PASS
KEYBOARD/TOUCH/GAMEPAD = PASS
HOSTILE = PASS
CI = GREEN
```

PR target: `dev`, Draft, not merged by Development.
