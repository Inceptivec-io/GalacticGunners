HANDOFF / COMMISSION:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_004_REV4

PARENT:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_004_REV3

ENTRY HEAD:
943f9f241e2067625f8425aa574c476710871e36

TARGET:
C:\Users\Michael\dev\GalacticGunners

REMOTE:
https://github.com/Inceptivec-io/GalacticGunners.git

BRANCH:
feature/GG-COM-001

PRIORITY:
P1 / Founder-acceptance legacy-baseline closure

DO NOT:
- create another branch
- create another worktree
- merge
- widen scope beyond the items below

PURPOSE:
Close the final bounded Founder review issues so the legacy runtime becomes a reasonable, playable, reviewable GGF-1 baseline for acceptance, after which focus moves to the new production architecture.

FIRST:
- read root AGENTS.md
- git fetch origin
- verify local HEAD == 943f9f241e2067625f8425aa574c476710871e36
- verify origin/feature/GG-COM-001 == same
- verify worktree clean before mutation
- record exact entry state

============================================================
1. LANDING HERO COMPOSITION
============================================================

The new landing hero is acceptable but is too tightly zoomed/cropped.

Required:
- reduce the zoom level slightly
- preserve more of the original composition and image shape
- keep the player-vs-alien battle scene readable
- do not distort the image
- do not replace the hero asset
- retain clean event-driven controls over the image

Pass condition:
- the landing page hero is recognisably the supplied battle scene with more visible composition than the current returned state
- UI remains readable and functional

============================================================
2. PLAYER LASER MUST NEVER HARM THE PLAYER
============================================================

Current behaviour suggests the player can be killed by their own forward laser or by an incorrect collision path.

This is prohibited.

Required collision rules:
- player laser affects enemies / valid hostile targets / valid destructible gameplay targets only
- player laser must NOT affect player
- player laser must NOT trigger player death
- alien laser affects player and shield/base tiles only
- alien laser must NOT damage alien ships
- player and alien projectiles must each use explicit collision groups / filtering / handlers
- remove any ambiguous shared overlap path causing self-hit or wrong-side hits

Required proof:
- deterministic test where player fires continuously and cannot self-destruct from own projectile
- deterministic test where alien laser can hit player
- deterministic test where alien laser can hit shield/base tiles
- deterministic test where player laser hits legal target and behaves correctly

============================================================
3. PLAYER INFO / HUD STATE AUTHORITY
============================================================

Founder requires the player information display to be fixed properly once and for all.

Create one authoritative HUD/state contract.

The HUD must initialise and update consistently from the authoritative gameplay state across:
- scene start
- restart
- continue
- game over
- victory / level complete
- pause / resume where relevant

There must be no stale values, duplicate bindings, mismatched display elements, or scene-specific drift.

Authoritative HUD concerns:
- score
- lives
- nukes
- nuke arm/rearm progress
- sound state

============================================================
4. FINAL LOWER HUD LAYOUT
============================================================

The founder-approved HUD direction is now locked.

TOP LEFT:
- SCORE only
- score may remain at top left
- score must use the new cinematic/title font style
- all other runtime text should align to the newer approved font direction where applicable

TOP RIGHT:
- sound mute/unmute button only
- no nuke HUD here
- no lives HUD here

BOTTOM RIGHT:
- "LIVES"
- then ship image repeated for remaining lives
- lives represented by ship images only
- no numeric lives counter
- no extra lives text/value clutter
- ship icons must be clearly visible and properly scaled

BOTTOM LEFT:
Permanent grouped HUD containing:
- "NUKES"
- then nuke image repeated for the currently held number of nukes
- no numeric nuke counter
- "ARM NUKE"
- then a visual activation / rearm bar
- the bar must fill from empty to full instead of showing rearm numbers
- nuke icons must be clearly visible and properly scaled

Rules:
- bottom-left and bottom-right groups must remain fully within viewport
- do not overlap gameplay-critical space more than necessary
- layout must be consistent across Level 1, Level 2 and boss scenes

============================================================
5. GAME OVER SCREEN CORRECTIONS
============================================================

Founder review still identifies the following defects.

Required:

A. SCORE POSITION
- the score must NOT cover the hero/result image
- move the score to the bottom region of the result screen
- it must be clear, readable, and not obscure the art

B. BUTTON ALIGNMENT
- the visible embedded buttons remain the authority
- interactive hit areas must align to the visible embedded buttons exactly
- remove duplicate / stacked / offset false button layers
- only one correct set of interactive controls should exist

C. GAMEPLAY SUSPENSION
- gameplay must not continue running in the background behind game over
- on game over, active gameplay must be suspended
- stop / freeze:
  - player control
  - alien movement updates where appropriate
  - projectile travel
  - collisions
  - ongoing combat state progression
- the result state should present as a stable game-over screen, not a still-active fight behind a result panel

D. RESULT TEXT CLEANLINESS
- preserve only the required visible result treatment
- do not reintroduce clutter that obstructs the art or conflicts with the embedded image language

============================================================
6. TEXT / FONT CONSISTENCY
============================================================

Required:
- score uses the new approved cinematic/title font treatment
- runtime text surfaces should be aligned to the improved visual language wherever already in scope
- do not introduce a new unrelated font system
- do not widen scope to a full typography redesign
- this is a consistency correction, not a new art programme

============================================================
7. VISUAL / FUNCTIONAL VERIFICATION
============================================================

Verifier must prove all of the following with screenshots and machine-readable evidence:

LANDING HERO:
- less zoomed than REV3
- more composition retained
- controls still work

LASER LOGIC:
- player cannot be harmed by player laser
- alien laser can damage player
- alien laser can damage shield/base tiles
- player laser damages intended hostile targets

HUD:
- top-right contains sound button only
- bottom-right contains LIVES + ship icons only
- bottom-left contains NUKES + nuke icons + ARM NUKE + progress bar
- no numeric lives display
- no numeric nuke display
- no rearm numbers
- score top-left in approved font direction

GAME OVER:
- score moved to bottom and not over art
- button hit areas aligned
- duplicate button layers absent
- gameplay suspended in background

============================================================
8. DOCKER / CLOSURE
============================================================

At final exact pushed HEAD:
- docker compose down
- docker compose up --build -d

Return:
- Founder preview URL
- stop command
- exact pushed SHA
- local/remote proof
- concise implemented summary
- exact verification summary
- evidence locations
- sealed SHA-256
- worktree clean confirmation
- POST_BOX reduced to boundary controls only

Required closure state:
- HEAD == origin/feature/GG-COM-001
- worktree clean
- POST_BOX payload zero
- no merge performed
- Founder acceptance remains PENDING

RETURN AS:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_004_REV4