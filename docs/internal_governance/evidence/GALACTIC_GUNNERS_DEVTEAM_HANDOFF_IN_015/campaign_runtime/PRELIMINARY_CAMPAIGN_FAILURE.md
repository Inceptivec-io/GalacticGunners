# Preliminary Campaign Regression Failure

Handoff: `GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_015`

This evidence was captured against local Docker source `67d21010ea0d86480b68e9d7978417597850caed` before the campaign-continuity correction in `cd257ba`.

The first `npm run runtime:campaign` reached the Level 1 completion and Level 2 runtime surfaces, then timed out waiting for Level 2 Continue to load Level 3. The second run reached the final and game-over screens but reported repeated `400` game-run admission failures. The retained screenshots document the state reached before failure; they are not passing evidence.

Root cause:

- the runtime contract did not retain the authoritative database `LevelVersion.version`; and
- the anonymous campaign capability was omitted from a successful completion response, preventing subsequent server-authorised completion.

Disposition: corrected in `cd257ba`; the full regression must be rerun from the corrected Docker image before H015 closure.

The retained-volume duplicate-level selection responsible for the second run was corrected in `bc65b35`; a clean exact-SHA rerun remains required.
