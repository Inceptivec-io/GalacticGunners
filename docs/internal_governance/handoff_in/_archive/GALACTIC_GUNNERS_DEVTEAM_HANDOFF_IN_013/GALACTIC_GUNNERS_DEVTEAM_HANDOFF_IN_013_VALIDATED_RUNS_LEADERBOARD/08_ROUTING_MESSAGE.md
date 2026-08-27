HANDOFF:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_013

BOUNDED SPRINT:
SERVER-VALIDATED GAMERUNS + GLOBAL LEADERBOARD + ANTI-CHEAT + RANKING + MODERATION

START ONLY FROM ACCEPTED / MERGED H012 dev.

============================================================
START
============================================================

git fetch origin
git switch dev
git pull --ff-only origin dev

RECORD:

H013_ENTRY_SHA = current accepted dev HEAD

CREATE:

feature/v1-validated-runs-global-leaderboard

from accepted dev.

ROUTINE LOCAL-BEHIND-REMOTE:
RECONCILE AND CONTINUE.

============================================================
GATE A — SERVER GAMERUN AUTHORITY
============================================================

Implement:

GameRun authoritative lifecycle

exact:
game_version
level_id
level_version
level_checksum
seed

event-summary submission

server score reconstruction

locked global scoring

version/checksum/seed validation

impossible event rejection

duration plausibility

nuke/life state validation

campaign sequence validation

duplicate submission protection

rate limiting

machine-readable rejection codes

ScoreSubmission authority

COMMIT / PUSH

RECORD:

H013_GATE_A_SHA

CONTINUE.

============================================================
GATE B — GLOBAL LEADERBOARD
============================================================

Implement:

LeaderboardEntry

best visible validated run per player

display-name profile/policy

global all-time leaderboard

ranking order:

1 score DESC
2 campaign level reached DESC
3 accepted_at ASC
4 GameRun UUID ASC

public APIs

player best/rank API

minimum public personal data only

COMMIT / PUSH

RECORD:

H013_GATE_B_SHA

CONTINUE.

============================================================
GATE C — MODERATION
============================================================

Implement Django permission:

can_moderate_leaderboard
or semantic equivalent.

Implement:

entry suppress
entry restore
player suppress
player restore
display-name moderation
rejected-run inspection
validation-detail inspection
audit

NO MANUAL SCORE EDIT.

Admin UI under:

/inceptivec-gamification-admin/leaderboard

anonymous = DENIED
normal player = DENIED
authorized moderator/admin = PASS

COMMIT / PUSH

RECORD:

H013_GATE_C_SHA

CONTINUE.

============================================================
GATE D — PLAYER UI
============================================================

Build branded:

/leaderboard

Show:

rank
display name
validated score
campaign level reached
victory
player highlight
own rank/best score

After run:
show server validation/rank result.

Never claim client score is globally accepted before server validation.

Backend unavailable:
game remains playable
leaderboard degrades cleanly.

COMMIT / PUSH

RECORD:

H013_GATE_D_SHA

CONTINUE.

============================================================
GATE E — HOSTILE / DOCKER / CI
============================================================

Run:

backend
client-and-game
docker-smoke
runtime-hostile
score-validation-hostile
leaderboard-hostile
moderation-hostile

Prove:

wrong version rejected
wrong checksum rejected
score mismatch rejected
impossible kills rejected
impossible nukes rejected
duplicate rejected
ranking deterministic
suppressed entries absent
privacy leakage = 0
admin RBAC pass

Docker full stack PASS.

CI GREEN.

GOVERNANCE_DEBT_COUNT = 0.

============================================================
H014 READINESS
============================================================

Create:

docs/internal_governance/readiness/H014_BOARDING_READINESS.md

Confirm:

BOARDING ARCHITECTURE CONFLICTS = 0
DATA MODEL BLOCKERS = 0
API BLOCKERS = 0
SCORE POLICY BLOCKERS = 0

Boarding-specific score additions remain 0 for v1.

Life/nuke pickups integrate with existing state.

Future BoardingRun can relate to GameRun cleanly.

============================================================
PR
============================================================

HEAD:

feature/v1-validated-runs-global-leaderboard

BASE:

dev

TITLE:

Build Galactic Gunners validated runs and global leaderboard

STATE:

OPEN / DRAFT / NOT MERGED

============================================================
RETURN
============================================================

RETURN:

GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_013

Include:

H013_ENTRY_SHA
H013_GATE_A_SHA
H013_GATE_B_SHA
H013_GATE_C_SHA
H013_GATE_D_SHA
H013_FINAL_SHA

models
migrations
API/OpenAPI
score validation
anti-cheat rejection evidence
ranking fixtures
moderation/RBAC
privacy tests
leaderboard UI
Docker
CI
PR
H014 readiness
local == remote
clean worktree
POST_BOX boundary-only
governance debt = 0

DO NOT MERGE.

START AND CONTINUE THROUGH PR COMPLETION.
