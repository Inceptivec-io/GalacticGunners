# BONUS, DROP, IMPORT/EXPORT, OFFLINE & GENERATION

# 1. BONUS / DROP

Initial pickups:

```text
NUKE
LIFE
```

Hidden bonus flow:

```text
destructible host destroyed
→ seeded bonus reveal
→ pickup
→ collect
```

Ship drop flow:

```text
ship destroyed
→ seeded weighted drop
→ pickup visibly ejects/jumps
→ collectable
→ player collects
```

Required:
- deterministic seed;
- no duplicate awards;
- life/nuke caps;
- event summary.

# 2. BOARDING ANCHORS — DORMANT

Config may define:

- eligible ship type;
- placement/rule;
- boarding_enabled flag;
- entry envelope;
- interior_definition_id;
- availability rule.

Do not implement Boarding runtime.

# 3. SAME-RUNTIME PREVIEW

Admin preview MUST use the same LevelLoader, CombatLevelScene, systems, collisions and canonical assets as actual gameplay.

No fake preview renderer.

# 4. IMPORT / EXPORT

Export JSON containing schema/version/checksum/config.

Import:

```text
UPLOAD
→ PARSE
→ SCHEMA VALIDATE
→ SEMANTIC VALIDATE
→ SECURITY VALIDATE
→ PREVIEW
→ SAVE DRAFT
```

Never auto-publish.

Reject scripts, injection payloads, unknown entities, oversized arrays/nesting, invalid placements.

# 5. DETERMINISM

Game denominator:

```text
game_version
level_id
level_version
level_checksum
seed
```

Same denominator reproduces level layout/drop/bonus/generated outcomes.

# 6. OFFLINE

Package six campaign definitions.

Runtime:

```text
server published definition
→ validate
→ cache

backend unavailable
→ validated cache or packaged definition

invalid remote config
→ reject + fallback
```

# 7. PROCEDURAL GENERATOR

Inputs:

- seed;
- difficulty;
- allowed entities;
- enemy budget;
- shield constraints;
- hazards;
- bonus/drop constraints;
- BoardingAnchor constraints;
- performance budget.

Output:

`LevelDefinition DRAFT`

Must pass schema/semantic/performance/hostile validation.

AUTO-PUBLISH = NO.
