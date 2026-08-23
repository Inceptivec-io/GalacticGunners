# GALACTIC GUNNERS
# DEVTEAM HANDOFF IN 003
## FAITHFUL VISUAL RECONSTRUCTION + EVENT-DRIVEN SCENES + LOCKED CORE SCORING

**HANDOFF ID:** `GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_003`  
**Product:** Galactic Gunners  
**Institutional Arm:** Inceptivec Gamification  
**Work Level:** PROJECT / PRODUCT  
**Founder Acceptance / Merge Authority:** Michael Leese only

---

# 1. PURPOSE

Implement the Founder-supplied visual reconstruction estate faithfully and correctly, repair the visual/layout defects previously rejected by the Founder, restore required sprite activity/animation, integrate the supplied fonts, reconstruct Title / Victory / Game Over as event-driven scenes, preserve original gameplay semantics, implement the locked core scoring model, and reconcile the current Roadmap/Playlist into the canonical planning estate.

This is the one controlled integration pass following Founder asset reconstruction.

---

# 2. REPOSITORY

```text
LOCAL:
C:\Users\Michael\dev\GalacticGunners

REMOTE:
https://github.com/Inceptivec-io/GalacticGunners.git
```

Historical repository:
`michael-leese/GallacticGunners` — READ-ONLY reference/provenance.

CLOM:
READ-ONLY governing reference unless separately commissioned.

---

# 3. BRANCH

Continue on the existing single active branch:

```text
feature/GG-COM-001
```

Do not:
- create another feature branch;
- create another worktree;
- create another clone;
- execute on `main`;
- merge `main`.

```text
ACTIVE FEATURE BRANCHES = 1
```

---

# 4. PRE-EXECUTION STATE GATE

Before mutation:

1. read root `AGENTS.md`;
2. verify repository path;
3. verify remote;
4. verify branch `feature/GG-COM-001`;
5. `git fetch origin`;
6. record exact local HEAD;
7. record exact remote feature HEAD;
8. prove local == remote;
9. prove worktree clean;
10. verify POST_BOX inventory exactly matches the Founder-supplied inbound set plus boundary controls;
11. verify `docs/internal_governance` current;
12. register Handoff 003;
13. only then mutate.

If local/remote or authority cannot be reconciled:

```text
STOP — AUTHORITY_BOUNDARY_CONFLICT
```

---

# 5. AUTHORISED POST_BOX INPUT SET

Expected active payload:

```text
_WORK_00000001_POST_BOX/
├── BOUNDARY.md
├── GALACTIC_GUNNERS_ASSET_ALIGNMENT_AND_IMPLEMENTATION_PACK_v1.0.zip
├── GALACTIC_GUNNERS_MASTER_ROADMAP_AND_PLAYLIST_v1.0.zip
├── GalacticGunners_ASSETS.zip
└── README.md
```

No other payload is implicitly authorised.

---

# 6. INBOUND AUTHORITY PRECEDENCE

Use this exact precedence:

```text
DIRECT FOUNDER INSTRUCTION
+
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_003
        ↓
ROOT AGENTS.md
        ↓
CURRENT GALACTIC GUNNERS INTERNAL GOVERNANCE / STANDARDS
        ↓
GALACTIC_GUNNERS_MASTER_ROADMAP_AND_PLAYLIST_v1.0.zip
        ↓
GALACTIC_GUNNERS_ASSET_ALIGNMENT_AND_IMPLEMENTATION_PACK_v1.0.zip
        ↓
GalacticGunners_ASSETS.zip
        ↓
HISTORICAL REPOSITORY FOR BEHAVIOUR / VISUAL-GRAMMAR REFERENCE
```

Interpretation:

- Roadmap/Playlist = programme sequence, locked product rules and gates.
- Alignment/Implementation Pack = exact current integration expectations.
- Assets ZIP = Founder-owned visual/font source authority.
- Historical repo = behaviour and visual-grammar reference only.
- Current rejected first-pass visuals = defect evidence, not design authority.

Do not derive alternative art direction or governance.

---

# 7. PROGRAMME BOUNDARY

This Handoff authorises:

- Roadmap/Playlist currentness admission/reconciliation;
- visual reconstruction integration;
- runtime animation restoration;
- font integration;
- UI/layout correction;
- event-driven Title / Victory / Game Over;
- shield tile reconstruction;
- locked core score model;
- regression/evidence;
- Docker Founder acceptance runtime update as necessary.

This Handoff does NOT authorise:

- Boarding Mode implementation;
- Boarding assets;
- new leaderboard backend/platform build;
- player account system;
- Supabase;
- commercial packaging;
- stores;
- console builds;
- engine migration;
- historical repo mutation;
- CLOM mutation.
