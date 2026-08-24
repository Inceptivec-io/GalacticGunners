# v0.1 P0 COMBAT MATRIX

This remains the current Founder/CTO authority.

| Source | Player | Shield | Enemy | Scout | Mothership | Asteroid | Comet |
|---|---|---|---|---|---|---|---|
| Player Laser | PASS | PASS | HIT | HIT | HIT | HIT | HIT |
| Player Nuke | PASS | PASS | HIT | HIT | HIT | HIT | HIT |
| Enemy Laser | HIT | HIT | PASS | PASS | PASS | PASS | PASS |
| Enemy Body | PASS | HIT | — | — | — | PASS | PASS |
| Asteroid Body | PASS | PASS | PASS | PASS | PASS | — | PASS |
| Comet Body | PASS | PASS | PASS | PASS | PASS | PASS | — |

## Required overlap registrations

Register only semantically legal overlaps.

Player laser:
- enemies;
- scouts where present;
- mothership where present;
- asteroids;
- comets.

Player nuke:
- same hostile/destructible target families.

Enemy laser:
- player;
- shield tiles.

Enemy body:
- shield tiles only where existing descent/contact behaviour requires.

Do NOT register normal gameplay overlap for:
- player laser ↔ player;
- player laser ↔ shield;
- player nuke ↔ player;
- player nuke ↔ shield;
- enemy laser ↔ enemy;
- player ↔ asteroid;
- player ↔ comet;
- player ↔ enemy body;
- player ↔ scout body;
- player ↔ mothership body.

## Comet

Comet is not optional collision coverage.

Required:
- player laser → comet destroys comet;
- player nuke → comet destroys comet;
- exactly +500;
- exactly +1 nuke;
- one explosion;
- projectile resolved once.

## Player life

Only canonical enemy-laser/player overlap may decrement life.

Required:

```text
one enemy projectile
→ maximum one life decrement
```

Introduce brief hit-resolution lock/invulnerability only if necessary to prevent the same projectile/frame from causing multiple decrements.
Do not redesign life economy.
