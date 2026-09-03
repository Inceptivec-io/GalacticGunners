# H015 Hostile Test and Acceptance Matrix

Automated presence checks are supplementary only. A gate passes through real behaviour and asserted state.

## Required CI jobs

| Job | Minimum substance |
|---|---|
| `backend` | checks, migrations, full pytest, generated OpenAPI reconciliation |
| `client-and-game` | lint, typecheck, unit, production build |
| `contracts` | JSON Schema metaschema/ref fixtures, OpenAPI 3.1 validation, TS contract compile |
| `auth-hostile` | session/CSRF/throttle/enumeration/route tests |
| `tenant-hostile` | IDOR, cross-tenant, owner/entitlement/lifecycle tests |
| `campaign-hostile` | continuity, sequence, idempotency, replay, anonymous claim/leaderboard |
| `boarding-hostile` | golden server replay, forged traces/counters/tokens and concurrency |
| `runtime-browser` | real Phaser six-level/Boarding/player flows |
| `admin-browser` | login, portals, catalogue, asset chooser, draft/validate/preview |
| `docker-smoke` | clean database seed, web/API/assets, same-origin auth and health |

## Auth/security

- unauthenticated admin URL shows login before shell/data;
- correct credentials establish session; wrong user/password share generic response;
- logout invalidates access and sensitive cached data;
- CSRF missing/wrong rejected on every mutation;
- normal player and Business Admin denied Platform portal/global APIs;
- Platform Admin denied core publish/entitlement unless expressly delegated;
- cookie flags verified under production settings;
- external/open `next` redirect rejected;
- registration/login throttle and bounded body proven;
- usernames/display names collide case-insensitively;
- no secrets/capabilities/password hashes in API/log/evidence.

## Tenant/platform authority

- organisation A cannot list/read/update/delete organisation B object by UUID, search or nested serialization;
- Editor cannot manage memberships/entitlements;
- Business Admin cannot alter CORE game or Platform roles;
- entitlement enables only named feature and expiry/suspension denies mutation without data deletion;
- ownership scope/FKs cannot be changed after creation;
- last Business Admin and last Platform Owner protections pass;
- permitted/denied material operations create safe audit events.

## Campaign Designer

- authenticated authorised load returns real project and Level list;
- backend unavailable shows retry, not raw `Failed to fetch` or fake empty shell;
- each palette category opens thumbnail chooser;
- keyboard and pointer/touch select/place paths work;
- placement persists stable AssetRecord ID and typed properties;
- actual images render in canvas;
- stale concurrent save returns conflict;
- invalid/missing/retired/cross-tenant asset blocks validation/publish;
- same-runtime preview loads exact draft checksum and is unranked;
- published version immutable; clone/new draft/publish/rollback audited.

## Levels and campaign

- clean DB seeds exactly six official active published levels in sequence;
- all six packaged/DB checksums reconcile;
- material fingerprint proves distinct content;
- Level 1 exact 58 enemies/256 shield tiles;
- Level 4 exact eligible Boarding anchor;
- play Level 1→6 via Continue with cumulative score/lives/nukes;
- no config repeats incorrectly;
- replay resets entry snapshot and cannot duplicate score/pickups;
- menu/resume preserves active campaign;
- double Continue and concurrent complete produce one checkpoint;
- sequence skip, wrong release/version/checksum/seed/digest rejected;
- final Level 6 yields one terminal campaign result.

## Accounts, claims and leaderboard

- anonymous online campaign validates but creates no visible leaderboard entry;
- offline/local campaign is clearly unranked and not claimable;
- register and login paths can claim the caller's eligible online campaign;
- valid claim publishes once using server campaign score;
- wrong, expired, reused, guessed, cross-session and already-owned claims rejected;
- forged score in claim request is impossible because no score field exists;
- authenticated run ranks after accepted policy;
- top ten contains only best visible eligible entry per player with deterministic ties;
- suppression/restore and audit still pass.

## Boarding

- only eligible Level 4 source offers Boarding;
- offer lasts 8 seconds and requires envelope plus interact;
- decline/expiry returns normal Shooter path without duplicate score;
- API failure restores exact Shooter state;
- movement/jump/collision/fire/enemy/hit/respawn/container/pickup/exit work;
- keyboard/touch/Xbox-common/Haute inputs use same action abstraction;
- success returns exact resources/source removal;
- timeout loses one life; last-life timeout reaches Game Over;
- server replay derives outcome/counters/resources;
- changed ordering/timing/movement/fire rate/counter/digest/checksum/capability rejected;
- accepted/rejected submissions immutable and duplicate/concurrency safe;
- return state applies exactly once;
- production images/frames/tiles/HUD are visible without checkerboards.

## Docker/browser evidence

Run from clean Docker volumes as well as migrated H014-shaped DB. Required captured journeys:

1. anonymous official campaign start, Levels 1→2 score carry;
2. anonymous validated result → register → claim → top-ten/personal state;
3. explicit admin login → Campaign → image chooser → place → save → validate → same-runtime preview;
4. Platform Owner Businesses/Users/Scores/Logs;
5. Business Admin isolated portal with forbidden global access;
6. Levels 1–6 identity snapshots;
7. Boarding offer, gameplay, success return, timeout return and last-life Game Over.

For each journey store viewport, URL, final SHA, console errors, network failures, screenshot and asserted application state. Expected deliberately synthetic offline-origin failure may be classified only by exact configured test origin; real API failures fail CI.

## Acceptance gate

| Gate | Required |
|---|---|
| Entry/currentness | PASS |
| Model/migration integrity | PASS |
| Schema/OpenAPI/type reconciliation | PASS |
| Auth/admin route | PASS |
| Platform/tenant isolation | PASS |
| Image-driven editor | PASS |
| Distinct official Levels 1–6 | PASS |
| Campaign continuity | PASS |
| Anonymous/register/claim/leaderboard | PASS |
| Boarding complete/server-replayed | PASS |
| Artwork integration | PASS |
| Offline official gameplay | PASS |
| Docker/local CI/remote CI | PASS |
| Worktree/local-remote/PR/governance | PASS |
| Founder manual acceptance | PENDING at Development return |

Development must return FAIL or CONDITIONAL PASS if any mandatory gate is not proven; it may not redefine the gate or defer it without Founder authority.

