# H015 Designer Runtime Round Trip

Status: PASS (in-progress rectification evidence, not Founder readiness)

Tested branch: `feature/v1-platform-foundation-campaign-continuity`

Tested repository SHA: `a32e993e9165417fc9b069f2c19065a9f1dcf911`

Runtime: Docker Compose, `http://localhost:3002`

The authenticated Inceptivec Administrator browser journey completed:

1. Select a visible Scout entity in the Campaign Designer.
2. Persist a changed rotation as a new immutable draft.
3. Open same-runtime preview and verify the draft checksum with no game run.
4. Validate and publish that immutable draft.
5. Start a new browser campaign and verify the published checksum is used.
6. Restore the superseded original immutable version as a new revision and verify its checksum.

Result: PASS. The verified draft and gameplay checksum were
`a892332131ce00302e45d51d8f03b2d8a4fdeeed5aa7e40cc71394231003f0af`.
Rollback source version: `32`.

The same correction adds regression coverage for sparse authored GRID formations: the
runtime compiler preserves real authored members as fixed-position ships rather than
creating phantom grid cells.

Remote CI: GitHub Actions run `33164271509` was green at the tested SHA, including
`runtime-hostile`.

This evidence does not assert Founder acceptance or `FOUNDER_REVIEW_READY=YES`.
