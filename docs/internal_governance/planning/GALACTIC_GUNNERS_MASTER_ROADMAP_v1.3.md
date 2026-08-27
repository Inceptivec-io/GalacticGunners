# GALACTIC GUNNERS MASTER ROADMAP v1.3
## Protected Gamification Platform, Persistent Campaign and Extensible Content Baseline

**Product:** Galactic Gunners: Final Assault™  
**Institutional arm:** Inceptivec Gamification  
**Technical/Product authority:** Galactic Gunners CTO  
**Final acceptance authority:** Founder / Secuvara CTAIO  
**Version:** v1.3 — PROPOSED SOLE CURRENT ROADMAP ON H015 ADMISSION  
**Supersedes and absorbs:** `GALACTIC_GUNNERS_MASTER_ROADMAP_v1.2.md`

## 0. Currentness

On admission, move Roadmap/Playlist v1.2 unchanged to `docs/internal_governance/planning/_archive/v1.2/`. The planning root shall then contain exactly one current Roadmap and one current Playlist: v1.3. Preserve historical identities and evidence; do not rewrite v1.2.

v1.3 preserves the config-driven Phaser/Django/Next.js direction of v1.2 and adds the H015 platform, ownership, persistence, account, asset-library and Boarding-completion authority.

## 1. Current programme position

H013 delivered the validated-run and leaderboard foundation. H014 delivered the Boarding foundation and was Founder-accepted with known items deferred. PR #11 merged to `dev` at `3270be64c67863dc848ebad26e2a33daf8b70742`.

The next sequence is:

```text
H015 PLATFORM FOUNDATION + CAMPAIGN CONTINUITY + BOARDING COMPLETION
  ↓
H016 NATIVE CLIENTS + CROSS-CLIENT CONTRACT
  ↓
H017 COMMERCIAL RELEASE PLATFORM + OPERATIONS
  ↓
H018 FINAL REGRESSION + ACCESSIBILITY + RELEASE
```

The former H015/H016/H017 identifiers shift by one. Their substance remains planned, not authorised during H015.

## 2. Product model

Galactic Gunners is both:

1. one canonical official game maintained by Inceptivec; and
2. the reference product for a protected Inceptivec Gamification authoring platform.

The platform must permit future paid organisations and players to create isolated games/maps without mutating the official campaign or creating uncontrolled copies of its release authority.

```text
INCEPTIVEC CORE GAME
├── official release
├── official Levels 1–6
├── core asset catalogue
└── Founder-controlled publication

TENANT / USER CONTENT
├── explicit owner
├── isolated drafts and releases
├── entitlement-controlled features
└── optional reference to a pinned core release
```

## 3. Architecture

- Phaser + TypeScript: all moment-to-moment Shooter and Boarding gameplay.
- Next.js/React: public product shell, account surfaces and protected portals.
- Django/DRF: identity, permissions, organisations, entitlements, content lifecycle, run validation, leaderboard and audit.
- PostgreSQL: authoritative durable state.
- JSON Schema/OpenAPI: fail-closed machine-readable contracts.
- One generic combat runtime and one Boarding scene family; content differences are declarative.

No browser-to-database access, arbitrary executable level content, React gameplay rewrite or new service fleet.

## 4. Authority tiers

| Tier | Scope |
|---|---|
| Platform Owner | Global games, official Levels 1–6, releases, organisations, platform assignments and entitlements |
| Platform Admin | Delegated operations only; no implicit owner or global publish authority |
| Business Admin | Own organisation, memberships and entitled custom projects only |
| Editor | Draft/edit/validate permitted organisation or personal content; publishing only when separately granted |
| Player | Account, campaigns and validated score ownership |
| Anonymous | Free official play and server validation, but no leaderboard publication |

Platform roles use Django permissions/groups. Organisation roles use organisation memberships. Paid capability uses entitlements. These concerns must not be collapsed.

## 5. Ownership and isolation

Every game project and non-core asset has an `owner_scope`:

- `CORE`: platform-owned, globally consumable, writable/publishable only through Platform Owner permissions.
- `ORGANIZATION`: owned by exactly one organisation.
- `USER`: owned by exactly one user; initially disabled unless entitlement permits.

Ownership is immutable after creation. Moving content between scopes requires an explicit audited copy/promotion operation; never change owner fields in place.

Visibility is separate: `PRIVATE`, `ORGANIZATION`, `UNLISTED`, `PUBLIC`. Lifecycle is separate: `DRAFT`, `VALIDATED`, `PUBLISHED`, `SUPERSEDED`, `ARCHIVED`.

## 6. Canonical games and releases

`GameProject` is the stable game identity. `GameRelease` is an immutable published set of exact Shooter/Boarding definition checksums and an asset-manifest checksum.

The official game has one `CORE` project with a stable slug. Official Levels 1–6 belong to it. Custom projects may pin `base_release`, but never alter it. Upgrade is explicit, validated and audited.

## 7. Shooter and Boarding configuration

Shooter levels remain `Level` + immutable `LevelVersion`. Boarding interiors remain `Interior` + immutable `InteriorVersion`. Both belong to a `GameProject`, use exact schema versions/checksums and reference registered asset IDs.

At least six official published Shooter configurations must be materially distinct in topology/content, not only slug/name/seed. Level 4 contains the governed Boarding anchor. The same definitions are available as packaged offline fallbacks with matching checksums.

## 8. Campaign continuity

Introduce `CampaignRun` as the aggregate for one campaign attempt. Per-level `GameRun` records attach to it.

Authoritative state:

```text
campaign score = cumulative accepted score deltas
lives          = remaining lives carried between levels
nukes          = remaining nukes carried, capped globally
next sequence  = first incomplete official level
release        = pinned exact GameRelease
```

Continue starts the next level from the accepted campaign checkpoint. Replay resets only the current level to its entry snapshot and cannot duplicate rewards. Main Menu preserves a non-terminal campaign for resume. New Campaign is the only ordinary reset to Level 1 defaults.

Campaign state updates and level completion validation occur atomically with row locks and idempotency.

## 9. Identity and score ownership

Anonymous play is allowed. Anonymous campaigns receive an unguessable capability held by the current browser session; only its hash is stored. They remain unranked.

Registration/login uses Django identity and secure session cookies. Usernames and public display names are case-insensitively unique. Passwords use Django hashers and validation. No credential is committed or stored in localStorage.

An authenticated user may claim an anonymous campaign only when:

- the presented claim capability matches;
- the campaign is unowned;
- all leaderboard-relevant runs are server validated;
- the claim has not been used;
- ownership is assigned atomically.

A valid claimed or authenticated campaign can create one leaderboard entry. Client-submitted score is never claim authority.

## 10. Administration and portals

Required protected routes:

- Platform Owner/operations portal: Campaign, Businesses, Users, Scores and Logs.
- Business portal: organisation overview, members, games/maps and permitted assets.
- Player account: profile, campaigns and scores.
- Campaign Designer: game/level selection, image-driven asset chooser, canvas, inspector, validation, preview and lifecycle controls.

An unauthenticated admin-route request must reach an explicit login surface before privileged UI or data. An authenticated but unauthorised user receives a deliberate 403 surface. A backend failure produces a recoverable service error—not an empty privileged shell.

## 11. Image-driven authoring

Selecting a palette category opens a searchable drawer/modal of registered asset thumbnails. Drag/drop or select/place adds a typed object to the draft. The saved configuration stores `asset_id`, semantic type, transform, layer and allowed properties. It does not store arbitrary URLs or code.

Required initial categories: player, enemy/formation, bunker, shield, hazard, pickup, objective and Boarding anchor; Boarding editor additionally exposes tile, platform, door, container, enemy, pickup and effect categories.

Same-runtime preview loads the exact draft through validation and the Phaser runtime; it is not a separate schematic renderer.

## 12. Entitlements and connected applications

`BusinessEntitlement` grants named capabilities and limits to an organisation, such as `CUSTOM_GAMES`, `PRIVATE_MAPS`, `CONNECTED_APP`, or `USER_MAPS`. Entitlements never grant platform permissions.

H015 builds the entitlement model and protected API checks only. Billing, OAuth client issuance and external connected-app onboarding remain later work.

## 13. Boarding completion

H015 completes the H014 subsystem:

- eligible disabled ship and eight-second entry offer in Shooter;
- proximity plus explicit interact confirmation;
- complete deterministic Shooter snapshot/digest;
- API start before Boarding admission;
- keyboard/touch/gamepad through `InputSystem`;
- platforms/walls, jump, fire, aliens, projectiles, damage, invulnerability, containers, pickups, exit and timer;
- success/timeout/death/abort terminal paths;
- server replay of bounded event/input trace against exact interior/seed;
- exact once-only return application to Shooter and campaign resources;
- production sprites, tiles, props, HUD and effects;
- evidence for real entry, play, outcomes and return.

Boarding-specific score remains zero until separately authorised. LIFE/NUKE rewards remain bounded and server-derived.

## 14. Security

- Same-origin browser API path in normal deployment/local Docker.
- Secure, HttpOnly, SameSite session cookie; CSRF protection on mutations.
- Restrictive CORS/CSRF allowlists where cross-origin development is unavoidable.
- Login and registration throttling; bounded bodies; generic login failure.
- Object-level organisation/ownership checks on every tenant object.
- Platform Owner permission required for global release and entitlement mutation.
- Append-only audit for auth security, roles, membership, content lifecycle, moderation and claim events.
- No secrets, raw capabilities or passwords in logs/evidence.

## 15. Observability and audit

Structured events must identify correlation ID, event name, actor or anonymous marker, object identity, result and safe detail. Required areas: auth, organisation membership, entitlement, content lifecycle, campaign/run validation, score claim/publication, Boarding validation and admin failures.

## 16. Offline/degraded behaviour

Official packaged gameplay remains available offline. Offline or backend-unreachable sessions are explicitly local and unranked; they cannot later become ranked unless a separately validated durable protocol exists. Admin/editor mutations require backend authority and fail safely with retry guidance.

## 17. Compatibility foundations

H015 preserves future multiplayer/connected-app compatibility through stable organisation, game project, release, level version, campaign run, player and entitlement identities. It does not implement multiplayer networking.

## 18. H015 exit gate

```text
AUTH/ROUTE PROTECTION                 = PASS
PLATFORM/TENANT OBJECT AUTHORIZATION = PASS
CAMPAIGN DESIGNER DATA + ART         = PASS
DISTINCT DB LEVELS 1–6               = PASS
CAMPAIGN CONTINUITY                  = PASS
ANONYMOUS UNRANKED                   = PASS
REGISTER/LOGIN/CLAIM                 = PASS
SERVER-VALIDATED LEADERBOARD         = PASS
BOARDING COMPLETE + REPLAYED         = PASS
OFFLINE OFFICIAL PLAY                = PASS
DOCKER + BROWSER + HOSTILE + CI      = PASS
FOUNDER ACCEPTANCE                   = PENDING AT RETURN
```

## 19. Later roadmap

### H016 — Native clients

Tauri Windows and Capacitor Android/iOS wrappers around the same game core, secure native storage, lifecycle/safe-area/input and build evidence.

### H017 — Commercial release platform

Stage/prod deployment, provider secrets, observability, backup/restore, legal/support/credits, operations and release controls.

### H018 — Final regression and release

Full campaign/platform/native regression, accessibility, performance, security, UI/UX snag closure, Founder stage acceptance, production promotion and release evidence.

## 20. Permanent doctrine

```text
ONE OFFICIAL CORE
+ ISOLATED OWNED CUSTOM CONTENT
+ VERSIONED DECLARATIVE DEFINITIONS
+ SERVER-AUTHORITATIVE IDENTITY AND SCORES
+ PHASER-OWNED GAMEPLAY
+ TESTED RELEASE PROMOTION
```
