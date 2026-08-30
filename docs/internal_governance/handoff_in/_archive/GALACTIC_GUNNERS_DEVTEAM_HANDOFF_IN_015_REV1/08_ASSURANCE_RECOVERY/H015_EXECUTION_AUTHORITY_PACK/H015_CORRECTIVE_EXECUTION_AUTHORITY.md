# H015 Corrective Execution Authority

## Authority

Continue on the existing H015 branch and draft PR #12. Do not merge, create another PR, or request Founder testing until this authority is complete.

## Mandatory sequence

1. Freeze feature expansion and preserve current evidence as rejected history.
2. Create the machine-readable requirements traceability register.
3. Establish coding-quality gates.
4. Establish standard unit/component/API/E2E test frameworks.
5. Decompose critical god files enough to create testable seams.
6. Replace overclaiming tests and relabel retained QA diagnostics honestly.
7. Implement every positive and negative test in the traceability matrix.
8. Run isolated exact-SHA CI in production-like and QA modes.
9. Generate evidence from standard reporters and traces.
10. Run independent closure audit and return for Founder review.

## Non-negotiable execution rules

- TDD: write a failing test, record RED, implement, record GREEN, refactor, rerun.
- Every requirement has at least one positive and one negative test unless a documented technical reason is approved.
- Tests assert observable outcomes, not implementation presence.
- A route opening is not a functional pass.
- A label existing is not an editability pass.
- QA hooks may prepare deterministic state but cannot prove ordinary playability.
- Forced completion cannot prove a level is playable.
- Synthetic DOM events cannot prove real pointer behaviour.
- API reads cannot replace required product-UI verification.
- Screenshots support assertions; they do not create assertions.
- No manually authored PASS fields.

## Required repository additions

```text
docs/assurance/H015_REQUIREMENTS_TRACEABILITY.yaml
docs/assurance/H015_TEST_LEVEL_POLICY.md
docs/assurance/H015_QA_HOOK_REGISTER.yaml
docs/assurance/H015_KNOWN_LIMITATIONS.md
playwright.config.ts
tests/e2e/fixtures/strictRuntime.ts
tests/e2e/public-entry.spec.ts
tests/e2e/splash-menu.spec.ts
tests/e2e/campaign-real-play.spec.ts
tests/e2e/boarding-real-play.spec.ts
tests/e2e/designer-roundtrip.spec.ts
tests/e2e/designer-fields.spec.ts
tests/e2e/tenant-isolation.spec.ts
tests/e2e/auth-session.spec.ts
tests/e2e/production-mode-negative.spec.ts
tests/accessibility/web-surfaces.spec.ts
scripts/validate-h015-traceability.mjs
scripts/validate-qa-hook-boundaries.mjs
```

## Coding gates

- TypeScript typecheck with strict mode and unused-symbol enforcement.
- ESLint with React, hooks, accessibility, import and complexity rules.
- Prettier check.
- Ruff check and Ruff format check.
- Django checks and migration drift check.
- Unit/component/API coverage thresholds.
- Critical mutation score thresholds.
- Dependency, secret and container scanning.

## Refactoring minimum

Split `CampaignDesigner.tsx` into domain state/reducer, API client, canvas/pointer layer, palette, inspector field families, version workflow and route shell.

Split `Level1Scene.ts` into campaign controller, entity factory, formation system, hazard system, shield system, projectile/collision system, terminal controller, QA adapter and scene composition root.

QA adapters must be compiled or enabled only in explicit QA mode and must not be reachable in production mode.

## Required return

Return machine-generated totals for requirements, positive tests, negative tests, unit/component/API/E2E tests, coverage, mutation score, browsers, accessibility violations, console/network errors, QA-hook boundary violations and unresolved defects. All totals must reconcile to raw reporter artifacts.
