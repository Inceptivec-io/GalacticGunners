# GALACTIC GUNNERS — DEVTEAM HANDOFF IN 004 REV3

**Priority:** P1 / GGF-1 closure blocking  
**Branch:** `feature/GG-COM-001`  
**Expected Entry HEAD:** `5b91bed73ce8846ec577575dab10de1527084820`  
**Founder / Merge Authority:** Michael Leese  
**Technical/Product Gate:** Galactic Gunners CTO

## Purpose

Close the remaining playability blockers:

1. nuke HUD wrong location/proportion;
2. unexplained shield/base explosion events;
3. player lasers still do not reliably fire;
4. player visual-frame stability needs real runtime proof;
5. Pause still contains extra visible resume control;
6. current landing page is superseded by new Founder hero;
7. QA must expose real physics bodies and collision paths.

REV3 is intended to be the final legacy-runtime stabilisation movement before GGF-2 Production Application Architecture Formation.

## Entry gate

Before mutation:
- read `AGENTS.md`;
- `git fetch origin`;
- prove local HEAD == remote feature HEAD == expected entry HEAD;
- prove no uncommitted implementation work except explicitly authorised POST_BOX transport;
- record entry evidence.

If mismatch:
`STOP — ENTRY_STATE_MISMATCH`.

## Preserve

Do not regress:
- minimum score floor = 0;
- locked scoring;
- owned audio;
- shield matrix;
- comet +500/+1 nuke;
- result routing;
- controller support;
- full stellar viewport;
- Roadmap/Playlist v1.1.
