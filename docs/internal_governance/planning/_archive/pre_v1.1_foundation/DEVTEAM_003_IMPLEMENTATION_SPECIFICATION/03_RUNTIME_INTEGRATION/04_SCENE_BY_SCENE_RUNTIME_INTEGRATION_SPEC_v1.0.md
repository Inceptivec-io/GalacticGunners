# SCENE-BY-SCENE RUNTIME INTEGRATION SPEC v1.0

## Gameplay scene

### Required integrations
- landscape background for desktop/landscape play;
- portrait background for portrait/mobile contexts if used;
- player ship sheet integrated with animation rather than static substitution;
- scout/cruiser/destroyer/mothership sheet integration preserving activity;
- asteroid/comet sprite sheet integration;
- player/enemy laser replacement;
- small and large explosion effect replacement;
- nuke projectile and nuke burst integration;
- life icon and nuke icon for HUD;
- modular shield tile to rebuild shield grid;
- HUD text using supplied display font.

### Shield rule
The shield must be rebuilt in code from repeated `gg_shield_tile_v002.png`-derived units or a properly prepared in-engine sub-tile representation, preserving per-piece destruction and score penalties for enemy hits.

### HUD rule
Score, lives, nukes, replay count and other mutable values must be live text/counters, not baked art.

## Touch and controller cues

Use:
- `gg_touch_selector_v002_sheet.png`;
- `gg_ui_pointer_v002_sheet.png`;
- `gg_ui_arrow_v002.png`;
- `gg_ui_pause_v002.png`;
- `gg_ui_sound_on_v002.png`;
- `gg_ui_sound_off_v002.png`;
- `gg_ui_info_v002.png`;
- `gg_ui_back_v002.png`;
- `gg_ui_restart_v002.png`;
- `gg_ui_resume_v002.png`.

These must be attached to actual interaction states.

## Logo and branding use

- primary title screen: `gg_logo_primary_v002.png` or wordmark lockup;
- in-menu / compact placements: `gg_logo_compact_v002.png`;
- UI surfaces may use the compact emblem sparingly, not excessively.
