# GALACTIC GUNNERS
# EXTERNAL BOUNDARY AND REGISTER SPECIFICATION
## GG-COM-001 v1.0
### Exact Development Build Specification

This document defines what Development must build later.

Development must **implement this specification**, not derive its own model.

---

## 1. Founder-Created Seed Boundary

Founder has already created:

```text
_EXTERNAL_GalacticGunners\
└── _GalacticGunners_MAIN_POST_BOX\
    └── _WORK_00000001_POST_BOX\
```

This identity must be preserved.

Do not silently rename or renumber it.

---

## 2. Governing Model

The boundary follows the Secuvara Universal Handoff, Boundary Exchange and Work Execution Operating Source of Truth v1.0 and the established TOS Platform-derived pattern.

Core rules:

- boundary persists;
- payloads come and go;
- boundary is not deleted when payload is cleared;
- direction is explicit in `BOUNDARY.md`;
- inbound source is preserved;
- handoff_in is sealed/immutable after receipt;
- handoff_out is assembled, inventoried, hashed and sealed before return;
- registers are maintained by their proper concern;
- workers do not infer authority.

---

## 3. Required External Structure

Development must establish:

```text
_EXTERNAL_GalacticGunners\
│
├── BOUNDARY.md
├── README.md
│
└── _GalacticGunners_MAIN_POST_BOX\
    │
    ├── BOUNDARY.md
    ├── README.md
    │
    ├── _WORK_00000001_POST_BOX\
    │   ├── BOUNDARY.md
    │   ├── README.md
    │   │
    │   ├── handoff_in\
    │   │   ├── README.md
    │   │   └── <HANDOFF_ID>\
    │   │       ├── 00_RECEIVING_RECORD.md
    │   │       ├── 01_SOURCE_AS_RECEIVED\
    │   │       ├── 02_INVENTORY\
    │   │       └── 03_WORKING_COPY_IF_REQUIRED\
    │   │
    │   ├── handoff_out\
    │   │   ├── README.md
    │   │   └── <HANDOFF_ID>\
    │   │       ├── 00_HANDOFF_OUT.md
    │   │       ├── 01_EVIDENCE\
    │   │       ├── 02_INVENTORY\
    │   │       ├── 03_MANIFEST\
    │   │       └── 04_SEALED_RETURN\
    │   │
    │   └── evidence\
    │       ├── README.md
    │       └── <HANDOFF_ID>\
    │
    └── registers\
        ├── README.md
        ├── GALACTIC_GUNNERS_BOUNDARY_REGISTER.md
        ├── GALACTIC_GUNNERS_HANDOFF_COMMISSION_REGISTER.md
        ├── GALACTIC_GUNNERS_WORKER_IDENTITY_REGISTER.md
        ├── GALACTIC_GUNNERS_PARTICIPANT_REGISTER.md
        ├── GALACTIC_GUNNERS_EVIDENCE_REGISTER.md
        ├── GALACTIC_GUNNERS_ASSET_PROVENANCE_REGISTER.md
        ├── GALACTIC_GUNNERS_DEPENDENCY_REGISTER.md
        └── GALACTIC_GUNNERS_CURRENTNESS_AND_GOVERNANCE_DEBT_REGISTER.md
```

If the established TOS Platform model has an already-canonical filename for one of these same concerns, use the existing canonical concern/name rather than create a semantic duplicate.

The **concerns listed above are mandatory**.

---

## 4. Root `BOUNDARY.md`

Must define:

- boundary identity;
- project/product identity;
- institutional parent;
- authority chain;
- local product repo;
- remote product repo;
- external boundary purpose;
- permitted work level;
- prohibited authority;
- POST_BOX identities;
- direction of each POST_BOX;
- immutable inbound rule;
- return rule;
- Founder acceptance/merge authority.

---

## 5. `_WORK_00000001_POST_BOX/BOUNDARY.md`

Must identify:

- identity class: `WORK`;
- exact worker identity/register entry;
- direction for inbound commissions;
- direction for outbound return;
- permitted payload classes;
- repository mutation mode;
- branch requirement;
- stop/fail-closed conditions.

No worker authority exists merely because the folder exists.

---

## 6. Boundary Register

Minimum fields:

| Field | Requirement |
|---|---|
| Boundary ID | Stable identity |
| Class | PROJ/WORK etc. |
| Path | Exact path |
| Parent | Parent boundary |
| Purpose | Exchange purpose |
| Sender | Authorised sender |
| Receiver | Authorised receiver |
| Direction | Explicit |
| Repository | If applicable |
| Mutation Mode | NONE/RO/BOUNDED |
| Status | CURRENT/RETIRED/etc. |
| Created | Date |
| Last Reviewed | Date |
| Evidence | Supporting record |

---

## 7. Handoff / Commission Register

Minimum fields:

- Handoff ID;
- revision;
- programme/stage;
- issuer;
- receiver;
- work level;
- branch;
- entry HEAD;
- inbound filename;
- inbound SHA-256;
- received date;
- status;
- handoff_out identity;
- outbound SHA-256;
- closure state;
- Founder acceptance state.

---

## 8. Worker Identity Register

Minimum fields:

- Worker ID;
- identity class;
- product/project;
- assignment;
- authority source;
- permitted repo;
- permitted branch;
- mutation level;
- start/currentness;
- status;
- evidence.

---

## 9. Participant Register

Human contributors/participants relevant to the product boundary should be recorded, including:

- Michael Leese;
- Aurora Leonardi;

with role and authority accurately bounded.

This register is **not** a substitute for commercial contracts.

---

## 10. Evidence Register

Must provide durable references to:

- receiving records;
- hashes;
- inventories;
- commands/results;
- tests;
- provenance findings;
- changed files;
- screenshots where relevant;
- closure evidence;
- handoff_out packages.

---

## 11. Asset Provenance Register

The GG-COM-001 asset provenance record becomes a living project register and must remain current through later commercial stages whenever assets are added, replaced or relicensed.

---

## 12. Dependency Register

Must include at minimum:

- Phaser;
- Jared York / CourseSaucerInvaders-derived material;
- any utility/example libraries;
- future packaging/runtime dependencies introduced later.

Fields include version/ref, source, licence, purpose, currentness and replacement risk.

---

## 13. Currentness & Governance Debt Register

Must capture unresolved matters such as:

- unknown asset provenance;
- replacement required;
- licence evidence incomplete;
- royalty terms awaiting signature;
- README/legal state;
- platform/legal prerequisites not yet completed.

Debt is not hidden to obtain closure.

---

## 14. Handoff Receiving Lifecycle

Exact required lifecycle:

```text
CREATE HANDOFF_IN FOLDER
↓
COPY/PRESERVE SOURCE AS RECEIVED
↓
HASH
↓
INVENTORY
↓
RECEIVING RECORD
↓
CREATE WORKING COPY IF AUTHORISED
↓
SEAL INBOUND
↓
DO NOT MUTATE RECEIVED SOURCE
```

---

## 15. Handoff Return Lifecycle

```text
WORK COMPLETE
↓
TEST / EVIDENCE COMPLETE
↓
REGISTERS CURRENT
↓
HANDOFF_OUT ASSEMBLED
↓
INVENTORY
↓
MANIFEST
↓
PACKAGE
↓
SHA-256
↓
SEALED
↓
RETURN TO AUTHORISED POST_BOX
```

After sealing:

- no silent repack;
- no rename;
- no edit;
- correction requires revision/successor handoff.

---

## 16. Completion Requirement

The external structure is **part of GG-COM-001 completion**, not preparatory optional work.

GG-COM-001 cannot close if:

- boundary documentation is missing;
- registers are missing;
- handoff_in/out are not operational;
- inbound is not preserved;
- evidence is not indexed;
- currentness/debt is not recorded.
