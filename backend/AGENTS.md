# Backend Execution Contract

Scope: `backend/` only.

- Django is the authoritative application backend and owns identity.
- PostgreSQL schema changes occur through Django models + migrations.
- No direct browser database access.
- API changes require versioned contract, tests, migration/deprecation analysis and docs in the same change.
- Stable semantic Python names only; never encode handoff/sprint identifiers into permanent modules/functions/files.
- Secrets are environment-bound and never committed.
