HANDOFF / COMMISSION:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_004_REV5

FINAL REVISION IN HANDOFF 004.
DO NOT GUESS. DO NOT WIDEN SCOPE.

ENTRY HEAD:
10c228c1108921e8545eedbcfadbcb57afbd7694

BRANCH:
feature/GG-COM-001

ONLY TWO PRODUCT CHANGES:
1. final 4K landing hero;
2. gameplay/combat integrity.

CTO SOURCE-CONFIRMED ROOT CAUSES:

A. Player death while flying is caused by explicit player-damage callbacks still registered for asteroid, enemy-body, comet, mothership and scout contacts. REMOVE those damage outcomes.

B. Player lasers are still destroyed by the player's own shield tiles. REMOVE player-projectile/shield damage and collision outcome. Player laser/nuke pass through shields.

C. `updateLasers()` fabricates impact explosions when lasers are merely culled at top/bottom boundaries. CHANGE laser culling to silent destroy.

D. Keyboard/controller first fire waits through the repeat tick threshold. CHANGE to immediate first shot on press/rising edge, then repeat at the existing approximate held-fire cadence.

E. Player laser currently spawns from player centre. Spawn immediately above the stable player hard-body top/nose.

F. Arcade overlap and swept collision duplicate some detection paths. Both may detect; ONE idempotent resolver owns each gameplay outcome.

FINAL v0.1 DAMAGE RULE:
ONLY ENEMY / ALIEN LASER FIRE MAY DAMAGE THE PLAYER.

COMBAT MATRIX:

PLAYER LASER:
player PASS
shield PASS
enemy HIT
scout HIT
mothership HIT
asteroid HIT
comet HIT

PLAYER NUKE:
player PASS
shield PASS
enemy HIT
scout HIT
mothership HIT
asteroid HIT
comet HIT

ENEMY LASER:
player HIT
shield HIT
enemy/scout/mothership/asteroid/comet PASS

ENEMY BODY:
player PASS
shield retains existing contact damage

ASTEROID BODY → player PASS
COMET BODY → player PASS
SCOUT BODY → player PASS
MOTHERSHIP BODY → player PASS

SCENE CHANGES:
Level1: remove asteroid/player damage, enemy/player damage, playerLaser/shield damage.
Level2: same.
Boss: remove asteroid/player, player/mothership, player/scout and shared comet/player damage.
Shared comet logic: player/comet body contact is PASS.

Create a canonical enemy-laser player-damage resolver. No other collision callback may directly perform playerHit → reset → onLifeDown.

Create an idempotent player-projectile target resolver. Mark resolution BEFORE score/explosion/target mutation.

HERO:
Runtime authority = `gg_hero_image_player_fighting_v002_4k_uhd_master.png`.
Retain `gg_hero_image_player_fighting_v002_2x_poster_master.png` as source/provenance master.
Use contain / fit-entire-image semantics. Preserve as much composition as possible. Do not stretch or aggressively crop.

MANDATORY TESTS:
- 30s player movement with enemy firing disabled; lives unchanged even through asteroid/comet/enemy body paths.
- 10s keyboard continuous fire; immediate first shot; no self-damage; shots pass shields.
- same for controller.
- touch fire.
- player laser through shield: shield survives.
- enemy laser into shield: shield damaged.
- one enemy laser into player: exactly one life decrement.
- player/enemy laser culling: zero explosions.
- physics debug proof for bodies and the above paths.
- source audit proving enemy laser is the only normal combat life-loss source.

CLOSURE:
PLAYER_DAMAGE_SOURCE_ENEMY_LASER_ONLY = PASS
BODY_CONTACT_PLAYER_DAMAGE = 0
PLAYER_PROJECTILE_SELF_DAMAGE = 0
PLAYER_PROJECTILE_SHIELD_DAMAGE = 0
FIRST_SHOT_IMMEDIATE = PASS
CONTINUOUS_FIRE = PASS
CULL_EXPLOSIONS = 0
UNEXPLAINED_BASE_EXPLOSIONS = 0
DUPLICATE_DAMAGE_CALLBACKS = 0
DUPLICATE_SCORE_CALLBACKS = 0
4K_HERO = PASS
QA_ALL = PASS
NORMAL_VISUAL = PASS
DEBUG_VISUAL = PASS

Rebuild Docker from final pushed HEAD.
Normal: http://localhost:8027/
Debug: document exact debug URL.
POST_BOX payload 0.
Worktree clean.
Local HEAD = remote HEAD.
No merge.

Return:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_004_REV5

Founder acceptance remains PENDING.
