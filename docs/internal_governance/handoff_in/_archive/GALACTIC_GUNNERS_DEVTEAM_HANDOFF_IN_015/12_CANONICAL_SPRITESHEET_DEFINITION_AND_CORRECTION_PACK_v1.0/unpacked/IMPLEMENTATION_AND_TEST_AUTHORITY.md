# H015 Sprite Runtime Implementation and Test Authority

## Controlling correction

Do not patch WebKit timeouts and do not special-case the nuke. Implement one deterministic asset compiler that consumes the two definition CSVs and emits the specified derivatives and a generated JSON/TypeScript catalogue.

## Required implementation

1. Preserve every canonical source unchanged.
2. Add a versioned sprite-definition source containing every field in the CSVs.
3. Compile deterministic derivatives into the declared generated paths.
4. Hash source and derivative bytes and record dimensions/frame metadata.
5. Fail if source dimensions or hashes drift without a reviewed definition revision.
6. Fail if a derivative exceeds 4096 on either axis, lacks RGBA transparency, has the wrong number of cells, has non-uniform derivative cells or contains unexpected opaque background pixels.
7. Replace `FRAME_RECTS` hand-maintenance with generated metadata.
8. Replace whole-sheet Boarding `load.image()` plus `setCrop()` with generated `load.spritesheet()` calls and named Phaser animations.
9. Remove hard-coded crop rectangles from `BoardingScene`.
10. Bind Player and Alien scene state to idle, walk/run, jump/fall, fire, hit and death animations.
11. Bind Shooter Cruiser, Destroyer, Mothership, asteroid and comet to their complete frame/variant definitions.
12. Designer thumbnails use frame zero from the same generated catalogue.

## Orientation rules

- Shooter ships: source NORTH; runtime may rotate.
- Nuke: source NORTH; align with velocity.
- Lasers: source EAST; align with velocity.
- Comets: source SOUTH; align the head to velocity and tail opposite velocity.
- Boarding characters: source RIGHT; use `flipX` for LEFT.
- Never maintain separately mirrored art.

## Required positive tests

- Definition parser accepts every declared source.
- Every source dimension and frame count matches this pack.
- Compiler emits exact declared derivative dimensions.
- Every derivative is within the portability limit.
- Every animation enumerates exactly its declared frames and sequence.
- Transparent backgrounds remain transparent in corner and inter-frame samples.
- Chromium, Firefox and WebKit load all derivatives without error or stall.
- A visual animation harness plays every animation at native catalogue timing and captures first, middle and final frames.
- Ordinary Shooter play shows each ship animation/variant, both hazard classes and both nuke animations.
- Ordinary Boarding play visibly enters every required Player and Alien animation state.

## Required negative and hostile tests

- Source dimension drift fails compilation.
- Incorrect frame count fails compilation.
- Sheet over 4096 pixels fails admission.
- Baked checkerboard/background leakage fails alpha validation.
- Missing derivative or catalogue entry fails BootScene before play with a visible safe error.
- Invalid state name or out-of-range frame fails tests and cannot silently fall back to frame zero.
- WebKit decode/load failure is surfaced; it cannot be hidden by timeout extension or browser exclusion.
- Deliberately swapped orientation causes the orientation assertion to fail.
- Deliberately reordered frames causes sequence/hash validation to fail.

## Visual review evidence

Generate a labelled contact sheet from derivatives, not canonical sources. Each row identifies asset key, state, frame index, authored direction, derivative SHA and source SHA. Capture animation video in all three browser engines. Pixel evidence complements executable assertions; it does not replace them.

## Closure values

The affected H015 rows remain FAIL until all conditions are derived:

```text
SPRITE_SOURCE_INVENTORY=PASS
SPRITE_DEFINITION_COVERAGE=PASS
SPRITE_FRAME_COUNT=PASS
SPRITE_ORIENTATION=PASS
SPRITE_BACKGROUND_ALPHA=PASS
SPRITE_PORTABILITY_LIMIT=PASS
SPRITE_GENERATION_DETERMINISM=PASS
SHOOTER_ANIMATION_RUNTIME=PASS
BOARDING_ANIMATION_RUNTIME=PASS
DESIGNER_THUMBNAIL_AUTHORITY=PASS
CHROMIUM_SPRITE_ASSURANCE=PASS
FIREFOX_SPRITE_ASSURANCE=PASS
WEBKIT_SPRITE_ASSURANCE=PASS
SPRITE_NEGATIVE_TESTS=PASS
```

After this tranche passes, continue to the next incomplete H015 catalogue row without requesting Founder testing.
