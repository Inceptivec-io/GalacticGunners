# VIEWPORT CONTAINMENT / SAFE AREAS

## Observed defect

Important runtime objects/effects are reaching or crossing unintended page edges.

## Required correction

Verify containment for:

- player;
- enemies;
- comets;
- explosions;
- nuke effects;
- HUD;
- Game Over;
- Victory;
- interactive buttons.

## Rules

- no important interactive element off-screen;
- no HUD clipping;
- no effect spawning into black/dead page regions;
- no result panel outside safe area;
- no text cut by viewport;
- preserve responsive behaviour.

If particle/explosion visuals intentionally extend beyond an object's collider, they may visually bloom, but must not create page overflow or appear outside the intended game viewport.

## Acceptance

```text
IMPORTANT_UI_OFFSCREEN = 0
HUD_CLIPPING = 0
RESULT_PANEL_CLIPPING = 0
PAGE_OVERFLOW_ARTIFACTS = 0
```
