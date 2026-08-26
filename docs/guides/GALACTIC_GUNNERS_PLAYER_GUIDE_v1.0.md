# Galactic Gunners Player Guide v1.0

## 1. Game objective

Galactic Gunners is a space-defence shooter. The player survives enemy formations, protects the defensive shield line, destroys hostile ships and hazards, manages lives/nukes, and progresses through the campaign.

## 2. Current controls

### Keyboard — CURRENT

```text
W / Up movement       move up
S / Down movement     move down
A / Left movement     move left
D / Right movement    move right
SPACE                  fire player laser
N                      fire nuke when available
P                      pause / resume
ENTER                  confirm where a confirmation action is active
ESC                    back where a back action is active
```

The runtime input abstraction remains authoritative. If a future control surface changes, this guide and the in-game help must change in the same delivery.

### Gamepad — CURRENT / evolving mapping

- analogue stick / D-pad: movement;
- primary fire buttons supported by the InputSystem;
- `Y`: nuke;
- confirm/back follow the current InputSystem mapping.

Gamepad behaviour must be regression-tested rather than inferred from browser defaults.

## 3. Player movement — CURRENT

The player can move in four directions within the accepted Level 1 playfield bounds. Diagonal input is normalized so diagonal movement does not become faster than horizontal/vertical movement.

Expected behaviour:

- player remains within the gameplay area;
- player does not clip HUD or leave the stellar playfield;
- current accepted movement speed is part of the Level 1 golden baseline;
- movement remains responsive while firing.

## 4. Player laser — CURRENT

Press `SPACE` to fire.

Expected behaviour:

- laser appears from the player weapon position;
- visible sprite and physics body remain aligned;
- laser travels upward;
- an aligned enemy can be hit by a normal player-origin shot;
- a near miss does not become a hit;
- firing in a clear bunker gap does not damage unrelated bunker tiles;
- if the player deliberately fires through a bunker tile, only geometrically intersected shield tiles are affected.

A laser that disappears at launch, spawns from the wrong location, damages an unrelated bunker, or passes through an aligned target is a regression defect.

## 5. Nukes — CURRENT

The player starts the accepted Level 1 baseline with:

```text
NUKES = 2
REARM / ENERGISE = 150 / 150
```

Press `N` to fire when ammunition is available.

Expected behaviour:

- one nuke is consumed per launch;
- count never becomes negative;
- zero ammunition blocks another nuke launch;
- nuke projectile and burst are visible;
- multi-kills award each destroyed enemy once;
- no invented extra score is awarded for the nuke itself;
- Energise represents cooldown/rearm behaviour and must not falsely imply ammunition exists.

## 6. Lives and respawn — CURRENT

Lives are represented by the player-life icon at the lower-left HUD.

After a valid player hit:

- one life is consumed according to the LifeSystem;
- the player follows the accepted respawn/regeneration flow;
- respawn invulnerability prevents immediate duplicate death;
- the player returns to the valid playfield.

## 7. Pause — CURRENT

Press `P`.

Pause must freeze gameplay state, including enemies, projectiles, timers, scoring and lives. Resume returns to the exact prior state without duplicated listeners or timers.

The pause surface must be visibly presented. A game that continues moving underneath pause is defective.

## 8. Shields — CURRENT

The accepted Level 1 contains:

```text
8 shield bunkers
256 initial shield tiles
```

Each bunker is composed from the canonical destructible shield-tile matrix.

Enemy hits on shield tiles reduce score according to the locked scoring rules. Player fire does not carry an invented score penalty.

## 9. Locked scoring — CURRENT

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
```

Player damage carries no score penalty. Score may not fall below zero.

## 10. Campaign levels — H012 TARGET

The v1.0 campaign target is six config-driven combat levels. Ordinary new levels will use the same combat engine and LevelDefinition model rather than separate duplicated game code.

Until a level is marked validated/published, it must not be represented to players as released campaign content.

## 11. Bonus pickups — H012 TARGET

The initial governed pickup types are:

- `NUKE`;
- `LIFE`.

Pickups may be revealed from destructible content or ejected from destroyed ships using deterministic drop rules. Pickup outcomes are governed by the exact level version/checksum/seed.

## 12. Boarding — DEFERRED

Level data may contain dormant BoardingAnchor metadata, but platform/boarding gameplay is not active until its separate programme gate passes.

## 13. Player-facing defect checklist

Report a defect if any of these occur:

- player or enemies are visibly wrong-sized;
- black bars or non-stellar gaps appear around gameplay;
- lasers are squashed, horizontal or invisible;
- laser sprite/body location differs;
- firing damages unrelated shield tiles;
- aligned lasers pass through enemies;
- pause fails to freeze;
- nuke count becomes negative;
- nuke fires with zero ammo;
- score changes after terminal state;
- HUD clips or overlaps;
- public screens contain developer/test terminology;
- admin routes or admin controls are exposed to players.
