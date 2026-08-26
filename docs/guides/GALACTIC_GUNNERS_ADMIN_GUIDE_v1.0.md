# Galactic Gunners Admin Guide v1.0

## 1. Purpose

The Galactic Gunners administration surface exists to manage governed game content. It is not part of the public player site.

## 2. Canonical route — H012 TARGET

```text
/inceptivec-gamification-admin
```

Permitted admin subroutes must remain below this namespace.

Do not create public/intuitive aliases such as `/admin`, `/admin/game/levels`, `/editor` or `/level-editor`.

## 3. Discoverability

The admin route must not appear in:

- public navigation;
- footer;
- player profile;
- help/credits;
- public site search;
- sitemap;
- public route index;
- public HTML links.

Use `noindex,nofollow` where applicable.

Route obscurity is not the security boundary. A user who knows the URL must still be denied unless authorized.

## 4. Authentication and authorization

Django identity is authoritative.

Required access matrix:

```text
anonymous                      DENIED
normal authenticated player    DENIED
authorized game-level admin    ALLOWED
```

Admin API mutation must be server-authorized independently of the web UI.

## 5. Environment credentials

Credentials are environment-specific and must never be committed.

Each environment uses an ignored root file:

```text
env.feature
env.dev
env.stage
env.prod
```

Each file contains the environment URL/routing contract and unique generated admin credentials. See `GALACTIC_GUNNERS_ENVIRONMENT_ROUTING_SECRETS_GUIDE_v1.0.md`.

## 6. Level lifecycle — H012 TARGET

```text
DRAFT
→ VALIDATED
→ PUBLISHED
→ SUPERSEDED
→ ARCHIVED
```

Published LevelVersions are immutable. Editing published content creates a new version.

## 7. Level administration workflow

1. Create or clone a level.
2. Edit the DRAFT.
3. Validate schema and semantics.
4. Preview using the real CombatLevelScene.
5. Correct all errors/warnings that block publication.
6. Save DRAFT.
7. Publish only after acceptance.
8. Use supersede/rollback rather than rewriting history.
9. Archive only through governed lifecycle controls.

## 8. Level designer — H012 TARGET

The admin workspace must provide:

- level list and status;
- create/clone;
- 2D playfield canvas;
- grid/snap/zoom;
- player spawn;
- enemy placement;
- formations;
- bunker placement and shield matrix;
- hazards;
- hidden bonus hosts;
- NUKE/LIFE drop tables;
- dormant BoardingAnchor placement;
- property inspector;
- layers;
- validation panel;
- performance-budget display;
- same-runtime preview;
- save/validate/publish/rollback/archive;
- import/export;
- generated DRAFT creation.

No arbitrary JavaScript/Python/SQL/shell/HTML execution field is permitted.

## 9. Import/export

Import is always:

```text
INPUT
→ size/parse checks
→ JSON Schema
→ semantic validation
→ security validation
→ checksum
→ DRAFT
```

Import never auto-publishes.

Export includes level identity, version, schema version, checksum and config.

## 10. Procedural generation — H012 TARGET

Generation creates DRAFT content only. The administrator selects seed/template/difficulty and allowed content. Generated definitions must pass the same validation and preview workflow as manually authored levels.

`AUTO-PUBLISH = NO`.

## 11. Audit

Privileged operations must record actor, operation, level/version, timestamp and outcome. At minimum audit create, clone, validate, publish, rollback, archive, import and generation.

## 12. Admin acceptance checklist

Before publishing a level, confirm:

```text
schema = PASS
semantic references = PASS
bounds/spawns = PASS
performance budget = PASS
preview = PASS
hostile level tests = PASS
checksum recorded = PASS
correct campaign/sequence = PASS
```

A UI that allows an invalid level to publish is a P1/P0-class administration defect depending on impact.
