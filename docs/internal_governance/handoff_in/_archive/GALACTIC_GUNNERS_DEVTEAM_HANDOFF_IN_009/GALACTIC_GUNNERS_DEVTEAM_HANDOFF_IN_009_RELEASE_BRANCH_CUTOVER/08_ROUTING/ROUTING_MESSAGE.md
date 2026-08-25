HANDOFF / COMMISSION:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_009

PURPOSE:
STEP 6 — RELEASE BRANCH ESTABLISHMENT AND MAIN-TO-PROD CUTOVER

ONE BOUNDED SPRINT.

REPOSITORY:
Inceptivec-io/GalacticGunners

ACCEPTED FOUNDATION:
feature/production-architecture-foundation

ACCEPTED FOUNDATION SHA:
5a522f7076a95ad5d0e17c3d7f79da11a7e0a6bc

EXECUTION BRANCH:
feature/release-branch-establishment

EXPECTED ENTRY SHA:
5a522f7076a95ad5d0e17c3d7f79da11a7e0a6bc

FOUNDER DIRECTION:

PROD REPLACES MAIN.

FINAL PERMANENT MODEL:

feature/*
   ↓
dev
   ↓
stage
   ↓
prod

prod = repository default branch
prod = production/release authority

main = DELETE after all fail-closed retirement gates pass.

============================================================
1. FIRST ACTION — NO MUTATION
============================================================

Read:
AGENTS.md
applicable branch/promotion standards
currentness/registers
Handoff 009

Fetch all refs.

Reconcile:

feature/production-architecture-foundation
feature/release-branch-establishment
dev
stage
main
prod

Record:
- exact SHA
- merge-base
- unique commit counts
- ancestry
- open PR dependencies
- branch protections/rulesets
- repository default branch

NO SHARED-BRANCH MUTATION before evidence exists.

============================================================
2. CTO ENTRY PRECHECK
============================================================

FOUNDATION:

feature/production-architecture-foundation
5a522f7076a95ad5d0e17c3d7f79da11a7e0a6bc

DEV:

5b91bed73ce8846ec577575dab10de1527084820

Observed:
foundation ahead = 14
foundation behind = 0
merge-base = dev HEAD

STAGE:

5b91bed73ce8846ec577575dab10de1527084820

PROD:

DOES NOT EXIST

MAIN:

87923524833b737c7e3bf1764dde0b6ebf495e62

Observed:
foundation ahead = 35
foundation behind = 0
merge-base = main HEAD

DEFAULT BRANCH:

main

If current state differs materially:

STOP — BRANCH_STATE_MISMATCH

Do not overwrite unknown work.

============================================================
3. RECONCILE ACTIVE BRANCH AUTHORITY
============================================================

On:

feature/release-branch-establishment

refine EXISTING:

.github/workflows/quality.yml
README.md
AGENTS.md
branch/promotion standards
guides
registers
currentness

Permanent authority:

feature/* -> dev -> stage -> prod

Do not fork branch standards.

Remove active assumptions that `main` remains permanent.

Do not alter historical evidence merely because it mentions main historically.

============================================================
4. PROMOTE TO DEV
============================================================

Promote the accepted foundation plus Step 6 branch-model reconciliation into:

dev

Required:

ACCEPTED_FOUNDATION_CONTAINED_IN_DEV = PASS

No force push.
No history rewrite.
No destructive reset.

Use governed PR/merge/fast-forward mechanics appropriate to repository policy.

============================================================
5. PROMOTE DEV TO STAGE
============================================================

Promote the exact accepted dev state into:

stage

Required:

DEV_STATE_CONTAINED_IN_STAGE = PASS
STAGE_UNIQUE_APPLICATION_WORK = 0

No direct independent stage development.

============================================================
6. CREATE / PROMOTE PROD
============================================================

prod does not exist at entry.

Create prod ONLY from accepted stage lineage.

Required:

STAGE_STATE_CONTAINED_IN_PROD = PASS

prod becomes:

PRODUCTION / RELEASE AUTHORITY

IMPORTANT:

prod exists
!=
v1.0 commercially released

Do not tag v1.0.
Do not deploy commercial production in this handoff.

============================================================
7. CHANGE DEFAULT BRANCH
============================================================

Change GitHub repository default branch:

main
→
prod

Then independently verify:

DEFAULT_BRANCH = prod

Do not continue to main deletion if the default branch remains main.

============================================================
8. MAIN RETIREMENT / DELETION
============================================================

Before deletion prove:

MAIN_UNIQUE_COMMITS_OUTSIDE_PROD_LINEAGE = 0
MAIN_HISTORY_CONTAINED_IN_PROD = PASS
MAIN_OPEN_PR_DEPENDENCY = 0 or safely retargeted
MAIN_ACTIVE_CI_REFERENCE = 0
MAIN_ACTIVE_DEPLOYMENT_REFERENCE = 0
MAIN_ACTIVE_DOCUMENTATION_AUTHORITY = 0
DEFAULT_BRANCH = prod
PROD_HEALTH = PASS

Record recovery coordinate:

87923524833b737c7e3bf1764dde0b6ebf495e62

Then:

DELETE REMOTE main

Do not recreate a placeholder main.

Verify:

REMOTE main = ABSENT
DEFAULT BRANCH = prod
dev resolves
stage resolves
prod resolves

============================================================
9. CI / QUALITY
============================================================

CI active branch model must use:

dev
stage
prod

Remove active main trigger after cutover.

Do not weaken existing quality gates.

Required final proof:

npm ci PASS
npm run quality PASS
backend check PASS
makemigrations --check PASS
pytest PASS
docker compose config PASS
docker smoke PASS

GitHub Actions:
backend SUCCESS
client-and-game SUCCESS
docker-smoke SUCCESS

============================================================
10. MAIN REFERENCE AUDIT
============================================================

Search active/current repository material for:

main
master

Classify occurrences.

Historical/evidence references may remain when genuinely historical.

Active branch authority reference to main:

0

Current documentation must state:

DEFAULT BRANCH = prod
DEVELOPMENT = dev
RELEASE CANDIDATE = stage
PRODUCTION AUTHORITY = prod
main = RETIRED / DELETED

============================================================
11. DO NOT DO
============================================================

DO NOT:

- start v1.0 gameplay;
- port legacy gameplay;
- integrate assets into gameplay;
- mutate Legacy_Game;
- tag v1.0;
- claim commercial release;
- deploy prod without separate deployment authority;
- force push;
- rewrite history;
- retain a dummy main branch.

============================================================
12. EXIT GATE
============================================================

DEV_EXISTS = PASS
STAGE_EXISTS = PASS
PROD_EXISTS = PASS
MAIN_EXISTS = NO

DEFAULT_BRANCH = prod

ACCEPTED_FOUNDATION_CONTAINED_IN_DEV = PASS
DEV_STATE_CONTAINED_IN_STAGE = PASS
STAGE_STATE_CONTAINED_IN_PROD = PASS

UNEXPLAINED_DIVERGENCE = 0
FORCE_PUSH_USED = NO
HISTORY_REWRITE_USED = NO

ACTIVE_MAIN_AUTHORITY_REFERENCES = 0

CI = PASS
DOCKER = PASS
BACKEND = PASS
CLIENT_GAME = PASS

LEGACY_GAME_MUTATED = NO
ASSET_RUNTIME_INTEGRATION = NO
V1_GAMEPLAY_STARTED = NO
GOVERNANCE_DEBT_COUNT = 0

============================================================
13. RETURN
============================================================

Return:

GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_009

Include:

- entry/final feature SHAs;
- starting branch matrix;
- ancestry/unique-commit evidence;
- exact promotion operations;
- PR numbers/URLs if used;
- final dev SHA;
- final stage SHA;
- final prod SHA;
- old main recovery SHA;
- default branch proof;
- main deletion proof;
- main-reference audit;
- protection/ruleset findings;
- CI trigger reconciliation;
- all quality results;
- GitHub Actions;
- force-push count;
- unexplained divergence count;
- Legacy_Game mutation audit;
- asset integration audit;
- v1.0 gameplay audit;
- governance debt count;
- local == remote;
- clean worktree;
- POST_BOX state;
- sealed SHA-256.

FINAL REQUIRED STATE:

feature/* -> dev -> stage -> prod

prod = DEFAULT BRANCH

main = DELETED

v1.0 gameplay = NOT STARTED

RETURN FOR CTO / FOUNDER REVIEW.
