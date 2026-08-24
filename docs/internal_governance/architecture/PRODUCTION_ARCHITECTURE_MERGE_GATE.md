# Production Architecture Merge Gate

This feature branch is not eligible to merge to `dev` until all of the following are true:

- Founder accepts the final GGF-1 legacy runtime.
- `Legacy_Game/` is synchronised to that exact accepted HEAD.
- Behavioural Baseline Register names that exact HEAD as canonical.
- dependency lockfiles are generated from admitted dependency versions;
- client/game TypeScript checks pass;
- backend `manage.py check` and tests pass;
- contract validation passes;
- Docker local stack is validated;
- all architecture/standards/guides/contracts/currentness match the implementation;
- governance debt count remains zero;
- Founder / Secuvara CTAIO approves merge to `dev`.

This gate records readiness; it is not a substitute planning authority.
