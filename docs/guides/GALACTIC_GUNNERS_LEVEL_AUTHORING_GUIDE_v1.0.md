# Galactic Gunners Level Authoring Guide v1.0

## 1. Principle

Ordinary combat levels are content, not new engine implementations.

```text
CombatLevelScene
→ LevelLoader
→ Validated LevelDefinition
→ LevelRuntimeConfig
```

Do not create duplicated `Level2Scene`, `Level3Scene`, etc. unless a future mechanic genuinely requires a separate scene family and receives explicit authority.

## 2. LevelDefinition

A level definition contains versioned declarative data for:

- identity/campaign/sequence;
- environment/playfield;
- player spawn/movement bounds;
- enemy formations and individual placements;
- shields/bunkers;
- hazards/waves/objectives;
- bonus rules/drop tables;
- dormant BoardingAnchors;
- visual/audio theme references;
- difficulty/performance budget;
- metadata/seed policy.

No arbitrary executable code is allowed.

## 3. Coordinate system

Authoring should use normalized playfield coordinates where the schema specifies them. Coordinates must remain within validated ranges and must be translated through the same PlayfieldLayout/LevelRuntimeConfig used by the game.

Never use editor-only pixel assumptions as runtime authority.

## 4. Player spawn

A level must contain a valid player spawn that:

- lies within movement bounds;
- is not inside a bunker/hazard/enemy collider;
- allows the accepted lower flight lane where required;
- remains visible at supported viewports.

## 5. Enemy formations

A formation defines:

- registered enemy type;
- rows/columns or supported pattern;
- origin/area;
- spacing;
- movement profile;
- fire profile;
- timing.

The accepted Level 1 golden formation is `29 × 2 = 58` scouts. Config migration must reproduce it rather than reinterpret it.

## 6. Individual enemies

Use individual placement for special ships or composition exceptions. The `enemy_type` must exist in `EnemyTypeRegistry`; an unknown type is a validation failure.

## 7. Shields

Shield bunkers use the governed tile matrix and canonical shield asset. The accepted Level 1 baseline contains eight bunkers and 256 initial tiles.

Authoring must validate:

- bunker anchor;
- matrix dimensions/content;
- tile spacing;
- playfield bounds;
- player-lane clearance.

## 8. Hazards

Hazards are registry-driven. Configuration may control approved spawn zones/timing/caps, but cannot invent executable hazard code.

## 9. Bonus/drop rules

Initial pickup types are `NUKE` and `LIFE`.

Drop tables use deterministic weights. A source destruction may resolve a drop once; a pickup may be collected once. Caps remain governed by runtime policy.

## 10. BoardingAnchor

BoardingAnchor is dormant metadata until Boarding is separately accepted. It may describe eligible ship type, entry envelope and future interior reference, but it must not activate boarding gameplay early.

## 11. Performance budget

Every level must stay inside tested limits for enemies, projectiles, shield tiles, hazards, pickups and scripted events. The admin designer must show budget use before publish.

## 12. Validation sequence

```text
schema
→ semantic registries
→ bounds/spawns
→ asset references
→ performance budget
→ deterministic checksum
→ hostile simulation
→ same-runtime preview
```

Fail closed.

## 13. Versioning

Published LevelVersions are immutable. Any change becomes a new DRAFT version. GameRuns bind exact level ID/version/checksum/seed so historical runs remain reproducible.

## 14. Generated levels

Generator input is constrained by template, seed, difficulty, allowed entities and performance rules. Output is always a DRAFT LevelDefinition and must pass the same validation path.

## 15. Six-level campaign target

- Level 1: exact accepted baseline.
- Level 2: escalation.
- Level 3: mixed fleet using genuinely supported enemy types.
- Level 4: hazards/rewards/dormant boarding metadata.
- Level 5: elite/high-pressure composition.
- Level 6: finale using only genuinely production-ready boss mechanics.

Do not fake unsupported mechanics or create empty placeholder level files.
