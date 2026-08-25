# GAME OVER / VICTORY EVENT SPECIFICATION

## Core rule

`gg_game_over_panel_v002.png` and `gg_victory_panel_v002.png` are visual/style authorities, not immutable flattened final screens.

Any mutable value or action must remain event-driven.

## Game Over

Decorative:
- supplied Game Over panel/shell;
- starfield/dimmed gameplay backdrop.

Live:
- `GAME OVER` heading if not safely part of shell;
- final score;
- replay state;
- Restart action;
- Menu action;
- selection/focus state.

Do not:
- render nested mini Game Over screenshot/panel;
- duplicate Game Over headings;
- leave clipped HUD over the result panel;
- bake final score into a static PNG.

## Victory

Decorative:
- supplied Victory panel/shell;
- approved effects/background.

Live:
- mission/level completed label;
- score;
- bonuses;
- replay/restart state if applicable;
- Next;
- Replay;
- Menu;
- selector/focus state.

Buttons indicated by panel art must have real runtime hit areas and controller/touch/keyboard actions.

## Dynamic counters

If a panel visually contains example digits or labels that conflict with runtime data, Development must compose around or cleanly mask/replace those areas using the supplied visual language.

Correct live behaviour has priority over literal use of baked example data.
