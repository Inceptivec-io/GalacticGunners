# Asset-wide sprite audit findings

## Scope

Every active Shooter texture that is a sheet or is currently treated as a sprite, plus all thirteen Boarding character animation sources, was inspected at exact repository commit `b59f5e5b8bcb366eb72291195d3503afa4d71dbf`.

## Confirmed defects

1. `gg_nuke_burst_v002_horizontal.png` is 5160×516. It exceeds the pack's new 4096-pixel maximum axis and is unsuitable as a portable single WebGL texture.
2. `gg_enemy_cruiser_v002_sheet.png` contains four visual frames, but `FRAME_RECTS.cruiser` registers only frame zero.
3. `gg_enemy_destroyer_v002_sheet.png` contains four visual frames, but `FRAME_RECTS.destroyer` registers only frame zero.
4. `gg_boss_mothership_normal_v002_sheet.png` contains four visual frames, but the runtime registers the complete 1425×724 sheet as one frame.
5. `gg_asteroid_v002_sheet.png` contains six variants, but the runtime registers the complete 2172×724 sheet as one frame.
6. `gg_comet_v002_horizontal_vertical_facing.png` contains six variants, but the runtime registers only the first 448×448 frame.
7. The thirteen Boarding character files are multi-frame animation sheets. The current normalisation metadata treats each whole sheet as one derivative, and `BoardingScene` then applies fixed crops such as `(40,130,290,590)`. This neither selects an animation frame nor provides animation.
8. Seven Player Boarding sheets contain baked opaque checkerboard backgrounds. They are not production-transparent textures.
9. `alien_001_v001.png` also contains an opaque background and requires deterministic background removal.
10. Current asset metadata does not universally declare sheet dimensions, frame count, frame order, authored facing, anchor, trim policy, animation state or browser texture constraints.

## Required outcome

All runtime sprites must be generated from immutable admitted sources into deterministic transparent runtime derivatives described by one machine-readable catalogue. No scene may contain unexplained crop rectangles or independently invented frame counts.
