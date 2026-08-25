# PLAYFIELD SCALE / SPACE USAGE

## Observed defect

Current runtime underuses the screen:

- enemy formations too small / too compressed toward top;
- player too small;
- large empty dead zone;
- bunkers visually dominate lower region;
- effects/projectiles are under-emphasised.

## Objective

Create a fuller, more balanced arcade composition while preserving original gameplay behaviour.

## Required tuning

Review and adjust:

- player display scale;
- enemy display scale;
- comet display scale;
- explosion scale;
- projectile scale/readability;
- formation spacing;
- top margin;
- distance between enemy formation and bunker/player zone;
- bunker visual footprint;
- horizontal safe margins.

## Rule

Do not change gameplay collision/logic merely to fill the screen.

Visual scale and collision scale must remain deliberately mapped.

If a visual scale change requires collider adjustment, it must be evidence-backed and preserve intended difficulty.

## Acceptance

```text
PLAYER_READABILITY = PASS
ENEMY_FORMATION_READABILITY = PASS
DEAD_MIDDLE_SPACE = MATERIALLY REDUCED
BUNKERS_DO_NOT_DOMINATE = PASS
PROJECTILE_READABILITY = PASS
```
