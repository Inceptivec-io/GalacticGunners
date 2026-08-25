# GALACTIC GUNNERS — DEPENDENCY REGISTER

| Dependency | Version/Ref | Source | Purpose | Licence | Notice Required | Currentness | Replacement Risk |
|---|---|---|---|---|---|---|---|
| Phaser | 3.16.2 | Photon Storm / bundled runtime | game framework | MIT | YES | CURRENT LEGACY BASELINE | LOW |
| CourseSaucerInvaders-derived material | Jared York upstream | `jaredyork/CourseSaucerInvaders` | historical game foundation | MIT | YES | RETAINED | LOW |
| npm QA toolchain | package-lock pinned dev set | npm registry / `package-lock.json` | Handoff 004 development QA: Playwright 1.62.1, Sharp 0.35.3, pixelmatch 7.2.0, pngjs 7.0.0, ESLint 10.9.0, @eslint/js 10.0.1 | per package lock | NO runtime notice; dev/test only | CURRENT | LOW - audit 0 vulnerabilities; production Docker payload unaffected |
| yaml | 2.9.0 compatible | npm registry / `package-lock.json` | OpenAPI YAML parsing for contract validator | ISC | NO runtime notice; dev/test only | CURRENT | LOW |
| tsx | 4.20.0 compatible | npm registry / `package-lock.json` | TypeScript unit-test runner for game package architecture tests | MIT | NO runtime notice; dev/test only | CURRENT | LOW |
| postgres | 17-alpine | Docker Hub official image | Local/CI PostgreSQL persistence runtime | PostgreSQL License | NO repository notice required | CURRENT | LOW |
