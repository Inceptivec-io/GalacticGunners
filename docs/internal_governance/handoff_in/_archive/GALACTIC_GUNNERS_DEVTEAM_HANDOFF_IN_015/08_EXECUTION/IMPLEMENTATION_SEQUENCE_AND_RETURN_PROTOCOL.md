# H015 Implementation Sequence and Return Protocol

## Ordered construction

1. Receive/seal/reconcile authority and baseline tests.
2. Admit Roadmap/Playlist v1.3 and programme resequencing.
3. Establish same-origin API/session/CSRF and explicit admin login guard.
4. Add organisations, memberships, platform permissions, entitlements and audit.
5. Add GameProject/GameRelease ownership and migrate CORE content.
6. Add AssetCategory/AssetRecord, ingest current production estate and image chooser.
7. Reconcile Level/Interior project ownership, lifecycle and admin APIs.
8. Author/seed/package six distinct official Level definitions.
9. Add CampaignRun aggregate, attempt/checkpoint services and Phaser CampaignSession.
10. Add registration/login/claim and campaign-backed leaderboard publication.
11. Build required Platform/Business/Player pages around enforced APIs.
12. Complete Boarding entry/runtime/server replay/return/artwork.
13. Reconcile all machine contracts and clients.
14. Execute full automated, Docker and browser matrices; fix defects and rerun.
15. Update guides/evidence/registers; push, open draft PR and return.

Schema/migration/service work may be composed in intermediate commits, but no intermediate incompatible state is returned as closure.

## Required permanent deliverables

- Django migrations, models, policy/services, serializers, views and tests;
- versioned OpenAPI/JSON Schemas/TypeScript clients;
- Next.js auth/account/platform/business/editor/scores/logs surfaces;
- Phaser CampaignSession, distinct definition loading and complete Boarding;
- six DB fixtures and six packaged matching official level definitions;
- asset catalogue seed/derivative metadata and production UI/runtime use;
- substantive CI workflows/scripts;
- Player/Admin/Business Editor/Developer/Regression/API/Environment guides;
- currentness, project, evidence, asset and governance-debt register updates.

## Credential/bootstrap rule

Do not commit credentials. Provide an idempotent management command or documented `createsuperuser`/group assignment procedure driven by environment/interactive values. Browser evidence may use local test credentials supplied through ignored environment variables or test fixture setup; redact them from evidence.

## Commit/PR discipline

- one feature branch: `feature/v1-platform-foundation-campaign-continuity`;
- one draft PR to `dev`;
- no direct mutation of `dev/prod`, no merge, rebase or force push;
- commit semantic increments with migrations/contracts/tests together;
- no H015 numbers in permanent production class/module/component names;
- preserve unrelated Founder/user changes.

## Handoff-Out required fields

```text
HANDOFF_OUT=GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_015
ENTRY_SHA=3270be64c67863dc848ebad26e2a33daf8b70742
EXIT_BRANCH=feature/v1-platform-foundation-campaign-continuity
FINAL_LOCAL_HEAD=<sha>
FINAL_REMOTE_HEAD=<sha>
LOCAL_REMOTE_RECONCILIATION=PASS|FAIL
WORKTREE=CLEAN|DISCLOSED
PR=<url>
PR_STATE=OPEN_DRAFT_NOT_MERGED
CI_RUN=<id/url>
CI_RESULT=<result>
POST_BOX=<inventory>
FILES_CHANGED=<count/list-reference>
MIGRATIONS=<list>
TESTS=<evidence-reference>
DEFERRED_OR_BLOCKED=<truthful list>
CLOSURE=PASS|CONDITIONAL_PASS|FAIL
```

Return evidence includes receiving record, ancestry, ZIP scan/inventory, baseline failures, implementation matrix, migration reports, schema/OpenAPI validation, Docker health, browser journeys, screenshots/state/logs, final CI and non-self-referential Handoff-Out seal.

Founder acceptance and merge remain pending regardless of Development recommendation.

