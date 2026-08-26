# Galactic Gunners Test & Regression Guide v1.0

## Purpose

Use this guide for Founder/CTO regression testing as the game evolves. A new capability is not accepted merely because CI is green; visible commercial behaviour must remain correct.

## Baseline Level 1 regression matrix

At minimum test 1365×768, 1440×900, 1920×1080, 2560×1440 and 1024×768.

Verify:

- full stellar viewport; no black bars/seams;
- accepted player/scout scale;
- 29×2 / 58 enemies;
- 8 bunkers / 256 shield tiles;
- accepted bunker vertical position and lower flight lane;
- player four-direction movement and bounds;
- player spawn/respawn/invulnerability;
- player laser visible and vertically proportioned;
- projectile sprite/body alignment;
- normal player-origin direct hit;
- real near miss;
- no false left-bunker damage;
- deliberate shield hit affects only intersected geometry;
- enemy projectile collisions;
- pause freezes and resumes exact state;
- nuke projectile/burst/count/rearm/zero-ammo block;
- score arithmetic and no post-result mutation;
- HUD containment and readability.

## Input regression

Keyboard:
- W/A/S/D movement;
- SPACE fire;
- N nuke;
- P pause;
- Enter/Escape where applicable.

Gamepad/touch must be tested on supported mappings and not assumed from keyboard success.

## Terminal-state regression

Verify Game Over/Victory surfaces use production controls, contain no duplicate developer text, freeze final score and route actions correctly.

## H012 config-level regression

For each publishable LevelDefinition verify:

```text
schema PASS
semantic refs PASS
bounds/spawn PASS
performance budget PASS
checksum stable
same seed reproducible
hostile simulation PASS
same-runtime preview PASS
```

Level 1 config migration must compare against the accepted runtime and produce zero unauthorized visual/behaviour regression.

## Admin regression — H012 TARGET

Test:
- anonymous denied;
- normal player denied;
- authorized admin allowed;
- no public route links/sitemap entry;
- create/clone/edit/validate/preview/save/publish/rollback/archive;
- import/export;
- generated draft;
- invalid config cannot publish.

## Offline regression — H012 TARGET

Test remote valid, backend unavailable, invalid remote config, unsupported schema, corrupted cache and packaged fallback. Unvalidated config must never execute.

## Defect evidence

For every defect record:

```text
environment
branch/SHA
viewport/device
steps
expected
actual
severity
screenshot/video if useful
console/network evidence
repeatability
```

Never accept a fix without repeating the original reproduction steps and the adjacent regression path.
