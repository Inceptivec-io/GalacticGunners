# GALACTIC GUNNERS DEVTEAM HANDOFF IN 013
## Server-Validated GameRuns, Global Leaderboard, Anti-Cheat, Ranking & Moderation

Repository:
`Inceptivec-io/GalacticGunners`

Programme position:
H013 follows accepted/merged H012.

Target:
one bounded construction sprint from accepted H012 `dev` through one Draft PR return.

## Entry

Development must:

```text
git fetch origin
git switch dev
git pull --ff-only origin dev
```

Record the resulting accepted `dev` HEAD as:

`H013_ENTRY_SHA`

Create:

`feature/v1-validated-runs-global-leaderboard`

from that exact accepted `dev` state.

Routine local-behind-remote state is synchronization, not a STOP condition.

STOP only for:
- unexplained dirty worktree;
- non-fast-forward divergence;
- conflicting current authority;
- failed required security/test gate;
- destructive/data-loss uncertainty;
- genuine specification contradiction.

## Sprint outcome

This sprint must deliver:

1. authoritative server-side GameRun lifecycle;
2. event-summary submission contract;
3. deterministic score validation against exact game/level/version/checksum/seed;
4. anti-trivial-cheat validation;
5. validated ScoreSubmission authority;
6. immutable accepted score records;
7. global leaderboard;
8. deterministic ranking/tie rules;
9. player display-name policy;
10. moderation/suppression tools;
11. leaderboard admin APIs;
12. player-facing leaderboard UI;
13. degraded/offline handling;
14. hostile abuse/security tests;
15. Docker + CI;
16. one Draft PR;
17. H014 Boarding-readiness evidence.

## Non-scope

Do not implement:
- Boarding runtime;
- Boarding interiors;
- native packaging;
- payments/store;
- production deployment;
- seasonal leaderboard unless explicitly needed by this contract;
- social/chat;
- arbitrary public user profiles.

Do not merge.
