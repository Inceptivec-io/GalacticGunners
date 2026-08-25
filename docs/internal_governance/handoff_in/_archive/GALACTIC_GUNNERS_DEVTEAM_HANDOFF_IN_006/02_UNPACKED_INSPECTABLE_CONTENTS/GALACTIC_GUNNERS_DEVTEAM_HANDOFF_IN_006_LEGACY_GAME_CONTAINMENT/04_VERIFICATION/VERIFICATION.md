# VERIFICATION

Prove:

- `feature/GG-COM-001 == 6cda67...`
- `feature/production-architecture-foundation == 039aa132...`
- execution branch == `feature/legacy-game-containment`
- no source branch was force-reset or mutated.

Create a machine-readable inventory comparing:

SOURCE:
`feature/GG-COM-001 @ 6cda67...`

TARGET:
`feature/legacy-game-containment:/Legacy_Game`

Report:
- preserved identical files;
- intentional containment metadata differences;
- missing files;
- unexpected files.

Unexplained missing source files = FAIL.

Isolation:
`PRODUCTION_IMPORTS_FROM_LEGACY_GAME = 0`
`PRODUCTION_RUNTIME_DEPENDENCIES_ON_LEGACY_GAME = 0`

Scope:
`EXTERNAL_ASSET_IP_PACKAGE_TOUCHED = NO`
`LEGACY_GAME_REFACTORED = NO`
`LEGACY_GAME_BUG_FIXES = NO`
`PRODUCTION_FEATURE_WORK = NO`
