# Galactic Gunners UI/UX Review & Snagging Guide v1.0

## Review principle

Judge the game as a commercial player-facing product, not as a technical demo.

## Visual acceptance baseline

```text
VISUAL_COMPOSITION = COMMERCIAL
ASSET_UTILISATION = INTENTIONAL
TYPOGRAPHY = PRODUCTION
SPACING / SCALE / HIERARCHY = PRODUCTION
PLAYER-FACING DEV TERMS = 0
PROTOTYPE-LOOKING SURFACES = 0
FULL STELLAR VIEWPORT = PASS
```

## Review areas

### Main menu
- hero/key art full and correctly cropped;
- logo/tagline hierarchy clear;
- controls readable and production-quality;
- no developer terminology;
- hover/active/click states intentional;
- audio/selection feedback appropriate.

### Gameplay
- player visually subordinate to field, not oversized;
- enemies readable without dominating;
- lasers retain intended length/thickness and are never visibly squashed;
- shields appear deliberate and evenly composed;
- HUD does not obscure play;
- lives lower-left and nuke/Energise lower-right remain readable;
- explosions/projectiles do not show sprite-sheet bleed;
- pause surface is visibly a pause state.

### Responsive composition
Review all supported viewport sizes for clipping, dead zones, unsafe margins, overlapping HUD, distorted assets, inconsistent player/enemy scaling and page/canvas seams.

### Interaction
- clickable area matches visible button/control;
- selected/click state is visibly distinct;
- keyboard/gamepad/touch focus behaviour does not conflict;
- no accidental double action;
- pause/resume does not duplicate listeners/timers.

### Results
- score shown once and consistently;
- Game Over/Victory actions use designed controls;
- no duplicate text buttons;
- terminal state does not continue mutating score/lives.

### Hidden admin — H012 TARGET
Admin UI is assessed separately from player UI. It may be information-dense, but must remain coherent, safe and efficient. It must never leak into player navigation.

## Snag severity

```text
P0 — release/security/data-integrity blocker
P1 — major gameplay/commercial failure
P2 — meaningful usability/visual defect
P3 — minor polish or low-impact inconsistency
```

Examples:
- invisible player laser / wrong collision: P1;
- admin authorization bypass: P0;
- clipped HUD at common viewport: P1/P2 depending impact;
- inconsistent spacing with no usability impact: P3.

## Snag record

Every snag should contain:

```text
ID
SHA/environment
screen/scene
viewport/device
severity
reproduction
expected
actual
visual evidence
acceptance criterion
status
```

Do not combine unrelated defects into one snag. Close only after retest on the exact corrected SHA.
