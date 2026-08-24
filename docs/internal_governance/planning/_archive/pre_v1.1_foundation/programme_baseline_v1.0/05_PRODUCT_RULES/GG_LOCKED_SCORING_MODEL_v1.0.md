# GALACTIC GUNNERS — LOCKED SCORING MODEL v1.0

| Event | Reward |
|---|---:|
| Laser target | +5 |
| Asteroid destroyed | +10 |
| Scout destroyed | +25 |
| Ship destroyed | +50 |
| Mothership successful hit | +50 |
| Mothership destroyed | +1000 |
| Comet destroyed | +500 |
| Comet destroyed | +1 nuke |
| Alien/enemy hit destroys defensive shield tile | -1 |

## Explicit non-rules

Player ship hit/damage:
**NO NEW SCORE PENALTY.**

Player life mechanics:
**DO NOT CHANGE.**

Player projectile destroying a shield tile:
**NO SCORE PENALTY AUTHORISED.**

## Shield mechanic

The shield/base is code-generated from individually destructible tiles.

```text
SHIELD
=
PATTERN/MATRIX
+
INDIVIDUAL SHIELD TILES
```

Not one bunker image.

Each enemy/alien hit that destroys one tile produces one `-1` score event.
