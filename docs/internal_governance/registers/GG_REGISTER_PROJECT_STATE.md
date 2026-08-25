# GALACTIC GUNNERS - PROJECT STATE REGISTER

| Field | Current Value |
|---|---|
| Product | Galactic Gunners |
| Institutional Arm | Inceptivec Gamification |
| Commercial Repository | `Inceptivec-io/GalacticGunners` |
| Historical Repository | `michael-leese/GallacticGunners` READ-ONLY |
| Current Programme | STEP 6 - RELEASE BRANCH ESTABLISHMENT AND MAIN-TO-PROD CUTOVER |
| Current Stage | RELEASE BRANCH CUTOVER IN EXECUTION / PENDING SAFE EXIT |
| Active Handoff | GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_009 |
| Current Feature Branch | `feature/release-branch-establishment` |
| Base Branch | `feature/production-architecture-foundation` |
| Entry/Base SHA | `5a522f7076a95ad5d0e17c3d7f79da11a7e0a6bc` |
| Branch Model | `feature/* -> dev -> stage -> prod` |
| Default Branch Target | `prod` |
| Current Feature HEAD | final pushed SHA recorded externally after final push |
| Closure State | IN EXECUTION - SAFE EXIT PROOF REQUIRED BEFORE RETURN |
| Root Execution Contract | `AGENTS.md` |
| External Boundary | `_EXTERNAL_GalacticGunners` |
| Internal Governance Root | `docs/internal_governance` |
| Living Registers | `docs/internal_governance/registers` |
| POST_BOX Closed State | boundary/readme controls only; active payload zero |
| Production Architecture Foundation | PASS - Django/DRF backend, PostgreSQL Docker topology, Next.js web shell, Phaser/TypeScript game package, contracts and CI gates reconciled |
| Backend API | PASS - `/api/v1/health/`, `/api/v1/game-runs/`, `/api/v1/game-runs/{runId}/complete/`, `/api/v1/leaderboard/` |
| Contract Authority | PASS - OpenAPI 3.1 plus JSON Schema draft 2020-12 validated by `scripts/validate-contracts.mjs` |
| Docker Full Stack | AVAILABLE - web host `3002`, backend host `8010`, db internal only |
| Handoff 008 Quality Gate | PASS - `npm run quality`; backend checks/tests; Docker smoke |
| Handoff 008 REV1 Quality Gate | PASS - backend checks/tests; contract validation; `npm run quality`; Docker smoke |
| Handoff 008 REV1 Leaderboard Invariant | PASS - stale invalid and incomplete leaderboard rows excluded at read time |
| Handoff 008 REV1 API Error Contract | PASS - stable `{ code, detail, errors }` envelope for 400/404/409 |
| Handoff 009 Release Cutover | IN EXECUTION - promote accepted foundation to dev/stage/prod and retire main after fail-closed proof |
| Runtime Gameplay | NOT PERFORMED - Step 6 branch/release authority cutover only |
| Founder Acceptance Authority | Michael Leese |
| Founder Acceptance | PENDING |
