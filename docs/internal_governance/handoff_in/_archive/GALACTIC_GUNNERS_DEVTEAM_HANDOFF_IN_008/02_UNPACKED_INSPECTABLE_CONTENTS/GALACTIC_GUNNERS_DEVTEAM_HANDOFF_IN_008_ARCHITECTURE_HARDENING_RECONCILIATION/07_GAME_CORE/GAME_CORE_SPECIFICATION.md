# PHASER TYPESCRIPT GAME-CORE FOUNDATION

Enhance existing:

`game/`
`game/src/`

Existing semantic substrate already includes:

- `game/src/audio/`
- `game/src/config/`
- `game/src/entities/`
- `game/src/input/`
- `game/src/scenes/`
- `game/src/services/`
- `game/src/systems/`
- `game/src/index.ts`

Retain/refine these surfaces.

## This sprint DOES NOT port gameplay

Do not copy legacy scenes wholesale into TypeScript.

Do not implement the v1.0 shooter.

Do not integrate the canonical asset estate into runtime.

## Required hardening

The game package must:

- compile/typecheck independently;
- expose an explicit public entry point;
- have no imports from `Legacy_Game/`;
- have no direct dependency on Django implementation details;
- keep API interaction behind `services/`;
- keep input abstraction under `input/`;
- keep game configuration under `config/`;
- avoid React imports in game simulation/runtime modules;
- avoid Next.js imports in game simulation/runtime modules.

## Foundation interfaces

Create/refine semantic interfaces only where useful:

```text
GameRuntimeConfig
InputCapabilities
GameRunClient
GameRunStartRequest
GameRunCompletionRequest
GameRunRecord
ScoreEvent
```

Where contract types can be generated/shared safely, prefer a single contract authority. Do not hand-maintain multiple inconsistent copies.

## Input architecture

Foundation must support coexistence:

```text
keyboard
pointer/mouse
touch
gamepad
```

Do not implement a manual touch/non-touch mode selector.

Capability detection must not mean touch-only.

This sprint need only establish/refine the abstraction and tests; full gameplay wiring occurs during v1.0 build.

## Scoring foundation

Central scoring vocabulary must reflect the locked values:

```text
LASER TARGET              +5
ASTEROID                  +10
SCOUT                     +25
SHIP                      +50
MOTHERSHIP HIT            +50
MOTHERSHIP DESTROYED      +1000
COMET                     +500
COMET BONUS               +1 NUKE
ALIEN HIT ON SHIELD TILE  -1

MINIMUM SCORE = 0
PLAYER DAMAGE SCORE PENALTY = NONE
```

Do not yet reproduce legacy collision/gameplay implementations.

A typed constant/config model with tests is sufficient for this sprint.

## Game package acceptance

```text
npm run game:typecheck = PASS
```

Add unit tests where package tooling supports them and where they materially protect architecture contracts.
