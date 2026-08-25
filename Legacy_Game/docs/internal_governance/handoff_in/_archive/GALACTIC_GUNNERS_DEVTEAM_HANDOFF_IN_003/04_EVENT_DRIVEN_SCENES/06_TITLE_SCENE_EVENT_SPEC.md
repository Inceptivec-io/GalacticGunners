# TITLE SCENE EVENT SPECIFICATION

The Title/Main Menu is a composed runtime scene.

## Static/decorative layers

May use:
- approved landscape/starfield background;
- `gg_logo_primary_v002.png`;
- `gg_logo_primary_words_v002.png`;
- `gg_logo_compact_v002.png` only where composition benefits.

Do NOT display competing duplicate Galactic Gunners logos.

## Live/event-driven layers

Must be runtime-controlled:
- Start / Play;
- Info;
- Sound state;
- Touch selection;
- controller/keyboard selection;
- pointer position;
- hover/focus/selected state;
- any future leaderboard/profile action.

Use:
- supplied title/display fonts;
- `gg_ui_pointer_v002_sheet.png`;
- `gg_touch_selector_v002_sheet.png`;
- sound/info icons as appropriate.

## Input

Must support:
- keyboard;
- touch;
- controller.

Selection state must be visually obvious.

Do not create a giant decorative centre symbol that replaces the actual menu interaction.
