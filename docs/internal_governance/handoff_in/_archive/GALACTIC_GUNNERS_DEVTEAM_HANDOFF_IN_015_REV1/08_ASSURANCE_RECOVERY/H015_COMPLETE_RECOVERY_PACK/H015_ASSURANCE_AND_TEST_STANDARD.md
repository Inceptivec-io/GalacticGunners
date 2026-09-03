# H015 Assurance and Test Standard

## Test pyramid and permitted proof

### Unit

Pure functions, reducers, validators, checksums, state machines, scoring, resources, input normalization, collision decisions and publication rules. Fast and exhaustive, including boundary and invalid values.

### Component

React controls, field validation, disabled states, focus, keyboard behaviour, error display and API interaction using accessible queries. Phaser systems should be extracted from scenes where possible.

### API integration

Real Django ORM and PostgreSQL. Permissions, ownership, concurrency, immutable versions, publication, rollback, pinning, validation, CSRF and hostile payloads.

### Browser E2E

Only observable product journeys. Use real clicks, keyboard, mouse and touchscreen. QA hooks are prohibited in ordinary-user specifications. A separate `qa-diagnostic` project may use them and must be labelled accordingly.

## Required Playwright projects

- chromium-desktop
- firefox-desktop
- webkit-desktop
- chromium-mobile-touch
- chromium-tablet-touch
- qa-diagnostic-chromium

## Strict browser fixture

Every test fails on unexpected `console.error`, `pageerror`, unhandled rejection, request failure or HTTP 4xx/5xx. All exceptions require a test-local reason and expected response assertion. Capture trace on first retry, video on failure and screenshot only at meaningful checkpoints.

## Isolation

Each test receives unique users, organisation, campaign and level IDs. Database state is reset from a known snapshot or transactionally isolated. Tests that publish CORE content must restore it and verify the baseline in teardown. Test order must be randomized periodically.

## Coverage thresholds

- Global statements/lines: 85% minimum.
- Global branches: 80% minimum.
- Critical validators, campaign transitions, redirect validation, evidence auditor: 95% statements and 90% branches.
- No changed critical file may reduce coverage.

Coverage is a floor, not acceptance.

## Mutation thresholds

- Evidence auditor and redirect validator: 95% mutation score.
- Campaign/publication and immutable-version services: 90%.
- Pure game systems: 85%.

Surviving critical mutants block review.

## Positive/negative pairing

Examples:

| Requirement | Positive | Negative |
|---|---|---|
| Splash | Fresh `/play` shows exact two-second splash | QA-disabled production route cannot skip; internal navigation cannot replay |
| Pause | Simulation freezes and resumes same state | Inputs cannot mutate world while paused; opaque overlay prohibited |
| Redirect | Same-origin path accepted | Protocol-relative, encoded, backslash, script and foreign-origin rejected |
| Designer save | Valid field family persists | Invalid bounds/type/ownership/stale version rejected server-side |
| Publication | Valid ordered release publishes | Gap, duplicate sequence, draft reference, unauthorised actor rejected |
| Boarding | Physical entry/combat/exit returns checkpoint | Premature exit, duplicate completion, stale position, API failure rejected safely |
| Tenant map | Owner creates/edits own map | Other tenant cannot read, modify, preview, publish or archive |

## Test naming

`REQ-ID__level__positive|negative__observable-outcome`.

Every test includes requirement IDs as metadata. CI rejects unregistered tests and requirements without both polarities.
