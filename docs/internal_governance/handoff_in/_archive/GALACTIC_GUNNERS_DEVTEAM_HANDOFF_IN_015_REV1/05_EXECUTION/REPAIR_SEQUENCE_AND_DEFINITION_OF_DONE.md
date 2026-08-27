# H015 REV1 Repair Sequence and Definition of Done

## Ordered execution

1. Receive/seal REV1 and reconcile it with preserved original H015 and current local work.
2. Record current branch, local/remote SHAs, dirty state, migrations, tests and any already-implemented H015 components.
3. Add characterization tests for every confirmed baseline defect before replacing behaviour where practical.
4. Correct environment and same-origin proxy; add build provenance and proxied health.
5. Complete session/CSRF endpoints, audience eligibility and protected route layouts.
6. Separate Django Admin route and environment lifecycle.
7. Complete original H015 organisation, membership, permissions, audit and entitlement work without parallel replacements.
8. Add ServicePlan/assignment, seed plan catalogue and enforce map quota service.
9. Add expandable Campaign/CampaignVersion/CampaignEntry and remove fixed six-level bounds from run APIs/runtime.
10. Finish six explicit current CORE levels, visible hazards and matching DB/package checksums.
11. Complete CampaignSession and result/Continue/replay/menu/death/claim continuity.
12. Complete Inceptivec dashboard pages and shared image-driven Designer.
13. Complete Command Post pages using the same Designer and tenant-isolated APIs.
14. Complete Boarding entry/runtime/server replay/return and imagery corrections.
15. Reconcile OpenAPI, JSON Schemas, generated types and clients to one API authority.
16. Add one-command Founder review tooling and exact guides.
17. Run clean DB, migrated DB, Docker, hostile, browser and remote CI gates; correct all failures.
18. Update Roadmap/Playlist currentness, registers, evidence and Handoff-Out.
19. Push the single branch, open/reuse one draft PR to `dev`, and return without merge.

Do not postpone foundational H015 requirements merely because the future commercial feature is inactive. Do not implement later multiplayer, billing or marketplace runtime.

## Required implementation inventory

- Django models/migrations/admin-independent services/policies/serializers/views/tests;
- conditional local Django Admin route;
- same-origin Next.js API rewrite and shared CSRF-aware client;
- protected internal and Command Post layouts/login pages;
- Inceptivec Dashboard tabs: Overview, Campaigns/Designer, Businesses, Users, Scores, Logs;
- Command Post pages specified in the architecture;
- shared Designer asset modal, real thumbnails, placement and typed inspector;
- explicit six CORE definitions plus expandable campaign authority;
- persistent CampaignSession, result panels and score claim;
- completed Boarding;
- schemas/OpenAPI/generated types;
- env example, PowerShell start/status/stop and management bootstrap;
- Founder, Player, Command Post, Platform Admin, Developer, API, Environment and Regression guides;
- substantive tests/evidence/currentness/register updates.

## `FOUNDER_REVIEW_READY=YES` gate

All must pass on the returned SHA:

- source SHA equals reported container build SHA/build ID;
- clean migrations on empty and H014-shaped database;
- web 3002 root, play, API proxy and required assets healthy;
- direct browser API calls target 3002-relative `/api/v1`, not 8010;
- generated Founder product-admin credentials successfully login through product UI;
- unauthenticated product-admin and Command Post show login before privileged shell;
- Django Admin enabled only locally and disabled in Stage/Production settings test;
- internal user, customer member and player surface grants are distinct;
- tenant isolation and map limits pass;
- CORE campaign initially contains exactly six distinct active entries but a seventh test entry can be added/published without engine code change;
- Levels 1–2 prove different visual/runtime content and cumulative score/resources;
- Level 2 visible asteroid and Level 4 visible/reachable Boarding anchor;
- death/result/Continue/replay/menu behaviour deliberate;
- image chooser and real canvas imagery work;
- anonymous validate/register-or-login/claim/top-ten works;
- Boarding success, timeout, death, rejection and return evidence works;
- all local quality/Docker/browser jobs and remote CI green;
- access file and Founder guide contain exact review order.

If any item fails, Development continues correction or returns truthful FAIL/CONDITIONAL PASS. A screenshot of a shell, presence test or API 200 alone cannot satisfy a behavioural gate.

