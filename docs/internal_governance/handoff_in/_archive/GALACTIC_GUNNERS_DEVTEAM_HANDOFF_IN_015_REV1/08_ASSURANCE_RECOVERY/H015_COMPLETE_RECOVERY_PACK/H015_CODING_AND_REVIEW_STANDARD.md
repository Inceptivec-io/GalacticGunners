# H015 Coding and Human-Readability Standard

## Structure

- One module owns one bounded responsibility.
- React components above 300 lines or scenes above 500 lines require documented justification or decomposition.
- Domain rules live outside presentation scenes/components.
- Networking uses typed clients; UI does not scatter raw fetch calls.
- QA instrumentation is an adapter, never embedded authority.

## Documentation

Every critical module begins with purpose, inputs, outputs, invariants, failure behaviour and extension points. Public Python and TypeScript APIs use docstrings/TSDoc when behaviour is not obvious. Comments explain why and constraints, not syntax.

## Error handling

No swallowed exceptions. User-safe errors and operational logs are distinct. Every external request has explicit success/error/timeout behaviour. Tests cover each failure branch.

## Complexity

- Cyclomatic complexity target <= 10; hard review at 15.
- Function target <= 60 lines.
- Component/scene decomposition required when state domains or side effects exceed one responsibility.
- Duplicate logic is extracted only when semantics are truly shared.

## Quality commands

Provide stable commands:

```text
npm run lint
npm run format:check
npm run test:unit
npm run test:component
npm run test:e2e
npm run test:a11y
npm run test:coverage
npm run test:mutation:critical
cd backend && ruff check .
cd backend && ruff format --check .
cd backend && pytest --cov --cov-branch
```

CI must call these exact commands, not looser substitutes.
