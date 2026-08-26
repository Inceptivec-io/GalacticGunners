HANDOFF REVISION:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV4

TARGET:
PR #4
feature/v1-level1-vertical-slice

REV4 ENTRY HEAD:
5d0f8d04556a51f3398192e011e8b6b41b9bd2bf

FOUNDER PRODUCT/VISUAL ACCEPTANCE:
ACCEPTED AS-IS AT THIS HEAD

CTO TECHNICAL CLOSURE:
BLOCKED ONLY BY REMOTE CI REPRODUCIBILITY

============================================================
OBSERVED REMOTE CI
============================================================

GitHub Actions run:
32891073238

HEAD:
5d0f8d04556a51f3398192e011e8b6b41b9bd2bf

backend:
SUCCESS

client-and-game:
SUCCESS

docker-smoke:
SUCCESS

runtime-hostile:
FAILURE

Failing command:
GG_RUNTIME_URL=http://localhost:3002 npm run runtime:hostile

Remote failure:
Runtime hostile verification failed: hostile_cases

Local runtime-hostile:
PASS

Therefore:
LOCAL PASS != REMOTE REPRODUCIBLE PASS

DO NOT MERGE YET.

============================================================
REV4 PURPOSE
============================================================

Make the EXISTING Founder-accepted gameplay/runtime state reproducibly pass the same hostile suite in GitHub CI.

THIS IS NOT A PRODUCT CHANGE SPRINT.

DO NOT alter:
- visual composition;
- player/scout scale;
- laser appearance;
- HUD;
- bunkers;
- pause presentation;
- nuke presentation;
- menu;
- gameplay tuning;
- accepted controls;

unless the exact failing CI assertion proves a genuine runtime defect.

============================================================
FIRST ACTION
============================================================

Reproduce the GitHub environment as closely as practical:

Ubuntu / Chromium / Docker / Node 22.

Run the exact hostile command repeatedly.

Identify the exact boolean hostile case(s) returning false.

The current aggregate error:
`hostile_cases`
is insufficient.

Modify test reporting FIRST so each failed case is printed individually before making runtime changes.

Required diagnostic output example:

FAILED:
normal_player_origin_direct_hit
pause_state_freeze

NOT merely:
hostile_cases

============================================================
CLASSIFICATION
============================================================

For each remote-only failure classify:

A. TEST NONDETERMINISM
- timing/race;
- browser scheduling;
- animation/frame timing;
- network startup race;
- random enemy selection;
- screenshot/render timing;
- input event timing.

B. ENVIRONMENT VARIANCE
- Linux/Chromium dimensions;
- font loading;
- device pixel ratio;
- WebGL/software rendering;
- container timing.

C. REAL PRODUCT DEFECT
- actual gameplay invariant fails remotely.

If A or B:
fix the TEST/HARNESS deterministically without weakening the assertion.

If C:
fix only that proven defect and return it explicitly for CTO review.

============================================================
TEST HARDENING RULES
============================================================

Do not:
- increase arbitrary sleeps until green;
- remove hostile cases;
- mark failures optional;
- loosen scale/collision thresholds materially;
- bypass CI;
- retry indefinitely to hide nondeterminism.

Prefer:
- condition-based waits;
- deterministic QA setup;
- seeded random where randomness is not under test;
- exact state-event waits;
- stable physics-step completion checks;
- polling bounded by explicit timeout;
- per-case diagnostics.

The suite must remain hostile.

============================================================
REQUIRED PROOF
============================================================

1. Exact failing remote case identified.

2. Root cause documented.

3. Local hostile suite PASS at least 3 consecutive executions.

4. GitHub `runtime-hostile` PASS on new exact head.

5. All jobs PASS:

backend
client-and-game
docker-smoke
runtime-hostile

6. No Founder-accepted visual/gameplay changes unless classified REAL PRODUCT DEFECT.

7. If runtime code changes:
provide exact reason and before/after behaviour.

============================================================
RETURN
============================================================

Return:

GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_010_REV4

Include:

- REV4 entry SHA;
- final pushed SHA;
- exact remote failing hostile case(s);
- failure classification;
- root cause;
- changed files;
- confirmation whether product/runtime behaviour changed;
- local hostile consecutive-run evidence;
- GitHub Actions run ID;
- backend result;
- client-and-game result;
- docker-smoke result;
- runtime-hostile result;
- PR #4 state;
- local HEAD == remote;
- worktree clean;
- POST_BOX boundary-only;
- sealed SHA-256.

EXIT GATE:

FOUNDER_ACCEPTED_PRODUCT_STATE = PRESERVED
REMOTE_RUNTIME_HOSTILE = SUCCESS
ALL_CI = SUCCESS
GOVERNANCE_DEBT = 0
PR_MERGED = NO

RETURN FOR CTO FINAL MERGE GATE.
