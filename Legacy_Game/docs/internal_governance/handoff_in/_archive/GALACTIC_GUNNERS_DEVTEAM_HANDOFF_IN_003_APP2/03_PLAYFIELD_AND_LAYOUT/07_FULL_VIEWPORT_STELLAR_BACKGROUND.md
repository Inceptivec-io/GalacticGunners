# FULL VIEWPORT STELLAR BACKGROUND

## Observed defect

Current build presents black cinema-style bars / dead regions outside the starfield play area.

This is not acceptable.

## Founder intent

The Galactic Gunners scene should feel like one continuous galactic space environment.

The entire visible runtime viewport must belong to the same stellar universe.

## Required correction

- remove accidental black letterbox/cinema bars;
- fill the full game viewport with approved stellar background treatment;
- keep HUD/result overlays layered on top of the same visual world;
- preserve readability.

Allowed:
- subtle dark overlays/gradients for HUD contrast.

Not allowed:
- unrelated solid black bands that make the game look like a film embedded in a frame;
- gameplay canvas visibly floating inside a black page.

## Implementation

Review:
- page/body background;
- canvas size;
- Phaser scale mode;
- parent container;
- CSS overflow;
- game viewport;
- browser resize behaviour.

## Acceptance

```text
FULL_VIEWPORT_STELLAR_COVERAGE = PASS
UNINTENDED_BLACK_BARS = 0
CANVAS_PAGE_SEAM = 0
```
