# Reconciliation, Supersession and No-Duplication Matrix

## Evidence inspected

- merged H014/dev authority at `3270be64c67863dc848ebad26e2a33daf8b70742`;
- original H015 pack and its 21-file manifest;
- repo-local `AGENTS.md` contracts and GG-STD-001 through GG-STD-017;
- H014 carry-forward plan, Roadmap/Playlist v1.2 and proposed v1.3;
- baseline Docker, Next.js, Django, Phaser, level, Boarding and contract code;
- Founder screenshots and browser errors from the paused H015 review.

At REV1 issuance no remote branch or PR named `feature/v1-platform-foundation-campaign-continuity` was visible. Development had reported legitimate local work in progress. That work is preserved and reconciled; absence from the provider is not authority to recreate or delete it.

## Confirmed baseline causes

| Evidence | Root condition requiring correction |
|---|---|
| Browser CORS credential failure | Web used `NEXT_PUBLIC_API_BASE_URL=http://localhost:8010/api/v1`, bypassing the required same-origin `/api/v1` proxy. |
| Product admin showed shell before authentication | `/inceptivec-gamification-admin` rendered `CampaignDesigner` without a server/session gate. |
| Django login appeared at product-admin-looking URL | Backend registered Django Admin at `inceptivec-gamification-admin/`, colliding conceptually with the Next.js product route. |
| Environment credentials failed | No single idempotent Founder-review account/bootstrap contract existed. |
| Port 8010 `/play` returned Django DEBUG 404 | Testing guide did not enforce the product/frontend boundary; `/play` belongs on port 3002. |
| Level repeats and missing hazards | `campaignDefinitions.ts` shallow-cloned Level 1 rather than loading six explicit definitions. |
| Score/resources reset | `Level1Scene` constructed new `ScoreSystem` and `LifeSystem` during scene restart. |
| Boarding unreachable/incomplete | H014 provided a foundation, while H015 must prove real entry, runtime, replay and exact Shooter return. |
| Permanent six-level ceiling | Original H015 contracts constrained campaign sequence to 1–6/7 although Roadmap v1.2 already declared six a minimum, not a technical maximum. |

## Supersession table

| Original H015 authority | REV1 treatment |
|---|---|
| Route `/gamification...` business portal | Replace with `/command-post...` route family. Do not keep aliases beyond a temporary tested redirect if already implemented. |
| References to generic “Business portal” | Customer-facing name is **Command Post**; enduring code namespace is `command_post`. |
| Django Admin path not distinguished | Use `/django-admin/` locally only, unlinked. Stage/production route registration is disabled. |
| `CampaignRun.next_sequence` 1–7 and `GameRun.sequence` 1–6 | Replace fixed bounds with release-derived ordered entry identity and positive order index; terminal next entry is `null`. |
| Official Levels 1–6 wording that implies a ceiling | Interpret as the current seeded CORE baseline. Official campaign length is data-driven and expandable. |
| Entitlement examples only | Extend with the exact configurable plan and quota model in REV1. |
| Future multiplayer compatibility statement | Narrow to explicit inactive `DUAL_PLAYER` capability metadata; no H015 multiplayer runtime/API. |
| Environment/bootstrap guidance | Replace with the exact one-command Founder review contract in REV1. |
| Cross-origin development allowance | Normal Docker/local browser path is same-origin only. Cross-origin support is test-only and must never be the Founder workflow. |
| Original H015 remaining models, APIs, schemas, runtime, assets, validation and governance | Continue unchanged unless an exact field/path is replaced above. |

## No parallel authority

Use and extend the original semantic objects:

- Django `accounts.User` remains the sole identity;
- `Organization` and `OrganizationMembership` remain tenant authority;
- `GameProject` remains the ownership container;
- `Level`/`LevelVersion` and `Interior`/`InteriorVersion` remain map/config authority;
- `GameRelease` remains an immutable published product snapshot;
- `CampaignRun` remains the aggregate and `GameRun` remains a level attempt;
- the Phaser level runtime remains shared;
- `/api/v1` remains the only browser API namespace.

Do not add `CustomerUser`, a separate customer auth database, a customer-only level engine, a second asset catalogue, hard-coded tier checks in React or another roadmap/currentness root.

