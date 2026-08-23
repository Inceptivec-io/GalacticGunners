# TITLE / VICTORY / GAME OVER EVENT COMPOSITION v1.0

## 1. Title screen

### Use
- background: supplied starfield / approved landscape variant;
- branding: `gg_logo_primary_v002.png` or `gg_logo_primary_words_v002.png` and compact mark where justified;
- pointer/select: `gg_ui_pointer_v002_sheet.png` and `gg_touch_selector_v002_sheet.png`;
- control icons where useful: sound/info/back etc;
- supplied title font and display font.

### Do not bake into one flat page
The following must be code-driven and event-driven:
- play/start action;
- info action;
- sound toggle state;
- touch/desktop hint state;
- selector position;
- hover/focus/selected states;
- future leaderboard or profile entry if added.

### Title screen composition model
Recommended composition:
1. full-screen background;
2. centered primary logo / title treatment;
3. optional tagline under title if approved;
4. main menu action group rendered from live selectable elements;
5. bottom or corner utility controls (sound/info/back where applicable);
6. pointer / touch selector animation driven by selection state.

## 2. Info screen

The story/instructions page must use supplied fonts and live layout, not giant generic green system text.

Use:
- title font for screen heading;
- display font for body copy and controls;
- iconography from supplied UI pack;
- structured content blocks, not one wall of text.

## 3. Victory screen

### Use
- `gg_victory_panel_v002.png` as stylistic panel/shell authority;
- background starfield behind or around panel;
- code-rendered or event-rendered values inside the panel zones.

### Dynamic elements that must be event-driven
- final score;
- level/stage completed;
- replay count if shown;
- bonus values;
- next / replay / menu actions;
- selection state;
- sound state if visible.

### Action model
The panel may visually suggest action buttons, but actual click/touch/controller events must attach to runtime hit areas.

## 4. Game Over screen

### Use
- `gg_game_over_panel_v002.png` as style shell;
- runtime-composed values and actions over/within it.

### Dynamic elements
- final score;
- lives state if shown;
- replay action;
- menu/back action;
- selection state.

## 5. Counters and buttons

Buttons and counters are not decorative art only. They are runtime stateful elements.

Therefore:
- labels should be live text;
- selected state should be visually distinct;
- disabled/unavailable state should be visually distinct;
- click/touch/controller focus state should be visible;
- counters should reflect live game state at all times.
