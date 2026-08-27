# GALACTIC GUNNERS PRECONSTRUCTION COMPLETENESS MATRIX

This matrix is a hard preparation checklist for GG-H013 through GG-H017.

A construction sprint may start only when its row is `READY`, but ordinary repository synchronization is not a STOP condition.

## Fixed cross-programme constants

### Product identity

```text
PRODUCT_NAME = Galactic Gunners: Final Assault™
PRODUCTION_CREDIT = An Inceptivec Gamification Production
WEB_DOMAIN = https://galacticgunners.com
PROD_API_TARGET = https://api.galacticgunners.com
STAGE_WEB_TARGET = https://stage.galacticgunners.com
STAGE_API_TARGET = https://api-stage.galacticgunners.com
ADMIN_ROUTE = /inceptivec-gamification-admin
```

Provisioning may temporarily use provider-generated hostnames, but environment files/config must carry the actual active URL and canonical target.

### Native identifiers

```text
TAURI_IDENTIFIER = com.inceptivec.galacticgunners
ANDROID_APPLICATION_ID = com.inceptivec.galacticgunners
IOS_BUNDLE_ID = com.inceptivec.galacticgunners
URL_SCHEME = galacticgunners
```

Any store-imposed identifier change requires CTO/Founder approval and documentation update before build publication.

### Leaderboard deterministic order

Global campaign leaderboard sorts:

```text
1. validated score DESC
2. campaign level reached DESC
3. accepted_at ASC
4. GameRun UUID ASC
```

This produces one deterministic ordinal order. Development does not invent alternate tie rules.

### Player leaderboard name

Use explicit player display name/handle where available.
Never expose email address as the public leaderboard identity.
If no display name is set, use an application-generated non-email player label until the player sets one.

### Boarding v1 scoring

For v1.0 Boarding:

```text
BOARDING-SPECIFIC SCORE ADDITIONS = 0
```

Until Founder/CTO authorises exact Boarding point values, Development must not invent them.
Boarding may grant configured LIFE/NUKE pickups and affect existing life state according to the H014 contract.

### Boarding health

```text
BOARDING HEALTH MODEL = EXISTING LIFE-BASED HIT MODEL
RPG HITPOINT/ARMOR SYSTEM = NOT AUTHORISED
```

### Campaign state between ordinary levels

Unless a LevelDefinition explicitly sets an approved starting override:

```text
SCORE = cumulative through campaign
LIVES = carry remaining lives into next level
NUKES = carry remaining nukes, capped by global max
BONUS = level result recorded and campaign total where applicable
SEED = level-specific deterministic seed lineage
```

Replay current level resets that level to its entry snapshot; it does not duplicate cumulative rewards.
Starting a new campaign uses the governed Level 1 initial state.

## H013 readiness

Must exist before start:
- H012 accepted six-level campaign;
- final GameRun/ScoreSubmission/Leaderboard models in H013 spec;
- exact validation arithmetic;
- deterministic leaderboard ordering above;
- leaderboard player-name privacy rule above;
- API/OpenAPI spec;
- moderation/audit policy;
- hostile matrix.

Status after this authority pack: `READY ON H012 ACCEPTANCE`.

## H014 readiness

Must exist before start:
- H013 accepted;
- Boarding domain/API/interior schema in H014 spec;
- fixed health/scoring rules above;
- exact entry/timeout/return state machine;
- Boarding art kit physically present in canonical asset estate;
- asset register updated;
- input mapping defined;
- hostile fixtures.

### Boarding art kit required

Before H014 Development starts, CTO/Founder must ensure canonical production assets exist for:

```text
boarding_player_idle/run/jump/fire/hit/death
boarding_alien_basic_idle/run/fire/hit/death
boarding_player_projectile
boarding_alien_projectile
boarding_platform_floor
boarding_platform_wall
boarding_platform_ceiling where required
boarding_airlock_closed/open
boarding_door_closed/open
boarding_crate
boarding_barrel
boarding_background/interior material kit
boarding_life_pickup
boarding_nuke_pickup
boarding_timer/HUD panel or approved runtime composition
boarding_entry audio
boarding_exit audio
boarding_weapon audio
boarding_hit audio
boarding_enemy_death audio
boarding_timeout audio
```

Every sprite specification must define frame dimensions, count, orientation, origin, collider, transparency, runtime scale, animation timing, and consuming class/system.

Status now: `SPEC READY / ART KIT MUST BE VERIFIED BEFORE H014`.

## H015 readiness

Must exist before start:
- H014 accepted;
- native identifiers fixed above;
- Capacitor/Tauri configuration specs;
- secure-storage strategy;
- safe-area/lifecycle contract;
- app icon/splash masters in canonical asset estate;
- Android/iOS/Windows package metadata;
- signing secrets remain external.

Required asset masters:
- application icon master;
- Windows icon/installer artwork;
- Android adaptive icon foreground/background;
- Android splash;
- iOS app icon source;
- iOS splash/launch asset where required.

Status: `ARCHITECTURE READY / PACKAGING ASSET INVENTORY MUST BE VERIFIED BEFORE H015`.

## H016 readiness

Must exist before start:
- H015 accepted;
- Vercel/Railway/managed-Postgres target chosen;
- stage/prod domains/DNS available or provider temporary routes documented;
- provider projects created;
- secrets available outside repository;
- privacy/terms/support/credits text approved;
- monitoring provider/strategy selected;
- backup/restore policy executable.

Status: `SPEC READY / EXTERNAL INFRASTRUCTURE MUST BE PROVISIONABLE`.

## H017 readiness

Must exist before start:
- H016 accepted and deployed to stage;
- regression guide current;
- UI/UX snag register template;
- device/client test inventory;
- accessibility checklist;
- performance budgets;
- release metadata/store copy;
- production credentials/secrets external and available;
- `env.prod` generated locally at production commissioning time.

Status: `READY ON H016 ACCEPTANCE`.

## CTO work remaining before construction sequence begins

Before H013 starts, CTO must merge this authority pack after reconciling it with the accepted H012 head.

Before H014 starts, CTO must perform/complete the Boarding production-asset inventory and issue any missing production asset specifications/assets.

Before H015 starts, CTO must verify/package the native icon/splash asset masters.

Before H016 starts, CTO/Founder must provide the actual hosted environment/provider coordinates and legal/support production text if not already canonical.

No other fundamental Product architecture should need to be invented by Development.
