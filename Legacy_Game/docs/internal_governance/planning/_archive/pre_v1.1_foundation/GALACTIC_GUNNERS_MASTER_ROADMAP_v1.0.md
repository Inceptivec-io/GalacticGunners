# GALACTIC GUNNERS MASTER ROADMAP v1.0

## PHASE 0 — GOVERNED COMMERCIAL FOUNDATION

Status: SUBSTANTIALLY COMPLETE.

Includes:
- commercial repository;
- historical/provenance separation;
- licence/notices;
- external boundary;
- POST_BOX rules;
- internal governance;
- registers/evidence;
- AGENTS.md;
- Docker Founder runtime.

PASS:
```text
GOVERNANCE SUBSTRATE = PRESENT
POST_BOX CLOSED STATE = CORRECT
FOUNDER LOCAL RUNTIME = AVAILABLE
```

---

## PHASE 1 — VISUAL RECONSTRUCTION / COMMERCIAL REMASTER

Purpose:
reconstruct the complete visual estate so it is faithful to the original Galactic Gunners while being fully owned and materially better in quality.

### P1.1 Founder asset reconstruction
Current state: ACTIVE.

Required estate includes:
- player;
- scout;
- cruiser;
- destroyer;
- mothership;
- asteroid;
- comet;
- explosion;
- nuke;
- lasers;
- starfields;
- UI;
- branding;
- typography;
- shield tile;
- game-over;
- victory;
- touch/controller indicators.

### P1.2 Animation restoration
Restore:
- player engine activity;
- scout activity;
- cruiser activity;
- destroyer animation;
- mothership flash/damage/energy;
- asteroid/comet motion;
- nuke/explosion activity;
- pointer/touch feedback.

No core ship may become static where original behaviour had activity.

### P1.3 Layout / UI
Correct:
- menu hierarchy;
- duplicate logo issues;
- info readability;
- HUD overlap;
- game-over layout;
- victory layout;
- responsive safe zones.

### P1.4 Typography
Replace generic Arial/Helvetica presentation with owned arcade-appropriate typography.

### P1.5 Shield/base fidelity
Preserve actual code-driven shield model:

```text
SHIELD
=
MATRIX OF INDIVIDUAL DESTRUCTIBLE TILES
```

Do NOT replace with one bunker image.

Use a modular owned shield tile.

### P1.6 Founder Docker visual acceptance
No visual integration closes without Founder manual review.

PASS:
```text
FOUNDER VISUAL ACCEPTANCE = PASS
STATIC CORE SHIPS = 0
HUD OVERLAP = 0
P0 VISUAL DEFECTS = 0
```

---

## PHASE 2 — CORE SCORING / REPLAYABILITY

Locked score model:

```text
LASER TARGET              +5
ASTEROID DESTROYED        +10
SCOUT DESTROYED           +25
SHIP DESTROYED            +50
MOTHERSHIP HIT            +50
MOTHERSHIP DESTROYED      +1000
COMET DESTROYED           +500
COMET DESTROYED           +1 NUKE
ALIEN HIT ON SHIELD TILE  -1
```

Explicit exclusion:

```text
PLAYER SHIP DAMAGE = NO NEW SCORE PENALTY
```

Player damage/life gameplay must not be changed by this scoring work.

Requirements:
- deterministic score events;
- no duplicate awards;
- no missed events;
- immediate HUD update;
- exact collision source mapping;
- shield penalty only on enemy/alien hit removing a shield tile;
- player fire destroying a shield tile does not automatically create a penalty unless later authorised.

PASS:
```text
ALL LOCKED SCORE EVENTS = TESTED
DUPLICATE SCORE EVENTS = 0
UNAUTHORISED PLAYER DAMAGE SCORE CHANGES = 0
```

---

## PHASE 3 — PLAYER IDENTITY / GLOBAL LEADERBOARD

Purpose:
support global replayability and competition.

Required:
- lightweight player identity;
- run/session identity;
- validated score submission;
- global ranking;
- tie behaviour;
- duplicate submission protection;
- minimal privacy/data;
- offline/degraded behaviour;
- game remains playable without leaderboard.

PASS:
```text
LEADERBOARD = OPERATIONAL
GAMEPLAY WITHOUT LEADERBOARD = PASS
```

---

## PHASE 4 — BOARDING / PLATFORM MODE ARCHITECTURE

Purpose:
add a second gameplay dimension without replacing the arcade shooter.

Core loop:

```text
ELIGIBLE ALIEN SHIP
→ MAY BECOME DISABLED
→ PLAYER MAY IGNORE OR DOCK
→ SHOOTER STATE PRESERVED
→ BOARDING PLATFORM SCENE
→ 30–60 SECOND DESTRUCTION TIMER
→ FIGHT / LOOT / PLATFORM
→ RETURN TO AIRLOCK
→ UNDOCK
→ RESUME SHOOTER
```

### Disabled ship state
- stops firing;
- drifts;
- visibly damaged;
- flashes/sparks;
- exposes docking state.

### Docking
Optional player decision.
Requires explicit docking interaction.

### Architecture
Separate Phaser scene/system family:

```text
BoardingController
BoardingScene
BoardingPlayer
BoardingRoom
BoardingEnemy
BoardingLoot
BoardingTimer
```

Do not embed platform gameplay through Level1/Level2/BossLevel.

### State transfer
Boarding entry must preserve:
- source scene;
- score;
- lives;
- nukes;
- ship type;
- boardable instance;
- relevant encounter state.

Boarding return must resolve:
- score delta;
- lives delta;
- nukes delta;
- escaped;
- player died;
- boarded ship disposition.

---

## PHASE 5 — BOARDING PLATFORM RUNTIME

### Player
Initial controls:
- left;
- right;
- jump;
- fire.

Do not add unnecessary complexity initially.

### Enemies
Platform-specific alien crew.

### Interiors
Handcrafted modular room system:
- airlock;
- corridor;
- cargo;
- engine;
- weapons;
- crew;
- bridge;
- reactor.

Randomise valid room composition.

Do not use uncontrolled procedural level generation.

### Timer
30–60 seconds.
May later vary by ship class.

### Failure
```text
TIMER EXPIRES WHILE ABOARD
→ ALIEN SHIP EXPLODES
→ PLAYER LOSES ONE EXISTING GAME LIFE
→ LIVES REMAIN: RESUME SHOOTER
→ NO LIVES: NORMAL GAME OVER
```

No separate Boarding life system.

### Success
Return to airlock before destruction:
- retain approved loot;
- return to player ship;
- resume preserved shooter state.

---

## PHASE 6 — BOARDING ECONOMY / REWARD MODEL

This phase is intentionally deferred until Boarding architecture/runtime is being designed.

Items to settle at that time include:
- time-spent-on-ship scoring;
- time-remaining escape bonus;
- barrel/crate point values;
- alien kill point values;
- room bonuses;
- life reward rarity;
- nuke reward rarity;
- ship-class risk/reward weighting;
- boarding enemy strength;
- boarding-player health/hit bar;
- boarding damage model;
- whether damage persists across boarding;
- loot probability tables;
- possible empty barrels/crates;
- possible hostile surprises.

None of these values are authorised merely by appearing here.

Founder approval is required before implementation.

---

## PHASE 7 — BOARDING ASSET / ART SYSTEM

Boarding visual assets must be specified only AFTER the relevant runtime mechanics are settled.

No future asset pack may repeat the mistake of giving only filenames and rough ideas.

For every Boarding asset family, specification must include:
- exact runtime role;
- exact dimensions;
- frame size/count;
- facing/orientation;
- anchor/origin;
- collision relationship;
- animation states;
- transparency/padding;
- palette/material;
- neighbouring modular assets;
- tiling/connection rules;
- runtime scale;
- interaction states;
- code consumption expectations.

Examples:
- Boarding player: idle/run/jump/fire/hit/death/airlock;
- alien crew: idle/move/fire/hit/death;
- doors/airlocks: closed/open/locked/damaged;
- room modules: floor/wall/ceiling connection contract;
- barrels/crates: intact/hit/destroyed;
- HUD: timer/health/loot;
- reactor: normal/critical/destruction state.

Boarding art is derived from settled mechanics, not the other way around.

---

## PHASE 8 — BOARDING SCORE / LEADERBOARD INTEGRATION

After Boarding mechanics and economy are approved:
- define Boarding score event namespace;
- alien kill scoring;
- barrel/crate scoring;
- optional escape bonus;
- optional time bonus;
- rare-room bonuses;
- one total game score feeds leaderboard;
- event origin may be recorded internally for balancing.

All exact Boarding point values remain Founder-controlled.

---

## PHASE 9 — FULL GAME REGRESSION

Must test:
- menu;
- info;
- Level 1;
- Level 2;
- boss;
- pause/resume;
- game over;
- victory;
- scoring;
- leaderboard;
- ship disable;
- docking;
- boarding;
- timer;
- escape;
- boarding death;
- shooter resume;
- keyboard;
- touch;
- controller;
- Docker Founder acceptance.

---

## PHASE 10 — DEVICE / INPUT ASSURANCE

Tier 1:
- Web;
- Windows;
- Android;
- iOS/iPadOS.

Tier 2:
- macOS;
- tablets;
- touchscreen laptops;
- wider controller support.

Inputs:
- keyboard;
- touch;
- Xbox controller;
- Haute M-series;
- additional common gamepads.

Both shooter and Boarding mode must pass.

---

## PHASE 11 — COMMERCIAL PACKAGING

Includes:
- version/build metadata;
- icons;
- splash/loading;
- screenshots;
- privacy;
- terms;
- notices;
- credits;
- contributor acknowledgement;
- Aurora commercial documentation;
- store/rating requirements;
- price confirmation;
- platform packages.

No console launch requirement.

---

## PHASE 12 — RELEASE CANDIDATE

Required:

```text
FOUNDER VISUAL ACCEPTANCE = PASS
FOUNDER GAMEPLAY ACCEPTANCE = PASS
SCORING = PASS
LEADERBOARD = PASS
BOARDING MODE = PASS
DEVICE MATRIX = PASS
COMMERCIAL DOCUMENTS = PASS
KNOWN P0/P1 RELEASE DEFECTS = 0
```

---

## PHASE 13 — LAUNCH / MARKET VALIDATION

Track:
- installs/sales;
- crashes;
- completion;
- score distribution;
- leaderboard participation;
- Boarding usage;
- Boarding success/failure;
- controller use;
- platform mix;
- reviews;
- replay/retention.

---

## PHASE 14 — EVIDENCE-LED EXPANSION

Only after real usage:
- more Boarding room modules;
- more boardable ship classes;
- boss/mothership boarding;
- new enemies;
- new levels;
- achievements;
- challenges;
- new modes;
- console feasibility;
- additional commercial content.
