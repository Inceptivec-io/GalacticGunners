# GALACTIC GUNNERS — BOARDING MODE PRODUCT DEFINITION v1.0

## Core proposition

Boarding Mode is an optional short-form platform raid layered into the arcade shooter.

```text
SPACE COMBAT
→ DISABLE ELIGIBLE SHIP
→ CHOOSE BOARD OR IGNORE
→ DOCK
→ PLATFORM RAID
→ ESCAPE OR DIE
→ RESUME SPACE COMBAT
```

## Timer

30–60 seconds before the disabled alien ship explodes.

Exact timer distribution may vary by ship class later.

## Failure

If player remains aboard at zero:
- alien ship explodes;
- existing game life is lost;
- if lives remain, player resumes in own ship;
- if no lives remain, normal Game Over.

## Success

Player returns to airlock before zero:
- approved loot/rewards retained;
- boarding scene exits;
- shooter state resumes.

## Player systems to design later

When Boarding workstream begins, explicitly settle:
- health/hit bar;
- damage values;
- whether health resets between raids;
- whether health persists during one raid;
- player invulnerability windows;
- enemy shot/melee damage;
- fall hazards if any.

## Economy to design later

Explicitly settle:
- alien kill points;
- barrel/crate points;
- time-on-ship scoring;
- time-remaining bonus;
- escape bonus;
- life drop rarity;
- nuke drop rarity;
- empty loot;
- hostile surprise;
- ship-class reward weighting.

No exact value exists until Founder approval.

## Asset-design rule

Boarding asset specifications are generated only after mechanics for that asset family are settled.

Every art spec must include geometry, dimensions, frames, anchor, collision, interaction state, material, modular connection and runtime use.

Filename-only rough requirements are prohibited.
