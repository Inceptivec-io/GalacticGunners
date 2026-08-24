# SCENE-BY-SCENE CHANGE LIST

## Shared `gg_runtime.js`
- canonical enemy-laser player-damage resolver;
- canonical player-projectile hit resolver;
- idempotency guard;
- swept collision delegates to resolvers;
- shared comet/player body contact becomes PASS/no damage;
- laser boundary cleanup becomes silent.

## Level1
Remove damage:
- asteroid/player;
- enemy/player.

Remove:
- playerLaser/shield destructive collision.

EnemyLaser/player must call canonical resolver.

## Level2
Same as Level1.

## Boss
Remove damage:
- asteroid/player;
- player/mothership;
- player/scout;
- shared comet/player.

EnemyLaser/player only via canonical resolver.

Player laser/nuke may hit enemies, scouts, mothership, asteroid and comet through canonical player-projectile resolution.
