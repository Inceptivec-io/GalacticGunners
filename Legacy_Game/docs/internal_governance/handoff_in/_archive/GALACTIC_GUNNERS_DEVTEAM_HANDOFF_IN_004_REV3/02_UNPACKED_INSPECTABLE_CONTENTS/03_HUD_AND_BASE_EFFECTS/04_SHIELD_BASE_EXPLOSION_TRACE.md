# SHIELD / BASE EXPLOSION EVENT TRACE

Founder observes apparently random explosions on shield/base tiles.

Do not guess.

Instrument every explosion created in the shield/base region.

Each must record:
- timestamp;
- scene;
- x/y;
- event source;
- source object;
- target object;
- target destruction;
- score delta.

Valid explicit sources may include:
- PLAYER_LASER_HIT_SHIELD;
- ENEMY_LASER_HIT_SHIELD;
- ENEMY_BODY_HIT_SHIELD.

No cosmetic/random explosion is allowed on an untouched shield tile.

Review projectile culling. Out-of-bounds cleanup should normally destroy silently; do not generate misleading visible explosions merely because a projectile is culled.

Required:
`UNEXPLAINED_SHIELD_REGION_EXPLOSIONS = 0`
`EXPLOSION_WITHOUT_EVENT_SOURCE = 0`
