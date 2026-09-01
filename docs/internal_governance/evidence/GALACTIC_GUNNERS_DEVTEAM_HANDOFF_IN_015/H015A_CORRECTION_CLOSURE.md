# H015A Correction Closure Evidence

**Handoff:** `GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_015` including H015A
correction authority

**Exact tested SHA:** `be41004429790f6d0a575dc17d98fbe9ec8fd2bd`

**CI:** [33532128537](https://github.com/Inceptivec-io/GalacticGunners/actions/runs/33532128537), SUCCESS, 15/15 jobs

**Evidence artifact:** `9811526750`,
`h015-browser-evidence-be41004429790f6d0a575dc17d98fbe9ec8fd2bd`

**Artifact SHA-256:** `992ac9d1f5ca09ed462b942b2d9f8b3bb2761df139e96ff4d19fc7e51fdb4375`
**Manifest SHA-256:** `2f87655824b7d5cf7f71c82ae6cff0718dd7b31524fd74fb6c7352db96693c02`
**Closure-attestation artifact:** `9811527735`,
`h015-closure-attestation-be41004429790f6d0a575dc17d98fbe9ec8fd2bd`

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

The strict closure attestation was generated at `2026-09-01T17:05:49.449Z`
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
rejected evidence; they are not used as proof for this exact SHA.

## Return State

```text
H015_STATUS=H015A_CORRECTION_COMPLETE_FOUNDER_REVIEW_READY
FOUNDER_REVIEW_READY=YES
FOUNDER_ACCEPTANCE=PENDING
MERGE_AUTHORISED=NO
POST_BOX_PAYLOAD=0
```
