# REV1 Frame Geometry And Animation Evidence

Player source:
`assets/sprites/ships/gg_player_ship_v002_sheet.png`

Player frame rectangles:

| Frame | X | Y | W | H |
|---|---:|---:|---:|---:|
| stable-0 | 0 | 0 | 543 | 724 |
| stable-1 | 543 | 0 | 543 | 724 |
| stable-2 | 1086 | 0 | 543 | 724 |
| stable-3 | 1629 | 0 | 543 | 724 |

Scout source:
`assets/sprites/ships/gg_enemy_scout_v002_sheet.png`

Scout frame rectangles:

| Frame | X | Y | W | H |
|---|---:|---:|---:|---:|
| stable-0 | 0 | 0 | 480 | 793 |
| stable-1 | 501 | 0 | 480 | 793 |
| stable-2 | 1002 | 0 | 480 | 793 |
| stable-3 | 1503 | 0 | 480 | 793 |

Runtime handling:

- BootScene registers named Phaser texture frames using these explicit rectangles.
- Player uses `Phaser.Physics.Arcade.Sprite` with animation `player.ship.idle`.
- Scout uses `Phaser.Physics.Arcade.Sprite` with animation `enemy.scout.idle`.
- No blanket scout/player `frameWidth`/`frameHeight` slicing is used for these sheets.
- No crop-based one-frame treatment remains in active Player/Scout entities.
- Player diagonal rotation remains 0; projectile rotation is independent of ship orientation.

Runtime evidence:
`docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV1/browser_runtime/runtime-hostile-verification.json`
