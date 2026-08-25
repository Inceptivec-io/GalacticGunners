# PLAYER SHIP SPRITE / ANIMATION CORRECTION

## Observed defect

Current runtime shows the player ship cycling/rotating through sprite material in a way that does not match the original intended feel.

## Required behaviour

The player ship must:

- remain spatially stable;
- maintain correct facing;
- use correct frame slicing;
- use a controlled frame sequence;
- visually read as active/flashing/pulsing/thruster-alive;
- not visibly rotate as if the whole sprite sheet is being displayed;
- not expose unintended frame transitions;
- not alter hitbox position between frames.

## Required implementation

Development must inspect:

- sheet width;
- sheet height;
- intended frame count;
- transparent bounds;
- actual frame widths;
- origin/anchor.

Create one explicit player animation contract.

Do not use generic `frameRate` cycling without confirming the intended visual outcome.

## Acceptance

```text
PLAYER_FRAME_SLICING = CORRECT
PLAYER_ROTATION_ARTIFACT = 0
PLAYER_ANIMATION = CONTROLLED / INTENTIONAL
PLAYER_HITBOX_DRIFT = 0
```
