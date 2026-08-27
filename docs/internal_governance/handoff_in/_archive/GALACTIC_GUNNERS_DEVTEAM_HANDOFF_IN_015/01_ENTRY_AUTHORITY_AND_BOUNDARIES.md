# H015 Entry Authority and Boundaries

## Verified provider ancestry

```text
H014 feature head = 6cf62de413e258f2f215b1d4cf5fb422ce3a7efa
prior dev head    = 989d56a511f1de1af72b66144eb5c93fc2a80921
merged dev head   = 3270be64c67863dc848ebad26e2a33daf8b70742
merge parents     = 989d56a... + 6cf62de...
merge PR          = #11
```

H014 returned `FOUNDER ACCEPTED — KNOWN PLATFORM AND RUNTIME ITEMS DEFERRED TO H015`. H015 therefore starts from the merged `dev` SHA above and owns the listed deferrals.

## Receiving gate

Before mutation Development shall record:

1. received ZIP filename and SHA-256;
2. safe ZIP scan: no traversal, absolute path, device entry, symlink escape or executable payload;
3. extracted inventory and per-file hashes;
4. exact repository, branch, entry/local/remote SHA and worktree state;
5. applicable `AGENTS.md` files;
6. H014 return and H015 carry-forward currentness;
7. Defender/malware scan where available;
8. preserved inbound ZIP in POST_BOX and an authorised working copy outside the preserved source.

Entry passes only if local `dev`, remote `dev` and `3270be64c67863dc848ebad26e2a33daf8b70742` reconcile without unexplained divergence or unique local work.

## Authorised surfaces

- `apps/web/`: product shell, auth/account/admin/business/editor/leaderboard pages and same-origin API routing.
- `backend/`: Django identity, platform/organisation authority, campaigns, levels, Boarding, scores, audit and migrations.
- `game/`: Phaser campaign continuity, distinct level loading, Boarding completion and asset use.
- `packages/contracts/`: JSON Schema, OpenAPI and TypeScript transport types.
- `.github/workflows/`, root scripts and Docker: relevant automated gates only.
- `docs/internal_governance/`: planning currentness, evidence, guides, registers and Handoff-Out.

## Non-goals

H015 shall not implement:

- billing collection or payment-provider integration;
- public marketplace/discovery economy;
- enterprise SSO/SAML/SCIM;
- chat, social feed or real-time multiplayer;
- native Windows/Android/iOS packaging;
- production provider deployment;
- a replacement game engine, React gameplay, microservices, Redis or Celery;
- a new artwork style or Campaign Designer redesign.

## Stop conditions

Stop only for an actual authority conflict, unexplained non-fast-forward divergence, unique dirty work, secret exposure, destructive migration uncertainty, materially irreconcilable contract contradiction, or failed security gate that cannot be safely corrected inside H015.

Ordinary compilation/test failures, benign drift, migrations required by this pack, asset processing, local Docker faults and implementation defects are work to diagnose and correct—not reasons to return early.

## Permanent authority rules

- Django owns identity and authorisation.
- PostgreSQL state changes use Django migrations.
- Phaser owns gameplay.
- Next.js owns the shell and administration UI.
- Browser state is untrusted.
- Every privileged endpoint enforces server permissions independently of route hiding.
- Published definitions are immutable; changes create new versions.
- Development creates one draft PR and never merges.
