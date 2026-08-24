HANDOFF / COMMISSION:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_004_REV3

PARENT:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_004_REV2

ENTRY HEAD:
5b91bed73ce8846ec577575dab10de1527084820

PURPOSE:
Close remaining playability blockers, add Phaser physics-debug baby rails and visual collision tests, integrate the new Founder landing hero, then present one final GGF-1 Docker candidate.

BRANCH:
feature/GG-COM-001

DO NOT CREATE ANOTHER BRANCH.
DO NOT CREATE ANOTHER WORKTREE.
DO NOT MERGE.

FIRST:
- read AGENTS.md;
- fetch origin;
- verify local/remote HEAD == entry HEAD;
- record entry state;
- receive/unpack this transport;
- do not retain transport ZIP.

NUKE HUD:
Move back to lower-right HUD area.

Required:

REARM: 150/150

[NUKE ICON]  2

Icon and number must be comparable size.
Number immediately right of icon.
No NUKES word.
No top-right placement.

BASE EXPLOSIONS:
Trace every explosion in shield/base region.
Every effect must have an explicit collision/event source.
No random shield explosion.
Review projectile culling and remove false visible cull effects.
UNEXPLAINED_SHIELD_REGION_EXPLOSIONS = 0.

PLAYER LASERS:
Founder says they still do not shoot reliably.

Prove full chain:
INPUT → SPAWN → BODY → VISIBLE → VELOCITY → MOVEMENT → COLLISION.

Test keyboard, controller and touch separately.
Return machine-readable fire trace.
Founder must visibly see lasers firing in normal Docker runtime.

PHASER DEBUG BABY RAILS:
Use Arcade Physics body debugging in TEST MODE.

Normal URL:
http://localhost:8027/

Preferred debug URL:
http://localhost:8027/?ggPhysicsDebug=1

Debug mode must box:
player, enemy, boss, shield, player laser, enemy laser, nuke, asteroid, comet.

Where useful draw test-only logical envelope, hard collision envelope and swept projectile path.

Debug must be OFF by default and must not change gameplay.

COLLISION FIXTURES:
Create deterministic laser→destroyer, scout, cruiser, asteroid, shield; nuke→enemy; near-miss fixtures.
Run normal + debug.
Results must match.

PLAYER FRAME STABILITY:
Founder must see no jump between idle/thrust frames.
Preferred: normalise player frames to transparent 496×703 logical envelope with common hull anchor.
Do not stretch art.
Return quantitative runtime envelope proof.

PAUSE:
Remove separate visible Resume image/button.
Founder pause image is the visual.
Resume via invisible/event-driven keyboard/controller/pointer/touch.

LANDING:
Use supplied gg_hero_image_player_fighting.png as full-bleed landing/main-menu hero.
Aspect-preserving cover.
Keep live Start, Info, Sound and input support.
Reduce old menu clutter.

VISUAL QA:
Run normal and physics-debug visual suites.
Screenshot capture itself is not PASS.
Assert texture, visibility, component bounds, body geometry, velocity/path and safe-area containment.

CLOSURE INTENT:
If Founder accepts this candidate:
GGF-1 = ACCEPTED BEHAVIOURAL BASELINE.

Then stop evolving the legacy HTML/global-JS layer except critical regressions and move to:
GGF-2 Production Application Architecture Formation
→ Phaser/TypeScript
→ Next.js
→ Django/DRF/Postgres
→ GameRun/player
→ leaderboard
→ Boarding.

DOCKER:
At final pushed HEAD:
docker compose down
docker compose up --build -d

Leave normal runtime running at:
http://localhost:8027/

Document exact physics-debug activation.

RETURN:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_004_REV3

Required:
LASERS FIRE = PASS
LASER COLLISION = PASS
NUKE COLLISION = PASS
DEBUG BODIES = PASS
UNEXPLAINED BASE EXPLOSIONS = 0
NUKE HUD = PASS
PLAYER FRAME JUMP = 0
PAUSE EXTRA VISIBLE RESUME ART = 0
LANDING HERO = PASS
NORMAL + DEBUG VISUAL SUITES = PASS
MIN SCORE = 0
LOCKED SYSTEMS PRESERVED = PASS
DOCKER = FINAL HEAD / HEALTHY
POST_BOX = EMPTY PAYLOAD
WORKTREE = CLEAN
LOCAL HEAD = REMOTE HEAD

FOUNDER ACCEPTANCE REMAINS PENDING.

DO NOT MERGE.
