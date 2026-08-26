# ASSURANCE / EXIT GATE

## Architecture

```text
GAMEHOST_MOUNTS_PHASER = PASS
PHASER_INSTANCE_COUNT_PER_MOUNT = 1
PHASER_DESTROY_ON_UNMOUNT = PASS
GAME_CORE_REACT_IMPORTS = 0
GAME_CORE_NEXT_IMPORTS = 0
LEGACY_GAME_RUNTIME_IMPORTS = 0
```

## Scenes

```text
BOOT_TO_MENU = PASS
MENU_TO_LEVEL1 = PASS
LEVEL1_TO_REPLAY = PASS
LEVEL1_TO_MENU = PASS
FAILED_TO_RETRY = PASS
FAILED_TO_MENU = PASS
STALE_OBJECTS_AFTER_REPLAY = 0
```

## Gameplay

```text
PLAYER_VISIBLE = PASS
PLAYER_MOVES_LEFT_RIGHT = PASS
PLAYER_BOUNDED = PASS
PLAYER_FIRE = PASS
SCOUT_WAVE_VISIBLE = PASS
SCOUT_COLLISION = PASS
SCOUT_DESTROYED_SCORE_DELTA = 25
PLAYER_DAMAGE_LIFE_DELTA = -1
PLAYER_DAMAGE_SCORE_DELTA = 0
MIN_SCORE = 0
LIVES_BELOW_ZERO = 0
PROJECTILE_LEAK = 0
```

## Assets

```text
CANONICAL_RUNTIME_ASSET_COUNT > 0
LEGACY_RUNTIME_ASSET_COUNT = 0
UNREGISTERED_RUNTIME_ASSET_COUNT = 0
UNKNOWN_RIGHTS_RUNTIME_ASSET_COUNT = 0
ASSET_HASH_MUTATIONS = 0
```

## Input

```text
KEYBOARD_LEFT_RIGHT = PASS
KEYBOARD_FIRE = PASS
POINTER_TOUCH_CAPABILITY_PATH = PASS
GAMEPAD_CAPABILITY_PATH = PASS
MANUAL_TOUCH_SELECTOR = ABSENT
```

## GameRun

```text
BACKEND_AVAILABLE_START_RUN = PASS
RUN_ID_RETAINED = PASS
BACKEND_UNAVAILABLE_GAME_STILL_PLAYABLE = PASS
OFFLINE_MODE_FABRICATED_RUN_ID = NO
ONLINE_COMPLETE_SUBMISSION_ONCE = PASS
REPLAY_NEW_RUN = PASS
```

## Quality

```text
npm ci = PASS
npm run quality = PASS
web typecheck = PASS
web build = PASS
game typecheck = PASS
game tests = PASS
contracts validation = PASS

backend check = PASS
makemigrations --check = PASS
pytest = PASS

docker compose config = PASS
docker compose build = PASS
docker stack start = PASS
web reachable = PASS
api health = PASS
/play Phaser runtime = PASS

GitHub Actions:
backend = SUCCESS
client-and-game = SUCCESS
docker-smoke = SUCCESS
```

## Founder manual test

Return exact URLs.

Expected current local topology:

- `http://localhost:3002/`
- `http://localhost:3002/play`
- `http://localhost:8010/api/v1/health/`

Founder must be able to:
1. open home;
2. click Play;
3. see Main Menu;
4. start slice;
5. move;
6. shoot;
7. destroy scouts;
8. observe +25 each;
9. take damage and lose life without score loss;
10. clear/retry;
11. return menu.

## Governance

Do not fork Roadmap or Playlist.

Reconcile stale current-state/status language in the existing v1.1 authorities while preserving strategy.

At return:

```text
branch model = feature/* -> dev -> stage -> prod
default branch = prod
main = deleted
production architecture = accepted
v1.0 build = ACTIVE

Sprint 001:
Boot/MainMenu/Level1 vertical slice = RETURNED FOR REVIEW

full Level1 = NOT CLAIMED
Level2 = NOT STARTED
Boss = NOT STARTED
final GameOver/Victory = NOT STARTED
Boarding = NOT STARTED
```

Required:

`GOVERNANCE_DEBT_COUNT = 0`

## PR

Open exactly one PR:

HEAD:
`feature/v1-level1-vertical-slice`

BASE:
`dev`

Title:
`Build Galactic Gunners v1.0 Level 1 playable vertical slice`

Leave:
`OPEN / DRAFT / NOT MERGED`

## Return

Return:

`GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_010`

Include:
- entry SHA;
- final pushed SHA;
- legacy behaviour extraction matrix;
- exact legacy files inspected;
- scene/entity/system summary;
- exact canonical Asset IDs/paths/hashes/runtime paths;
- asset-delivery mechanism;
- score/life/input/audio results;
- online/offline GameRun results;
- test counts/results;
- Docker/browser smoke;
- Founder manual-test URLs;
- GitHub Actions run ID/results;
- planning/currentness changes;
- governance debt count;
- Legacy_Game mutation result;
- runtime legacy import count;
- unregistered runtime asset count;
- PR URL/state;
- local == remote;
- clean worktree;
- POST_BOX state;
- sealed Handoff-Out SHA-256.

DO NOT MERGE.
DO NOT BEGIN NEXT GAMEPLAY SLICE.
