# EXACT IMPLEMENTATION CONTRACT

## A. One canonical player-damage resolver

Create one semantic helper, e.g. `ggResolvePlayerDamageFromEnemyLaser(scene, laser)`.

It must:
1. require active scene/player/projectile;
2. require `laser.ggProjectileSide === "enemy"`;
3. require enemy-laser type/key/class;
4. reject already-resolved projectile;
5. mark projectile resolved BEFORE mutation;
6. create exactly one player-hit effect;
7. perform existing reset/reposition;
8. invoke life loss exactly once;
9. destroy the projectile;
10. return boolean outcome.

No other collision callback may directly implement `playerHit → reset → onLifeDown`.

## B. Remove prohibited player-damage registrations

Across Level1, Level2 and Boss remove damage outcomes from:
- asteroid/player;
- enemy/player;
- scout/player;
- mothership/player;
- comet/player.

Preferred: remove unnecessary overlap registration. If retained for telemetry, it must be non-damaging.

## C. Remove player projectile/shield collision

Across all gameplay scenes:
- remove `playerLasers ↔ shieldTiles` destructive overlap;
- ensure player nukes do not damage shields.

Player projectiles must pass through the defensive shield row.

## D. Centralise player-projectile resolution

Create one idempotent semantic resolver for player projectile hits.
Both Arcade overlap and swept collision may detect a candidate, but the resolver executes the outcome only once.

Require:
- ownership = player;
- authorised target class;
- resolved flag set before score/explosion/target mutation;
- exactly one score event;
- exactly one target effect;
- exactly one target destroy/damage action.

## E. Enemy laser legal targets

Enemy laser may affect only:
- player;
- shield tile.

No other damage outcome.

## F. Silent culling

- player laser exits top: silent destroy;
- enemy laser exits bottom: silent destroy.

No explosion, hit audio, damage or score.

## G. Immediate first shot

Keyboard/controller:
- rising edge/press fires immediately if cooldown ready;
- held input repeats at the existing approximate sustained cadence.

Do not materially rebalance fire rate.

Touch remains immediate.

## H. Spawn from ship nose

Spawn player laser immediately above the stable player hard-body top/nose, outside the player collision envelope. Do not spawn at sprite centre.

## I. Movement containment

After direct x/y movement clamp the player's meaningful hull inside playable bounds. No movement redesign.
