HANDOFF / COMMISSION:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_005

CLASSIFICATION:
P0 STOP-THE-LINE GAMEPLAY RUNTIME RECOVERY

ENTRY HEAD:
47787b303abf674536a7d4bb16413aa19291b216

BRANCH:
feature/GG-COM-001

HISTORICAL WORKING BEHAVIOUR REFERENCE:
8f7c1e207631109155b93d5dc11cf9c16acc768d

THIS IS A NEW HANDOFF SEQUENCE.
DO NOT CREATE REV6.

SCOPE:
GAMEPLAY RUNTIME ONLY.

FREEZE:
landing
HUD
fonts
Pause
Victory
Game Over
assets
scoring values
governance architecture
future production architecture

============================================================
CTO FINDING 1 — REV5 TEST PASS IS NOT VALID GAMEPLAY PROOF
============================================================

The current REV5 Playwright verifier removes all scene timers,
clears gameplay groups,
directly calls firing helpers,
manually steps physics,
directly calls swept collision,
and even installs its own test overlap.

That is not the runtime the Founder plays.

STOP using synthetic helper execution as integration acceptance.

Unit tests may call helpers.

GAMEPLAY acceptance MUST use:
real Docker runtime
real active scene
real browser keyboard input
real scene collision registrations
real production entity factories
real timer/update lifecycle.

============================================================
CTO FINDING 2 — RECOVER THE SIMPLE COMBAT MODEL
============================================================

The 2019 working implementation used:
one projectile movement path
+
Phaser overlap collision.

The present legacy runtime has accumulated:
physics velocity
+
Arcade overlap
+
swept collision timer
+
shared resolvers
+
synthetic test stepping.

For the v0.1 legacy baseline:

NORMAL COLLISION AUTHORITY = PHASER ARCADE OVERLAP

DISABLE ggInstallSweptCollisionContracts() in normal gameplay.
DISABLE ggRunSweptCollisionContracts() in normal gameplay.

Do not delete future design knowledge.
Do not use swept collision as legacy runtime authority.

============================================================
CTO FINDING 3 — REBUILD PROJECTILE LIFECYCLE
============================================================

PlayerLaser / EnemyLaser / EnemyMotherShipLaser must be proper
Phaser.Physics.Arcade.Sprite projectile entities.

Factory lifecycle:

CREATE
→ ADD GAME OBJECT
→ ADD PHYSICS
→ SET SCALE/ORIGIN
→ SET BODY
→ FINAL SPAWN POSITION
→ ADD TO PROJECTILE GROUP
→ SET VELOCITY LAST

Do NOT assign velocity and then reset/reinitialize the body afterward.

Player laser spawn:
immediately above player nose / hard-body top.

Enemy laser spawn:
immediately below enemy meaningful hull.

Every projectile gets:
owner
runtime projectile id
spawn trace
destruction reason.

============================================================
COMBAT MATRIX
============================================================

PLAYER LASER:
player = PASS
shield = PASS
enemy = HIT
scout = HIT
mothership = HIT
asteroid = HIT
comet = HIT

PLAYER NUKE:
player = PASS
shield = PASS
enemy = HIT
scout = HIT
mothership = HIT
asteroid = HIT
comet = HIT

ENEMY LASER:
player = HIT
shield = HIT
enemy/scout/mothership/asteroid/comet = PASS

BODY CONTACT:
player ↔ enemy = PASS
player ↔ scout = PASS
player ↔ mothership = PASS
player ↔ asteroid = PASS
player ↔ comet = PASS

enemy body ↔ shield = retain current authorised shield contact rule

============================================================
EXACT OVERLAPS
============================================================

Register player laser with:
enemies
scouts where present
mothership where present
asteroids
comets

Register nuke with:
same authorised hostile/destructible target families

Register enemy laser with:
player
shield

Do NOT register illegal target pairs.

Comet MUST be a normal production collision target.
No reliance on a separate incomplete swept system.

============================================================
DAMAGE AUTHORITY
============================================================

Normal combat player damage source:
ENEMY LASER ONLY.

Every life decrement must produce trace:
scene
timestamp
projectile id
projectile side
player bounds
projectile bounds
damage source.

UNTRACED LIFE DECREMENT = P0 FAIL.

One enemy projectile:
MAXIMUM ONE LIFE DECREMENT.

============================================================
EXPLOSION AUTHORITY
============================================================

Every gameplay explosion requires semantic event source.

UNKNOWN / NULL explosion source = P0 FAIL.

Out-of-bounds projectile:
SILENT DESTROY.

No cull explosion.

============================================================
REAL INTEGRATED TESTS
============================================================

Do NOT:
removeAllEvents()
clear the scene as primary integration proof
call ggHandlePlayerFiring directly
call damage resolver directly
manually install test collision overlaps
manually call swept collision as proof.

TEST REAL GAME.

1. Start Level1 normally.

2. Send actual Playwright Space key:
down
wait 100ms
up.

Verify:
laser object appears
laser visible screenshot
laser Y decreases after 200ms.

3. Hold real Space 3 seconds.
Verify repeated visible shots.

4. Run player movement with random enemy fire disabled by deterministic TEST MODE only.
Normal scene timers/collisions stay installed.
No life loss.

5. Spawn one comet through test fixture into LIVE scene.
Do not alter collision registrations.
Fire REAL Space key.
Laser must hit comet.
Comet destroyed.
+500 score.
+1 nuke.

6. Put one shield in live path.
Fire REAL Space.
Laser passes.
Shield survives.

7. Spawn one production EnemyLaser through production factory.
Let it travel normally.
It must visibly hit player.
Exactly one life lost.

8. Repeat debug cases at:
http://localhost:8027/?ggPhysicsDebug=1

Show bodies aligned to visuals.

============================================================
PERMANENT QA
============================================================

Create semantic product commands:

qa:gameplay
qa:gameplay:visual
qa:gameplay:debug

Handoff evidence calls these.

Do not make a handoff-number script the permanent product gameplay authority.

============================================================
P0 EXIT
============================================================

PLAYER_LASER_VISIBLE = PASS
PLAYER_LASER_MOVES_UP = PASS
PLAYER_LASER_REPEAT_FIRE = PASS
ENEMY_LASER_VISIBLE = PASS
ENEMY_LASER_MOVES_DOWN = PASS

PLAYER_LASER_ENEMY = PASS
PLAYER_LASER_ASTEROID = PASS
PLAYER_LASER_COMET = PASS
PLAYER_LASER_SHIELD_PASS = PASS

ENEMY_LASER_PLAYER = PASS
ENEMY_LASER_SHIELD = PASS

PLAYER_BODY_CONTACT_DAMAGE = 0
UNTRACED_PLAYER_LIFE_DECREMENT = 0

COMET_SCORE = +500
COMET_NUKE = +1

UNKNOWN_EXPLOSION_SOURCE = 0
CULL_EXPLOSIONS = 0
UNEXPLAINED_BASE_EXPLOSIONS = 0

NORMAL_SWEPT_COLLISION_LOOP = OFF
NORMAL_COLLISION_AUTHORITY = ARCADE_OVERLAP

REAL_KEYBOARD_RUNTIME_TEST = PASS
REAL_COMET_RUNTIME_TEST = PASS
REAL_ENEMY_LASER_RUNTIME_TEST = PASS
DEBUG_VISUAL = PASS

FOUNDER DOCKER GAMEPLAY = PLAYABLE

NO MERGE.
FOUNDER ACCEPTANCE PENDING.

Return:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_005
