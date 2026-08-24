# GG-STD-010 API Contract and Versioning Standard v1.0

All external/API interface changes must identify consumers, version/currentness, required/optional fields, errors, authentication/authorization, idempotency where relevant, compatibility, migration/deprecation, tests and documentation. Public API begins at `/api/v1/`. Breaking changes require deliberate version treatment; internal refactors do not silently change external contracts.
