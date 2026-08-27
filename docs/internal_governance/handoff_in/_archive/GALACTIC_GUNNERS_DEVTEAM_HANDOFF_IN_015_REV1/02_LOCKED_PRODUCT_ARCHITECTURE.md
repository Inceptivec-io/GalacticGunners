# Locked Product Architecture

## Three administration surfaces

| Surface | Product route | Identity and eligibility | Authority |
|---|---|---|---|
| Inceptivec Gamification Admin Dashboard | `/inceptivec-gamification-admin` | active Django user plus platform permission | CORE game, global platform and governed support operations |
| Customer Command Post | `/command-post` | active Django user plus active organisation membership | owning organisation's maps, games, people, scores and entitlements only |
| Django Admin | backend `/django-admin/` | `is_active && is_staff && is_superuser` | local technical recovery/development only |

Django Admin is never linked from public, account, Command Post or Inceptivec navigation. Route obscurity is not security. At Stage and Production, `ENABLE_DJANGO_ADMIN=false` means the URL pattern is not registered and reverse-proxy routing must not expose it.

## Shared engine, different publication effects

Both administration products call the same Django lifecycle services, validate the same schemas, choose from authorised assets and preview through the same Phaser runtime.

| Actor/scope | May create | Publish effect |
|---|---|---|
| Inceptivec CORE authority | official levels, Boarding interiors, campaigns and releases | changes a new version of the canonical master game after validation and explicit CORE publication |
| Command Post organisation authority | organisation maps, interiors and custom campaigns | changes only that organisation's game project/release; never changes CORE |

Ownership is enforced by database constraints and query policy before object retrieval. UI filtering is not sufficient.

## Enduring vocabulary

| Term | Definition |
|---|---|
| `GameProject` | ownership container: CORE, ORGANIZATION or USER |
| `Map` | customer-facing label for one `Level`; a `LevelVersion` is one immutable/draft version of that map |
| `Interior` | Boarding configuration associated with a project |
| `Campaign` | ordered, expandable set of exact published level versions |
| `GameRelease` | immutable published snapshot pinning campaign, levels, interiors and asset manifest |
| `CampaignRun` | one player's attempt against one pinned release/campaign version |
| `GameRun` | one level attempt within a CampaignRun |

## Official campaign rule

The seeded CORE campaign contains six entries at H015 acceptance. Six is a content baseline, not a schema, API, UI or runtime maximum. Admin can append, insert, reorder and retire campaign entries only by creating and publishing a new immutable campaign/release version. Existing runs remain pinned to their original release.

Campaign order is determined from `CampaignEntry.position`, not from a hard-coded scene number. The next entry is resolved by the pinned manifest. Final completion occurs when no later entry exists.

## Command Post scope

Required lightweight navigation:

- Overview;
- My Organisation;
- My Maps;
- My Games/Campaigns;
- Game Setup/Designer;
- Scores;
- Profile and approved avatar;
- Members for Business Admin;
- Plan and entitlement summary;
- Help and logout.

It must not expose global businesses, global users, global audit, CORE release mutation, platform permissions or another organisation's identifiers/counts.

## Plans and future capability foundation

The initial plan catalogue is configuration, not billing code:

| Code | Customer name | Active non-archived map limit | Dual-player capability |
|---|---|---:|---|
| `SPACE_CADET` | Space Cadet | 5 | reserved, unavailable in H015 |
| `STAR_GUNNER` | Star Gunner | 100 | reserved, unavailable in H015 |
| `FLEET_COMMANDER` | Fleet Commander | 250 | reserved, unavailable in H015 |
| `GALACTIC_LEGEND` | Galactic Legend | 500 | reserved, unavailable in H015 |

Every tier may receive two-player mode when the capability is separately released. H015 must not display it as available. Commercial price/currency/billing identifiers remain nullable/unset until later authority.

Map quota counts distinct non-archived organisation-owned `Level` rows. Versions do not consume additional map allowance. Create, clone-to-new-map and unarchive enforce the limit transactionally. Editing, versioning and archiving an existing authorised map do not consume another slot.

Reserved future visibility values are `PRIVATE`, `ORGANIZATION`, `INVITE_ONLY`, `UNLISTED` and `PUBLIC`. In H015, PUBLIC organisation publication is denied; invite/unlisted external access remains inactive. Stable enums may exist without active routes.

Reserved play modes are `SOLO`, `DUAL_COOP` and `DUAL_VERSUS`. Only `SOLO` is executable in H015. Unknown or inactive modes fail closed.

