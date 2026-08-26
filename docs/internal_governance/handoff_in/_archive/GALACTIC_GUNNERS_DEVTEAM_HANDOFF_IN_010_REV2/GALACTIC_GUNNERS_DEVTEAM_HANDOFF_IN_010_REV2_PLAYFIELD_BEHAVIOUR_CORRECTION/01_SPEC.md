# REV2 SPECIFICATION

## Playfield architecture
Current `Scale.RESIZE` uses the physical browser viewport directly as the simulation coordinate system. Replace that with one semantic `PlayfieldLayout` authority.

Required model:

```text
FULL VIEWPORT
  stellar background = full bleed

GAMEPLAY SAFE AREA
  stable combat composition
  HUD safe rect
  player spawn
  movement bounds
  enemy formation bounds
  responsive entity/projectile scales
```

Do not return to visible letterboxing. Do not spread viewport math through scenes/entities.

## Preserve accepted Level 1 grammar
Legacy Level 1 is the minimum gameplay/composition reference, not the visual ceiling.

Legacy code establishes:
- 29 columns × 2 rows = 58 enemies;
- enemy span approximately 6% to 94% of game width;
- player starts centre-bottom;
- player moves LEFT/RIGHT/UP/DOWN;
- touch movement has X and Y;
- player is clamped to world.

REV2 target:
`29 × 2 = 58 enemies`.

If exact 58 is unsafe, STOP and report. Do not silently substitute 14.

## Four-direction player flight
Current new Player only moves horizontally. Fix.

Normalized actions:
```text
left
right
up
down
fire
confirm
back
```

Keyboard: arrows; A/D and W/S aliases where appropriate.
Gamepad: D-pad/stick X/Y.
Touch/pointer: X/Y movement.

Player API must accept 2D intent.
Diagonal velocity must be normalized.

Hostile tests:
left/right/up/down;
4 diagonals;
all 4 edge clamps;
diagonal speed normalization.

## Player hit/regeneration/respawn
Current REV1 only decrements lives and shakes camera. It does not regenerate/reset the player.

Accepted legacy hit path:
- apply one life loss;
- player-hit explosion/audio;
- reset player body to centre-bottom spawn.

Implement:

```text
ACTIVE
→ HIT
→ DAMAGE
→ REGENERATING / TEMP INVULNERABLE
→ RESPAWN AT PLAYFIELD SPAWN
→ ACTIVE
```

At zero lives:
`→ terminal failure`.

Required:
- one hit = one life;
- score delta = 0;
- visible respawn feedback;
- respawn to layout-authority spawn;
- velocity/input reset;
- player visible/active after respawn;
- no duplicate sprite;
- no ghost body;
- temporary invulnerability prevents life cascade;
- respawn does not restart entire scene.

## Responsive ship/formation scale
Fixed sizes such as Player `112×150` and Scout `78×72` must not remain the final scale authority.

Derive display scale from `PlayfieldLayout`.

Assert stable ratios:
- player width / gameplay width;
- player height / gameplay height;
- scout width / gameplay width;
- formation width / gameplay width;
- formation height / gameplay height.

Player readable, not oversized.
Enemies dense/readable, not tiny or giant.

## Shield defensive zone
Restore the Level 1 defensive grammar using canonical `gg_shield_tile_v002.png`.

Locked tile matrix:
```text
[1,1,1,1,1,1,1,1]
[1,1,1,1,1,1,1,1]
[1,1,1,1,1,1,1,1]
[1,1,0,0,0,0,1,1]
[1,1,0,0,0,0,1,1]
```

Individual tiles only.

Enemy laser/body hit:
- destroys one tile;
- score -1.

Player laser hit:
- no authorised score penalty.

## Physics/projectile debug
Provide governed physics debug mode, e.g. `?ggPhysicsDebug=1`.

Evidence must show:
- player body;
- scout body;
- player laser body;
- enemy laser body;
- shield tile body.

Assert:
- projectile spawn at correct weapon/source point;
- player laser up;
- enemy laser down;
- beam/body alignment;
- direct hit resolves;
- near miss does not;
- responsive resize keeps bodies aligned;
- respawn moves body with player.

## Hostile testing
REV1 hostile suite improved CI but encoded wrong assumptions (`14 scouts`, horizontal-only player, viewport == simulation).

REV2 tests must exercise:
- four-direction keyboard movement;
- diagonals;
- all-edge clamp;
- real player-laser/scout collision;
- real enemy-laser/player collision;
- one-life damage;
- respawn;
- invulnerability;
- no ghost/duplicate player;
- 58-enemy formation;
- shield hit and -1 score;
- player shot on shield with 0 score penalty;
- resize during active gameplay and body/layout revalidation;
- direct-hit and near-miss projectile cases;
- complete/retry/menu;
- offline backend;
- console/network clean.

QA helpers may set up deterministic scenarios, but actual Phaser physics must resolve at least one real case for each major collision family.

## Visual target
Do not copy legacy pixels exactly.

Preserve and improve:
- movement freedom;
- formation density;
- defensive zone;
- combat-space proportions;
- HUD readability;
- projectile travel space;
- gameplay hierarchy.

Return side-by-side legacy-vs-REV2 screenshots and a composition matrix explaining every intentional deviation.

## Performance
Dense formation/full viewport must remain performant:
- bounded projectile pools;
- no unbounded timers/listeners;
- record representative browser frame/performance sample;
- obvious frame-time collapse = FAIL.
