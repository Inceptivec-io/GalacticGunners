# GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_008_REV1

Handoff In: `GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_008_REV1`

Target: PR `#3`

Branch: `feature/architecture-hardening-reconciliation`

Base: `feature/production-architecture-foundation`

REV1 entry HEAD: `4947cbfe90dccbc714e26f18e982b83b7d0aecb6`

Founder acceptance and merge authority: Founder Michael only.

## Closure Recommendation

PASS - pending CTO / Founder review.

## Defect Corrections

1. Leaderboard read invariant:
   `backend/leaderboard/views.py` now independently filters `LeaderboardEntry` rows by linked `GameRun` publication invariant: `validity=valid` and `completed_at IS NOT NULL`. Stale pending, rejected or incomplete linked runs are excluded even if a stale leaderboard row exists.

2. API error contract alignment:
   The API now uses one stable error envelope:

```json
{
  "code": "invalid_request",
  "detail": "Request validation failed.",
  "errors": {
    "field_name": ["message"]
  }
}
```

Stable codes verified in REV1: `invalid_request`, `not_found`, `conflict`.

## OpenAPI / Contract Changes

- `ErrorResponse` now requires `code`, `detail` and `errors`.
- `ErrorResponse.additionalProperties` is `false`.
- Shared `BadRequest`, `NotFound` and `Conflict` response components all reference `ErrorResponse`.
- `scripts/validate-contracts.mjs` now asserts the error model, response refs and leaderboard response authority.

## Verification Summary

| Check | Result |
|---|---|
| Backend check | PASS |
| Backend migrations check | PASS |
| Backend tests | PASS - 11 passed |
| Contract validation | PASS |
| `npm run quality` | PASS |
| Docker config/build/smoke | PASS |
| Leaderboard stale invalid entry excluded | PASS |
| Leaderboard incomplete entry excluded | PASS |
| Valid leaderboard entry returned | PASS |
| Invalid payload error envelope | PASS |
| Not found error envelope | PASS |
| Conflict error envelope | PASS |
| Legacy_Game mutation | NO |
| Asset runtime integration | NO |
| Governance debt count | 0 |

## Evidence Locations

- `docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_008_REV1/`
- `docs/internal_governance/handoff_out/_archive/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_008_REV1/04_SEALED_RETURN/`

## Git / CI Proof

Final pushed SHA, local/remote equality, clean worktree proof, PR state and GitHub Actions run results are recorded externally after final push to avoid a self-referential SHA loop in this committed file.
