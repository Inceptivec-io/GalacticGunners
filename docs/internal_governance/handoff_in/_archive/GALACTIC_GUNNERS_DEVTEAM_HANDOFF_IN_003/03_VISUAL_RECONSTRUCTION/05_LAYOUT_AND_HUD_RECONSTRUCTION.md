# LAYOUT / HUD RECONSTRUCTION

## General

Use responsive/safe-area layout based on actual game dimensions.

Do not repeat previous overlap/clipping defects.

## Gameplay HUD

Required live values:
- score;
- lives;
- replay/restart allowance;
- nukes;
- rearm.

Use:
- supplied display font;
- life icon;
- nuke icon.

Required zones:

```text
TOP LEFT:
score

TOP RIGHT:
replay / restart allowance

BOTTOM LEFT:
life icon + lives

BOTTOM RIGHT:
nuke icon + nukes
rearm positioned separately with no overlap
```

All values are event-driven/live.

## Scaling

Player/enemies must be visually legible and closer to the original game's practical proportions.

Do not make the player microscopic.

Enemy rows should retain classic arcade formation character while showing the new asset detail.

## Info screen

Reconstruct using:
- supplied fonts;
- controlled white/pale/cyan body copy;
- green only as purposeful accent;
- structured story/instruction blocks;
- separate controls;
- live back action.

No wall of oversized neon-green system text.
