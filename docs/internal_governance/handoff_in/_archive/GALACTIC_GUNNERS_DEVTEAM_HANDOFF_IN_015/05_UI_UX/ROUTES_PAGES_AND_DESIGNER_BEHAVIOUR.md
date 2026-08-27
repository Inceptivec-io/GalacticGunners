# Routes, Pages and Campaign Designer Behaviour

Preserve the accepted dark Campaign Designer composition. Correct function/data/art/auth; do not replace its visual direction.

## Route map

| Route | Audience | Required behaviour |
|---|---|---|
| `/` | public | product entry and Play call-to-action |
| `/play` | public | official/new/resume campaign; anonymous allowed |
| `/leaderboard` | public | top ten first, paginated results; account CTA |
| `/account/login` | anonymous | username/password, optional pending score claim |
| `/account/register` | anonymous | unique username/display name/password, optional claim |
| `/account` | player | profile, campaigns, personal best, logout |
| `/inceptivec-gamification-admin/login` | anonymous | explicit protected-portal login |
| `/inceptivec-gamification-admin` | Platform Owner/Admin | overview; never render shell before session/permission result |
| `/inceptivec-gamification-admin/campaign` | authorised platform | projects, releases, Levels/Interiors and Designer |
| `/inceptivec-gamification-admin/businesses` | Platform Owner/delegate | organisations, memberships, entitlement state |
| `/inceptivec-gamification-admin/users` | authorised platform | safe user/profile/role/status operations |
| `/inceptivec-gamification-admin/scores` | moderator | top ten, entries, rejected runs, suppress/restore |
| `/inceptivec-gamification-admin/logs` | authorised platform | bounded/filterable audit/runtime failures |
| `/gamification` | authenticated member | business selector/landing |
| `/gamification/{org}/games` | organisation member | own entitled projects only |
| `/gamification/{org}/members` | Business Admin | own memberships only |
| `/gamification/{org}/editor/{project}` | Admin/Editor | own project Designer |

## Route states

Every protected page has exactly these deliberate states:

1. `CHECKING_SESSION`: neutral branded loading, no privileged data/navigation.
2. `UNAUTHENTICATED`: redirect to login with allowlisted relative `next` value.
3. `AUTHENTICATED_UNAUTHORISED`: 403 page with safe account/menu/logout actions.
4. `AVAILABLE`: render only server-authorised data/actions.
5. `SERVICE_UNAVAILABLE`: branded retry and safe navigation; no empty privileged shell.
6. `SESSION_EXPIRED`: clear sensitive client cache and return to login.

Never display `Failed to fetch` as raw primary UI. Log a correlation-safe diagnostic and show actionable human text.

## Session/client behaviour

- Browser API base is same-origin `/api/v1` under Docker/stage/prod; local development uses the same rewrite/proxy contract.
- All requests use `credentials: include` and mutation CSRF header from the CSRF cookie/bootstrap contract.
- `auth/me` drives navigation/action visibility; API still authorises every request.
- `next` redirect must start with `/` and must not start with `//`; reject external schemes/hosts.
- Never store passwords, session IDs, claim tokens or Boarding tokens in localStorage. A pending claim token may remain only in memory/sessionStorage for the current tab and is erased after claim/logout/terminal failure.

## Campaign Designer composition

Retain:

- left tools/layers;
- central zoomable canvas;
- right level list/inspector;
- footer lifecycle/preview controls;
- existing dark/space visual language.

Add a project/mode selector above the level list:

```text
Game Project: Galactic Gunners: Final Assault™
Mode: Shooter | Boarding Interior
```

### Load flow

```text
session/permission
→ available projects
→ selected project catalogue
→ selected exact draft/published version
→ asset catalogue allowed for project
→ render typed placements using thumbnails/runtime art
```

The initial official selection is Level 1. Empty list is legitimate only when the selected authorised custom project has no levels; show Create Level. API failure shows Retry. Permission denial exits the Designer.

### Palette chooser

Clicking `Player`, `Scout formation`, `Bunker`, `Shield tile`, `Hazard`, `NUKE`, `LIFE`, `Objective` or `Boarding anchor` opens a drawer/modal that contains:

- category title and close control;
- searchable thumbnail grid;
- image, asset name and permitted short metadata;
- loading, empty, error and pagination states;
- keyboard focus order and arrow/Enter selection;
- pointer/touch draggable items;
- no inaccessible/retired asset.

Selecting an asset enters placement mode. Pointer/canvas click or drag/drop creates a draft placement snapped to the configured grid. Escape cancels. The canvas shows the image, not a text-only rectangle. A selection can be moved, duplicated, reordered or deleted with confirmation/undo as appropriate.

### Inspector

Fields are derived from `object_type`; never render an arbitrary JSON/code editor as the normal path. Common fields: stable placement ID, X/Y, layer, scale, rotation. Type-specific fields include formation rows/columns/spacing, bunker matrix, hazard timing, pickup type/weight, objective target, Boarding source selector/envelope or interior door/container properties.

Invalid values show field-level errors and block validate/publish. The UI never silently clips/coerces into a different valid configuration.

### Save/lifecycle

- Unsaved draft state is visually marked.
- Save uses optimistic concurrency with exact version/revision token; stale save returns conflict and offers reload/copy, never overwrites.
- Validate returns structured errors/warnings/performance report.
- Publish is unavailable without permission and successful current validation.
- CORE publish requires Platform Owner `platform.publish_core` and explicit confirmation naming project/level/version/checksum.
- Published version is read-only; Edit creates a new draft version.
- Rollback changes active pointer to an already published version and audits it; it does not mutate history.
- Archive is reversible only according to lifecycle service and never deletes versions.

### Preview

Preview issues a short-lived, actor/project-bound preview capability for the exact saved draft checksum. Phaser loads that draft through the standard LevelLoader/Interior loader and validators. Preview runs are always unranked and clearly marked Preview. No separate fake canvas renderer claims runtime parity.

## Player campaign UI

HUD and terminal surfaces distinguish:

- level score/delta;
- cumulative campaign score;
- current lives/nukes;
- level/sequence;
- ranked/unranked state.

On Continue, the next level must show the prior cumulative score and remaining resources immediately. Replay says it restarts the current level from its entry checkpoint. New Campaign confirms that it creates a new attempt.

Anonymous result:

```text
YOUR SCORE: <validated/local value>
UNRANKED
[Create account and save validated score] [Log in] [Continue/Main menu]
```

If backend was unavailable, say `Local unranked score — this run cannot be added to the leaderboard`; do not offer an invalid claim.

## Accessibility/responsiveness

- All shell/forms/editor controls have semantic names, visible focus and keyboard operation.
- Drawer traps/restores focus correctly; Escape closes.
- Drag/drop has select/place keyboard equivalent.
- Status/error is announced without depending only on colour.
- No privileged or critical action is hover-only.
- Test at 1024×768, 1365×768, 1440×900, 1920×1080 and representative touch viewport.

