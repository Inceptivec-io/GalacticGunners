# GALACTIC GUNNERS MASTER PLAYLIST v1.1
## Reissued Production Architecture Execution Playlist

**Technical/Product Authority:** Galactic Gunners CTO  
**Controlling Acceptance Authority:** Founder / Secuvara CTAIO

---

# A. PLANNING CURRENTNESS

- `GG11-CUR-001` Admit reissued Roadmap v1.1 as sole current Roadmap.
- `GG11-CUR-002` Admit reissued Playlist v1.1 as sole current Playlist.
- `GG11-CUR-003` Move every other live planning object to `planning/_archive/`.
- `GG11-CUR-004` Preserve predecessor planning.
- `GG11-CUR-005` Verify live planning root contains only Roadmap v1.1, Playlist v1.1 and `_archive/`.

PASS:

```text
CURRENT ROADMAP = 1
CURRENT PLAYLIST = 1
OTHER LIVE PLANNING OBJECTS = 0
```

---

# B. CLOSE CURRENT FOUNDATION

- `GG11-FND-001` Correct player sprite slicing.
- `GG11-FND-002` Correct player animation.
- `GG11-FND-003` Verify enemy/boss sheets.
- `GG11-FND-004` One comet variant per spawn.
- `GG11-FND-005` Randomise comet variants.
- `GG11-FND-006` Correct explosion alpha/frame/fade.
- `GG11-FND-007` Correct playfield scaling.
- `GG11-FND-008` Fill full stellar viewport.
- `GG11-FND-009` Remove black cinema bars.
- `GG11-FND-010` Correct edge containment.
- `GG11-FND-011` Remove duplicate Game Over text buttons.
- `GG11-FND-012` Main Menu → menu.
- `GG11-FND-013` Replay → direct gameplay.
- `GG11-FND-014` Try Again → direct gameplay.
- `GG11-FND-015` Freeze one authoritative final score.
- `GG11-FND-016` Preserve locked scoring.
- `GG11-FND-017` Preserve owned audio.
- `GG11-FND-018` Correct favicon/page title/small product surfaces.
- `GG11-FND-019` Run full regression.
- `GG11-FND-020` Rebuild Docker at final pushed HEAD.
- `GG11-FND-021` CTO quality review.
- `GG11-FND-022` Founder / CTAIO Docker review.

PASS:

```text
GGF-1 FOUNDATIONAL COMMERCIAL GAME BASELINE = FOUNDER ACCEPTED
```

No next movement before this gate.

Current Sprint 001 execution state:

```text
BOOT / MAIN MENU / LEVEL 1 PLAYABLE VERTICAL SLICE = RETURNED FOR REVIEW
FULL LEVEL 1 = NOT CLAIMED
LEVEL 2 = NOT STARTED
BOSS / FINAL STATES = NOT STARTED
BOARDING = NOT STARTED
FOUNDER ACCEPTANCE = PENDING
```

---

# C. ARCHITECTURE DISCOVERY

After GGF-1 PASS:

- `GG11-ARCH-001` Freeze accepted game HEAD.
- `GG11-ARCH-002` Record accepted Docker runtime.
- `GG11-ARCH-003` Inventory HTML/JS source structure.
- `GG11-ARCH-004` Inventory scenes.
- `GG11-ARCH-005` Inventory entities.
- `GG11-ARCH-006` Inventory globals/shared state.
- `GG11-ARCH-007` Inventory scoring/lives/nukes.
- `GG11-ARCH-008` Inventory audio.
- `GG11-ARCH-009` Inventory input.
- `GG11-ARCH-010` Inventory asset loading.
- `GG11-ARCH-011` Inventory responsive/layout behaviour.
- `GG11-ARCH-012` Create behaviour-preservation fixtures.
- `GG11-ARCH-013` Define exact target monorepo.
- `GG11-ARCH-014` CTO/Founder approve architecture.

PASS:

```text
MIGRATION DENOMINATOR = 100%
UNKNOWN GAME BEHAVIOUR = 0
TARGET ARCHITECTURE = APPROVED
```

---

# D. MONOREPO FORMATION

- `GG11-MONO-001` Establish `apps/web`.
- `GG11-MONO-002` Establish `game`.
- `GG11-MONO-003` Establish `backend`.
- `GG11-MONO-004` Establish `packages/contracts` only if useful.
- `GG11-MONO-005` Preserve `docs/internal_governance`.
- `GG11-MONO-006` Define root build/test commands.
- `GG11-MONO-007` Define Docker local topology.
- `GG11-MONO-008` Preserve Git history.
- `GG11-MONO-009` Duplicate source-of-truth trees = 0.

---

# E. PHASER / TYPESCRIPT EXTRACTION

- `GG11-GAME-001` Introduce TypeScript build.
- `GG11-GAME-002` Extract game config.
- `GG11-GAME-003` Extract scoring config.
- `GG11-GAME-004` Extract scenes one at a time.
- `GG11-GAME-005` Extract Player.
- `GG11-GAME-006` Extract enemy entities.
- `GG11-GAME-007` Extract Mothership.
- `GG11-GAME-008` Extract Comet.
- `GG11-GAME-009` Extract ShieldTile.
- `GG11-GAME-010` Extract ScoreSystem.
- `GG11-GAME-011` Extract AudioSystem.
- `GG11-GAME-012` Extract InputSystem.
- `GG11-GAME-013` Extract LifeSystem.
- `GG11-GAME-014` Extract GameSession.
- `GG11-GAME-015` Introduce GameApiClient boundary.
- `GG11-GAME-016` Remove globals only after replacement proven.
- `GG11-GAME-017` Run regression after every bounded extraction.
- `GG11-GAME-018` Preserve accepted graphics/audio/scoring/timing.

PASS:

```text
GAME CORE = MODULAR TYPESCRIPT
BEHAVIOUR REGRESSION = 0
```

---

# F. NEXT.JS PRODUCT CLIENT

- `GG11-WEB-001` Establish Next.js + TypeScript app.
- `GG11-WEB-002` Create Phaser GameHost.
- `GG11-WEB-003` Phaser owns gameplay loop.
- `GG11-WEB-004` Add product shell.
- `GG11-WEB-005` Add profile surface.
- `GG11-WEB-006` Add leaderboard surface boundary.
- `GG11-WEB-007` Add settings.
- `GG11-WEB-008` Add help.
- `GG11-WEB-009` Add credits.
- `GG11-WEB-010` Add privacy/legal.
- `GG11-WEB-011` Preserve favicon/branding.
- `GG11-WEB-012` Preserve touch/responsive behaviour.
- `GG11-WEB-013` Public client secrets = 0.

---

# G. DJANGO / DRF / POSTGRES

- `GG11-BE-001` Establish Django.
- `GG11-BE-002` Establish Django REST Framework.
- `GG11-BE-003` Establish PostgreSQL.
- `GG11-BE-004` Django owns identity.
- `GG11-BE-005` Implement PlayerProfile.
- `GG11-BE-006` Implement GameVersion.
- `GG11-BE-007` Implement GameRun.
- `GG11-BE-008` Implement ScoreSubmission.
- `GG11-BE-009` Implement LeaderboardEntry.
- `GG11-BE-010` Configure migrations.
- `GG11-BE-011` Configure admin.
- `GG11-BE-012` Configure validation.
- `GG11-BE-013` Configure audit.
- `GG11-BE-014` Competing auth systems = 0.

---

# H. API CONTRACT

- `GG11-API-001` `/api/v1/auth/`
- `GG11-API-002` `/api/v1/player/`
- `GG11-API-003` `/api/v1/game-runs/`
- `GG11-API-004` `/api/v1/scores/`
- `GG11-API-005` `/api/v1/leaderboard/`
- `GG11-API-006` `/api/v1/game-config/` if required.
- `GG11-API-007` Define errors.
- `GG11-API-008` Define client/game-version compatibility.
- `GG11-API-009` Define degraded/offline behaviour.
- `GG11-API-010` Game remains playable if leaderboard unavailable.

---

# I. GAME RUN / SCORE VALIDATION

- `GG11-RUN-001` Server creates run ID.
- `GG11-RUN-002` Bind player where authenticated.
- `GG11-RUN-003` Bind game version.
- `GG11-RUN-004` Record run start.
- `GG11-RUN-005` Receive completion/event summary.
- `GG11-RUN-006` Validate score arithmetic.
- `GG11-RUN-007` Reject duplicate submissions.
- `GG11-RUN-008` Detect impossible event counts.
- `GG11-RUN-009` Detect impossible boss hit counts.
- `GG11-RUN-010` Detect impossible nuke state.
- `GG11-RUN-011` Validate client version.
- `GG11-RUN-012` Record validity state.

PASS:

```text
CLIENT SCORE TRUST = NO
SERVER SCORE VALIDATION = PASS
```

---

# J. SECURITY

- `GG11-SEC-001` HTTPS.
- `GG11-SEC-002` secure auth/session handling.
- `GG11-SEC-003` CSRF controls.
- `GG11-SEC-004` restrictive CORS.
- `GG11-SEC-005` CSP.
- `GG11-SEC-006` rate limiting.
- `GG11-SEC-007` server validation.
- `GG11-SEC-008` secrets management.
- `GG11-SEC-009` structured logs.
- `GG11-SEC-010` audit events.
- `GG11-SEC-011` DB backups.
- `GG11-SEC-012` dependency scanning.
- `GG11-SEC-013` error monitoring.
- `GG11-SEC-014` DB credentials in client = 0.
- `GG11-SEC-015` admin authority in client = 0.
- `GG11-SEC-016` payment/entitlement secrets in client = 0.

---

# K. DATA-DRIVEN CONFIG

- `GG11-CFG-001` Typed scoring config.
- `GG11-CFG-002` Typed enemy config.
- `GG11-CFG-003` Typed wave config.
- `GG11-CFG-004` Reserve Boarding config.
- `GG11-CFG-005` Reduce scattered magic numbers.
- `GG11-CFG-006` Core gameplay remains locally available.
- `GG11-CFG-007` Remote config only for appropriate operational controls.

---

# L. DEPLOYMENT FOUNDATION

- `GG11-DEP-001` Docker Compose web/backend/database.
- `GG11-DEP-002` Vercel Next.js target.
- `GG11-DEP-003` Railway Django target.
- `GG11-DEP-004` Deliberately choose Railway Postgres or Supabase-managed Postgres.
- `GG11-DEP-005` No Redis/Celery without need.
- `GG11-DEP-006` Correct environment separation.
- `GG11-DEP-007` Client secrets = 0.
- `GG11-DEP-008` health checks.
- `GG11-DEP-009` rollback.
- `GG11-DEP-010` backup/recovery evidence.

---

# M. PRODUCTION ARCHITECTURE GATE

Required before leaderboard:

```text
GAME CORE TYPESCRIPT = PASS
NEXT.JS SHELL = PASS
DJANGO/DRF = PASS
POSTGRES = PASS
IDENTITY AUTHORITY COUNT = 1
GAME-RUN MODEL = PASS
API = PASS
SECURITY = PASS
DOCKER FULL STACK = PASS
CTO ARCHITECTURE REVIEW = PASS
FOUNDER / CTAIO ARCHITECTURE ACCEPTANCE = PASS
```

---

# N. LEADERBOARD

- `GG11-LB-001` minimal player identity.
- `GG11-LB-002` validated run.
- `GG11-LB-003` validated score.
- `GG11-LB-004` ranking.
- `GG11-LB-005` ties.
- `GG11-LB-006` duplicate protection.
- `GG11-LB-007` minimal personal data.
- `GG11-LB-008` offline/degraded fallback.
- `GG11-LB-009` admin/moderation.
- `GG11-LB-010` Next.js leaderboard UI.

---

# O. BOARDING ARCHITECTURE

- `GG11-BOARD-001` eligible ships.
- `GG11-BOARD-002` disable rule.
- `GG11-BOARD-003` disabled state.
- `GG11-BOARD-004` docking envelope/input.
- `GG11-BOARD-005` preserve shooter state.
- `GG11-BOARD-006` entry/return contracts.
- `GG11-BOARD-007` separate Boarding scene family.
- `GG11-BOARD-008` no platform code spread through shooter scenes.
- `GG11-BOARD-009` CTO/Founder architecture approval.

---

# P. BOARDING RUNTIME

- `GG11-BOARD-020` player movement.
- `GG11-BOARD-021` jump.
- `GG11-BOARD-022` fire.
- `GG11-BOARD-023` enemies.
- `GG11-BOARD-024` platform collision.
- `GG11-BOARD-025` airlock.
- `GG11-BOARD-026` 30–60 second timer.
- `GG11-BOARD-027` timer failure loses one existing life.
- `GG11-BOARD-028` lives remain → shooter.
- `GG11-BOARD-029` no lives → Game Over.
- `GG11-BOARD-030` escape → shooter.

---

# Q. BOARDING INTERIORS

- airlock;
- corridors;
- cargo;
- engine;
- weapons;
- crew;
- bridge;
- reactor;
- valid modular graph;
- random valid handcrafted composition;
- unreachable layouts = 0.

---

# R. BOARDING DEFERRED ECONOMY / HEALTH

Founder/CTO approval required for:
- time aboard;
- time remaining bonus;
- barrel/crate points;
- alien kill points;
- room bonus;
- nuke/life rarity;
- health/hit bar;
- damage;
- invulnerability;
- persistence/reset;
- ship-class weighting;
- farming prevention.

No exact values yet.

---

# S. BOARDING ART SPECIFICATION

No art before mechanics.

Every specification defines:
- purpose;
- dimensions;
- frames;
- animation;
- facing;
- origin;
- collider;
- transparency;
- materials;
- modular rules;
- states;
- runtime scale;
- code consumer;
- provenance.

No filename-only rough packs.

---

# T. NATIVE CLIENTS

## Mobile
- Capacitor evaluation;
- Android;
- iOS/iPadOS;
- native bridges only when required.

## Desktop
- Tauri evaluation;
- Windows;
- macOS if justified;
- Electron only if specifically preferable.

Do not rewrite gameplay into Flutter/React Native solely for packaging.

---

# U. CONSOLE FEASIBILITY

Assess:
- Xbox;
- PlayStation;
- Nintendo;
- runtime route;
- porting partner;
- native-engine port if commercially justified.

Django API remains client-independent.

No console promise before feasibility.

---

# V. COMBINED QA / DEVICE ASSURANCE

Test:
- web;
- Windows;
- Android;
- iOS/iPadOS;
- macOS if justified;
- touch/tablets;
- Xbox;
- Haute M-series;
- common gamepads;
- degraded backend;
- degraded leaderboard;
- Boarding;
- exact-head Docker.

---

# W. COMMERCIAL PACKAGING

- metadata;
- icons;
- splash;
- screenshots;
- privacy;
- terms;
- notices;
- credits;
- Aurora commercial documentation;
- ratings/store;
- pricing;
- signing;
- release notes.

---

# X. RELEASE CANDIDATE

```text
FOUNDATION = ACCEPTED
PRODUCTION ARCHITECTURE = ACCEPTED
LEADERBOARD = PASS
BOARDING = PASS
MULTI-CLIENT QA = PASS
DEVICE MATRIX = PASS
COMMERCIAL PACKAGING = PASS
KNOWN P0/P1 DEFECTS = 0
CTO RELEASE RECOMMENDATION = PASS
FOUNDER / CTAIO RELEASE ACCEPTANCE = PASS
```

---

# Y. PUBLIC RELEASE

Explicit Founder authorisation only.

---

# Z. SAFE EXIT

Every Development return:

```text
ACTIVE FEATURE BRANCHES <= 1
WORKTREE = CLEAN
POST_BOX PAYLOAD = 0
TRANSPORT ZIPS RETAINED IN REPO = NO
ALL AUTHORISED WORK = TRACKED
ALL AUTHORISED WORK = COMMITTED
ALL AUTHORISED WORK = PUSHED
LOCAL HEAD = REMOTE HEAD
REGISTERS = CURRENT
EVIDENCE = CURRENT
HANDOFF OUT = SEALED
FOUNDER ACCEPTANCE = PENDING UNTIL EXPLICIT
```

No competing planning surface.
No hidden local work.
No self-merge.
