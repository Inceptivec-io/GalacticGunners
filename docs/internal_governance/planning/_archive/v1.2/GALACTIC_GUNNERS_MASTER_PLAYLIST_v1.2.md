# GALACTIC GUNNERS MASTER PLAYLIST v1.2
## Config-Driven Campaign & Level Authoring Execution Playlist

**Technical/Product Authority:** Galactic Gunners CTO  
**Controlling Acceptance Authority:** Founder / Secuvara CTAIO  
**Supersedes:** `GALACTIC_GUNNERS_MASTER_PLAYLIST_v1.1.md`

---

# A. PLANNING CURRENTNESS

- `GG12-CUR-001` Admit Roadmap v1.2 as sole current Roadmap.
- `GG12-CUR-002` Admit Playlist v1.2 as sole current Playlist.
- `GG12-CUR-003` Move Roadmap/Playlist v1.1 to `planning/_archive/v1.1/`.
- `GG12-CUR-004` Preserve v1.1 unchanged as predecessor evidence.
- `GG12-CUR-005` Verify planning root contains only v1.2 Roadmap, v1.2 Playlist and `_archive/`.

PASS:

```text
CURRENT ROADMAP = 1
CURRENT PLAYLIST = 1
V1.1 PRESERVED = PASS
```

---

# B. CLOSE CURRENT V1 GAMEPLAY DENOMINATOR

- `GG12-FND-001` Close Handoff 010 remote hostile CI reproducibility.
- `GG12-FND-002` Record Founder-accepted Level 1 gameplay/visual denominator.
- `GG12-FND-003` Freeze exact accepted HEAD.
- `GG12-FND-004` Preserve physics-debug evidence.
- `GG12-FND-005` Preserve hostile-runtime suite.
- `GG12-FND-006` Record player/alien/projectile/shield scale denominator.
- `GG12-FND-007` Record pause/nuke/respawn/input denominator.
- `GG12-FND-008` Merge only after CTO + Founder gate.

PASS:

```text
LEVEL 1 DENOMINATOR = ACCEPTED
REMOTE HOSTILE CI = GREEN
```

---

# C. LEVEL-RUNTIME ARCHITECTURE

- `GG12-LR-001` Define `LevelDefinition` domain model.
- `GG12-LR-002` Define schema versioning.
- `GG12-LR-003` Define declarative-only rule.
- `GG12-LR-004` Define approved entity registry.
- `GG12-LR-005` Define approved asset-reference model.
- `GG12-LR-006` Define playfield object.
- `GG12-LR-007` Define player spawn model.
- `GG12-LR-008` Define formation model.
- `GG12-LR-009` Define individual enemy placement.
- `GG12-LR-010` Define shield/bunker placement.
- `GG12-LR-011` Define hazard placement.
- `GG12-LR-012` Define objective model.
- `GG12-LR-013` Define wave/event model.
- `GG12-LR-014` Define bonus rule model.
- `GG12-LR-015` Define drop-table model.
- `GG12-LR-016` Define future BoardingAnchor.
- `GG12-LR-017` Define performance budgets.
- `GG12-LR-018` Define checksum.
- `GG12-LR-019` Define deterministic seed model.
- `GG12-LR-020` CTO architecture gate.

---

# D. CONTRACTS / SCHEMAS

- `GG12-SCHEMA-001` Add `level-definition.schema.json`.
- `GG12-SCHEMA-002` Add semantic placement definitions.
- `GG12-SCHEMA-003` Add drop-table contract.
- `GG12-SCHEMA-004` Add bonus-rule contract.
- `GG12-SCHEMA-005` Add boarding-anchor reserved contract.
- `GG12-SCHEMA-006` `additionalProperties` fail-closed.
- `GG12-SCHEMA-007` Unknown entity rejection.
- `GG12-SCHEMA-008` Unknown asset rejection.
- `GG12-SCHEMA-009` Invalid bounds rejection.
- `GG12-SCHEMA-010` Arbitrary executable code rejection.
- `GG12-SCHEMA-011` Contract tests.
- `GG12-SCHEMA-012` Hostile malformed-config tests.

---

# E. GENERIC COMBAT LEVEL RUNTIME

- `GG12-RUNTIME-001` Create/refine `CombatLevelScene`.
- `GG12-RUNTIME-002` Create `LevelLoader`.
- `GG12-RUNTIME-003` Validate config before scene admission.
- `GG12-RUNTIME-004` Create `LevelRuntimeConfig`.
- `GG12-RUNTIME-005` Bind Player from config.
- `GG12-RUNTIME-006` Bind enemy formations from config.
- `GG12-RUNTIME-007` Bind individual enemy placements.
- `GG12-RUNTIME-008` Bind shields.
- `GG12-RUNTIME-009` Bind hazards.
- `GG12-RUNTIME-010` Bind wave/event timing.
- `GG12-RUNTIME-011` Bind objectives.
- `GG12-RUNTIME-012` Bind visual/audio themes.
- `GG12-RUNTIME-013` Bind bonus rules.
- `GG12-RUNTIME-014` Bind drop tables.
- `GG12-RUNTIME-015` Bind BoardingAnchor as dormant metadata.
- `GG12-RUNTIME-016` Preserve global scoring authority.
- `GG12-RUNTIME-017` Preserve offline play.
- `GG12-RUNTIME-018` Remove duplicated level-specific engine logic only after parity proof.

PASS:

```text
ORDINARY LEVEL ADDITION REQUIRES ENGINE CODE = NO
```

---

# F. MIGRATE LEVEL 1 TO CONFIG

- `GG12-MIG1-001` Export accepted Level 1 composition.
- `GG12-MIG1-002` Create Level 1 LevelDefinition.
- `GG12-MIG1-003` Preserve player spawn.
- `GG12-MIG1-004` Preserve 29×2 formation.
- `GG12-MIG1-005` Preserve shield/bunker configuration.
- `GG12-MIG1-006` Preserve laser behaviour.
- `GG12-MIG1-007` Preserve nukes/rearm.
- `GG12-MIG1-008` Preserve pause.
- `GG12-MIG1-009` Preserve respawn.
- `GG12-MIG1-010` Preserve scoring.
- `GG12-MIG1-011` Preserve visual composition.
- `GG12-MIG1-012` Run identical hostile suite before/after.
- `GG12-MIG1-013` Founder side-by-side review.

PASS:

```text
CONFIG-DRIVEN LEVEL 1 = ACCEPTED
BEHAVIOUR REGRESSION = 0
VISUAL REGRESSION = 0
```

---

# G. DATABASE LEVEL AUTHORITY

- `GG12-DBL-001` Add `Level`.
- `GG12-DBL-002` Add `LevelVersion`.
- `GG12-DBL-003` Store validated config in JSONB.
- `GG12-DBL-004` Store schema version.
- `GG12-DBL-005` Store checksum.
- `GG12-DBL-006` Store lifecycle status.
- `GG12-DBL-007` Store creator/publisher.
- `GG12-DBL-008` Published version immutable.
- `GG12-DBL-009` Supersede via new version.
- `GG12-DBL-010` Rollback supported.
- `GG12-DBL-011` Audit.
- `GG12-DBL-012` Migrations/tests.

---

# H. LEVEL API

- `GG12-LAPI-001` Level list/read endpoint.
- `GG12-LAPI-002` Exact version read endpoint.
- `GG12-LAPI-003` Admin create draft.
- `GG12-LAPI-004` Admin clone.
- `GG12-LAPI-005` Admin validate.
- `GG12-LAPI-006` Admin preview token/config.
- `GG12-LAPI-007` Admin publish.
- `GG12-LAPI-008` Admin supersede/archive.
- `GG12-LAPI-009` Admin rollback.
- `GG12-LAPI-010` Privileged mutation only.
- `GG12-LAPI-011` Client read-only.
- `GG12-LAPI-012` OpenAPI contract.
- `GG12-LAPI-013` hostile auth tests.

---

# I. ADMIN LEVEL DESIGNER MVP

- `GG12-ADMIN-001` Create level administration route.
- `GG12-ADMIN-002` RBAC gate.
- `GG12-ADMIN-003` Campaign/metadata editor.
- `GG12-ADMIN-004` 2D level canvas.
- `GG12-ADMIN-005` Grid/snap.
- `GG12-ADMIN-006` Entity palette.
- `GG12-ADMIN-007` Drag/drop enemy placement.
- `GG12-ADMIN-008` Formation tool.
- `GG12-ADMIN-009` Player-start tool.
- `GG12-ADMIN-010` Shield/bunker tool.
- `GG12-ADMIN-011` Shield matrix editor.
- `GG12-ADMIN-012` Hazard tool.
- `GG12-ADMIN-013` Hidden-bonus tool.
- `GG12-ADMIN-014` Drop-table editor.
- `GG12-ADMIN-015` Boarding-anchor tool.
- `GG12-ADMIN-016` Property inspector.
- `GG12-ADMIN-017` Layer controls.
- `GG12-ADMIN-018` Performance-budget indicator.
- `GG12-ADMIN-019` Validation panel.
- `GG12-ADMIN-020` Same-runtime preview.
- `GG12-ADMIN-021` Save draft.
- `GG12-ADMIN-022` Version.
- `GG12-ADMIN-023` Publish.
- `GG12-ADMIN-024` Rollback.
- `GG12-ADMIN-025` Archive.
- `GG12-ADMIN-026` Audit log.

PASS:

```text
INVALID CONFIG CANNOT PUBLISH
PREVIEW != FAKE RENDERER
ADMIN WRITE AUTHORITY = PROTECTED
```

---

# J. IMPORT / EXPORT

- `GG12-IO-001` Export JSON.
- `GG12-IO-002` Include schema version.
- `GG12-IO-003` Include level/version identity.
- `GG12-IO-004` Include checksum.
- `GG12-IO-005` Import upload.
- `GG12-IO-006` Parse.
- `GG12-IO-007` Schema validate.
- `GG12-IO-008` Semantic validate.
- `GG12-IO-009` Reject executable/script content.
- `GG12-IO-010` Preview.
- `GG12-IO-011` Save imported object as DRAFT only.
- `GG12-IO-012` Import never auto-publishes.

---

# K. BONUS / DROP SYSTEM

- `GG12-BONUS-001` Define pickup registry.
- `GG12-BONUS-002` Initial `NUKE` pickup.
- `GG12-BONUS-003` Initial `LIFE` pickup.
- `GG12-BONUS-004` Hidden bonus behind destructible target.
- `GG12-BONUS-005` Reveal on destruction.
- `GG12-BONUS-006` Ship drop table.
- `GG12-BONUS-007` Weighted probability.
- `GG12-BONUS-008` Seeded random selection.
- `GG12-BONUS-009` Ejection/jump visual from destroyed ship.
- `GG12-BONUS-010` Pickup lifetime.
- `GG12-BONUS-011` Collection collider.
- `GG12-BONUS-012` Life cap rules.
- `GG12-BONUS-013` Nuke cap rules.
- `GG12-BONUS-014` No farming/duplicate award.
- `GG12-BONUS-015` GameRun event summary.
- `GG12-BONUS-016` hostile deterministic-drop tests.

---

# L. RELEASE LEVELS 2–6

All five are built through the same level-authoring system.

## Level 2
- `GG12-L2-001` Author.
- `GG12-L2-002` Validate.
- `GG12-L2-003` Hostile test.
- `GG12-L2-004` Founder review.
- `GG12-L2-005` Publish.

## Level 3
- `GG12-L3-001` Introduce governed mixed enemy-class composition.
- `GG12-L3-002` Validate.
- `GG12-L3-003` Hostile test.
- `GG12-L3-004` Founder review.
- `GG12-L3-005` Publish.

## Level 4
- `GG12-L4-001` Introduce advanced hazard/bonus composition.
- `GG12-L4-002` Reserve/test BoardingAnchor metadata.
- `GG12-L4-003` Validate.
- `GG12-L4-004` Founder review.
- `GG12-L4-005` Publish.

## Level 5
- `GG12-L5-001` Author elite/high-pressure composition.
- `GG12-L5-002` Validate.
- `GG12-L5-003` Hostile test.
- `GG12-L5-004` Founder review.
- `GG12-L5-005` Publish.

## Level 6
- `GG12-L6-001` Author finale configuration.
- `GG12-L6-002` Integrate supported mothership/finale mechanics.
- `GG12-L6-003` Validate.
- `GG12-L6-004` Hostile test.
- `GG12-L6-005` Founder review.
- `GG12-L6-006` Publish.

PASS:

```text
RELEASE LEVELS = 6
HARD-CODED LEVEL IMPLEMENTATIONS = 0
```

---

# M. PROCEDURAL LEVEL GENERATOR

- `GG12-GEN-001` Define generator rule schema.
- `GG12-GEN-002` Define seed.
- `GG12-GEN-003` Define difficulty target.
- `GG12-GEN-004` Define allowed entity set.
- `GG12-GEN-005` Define density constraints.
- `GG12-GEN-006` Define shield constraints.
- `GG12-GEN-007` Define hazard constraints.
- `GG12-GEN-008` Define bonus/drop constraints.
- `GG12-GEN-009` Define boarding-anchor constraints.
- `GG12-GEN-010` Generate LevelDefinition DRAFT.
- `GG12-GEN-011` Schema validation.
- `GG12-GEN-012` Semantic validation.
- `GG12-GEN-013` Performance validation.
- `GG12-GEN-014` Automated hostile simulation.
- `GG12-GEN-015` Preview.
- `GG12-GEN-016` Explicit admin approval required.
- `GG12-GEN-017` Auto-publish = NO.

---

# N. DETERMINISM / REPLAYABILITY

- `GG12-DET-001` GameRun stores level ID.
- `GG12-DET-002` GameRun stores level version.
- `GG12-DET-003` GameRun stores level checksum.
- `GG12-DET-004` GameRun stores seed.
- `GG12-DET-005` Reproduce drop outcomes.
- `GG12-DET-006` Reproduce generated level.
- `GG12-DET-007` Debug replay fixture.
- `GG12-DET-008` Server score validation consumes exact level version.

PASS:

```text
RECORDED RUN CONTENT DENOMINATOR = REPRODUCIBLE
```

---

# O. OFFLINE LEVEL DELIVERY

- `GG12-OFF-001` Package six release definitions.
- `GG12-OFF-002` Backend published manifest.
- `GG12-OFF-003` Validate remote definitions.
- `GG12-OFF-004` Cache last valid definitions.
- `GG12-OFF-005` Backend unavailable → cache/package fallback.
- `GG12-OFF-006` Invalid remote config → reject/fallback.
- `GG12-OFF-007` Unvalidated config never executes.

---

# P. LEVEL HOSTILE VALIDATION

For every published definition:

- `GG12-QA-001` spawn bounds.
- `GG12-QA-002` player spawn clearance.
- `GG12-QA-003` formation bounds.
- `GG12-QA-004` shield bounds.
- `GG12-QA-005` projectile reachability.
- `GG12-QA-006` real collision paths.
- `GG12-QA-007` pause.
- `GG12-QA-008` nuke.
- `GG12-QA-009` respawn.
- `GG12-QA-010` objective completion.
- `GG12-QA-011` game-over path.
- `GG12-QA-012` bonus reveal.
- `GG12-QA-013` drop pickup.
- `GG12-QA-014` deterministic seed.
- `GG12-QA-015` invalid config rejected.
- `GG12-QA-016` tampered import rejected.
- `GG12-QA-017` performance budget.
- `GG12-QA-018` viewport matrix.
- `GG12-QA-019` Founder visual comparison.

---

# Q. BOARDING-READY LEVEL DATA

- `GG12-BRD-001` Add dormant BoardingAnchor schema.
- `GG12-BRD-002` Add eligible ship type.
- `GG12-BRD-003` Add anchor position/rule.
- `GG12-BRD-004` Add entry-envelope definition.
- `GG12-BRD-005` Add interior-definition reference.
- `GG12-BRD-006` Add availability rule.
- `GG12-BRD-007` Boarding execution remains disabled until Boarding gate.
- `GG12-BRD-008` No shooter rewrite required later.

---

# R. ADMIN SECURITY / GOVERNANCE

- `GG12-SEC-001` Django identity only.
- `GG12-SEC-002` admin RBAC.
- `GG12-SEC-003` server-side validation.
- `GG12-SEC-004` CSRF.
- `GG12-SEC-005` audit.
- `GG12-SEC-006` publish actor recorded.
- `GG12-SEC-007` immutable published versions.
- `GG12-SEC-008` arbitrary scripts rejected.
- `GG12-SEC-009` SQL/HTML/JS/Python injection payload tests.
- `GG12-SEC-010` public mutation denied.

---

# S. PERFORMANCE GOVERNANCE

- `GG12-PERF-001` define max concurrent enemies.
- `GG12-PERF-002` define max active projectiles.
- `GG12-PERF-003` define max shield tiles.
- `GG12-PERF-004` define max pickups.
- `GG12-PERF-005` define max hazards.
- `GG12-PERF-006` define max events.
- `GG12-PERF-007` admin budget meter.
- `GG12-PERF-008` publish fails above unsupported budget.

---

# T. CAMPAIGN GATE

```text
CONFIG-DRIVEN LEVEL RUNTIME = PASS
LEVEL 1 MIGRATION = PASS
ADMIN DESIGNER = PASS
LEVEL DATABASE VERSIONING = PASS
IMPORT / EXPORT = PASS
BONUS / DROP SYSTEM = PASS
LEVEL 1 = ACCEPTED
LEVEL 2 = ACCEPTED
LEVEL 3 = ACCEPTED
LEVEL 4 = ACCEPTED
LEVEL 5 = ACCEPTED
LEVEL 6 = ACCEPTED
PROCEDURAL DRAFT GENERATOR = PASS
DETERMINISTIC RUN CONTENT = PASS
HOSTILE LEVEL VALIDATION = PASS
CTO CAMPAIGN GATE = PASS
FOUNDER CAMPAIGN ACCEPTANCE = PASS
```

---

# U. THEN CONTINUE EXISTING PROGRAMME

After campaign/content architecture is accepted:

- validated GameRun/score hardening;
- global leaderboard;
- Boarding runtime;
- native clients;
- console feasibility;
- commercial packaging;
- release candidate;
- release;
- live/seasonal level content.

The new LevelDefinition system remains the content substrate throughout.

---

# V. PERMANENT PRODUCT RULE

```text
NEW ORDINARY COMBAT LEVEL
SHOULD REQUIRE CONTENT AUTHORING,
NOT GAME-ENGINE DEVELOPMENT.
```

That is now a core Galactic Gunners product capability.
