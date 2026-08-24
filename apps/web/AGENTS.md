# Web Client Execution Contract

Scope: `apps/web/` only.

- Next.js is the product/web shell, not the game engine.
- Phaser gameplay must be hosted through the game-core boundary and must not be recreated in React components.
- Browser state is untrusted; no database, admin, signing, payment or entitlement secrets may exist here.
- Public environment variables are public by definition.
- API changes require corresponding versioned contract, tests and documentation in the same change.
- Permanent names describe product meaning. Do not use handoff, sprint or arbitrary execution sequence identifiers in component/function/file names.
