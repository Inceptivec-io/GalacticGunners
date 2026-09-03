# H015 Pre-Pack Mutation Reconciliation

**Authority baseline:** `4d74d9664a4cbf119ecebf30377e8e6468bf27cf`

**Replacement-intake checkpoint:** `a67843ddb3ce8c311123a72a9b1e9a63be763f39`

## Containment record

```text
PRE_PACK_MUTATION_BASE_SHA=4d74d9664a4cbf119ecebf30377e8e6468bf27cf
PRE_PACK_MUTATION_FILE_COUNT=69
PRE_PACK_MUTATION_DIFF_SHA256=2655908c2bf03ff078f159306b71c7f1604effb82548701afed1b627af840e7f
PRE_PACK_MUTATION_COMMITTED=YES
PRE_PACK_MUTATION_PUSHED=YES
PRE_PACK_MUTATION_FILES=git diff --name-only 4d74d9664a4cbf119ecebf30377e8e6468bf27cf a67843ddb3ce8c311123a72a9b1e9a63be763f39
```

The final field is the complete, reproducible 69-path inventory. It is retained
as a Git range rather than copied into a mutable narrative record; its byte
content is covered by the recorded binary-diff SHA-256.

## Authority review

| Changed material | Catalogue mapping | Disposition |
| --- | --- | --- |
| Old suffix-named source archive and earlier receiving records | `H015-EVID-001`, `H015-EVID-003` | Historical evidence only; superseded by the replacement source tree and replacement receipt. |
| Intake, traceability, classification, manifests, workflow, registers and currentness | `H015-EVID-001` through `H015-EVID-006`, `H015-QUAL-001`, `H015-QUAL-004` | Retain as contained assurance WIP; each claim remains derived from executable proof only. |
| Root, splash, pause, campaign, shield and result runtime code/tests | `H015-ENTRY-001` through `H015-ENTRY-005`, `H015-GAME-001` through `H015-GAME-008` | Retain as contained product and test WIP; no row is closed without every required layer. |
| Designer pointer and tenant/browser tests | `H015-DES-001` through `H015-DES-010`, `H015-AUTH-001` through `H015-AUTH-004` | Retain as contained WIP; ordinary pointer, ownership and redirect proof must remain independently executable. |
| Boarding scene, simulation, pause behaviour and ordinary browser tests | `H015-BOARD-001` through `H015-BOARD-007` | Retain as contained WIP; ordinary journeys and server outcomes require continuing independent verification. |

`PRE_PACK_MUTATION_AUTHORITY_REVIEW=PASS` means every changed material group is
contained and mapped to the catalogue. It does not convert any unproven row to
`PASS`, accept historical claims, or authorise Founder review.
