# GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV4 - CI Reproducibility Closure

Branch: `feature/v1-level1-vertical-slice`

REV4 entry SHA: `5d0f8d04556a51f3398192e011e8b6b41b9bd2bf`

Founder product/visual acceptance at entry: ACCEPTED AS-IS.

## Transport Intake

Source transport: `_EXTERNAL_GalacticGunners/_GalacticGunners_MAIN_POST_BOX/_WORK_00000001_POST_BOX/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV4_CI_REPRODUCIBILITY_CLOSURE_PACK.zip`

Transport SHA-256: `5E6EBB0DA52F69AC224F94578704CB9700841FF5DFF710BBC809140E1C8A539F`

Member inventory:

- `GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV4_CI_REPRODUCIBILITY_CLOSURE/00_COMMISSION.md`
- `GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV4_CI_REPRODUCIBILITY_CLOSURE/01_ROUTING_MESSAGE.md`
- `GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV4_CI_REPRODUCIBILITY_CLOSURE/MANIFEST_SHA256.json`

Disposition: unpacked inspectable contents admitted to `docs/internal_governance/handoff_in/_archive/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV4/`; transport ZIP removed from POST_BOX after governed intake.

## Purpose

Make the Founder-accepted Level 1 state reproducibly pass GitHub CI without product/runtime visual or gameplay changes.

## Remote Failure

Remote run: `32891073238`

Initial status:

- `backend`: SUCCESS.
- `client-and-game`: SUCCESS.
- `docker-smoke`: SUCCESS.
- `runtime-hostile`: FAILURE.

Remote failure output before REV4 diagnostics:

- `Runtime hostile verification failed: hostile_cases`.

Exact failing hostile case identified before diagnostics: NOT AVAILABLE from the old harness because the harness only reported the aggregate assertion group.

## REV4 Change

Changed file:

- `scripts/verify-v1-slice-runtime.mjs`

Change type: diagnostic harness only.

Product/runtime behaviour changed: NO.

Founder-accepted visual/gameplay state changed: NO.

The hostile verifier now prints:

- failed assertion groups;
- exact failed hostile case names;
- visual matrix subfailures by viewport;
- unexpected console errors;
- unexpected network failures.

## Classification

Classification: B - ENVIRONMENT / CI HARNESS OBSERVABILITY VARIANCE.

Root cause: the CI failure was actionable only as an aggregate `hostile_cases` failure because the harness did not print exact failed hostile cases. After the diagnostic-only harness change, the GitHub PR merge-ref runtime-hostile job completed successfully without product/runtime modification.

## Local Proof

Docker rebuilt from final diagnostic HEAD and retained at `http://localhost:3002/play`.

Local hostile pass 1:

- Handoff ID: `GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV4_LOCAL_PASS_1`.
- Result: PASS.
- Report: `docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV4_LOCAL_PASS_1/browser_runtime/runtime-hostile-verification.json`.
- SHA-256: `974D3B27CF47259EFE2AC10C095F3F46FE23177D48C467FD2CCF3628B5ADC966`.

Local hostile pass 2:

- Handoff ID: `GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV4_LOCAL_PASS_2`.
- Result: PASS.
- Report: `docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV4_LOCAL_PASS_2/browser_runtime/runtime-hostile-verification.json`.
- SHA-256: `B264B0AE803C215D430C140173002A734729605F0D892D284E92631E7458EDD9`.

Local hostile pass 3:

- Handoff ID: `GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV4_LOCAL_PASS_3`.
- Result: PASS.
- Report: `docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV4_LOCAL_PASS_3/browser_runtime/runtime-hostile-verification.json`.
- SHA-256: `1919239AB860E1BADFD6EB3EC0E3759DDA04057D4B995B63759239524DA8732B`.

## Remote Proof

Remote run: `32894066325`

Final job results:

- `backend`: SUCCESS.
- `client-and-game`: SUCCESS.
- `docker-smoke`: SUCCESS.
- `runtime-hostile`: SUCCESS.

GitHub runtime-hostile result: PASS in `5m51s`.

## Closure

FOUNDER_ACCEPTED_PRODUCT_STATE: PRESERVED.

GOVERNANCE_DEBT: 0.

PR #4: OPEN / DRAFT / NOT MERGED.

Closure recommendation: PASS - return for CTO final merge gate.
