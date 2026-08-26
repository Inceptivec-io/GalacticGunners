# REV3 TECHNICAL SPECIFICATION

## Retain current progress

Retain:
- commercial hero/menu direction;
- full-bleed stellar viewport;
- PlayfieldLayout;
- 29 x 2 enemy formation;
- four-direction movement;
- respawn/regeneration;
- individual shield tiles;
- runtime-hostile CI;
- canonical asset sync;
- backend/GameRun integration.

Do not regress these.

## 1. Player scale — primary calibration

Founder target: player ship approximately 40% smaller than REV2.

Current PlayfieldLayout uses player height near 15% of viewport height.

Target:

`REV3 player dimensions = REV2 dimensions x 0.60`, tolerance ±0.05.

At 1365x768, REV2 is approximately 86x115. REV3 target is approximately 52x69.

Use responsive ratios, not only absolute pixels. Preserve source frame aspect ratio.

Required:
- `PLAYER_SCALE_REV2_RATIO = 0.60 ± 0.05`
- player readable;
- player does not dominate playfield;
- no aspect distortion.

## 2. Scout scale

Founder target: scouts 5–10% larger than REV2.

Target:
`REV3 scout scale = REV2 x 1.075`
acceptable range 1.05–1.10.

Keep:
- 29 columns;
- 2 rows;
- 58 enemies;
- formation inside approved bounds.

Do not solve by widening the formation or reducing count.

## 3. Laser visual orientation

Canonical source dimensions:
- player laser: 1912 x 823;
- enemy laser: 1536 x 1024.

These source images are horizontally oriented.

Current pattern sizes a vertical shape then rotates ±90°, which turns the long local axis sideways.

Correct local model before rotation:

```text
local width  = beam length
local height = beam thickness
angle        = ±90
```

World visual after rotation:

```text
world width  = thickness
world height = length
```

Target world appearance:
- player laser length ~42–58 px, thickness ~7–11 px;
- enemy laser length ~38–54 px, thickness ~7–11 px.

Derive final ratios from canonical visible-alpha bounds.

Required:
- long axis vertical;
- source aspect preserved;
- no squash;
- beam width < beam length.

## 4. Laser physics body

Phaser Arcade bodies are axis-aligned; they do not rotate with the sprite.

After visual rotation set body intentionally in world axes:

```text
body width  = beam/core thickness
body height = beam/core length
```

Required debug evidence:
- sprite/core aligned with body;
- no hidden oversized hitbox.

## 5. Laser speed / tunnelling / real hit registration

REV2:
- player speed 760;
- enemy speed 300.

Accepted legacy-derived baseline:
- player velocity = gameplay height / 3;
- enemy velocity = gameplay height x 0.078125.

Use these as baseline or explicitly justify measured v1 tuning.

Normal gameplay shots must hit.

If faster shots are retained, implement narrow swept collision from previous to current projectile position. Do not reintroduce broad invisible collision envelopes.

Required:
- normal player-origin aligned shot hits scout;
- normal player-origin near miss does not;
- no tunnelling;
- one projectile resolves once.

## 6. Real-origin hostile laser tests

Mandatory CI test:

1. start Level1 normally;
2. move player under a scout with real controls;
3. press Space;
4. shot spawns from player weapon/nose;
5. shot traverses normal combat distance;
6. real collision destroys scout;
7. score changes exactly +25.

Near-miss:
- offset player;
- press Space;
- shot traverses;
- score unchanged;
- scout alive.

Target-adjacent QA injection may remain for edge testing but cannot be acceptance proof for normal firing.

## 7. Bunker denominator — restore 8

REV2 creates 4 bunkers / 128 tiles.

Accepted Level 1 baseline declares 8 shields/bunkers.

Restore:
- bunker count = 8;
- existing locked matrix per bunker;
- 32 active tiles per bunker;
- initial shield tiles = 256.

Hostile suite must stop certifying 128.

## 8. Shield vertical position

Founder target: shield row slightly closer to the bottom while leaving clear flight space underneath equal to about two NEW player ship heights.

Derive:

`gap below shield bottom = movement/playfield bottom - shieldZone.bottom`

Target:
`2.0–2.25 x REV3 player height`

Required:
- lower flight lane ratio in range;
- player spawn clear;
- player can fly below bunkers.

## 9. Nukes — restore foundational baseline

Nukes are absent and are foundational.

Accepted:
- max nukes = 2;
- keyboard N;
- gamepad Y;
- initial ReArm = 150/150.

Resolve canonical active/cleared assets:
- `gg_nuke_projectile_v002_sheet.png`;
- `gg_nuke_burst_v002_sheet.png`;
- `gg_hud_nuke_icon_v002.png`;
- `gg_nuke_fire_v001.wav`;
- `gg_nuke_burst_v001.wav`.

Extend InputSystem with `nuke`.

Create semantic NukeSystem or equivalent durable authority.

Initial:
```text
currentNukes = 2
maxNukes = 2
rearmProgress = 150
rearmMax = 150
```

On fire:
- currentNukes -1;
- rearm resets;
- canonical projectile;
- nuke fire audio;
- canonical burst;
- burst audio.

Burst may destroy multiple scouts but each scout resolves once and scores its normal +25 exactly once.
No special extra nuke score.
Nuke count cannot go negative.

## 10. Nuke / ReArm HUD

Show canonical nuke icon, current count and `REARM current/max`.

Initial:
```text
2
REARM 150/150
```

After firing the HUD must reflect live system state.

## 11. Pause — restore P

Pause is absent.

Accepted:
`P = PAUSE`.

InputSystem must expose `pause`, plus accepted gamepad pause/start mapping.

Preferred architecture:
- Level1 pauses;
- semantic PauseScene overlay launches;
- PauseScene owns resume input;
- resume returns exact Level1 state.

Resolve canonical assets where appropriate:
- `gg_pause_screen_v2.1_4k_uhd_master.png`;
- `gg_ui_pause_v002.png`;
- `gg_ui_resume_v002.png`;
- UI audio.

Required:
- P pauses;
- physics/timers/projectiles/player freeze;
- score/lives freeze;
- P/resume resumes exact state;
- no duplicate timers/listeners.

## 12. Scale hostile gates

Across viewport matrix record numeric ratios:

- player scale relative REV2 = 0.60 ±0.05;
- scout scale relative REV2 = 1.05–1.10;
- no clipping;
- no aspect distortion;
- no formation overlap.

Return REV2 vs REV3 vs legacy screenshots.

## 13. Laser visual regression gate

Fail if:
- world laser is wider than long;
- beam is squashed;
- body/core diverge;
- beam appears as a short blob instead of the supplied elongated design.

Capture player/enemy laser mid-flight plus physics-debug versions.

## 14. Hostile suite REV3

Must test:

Scale/layout:
- player 40% reduction;
- scout +5–10%;
- 58 enemies;
- 8 bunkers;
- 256 tiles;
- shield lower-lane gap 2.0–2.25 player heights.

Normal lasers:
- real player-origin direct hit;
- real player-origin near miss;
- vertical beam aspect;
- body alignment;
- projectile cleanup.

Nukes:
- initial count 2;
- N fires;
- gamepad Y normalization;
- count decrements once;
- no negative count;
- burst appears;
- multi-kill resolves each enemy once;
- score exact;
- rearm resets/progresses;
- HUD matches state.

Pause:
- P pauses;
- positions freeze;
- score/lives freeze;
- resume;
- repeated pause/resume does not duplicate listeners/timers.

Retain:
- four-direction flight;
- diagonal normalization;
- player hit/respawn;
- invulnerability;
- shields;
- resize;
- backend/offline;
- terminal/menu/replay;
- console/network.

## 15. CI

Required jobs:
- backend;
- client-and-game;
- docker-smoke;
- runtime-hostile.

A build with broken pause, absent nukes, squashed lasers, normal shots that do not hit, wrong bunker count, or wrong scale must fail CI.
