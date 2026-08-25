# ASSET INTEGRATION REQUIREMENTS

## Founder-supplied asset families

Development must inspect and integrate the supplied files including:

### Backgrounds
- `gg_bg_starfield_v002.png`
- `gg_bg_starfield_portrait_v002.png`
- `Galaxy_Landscape_different.png`

### Ships
- `gg_player_ship_v002_sheet.png`
- `gg_enemy_scout_v002_sheet.png`
- `gg_enemy_cruiser_v002_sheet.png`
- `gg_enemy_destroyer_v002_sheet.png`
- `gg_boss_mothership_v002_sheet.png`

### Hazards/effects
- `gg_asteroid_v002_sheet.png`
- `gg_comet_v002_sheet.png`
- `gg_explosion_small_v002_sheet.png`
- `gg_explosion_large_v002_sheet.png`
- `gg_nuke_projectile_v002_sheet.png`
- `gg_nuke_burst_v002_sheet.png`

### Projectiles
- `gg_player_laser_v002.png`
- `gg_enemy_laser_v002.png`

### Shield
- `gg_shield_tile_v002.png`

### Branding
- `gg_logo_primary_v002.png`
- `gg_logo_primary_words_v002.png`
- `gg_logo_compact_v002.png`

### HUD
- `gg_hud_life_icon_v002.png`
- `gg_hud_nuke_icon_v002.png`

### UI
- `gg_ui_arrow_v002.png`
- `gg_ui_back_v002.png`
- `gg_ui_info_v002.png`
- `gg_ui_pause_v002.png`
- `gg_ui_restart_v002.png`
- `gg_ui_resume_v002.png`
- `gg_ui_sound_off_v002.png`
- `gg_ui_sound_on_v002.png`
- `gg_ui_pointer_v002_sheet.png`
- `gg_touch_selector_v002_sheet.png`

### Result-style authority
- `gg_game_over_panel_v002.png`
- `gg_victory_panel_v002.png`

### Fonts
Use the supplied production font packages in `fonts/`.

Development must inventory the exact font files and register them.

---

# ANIMATION RULE

Sprite sheets must not be treated as static images.

Development must determine actual frame segmentation from each supplied sheet, create Phaser animations, and preserve stable anchors/origins.

Required active families:
- player;
- scout;
- cruiser;
- destroyer;
- mothership;
- asteroid;
- comet;
- explosion;
- nuke projectile/burst;
- pointer/touch selector.

Ships must feel active.

Where suitable, enemy instances may use phase offsets so rows do not pulse in perfect lockstep.

Do not introduce accessibility-problematic full-screen flashing.

---

# SHIELD RULE

`gg_shield_tile_v002.png` is one modular defensive tile.

The base remains code-generated from the existing shield matrix.

Required:
- repeat tile according to existing shield pattern;
- preserve individual collision;
- preserve individual destruction;
- preserve shield holes/damage treatment or improve it coherently;
- do not convert to one bunker sprite.

---

# IMAGE PREPARATION RULE

Founder assets may be high-resolution masters.

Development may create optimised runtime derivatives if required for:
- Phaser frame segmentation;
- performance;
- mobile memory;
- crisp scaling.

Any derivative must:
- remain faithful;
- be deterministically generated/documented;
- preserve source master unchanged;
- have provenance back to Founder source;
- be hashed and registered.

Do not degrade art quality through careless resizing.
