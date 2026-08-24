# GALACTIC GUNNERS MASTER PLAYLIST v1.0

## A. CURRENTNESS

- `GG-CUR-001` Admit this Roadmap v1.0 as current on Founder issue.
- `GG-CUR-002` Admit this Playlist v1.0 as current on Founder issue.
- `GG-CUR-003` Preserve all predecessor planning documents.
- `GG-CUR-004` One current Roadmap only.
- `GG-CUR-005` One current Playlist only.
- `GG-CUR-006` Playlist items do not grant execution authority.
- `GG-CUR-007` Every execution movement requires Founder Handoff/Commission.

PASS:
```text
CURRENT ROADMAP = 1
CURRENT PLAYLIST = 1
PARALLEL UNAUTHORISED PROGRAMMES = 0
```

---

## B. HOLD WHILE FOUNDER REBUILDS ASSETS

- `GG-VIS-001` Do not perform further visual integration while Founder asset estate incomplete.
- `GG-VIS-002` Preserve rejected Docker visual build as defect evidence.
- `GG-VIS-003` Rejected build is not design authority.
- `GG-VIS-004` Historical original remains behaviour/visual-grammar reference.
- `GG-VIS-005` Founder completes visual asset estate.
- `GG-VIS-006` Receive complete asset estate.
- `GG-VIS-007` Inventory filenames.
- `GG-VIS-008` Inventory dimensions.
- `GG-VIS-009` Inventory frame counts.
- `GG-VIS-010` Verify ownership/provenance.
- `GG-VIS-011` Build exact old/current → Founder replacement matrix.
- `GG-VIS-012` Identify every runtime call site before replacement.

PASS:
```text
FOUNDER ASSET ESTATE = COMPLETE
UNKNOWN REQUIRED ASSET = 0
UNKNOWN RUNTIME CALL SITE = 0
```

---

## C. VISUAL RECONSTRUCTION INTEGRATION

- `GG-VIS-020` Integrate player ship animation.
- `GG-VIS-021` Integrate scout animation.
- `GG-VIS-022` Integrate cruiser animation.
- `GG-VIS-023` Integrate destroyer animation.
- `GG-VIS-024` Integrate mothership animation.
- `GG-VIS-025` Restore mothership flash/damage/energy behaviour.
- `GG-VIS-026` Integrate asteroid animation.
- `GG-VIS-027` Integrate comet animation.
- `GG-VIS-028` Integrate explosion effects.
- `GG-VIS-029` Integrate nuke projectile/burst.
- `GG-VIS-030` Integrate lasers.
- `GG-VIS-031` Integrate background estate.
- `GG-VIS-032` Integrate owned typography.
- `GG-VIS-033` Integrate branding.
- `GG-VIS-034` Integrate UI controls.
- `GG-VIS-035` Integrate modular shield tile.
- `GG-VIS-036` Preserve shield matrix.
- `GG-VIS-037` Preserve per-tile destruction.
- `GG-VIS-038` Correct menu composition.
- `GG-VIS-039` Correct info hierarchy.
- `GG-VIS-040` Correct HUD overlap.
- `GG-VIS-041` Correct Game Over.
- `GG-VIS-042` Correct Victory.
- `GG-VIS-043` Verify no static core-ship regression.
- `GG-VIS-044` Verify original-like visual proportions.
- `GG-VIS-045` Docker Founder visual review.

PASS:
```text
FOUNDER VISUAL ACCEPTANCE = PASS
P0 VISUAL DEFECTS = 0
```

---

## D. LOCKED CORE SCORE MODEL

Founder-authorised values:

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

- `GG-SCORE-001` Create explicit score event constants.
- `GG-SCORE-002` Map each score event to exact collision/action.
- `GG-SCORE-003` Implement +5 laser target.
- `GG-SCORE-004` Implement +10 asteroid.
- `GG-SCORE-005` Implement +25 scout.
- `GG-SCORE-006` Implement +50 ship.
- `GG-SCORE-007` Implement +50 mothership hit.
- `GG-SCORE-008` Implement +1000 mothership destruction.
- `GG-SCORE-009` Implement +500 comet.
- `GG-SCORE-010` Implement comet +1 nuke.
- `GG-SCORE-011` Enemy/alien hit removes one shield tile → -1.
- `GG-SCORE-012` Player projectile on shield → no automatic score penalty.
- `GG-SCORE-013` Do not change player ship hit/damage/life behaviour.
- `GG-SCORE-014` Prevent duplicate scoring.
- `GG-SCORE-015` Prevent missed score events.
- `GG-SCORE-016` Update score HUD immediately.
- `GG-SCORE-017` Define test fixtures for each event.
- `GG-SCORE-018` Founder decides negative-score floor later if required.

PASS:
```text
LOCKED SCORE EVENTS TESTED = 100%
PLAYER SHIP SCORE PENALTY = 0
```

---

## E. LEADERBOARD

- `GG-LB-001` Define minimum player identity.
- `GG-LB-002` Define run/session identity.
- `GG-LB-003` Define score-submission object.
- `GG-LB-004` Define submission timing.
- `GG-LB-005` Implement minimum authoritative validation.
- `GG-LB-006` Implement global ranking.
- `GG-LB-007` Define ties.
- `GG-LB-008` Define display-name rules.
- `GG-LB-009` Define privacy/minimum data.
- `GG-LB-010` Define offline/degraded behaviour.
- `GG-LB-011` Game remains playable without leaderboard.
- `GG-LB-012` Handle duplicate submissions.
- `GG-LB-013` Test malformed score submissions.
- `GG-LB-014` Test legitimate run submission.

PASS:
```text
LEADERBOARD = OPERATIONAL
OFFLINE GAMEPLAY = PASS
```

---

## F. BOARDING ARCHITECTURE

- `GG-BOARD-001` Create Boarding architecture specification.
- `GG-BOARD-002` Define eligible boardable ship classes.
- `GG-BOARD-003` Define disable probability/rule.
- `GG-BOARD-004` Define disabled visual/runtime state.
- `GG-BOARD-005` Stop disabled ship firing.
- `GG-BOARD-006` Define drift behaviour.
- `GG-BOARD-007` Define docking envelope.
- `GG-BOARD-008` Define explicit dock input.
- `GG-BOARD-009` Preserve shooter scene state.
- `GG-BOARD-010` Define Boarding entry-state object.
- `GG-BOARD-011` Define Boarding return-state object.
- `GG-BOARD-012` Establish separate Boarding scene family.
- `GG-BOARD-013` Prohibit platform code spreading across original shooter scenes.
- `GG-BOARD-014` Founder architecture approval required.

PASS:
```text
BOARDING ARCHITECTURE = FOUNDER APPROVED
```

---

## G. BOARDING PLAYER / PLATFORM MECHANICS

- `GG-BOARD-020` Define boarding player identity.
- `GG-BOARD-021` Define collision footprint.
- `GG-BOARD-022` Implement left/right movement.
- `GG-BOARD-023` Implement jump.
- `GG-BOARD-024` Implement fire.
- `GG-BOARD-025` Implement hit reaction.
- `GG-BOARD-026` Implement platform death.
- `GG-BOARD-027` Implement airlock entry.
- `GG-BOARD-028` Implement airlock exit.
- `GG-BOARD-029` Define boarding-player health/hit model before art finalisation.
- `GG-BOARD-030` Do not create a separate game-life economy.

---

## H. BOARDING MODULAR INTERIORS

- `GG-BOARD-040` Define room coordinate contract.
- `GG-BOARD-041` Define floor/wall/ceiling collision contract.
- `GG-BOARD-042` Define door/airlock connection points.
- `GG-BOARD-043` Airlock room.
- `GG-BOARD-044` Corridor rooms.
- `GG-BOARD-045` Cargo room.
- `GG-BOARD-046` Engine room.
- `GG-BOARD-047` Weapons room.
- `GG-BOARD-048` Crew room.
- `GG-BOARD-049` Bridge room.
- `GG-BOARD-050` Reactor room.
- `GG-BOARD-051` Define valid module graph.
- `GG-BOARD-052` Randomise only valid handcrafted modules.
- `GG-BOARD-053` Prohibit unreachable/generated-broken layouts.
- `GG-BOARD-054` Define ship-class room weighting.

---

## I. BOARDING TIMER / FAILURE / ESCAPE

- `GG-BOARD-060` Timer range = 30–60 seconds.
- `GG-BOARD-061` Define ship-class timer weighting later.
- `GG-BOARD-062` Countdown HUD.
- `GG-BOARD-063` Trigger critical state before zero if desired.
- `GG-BOARD-064` Timer zero destroys alien vessel.
- `GG-BOARD-065` Player aboard at zero dies.
- `GG-BOARD-066` Consume one existing game life.
- `GG-BOARD-067` Lives remain → return to player ship.
- `GG-BOARD-068` No lives → normal Game Over.
- `GG-BOARD-069` Return to airlock → escape.
- `GG-BOARD-070` Apply authorised loot.
- `GG-BOARD-071` Resume exact preserved shooter state.
- `GG-BOARD-072` Resolve disabled boarded ship after escape/failure.

PASS:
```text
ESCAPE FLOW = PASS
TIMER FAILURE FLOW = PASS
LIFE MODEL = PRESERVED
```

---

## J. BOARDING ECONOMY — DEFERRED DESIGN SURFACE

The following must be explicitly designed and Founder-approved when this phase starts:

- `GG-BOARD-ECO-001` time spent aboard scoring;
- `GG-BOARD-ECO-002` time remaining escape bonus;
- `GG-BOARD-ECO-003` barrel/crate points;
- `GG-BOARD-ECO-004` alien kill points;
- `GG-BOARD-ECO-005` room bonuses;
- `GG-BOARD-ECO-006` nuke drop rate;
- `GG-BOARD-ECO-007` life drop rate;
- `GG-BOARD-ECO-008` empty loot probability;
- `GG-BOARD-ECO-009` hostile surprise probability;
- `GG-BOARD-ECO-010` ship-class reward weighting;
- `GG-BOARD-ECO-011` boarding-player health/hit bar;
- `GG-BOARD-ECO-012` boarding damage amounts;
- `GG-BOARD-ECO-013` whether health persists during one boarding run;
- `GG-BOARD-ECO-014` whether health resets on return to ship;
- `GG-BOARD-ECO-015` scoring balance against leaderboard;
- `GG-BOARD-ECO-016` reward rarity and farming prevention.

These are NOT authorised values yet.

---

## K. BOARDING ART SPECIFICATION GATE

No Boarding asset creation begins before mechanics for that asset family are settled.

For each asset specification require:

```text
RUNTIME ROLE
EXACT DIMENSIONS
FRAME DIMENSIONS
FRAME COUNT
ANIMATION STATES
FACING / ORIENTATION
ANCHOR / ORIGIN
COLLISION RELATIONSHIP
TRANSPARENT PADDING
PALETTE / MATERIAL
MODULAR CONNECTION RULES
RUNTIME SCALE
INTERACTION STATES
NEIGHBOURING ASSET CONTRACT
CODE CONSUMPTION PATH
```

- `GG-BOARD-ART-001` Boarding player spec.
- `GG-BOARD-ART-002` Alien crew spec.
- `GG-BOARD-ART-003` Room module spec.
- `GG-BOARD-ART-004` Door/airlock spec.
- `GG-BOARD-ART-005` Barrel/crate spec.
- `GG-BOARD-ART-006` Reactor/critical-state spec.
- `GG-BOARD-ART-007` Boarding HUD spec.
- `GG-BOARD-ART-008` Timer/health UI spec.
- `GG-BOARD-ART-009` Effects spec.
- `GG-BOARD-ART-010` Loot spec.

No filename-only rough asset packs.

---

## L. BOARDING SCORE / LEADERBOARD INTEGRATION

After economy approval:
- `GG-BOARD-SCORE-001` Create Boarding event namespace.
- `GG-BOARD-SCORE-002` Alien kill event.
- `GG-BOARD-SCORE-003` Barrel/crate event.
- `GG-BOARD-SCORE-004` Time bonus event if approved.
- `GG-BOARD-SCORE-005` Escape bonus if approved.
- `GG-BOARD-SCORE-006` Rare room bonus if approved.
- `GG-BOARD-SCORE-007` Feed one total score to leaderboard.
- `GG-BOARD-SCORE-008` Preserve source-event identity for balancing/evidence.

---

## M. COMBINED QA

- `GG-QA-001` Menu.
- `GG-QA-002` Info.
- `GG-QA-003` Level 1.
- `GG-QA-004` Level 2.
- `GG-QA-005` Boss.
- `GG-QA-006` Pause/resume.
- `GG-QA-007` Game Over.
- `GG-QA-008` Victory.
- `GG-QA-009` Locked scoring.
- `GG-QA-010` Leaderboard.
- `GG-QA-011` Disable ship.
- `GG-QA-012` Dock.
- `GG-QA-013` Boarding load.
- `GG-QA-014` Platform movement.
- `GG-QA-015` Boarding combat.
- `GG-QA-016` Loot.
- `GG-QA-017` Timer.
- `GG-QA-018` Escape.
- `GG-QA-019` Boarding death.
- `GG-QA-020` Shooter resume.
- `GG-QA-021` Keyboard.
- `GG-QA-022` Touch.
- `GG-QA-023` Xbox controller.
- `GG-QA-024` Haute M-series.
- `GG-QA-025` Docker Founder acceptance.

---

## N. DEVICE / PLATFORM ASSURANCE

- `GG-DEV-001` Web desktop.
- `GG-DEV-002` Windows.
- `GG-DEV-003` Android.
- `GG-DEV-004` iOS/iPadOS.
- `GG-DEV-005` macOS if justified.
- `GG-DEV-006` touchscreen laptop.
- `GG-DEV-007` Xbox controller.
- `GG-DEV-008` Haute M-series.
- `GG-DEV-009` other common controllers.
- `GG-DEV-010` shooter input matrix.
- `GG-DEV-011` Boarding input matrix.

---

## O. COMMERCIAL PACKAGING

- `GG-COM-100` version/build metadata.
- `GG-COM-101` product icons.
- `GG-COM-102` loading/splash.
- `GG-COM-103` final screenshots.
- `GG-COM-104` media/trailer if authorised.
- `GG-COM-105` privacy.
- `GG-COM-106` terms.
- `GG-COM-107` third-party notices.
- `GG-COM-108` contributor credits.
- `GG-COM-109` Aurora signed commercial terms.
- `GG-COM-110` rating/store requirements.
- `GG-COM-111` final commercial pricing.
- `GG-COM-112` package signing where applicable.
- `GG-COM-113` release notes.

---

## P. RELEASE CANDIDATE GATE

```text
FOUNDER VISUAL ACCEPTANCE = PASS
FOUNDER GAMEPLAY ACCEPTANCE = PASS
LOCKED SCORING = PASS
LEADERBOARD = PASS
BOARDING ARCHITECTURE = APPROVED
BOARDING RUNTIME = PASS
BOARDING ECONOMY = FOUNDER APPROVED
BOARDING ASSETS = FOUNDER ACCEPTED
DEVICE MATRIX = PASS
COMMERCIAL DOCUMENTS = PASS
KNOWN P0/P1 RELEASE DEFECTS = 0
```

---

## Q. RELEASE

- `GG-REL-001` Build release candidate.
- `GG-REL-002` Hash packages.
- `GG-REL-003` final smoke.
- `GG-REL-004` Founder review.
- `GG-REL-005` store submission.
- `GG-REL-006` launch evidence.
- `GG-REL-007` Founder release authorisation.

---

## R. POST-LAUNCH

- `GG-POST-001` Crash monitoring.
- `GG-POST-002` Review monitoring.
- `GG-POST-003` Score distribution.
- `GG-POST-004` Leaderboard participation.
- `GG-POST-005` Boarding usage.
- `GG-POST-006` Boarding completion/failure.
- `GG-POST-007` Platform mix.
- `GG-POST-008` Controller mix.
- `GG-POST-009` Replay/retention.
- `GG-POST-010` Evidence-led balancing.
- `GG-POST-011` Expansion from real demand.

---

## S. SAFE EXIT / HYGIENE

Every Development return requires:

```text
ACTIVE FEATURE BRANCHES <= 1
WORKTREE = CLEAN
POST_BOX PAYLOAD = 0
ALL AUTHORISED WORK = TRACKED
ALL AUTHORISED WORK = COMMITTED
ALL AUTHORISED WORK = PUSHED
LOCAL HEAD = REMOTE HEAD
REGISTERS = CURRENT
EVIDENCE = CURRENT
HANDOFF OUT = SEALED
FOUNDER ACCEPTANCE = PENDING
```

No hidden local work.
No alternative governance.
No POST_BOX archives.
No self-merge.
