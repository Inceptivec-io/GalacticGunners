# H015 Required Browser Journeys

## Public launch

1. `/` renders public entry.
2. Play opens `/play`.
3. Approved splash appears for 2 seconds.
4. Exact footer is visible.
5. Phaser Main Menu appears with focus.
6. Internal navigation does not replay splash.
7. Direct fresh `/play` behaves consistently.

## Campaign real play

Complete Levels 1–6 using player inputs and actual objectives. Forced completion is prohibited. Verify hazards, collisions, shield damage, resources, Continue, Boarding decision, Mothership and final victory. Run a separate controlled speed-optimized test build only if production mechanics remain identical and no state mutation hook exists.

## Designer roundtrip

Execute all 22 authorised steps: baseline, draft, material movement, formation change, enemy composition change, hazard change, save, refresh, reopen, preview exact checksum, publish, new campaign, old pinned campaign unchanged, rollback as new version and restored new campaign. Capture action-bound traces for every state.

## Complete field-family matrix

For each field family, run a valid edit plus boundary/type/permission invalid edits. Verify UI validation, server rejection, immutable history and runtime consumption.

## Boarding

- Success by keyboard.
- Pause/resume and confirmed abort.
- Death/failure.
- API failure.
- Touch path.
- Shooter return and no immediate retrigger.
- Continue to next campaign entry.

## Tenant isolation

Use two organisations and actors. Prove same-tenant success and cross-tenant read, edit, preview, publish and archive denial.

## Production-mode negative

Build without Founder-review bootstrap. Prove QA globals, force controls, seed credentials and diagnostic endpoints are inaccessible. Query strings must not enable QA behaviour in production.
