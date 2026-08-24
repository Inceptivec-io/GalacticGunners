# NUKE HUD FINAL LAYOUT

Founder-required lower-right structure:

```text
REARM: 150/150

[NUKE ICON]  2
```

Requirements:
- lower-right HUD region;
- ReArm above;
- icon + live number below;
- number immediately RIGHT of icon;
- no word `NUKES`;
- icon and text visually comparable;
- icon not microscopic;
- number not oversized;
- both wholly inside safe viewport;
- one shared HUD path Level1 / Level2 / Boss.

Do not use the current top-right placement.

Derive icon size and number typography from a common HUD visual unit.

Target:
`NUKE_ICON_HEIGHT ≈ NUKE_COUNT_TEXT_HEIGHT`.
