# FONT INTEGRATION AND TEXT HIERARCHY v1.0

## Font families in pack

The asset archive includes a title-font package and a display-font package. Development must integrate these properly rather than using default browser/system fonts.

## Recommended hierarchy

### Title font
Use for:
- major headings;
- title screen;
- Game Over / Victory headings;
- key hero words.

### Display font
Use for:
- menu items;
- body text;
- instructions;
- HUD values;
- counters;
- button labels;
- leaderboard entries if readable.

## Readability rules
- no giant unstructured text walls;
- preserve contrast against starfield backgrounds;
- avoid fluorescent green fallback-looking typography unless explicitly part of the approved art system;
- test on desktop and mobile;
- ensure number glyphs are clear for score/HUD use.

## Technical rule
Use actual webfont/runtime font loading from supplied packages where the platform/runtime allows, and fall back gracefully only if necessary.
