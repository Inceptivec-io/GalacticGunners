HANDOFF / COMMISSION:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_006

PURPOSE:
STEP 3 — LEGACY GAME CONTAINMENT FOR FOUNDER PR REVIEW

REPOSITORY:
Inceptivec-io/GalacticGunners

LEGACY SOURCE AUTHORITY:
feature/GG-COM-001

LEGACY SOURCE HEAD:
6cda67a3c539ae85d769a571eb4f5299ed9bc4e6

ACCEPTED v0.1 BEHAVIOURAL COORDINATE:
1539395a6e2eb3a8a0a571692c5425122ae0b82e

PRODUCTION ARCHITECTURE BASE:
feature/production-architecture-foundation

EXPECTED BASE HEAD:
039aa132a4166cc257edb6be3f3e49a01aecdfe3

EXECUTION / REVIEW BRANCH:
feature/legacy-game-containment

EXPECTED ENTRY HEAD:
1579a03aa38aa9242107d808636a1582b4373b9d

FIRST:
- read root AGENTS.md;
- fetch all refs;
- verify all branch/SHA coordinates;
- verify worktree state;
- do not reset unknown work.

SOURCE AUTHORITY:
The source authority for Legacy_Game is `feature/GG-COM-001 @ 6cda67...`.

NOT:
- an external ZIP;
- main;
- dev;
- old provisional Legacy_Game;
- the Step 4 asset/IP estate.

REQUIRED RESULT:
The complete closed legacy branch estate must exist beneath `Legacy_Game/` as one contained legacy implementation.

Do not cherry-pick selected files.
Do not modernise it.
Do not fix it.
Do not migrate it.
Do not make production runtime depend on it.

LEGACY README:
Replace the inherited active-product README inside `Legacy_Game/` with a containment/provenance README identifying:
- commercial legacy source;
- closure SHA;
- accepted behavioural SHA;
- historical educational provenance repo;
- containment purpose;
- reference-only authority;
- migration rule;
- known accepted legacy limitations;
- retirement condition;
- Step 4 asset/IP pointer.

STEP 4 ASSETS:
OUT OF SCOPE.
Do not ingest, inspect, move, rename or register the separate external asset/IP package.

RECONCILIATION:
Create machine-readable source-vs-contained inventory.
Unexplained missing source file = FAIL.

ISOLATION:
PRODUCTION_IMPORTS_FROM_LEGACY_GAME = 0
PRODUCTION_RUNTIME_DEPENDENCIES_ON_LEGACY_GAME = 0

PR:
Open exactly one PR:

HEAD:
feature/legacy-game-containment

BASE:
feature/production-architecture-foundation

TITLE:
Contain accepted Galactic Gunners v0.1 legacy estate under Legacy_Game

Leave OPEN / DRAFT / NOT MERGED.

FOUNDER REVIEWS AND MERGES.

BRANCH DISPOSITION:
Do not merge feature/GG-COM-001 directly anywhere.
Do not delete feature/GG-COM-001.
Do not delete feature/legacy-game-containment before Founder merge.

RETURN:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_006

Include exact SHAs, reconciliation proof, isolation proof, scope proof, PR number/URL/state, local==remote, clean worktree, POST_BOX state, sealed SHA-256.

DO NOT MERGE.
DO NOT START STEP 4.
FOUNDER ACCEPTANCE REMAINS PENDING.
