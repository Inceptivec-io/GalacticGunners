# H015 Full Repository and Assurance Audit

Audit target: `Inceptivec-io/GalacticGunners`, PR #12, head `37f35ddddc56d98c59c1448177d3b8137e8084ed`.

## Executive verdict

H015 is not Founder-review ready. Product implementation has advanced materially, but the assurance system is not trustworthy enough to certify it. The core failure is classification: deterministic QA hooks, direct browser-state inspection, synthetic DOM events and presence checks are repeatedly represented as ordinary end-user proof. CI is green because it executes what it was told to execute; the test design does not yet prove the complete product.

Risk classification: P1 assurance and release-integrity defect. PR #12 must stay draft and unmerged.

## Scope and evidence reviewed

- 437 changed paths: 185 code/config paths, 257 governance/evidence paths.
- 19,485 additions and 614 deletions across 170 commits.
- Next.js 16 / React 19 web application, Phaser 3 game, Django 5.2 / DRF backend, PostgreSQL 17.
- CI workflow, root/workspace package scripts, TypeScript configuration, Python configuration, core scenes, Designer, authoring services, campaign services, browser scripts, unit/API tests, evidence manifest and closure attestation.
- Final CI evidence artifacts and the Founder launch observation.

## What is sound

1. TypeScript strict mode is enabled for web and game.
2. Backend uses Django/DRF with real PostgreSQL in CI.
3. Database migrations are checked and executed.
4. Server-side authoring uses immutable versions and checksums.
5. Campaign release pinning and publication services exist.
6. Authentication, tenant policy, redirect and logout tests exist.
7. Exact-SHA artifact binding and two-artifact closure attestation are now materially improved.
8. Designer and Boarding implementation are substantive rather than placeholders.
9. Unit tests cover deterministic scoring, boarding simulation, checksums and some authoring compilation.
10. CI builds Docker and performs health checks.

These strengths do not compensate for missing end-to-end assurance.

## Critical findings

### A-001 — “Normal gameplay” is manually asserted for QA-hook tests

`scripts/build-h015-evidence-manifest.mjs` sets `normal: true` for runtime, campaign, Boarding and hazards even though their routes use `?qa=hostile` and their scripts invoke `window.__GALACTIC_GUNNERS_HOSTILE__` or `window.__GALACTIC_GUNNERS_BOARDING_QA__`.

The closure auditor validates this manually authored boolean, not the actions actually performed. This allows QA-driven tests to be certified as ordinary gameplay.

Required correction: derive interaction classification from machine-recorded action events; prohibit `normal_gameplay_interaction=true` whenever the URL contains QA flags or a prohibited hook was called.

### A-002 — Campaign completion is not ordinary play

`scripts/verify-campaign-progression.mjs` calls `forceComplete()` for all six levels and `forceFail()` for Game Over. It proves routing after synthetic completion, not that Levels 1–6 can be completed by real game mechanics.

Required correction: separate state-machine tests from non-QA playability journeys. Never use forced completion as evidence of human playability.

### A-003 — The 23-surface matrix overclaims gameplay

`scripts/capture-h015-review-matrix.mjs` uses `forceComplete()` to traverse levels, captures shield tiles without destroying one, labels a Level 4 screenshot as Boarding runtime without completing Boarding in that matrix, and reports organisation isolation after authorised access rather than a hostile cross-tenant attempt.

Required correction: rename evidence honestly and add executable hostile/ordinary journeys for each claimed property.

### A-004 — Full Designer editability is not tested

`scripts/verify-h015-stage4-authoring.mjs` checks that labels exist, then changes only the deterministic seed. It does not edit, persist, reload, preview and publish every field family required by H015.

Required correction: data-driven field coverage over metadata, canvas, player spawn, entities, formations, hazards, shields, drops, objectives, Boarding anchors, gameplay and performance budgets, with valid and invalid values.

### A-005 — Designer round trip is incomplete

The roundtrip changes enemy type, formation layout and a hazard speed, but does not materially move an object, prove an already-pinned campaign remains unchanged, prove restored gameplay after rollback, or capture all required distinct states. It relies on API reads for persisted truth where product-UI verification was required.

Required correction: implement the complete 22-step Founder-authorised roundtrip without omissions.

### A-006 — Pointer tests dispatch synthetic events

`scripts/verify-h015-designer-pointer.mjs` calls `dispatchEvent('pointerdown'/'pointermove'/'pointerup')`. This bypasses browser hit-testing and does not faithfully prove real mouse, pen, touch, pointer capture, overlap or transformed-coordinate behaviour.

Required correction: use Playwright mouse/touchscreen and a browser-supported pointer input path. Synthetic event tests may remain component tests but cannot be acceptance evidence.

### A-007 — Real entry journey is untested

The public entry route is `/`; the splash script starts directly at `/play`. No test proves `/` → Play → splash → Phaser Main Menu. The phrase “frontend menu” is therefore ambiguous and the actual customer entry path is absent.

Required correction: establish product authority for splash placement, then test both direct `/play` and ordinary `/` entry.

### A-008 — Browser scripts are bespoke runners, not a governed E2E suite

The project installs Playwright as a library but does not use Playwright Test configuration, fixtures, projects, retries, traces, videos, reporters, annotations or test isolation. Each `.mjs` script launches its own browser and hand-rolls assertions.

Required correction: migrate acceptance journeys to `@playwright/test` and retain small deterministic scripts only for narrow diagnostics.

### A-009 — No frontend test suite

`apps/web` has build and typecheck only. There are no React component tests, route tests, form validation tests, accessibility tests or visual regression tests for the public site, accounts, Command Post or internal administration surface.

Required correction: add Vitest + React Testing Library for components and Playwright Test for browser journeys.

### A-010 — Game unit coverage is far too small

Only three game test files cover a game package containing approximately 29 changed source paths and two scenes exceeding 2,000 and 500 lines. Critical scene behaviour is exercised mainly through QA globals rather than unit/system seams.

Required correction: extract systems and add unit tests for scene-independent mechanics, state transitions, collisions, emitters, terminals, pause, input and Boarding.

## High findings

### A-011 — God components and god scene

- `CampaignDesigner.tsx`: approximately 2,123 lines / 87 KB.
- `Level1Scene.ts`: approximately 2,025 lines / 99 KB.

Both combine rendering, state, input, networking, QA instrumentation and domain behaviour. They are difficult to review and isolate, encouraging test-through-hidden-hook behaviour.

Required correction: decompose by bounded responsibility with explicit interfaces and tests.

### A-012 — No enforced lint or formatting gate

Ruff is declared but not run in CI. No ESLint, Prettier, import-order, dead-code or complexity gate is configured. Typechecking and builds are not coding-standard enforcement.

Required correction: Ruff check/format-check, ESLint, Prettier check and TypeScript no-unused/dead-code policy in CI.

### A-013 — No coverage measurement or thresholds

No Python or TypeScript coverage is collected. There are no line, branch, function or critical-module thresholds.

Required correction: `pytest-cov` plus Vitest/V8 coverage, with global and higher critical-path branch thresholds.

### A-014 — No mutation testing

Positive assertions can pass while conditions are ineffective. The first Founder gate exposed exactly this risk.

Required correction: mutation testing for critical validators, campaign transitions, redirect validation, evidence auditor and pure game systems.

### A-015 — Single-browser assurance

CI installs Chromium only. No Firefox, WebKit or real mobile-browser project exists. Gamepad support is asserted from normalization or QA hooks, not a browser/device contract.

Required correction: Chromium, Firefox and WebKit desktop projects; Chromium mobile/touch profiles; explicit limitation for genuine controller hardware.

### A-016 — Shared mutable test estate

The runtime-browser job executes many scripts sequentially against one database. Designer tests publish and roll back CORE content. State leakage and order dependence are possible.

Required correction: isolated database snapshot/reset per journey, unique test identities/data and post-test invariant checks.

### A-017 — Console/network error capture is inconsistent

Some scripts capture console errors, some page errors, some request failures, and some suppress selected HTTP failures. There is no shared strict fixture.

Required correction: one fail-closed browser fixture capturing console, pageerror, requestfailed, HTTP failures, unhandled rejection and download/dialog anomalies with explicit allowlists.

### A-018 — Hard-coded PASS booleans

Multiple verification JSON files write fields such as `splash_two_seconds: true` or `level_4_reached: true` after procedural execution. These values are not a durable trace of individual assertions.

Required correction: emit assertion records directly from an assertion wrapper: ID, expected, observed, result, action reference and timestamp.

### A-019 — Closure gates are too coarse

Eleven manifest gates are used to represent dozens of final closure values. Full editability, pointer accuracy, thumbnails, campaign expandability, pinned-run immutability, Boarding animation/combat, Levels 4–6 and asset-gap registration do not each have an independently required executable gate.

Required correction: one stable gate per closure value and requirement family.

### A-020 — Evidence checks uniqueness, not truthfulness

Distinct screenshot hashes prove only that bytes differ. They do not prove the named action occurred or that the screenshot shows the asserted state.

Required correction: bind screenshots to Playwright trace steps, DOM/state assertions and test IDs; use video for temporal requirements.

### A-021 — CI job names overstate their execution

`boarding-runtime` and `boarding-hostile` do not start Docker in their own jobs; their “runtime” script is not the same full browser journey executed in `runtime-browser`. Naming conceals test level.

Required correction: name jobs by actual level: unit, contract, API integration or browser E2E.

### A-022 — No requirements traceability enforcement

Requirements exist in handoffs and prose, but no machine-readable register maps requirement → implementation → positive test → negative test → CI job → evidence.

Required correction: governed traceability YAML/CSV and a validator that fails on missing or duplicate mappings.

## Medium findings

### A-023 — Comments are uneven and not a human-readable architecture

Low-level comments exist, but the largest files have insufficient module-level responsibility documentation, invariants, state diagrams and extension guidance. Some comments explain why testing shortcuts exist rather than defining production behaviour.

Required correction: module headers, public API docstrings, invariant comments and ADRs; do not comment obvious syntax.

### A-024 — CSS is monolithic

Global CSS contains public, leaderboard, Designer, Command Post and admin styling in one file, limiting ownership and regression isolation.

Required correction: route/component style modules or governed layers and visual tests.

### A-025 — No accessibility assurance

There is no automated axe coverage, keyboard-only route matrix, focus-order audit, colour-contrast gate or reduced-motion test.

Required correction: axe integration and explicit WCAG-oriented acceptance checks for web surfaces; document canvas-specific accessibility scope.

### A-026 — No performance budgets in CI

Authoring data contains performance budgets, but CI does not measure frame stability, object counts under stress, memory growth, bundle size or startup timing.

Required correction: runtime telemetry assertions and bundle/performance budget gates.

### A-027 — No dependency/security quality gate is visible

No dependency audit, secret scan, SAST or container scan is part of the quality workflow.

Required correction: add bounded security gates appropriate to the private commercial repository.

### A-028 — Test data and production-like behaviour are conflated

`FOUNDER_REVIEW_MODE=true`, generated accounts, seed commands and QA URLs are appropriate for test setup, but the suite does not include a separate production-mode build with all review/QA capabilities disabled or inaccessible.

Required correction: add a production-mode negative suite proving QA hooks and bootstrap endpoints are absent or denied.

## Framework suitability verdict

| Layer | Current | Verdict | Required |
|---|---|---|---|
| Python unit/API | pytest + pytest-django | Correct base | Add pytest-cov, factories, parametrization and markers |
| TypeScript pure logic | node:test through tsx | Usable but minimal | Vitest recommended for coverage/mocking; node:test may remain for deterministic core |
| React | None | Incorrect/incomplete | Vitest + React Testing Library |
| Browser E2E | Hand-written Playwright library scripts | Inadequate for acceptance | `@playwright/test` with fixtures/projects/traces/videos |
| Visual regression | Screenshots only | Inadequate | Playwright snapshot baselines with controlled thresholds |
| Accessibility | None | Missing | axe-core Playwright/RTL integration |
| Mutation | None | Missing | mutmut/cosmic-ray for Python and Stryker for TS critical modules |
| Coverage | None | Missing | pytest-cov and V8/Istanbul thresholds |

## Release decision

`FOUNDER_ACCEPTANCE=REJECTED`

`FOUNDER_REVIEW_READY=NO`

`MERGE_AUTHORISED=NO`

Development must first rebuild the assurance architecture, then walk every H015 requirement one by one, implementing both positive and negative proof. Founder review resumes only after an independent audit confirms that no PASS depends on a QA-only path for an ordinary-user claim.
