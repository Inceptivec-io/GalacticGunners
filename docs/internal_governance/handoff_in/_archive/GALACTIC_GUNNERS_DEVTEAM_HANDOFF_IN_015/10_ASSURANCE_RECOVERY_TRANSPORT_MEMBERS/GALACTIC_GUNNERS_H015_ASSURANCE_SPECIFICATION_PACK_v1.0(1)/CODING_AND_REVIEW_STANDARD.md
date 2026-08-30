# Coding and Review Standard

## Readability

Prefer small cohesive modules, explicit names, typed inputs/outputs and one authority for each business rule. Comments explain why, invariants, security boundaries and intentional trade-offs. Remove stale comments and avoid prose that repeats code.

## Architecture

- Separate rendering, input mapping, state transitions, persistence and transport.
- Keep publication/version rules server authoritative.
- Keep QA instrumentation behind an explicit diagnostic boundary.
- Centralise redirect validation and checksum/version contracts.
- Avoid source constants that shadow Designer-authored runtime data.

## Review checklist

1. Requirement IDs are named in tests and traceability.
2. Positive and negative behaviour are asserted.
3. Error paths are visible, safe and deterministic.
4. Permissions are enforced server-side.
5. Immutable history is preserved.
6. Tests do not rely on order or shared state.
7. No forced hook satisfies ordinary acceptance.
8. New constants are governed and explained.
9. Accessibility and supported input modes are covered.
10. Formatting, lint, types and affected tests pass.

## Refactoring boundary

Refactor affected code enough to make rules independently testable. Do not undertake an unrelated framework migration or whole-application rewrite under H015.
