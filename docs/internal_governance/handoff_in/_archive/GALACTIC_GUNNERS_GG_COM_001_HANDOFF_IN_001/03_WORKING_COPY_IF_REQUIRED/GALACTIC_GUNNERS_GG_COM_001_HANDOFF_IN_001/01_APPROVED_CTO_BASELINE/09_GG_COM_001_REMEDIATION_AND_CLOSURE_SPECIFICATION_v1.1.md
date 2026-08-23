# GALACTIC GUNNERS
# GG-COM-001 REMEDIATION AND CLOSURE SPECIFICATION
## v1.1

## 1. Entry Gate

Expected:

- local: `C:\Users\Michael\dev\GalacticGunners`
- remote: `Inceptivec-io/GalacticGunners`
- branch: `feature/GG-COM-001`
- entry HEAD: `87923524833b737c7e3bf1764dde0b6ebf495e62`
- worktree: clean at Founder-created baseline.

Development must verify, not assume.

---

## 2. Mandatory Workstreams

### A. External boundary implementation

Implement `08_GG_COM_001_EXTERNAL_BOUNDARY_AND_REGISTER_SPECIFICATION_v1.0.md`.

### B. Licensing files

Implement:

- product licensing-position document;
- third-party notices;
- required MIT notices;
- dependency record.

### C. Code provenance

Verify:

- Jared York upstream;
- bundled Phaser version;
- utility code source;
- known commercial controller contribution;
- no unexpected unclassified third-party code.

### D. Asset provenance

Audit every runtime asset.

For the legacy non-core media/font/utility estate identified by this review:

- remove commercial dependence;
- replace through the separately specified `IP_FREEDOM_LICENSE_PROTECTION_ASSET_CREATION` pack;
- record the replacement linkage/evidence.

The commercial objective is not merely to prove old internet-source permissions; it is to establish a clean proprietary asset estate.

### E. Historical course PDF

Remove from the commercial repository unless redistribution permission is independently proved.

Preserve a source citation/link instead of bundling copyrighted course material unnecessarily.

### F. README

Replace the commercial repository front README with the approved commercial README baseline.

Preserve historical provenance through links and credits rather than keeping the entire repository presented as a 2019 milestone project.

### G. Aurora record

Create/maintain:

- contributor participation record;
- contribution evidence;
- royalty framework/agreement draft;
- explicit separation of royalty from IP ownership.

Do not fabricate unsettled royalty mechanics.

---

## 3. Runtime Regression Test

Any remediation affecting code/assets must be tested.

Minimum current baseline:

### Browser

- application launches;
- menu loads;
- info screen;
- Level 1;
- Level 2;
- Boss/Level 3;
- pause/resume;
- game-over/restart;
- victory/title transition;
- audio;
- keyboard input;
- touch path where testable.

### Controller

Where controller-related files are touched:

- Xbox controller;
- Haute M-series controller.

At minimum verify:

- movement;
- fire;
- nuke;
- pause/resume;
- restart;
- relevant menu actions.

---

## 4. Required Repository Outputs

Recommended governed commercial documentation location:

```text
docs/
└── commercial/
    └── GG-COM-001/
        ├── COMMERCIAL_LICENSING_POSITION.md
        ├── THIRD_PARTY_NOTICES.md
        ├── ASSET_PROVENANCE_REGISTER.md
        ├── IP_PROVENANCE_RECORD.md
        ├── CONTRIBUTOR_COMMERCIAL_PARTICIPATION_RECORD.md
        └── GG_COM_001_CLOSURE_RECORD.md
```

Root-level notices may also be required for distribution visibility.

No duplicate source-of-truth documents should be created unnecessarily.

---

## 5. Closure States

### PASS

All mandatory outcomes complete; no unresolved item blocks commercial continuation.

### CONDITIONAL PASS

GG-COM-002 may proceed, but explicitly listed non-release-blocking debt remains.

### FAIL

A material rights/provenance issue remains that prevents safe commercial continuation.

---

## 6. Closure Evidence

HANDOFF_OUT must report:

- final branch;
- final HEAD;
- local/remote HEAD relationship;
- worktree status;
- files added/modified/deleted;
- provenance classifications;
- assets replaced;
- notices added;
- README state;
- Aurora record state;
- tests run;
- results;
- boundary/register completion;
- outstanding debt;
- closure recommendation.

Founder Michael retains acceptance and merge authority.
