# REV2 ACCEPTANCE

Return: `GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_010_REV2`

Required:

```text
FOUR_DIRECTION_PLAYER_MOVEMENT = PASS
DIAGONAL_SPEED_NORMALIZED = PASS

PLAYER_HIT_LIFE_DELTA = -1
PLAYER_HIT_SCORE_DELTA = 0
PLAYER_RESPAWN = PASS
PLAYER_RESPAWN_POSITION = APPROVED SPAWN
PLAYER_RESPAWN_VISIBLE = PASS
PLAYER_RESPAWN_DUPLICATES = 0
PLAYER_GHOST_BODIES = 0
RESPAWN_INVULNERABILITY = PASS
LIFE_CASCADE_ON_SINGLE_HIT = 0

LEVEL1_FORMATION_ROWS = 2
LEVEL1_FORMATION_COLUMNS = 29
LEVEL1_FORMATION_TOTAL = 58

SHIELD_ZONE_PRESENT = PASS
SHIELD_TILE_INDIVIDUAL = PASS
ENEMY_SHIELD_HIT_SCORE_DELTA = -1
PLAYER_SHIELD_HIT_SCORE_DELTA = 0

PLAYFIELD_LAYOUT_AUTHORITY = 1
VIEWPORT_DIRECTLY_EQUALS_SIMULATION_MODEL = NO
RESPONSIVE_SCALE_RATIOS = PASS

PHYSICS_DEBUG_MODE = PASS
PLAYER_BODY_VISUAL_ALIGNMENT = PASS
SCOUT_BODY_VISUAL_ALIGNMENT = PASS
PLAYER_LASER_BODY_ALIGNMENT = PASS
ENEMY_LASER_BODY_ALIGNMENT = PASS
SHIELD_BODY_ALIGNMENT = PASS
DIRECT_HIT = PASS
NEAR_MISS = PASS
RESPAWN_BODY_REPOSITION = PASS
RESIZE_BODY_REPOSITION = PASS
```

CI:
```text
backend = SUCCESS
client-and-game = SUCCESS
docker-smoke = SUCCESS
runtime-hostile = SUCCESS
```

Scope remains bounded:
- full Level 1 not claimed;
- Level 2 not started;
- Boss not started;
- final GameOver/Victory not started;
- Boarding not started.

Return evidence:
- exact final SHA;
- PlayfieldLayout design;
- legacy-vs-v1 composition matrix;
- 4-direction tests;
- respawn lifecycle/invulnerability tests;
- 58-enemy evidence;
- shield matrix/collision evidence;
- physics-debug screenshots;
- projectile mapping;
- viewport matrix;
- performance sample;
- local/CI results;
- Founder preview URL;
- governance debt count;
- clean worktree;
- POST_BOX;
- sealed SHA-256.

PR #4 remains OPEN / DRAFT / NOT MERGED.
