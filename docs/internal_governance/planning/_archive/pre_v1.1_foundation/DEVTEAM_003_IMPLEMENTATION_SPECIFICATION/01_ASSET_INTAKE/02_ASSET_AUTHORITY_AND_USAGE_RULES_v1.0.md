# ASSET AUTHORITY AND USAGE RULES v1.0

## Accepted as runtime authority

The uploaded archive contains a coherent owned asset set covering:
- core gameplay ships;
- enemy classes;
- projectiles;
- explosions;
- nuke effects;
- backgrounds;
- branding;
- HUD icons;
- UI icons;
- shield tile;
- panel styling;
- title/display fonts.

Development must integrate these exact assets as the current art source unless a later Founder-issued replacement supersedes them.

## Panel rule

`gg_game_over_panel_v002.png` and `gg_victory_panel_v002.png` are to be treated as style-authority composition shells, not as final immutable flat screens containing all live interface state.

If text/counters/buttons are already visually present in the art, Development may either:
- use the panel as a backdrop and overlay event-driven live UI within its intended zones; or
- separate the art into ornamental shell + dynamic overlay layout.

The priority is correct runtime behaviour and readability, not literal flat-image dependence.

## Fonts

The pack includes at least two usable font systems:
- a display/UI font package;
- a title font package.

These should replace poor-quality generic browser font rendering.

## Missing-from-pack handling

If a required runtime surface is not explicitly represented as an image asset, Development must build it from:
- supplied font(s);
- supplied icon language;
- supplied panel language;
- supplied background / logo language;
- code-driven layout.

Do not introduce mismatched styling merely because a specific image file does not exist.
