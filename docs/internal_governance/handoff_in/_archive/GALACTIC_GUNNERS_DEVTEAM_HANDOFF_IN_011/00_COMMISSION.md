# GALACTIC GUNNERS DEVTEAM HANDOFF IN 011
## Config-Driven Campaign, Hidden Admin Level Designer & Extensible Level Platform

**Repository:** `Inceptivec-io/GalacticGunners`
**Programme:** v1.0 campaign/platform formation
**Planning authority:** Roadmap/Playlist v1.2
**Execution branch:** `feature/v1-config-driven-campaign-platform`

# 0. HARD ENTRY GATE — DO NOT START EARLY

Do not execute until all are true:

```text
HANDOFF 010 FINAL = CTO PASS
HANDOFF 010 FINAL = FOUNDER ACCEPTED
PR #4 = MERGED INTO dev
REMOTE HOSTILE CI = GREEN
dev CONTAINS ACCEPTED LEVEL 1 STATE
ROADMAP v1.2 = SOLE CURRENT ROADMAP
PLAYLIST v1.2 = SOLE CURRENT PLAYLIST
v1.1 ROADMAP/PLAYLIST = ARCHIVED
WORKTREE = CLEAN
POST_BOX = BOUNDARY CONTROLS ONLY
```

Record exact post-merge `dev` SHA.

Create `feature/v1-config-driven-campaign-platform` from that exact SHA only.

If any condition fails:

`STOP — ENTRY_GATE_NOT_SATISFIED`

# 1. FOUNDER LOCK — LEVEL 1

The accepted Handoff 010 Level 1 topography/sizing is the golden migration denominator.

Do not materially alter:

- player scale;
- scout scale;
- formation density/location;
- bunker count/layout/vertical placement;
- lower flight lane;
- player spawn;
- HUD positions;
- laser scale;
- nuke HUD;
- pause;
- movement bounds;
- respawn;
- playfield proportions;
- full stellar viewport.

Required:

```text
LEVEL1_TOPOGRAPHY_REGRESSION = 0
LEVEL1_SCALE_REGRESSION = 0
LEVEL1_VISUAL_REGRESSION = 0
LEVEL1_BEHAVIOUR_REGRESSION = 0
```

No discretionary Level 1 visual changes.

# 2. PURPOSE

Implement the v1.2 architecture so ordinary combat levels are authored as validated/versioned data instead of hard-coded Phaser scenes.

Target:

```text
CombatLevelScene
        ↓
LevelLoader
        ↓
Validated LevelDefinition
        ↓
LevelRuntimeConfig
        ↓
Published LevelVersion
```

# 3. BOUNDED BLOCK SCOPE

Deliver:

1. v1.2 planning admission;
2. LevelDefinition schema;
3. semantic validator;
4. generic CombatLevelScene/LevelLoader;
5. accepted Level 1 migration to config;
6. zero-regression golden proof;
7. Django Level + LevelVersion;
8. migrations;
9. read/admin API;
10. hidden Founder/admin level designer MVP;
11. drag/drop enemy/player/shield/hazard/bonus/boarding-anchor tools;
12. drop tables;
13. same-runtime preview;
14. draft/version/publish/rollback/archive;
15. JSON import/export;
16. packaged/offline fallback;
17. deterministic checksum/seed;
18. constrained procedural draft generator;
19. level-content hostile validation;
20. six v1.0 campaign LevelDefinition drafts.

Levels 2–6 need to be valid/playable Founder-preview drafts, not final commercial acceptance.

# 4. NON-SCOPE

Do not implement:

- Boarding runtime/interiors;
- public/community level publishing;
- auth redesign;
- payments/store;
- native packaging;
- console work;
- production deployment;
- arbitrary scripting/code execution;
- release tag.
