# CTO REV5 SOURCE DEEP DIVE — SOURCE-CONFIRMED

Entry HEAD: `10c228c1108921e8545eedbcfadbcb57afbd7694`

## Root causes

1. **Player death while flying is caused by explicit non-laser damage paths.**
   The REV4 source still calls player-hit/reset/life-loss from player overlaps with asteroids, enemy bodies, comets, mothership and scouts.

2. **Player shots are consumed by the player's own shields.**
   `playerLasers ↔ shieldTiles` still destroys the shot and shield. Because the player starts below the shield row and fires upward, this can prevent valid shots reaching enemies.

3. **False bottom explosions are caused by projectile cleanup.**
   `updateLasers()` creates an explosion when an enemy laser reaches the bottom edge and is merely being culled. Cleanup is being rendered as impact.

4. **Keyboard/controller first shot is delayed.**
   The current tick loop waits through the repeat threshold before first fire. A short press can yield no shot.

5. **Collision outcomes have duplicate detection paths.**
   Arcade overlaps and swept collision both cover some projectile/target families. Detection can remain redundant, but one idempotent resolver must own the gameplay outcome.
