# PROJECTILE RUNTIME MODEL

## 1. Use true Arcade Physics sprites for projectiles

For P0 recovery, convert/ensure:

```text
PlayerLaser
EnemyLaser
EnemyMotherShipLaser
```

use `Phaser.Physics.Arcade.Sprite` directly.

Do not rely on a generic `GameObjects.Sprite` plus ad-hoc `world.enableBody` for the primary projectile classes.

Required constructor lifecycle:

```javascript
super(scene, x, y, texture);
scene.add.existing(this);
scene.physics.add.existing(this);

this.setOrigin(...);
this.setScale(...);
configureBody(...);

// NO movement yet.
```

Movement starts only after the firing factory places the projectile.

## 2. Semantic projectile factories

Create permanent semantic factories/helpers such as:

```text
ggSpawnPlayerLaser
ggSpawnEnemyLaser
ggSpawnPlayerNuke
```

No handoff/sprint identifiers.

Each factory owns:
- ownership;
- final spawn position;
- group admission;
- movement start;
- trace identity.

## 3. Final ordering

Player laser:

```text
instantiate
→ set final spawn at player nose
→ sync body once
→ assign owner=player
→ assign unique runtime projectile id
→ add to playerLasers
→ set velocity Y last
```

Enemy laser:

```text
instantiate
→ set final spawn below enemy hull
→ sync body once
→ owner=enemy
→ unique id
→ add to enemyLasers
→ set velocity Y last
```

Never call a body-reset/reinitialization method after final velocity is assigned.

## 4. One movement authority

Use Arcade body velocity for laser movement in recovered runtime.

Remove manual y-step movement if any remains.

Do not have a second timer mutate laser y.

## 5. One collision authority

Normal legacy runtime:
- Phaser Arcade overlap only.

Disable normal execution of:
- `ggInstallSweptCollisionContracts`;
- `ggRunSweptCollisionContracts`.

If retained in source for diagnostic comparison, it must be TEST-ONLY and inactive in normal gameplay.

## 6. Body geometry

Physics debug mode must prove the body is centered on the visible beam.

No invisible giant body.

No body displaced from visual projectile.

Use a body inset inside the visible luminous projectile, not transparent padding/glow.

The test assertion is world-space:
- projectile body rectangle must lie inside or closely track the meaningful visible laser;
- body width/height must be materially smaller than or equal to visible beam envelope;
- no body may reach the player before the visible enemy laser does.
