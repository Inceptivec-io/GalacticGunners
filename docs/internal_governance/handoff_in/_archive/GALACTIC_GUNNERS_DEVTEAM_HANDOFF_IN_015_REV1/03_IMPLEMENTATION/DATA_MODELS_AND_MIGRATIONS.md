# Data Models and Migration Delta

This document extends the original H015 model specification. Permanent class names are semantic and contain no handoff identifiers.

## `campaigns.Campaign`

| Field | Rule |
|---|---|
| `id` | UUID primary key |
| `game_project` | protected FK `GameProject`; immutable |
| `slug` | 3–64; unique per project, case-insensitive |
| `name` | 1–128 |
| `status` | `ACTIVE|ARCHIVED` |
| `created_by` | protected FK User |
| timestamps | created/updated |

Seed one CORE campaign: `final-assault`, belonging to the existing CORE project.

## `campaigns.CampaignVersion`

| Field | Rule |
|---|---|
| `id` | UUID primary key |
| `campaign` | protected FK |
| `version` | positive integer, unique with campaign |
| `lifecycle` | original five-state lifecycle |
| `schema_version` | `1.0` for H015 |
| `checksum` | server-computed canonical SHA-256 |
| `validation_report` | validated JSON |
| `created_by`, `published_by` | protected nullable FKs as appropriate |
| timestamps | created/published |

Published identity, campaign, entries and checksum are immutable.

## `campaigns.CampaignEntry`

| Field | Rule |
|---|---|
| `id` | UUID primary key |
| `campaign_version` | protected FK |
| `position` | positive integer |
| `level_version` | protected FK exact version |
| `entry_kind` | `SHOOTER` in H015; reserve `BOARDING_ONLY` without enabling it |
| `required` | boolean default true |
| `transition` | validated JSON matching contract |

Constraints: unique `(campaign_version, position)` and unique `(campaign_version, level_version)` unless future repeat authority explicitly permits repetition. Position need not be contiguous while drafting; validation/publish requires the ordered set to be contiguous beginning at 1.

## `plans.ServicePlan`

| Field | Rule |
|---|---|
| `id` | UUID primary key |
| `code` | stable unique enum-like code |
| `display_name` | customer-facing name |
| `status` | `DRAFT|ACTIVE|RETIRED` |
| `limits` | schema-validated object |
| `capabilities` | schema-validated object |
| `sort_order` | non-negative integer |
| timestamps/actors | created/updated |

Code is immutable. A changed commercial offer creates/updates validated configuration under Platform Owner audit; active organisation assignments retain an exact `plan_snapshot`.

## `plans.OrganizationPlanAssignment`

| Field | Rule |
|---|---|
| `id` | UUID primary key |
| `organization` | protected FK |
| `plan` | protected FK |
| `status` | `ACTIVE|SUSPENDED|ENDED` |
| `plan_snapshot` | immutable validated snapshot at assignment/change |
| `starts_at`, `ends_at` | bounded timestamps |
| `assigned_by` | protected FK User |
| `reason` | required 1–240 for privileged change |
| timestamps | created/updated |

At most one current ACTIVE assignment per organisation. H015 has no payment status or external subscription identifier.

Existing `BusinessEntitlement` remains the explicit override/grant mechanism. Effective capability is calculated by `EntitlementService` from the active plan snapshot plus explicit grants/suspensions. A denial/suspension always wins over an allowance.

## Campaign run replacement fields

Replace fixed-sequence assumptions:

- `CampaignRun.campaign_version` protected FK, immutable after start;
- `CampaignRun.current_entry` nullable protected FK `CampaignEntry`;
- `CampaignRun.next_entry` nullable protected FK `CampaignEntry`;
- `CampaignRun.completed_entry_count` non-negative integer;
- retain cumulative score/lives/nukes and release pinning;
- terminal campaign requires `next_entry IS NULL` and terminal status;
- active campaign requires `next_entry IS NOT NULL` unless an attempt for the last entry is active.

`GameRun` gains `campaign_entry` protected FK and `attempt` positive integer. A derived `position` may be serialized for UI, but position is not identity. Remove database/API maxima of 6 or 7. Keep a reasonable configurable safety maximum for a published campaign (default 10,000 entries) to prevent abuse; it is not a product limit.

## Level/map quota enforcement

`MapQuotaService.create_map()` and `unarchive_map()` must:

1. lock the organisation and active plan assignment;
2. resolve effective `active_map_limit`;
3. count non-archived ORGANIZATION `Level` rows for the organisation;
4. deny at limit with `MAP_LIMIT_REACHED` and current/limit values safe for that organisation;
5. create/unarchive atomically;
6. append audit event.

No frontend count is authority. CORE and USER scopes are not counted against organisation plans.

## Migration order

1. Preserve any already-created H015 tables/migrations; inspect before naming new migrations.
2. Add Campaign/CampaignVersion/CampaignEntry and plan tables.
3. Seed four plans idempotently using the supplied seed JSON.
4. Seed CORE campaign and a draft/published version containing exact Levels 1–6 after those versions exist.
5. Backfill CampaignRun/GameRun references where deterministic; preserve legacy rows otherwise with documented nullable provenance.
6. Remove fixed maximum validators/constraints only after replacement fields and services pass.
7. Add final constraints and indexes.
8. Test clean database and H014-shaped migration paths.
9. Never delete prior run, score, level, Boarding or evidence records in H015.

