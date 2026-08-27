# H014 Intermediate Runtime Reconciliation

Repository HEAD tested: `4171ab84b0072436287f5d2aa14ae253bfa4d732`

This is intermediate evidence. It does not close H014 and does not mark the H014 acceptance matrix as PASS.

## Executed Checks

- `npm run game:typecheck`: PASS.
- `npm run test:boarding`: PASS, 13 tests.
- `npm run contracts:boarding:validate`: PASS.
- Docker rebuilt from the tested workspace with `docker compose down` then `docker compose up --build -d`.
- Docker backend health: healthy.
- Docker web health: healthy.
- `docker compose exec -T backend python manage.py test boarding.tests -v 2`: PASS, 4 tests.
- `http://localhost:3002/`: HTTP 200.
- `http://localhost:3002/gg-runtime-assets/boarding/characters/player_001_v001.png`: HTTP 200.
- Playwright/Chromium startup and Level 1 browser check: PASS, zero captured console errors and zero request failures.
- GitHub Actions run `33049183966` for this commit: SUCCESS across all configured jobs.

## Browser Evidence

- `browser-play.png`: initial capture during asset loading.
- `browser-play-after-load.png`: production main menu after load.
- `browser-level1.png`: active Level 1 after Start.

The browser check observed one canvas, the production main menu after asset load, then `Level1Scene` with the remote Level 1 definition, 58 active scouts, input HUD, and zero captured browser errors or failed requests.

## Scope Limitation

These checks do not prove every required H014 acceptance row. In particular, they do not establish the complete server replay contract, all Boarding scene input/result paths, or the entire hostile/concurrency matrix. The H014 register and currentness file remain `IMPLEMENTATION / ACCEPTANCE-MATRIX RECONCILIATION IN PROGRESS`.
