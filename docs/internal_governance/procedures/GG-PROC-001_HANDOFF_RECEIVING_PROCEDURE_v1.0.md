# GG-PROC-001 — HANDOFF RECEIVING PROCEDURE v1.0

1. Verify active Handoff ID and revision.
2. Verify target repo/branch/entry SHA.
3. Receive package into authorised POST_BOX.
4. Calculate SHA-256.
5. Inventory package.
6. Create:
   `docs/internal_governance/handoff_in/_archive/<HANDOFF_ID>/`
7. Preserve source package unchanged there.
8. Store receiving record + manifest + hash.
9. Update Handoff Register and Evidence Register.
10. Create authorised working copy only if required.
11. Mark inbound CONSUMED.
12. Remove transient payload from POST_BOX.
13. Verify POST_BOX contains only persistent boundary controls before proceeding/closure.
