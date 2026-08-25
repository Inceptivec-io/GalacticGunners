# REV1 CI Bootstrap Correction

Handoff revision: `GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_006_REV1`

Target PR: `#1`

Branch: `feature/legacy-game-containment`

REV1 entry HEAD: `921af6566cb9784f5db7e7b803549010a0578e5b`

## Root Cause

GitHub Actions workflow `.github/workflows/quality.yml` uses `actions/setup-node@v4` with:

```yaml
node-version: '22'
cache: npm
```

The production architecture branch uses root npm workspaces declared in `package.json`:

- `apps/web`
- `game`

The branch did not contain a root `package-lock.json`, so setup-node npm cache bootstrap failed before the intended Node quality commands ran.

## Correction

Generated and committed the authoritative root `package-lock.json` from the declared production architecture npm workspace dependency graph using `npm install`.

No lockfile was copied from `Legacy_Game/`.

No workflow checks were disabled or skipped.

No setup-node dependency was introduced on `Legacy_Game/`.

## Package Lock / Dependency Determination

Root npm workspaces are authoritative for the production architecture.

The durable solution is a root `package-lock.json` that covers the root workspace dependency graph for:

- `apps/web`
- `game`

## Local Verification

Executed:

- `npm install` - PASS; audit 0 vulnerabilities.
- `npm run game:typecheck` - PASS.
- `npm --workspace apps/web run typecheck` - PASS.
- `npm run contracts:validate` - PASS.
- `npm run quality` - PASS.

## Containment Recheck

Source-vs-contained reconciliation:

`PASS`

Counts:

- Source files: `1149`
- Target files: `1150`
- Preserved identical files: `1148`
- Intentional metadata differences: `2`
- Missing files: `0`
- Unexpected files: `0`
- Differing files: `0`

## Isolation Recheck

Command:

`rg -n Legacy_Game apps backend game packages scripts assets`

Result: no matches.

- `PRODUCTION_IMPORTS_FROM_LEGACY_GAME = 0`
- `PRODUCTION_RUNTIME_DEPENDENCIES_ON_LEGACY_GAME = 0`

## Scope Confirmation

- `EXTERNAL_STEP_4_ASSET_IP_PACKAGE_TOUCHED = NO`
- `LEGACY_GAME_REFACTORED = NO`
- `LEGACY_GAME_BUG_FIXES = NO`
- `PRODUCTION_FEATURE_WORK = NO`
- `PR_MERGED = NO`

GitHub Actions run ID, backend result, client-and-game result and overall workflow result are recorded externally after final push.
