# GALACTIC GUNNERS PROGRAMME COMPLETION AUTHORITY v1.0

**Purpose:** eliminate Development inference for the remaining planned programme after H012 closes.

**Maximum construction sprints after H012:** 5.

The current Roadmap v1.2 strategic tail is authoritative:

```text
SERVER-VALIDATED GAME RUNS
→ GLOBAL LEADERBOARD
→ BOARDING MODE
→ NATIVE CLIENTS
→ COMMERCIAL RELEASE
```

This authority compresses that tail into five bounded construction PRs while preserving the Roadmap sequence.

## Five construction PRs

1. **GG-H013 — Server-Validated Runs + Global Leaderboard**
2. **GG-H014 — Boarding Mode Complete Vertical Product Slice**
3. **GG-H015 — Native Clients + Cross-Client Runtime Contract**
4. **GG-H016 — Commercial Release Platform + Production Operations**
5. **GG-H017 — Final Regression / UI-UX / Accessibility / Release Candidate / Prod Promotion**

No sixth construction sprint is planned for v1.0 unless Founder/CTO explicitly authorises scope expansion.

## Preconstruction rule

Before Development starts any one of the five PRs, the repository must already contain:

- exact domain models;
- exact API request/response contracts;
- client/runtime interfaces;
- UI state flows and route definitions;
- security/RBAC rules;
- environment contract;
- asset requirements and filenames where known;
- scoring/life/nuke/campaign carry rules;
- persistence semantics;
- offline/degraded semantics;
- telemetry/audit requirements;
- hostile test matrix;
- performance budgets;
- acceptance gate;
- return evidence requirements;
- promotion target.

Development may refine implementation details only inside these contracts. Development does not invent product behavior, authority boundaries, data ownership, scoring, progression, security, release policy, or player-facing flows.

## Shared execution doctrine

```text
FETCH
→ RECONCILE BENIGN DRIFT
→ EXECUTE CURRENT AUTHORITY
→ TEST
→ COMMIT/PUSH
→ OPEN DRAFT PR
→ CTO GATE
→ FOUNDER GATE
→ MERGE
→ PROMOTE WHEN AUTHORISED
```

Routine local-behind-remote state and ordinary POST_BOX ingestion are not STOP conditions.

STOP only for:
- unexplained dirty worktree;
- non-fast-forward divergence;
- conflicting current authority;
- failed security/test gate;
- destructive/data-loss uncertainty;
- genuinely unresolvable product/specification contradiction.

## Definition of v1.0 programme complete

The programme is complete only when:

```text
SIX-LEVEL CAMPAIGN = ACCEPTED
SERVER-VALIDATED RUNS = PASS
GLOBAL LEADERBOARD = PASS
BOARDING MODE = PASS
WEB CLIENT = PASS
WINDOWS DESKTOP CLIENT = PASS
ANDROID CLIENT = PASS
iOS/iPadOS CLIENT = PASS OR DOCUMENTED STORE-BLOCKED BUILD READY
COMMERCIAL DEPLOYMENT = PASS
OBSERVABILITY/BACKUP/ROLLBACK = PASS
PLAYER GUIDE = CURRENT
ADMIN GUIDE = CURRENT
DEVELOPER GUIDE = CURRENT
REGRESSION GUIDE = CURRENT
UI/UX SNAG REGISTER = 0 RELEASE-BLOCKING ITEMS
ACCESSIBILITY GATE = PASS
SECURITY GATE = PASS
PERFORMANCE GATE = PASS
STAGE ACCEPTANCE = PASS
PROD PROMOTION = PASS
RELEASE TAG/NOTES = PASS
GOVERNANCE_DEBT_COUNT = 0
```
