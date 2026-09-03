# Canonical Galactic Gunners Spritesheet Standard v1.0

## Universal texture requirements

- Format: PNG, 8-bit RGBA, sRGB.
- Transparent background: required. Baked checkerboards, matte colours and opaque preview backgrounds are prohibited.
- Layout: one horizontal row, frame zero at the left, increasing frame index to the right.
- Maximum texture width or height: 4096 pixels.
- Maximum sheet width selected by this specification: 3072 pixels.
- No rotation during packing.
- No inter-frame overlap.
- No unrecorded gutter, margin or extrusion.
- Runtime derivative generation must be deterministic from source SHA plus definition revision.
- Rendering may scale down. Runtime code must never depend upon a browser implicitly resampling the source sheet.

## Frame classes

### Shooter ships and hazards

- Cell: 512×512 RGBA.
- Art: alpha-trim source frame, scale with preserved aspect ratio to fit inside 464×464.
- Placement: centred horizontally and vertically.
- Authored direction for ships: nose/up is `NORTH`.
- Runtime rotation may orient the complete sprite; source frames remain NORTH.

### Shooter effects and projectiles

- Cell: 256×256 RGBA unless the definition CSV states otherwise.
- Art: alpha-trim, contain within 232×232, centred.
- Effects retain frame order from source.
- Nuke projectile authored direction: `NORTH`.
- Comet authored travel direction: `SOUTH`; the luminous head is below the tail. Runtime rotation aligns SOUTH with the governed velocity vector.

### Boarding characters

- Cell: 256×384 RGBA.
- Maximum eight cells per sheet: 2048×384.
- Art: remove background, alpha-trim each logical pose, scale with preserved aspect ratio to fit within 224×352.
- Placement: horizontal centre; feet/baseline at y=360; 24-pixel bottom safety margin.
- Authored facing: `RIGHT` for Player and Alien source derivatives.
- Facing left is produced using Phaser `flipX`; duplicate left-facing sheets are prohibited.
- Origin: `(0.5, 1.0)`; physics body is defined independently by animation family, never from transparent canvas size.

## Animation semantics

- `loop=true`: idle, walk, run, fire where continuous fire presentation is intended.
- `loop=false`: jump/fall, hit and death.
- Hit/death source sheets must expose named subranges instead of pretending the entire sequence has one meaning.
- No interpolation or invented in-between art is authorised.
- A frame may be held for timing, but the source frame count and sequence cannot be changed silently.

## Metadata required for every runtime sprite

`asset_key`, canonical source, source SHA-256, source dimensions, derivative path, derivative dimensions, frame count, cell width/height, layout, sequence, authored direction, origin, state, frame rate, repeat, trim/background method and compatibility limit.

## Static images

Player laser, enemy laser, shield tile and the Mothership HIT artwork are static textures, not animations. They receive transparent bounded runtime derivatives and explicit authored orientation, but must not be loaded as multi-frame sheets.
