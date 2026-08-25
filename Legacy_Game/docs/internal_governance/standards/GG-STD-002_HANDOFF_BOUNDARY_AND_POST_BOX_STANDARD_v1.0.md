# GG-STD-002 — HANDOFF, BOUNDARY AND POST_BOX STANDARD v1.0

## Governing principle

Derived from the admitted Secuvara Universal Handoff/Boundary operating model and identity-bound workspace standard.

## Persistent external boundary

```text
_EXTERNAL_GalacticGunners/
└── _GalacticGunners_MAIN_POST_BOX/
    └── _WORK_00000001_POST_BOX/
```

The boundary persists.

## POST_BOX

POST_BOX is controlled external intake/exchange.

It is NOT:
- archive;
- canonical evidence home;
- permanent HANDOFF_IN storage;
- permanent HANDOFF_OUT storage;
- working directory.

Normal closure:

`POST_BOX PAYLOAD = EMPTY`

Boundary control files may remain.

## Handoff IN

```text
RECEIVE IN POST_BOX
→ HASH
→ INVENTORY
→ COPY/PRESERVE INTO docs/internal_governance/handoff_in/_archive/<HANDOFF_ID>/
→ REGISTER
→ CONSUME
→ CLEAR POST_BOX PAYLOAD
```

## Handoff OUT

```text
ASSEMBLE
→ EVIDENCE COMPLETE
→ REGISTERS CURRENT
→ MANIFEST
→ HASH
→ SEAL
→ PRESERVE INTO docs/internal_governance/handoff_out/_archive/<HANDOFF_OUT_ID>/
→ ROUTE RETURN
→ CLEAR POST_BOX PAYLOAD
```

## Prohibition

No loose transport ZIP or unpacked handoff payload remains in POST_BOX at PASS.
