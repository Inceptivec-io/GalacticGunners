HANDOFF / COMMISSION:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010

PROGRAMME:
v1.0 BUILD — SPRINT 001

PURPOSE:
BOOT → MAIN MENU → LEVEL 1 PLAYABLE COMBAT VERTICAL SLICE

REPOSITORY:
Inceptivec-io/GalacticGunners

BASE:
dev

VERIFIED BASE SHA:
051c7fc9170ae73344a0dc88214c48fc94e0bfdc

EXECUTION BRANCH:
feature/v1-level1-vertical-slice

EXPECTED ENTRY SHA:
051c7fc9170ae73344a0dc88214c48fc94e0bfdc

FIRST:
Read AGENTS.md, Roadmap v1.1, Playlist v1.1, canonical asset/IP authorities and Legacy_Game README.

Verify branch/head/worktree/POST_BOX.

If source state differs:
STOP — SOURCE_STATE_MISMATCH.

DOCTRINE:
EXTRACT → TYPE → TEST → PRESERVE BEHAVIOUR

TARGET:
HOME → PLAY → PHASER MAIN MENU → START → PLAYABLE LEVEL 1 COMBAT SLICE

REQUIRED:
BootScene
MainMenuScene
Level1Scene
Player
Scout
projectiles
ScoreSystem
LifeSystem
InputSystem
AudioSystem
GameSession
Next.js GameHost
existing GameRun API boundary
canonical root assets

SCORING:
SCOUT DESTROYED = +25
PLAYER DAMAGE SCORE PENALTY = 0
MIN SCORE = 0

LEGACY_GAME:
READ-ONLY behavioural evidence.
Runtime imports = 0.
Runtime legacy assets = 0.
Mutation = NO.

ASSETS:
Resolve exact Asset IDs/paths/hashes/rights from canonical registers.
Only active production-cleared records.
Use one deterministic runtime delivery mechanism.
Asset byte mutations = 0.

INPUT:
left/right/fire/confirm/back
keyboard + pointer/touch + gamepad normalization
NO manual touch-mode selector.

GAME RUN:
attempt existing POST /api/v1/game-runs/ on slice start.
Backend unavailable must NOT block gameplay.
No fabricated run ID offline.
Complete online run once.
victory=false for this development Level 1 slice.
Replay creates new session/run.

TEMPORARY TERMINAL STATES:
SLICE COMPLETE → Replay Slice / Main Menu
SLICE FAILED → Retry Slice / Main Menu

These are NOT final Victory/GameOver.

DO NOT:
Level 2
Boss
final Game Over
final Victory
Boarding
auth UI
leaderboard UI
native packaging
production deploy
v1.0 tag/release
direct dev/stage/prod work
merge

QUALITY:
npm ci PASS
npm run quality PASS
backend checks/tests PASS
docker build/smoke PASS
/play Phaser runtime PASS
GitHub backend/client-and-game/docker-smoke SUCCESS
GOVERNANCE_DEBT_COUNT = 0

PR:
HEAD feature/v1-level1-vertical-slice
BASE dev
TITLE Build Galactic Gunners v1.0 Level 1 playable vertical slice
OPEN / DRAFT / NOT MERGED

RETURN:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_010

Return exact legacy behaviour matrix, canonical asset mapping, test results, Docker/manual test URLs, GitHub Actions, governance currentness, clean worktree, POST_BOX state and sealed SHA-256.

DO NOT MERGE.
RETURN FOR CTO / FOUNDER REVIEW.
