# REV3 ACCEPTANCE / RETURN

Return:
`GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_010_REV3`

Continue PR #4.

Required gates:

```text
PLAYER_SCALE_REV2_RATIO = 0.60 ± 0.05
SCOUT_SCALE_REV2_RATIO = 1.05–1.10

LEVEL1_ENEMIES = 58
LEVEL1_BUNKERS = 8
INITIAL_SHIELD_TILES = 256
SHIELD_BOTTOM_GAP_PLAYER_HEIGHTS = 2.0–2.25

PLAYER_LASER_WORLD_LENGTH > PLAYER_LASER_WORLD_WIDTH
ENEMY_LASER_WORLD_LENGTH > ENEMY_LASER_WORLD_WIDTH
LASER_SQUASH = 0
LASER_BODY_ALIGNMENT = PASS

NORMAL_PLAYER_ORIGIN_DIRECT_HIT = PASS
NORMAL_PLAYER_ORIGIN_NEAR_MISS = PASS
PROJECTILE_TUNNELLING = 0

PAUSE_KEY_P = PASS
PAUSE_STATE_FREEZE = PASS
RESUME = PASS

INITIAL_NUKES = 2
NUKE_KEY_N = PASS
NUKE_GAMEPAD_Y = PASS
NUKE_COUNT_DECREMENT = 1
NUKE_COUNT_NEGATIVE = 0
NUKE_PROJECTILE = PASS
NUKE_BURST = PASS
NUKE_SCORE_DUPLICATION = 0
REARM_INITIAL = 150/150
REARM_AFTER_FIRE = PASS
NUKE_HUD = PASS

FOUR_DIRECTION_MOVEMENT = PASS
RESPAWN = PASS
RESPAWN_INVULNERABILITY = PASS
```

Quality:
- npm ci PASS;
- npm run quality PASS;
- backend checks/tests PASS;
- Docker PASS;
- runtime-hostile PASS;
- GitHub backend/client-and-game/docker-smoke/runtime-hostile SUCCESS.

Scope:
Do not start full Level1 expansion beyond these restored mechanics, Level2, Boss, final GameOver, final Victory, Boarding, auth UI, leaderboard UI, deployment or tag.

Return evidence:
- final SHA;
- REV2→REV3 scale table;
- viewport ratios;
- laser source/render/body dimensions;
- real-origin direct-hit trace;
- near-miss trace;
- speed derivation;
- 8-bunker/256-tile proof;
- shield lane ratio;
- nuke asset IDs/paths/hashes;
- nuke/rearm traces;
- pause/resume trace;
- physics debug screenshots;
- hostile suite output;
- GitHub Actions;
- Founder preview URL;
- governance debt 0;
- Legacy_Game mutation NO;
- canonical asset-byte mutation NO;
- worktree clean;
- local == remote;
- POST_BOX boundary-only;
- sealed SHA-256.

PR remains OPEN / DRAFT / NOT MERGED.
