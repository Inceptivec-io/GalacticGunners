# CTO ROOT CAUSE ANALYSIS

## 1. Assurance failure

REV5 `verify_handoff_004_rev5.js` does not prove the game that the Founder plays.

Its runtime fixture:
- starts Level1;
- calls `scene.time.removeAllEvents()`;
- destroys/clears live gameplay groups;
- reconstructs test objects;
- directly calls internal functions such as `ggHandlePlayerFiring`;
- manually advances the physics world;
- manually calls `ggRunSweptCollisionContracts`;
- creates its own overlap for enemy-laser→shield.

Therefore the verifier bypasses:
- real keyboard event cadence;
- real live scene timer topology;
- real integrated enemy firing;
- real scene collision registrations;
- actual runtime ordering.

This is an assurance defect.

P0 rule:

```text
TEST THE SHIPPING RUNTIME PATH.
DO NOT REPLACE IT WITH A TEST-ONLY SIMULATION AND CALL THAT INTEGRATION.
```

## 2. Projectile movement lifecycle is overcomplicated

Historical 2019 working implementation:
- creates PlayerLaser;
- adds it to the group;
- one timer moves `laser.y` upward;
- Phaser overlap resolves collisions.

Current implementation:
- PlayerLaser constructor enables Arcade body;
- assigns velocity;
- firing helper changes spawn position;
- firing helper calls `body.reset()` after constructor velocity setup;
- Arcade overlaps also exist;
- swept collision timer also exists;
- multiple semantic resolver layers exist.

The current sequence has too many movement/collision authorities.

P0 recovery must establish ONE movement authority and ONE gameplay outcome authority.

## 3. Player-laser spawn ordering is unsafe

Current `PlayerLaser` constructor assigns velocity.

Then `ggFirePlayerLaser()` repositions the projectile and calls:

```text
laser.body.reset(...)
```

after velocity assignment.

Do not assign final movement before final body/spawn initialization.

Required ordering:

```text
CREATE
→ SCALE / ORIGIN / BODY
→ FINAL SPAWN POSITION
→ ADD TO GROUP
→ SET VELOCITY LAST
```

Velocity must then be measured in the actual live runtime.

## 4. Swept collision has incomplete target coverage

Current swept player-projectile path covers:
- enemies;
- scouts;
- mothership;
- asteroids.

It does not include comets.

Comets therefore rely on a separate Arcade overlap path.

This is one cause of projectile/comet inconsistency.

## 5. Dual collision authority creates unnecessary risk

Current game combines:
- scene-local Arcade overlaps;
- shared swept collision loop;
- shared semantic resolvers.

For the legacy v0.1 recovery, this is unnecessary complexity.

The historical game demonstrated that the current scale of game can run on a single Phaser overlap model when projectile movement and bodies are correct.

P0 recovery rule:

```text
NORMAL LEGACY RUNTIME COLLISION AUTHORITY = PHASER ARCADE OVERLAP
```

Disable/remove the swept collision loop from the normal legacy runtime.

Do NOT remove the concept from future architecture planning.
It can be reconsidered in the TypeScript production rebuild.

## 6. Random death must become explainable

Every decrement of `currentLives` must create a damage trace containing:
- scene;
- timestamp;
- damage source;
- projectile identity;
- projectile side;
- player body bounds;
- projectile body bounds;
- overlap state.

For current authorised v0.1 combat:

```text
NORMAL COMBAT DAMAGE SOURCE = ENEMY LASER ONLY
```

If lives change without that trace, FAIL P0.

## 7. Random explosion must become explainable

Every explosion must have a semantic cause.

Required event classes:
- enemy destroyed;
- asteroid destroyed;
- comet destroyed;
- mothership hit/destroyed;
- enemy laser hit player;
- enemy laser hit shield;
- nuke impact;
- explicit result transition effect if any.

Out-of-bounds cleanup is not an explosion event.

Unknown explosion source = FAIL P0.
