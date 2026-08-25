# GAME OVER CONTROL RECONSTRUCTION

## Observed defect

Current screen shows:

Embedded designed buttons:
- MAIN MENU
- REPLAY
- TRY AGAIN

AND duplicate runtime text controls:
- RESTART
- MENU

The duplicate text controls must be removed.

## Visual authority

The embedded Game Over panel buttons are the sole visible control surface.

Development must bind actual interactive hit areas to those visible buttons.

## Required visible controls

```text
MAIN MENU
REPLAY
TRY AGAIN
```

No extra textual `RESTART` or `MENU` controls underneath.

## Runtime behaviour

### MAIN MENU
Must return to the main menu/title scene.

### REPLAY
Must restart gameplay directly.

It must NOT route through main menu.

### TRY AGAIN
Must restart/re-enter gameplay directly.

It must NOT route through main menu.

Replay and Try Again may differ in restart semantics if the existing original game provides distinct concepts. Development must inspect the historical/current gameplay flow and preserve the appropriate distinction.

If the codebase does not currently expose a meaningful distinction:
- do not invent commercial logic silently;
- route both to direct gameplay restart rather than menu;
- record that semantic consolidation for Founder review.

## Interaction

Buttons must support:
- mouse/pointer;
- touch;
- keyboard/controller focus if current result scene supports them.

## Acceptance

```text
DUPLICATE_TEXT_RESULT_BUTTONS = 0
MAIN_MENU -> MENU = PASS
REPLAY -> DIRECT_GAMEPLAY = PASS
TRY_AGAIN -> DIRECT_GAMEPLAY = PASS
REPLAY/TRY_AGAIN -> MENU = FAIL
```
