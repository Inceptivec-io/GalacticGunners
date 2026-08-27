# H013 Verification

Handoff: `GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_013`

Entry: `16a22dba60b5e8193f2377962a6a7b1a49f386c4` on `dev`.

Implemented gates:

- Gate A: server-owned GameRun identity, level/version/checksum/seed binding, event-summary score reconstruction, immutable submission record and rejection codes.
- Gate B: authenticated-player public best validated run, deterministic rank ordering and public minimum-data response.
- Gate C: privileged leaderboard moderation with entry/player suppression, restore, rename and immutable audit events.
- Gate D: branded `/leaderboard` route with a graceful backend-unavailable state; game session remains playable when the API is absent or rejects a start.
- Gate E: isolated score-validation, leaderboard and moderation hostile CI jobs.

Executed results:

- `docker compose run --rm backend pytest -q`: PASS, 17 tests.
- `npm run quality`: PASS: contracts, game typecheck/tests, web typecheck/build.
- Clean Docker rebuild: PASS. The runtime seed publishes Levels 1-6; Level 1 retains the accepted 58-enemy/256-shield-tile topology.
- Backend health: PASS, `http://localhost:8010/api/v1/health/`.
- Web health: PASS, `http://localhost:3002/api/health`.
- Leaderboard page: PASS, `http://localhost:3002/leaderboard` renders `Global Leaderboard`.
- `npm run runtime:hostile`: PASS. All semantic hostile cases, desktop/mobile visual matrix checks, unexpected console-error checks and unexpected network-failure checks passed. Final screenshots and the machine-readable result are in `browser_runtime_final/`.

POST_BOX is boundary-controls only. No transport ZIP is retained in the repository.

Founder acceptance and merge remain pending. H014 Boarding/runtime work is not implemented or authorised by this return.
