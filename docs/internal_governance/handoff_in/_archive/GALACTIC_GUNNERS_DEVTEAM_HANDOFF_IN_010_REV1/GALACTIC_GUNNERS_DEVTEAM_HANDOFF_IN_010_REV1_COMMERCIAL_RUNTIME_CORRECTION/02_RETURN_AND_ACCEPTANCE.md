# REV1 RETURN / ACCEPTANCE

Continue PR #4.

Do not open another PR.

Return:
`GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_010_REV1`

Required final head and exact test evidence.

## Required local/CI gates

```text
npm ci = PASS
npm run quality = PASS
game tests = PASS
web build/typecheck = PASS
contracts = PASS
backend check/migrations/pytest = PASS
docker config/build/start = PASS

runtime hostile suite = PASS
visual regression suite = PASS
responsive viewport matrix = PASS
offline backend suite = PASS

GitHub:
backend = SUCCESS
client-and-game = SUCCESS
docker-smoke = SUCCESS
runtime-hostile = SUCCESS
```

## Required commercial gates

```text
PLAYER_FACING_DEV_TERMS = 0
UNINTENDED_BLACK_BARS = 0
CANVAS_PAGE_SEAMS = 0
HERO_KEY_ART_INTEGRATED = PASS
MAIN_MENU_COMMERCIAL_COMPOSITION = PASS
PLAYER_SCOUT_STATIC_SINGLE_FRAME_ONLY = NO
SPRITE_BLEED = 0
INPUT_SYSTEM_SINGLE_AUTHORITY = PASS
DUPLICATE_COLLISION_AUTHORITY = 0
VISIBLE_MISS_SCORES = 0
VISIBLE_MISS_DAMAGES = 0
```

## Required scope

```text
FULL_LEVEL1_CLAIMED = NO
LEVEL2_STARTED = NO
BOSS_STARTED = NO
FINAL_GAMEOVER_STARTED = NO
FINAL_VICTORY_STARTED = NO
BOARDING_STARTED = NO
LEGACY_GAME_MUTATED = NO
ASSET_BYTES_MUTATED = 0
GOVERNANCE_DEBT_COUNT = 0
```

## Return evidence

Include:
- before/after visual defect matrix;
- screenshots at required viewports;
- visual regression references/results;
- hostile suite source + command + result;
- CI workflow run;
- exact hero/key-art Asset ID/path/hash;
- exact sprite frame/animation source;
- collision body dimensions/offset evidence;
- direct-hit and near-miss results;
- input architecture proof;
- behaviour tuning provenance table;
- all Founder manual-test URLs;
- local == remote;
- clean worktree;
- POST_BOX closed;
- sealed SHA-256.

PR remains:
OPEN / DRAFT / NOT MERGED.
