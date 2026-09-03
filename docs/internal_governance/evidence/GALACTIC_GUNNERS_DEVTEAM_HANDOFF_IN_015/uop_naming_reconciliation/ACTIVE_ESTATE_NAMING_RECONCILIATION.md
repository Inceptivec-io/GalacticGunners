# Active Estate Naming Reconciliation

Status: `EXISTING_CLOM_UOP_CONFORMANCE_RESTORED`

This is an application record for the existing CLOM Universal Operating
Procedures. It does not create a Galactic Gunners naming standard. Historical
and sealed H015 records retain their actual process identities unchanged.

## Scope And Method

The active executable estate was searched for arbitrary process identifiers:
`handoff`, `sprint`, `stage`, `phase`, `step`, `tranche`, and non-domain
`wave`. Objects below historical handoff, handoff-out, and evidence archives
are historical provenance and were not edited. Domain `wave` remains because
it describes a gameplay progression value.

## Active Runtime Verifiers

| Former active object | Descriptive replacement | Object type | Active references updated | Historical provenance | Verification |
| --- | --- | --- | --- | --- | --- |
| `runtime:h015:stage1` / `verify-h015-stage1.mjs` | `runtime:shooter-baseline` / `verify-shooter-baseline.mjs` | runtime verifier | package scripts; review launcher | retained in sealed records | quality PASS |
| `runtime:h015:stage2` / `verify-h015-stage2-navigation.mjs` | `runtime:navigation-and-pause` / `verify-navigation-and-pause.mjs` | runtime verifier | package scripts; review launcher; splash test | retained in sealed records | quality PASS |
| `runtime:h015:stage3` / `verify-h015-designer-pointer.mjs` | `runtime:designer-pointer-interaction` / `verify-designer-pointer-interaction.mjs` | runtime verifier | package scripts; review launcher | retained in sealed records | quality PASS |
| `runtime:h015:stage4` / `verify-h015-stage4-authoring.mjs` | `runtime:designer-authoring-persistence` / `verify-designer-authoring-persistence.mjs` | runtime verifier | package scripts; review launcher; direct selected-authority request | retained in sealed records | browser PASS; selected `authority_version` contract |
| `runtime:h015:stage9` / `verify-h015-auth-session.mjs` | `runtime:authentication-session` / `verify-authentication-session.mjs` | runtime verifier | package scripts; CI; review launcher | retained in sealed records | quality PASS |
| `runtime:h015:boarding` / `verify-h015-boarding-journey.mjs` | `runtime:boarding-entry-pause-and-abort` / `verify-boarding-entry-pause-and-abort.mjs` | runtime verifier | package scripts; review launcher | retained in sealed records | quality PASS |
| `runtime:h015:boarding-success` / `verify-h015-boarding-success.mjs` | `runtime:boarding-combat-exit-and-return` / `verify-boarding-combat-exit-and-return.mjs` | runtime verifier | package scripts; review launcher | retained in sealed records | quality PASS |
| `runtime:h015:designer-roundtrip` / `verify-h015-designer-roundtrip.mjs` | `runtime:designer-save-preview-publish` / `verify-designer-save-preview-publish.mjs` | runtime verifier | package scripts; review launcher | retained in sealed records | quality PASS |
| `runtime:h015:level4-hazards` / `verify-h015-level4-hazards.mjs` | `runtime:hazard-direction-rotation-and-destruction` / `verify-hazard-direction-rotation-and-destruction.mjs` | runtime verifier | package scripts; review launcher | retained in sealed records | quality PASS |
| `runtime:h015:review-matrix` / `capture-h015-review-matrix.mjs` | `runtime:founder-product-review-matrix` / `capture-founder-product-review-matrix.mjs` | browser evidence capture | package scripts; review launcher | retained in sealed records | quality PASS |
| `runtime:h015:cross-browser` / `run-h015-cross-browser-verifier.mjs` | `runtime:cross-browser-gameplay` / `run-cross-browser-gameplay.mjs` | browser verifier | package scripts; CI | retained in sealed records | active reference verification PASS; browser gate remains independently fail-closed |

## Active Evidence Destinations

| Former active destination | Descriptive replacement | Object type | Verification |
| --- | --- | --- | --- |
| H015 handoff/stage evidence defaults | `docs/evidence/<capability>/` | default runtime evidence output | pending repository quality |
| `rectification/stage-9` CI output | `authentication-session` | CI runtime evidence output | pending workflow validation |
| `rectification/boarding*` evidence defaults | `boarding-entry-pause-and-abort` and `boarding-combat-exit-and-return` | runtime evidence output | pending repository quality |
| `rectification/designer_roundtrip` evidence default | `designer-save-preview-publish` | runtime evidence output | pending repository quality |
| `rectification/level4_hazards` evidence default | `hazard-direction-rotation-and-destruction` | runtime evidence output | pending repository quality |

## Active Assurance Identities

The active traceability catalogue now uses durable capability families. The
former H015-prefixed identifiers are retained only in sealed provenance.

| Former family | Active semantic family |
| --- | --- |
| `H015-EVID-*` | `GG-ASSURANCE-EVIDENCE-*` |
| `H015-ENTRY-*`, `H015-LAUNCH-*` | `GG-PRODUCT-ENTRY-*` |
| `H015-GAME-*`, `H015-RESULT-*` | `GG-CAMPAIGN-RUNTIME-*`, `GG-CAMPAIGN-RESULT-*` |
| `H015-BOARD-*` | `GG-BOARDING-*` |
| `H015-AUTH-*`, `H015-PERM-*` | `GG-AUTH-SESSION-*`, `GG-AUTHORIZATION-*` |
| `H015-DES-*`, `H015-PUB-*` | `GG-DESIGNER-*`, `GG-DESIGNER-PUBLICATION-*` |
| `H015-PAUSE-*`, `H015-MENU-*` | `GG-NAVIGATION-PAUSE-*`, `GG-NAVIGATION-*` |
| `H015-SPRITE-*` | `GG-SPRITE-GEOMETRY-*` |

## Retained Historical Provenance

The following remain intentionally unchanged because they identify the actual
governed history rather than active executable architecture:

- `docs/internal_governance/handoff_in/` and `handoff_out/` archives;
- sealed evidence and prior H015 returns;
- commission and evidence identifiers, including `GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_015`;
- assurance recovery intake records and their received transport names.

## Asteroid Authoring Reconciliation

Active asteroid authoring now represents spin as a magnitude in the inclusive
range `40..80` and an explicit `SEEDED_BIDIRECTIONAL`, `CLOCKWISE`, or
`COUNTERCLOCKWISE` direction policy. Signed ranges crossing zero are rejected
by server validation. This preserves deterministic clockwise/anticlockwise
runtime rotation without allowing stationary asteroids.

## Final Verification Required

`npm run quality` PASS. The selected-authority Designer persistence browser
journey PASS. Active-name searches find no superseded runtime aliases or
stage-named evidence paths in current executable/CI surfaces. The separate
cross-browser browser gate remains a required H015 assurance row and is not
claimed by this naming reconciliation.
