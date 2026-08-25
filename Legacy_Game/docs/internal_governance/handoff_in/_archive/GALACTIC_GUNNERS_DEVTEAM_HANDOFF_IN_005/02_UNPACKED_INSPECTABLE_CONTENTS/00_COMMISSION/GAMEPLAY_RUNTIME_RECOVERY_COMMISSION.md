# GALACTIC GUNNERS — P0 GAMEPLAY RUNTIME RECOVERY

**Handoff:** `GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_005`  
**Classification:** P0 STOP-THE-LINE  
**Entry HEAD:** `47787b303abf674536a7d4bb16413aa19291b216`  
**Branch:** `feature/GG-COM-001`  
**Historical Working Behaviour Reference:** `8f7c1e207631109155b93d5dc11cf9c16acc768d`  
**Founder / Merge Authority:** Michael Leese  
**Technical Authority:** Galactic Gunners CTO

## Scope

Gameplay runtime only.

Authorised:
- player laser lifecycle;
- enemy laser lifecycle;
- nuke lifecycle where necessary for combat integrity;
- projectile movement;
- collision detection;
- damage resolution;
- comet projectile collision;
- explosion causality;
- gameplay test/visual assurance needed to prove the above.

Not authorised:
- landing/menu changes;
- HUD changes;
- fonts;
- pause;
- Victory/Game Over layout;
- score values;
- visual asset redesign;
- architecture migration;
- leaderboard;
- Boarding.

Freeze everything outside gameplay runtime.

## P0 exit rule

No claim of PASS is valid until the **actual integrated Docker runtime** passes Founder-observable gameplay tests.

A helper-unit PASS cannot substitute for integrated runtime PASS.
