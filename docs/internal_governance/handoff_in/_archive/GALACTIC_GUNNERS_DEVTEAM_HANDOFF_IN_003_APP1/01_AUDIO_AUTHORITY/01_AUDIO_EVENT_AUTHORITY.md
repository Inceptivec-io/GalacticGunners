# AUDIO EVENT AUTHORITY

The included sounds use this locked event mapping.

| Runtime file | Required event |
|---|---|
| `gg_ui_select_v001.wav` | menu/UI selection movement |
| `gg_ui_confirm_v001.wav` | confirm/start/action acceptance |
| `gg_ui_back_v001.wav` | back/cancel |
| `gg_player_laser_v001.wav` | player energy weapon discharge |
| `gg_enemy_laser_v001.wav` | hostile alien weapon discharge |
| `gg_shield_hit_v001.wav` | projectile hit against defensive shield tile |
| `gg_explosion_small_v001.wav` | standard small enemy/explosion event |
| `gg_explosion_large_v001.wav` | large/heavy explosion event |
| `gg_nuke_fire_v001.wav` | nuke launch/arming event |
| `gg_nuke_burst_v001.wav` | nuke detonation |
| `gg_comet_destroyed_v001.wav` | comet destruction/fracture |
| `gg_player_hit_v001.wav` | direct damage impact against player ship |
| `gg_mothership_hit_v001.wav` | successful hit against mothership |
| `gg_mothership_destroyed_v001.wav` | catastrophic mothership destruction |
| `gg_victory_stinger_v001.wav` | Victory result cue |
| `gg_game_over_stinger_v001.wav` | Game Over result cue |

Do not reinterpret filenames.

Do not substitute one event sound for another merely because it is convenient.

## Physical design hierarchy

```text
PLAYER LASER
<
ENEMY LASER
<
SHIELD / PLAYER IMPACT
<
SMALL EXPLOSION
<
LARGE EXPLOSION
<
MOTHERSHIP HIT
<
MOTHERSHIP DESTRUCTION
<
NUKE DETONATION
```

The hierarchy is conceptual. Runtime gain may be tuned to prevent clipping/hearing fatigue, but the perceived event weight must remain distinct.
