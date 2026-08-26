# RUNTIME + ADMIN DESIGNER

## Generic runtime

Target:

CombatLevelScene
→ LevelLoader
→ Validated LevelDefinition
→ LevelRuntimeConfig

Modules:

game/src/levels/
- LevelLoader.ts
- LevelRuntimeConfig.ts
- LevelValidator.ts
- LevelChecksum.ts
- registries/
- release/level-01.json ... level-06.json

game/src/scenes/
- CombatLevelScene.ts

No permanent Level2Scene..Level6Scene duplicates.

## Level 1 golden migration

Current accepted Level1 remains comparison authority until parity is proven.

Config Level1 must preserve:
- accepted player size/spawn;
- accepted scout size;
- 29x2 / 58 enemies;
- accepted formation positions;
- 8 bunkers / 256 tiles;
- accepted shield vertical position;
- lower flight lane;
- HUD anchors;
- laser visual/body mapping;
- nukes/rearm;
- pause;
- respawn;
- movement bounds;
- scoring;
- terminal flow;
- stellar viewport.

Required:
LEVEL1_TOPOGRAPHY_REGRESSION=0
LEVEL1_SCALE_REGRESSION=0
LEVEL1_BEHAVIOUR_REGRESSION=0
LEVEL1_VISUAL_REGRESSION=0

## Hidden admin route

ONLY:
/inceptivec-gamification-admin

Subroutes only beneath this namespace.

No:
- /admin
- /admin/game/levels
- /editor
- /level-editor

Public discoverability = 0:
nav 0
footer 0
profile 0
help 0
credits 0
sitemap 0
public href 0
site-search 0

Use noindex,nofollow.
URL obscurity is not security.

## Designer MVP

Provide:
- level list
- create / clone
- 2D playfield canvas
- grid / snap
- zoom
- entity palette
- drag/drop
- player spawn
- enemy individual placement
- formation editor rows/columns/spacing
- bunker placement
- shield matrix editor
- hazard tool
- bonus host tool
- drop-table editor
- dormant BoardingAnchor tool
- property inspector
- layer panel
- validation panel
- performance budget
- same-runtime preview
- save draft
- publish
- rollback
- archive
- import/export
- generate draft

Preview MUST use real CombatLevelScene/LevelLoader. No fake preview renderer.
