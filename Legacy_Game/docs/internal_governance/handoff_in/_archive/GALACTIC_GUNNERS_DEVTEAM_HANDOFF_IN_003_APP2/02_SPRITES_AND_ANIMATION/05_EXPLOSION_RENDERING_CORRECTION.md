# EXPLOSION RENDERING CORRECTION

## Observed defect

Explosions are rendering as square/hard-edged blocks.

This is a release-blocking visual defect.

## Required visual result

Explosions must appear as:

- rounded/blooming;
- bright in centre;
- dissipating;
- alpha-faded;
- transparent around the effect;
- free of visible rectangular sprite boundaries.

## Required investigation

Development must verify:

- frame dimensions;
- source alpha;
- preload type;
- spritesheet frame width/height;
- animation frame order;
- scale;
- blend/alpha handling;
- cleanup on animation completion.

## Small explosion

Use for:
- routine enemy destruction;
- compact hit/destruction events.

## Large explosion

Use for:
- heavier ships;
- larger destruction events;
- boss-adjacent effects where appropriate.

## Requirements

- no black rectangle;
- no hard square edge;
- no visible frame tile;
- effect fades/disappears cleanly;
- alpha respected;
- scale matches object size.

If source frames themselves contain unacceptable hard edges after correct extraction, create documented runtime derivatives/crops/masks from the supplied source artwork without inventing a new art style.

## Acceptance

```text
VISIBLE_SQUARE_EXPLOSION_BLOCKS = 0
ALPHA_ARTIFACTS = 0
EXPLOSION_FRAME_BLEED = 0
SMALL/LARGE SCALE DIFFERENTIATION = PASS
EXPLOSION_CLEANUP = PASS
```
