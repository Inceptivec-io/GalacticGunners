# MANDATORY REV5 TESTS

Generic `qa:all` is not sufficient.

## 1. Player damage-path source audit
Machine-read gameplay code and prove no collision path other than canonical enemy-laser resolution can decrement player lives.

## 2. 30-second movement fixture with enemy firing disabled
Move player up/down/left/right/diagonal and through asteroid/comet/enemy-body paths.
Expected:
- lives unchanged;
- playerHit explosions = 0.

## 3. Continuous fire
Keyboard 10s, controller 10s, touch fixture.
Expected:
- immediate first shot;
- repeated visible shots;
- no self damage;
- shots pass shield row;
- hostile targets hit.

## 4. Shield ownership
Player laser through shield:
- shield survives;
- no shield explosion;
- no score change.

Enemy laser into shield:
- tile destroyed;
- correct shield event and locked penalty.

## 5. Enemy laser player
One enemy laser, one player:
- one hit;
- one playerHit effect;
- exactly one life decrement;
- projectile resolved once.

## 6. Silent culling
Player laser exits top / enemy laser exits bottom:
- zero explosion.

## 7. Physics-debug proof
Using `?ggPhysicsDebug=1`, capture:
- player body;
- player laser spawn outside player body;
- laser passing shield without collision;
- player overlapping asteroid with no damage;
- player overlapping enemy body with no damage;
- enemy laser hitting player;
- enemy laser hitting shield.

## 8. Hero proof
Desktop screenshot proves the 4K authority asset is used, aspect preserved, and materially full composition retained.
