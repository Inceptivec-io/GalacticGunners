# GALACTIC GUNNERS — DEPENDENCY REGISTER

| Dependency | Version/Ref | Source | Purpose | Licence | Notice Required | Currentness | Replacement Risk |
|---|---|---|---|---|---|---|---|
| Phaser | 3.16.2 | Photon Storm / bundled runtime | game framework | MIT | YES | CURRENT LEGACY BASELINE | LOW |
| CourseSaucerInvaders-derived material | Jared York upstream | `jaredyork/CourseSaucerInvaders` | historical game foundation | MIT | YES | RETAINED | LOW |
| npm QA toolchain | package-lock pinned dev set | npm registry / `package-lock.json` | Handoff 004 development QA: Playwright 1.62.1, Sharp 0.35.3, pixelmatch 7.2.0, pngjs 7.0.0, ESLint 10.9.0, @eslint/js 10.0.1 | per package lock | NO runtime notice; dev/test only | CURRENT | LOW - audit 0 vulnerabilities; production Docker payload unaffected |
