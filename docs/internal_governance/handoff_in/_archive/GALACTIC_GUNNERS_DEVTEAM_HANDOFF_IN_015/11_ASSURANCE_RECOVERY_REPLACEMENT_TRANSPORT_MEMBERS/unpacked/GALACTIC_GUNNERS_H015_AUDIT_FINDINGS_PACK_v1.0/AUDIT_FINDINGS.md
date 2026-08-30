# H015 Independent Assurance Audit Findings

## Decision

The prior `FOUNDER_REVIEW_READY=YES` claim is rejected. The Founder observed the Main Menu immediately when the expected splash should have appeared. That first-screen discrepancy establishes that the previous evidence system did not prove the customer-visible journey it claimed.

H015 remains in progress on PR #12. No merge or Founder review is authorised.

## Confirmed systemic findings

1. Browser automation began at `/play` while Founder instruction led through `/`; the full `/ → Play → splash → Phaser Main Menu` journey was absent.
2. Bespoke Playwright scripts were used where maintainable runner-native suites, fixtures, projects, retries, traces and assertions were required.
3. Hidden QA hooks such as forced completion/failure were represented as normal-play evidence.
4. Designer claims relied on label presence, narrow state manipulation or synthetic events instead of complete editing, persistence and real pointer behaviour.
5. Duplicate screenshots and generic observations were permitted to satisfy distinct gates.
6. Closure values could be manually asserted without a one-to-one executable requirement trace.
7. React component behaviour lacked an adequate dedicated test layer.
8. Gameplay tests were too few for the size and risk of Phaser scene logic.
9. Shared mutable test state weakened independence and reproducibility.
10. CI omitted sufficient cross-browser, accessibility, coverage, mutation/effectiveness and security-negative enforcement.
11. Large files and mixed responsibilities reduced testability and obscured invariants.
12. Green CI therefore proved command success, not full product correctness.

## Root cause

The project measured the existence of implementations and scripts more readily than externally observable behaviour. Closure gates were coarser than the requirements and allowed diagnostic shortcuts to substitute for ordinary use.

## Required correction

The catalogue in `REQUIREMENT_CATALOGUE.csv` is the denominator. Every row needs implementation mapping, a positive assertion, an applicable negative or hostile assertion, the correct test layer, and independently addressable evidence. No manually entered PASS may override a failing or absent assertion.

## Code-quality direction

- Extract cohesive units only where doing so creates clear test seams or removes duplicated authority.
- Use explicit typed contracts at frontend/backend/runtime boundaries.
- Comment business decisions, state-machine invariants and non-obvious failure handling.
- Do not comment obvious syntax or produce narrative noise.
- Enforce formatting, linting and type checking.
- Preserve behaviour while refactoring; introduce tests first for high-risk paths.
- Avoid a broad rewrite of the game, Designer or publication model.

## Evidence rule

Diagnostic hooks remain useful, but must be classified `QA_DIAGNOSTIC`. An ordinary-user PASS must use supported visible input and public/product APIs, beginning from the real entry boundary.
