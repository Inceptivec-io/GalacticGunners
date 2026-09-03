# H015A Correction Closure Evidence

**Handoff:** `GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_015` including H015A
correction authority

**Exact tested SHA:** `5d510e373abf2e65d7c84ac05c870ec9c89d39e4`

**CI:** [33541341033](https://github.com/Inceptivec-io/GalacticGunners/actions/runs/33541341033), SUCCESS, 15/15 jobs

**Evidence artifact:** `9814967837`,
`h015-browser-evidence-5d510e373abf2e65d7c84ac05c870ec9c89d39e4`

**Artifact SHA-256:** `d94a58ed05bc286255c7514705f55fc04e4b40dd7407e62a379f32782036a90a`
**Manifest SHA-256:** `e694bf5f942d3209ad26af97397c27a4e83ea9c5f297263c879989b7d978e906`
**Closure-attestation artifact:** `9814968592`,
`h015-closure-attestation-5d510e373abf2e65d7c84ac05c870ec9c89d39e4`

## H015A Defect Matrix

| ID | Root cause and correction | Automated and ordinary-runtime proof | Result |
| --- | --- | --- | --- |
| GG-H015A-001 | Boarding animation creation is catalogue-backed and asserts its generated texture before named animation creation; no optional failure path masks a missing texture. | `tests/unit/canonical-sprites.test.mjs`; `npm run runtime:h015:boarding`; CI `boarding-entry-abort` and `boarding-success-return`. | PASS |
| GG-H015A-002 | Boarding uses the shared coordinator/state machine with explicit enter, pause, abort, success and Shooter-return transitions. | `game/tests/boarding-simulation.test.ts`; ordinary Boarding entry/abort/success browser journeys in the immutable artifact. | PASS |
| GG-H015A-003 | Boarding input applies a grounded jump velocity through `BoardingScene`; it is not a visual-only action. | `game/src/scenes/BoardingScene.ts`; ordinary physical-exit journey and Boarding simulation assertions. | PASS |
| GG-H015A-004 | Founder-review and local DEV stacks use separate Compose project names, host ports and named database volumes. | `scripts/verify-docker-environment-isolation.ps1`; Docker smoke and runtime-browser CI gates. | PASS |
| GG-H015A-005 | Founder bootstrap validates the retained database credential authority before migration/seed/bootstrap and writes access data only to an ignored local file. | `scripts/start-founder-review.ps1`; backend authentication/CSRF gates; review bootstrap in cross-browser verifier. | PASS |
| GG-H015A-006 | Campaign and Boarding resources accept non-negative acquired nukes without a historical two-item maximum. | `game/tests/boarding-simulation.test.ts` H015A-006; backend validation/migration coverage; campaign browser evidence. | PASS |
| GG-H015A-007 | Runtime nuke projectile and burst resolve through generated canonical catalogue assets, including the bounded generated burst sheet. | `tests/e2e/generated-sprites.spec.ts`; compiler contract and cross-browser runtime gate. | PASS |
| GG-H015A-008 | Comet heading is derived from travel velocity through the shared hazard policy instead of uncontrolled angular rotation. | `game/tests/level-authoring.test.ts`; Level 4 hazard browser gate. | PASS |
| GG-H015A-009 | Terminal actions use discrete controls with armed keyboard/controller activation after release, preventing accidental carry-through into Continue. | `scripts/verify-campaign-progression.mjs`; campaign progression browser gate. | PASS |
| GG-H015A-010 | Cursor hiding is an ordinary browser interaction with a five-second idle deadline and motion restoration. | `tests/e2e/gameplay-cursor.spec.ts`; runtime-browser artifact. | PASS |

## Assurance and Closure Audit

The strict closure attestation was generated at `2026-09-01T18:37:13.024Z`
by `node scripts/generate-h015-closure-attestation.mjs` at the tested SHA.
It reports `CLOSURE_AUDIT=PASS`, `FAILED_GATES=0`, `PENDING_GATES=0`, and
`EVIDENCE_UNIQUENESS=PASS`. Required exact-SHA gates all passed:

`runtime-hostile`, `campaign-progression`, `boarding-entry-abort`,
`boarding-success-return`, `level4-hazards`, `designer-roundtrip`,
`designer-review-matrix`, `splash-navigation`, `auth-redirect`,
`player-logout`, `assurance-catalogue`, and `closure-audit`.

The 50-row assurance catalogue is included in the `assurance-catalogue` gate.
The final local catalogue result contains 99 substantive PASS cases and one
intentional post-upload closure-audit deferral. The preceding CI run at
`421197b` exposed a deterministic teardown defect: `Level1Scene` published
diagnostics after Phaser had disposed its scout/shield groups during splash
navigation. `publishQaState()` now verifies the active scene and group
ownership before publishing, while still allowing ordinary runtime errors to
fail the verifier. Earlier H015 readiness claims and artifacts are historical
rejected evidence; they are not used as proof for this exact SHA. The final
CI run also validates per-case failure diagnostics in
`scripts/run-h015-assurance-catalogue.mjs`; the runner now reports a failing
case's result, exit code, command, log path and stderr without changing its
fail-closed decision.

## Return State

```text
H015_STATUS=H015A_CORRECTION_COMPLETE_FOUNDER_REVIEW_READY
FOUNDER_REVIEW_READY=YES
FOUNDER_ACCEPTANCE=PENDING
MERGE_AUTHORISED=NO
POST_BOX_PAYLOAD=0
```
