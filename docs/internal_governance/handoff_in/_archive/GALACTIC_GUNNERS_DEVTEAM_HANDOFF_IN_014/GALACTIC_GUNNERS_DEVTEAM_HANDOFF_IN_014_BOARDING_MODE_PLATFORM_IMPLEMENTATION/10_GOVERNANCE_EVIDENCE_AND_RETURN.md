# Governance, evidence, and return

## Repository records

Update the existing canonical asset, provenance, filename, decision, risk, test/evidence, API/contract, and change registers used by the repository. Do not create shadow authorities. Record at minimum:

- imagery outer hash and verified internal inventory;
- every admitted path and runtime derivative with provenance/hash;
- character normalization decision and visual inspection;
- Level 4 anchor/interior checksum publication;
- Boarding score-zero and global-resource decisions;
- anonymous capability-token boundary;
- offline leaderboard invalidation;
- hostile suite results and residual risks.

## Evidence directory

Create:

`docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_014/`

Include command logs, test/JUnit reports where supported, schema/checksum reports, migration/seed proof, asset inventory/hash comparison, alpha/frame validation, Docker health, API success/rejection transcripts with secrets redacted, browser console/network logs, screenshots, snapshot round-trip proof, CI run metadata, PR metadata, and final worktree/reconciliation proof. Evidence must be current to final HEAD.

## Review and PR

Perform self-review for correctness and scope, but do not mark Founder acceptance and do not merge. Push `feature/v1-boarding-mode`; open or update one draft PR to `dev`. Confirm the PR has no unrelated commits/files, all required checks are successful, branch protection is respected, and local/remote HEADs match.

## Handoff OUT 014 content

Return a concise human summary plus this exact machine-key shape with real values:

```text
HANDOFF_OUT=GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_014
ENTRY_SHA=989d56a511f1de1af72b66144eb5c93fc2a80921
EXIT_BRANCH=feature/v1-boarding-mode
FINAL_HEAD=<40 lowercase hex>
REMOTE_HEAD=<40 lowercase hex>
LOCAL_REMOTE_RECONCILIATION=PASS|FAIL
WORKTREE=CLEAN|DIRTY
POST_BOX=IMAGERY_PACK_PRESERVED_NOT_COMMITTED
IMAGERY_PACK_SHA256=71a9fdde58bf84f3a01618cdc3cb72211cfe4f5cff4d5154f7455de94ec14930
INTERIOR_SLUG=alien-frigate
INTERIOR_VERSION=1
INTERIOR_CHECKSUM=<64 lowercase hex>
PR=<url>
PR_STATE=OPEN_DRAFT_NOT_MERGED
CI_RUN=<url-or-id>
CI_RESULT=SUCCESS|FAILURE
CLOSURE=PASS|FAIL
```

Also state all commands/checks run, link the evidence root, list migrations and public contract changes, and identify any Founder decisions. Seal the complete return text with SHA-256 and report it as `Sealed return SHA-256`.

## Fail closure

Set `CLOSURE=FAIL` for any entry-gate bypass, unverified/adulterated asset, placeholder, contract drift, incomplete flow, skipped required test, red/missing CI, API authority gap, score mutation, unrelated scope, dirty tree, local/remote mismatch, non-draft/merged PR, or missing evidence. State the blocker precisely; do not imply acceptance.
