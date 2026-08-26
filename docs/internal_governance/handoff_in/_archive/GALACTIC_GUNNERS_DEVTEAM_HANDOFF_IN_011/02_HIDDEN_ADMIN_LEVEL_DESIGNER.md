# HIDDEN ADMIN LEVEL DESIGNER SPECIFICATION

# 1. CANONICAL ROUTE

The Founder/admin level designer is reachable ONLY under:

```text
/inceptivec-gamification-admin
```

Do NOT create aliases such as:

```text
/admin
/admin/game/levels
/level-editor
/editor
```

Permitted subroutes only under the hidden namespace, e.g.:

```text
/inceptivec-gamification-admin/levels
/inceptivec-gamification-admin/levels/{id}
/inceptivec-gamification-admin/preview/{id}
```

# 2. PUBLIC DISCOVERABILITY = ZERO

The route MUST NOT appear in:

- site navigation;
- footer;
- player profile;
- help;
- credits;
- public site search;
- sitemap;
- public route index;
- public menus;
- player-facing documentation;
- public HTML hrefs.

Required:

```text
PUBLIC_NAV_LINK = 0
FOOTER_LINK = 0
SITEMAP_ENTRY = 0
PUBLIC_HTML_LINK = 0
PLAYER_SITE_DISCOVERABILITY = 0
```

Use `noindex, nofollow` metadata where appropriate.

Exclude it from generated sitemap.

Do NOT put the route into robots.txt as a secret: robots files are public. If robots exclusion is needed for crawler policy, do not rely on it for concealment.

No public redirect should reveal this route.

# 3. ROUTE OBSCURITY IS NOT SECURITY

Security invariant:

```text
KNOWING_THE_URL != AUTHORIZED_ACCESS
```

Direct URL access must require:

```text
DJANGO IDENTITY AUTHORITY
+
AUTHENTICATION
+
ADMIN RBAC/PERMISSION
```

Required tests:

```text
ANONYMOUS DIRECT URL = DENIED
NORMAL PLAYER DIRECT URL = DENIED
AUTHORIZED ADMIN = PASS
ANONYMOUS ADMIN API MUTATION = DENIED
PLAYER ADMIN API MUTATION = DENIED
```

No client-side-only auth gate.

# 4. DESIGNER MVP

At `/inceptivec-gamification-admin` provide:

```text
LEVEL LIST
CREATE
CLONE
EDIT
2D GAMEPLAY CANVAS
GRID / SNAP
ENTITY PALETTE
DRAG / DROP
PROPERTY INSPECTOR
LAYER PANEL
VALIDATION PANEL
SAME-RUNTIME PREVIEW
SAVE DRAFT
VERSION
PUBLISH
ROLLBACK
ARCHIVE
IMPORT
EXPORT
GENERATE DRAFT
```

# 5. EDITOR LAYERS

- BACKGROUND
- PLAYER SPAWN
- ENEMIES
- SHIELDS
- HAZARDS
- BONUSES
- BOARDING
- SAFE-AREA/GUIDES

Editor guides never render to players.

# 6. AUTHORING TOOLS

Player:
- drag spawn;
- numeric X/Y;
- grid snap;
- bounds validation.

Enemies:
- registered type;
- individual placement;
- rows/columns;
- quantity;
- spacing;
- movement;
- firing;
- wave timing.

Shields:
- bunker count;
- anchors;
- matrix;
- spacing;
- preview individual tiles.

Hazards:
- registered supported hazards only.

Bonus:
- hidden destructible bonus hosts.

Drops:
- weighted/seeded ship drop tables.

Boarding:
- dormant future BoardingAnchor metadata only.
