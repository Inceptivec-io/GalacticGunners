# EXPLOSION CAUSALITY

Every `createExplosion` / `createNukeExplosion` invocation in gameplay must supply a semantic event source.

Do not allow anonymous/default runtime explosion calls in normal combat.

Required trace fields:
- event id;
- scene;
- event source;
- x/y;
- source entity type/id;
- target entity type/id;
- score before/after;
- lives before/after.

Allowed examples:
- PLAYER_LASER_ENEMY_HIT;
- PLAYER_LASER_ASTEROID_HIT;
- PLAYER_LASER_COMET_HIT;
- ENEMY_LASER_PLAYER_HIT;
- ENEMY_LASER_SHIELD_HIT;
- MOTHERSHIP_HIT;
- MOTHERSHIP_DESTROYED;
- NUKE_IMPACT.

Prohibited:
- PROJECTILE_CULL_EXPLOSION;
- UNKNOWN;
- undefined/null source in normal combat.

Out-of-bounds:
`destroy()` only.
