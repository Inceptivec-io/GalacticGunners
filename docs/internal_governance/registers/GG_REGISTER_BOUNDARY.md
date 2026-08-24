# GALACTIC GUNNERS — BOUNDARY REGISTER

| Boundary ID | Class | Path | Parent | Purpose | Direction | Operator | Mutation Mode | Status | Last Review |
|---|---|---|---|---|---|---|---|---|---|
| GG-EXT-001 | PROJECT EXTERNAL | `_EXTERNAL_GalacticGunners` | Galactic Gunners | Persistent external exchange boundary | controlled | Founder/authorised Worker | boundary-only | CURRENT | |
| GG-MAIN-POST-BOX | MAIN POST_BOX | `_EXTERNAL_GalacticGunners/_GalacticGunners_MAIN_POST_BOX` | GG-EXT-001 | Persistent transient exchange boundary | inbound/outbound transient only | Founder/authorised Worker | payload zero at closure | CURRENT | 2026-08-23 |
| GG-WORK-00000001 | WORK POST_BOX | `_EXTERNAL_GalacticGunners/_GalacticGunners_MAIN_POST_BOX/_WORK_00000001_POST_BOX` | GG-EXT-001 | Controlled exchange address | explicit per BOUNDARY.md | authorised Worker | payload transient | CURRENT | 2026-08-25 |
| GG-INT-GOV-001 | INTERNAL GOVERNANCE | `docs/internal_governance` | Galactic Gunners repository | Durable project governance, handoff history, evidence and registers | internal governed estate | Founder/authorised Worker | repository governance | CURRENT | 2026-08-23 |
