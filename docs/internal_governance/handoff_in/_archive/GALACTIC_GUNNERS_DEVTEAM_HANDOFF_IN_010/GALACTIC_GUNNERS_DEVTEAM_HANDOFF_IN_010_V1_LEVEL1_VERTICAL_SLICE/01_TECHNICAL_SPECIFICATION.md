# V1 BUILD SPRINT 001 — TECHNICAL SPECIFICATION

## 1. Existing authorities — refine, do not fork

Production game package:

- `game/src/index.ts`
- `game/src/config/`
- `game/src/entities/`
- `game/src/input/`
- `game/src/scenes/`
- `game/src/services/`
- `game/src/systems/`
- `game/tests/`

Existing foundations include:
- scoring configuration;
- ScoreSystem;
- input capabilities;
- GameApiClient.

Web:
- `apps/web/`
- `apps/web/lib/api/client.ts`
- `apps/web/lib/config/publicConfig.ts`

Backend:
- `POST /api/v1/game-runs/`
- `POST /api/v1/game-runs/{runId}/complete/`

Contracts:
- `packages/contracts/openapi/galactic-gunners-api-v1.yaml`
- existing JSON schemas.

Do not create second apps, duplicate systems, `*_v2` models, or handoff-numbered permanent source files.

## 2. Runtime architecture

Required:

```text
apps/web
  ↓
client-only GameHost
  ↓
game/src/index.ts public bootstrap
  ↓
Phaser.Game
  ↓
BootScene
  ↓
MainMenuScene
  ↓
Level1Scene
```

Refine `game/src/index.ts` into one explicit bootstrap authority.

Preferred semantic API:

```ts
interface GalacticGunnersGameOptions {
  parent: HTMLElement | string;
  apiBaseUrl?: string;
  onReady?: () => void;
  onExit?: () => void;
}

createGalacticGunnersGame(options): Phaser.Game
destroyGalacticGunnersGame(game): void
```

Equivalent design is acceptable if consistent with current package conventions.

Rules:
- no React imports inside simulation/game core;
- no Next imports inside simulation/game core;
- no global score/player/session state;
- one Phaser instance per GameHost mount;
- destroy Phaser cleanly on unmount.

## 3. Scenes

Permanent semantic files:

- `game/src/scenes/BootScene.ts`
- `game/src/scenes/MainMenuScene.ts`
- `game/src/scenes/Level1Scene.ts`

### BootScene

Responsibilities:
- load only required slice assets;
- initialize systems/session;
- validate required asset keys;
- transition to MainMenuScene.

Missing required canonical asset must fail visibly/deterministically.

No generated placeholder rectangles in normal acceptance runtime.

### MainMenuScene

Responsibilities:
- canonical stellar background;
- canonical Galactic Gunners title/logo;
- Start/Play interaction;
- event-driven keyboard/pointer/touch/gamepad confirm;
- transition to Level1Scene.

Do not rebuild full settings/help/credits.

### Level1Scene

Bounded responsibilities:
- create Player;
- create first scout wave;
- create projectile groups;
- configure collisions;
- drive ScoreSystem;
- drive LifeSystem;
- drive InputSystem;
- drive AudioSystem;
- update HUD;
- determine bounded slice complete/failed state;
- clean teardown/replay.

Do not inline all entity logic into scene.

### Temporary terminal states

When wave clears:

```text
SLICE COMPLETE
Replay Slice
Main Menu
```

When lives reach zero:

```text
SLICE FAILED
Retry Slice
Main Menu
```

These are development slice states, NOT final Victory/Game Over.

Replay/retry resets:
- player;
- enemies;
- projectiles;
- score;
- lives;
- GameSession;
- event summary;
- timers;
- colliders;
- transient input.

Stale runtime objects after replay = 0.

## 4. Entities and systems

Create/refine:

- `game/src/entities/Player.ts`
- `game/src/entities/Scout.ts`

Projectile handling must be typed and bounded.

Player:
- vertically oriented;
- horizontal movement;
- firing;
- damage;
- bounded playfield;
- cleanup;
- no score ownership.

Scout:
- canonical scout sprite;
- deterministic legacy-informed first-wave movement;
- destruction;
- enemy firing only if required to prove damage/lives;
- emits semantic `scout_destroyed` event.

Refine/create semantic systems:

- ScoreSystem
- LifeSystem
- InputSystem
- AudioSystem
- GameSession

No handoff IDs in permanent identifiers.

## 5. Scoring

This sprint exercises:

`SCOUT DESTROYED = +25`

Locked:

```text
PLAYER DAMAGE SCORE PENALTY = 0
MINIMUM SCORE = 0
```

ScoreSystem is sole game score authority.

React must not maintain a second gameplay score.

Score event:

```text
event_type = scout_destroyed
points_delta = 25
sequence = monotonically increasing
occurred_at_ms = non-negative runtime-relative time
```

## 6. Lives

Inspect accepted `Legacy_Game` Level 1 behaviour.

Preserve:
- accepted initial life count;
- damage semantics;
- any essential hit cooldown/invulnerability denominator.

Do not invent new life economy.

LifeSystem:
- decrement on valid damage;
- cannot go below zero;
- zero produces terminal failed slice;
- no score coupling.

## 7. Input

Normalize actions:

```text
left
right
fire
confirm
back
```

Input sources:
- keyboard;
- pointer/touch;
- gamepad.

No manual touch/non-touch selector.

Keyboard must be fully playable.

Touch/gamepad normalization must be tested even if physical hardware is unavailable in CI.

## 8. Audio

Use one AudioSystem.

Canonical audio where active/cleared:
- UI confirm/select;
- player laser;
- enemy laser if used;
- scout destruction/small explosion;
- player hit.

Respect browser user-gesture/autoplay restrictions.

Duplicate event listeners/audio triggers = 0.

## 9. Web GameHost

Refine/create semantic route, preferably:

`apps/web/app/play/page.tsx`

Create one client-only GameHost/GameMount.

Requirements:
- Play link from existing home opens actual game;
- no SSR Phaser;
- one canvas;
- cleanup on unmount;
- deterministic loading/error state;
- responsive playfield;
- avoid accidental page scroll;
- avoid unintended black bars where runtime composition can fill viewport.

Do not redesign full marketing shell.

## 10. GameRun integration

Use existing GameApiClient.

On slice start:
- attempt `POST /api/v1/game-runs/`;
- client_type = `web`;
- current game version;
- retain server run ID when successful.

If backend unavailable:
- gameplay remains playable;
- explicit local/offline run mode;
- no fabricated run ID;
- local score not presented as authoritative leaderboard score.

At slice terminal state:
- complete an online run once where appropriate;
- bounded event summary;
- `victory = false` because this is not whole-game victory.

Replay/retry creates new session/run.

Do not build auth or leaderboard UI.
