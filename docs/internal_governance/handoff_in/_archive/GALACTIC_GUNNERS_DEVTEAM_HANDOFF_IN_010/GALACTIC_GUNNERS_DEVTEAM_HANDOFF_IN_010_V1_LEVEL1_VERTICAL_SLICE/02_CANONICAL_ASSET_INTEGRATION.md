# CANONICAL ASSET INTEGRATION SPECIFICATION

This handoff authorises the FIRST runtime use of the accepted canonical root `assets/` estate.

## Authority

Resolve exact Asset IDs, paths, SHA-256 and rights status from:

- `assets/registers/GG_ASSET_REGISTER.csv`
- `assets/registers/GG_ASSET_PROVENANCE_REGISTER.csv`

Only ACTIVE + production-cleared assets may enter runtime.

## Minimum required asset classes

Resolve canonical records for:

- stellar background;
- primary/menu Galactic Gunners title/logo;
- player ship sprite/sheet and atlas if applicable;
- scout sprite/sheet and atlas if applicable;
- player laser;
- enemy laser if used;
- small explosion if used;
- life/HUD icon if used;
- production title/display fonts;
- UI confirm/select audio;
- player laser audio;
- enemy laser audio if used;
- small explosion audio;
- player-hit audio.

Do not guess filenames when register authority exists.

## Asset delivery

Implement one deterministic mechanism.

Preferred:
1. build-time sync/copy from canonical root `assets/` to served runtime location; or
2. bundler-supported imports from canonical source.

Do not manually duplicate ad hoc individual copies.

Root `assets/` remains canonical authority.

If runtime copies are created:
- record canonical Asset ID;
- canonical path;
- canonical SHA-256;
- runtime-served path;
- verify bytes identical.

Create/refine typed semantic asset manifest, e.g.:

`game/src/config/assets.ts`

Semantic keys only:

```text
background.starfield
branding.primaryLogo
player.ship
enemy.scout
projectile.playerLaser
projectile.enemyLaser
fx.explosionSmall
ui.lifeIcon
audio.uiConfirm
audio.playerLaser
audio.enemyLaser
audio.explosionSmall
audio.playerHit
```

No handoff IDs as runtime asset keys.

## Exit gate

```text
RUNTIME_ASSETS_FROM_CANONICAL_REGISTER = 100%
LEGACY_GAME_RUNTIME_ASSET_PATHS = 0
UNREGISTERED_RUNTIME_ASSETS = 0
UNKNOWN_RIGHTS_RUNTIME_ASSETS = 0
ASSET_HASH_MUTATIONS = 0
LEGACY_GAME_MUTATED = NO
```
