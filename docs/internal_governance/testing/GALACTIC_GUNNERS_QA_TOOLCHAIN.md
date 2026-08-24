# Galactic Gunners QA Toolchain

Handoff: `GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_004`

This repository now includes a development-only npm QA layer for Handoff 004 gameplay fidelity, sprite, browser, visual and lint verification. The tooling is not part of the production browser payload and is excluded from the Docker runtime by `.dockerignore`.

## Commands

| Command | Purpose |
|---|---|
| `npm run qa:syntax` | Node syntax check for first-party JavaScript and QA scripts. |
| `npm run qa:lint` | ESLint check for authored JavaScript, excluding vendored Phaser and low-level utility helpers. |
| `npm run qa:images` | Sharp image inspection gate. |
| `npm run qa:sprites` | Sharp sprite/atlas geometry and alpha-boundary verification. |
| `npm run qa:collision` | Playwright/Phaser runtime collision harness against Docker at `http://localhost:8027/`. |
| `npm run qa:browser` | Playwright browser, font, surface, pause, population and scene-flow verification. |
| `npm run qa:visual` | Playwright screenshot capture and pixelmatch visual stability check. |
| `npm run qa:all` | Complete Handoff 004 quality gate. Must pass before return. |

## Pinned Development Dependencies

| Dependency | Version | Use |
|---|---:|---|
| `playwright` | `1.62.1` | Chromium browser automation, touch emulation, screenshots, runtime failures and gameplay scene verification. |
| `sharp` | `0.35.3` | Image dimensions, alpha bounds, frame bounds and sprite/atlas inspection. |
| `pixelmatch` | `7.2.0` | Deterministic screenshot pixel comparison. |
| `pngjs` | `7.0.0` | PNG decode/encode for pixel comparison evidence. |
| `eslint` | `10.9.0` | Static JavaScript linting. |
| `@eslint/js` | `10.0.1` | ESLint recommended baseline. |

## Governance Notes

- The game remains a static Phaser browser game.
- Tooling is development/test only.
- The Docker runtime continues to serve only the current static runtime files.
- Vendored Phaser is excluded from first-party lint.
- Existing global-script game architecture is retained; `no-undef` is disabled for legacy browser-context scripts where globals are intentionally shared by load order.
- Handoff 004 evidence is written under `docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_004/`.
