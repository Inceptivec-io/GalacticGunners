# Galactic Gunners Developer Guide v1.0

## Architecture

```text
Next.js product shell
→ Phaser + TypeScript game
→ Django + DRF authoritative backend
→ PostgreSQL
```

Browser is untrusted. Django owns identity, privileged mutation, GameRun authority, validation and administration.

## Repository rules

- `feature/* → dev → stage → prod`.
- `prod` is release authority.
- do not recreate `main`.
- historical repo is reference only.
- root `assets/` is canonical production asset estate.
- no duplicate source-of-truth trees.

## Game rules

Phaser owns moment-to-moment gameplay. React does not become the game engine.

Migration doctrine:

```text
EXTRACT → TYPE → TEST → PRESERVE BEHAVIOUR
```

Accepted Level 1 is a golden denominator. A refactor that runs but changes accepted geometry, collisions, controls, scoring or presentation is a regression.

## Config-driven levels — H012 TARGET

Use one generic combat runtime:

```text
CombatLevelScene
→ LevelLoader
→ LevelRuntimeConfig
```

LevelDefinition is declarative. Entity creation comes from registered factories. Unknown config references fail before execution.

## Randomness

Governed level-content randomness must be seedable. Do not use uncontrolled `Math.random()` for deterministic drops/generation.

## Security

Never expose DB credentials, signing secrets, admin authority or privileged API credentials to client bundles.

Admin route is `/inceptivec-gamification-admin`, unlisted but fully authenticated/authorized server-side.

## Environment files

Use ignored `env.feature`, `env.dev`, `env.stage`, `env.prod`. Never commit them. They contain URLs, route contract and unique admin credentials. Generate them using the repository bootstrap script.

## Tests

Any gameplay change affecting projectiles, collisions, movement, pause, nukes, shields, scoring or level layout must update hostile coverage that proves the actual player path, not a QA shortcut.

Required baseline job families include backend, client/game, Docker smoke and runtime-hostile; H012 adds level-definition/admin/generator hostile coverage.

## Development completion

A bounded task is not complete until:

```text
worktree clean
local HEAD = remote HEAD
CI green
currentness/docs updated
POST_BOX active payload = 0
governance debt = 0
```
