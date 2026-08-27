# Implementation file plan

Paths are authoritative destinations or narrowly scoped equivalents that match existing repository conventions. Do not force a filename if the entry branch already has the same responsibility under another canonical path; document the reconciled path in the change register.

## Contracts and level authority

- Extend `packages/contracts` LevelDefinition with optional `boarding_anchors` and add generated TS/Python bindings as the project requires.
- Add InteriorDefinition, BoardingRun/start/completion/detail, event trace, snapshot, enums, and public error-code contracts.
- Admit this pack's schemas/OpenAPI/examples as source inputs, reconciled into repository canonical contracts.
- Update Level 4 seed/version/checksum only; prove Levels 1–3 and 5–6 definitions do not drift.

## Backend

- `backend/boarding/`: app config, enums, models, migrations, schema validation, canonicalization/checksum, seed/replay services, permissions, serializers, views, URLs, admin, and tests.
- `backend/config/`: register app/routes/throttling as required.
- `backend/game_runs/`: integrate unresolved/valid/invalid Boarding status and return delta into parent completion without weakening H013.
- `backend/levels/`: validate anchor and active published interior references.
- `backend/pyproject.toml`: include the app package if explicit package lists are used.

## Game and web

- `game/src/boarding/`: types, constants, state machine, deterministic simulation/replay, snapshot canonicalizer, API client, coordinator, and scene.
- Extend existing `GameSession`, LevelDefinition consumption, shooter entity terminal hook, pause/audio handling, and `InputSystem` profile support.
- Register Boarding assets through the existing boot/manifest/sync path.
- Add shell accessibility labels/status/errors only; do not implement play in React.
- Replace hardcoded run duration with monotonic tracked active duration and preserve all existing behavior.

## Assets and scripts

- Admit assets to the destinations in `02_INPUT_RECEIVING_AND_ASSET_ADMISSION.md`.
- Extend existing asset sync/validation scripts.
- Add a deterministic character normalization/verification script with documented dependencies and reproducible output; keep sources.
- Update existing canonical asset/provenance/rename registers.

## Tests and evidence

- Add unit/contract/backend/runtime/hostile/browser coverage in the existing test layout.
- Add required npm scripts and CI jobs without removing or weakening existing ones.
- Put final proof only under the H014 evidence root and keep sensitive tokens/redacted material out of git.
