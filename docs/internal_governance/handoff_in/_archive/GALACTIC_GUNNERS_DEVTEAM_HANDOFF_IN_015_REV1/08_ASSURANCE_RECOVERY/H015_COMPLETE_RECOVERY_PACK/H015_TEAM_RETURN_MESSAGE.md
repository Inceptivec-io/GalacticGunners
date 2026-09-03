# Message to Development

H015 Founder review is stopped. Do not merge PR #12.

The first Founder observation exposed a journey mismatch, and the full audit confirms that the issue is assurance architecture: QA-hook execution, synthetic events, label-presence checks and forced completion are being represented as end-user proof.

Development must execute `H015_CORRECTIVE_EXECUTION_AUTHORITY.md` and the accompanying standards. Work requirement by requirement using RED → GREEN → REFACTOR. Every requirement requires positive and negative proof. Retain QA diagnostics but classify them honestly.

No `FOUNDER_REVIEW_READY=YES` is authorised until:

- the traceability register is complete;
- coding-quality gates pass;
- standard unit/component/API/E2E suites exist;
- every ordinary-user claim is free of QA hooks;
- Levels 1–6 and Boarding have real-play evidence;
- Designer all-field and full roundtrip gates pass;
- production mode denies QA capabilities;
- independent evidence audit finds zero failed, pending, missing or overclaimed gates.

Status:

```text
H015_STATUS=IN_PROGRESS
FOUNDER_REVIEW_READY=NO
FOUNDER_ACCEPTANCE=REJECTED
MERGE_AUTHORISED=NO
CONTINUATION_AUTHORISED=YES
```
