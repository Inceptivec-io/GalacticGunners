# GG-STD-003 — EVIDENCE AND CLOSURE STANDARD v1.0

Every material execution must evidence:

- Handoff/Commission ID;
- executor identity;
- target repository;
- entry branch/SHA;
- authority/scope;
- changed files;
- commands/tests;
- pass/fail results;
- final branch/SHA;
- remote reconciliation;
- worktree state;
- register updates;
- remaining debt;
- sealed HANDOFF_OUT hash.

## Closure gates

PASS requires:

```text
POST_BOX_CLEAN=true
TMP_CLEAN=true_or_NA
WORKTREE_CLEAN=true
UNTRACKED_OPERATIONAL_MATERIAL=0
UNCOMMITTED_AUTHORISED_WORK=0
UNPUSHED_AUTHORISED_WORK=0
LOCAL_HEAD_EQUALS_REMOTE_HEAD=true
REGISTERS_CURRENT=true
EVIDENCE_CURRENT=true
HANDOFF_OUT_SEALED=true
FOUNDER_ACCEPTANCE=pending
```

Evidence is not rewritten to hide defects. Corrections use revision/successor lineage.
