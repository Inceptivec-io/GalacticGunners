# REV1 DEFECT / CORRECTION SPECIFICATION

## D1 — Developer terminology must disappear from runtime

Remove player-facing:
- `LEVEL 1 VERTICAL SLICE`
- `SLICE COMPLETE`
- `SLICE FAILED`
- `REPLAY SLICE`
- `RETRY SLICE`
- any other Sprint/Handoff/Vertical-Slice/QA/development terminology.

Internal identifiers/evidence may retain technical terminology.

Player-facing menu should present normal product copy only, e.g. `START`, `PLAY`, `MISSION COMPLETE`, `MISSION FAILED`, `REPLAY`, `MAIN MENU` as appropriate.

Add an automated runtime assertion that scans visible Phaser/DOM text and FAILS if banned development terms appear.

## D2 — Full stellar viewport / no cinema bars

Current `Scale.FIT` + dark host produces visible top/bottom bars on non-16:9 viewports.

Required:
```text
UNINTENDED_BLACK_BARS = 0
CANVAS_PAGE_SEAM = 0
FULL_STELLAR_COVERAGE = PASS
HUD_CLIPPED = 0
PLAYER/ENEMY_CLIPPED = 0
```

Implement a production-grade responsive strategy.

Do not merely recolour the bars dark blue.

Acceptable:
- responsive Phaser resize/layout;
- or a deliberate full-bleed stellar host/camera composition that is visually continuous and has no visible seam.

Representative automated viewport matrix:
- 1365×768
- 1440×900
- 1920×1080
- 2560×1440
- 1024×768 landscape/tablet
- portrait/mobile handling with explicit supported composition or orientation treatment.

Capture/assert bounding geometry and screenshot evidence.

## D3 — Use relevant Founder-supplied key art now

The canonical register contains ACTIVE_PRODUCTION / CLEARED_PROJECT_USE key art including:

`GG-KEYART-KEY-ART-POSTERS-GG-HERO-IMAGE-PLAYER-FIGHTING-V002-4K-UHD-MASTER`
`assets/key_art/posters/gg_hero_image_player_fighting_v002_4k_uhd_master.png`
SHA-256:
`054D150DA322ACCDA4256306DB40B30CC0A098D7B307702C5CCFFA6148A5CE8F`

Also available:
`gg_hero_image_player_fighting_v002_2x_poster_master.png`

Use relevant hero/battle key art on the product landing/main-menu presentation so the first impression matches the commercial estate.

Do NOT prematurely use pause/victory posters for unrelated screens.

Root `assets/` remains canonical; extend the deterministic asset sync/manifest.

Required:
```text
HOME_USES_APPROVED_HERO_KEY_ART = PASS
MAIN_MENU_USES_APPROVED_COMMERCIAL_COMPOSITION = PASS
ASSET_BYTES_MODIFIED = 0
```

## D4 — Main menu commercial composition

Current starfield + logo + text is too sparse.

Required player-facing hierarchy:
- cinematic hero/battle visual;
- logo/title treatment;
- strong START control;
- clean input hint only if needed;
- intentional visual balance at desktop/tablet;
- no prototype rectangles or diagnostic copy;
- no development subtitle.

Use approved production fonts/assets.

## D5 — Player and Scout sprite fidelity

Current implementation crops one static frame from each sheet.

REV1 must:
- determine intended sheet frame geometry from accepted source/evidence;
- create proper Phaser frame/spritesheet/atlas handling;
- animate Player and Scout intentionally where approved frames support it;
- preserve vertical player facing;
- prohibit diagonal/raw rotation;
- prohibit visible sheet bleed;
- size player/scouts for readable commercial playfield hierarchy.

Required automated/objective checks:
```text
PLAYER_VISIBLE_SIZE_WITHIN_APPROVED_RANGE = PASS
SCOUT_VISIBLE_SIZE_WITHIN_APPROVED_RANGE = PASS
PLAYER_DIAGONAL_ROTATION = 0
SPRITE_SHEET_BLEED = 0
PLAYER_ANIMATION_ACTIVE_WHERE_REQUIRED = PASS
SCOUT_ANIMATION_ACTIVE_WHERE_REQUIRED = PASS
```

Record exact frame geometry source.

## D6 — One authoritative InputSystem

Current Level1Scene directly polls keyboard/gamepad/pointer despite `InputSystem.ts`.

Refactor so:
- input devices are bound once;
- scene consumes normalized `ActionState`;
- no `createCursorKeys()` / `addKey()` every update;
- keyboard/pointer/touch/gamepad device specifics do not spread through gameplay scene;
- confirm/back/menu actions use same abstraction where practical.

Required:
```text
LEVEL1_DIRECT_DEVICE_POLLING = 0
PERSISTENT_INPUT_BINDINGS = PASS
KEYBOARD = PASS
POINTER_TOUCH = PASS
GAMEPAD_NORMALIZATION = PASS
```

## D7 — Collision model must be visually and physically truthful

Current implementation combines Arcade overlap and a second broad manual collision-envelope system.

Remove duplicate collision authority.

Use one deliberate model:
- Arcade physics bodies/colliders preferred unless a documented semantic collider service is superior.

Collider dimensions/offsets must derive from actual rendered frame geometry, not unexplained texture-coordinate constants.

Required hostile tests:
- direct hit scores once;
- near miss does not score;
- one laser cannot score multiple scouts;
- one scout cannot score twice;
- enemy laser near miss does not damage;
- enemy laser direct hit damages exactly once within cooldown;
- player/scout collision damages consistently;
- collider debug screenshot/evidence in test mode;
- no collider extends materially outside visible craft silhouette unless explicitly justified.

Remove broad “safety” collision envelopes that make visible misses count.

## D8 — Runtime verifier must become a real hostile suite

Current verifier only proves one canvas, Level1 entry, one score event and network/console health.

Create reproducible executable runtime suites covering:

### Navigation/state
- home → play → menu;
- menu → level;
- complete → replay;
- complete → main menu;
- fail → retry;
- fail → main menu;
- replay resets session;
- no stale projectiles/colliders/timers/listeners.

### Gameplay
- left bound;
- right bound;
- sustained fire;
- projectile cleanup;
- real direct collision;
- near-miss collision rejection;
- score exactness;
- life exactness;
- damage cooldown;
- zero-life terminal path.

### Backend
- online run starts;
- online completion once;
- replay creates new run;
- backend unavailable/offline gameplay continues;
- no fabricated run ID.

### Input
- keyboard path;
- pointer/touch simulated path;
- gamepad normalization/runtime injection path where Playwright/browser APIs permit.

### Visual/composition
- no banned dev copy;
- hero key art present on intended surfaces;
- no unintended black bars;
- HUD inside safe area;
- canvas/full-screen composition;
- player/scout readable size;
- no duplicate canvas;
- terminal controls inside safe area.

### Console/network
- console errors = 0;
- unexpected 4xx/5xx = 0.

The “hostile sweep” must be executable code, not just a screenshot.

## D9 — Runtime suite must run in GitHub Actions

Current CI does NOT execute `npm run runtime:verify`.

Add a dedicated job or extend Docker smoke:

```text
docker stack up
→ backend health
→ web health
→ install Playwright browser where needed
→ runtime hostile suite
→ visual/composition suite
→ teardown
```

Required GitHub checks:
- backend SUCCESS
- client-and-game SUCCESS
- docker-smoke SUCCESS
- runtime-hostile SUCCESS (new or clearly named equivalent)

A PR with broken `/play` must not be green.

## D10 — Deterministic visual regression gate

Screenshots alone are evidence, not assertions.

Add objective visual regression.

Preferred:
- Playwright `toHaveScreenshot`-style golden/reference comparisons;
- references must be deliberately accepted and repository-visible;
- deterministic fonts/assets/viewport;
- reasonable threshold, not so loose that bars/layout regressions pass.

Minimum reference surfaces:
- landing;
- main menu;
- Level1 start;
- active combat;
- mission complete;
- mission failed.

If full pixel-diff is unstable on GPU, combine screenshot diff with geometry/color/content assertions, but the gate must fail on:
- black cinema bars;
- missing hero art;
- large layout shifts;
- missing logo/HUD;
- prototype/dev copy.

## D11 — Behaviour provenance for constants

Current `levelOneSlice.ts` contains:
- playerSpeed 420
- fire cooldown 280
- laser speed 760
- enemy laser 300
- 2×7 scouts
- fire interval 1500
- scout speed 70
- drop 22
- damage cooldown 850

For each:
- cite exact accepted legacy source/value if preserved; OR
- classify explicitly as `PROVISIONAL_V1_TUNING`, with CTO/Founder review required before baseline.

Do not describe invented/provisional tuning as preserved historical behaviour.

Update extraction matrix with:
```text
parameter
legacy source/value
v1 value
classification
reason
test
```

## D12 — Commercial acceptance checklist

Every player-facing screen in this PR must pass:

```text
VISUAL_COMPOSITION = COMMERCIAL
ASSET_UTILISATION = INTENTIONAL
TYPOGRAPHY = PRODUCTION
SPACING_SCALE_HIERARCHY = PRODUCTION
NO_DEBUG_DEV_COPY = PASS
NO_PROTOTYPE_LOOKING_SURFACES = PASS
FOUNDER_ASSET_ESTATE_USED_WHERE_RELEVANT = PASS
FULL_STELLAR_VIEWPORT = PASS
```
