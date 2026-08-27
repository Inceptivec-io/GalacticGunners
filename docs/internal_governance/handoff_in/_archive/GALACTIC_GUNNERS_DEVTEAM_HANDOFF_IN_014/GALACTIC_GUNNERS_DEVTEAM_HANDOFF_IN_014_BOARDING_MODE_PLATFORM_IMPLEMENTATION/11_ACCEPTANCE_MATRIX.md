# Acceptance matrix

| ID | Acceptance condition | Required evidence |
|---|---|---|
| A01 | All entry gates pass from accepted `origin/dev` | fetch/base/ancestry/clean logs |
| A02 | Imagery outer and 129-file inner inventories match | hash and inventory reports |
| A03 | Transport ZIP absent from git; admitted files registered | git/object search and register diff |
| A04 | Character derivatives have true alpha, exact metadata, no checker/halo | automated report and contact sheet |
| A05 | Shared schemas/OpenAPI/fixtures validate with no drift | CI contract check |
| A06 | Level 1–6 remain valid; Level 4 has the one exact anchor | validation report |
| A07 | Published `alien-frigate` v1 is immutable/checksummed/reachable | migration and graph tests |
| A08 | Designated scout disables once and awards exactly 25 once | game-core/runtime assertions |
| A09 | Offer/envelope/confirm/expiry and pause timing are exact | fake-clock tests and screenshots |
| A10 | Shooter snapshot restores exactly except allowed return delta/removal | digest round-trip report |
| A11 | Success journey applies only earned capped life/nuke delta and zero score | browser/API/test evidence |
| A12 | Timeout loses exactly one life and resumes or game-overs | browser/API/test evidence |
| A13 | Player damage, respawn, invulnerability, zero-life death are exact | deterministic tests |
| A14 | Containers/drops/enemies replay deterministically in TS and Python | golden vector/replay report |
| A15 | Keyboard, gamepad, touch, focus reset, and reduced motion work | automated/manual evidence |
| A16 | Auth ownership and anonymous capability boundaries deny cross-run access | backend hostile results |
| A17 | Completion is transactional, concurrent-safe, and idempotent | database concurrency tests |
| A18 | All listed hostile payloads fail with stable codes and no mutation | hostile report |
| A19 | Offline/transient failures cannot create validated leaderboard entries | runtime and backend tests |
| A20 | Existing shooter, score, leaderboard, moderation, Levels 1–6 regressions are green | full quality/CI results |
| A21 | Docker stack is healthy and seeded from clean state | build/start/health logs |
| A22 | Real browser has no required network/console/asset failures | browser logs/screenshots |
| A23 | Draft PR targets `dev`, is unmerged, checks green, local/remote reconcile | PR/CI/git proof |
| A24 | Current evidence, registers, clean worktree, sealed Handoff OUT exist | evidence tree and return hash |

Every row must pass. There is no percentage completion or conditional pass.
