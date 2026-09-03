# H015 Domain Model and Migration Specification

Permanent model/module names are semantic; do not include `H015` in production class names.

## 1. Identity

### `accounts.User` — extend existing

Retain UUID PK and Django `AbstractUser`. Add database constraint:

```python
UniqueConstraint(Lower("username"), name="account_username_ci_unique")
```

Normalize username with trim and Unicode NFKC before validation. Accepted v1 username: 3–30 characters, ASCII letters/digits/underscore/hyphen; first character alphanumeric. Email is optional for play, never public and unique only when nonblank if used for recovery. Use Django password validators/hashers.

### `players.PlayerProfile` — extend existing

- retain one-to-one `user`, UUID, moderation and leaderboard fields;
- `display_name`: 3–20 characters, trimmed; case-insensitive DB uniqueness using `Lower`;
- retain reserved-name rejection;
- add `status`: `ACTIVE|SUSPENDED|DELETED_PENDING` default `ACTIVE`;
- never expose email through public serializers.

## 2. Organisations and authorisation

### `organizations.Organization`

| Field | Type/rule |
|---|---|
| `id` | UUID PK |
| `slug` | slug 3–64, case-insensitive unique |
| `name` | string 1–128 |
| `status` | `ACTIVE|SUSPENDED|ARCHIVED` |
| `created_by` | protected FK User |
| timestamps | created/updated |

### `organizations.OrganizationMembership`

| Field | Type/rule |
|---|---|
| `id` | UUID PK |
| `organization` | protected FK |
| `user` | protected FK |
| `role` | `BUSINESS_ADMIN|EDITOR|PLAYER` |
| `status` | `ACTIVE|SUSPENDED` |
| `created_by` | nullable protected FK User |
| timestamps | created/updated |

Constraints: unique `(organization,user)`; actor may not grant a role beyond their policy; last active Business Admin cannot remove/demote themselves without Platform Owner override.

### Platform permissions

Use Django groups/permissions, not a second identity system:

- group `Platform Owners`: `platform.manage_platform`, `platform.publish_core`, `platform.manage_organizations`, `platform.manage_entitlements`, `platform.manage_roles`, plus operational permissions;
- group `Platform Admins`: delegated operational permissions only; explicitly exclude the five owner permissions above unless Founder assigns one directly.

`is_superuser` remains break-glass technical authority, is never granted by API and every use is audited. Seed/bootstrap credentials remain environment-bound.

### `organizations.BusinessEntitlement`

| Field | Type/rule |
|---|---|
| `id` | UUID PK |
| `organization` | protected FK |
| `feature` | `CUSTOM_GAMES|PRIVATE_MAPS|CONNECTED_APP|USER_MAPS` |
| `status` | `ACTIVE|SUSPENDED|EXPIRED` |
| `limits` | JSON object, schema-validated; default `{}` |
| `starts_at` | timestamp |
| `ends_at` | nullable timestamp |
| `granted_by` | protected FK User |
| timestamps | created/updated |

Unique active `(organization,feature)`; entitlement confers capability only and never a role/permission.

## 3. Game and content ownership

### Shared enums

```text
OwnerScope = CORE | ORGANIZATION | USER
Visibility = PRIVATE | ORGANIZATION | UNLISTED | PUBLIC
Lifecycle = DRAFT | VALIDATED | PUBLISHED | SUPERSEDED | ARCHIVED
```

### `games.GameProject`

| Field | Type/rule |
|---|---|
| `id` | UUID PK |
| `slug` | slug 3–64; unique within effective owner scope |
| `name` | string 1–128 |
| `owner_scope` | OwnerScope |
| `organization` | nullable protected FK |
| `owner_user` | nullable protected FK |
| `visibility` | Visibility |
| `status` | `ACTIVE|ARCHIVED` |
| `base_release` | nullable protected FK GameRelease |
| `created_by` | protected FK User |
| timestamps | created/updated |

Check constraints:

```text
CORE         => organization NULL AND owner_user NULL
ORGANIZATION => organization SET  AND owner_user NULL
USER         => organization NULL AND owner_user SET
```

Owner scope and owner FKs are immutable. One seeded project uses slug `galactic-gunners-final-assault`, scope CORE and visibility PUBLIC.

### `games.GameRelease`

| Field | Type/rule |
|---|---|
| `id` | UUID PK |
| `game_project` | protected FK |
| `version` | SemVer string 1–32 |
| `status` | `DRAFT|VALIDATED|PUBLISHED|SUPERSEDED|ARCHIVED` |
| `manifest` | JSON matching `GameReleaseManifest` schema |
| `checksum` | lowercase SHA-256 over canonical manifest |
| `created_by`, `published_by` | nullable protected FK User |
| timestamps | created/published |

Unique `(game_project,version)`. Published manifest/checksum/project/version are immutable. A manifest contains ordered exact LevelVersion and InteriorVersion UUID/version/checksum references plus asset-manifest checksum.

### Existing `levels.Level` — extend

- add non-null `game_project` protected FK after data migration;
- replace global slug uniqueness with unique `(game_project,slug)`;
- unique `(game_project,campaign,sequence)` for non-archived official ordering;
- retain `active_version`, archive and validation;
- `active_version` must belong to the same Level.

### Existing `levels.LevelVersion` — extend

- retain config, checksum, version, schema version, seed policy, lifecycle and immutability;
- add optional `validation_report` JSON;
- validate every `asset_id` against registry and actor/project policy before VALIDATED/PUBLISHED;
- publish inside transaction with Level row lock and audit;
- no bulk `.update()` may bypass immutable publication rules without an explicit audited lifecycle service.

### Existing Boarding `Interior` / `InteriorVersion` — extend

- `Interior.game_project` non-null protected FK after data migration;
- unique `(game_project,slug)`;
- InteriorVersion lifecycle becomes the same five-state lifecycle;
- add `schema_version`, `created_by`, `published_by`, `validation_report`, `supersedes`;
- checksum computed server-side from canonical definition, never accepted as client authority;
- published definition/checksum/identity immutable.

## 4. Asset catalogue

### `assets.AssetCategory`

`id` UUID; stable unique `code`; `name`; `editor_mode` (`SHOOTER|BOARDING|BOTH`); `object_type`; `sort_order`; `active`; timestamps.

Initial codes:

```text
PLAYER ENEMY FORMATION BUNKER SHIELD HAZARD PICKUP OBJECTIVE BOARDING_ANCHOR
BOARDING_TILE BOARDING_PLATFORM BOARDING_DOOR BOARDING_CONTAINER BOARDING_ENEMY BOARDING_EFFECT
```

### `assets.AssetRecord`

| Field | Rule |
|---|---|
| `id` | UUID PK, stable config reference |
| `key` | stable semantic string, unique in effective owner scope |
| `category` | protected FK |
| ownership | same scope/owner checks as GameProject |
| `visibility` | Visibility |
| `status` | `DRAFT|ACTIVE|RETIRED|REJECTED` |
| `runtime_path`, `thumbnail_path` | application-relative allowlisted paths; no scheme/host/traversal |
| `mime_type` | allowlisted image/audio types |
| `width`, `height`, `frame_width`, `frame_height`, `frame_count` | bounded positive integers as applicable |
| `animation` | validated JSON object |
| `collider` | validated JSON object |
| `checksum` | lowercase SHA-256 |
| `provenance_ref` | required governed reference |
| timestamps/actors | created/updated/retired |

Runtime binary replacement with a new checksum creates a new AssetRecord/versioned key; do not silently mutate active production bytes.

## 5. Campaign and per-level runs

### `game_runs.CampaignRun`

| Field | Type/rule |
|---|---|
| `id` | UUID PK |
| `game_release` | protected FK; immutable after start |
| `player` | nullable protected FK User |
| `anonymous_capability_hash` | nullable lowercase SHA-256; never serialized |
| `status` | `ACTIVE|COMPLETED|FAILED|ABANDONED|REJECTED` |
| `next_sequence` | integer 1–7 |
| `score` | non-negative integer, cumulative server accepted |
| `lives` | integer 0–3 |
| `nukes` | integer 0–2 |
| `seed_root` | unsigned 32-bit integer |
| `validation_state` | `PENDING|VALID|REJECTED` |
| `claim_expires_at`, `claimed_at` | nullable timestamps |
| timestamps | started/updated/completed |

Constraints:

- exactly one of authenticated ownership or anonymous capability exists at start;
- `next_sequence=7` only for terminal campaign;
- completed/failed/rejected state is immutable except audited moderation visibility, not score/state;
- raw capability generated with at least 256 bits, returned only at anonymous creation/claim rotation and stored hashed with server pepper where available.

### Existing `game_runs.GameRun` — extend and clarify

Add:

- `campaign_run` non-null for new runs;
- `sequence` 1–6;
- `attempt` positive integer;
- `entry_score`, `entry_lives`, `entry_nukes`;
- `score_delta`, `exit_score`, `exit_lives`, `exit_nukes`;
- `entry_state_digest`, `exit_state_digest` lowercase SHA-256;
- `status`: retain pending/valid/rejected semantics with one terminal submission.

Unique `(campaign_run,sequence,attempt)`. Only one active attempt per campaign. Current legacy `score` is migrated/preserved as accepted level score evidence, then API semantics explicitly use `score_delta` and `campaign_score`; no silent meaning change.

### `game_runs.CampaignClaimEvent`

Append-only record: UUID, campaign, actor user, result (`CLAIMED|REJECTED`), safe reason code, correlation ID, created timestamp. Never record raw capability.

### Leaderboard migration

Extend `LeaderboardEntry` with nullable `campaign_run` initially, populate eligible terminal campaign entries, then require it for new entries. One visible entry per campaign. Preserve legacy `run` relation during migration for provenance. Ranking:

```text
score DESC
campaign_level_reached DESC
accepted_at ASC
campaign_run UUID ASC
```

One best visible result per player for the public table.

## 6. Audit

### `audit.PlatformAuditEvent`

Append-only: UUID; correlation ID; actor nullable; actor kind `USER|ANONYMOUS|SYSTEM`; organisation nullable; action stable code; target type/id; result `SUCCESS|DENIED|FAILED`; reason code; redacted detail JSON; request timestamp; created timestamp.

No update/delete through application API. Database retention policy is later operational authority.

## 7. Migration order

1. Add new apps/tables and nullable FKs/fields.
2. Seed permission/group definitions without credentials.
3. Seed CORE project and asset categories.
4. Register existing production assets with governed checksums/provenance.
5. Attach existing Levels/Interiors to CORE project.
6. Re-author/seed six distinct published official levels and matching packaged fallbacks.
7. Backfill schema/lifecycle fields and validate all checksums.
8. Introduce CampaignRun and new GameRun fields; retain legacy run/leaderboard data.
9. Add validated constraints/indexes after successful backfill.
10. Never delete legacy evidence in H015. Document later cleanup separately.

Migrations must be deterministic, idempotent where seeding is involved, transaction-safe and tested on empty plus H014-shaped databases.

## 8. Service boundaries

All lifecycle and aggregate updates use semantic services:

- `AuthorizationPolicy`
- `ContentLifecycleService`
- `CampaignService`
- `CampaignClaimService`
- `LeaderboardPublicationService`
- `BoardingValidationService`
- `AuditService`

Views/serializers validate transport and call services. Do not scatter role strings, publication transitions, campaign arithmetic or claim logic across UI/views.

