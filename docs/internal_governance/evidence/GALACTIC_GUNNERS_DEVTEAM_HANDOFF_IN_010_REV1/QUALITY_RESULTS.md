# REV1 Quality Results

Date: 2026-08-25
Branch: feature/v1-level1-vertical-slice

| Gate | Command | Result |
|---|---|---|
| npm install | `npm ci` | PASS, 0 vulnerabilities |
| aggregate JS/game/web quality | `npm run quality` | PASS |
| asset sync | `npm run assets:sync` | PASS, 18 canonical runtime assets synced |
| contracts | `npm run contracts:validate` | PASS |
| game typecheck | `npm --workspace game run typecheck` | PASS |
| game tests | `npm --workspace game run test` | PASS, 6/6 |
| web typecheck | `npm --workspace apps/web run typecheck` | PASS |
| web build | `npm --workspace apps/web run build` | PASS |
| docker build/start | `docker compose up --build -d` | PASS |
| backend health | `http://localhost:8010/api/v1/health/` | PASS, HTTP 200 |
| web health | `http://localhost:3002/api/health` | PASS, HTTP 200 |
| runtime hostile/composition | `GG_RUNTIME_URL=http://localhost:3002 npm run runtime:hostile` | PASS |
| backend check | `docker compose exec -T backend python manage.py check --settings=config.settings.local` | PASS |
| migration check | `docker compose exec -T backend python manage.py makemigrations --check --settings=config.settings.local` | PASS |
| migrate | `docker compose exec -T backend python manage.py migrate --noinput --settings=config.settings.local` | PASS |
| backend pytest | `docker compose exec -T backend pytest` | PASS, 11/11 |

Notes:

- A local default Python 3.12 backend attempt was rejected by the package Python requirement `>=3.13`; valid backend evidence is the Python 3.13 Docker backend run above.
- Offline backend probe intentionally uses `http://127.0.0.1:8999/api/v1/game-runs/`; the expected refusal is classified separately and does not count as an unexpected runtime/network failure.

Runtime URL retained for Founder preview:
`http://localhost:3002/play`
