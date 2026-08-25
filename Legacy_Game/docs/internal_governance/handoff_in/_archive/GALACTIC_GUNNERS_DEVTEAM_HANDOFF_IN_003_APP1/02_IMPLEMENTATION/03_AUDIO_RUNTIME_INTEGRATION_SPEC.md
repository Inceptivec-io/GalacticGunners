# AUDIO RUNTIME INTEGRATION SPEC

## Preload

Every required new sound must:
- be preloaded exactly once per appropriate scene/lifecycle;
- use a stable key;
- resolve without 404;
- be mapped to the correct event.

Prefer centralised/stable audio key naming where compatible with the existing architecture.

## Required bindings

### UI
- selector movement → `gg_ui_select_v001.wav`;
- Start/confirm → `gg_ui_confirm_v001.wav`;
- Back/cancel → `gg_ui_back_v001.wav`;
- sound toggle must continue to control game audio correctly.

### Player weapon
Player normal laser fire:
`gg_player_laser_v001.wav`

Do not create overlapping double-trigger playback for one shot event.

### Enemy weapon
Enemy laser fire:
`gg_enemy_laser_v001.wav`

Avoid uncontrolled polyphonic stacking that turns sustained enemy fire into clipping/noise.

Use Phaser/audio configuration responsibly:
- rate limiting if required;
- sensible volume;
- limited simultaneous instances where required.

### Shield
Enemy projectile impact/removal of a shield tile:
`gg_shield_hit_v001.wav`

This audio binding must not alter the locked score rule:
enemy/alien hit destroying one shield tile = `-1`.

### Explosions
Standard enemy/small destructive event:
`gg_explosion_small_v001.wav`

Large/heavy destructive event:
`gg_explosion_large_v001.wav`

Do not use one generic explosion for every scale if the event is already distinguishable.

### Nuke
Launch/fire:
`gg_nuke_fire_v001.wav`

Detonation/burst:
`gg_nuke_burst_v001.wav`

The nuke launch and nuke burst are separate events.

### Comet
Comet destruction:
`gg_comet_destroyed_v001.wav`

Must coexist with:
```text
+500 score
+1 nuke
```

Audio must not create duplicate reward callbacks.

### Player hit
When the player ship legitimately takes damage:
`gg_player_hit_v001.wav`

IMPORTANT:

This is audio feedback only.

Do not change player damage/life logic.

Do not introduce score penalty.

### Mothership
Each legitimate successful hit:
`gg_mothership_hit_v001.wav`

Final destruction:
`gg_mothership_destroyed_v001.wav`

Do not play the full destruction sound for ordinary hits.

### Victory
On entry to legitimate Victory result state:
`gg_victory_stinger_v001.wav`

Play once per Victory entry unless existing intended behaviour requires otherwise.

### Game Over
On entry to legitimate Game Over state:
`gg_game_over_stinger_v001.wav`

Play once per Game Over entry.

---

# MIX / PLAYBACK RULES

Do not simply set every sound to volume 1.

Tune in context.

Required:
- no clipping;
- no runaway simultaneous stacking;
- weapon fire remains clear;
- player-hit feedback remains perceptible;
- boss/nuke events retain greatest weight;
- UI remains subordinate to gameplay;
- result stingers do not loop;
- sound toggle/mute affects new sounds consistently.

If browser autoplay restrictions apply:
- preserve user-gesture activation;
- do not weaken browser policy;
- document actual runtime behaviour.
