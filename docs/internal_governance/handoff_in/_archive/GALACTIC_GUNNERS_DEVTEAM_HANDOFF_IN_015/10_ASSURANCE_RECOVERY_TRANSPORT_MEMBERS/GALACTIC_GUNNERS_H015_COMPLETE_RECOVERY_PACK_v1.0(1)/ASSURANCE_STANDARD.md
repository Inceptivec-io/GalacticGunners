# H015 Assurance and Test Standard

## Test taxonomy

Every executable test carries exactly one primary classification: `UNIT`, `COMPONENT`, `API`, `INTEGRATION`, `E2E_ORDINARY_USER`, or `QA_DIAGNOSTIC`. Diagnostic tests cannot satisfy ordinary-user catalogue rows.

## TDD contract

For each unproven row: establish the intended positive and negative assertions; demonstrate RED for the intended reason; implement the smallest correction; demonstrate GREEN; refactor; run adjacent regressions; update traceability. A test that never failed must record why it is a regression characterization test and must still be fault-injected before closure.

## Required suites

- Backend unit/API: Django business rules, validation, permissions, immutability, publication and rollback.
- Frontend unit/component: React state, accessibility, redirect validation, Designer controls and error handling.
- Game unit/integration: Phaser-independent rules plus scene state machines behind explicit seams.
- Contract tests: version/checksum schemas and frontend/backend error semantics.
- Browser E2E: runner-native Playwright tests using fixtures, isolated accounts/data, traces on failure and real inputs.
- Diagnostics: separately named QA utilities that never contribute to ordinary acceptance totals.

## Positive and negative proof

Every applicable row must prove intended success and at least one meaningful rejection/failure path. Negative tests must assert the user-visible and server-side consequence, not merely a status code or thrown exception.

## Isolation

Tests create uniquely identified data or reset deterministic fixtures. They must not depend on execution order, a previous browser session, a shared active campaign or an earlier test's publication.

## Browser rules

- Use real navigation from the named entry route.
- Use keyboard/mouse/touch/controller mechanisms supported by the product.
- Do not call hidden scene methods or mutate stores to reach the asserted state.
- Collect console errors, failed requests, traces and purpose-specific screenshots/video.
- Assert content, focus, state transition, persistence and backend result.
- Run Chromium and at least one additional governed engine; exercise touch emulation where required.

## Evidence identity

All manifests use `GG_TESTED_SHA`, which must be a full 40-character commit and equal CI head. Each evidence item records path, MIME type and SHA-256. Artifact identity and closure attestation are generated after the tested commit exists.

## Effectiveness

Closure must demonstrate that removal/inversion of a critical assertion or controlled defect in each high-risk domain causes the relevant gate to fail. Mutation tooling may be scoped, but the selected mutations and results must be retained.

## Accessibility and security

Keyboard focus, visible focus, accessible names and supported navigation are automated. Security tests cover anonymous, wrong-role, cross-owner, CSRF and hostile redirect paths.

## No manual closure

Human review may add findings. It cannot convert absent executable proof into PASS. Final summaries are derived from the traceability register and artifacts.
