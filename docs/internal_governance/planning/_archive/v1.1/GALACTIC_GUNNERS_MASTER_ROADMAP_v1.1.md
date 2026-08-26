# GALACTIC GUNNERS MASTER ROADMAP v1.1
## Reissued Production Architecture Baseline

**Product:** Galactic Gunners  
**Institutional Arm:** Inceptivec Gamification  
**Technical/Product Authority:** Galactic Gunners CTO  
**Controlling Final Acceptance Authority:** Founder / Secuvara CTAIO  
**Version:** v1.1 — REISSUED CURRENT BASELINE

---

# 0. SINGLE PROGRAMME CONTROL SURFACE

The Founder steers the programme from exactly:

```text
docs/internal_governance/planning/
├── GALACTIC_GUNNERS_MASTER_ROADMAP_v1.1.md
├── GALACTIC_GUNNERS_MASTER_PLAYLIST_v1.1.md
└── _archive/
```

All predecessor/supporting planning material goes to `_archive/`.

This v1.1 absorbs the relevant prior programme knowledge and now establishes the production architecture direction that follows Founder acceptance of the current visual/structural foundation.

Current strategic sequence:

```text
FOUNDATIONAL COMMERCIAL GAME
        ↓
PRODUCTION APPLICATION ARCHITECTURE
        ↓
PHASER / TYPESCRIPT GAME-CORE EXTRACTION
        ↓
NEXT.JS PRODUCT CLIENT
        ↓
DJANGO + DRF + POSTGRES AUTHORITATIVE BACKEND
        ↓
AUTH / PLAYER / GAME-RUN MODEL
        ↓
GLOBAL LEADERBOARD
        ↓
BOARDING MODE
        ↓
MOBILE / DESKTOP NATIVE PACKAGING
        ↓
CONSOLE FEASIBILITY / PORTING
        ↓
COMMERCIAL RELEASE
```

---

# 1. PROGRAMME DOCTRINE

Galactic Gunners advances by accepted product states.

```text
CORRECT FOUNDATION
→ CTO QUALITY GATE
→ FOUNDER / CTAIO ACCEPTANCE
→ NEXT AUTHORISED CAPABILITY
```

```text
RUNS != PRODUCTION READY
AUTOMATED PASS != COMMERCIAL ACCEPTANCE
DEVELOPMENT RETURN != CTO ACCEPTANCE
CTO ACCEPTANCE != FOUNDER ACCEPTANCE
```

A later feature never legitimises a defective earlier layer.

---

# 2. AUTHORITY

## Development
Executes bounded commissions only.

Development does not:
- invent architecture;
- redefine gameplay;
- invent scoring;
- infer visual direction;
- create competing governance;
- self-accept;
- self-merge.

## Galactic Gunners CTO
Owns:
- technical/product architecture;
- gameplay architecture;
- runtime/client/backend boundaries;
- implementation standards;
- visual/runtime specifications;
- Development commissions;
- quality gates;
- defect classification;
- roadmap/playlist integrity;
- production architecture formation;
- security-boundary definition;
- recommendation for Founder acceptance.

## Founder / Secuvara CTAIO
Controlling final acceptance authority.

```text
DEVELOPMENT
→ GALACTIC GUNNERS CTO QUALITY GATE
→ FOUNDER / SECUVARA CTAIO ACCEPTANCE
→ ACCEPTED PROGRAMME STATE
```

---

# 3. CURRENT STATE

Commercial repository:
`Inceptivec-io/GalacticGunners`

Historical repository:
`michael-leese/GallacticGunners` — READ-ONLY provenance/behaviour reference.

Current development line:
`feature/v1-level1-vertical-slice`

Current programme position:
- governed repository and release branch model established;
- production architecture foundation accepted into the `dev -> stage -> prod` branch model;
- canonical asset/IP estate established at root `assets/`;
- v1.0 Sprint 001 is active on `feature/v1-level1-vertical-slice`;
- Sprint 001 returns a bounded Boot -> Main Menu -> Level 1 playable vertical slice for Founder/CTO review;
- full Level 1, Level 2, boss/final states, Boarding, auth UI and leaderboard UI are not claimed in Sprint 001;
- Founder acceptance remains pending.

Future full Level 1 and later gameplay slices require separate authorised handoffs.

---

# 4. GGF-0 — GOVERNED COMMERCIAL FOUNDATION

Includes:
- commercial repo;
- historical/commercial separation;
- licences/notices;
- root AGENTS;
- boundary/POST_BOX;
- internal governance;
- transport-only ZIP policy;
- one active feature branch;
- Docker local runtime;
- evidence/register discipline.

Status: substantially complete.

---

# 5. GGF-1 — FOUNDATIONAL COMMERCIAL GAME BASELINE

This phase is the minimum production-quality game foundation.

It includes:

## 5.1 Visual estate
Player, scout, cruiser, destroyer, mothership, asteroid, comet, projectiles, explosions, nuke, backgrounds, shield tile, UI, branding, HUD and result panels.

## 5.2 Typography
Owned title and display/interface fonts correctly loaded and used.

## 5.3 Audio
Owned modern UI, weapon, impact, explosion, nuke, comet, player-hit, mothership and result sounds.

Gameplay sounds represent the actual physical event, not musical gimmicks.

## 5.4 Sprite correctness
Every sprite sheet:
- sliced correctly;
- anchored correctly;
- scaled correctly;
- animated intentionally;
- collision-aligned;
- free of visible sheet bleed.

## 5.5 Player animation
Player remains correctly oriented and spatially stable. No raw rotation through sheet frames. Controlled flash/activity/thruster behaviour only.

## 5.6 Enemy/boss animation
Scout/cruiser/destroyer/mothership/asteroid animate intentionally, not merely because frames exist.

## 5.7 Comet
One spawn = one random approved comet variant = one collider.

```text
COMET DESTROYED = +500 SCORE +1 NUKE
```

## 5.8 Explosions
Transparent, rounded/blooming, dissipating/fading, no square sprite blocks, small/large differentiation.

## 5.9 Shield
Remains a code-generated matrix of individually destructible tiles.

## 5.10 Playfield composition
Readable player/enemies/effects, balanced bunkers, reduced dead middle space, strong visual hierarchy.

## 5.11 Full stellar viewport
The whole visible runtime belongs to the Galactic Gunners space environment.

```text
UNINTENDED BLACK CINEMA BARS = 0
CANVAS/PAGE SEAM = 0
FULL STELLAR COVERAGE = PASS
```

## 5.12 Safe containment
No HUD/result/control clipping or unintended page overflow.

## 5.13 Title
Event-driven Start/Info/Sound/selection/input.

## 5.14 Game Over
Visible controls are the designed embedded:
- Main Menu;
- Replay;
- Try Again.

No duplicate textual controls.

Routing:

```text
MAIN MENU → MAIN MENU
REPLAY → DIRECT GAMEPLAY
TRY AGAIN → DIRECT GAMEPLAY
```

## 5.15 Victory
Dynamic score/status/actions remain runtime-driven.

## 5.16 Score integrity
One authoritative final score.

```text
VISIBLE SCORE CONTRADICTION = 0
POST_RESULT_SCORE_MUTATION = 0
```

## 5.17 Locked scoring

```text
LASER TARGET              +5
ASTEROID                  +10
SCOUT                     +25
SHIP                      +50
MOTHERSHIP HIT            +50
MOTHERSHIP DESTROYED      +1000
COMET                     +500
COMET BONUS               +1 NUKE
ALIEN HIT ON SHIELD TILE  -1
```

Player damage score penalty = NONE.  
Player life model = unchanged.  
Player fire on shield = no authorised score penalty.

## 5.18 Product surfaces
Current favicon, browser title, branding, icons, no stale/default product assets.

## 5.19 Input
Keyboard, touch, Xbox, Haute M-series and current gamepad abstraction.

## 5.20 Founder Docker acceptance
Exact final pushed HEAD at:

```text
http://localhost:8027/
```

---

# 6. GGF-1 GATE

No architecture migration until all pass:

```text
GAMEPLAY = PASS
VISUAL ESTATE = PASS
TYPOGRAPHY = PASS
AUDIO = PASS
SPRITES = PASS
ANIMATION = PASS
COMETS = PASS
EXPLOSIONS = PASS
SHIELD = PASS
SCORING = PASS
RESULT STATES = PASS
FINAL SCORE = PASS
FULL VIEWPORT = PASS
SAFE LAYOUT = PASS
INPUT = PASS
BROWSER SURFACES = PASS
REPOSITORY / PROVENANCE = PASS
DOCKER EXACT-HEAD = PASS
CTO QUALITY GATE = PASS
FOUNDER / CTAIO ACCEPTANCE = PASS
```

---

# 7. GGF-2 — PRODUCTION APPLICATION ARCHITECTURE FORMATION

This is the next major movement after GGF-1 passes.

Purpose:
move from legacy HTML/global JavaScript application structure to a production-grade multi-layer product while retaining the actual Phaser game.

Target:

```text
NEXT.JS PRODUCT CLIENT
        │
        ├── product shell
        ├── authenticated player UI
        └── Phaser GameHost
        │
        ▼
DJANGO + DJANGO REST FRAMEWORK
        │
        ├── identity
        ├── players
        ├── game runs
        ├── score validation
        ├── leaderboard
        ├── administration
        ├── audit
        └── future Python integrations
        │
        ▼
POSTGRESQL
```

The browser is an untrusted client.

Next.js does not make browser code secret.

Security authority lives on the backend.

---

# 8. GGF-2A — MONOREPO FORMATION

Preferred target:

```text
GalacticGunners/
├── apps/
│   └── web/                 # Next.js + TypeScript
├── game/
│   ├── src/                 # Phaser + TypeScript
│   ├── assets/
│   └── tests/
├── backend/
│   ├── config/
│   ├── accounts/
│   ├── players/
│   ├── game_runs/
│   ├── leaderboard/
│   └── manage.py
├── packages/
│   └── contracts/           # only if useful
├── docs/
│   └── internal_governance/
├── docker-compose.yml
└── README.md
```

One coherent product repository. No duplicate authority trees.

---

# 9. GGF-2B — PHASER / TYPESCRIPT GAME CORE

The game is retained.

Do not rewrite the game into React.

Migration doctrine:

```text
EXTRACT
→ TYPE
→ TEST
→ PRESERVE BEHAVIOUR
```

Target conceptual game structure:

```text
game/src/
├── config/
│   ├── gameConfig.ts
│   ├── scoring.ts
│   ├── enemyTypes.ts
│   └── waveConfig.ts
├── scenes/
│   ├── BootScene.ts
│   ├── MainMenuScene.ts
│   ├── InfoScene.ts
│   ├── Level1Scene.ts
│   ├── Level2Scene.ts
│   ├── BossScene.ts
│   ├── VictoryScene.ts
│   └── GameOverScene.ts
├── entities/
│   ├── Player.ts
│   ├── Scout.ts
│   ├── Cruiser.ts
│   ├── Destroyer.ts
│   ├── Mothership.ts
│   ├── Comet.ts
│   └── ShieldTile.ts
├── systems/
│   ├── ScoreSystem.ts
│   ├── AudioSystem.ts
│   ├── InputSystem.ts
│   ├── LifeSystem.ts
│   └── GameSession.ts
└── services/
    └── GameApiClient.ts
```

No mass rewrite.

---

# 10. GGF-2C — NEXT.JS PRODUCT CLIENT

Next.js owns:
- product shell;
- landing/presentation;
- player profile UI;
- leaderboard UI;
- settings;
- help;
- credits;
- legal/privacy;
- future entitlement/store surfaces;
- controlled Phaser GameHost.

Phaser owns:
- rendering;
- movement;
- collisions;
- sprites;
- scenes;
- waves;
- boss logic;
- Boarding Mode;
- moment-to-moment gameplay.

React does not become the game engine.

---

# 11. GGF-2D — DJANGO / DRF AUTHORITATIVE BACKEND

Preferred:

```text
Django
+
Django REST Framework
+
PostgreSQL
```

Django owns:
- identity;
- users;
- authentication;
- password security;
- sessions/tokens;
- player profile;
- game-run authority;
- score validation;
- leaderboard;
- administration;
- future entitlements;
- audit;
- future Python analytics/workers.

Locked identity rule:

```text
DJANGO OWNS IDENTITY
```

Do not introduce competing Django Auth + Supabase Auth + Next Auth authority.

Supabase may be used only as managed PostgreSQL if operationally justified.

---

# 12. GGF-2E — DATA MODEL

Minimum:

```text
User
PlayerProfile
GameVersion
GameRun
ScoreSubmission
LeaderboardEntry
```

GameRun should support:
- run ID;
- player;
- client type;
- game version;
- start/end;
- score;
- lives used;
- nukes used;
- level reached;
- victory;
- validity state;
- validation result.

Later:

```text
BoardingRun
├── ship_type
├── time_aboard
├── aliens_killed
├── containers_opened
├── lives_found
├── nukes_found
└── escaped
```

---

# 13. GGF-2F — VERSIONED API

Initial API:

```text
/api/v1/auth/
/api/v1/player/
/api/v1/game-runs/
/api/v1/scores/
/api/v1/leaderboard/
/api/v1/game-config/
```

Future:
- achievements;
- entitlements.

Run flow:

```text
START GAME
→ server creates GameRun
→ client plays
→ completion/event summary submitted
→ server validates
→ accepted score
→ leaderboard
```

The game remains playable if nonessential online services are unavailable.

---

# 14. GGF-2G — SECURITY BOUNDARY

Client code being visible is not itself a security failure.

Never expose:
- DB credentials;
- API secrets;
- signing secrets;
- admin authority;
- payment secrets;
- entitlement secrets.

Required:
- HTTPS;
- secure auth/session handling;
- CSRF controls;
- restrictive CORS;
- CSP;
- rate limiting;
- validation;
- secret management;
- structured logging;
- audit;
- database backups;
- dependency scanning;
- error monitoring.

```text
BROWSER = UNTRUSTED
BACKEND = AUTHORITY
```

---

# 15. GGF-2H — SCORE VALIDATION

Do not trust a submitted score blindly.

Validate:
- run ID;
- duration;
- score arithmetic;
- kill/event counts;
- mothership hits;
- nuke state;
- duplicate submission;
- game version;
- malformed summaries.

Example validation:

```text
SCOUT_KILLS × 25
+
SHIPS × 50
+
ASTEROIDS × 10
+
MOTHERSHIP_HITS × 50
+
MOTHERSHIP_KILL × 1000
+
COMETS × 500
−
ENEMY_SHIELD_TILE_HITS
=
EXPECTED SCORE
```

This is anti-trivial-cheat, not a claim of perfect anti-cheat.

---

# 16. GGF-2I — CONFIGURATION

Move scattered constants into typed configuration.

Preferred:
- scoring;
- enemy types;
- waves;
- Boarding configuration.

Remote/backend config may later control:
- leaderboard season;
- challenges;
- feature flags;
- minimum client version.

Core gameplay must not depend on network availability.

---

# 17. GGF-2J — DEPLOYMENT

Preferred initial topology:

```text
Vercel
└── Next.js

Railway
└── Django API

PostgreSQL
└── Railway-managed or Supabase-managed Postgres
```

Do not add Redis/Celery until a real workload needs them.

Local Docker should support the full product stack.

---

# 18. GGF-2 ARCHITECTURE GATE

Before leaderboard:

```text
GAME CORE TYPESCRIPT = PASS
NEXT.JS SHELL = PASS
DJANGO / DRF = PASS
POSTGRES = PASS
IDENTITY AUTHORITY = 1
GAME-RUN MODEL = PASS
VERSIONED API = PASS
SECURITY BASELINE = PASS
LOCAL DOCKER STACK = PASS
CTO ARCHITECTURE GATE = PASS
FOUNDER / CTAIO ARCHITECTURE ACCEPTANCE = PASS
```

---

# 19. GGF-3 — GLOBAL LEADERBOARD

Built on the production backend.

Required:
- minimal player identity;
- run/session identity;
- validated submission;
- ranking;
- tie rules;
- duplicate protection;
- minimal data;
- offline/degraded behaviour;
- game playable without leaderboard.

---

# 20. GGF-4 — BOARDING ARCHITECTURE

Core loop:

```text
ELIGIBLE SHIP
→ DISABLED
→ BOARD OR IGNORE
→ DOCK
→ SHOOTER STATE PRESERVED
→ PLATFORM RAID
→ 30–60 SECOND TIMER
→ FIGHT / LOOT
→ RETURN TO AIRLOCK
→ RESUME SHOOTER
```

Separate Boarding scene/system family.

Do not contaminate original shooter scenes with platform implementation.

---

# 21. GGF-5 — BOARDING RUNTIME

Initial:
- move left/right;
- jump;
- fire.

Handcrafted modular interiors:
- airlock;
- corridor;
- cargo;
- engine;
- weapons;
- crew;
- bridge;
- reactor.

Failure:
- timer zero;
- boarded ship explodes;
- one existing life lost;
- lives remain → shooter resumes;
- no lives → normal Game Over.

No separate Boarding life economy.

---

# 22. GGF-6 — BOARDING ECONOMY / HEALTH

Deferred Founder/CTO decisions:
- time aboard score;
- time remaining bonus;
- barrel/crate points;
- alien kill points;
- room bonus;
- life/nuke rarity;
- health/hit bar;
- damage values;
- invulnerability;
- persistence/reset;
- ship-class reward weighting;
- farming prevention.

No exact values before approval.

---

# 23. GGF-7 — BOARDING ASSET SPECIFICATION

No art before mechanics.

Every asset specification must define:
- ID;
- filename;
- runtime purpose;
- master/runtime dimensions;
- frame dimensions/count/order;
- animation trigger/FPS;
- facing;
- anchor/origin;
- collision footprint;
- transparent padding;
- palette/material/lighting;
- modular connections;
- interaction/damage states;
- neighbouring relationships;
- runtime scale;
- code/scene consumer;
- provenance.

Filename-only rough specifications are prohibited.

---

# 24. GGF-8 — BOARDING SCORE / LEADERBOARD

After economy approval:
- Boarding score namespace;
- kill/container events;
- approved time/escape bonuses;
- total score feeds leaderboard;
- event provenance retained internally.

---

# 25. GGF-9 — MOBILE / DESKTOP CLIENTS

## Mobile
Preferred initial packaging:

```text
Phaser + Capacitor
```

Targets:
- Android;
- iOS/iPadOS.

Use native bridges only when needed.

## Desktop
Preferred route to evaluate:

```text
Phaser + Tauri
```

Targets:
- Windows;
- macOS if justified.

Electron only if a specific requirement makes it preferable.

Do not rewrite the game in Flutter/React Native merely for packaging.

---

# 26. GGF-10 — CONSOLE STRATEGY

Console is not “package the website”.

Assess separately:
- Xbox;
- PlayStation;
- Nintendo.

Potential routes:
- supported runtime route;
- porting partner;
- native-engine port if commercially justified.

Django/API remains reusable by any legitimate client.

```text
WEB ───────┐
MOBILE ────┤
DESKTOP ───┼── DJANGO PLATFORM API
CONSOLE ───┤
FUTURE ────┘
```

No console commitment before feasibility.

---

# 27. GGF-11 — COMBINED QA / DEVICE ASSURANCE

Targets:
- web;
- Windows;
- Android;
- iOS/iPadOS;
- macOS if justified;
- tablets/touch;
- keyboard;
- Xbox;
- Haute M-series;
- additional gamepads;
- backend degradation;
- leaderboard degradation;
- Boarding;
- exact-head Docker acceptance.

No platform is commercially claimed before test.

---

# 28. GGF-12 — COMMERCIAL PACKAGING

Includes:
- version/build metadata;
- icons;
- splash/loading;
- screenshots;
- privacy;
- terms;
- notices;
- credits;
- Aurora commercial documentation;
- store/rating requirements;
- pricing;
- signing where applicable;
- release notes.

---

# 29. GGF-13 — RELEASE CANDIDATE

Required:

```text
FOUNDATION = ACCEPTED
PRODUCTION ARCHITECTURE = ACCEPTED
LEADERBOARD = PASS
BOARDING = PASS
MULTI-CLIENT QA = PASS
DEVICE MATRIX = PASS
COMMERCIAL PACKAGING = PASS
KNOWN P0/P1 RELEASE DEFECTS = 0
CTO RELEASE RECOMMENDATION = PASS
FOUNDER / CTAIO RELEASE ACCEPTANCE = PASS
```

---

# 30. GGF-14 — PUBLIC RELEASE

Explicit Founder authorisation only.

---

# 31. GGF-15 — POST-LAUNCH

Track:
- sales/installs;
- crashes;
- reviews;
- completion;
- score distribution;
- leaderboard participation;
- Boarding use;
- platform/controller mix;
- replay/retention.

Expansion is evidence-led.

---

# 32. GOVERNING DEVELOPMENT PRINCIPLE

The current accepted game becomes the behavioural reference for architectural reproduction.

The team must reproduce the accepted game into the production architecture without losing:
- gameplay;
- timing;
- controls;
- visual fidelity;
- audio;
- scoring;
- feel;
- responsiveness.

Production migration is a controlled preservation exercise, not an excuse for a second redesign.
