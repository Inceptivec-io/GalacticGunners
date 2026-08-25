# Handoff 008 Docker Full-Stack Smoke

Handoff: `GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_008`

## Compose Configuration

`docker compose config`: PASS

## Build And Startup

`docker compose up --build -d`: PASS after bounded Docker packaging corrections.

Corrected defects found during hostile Docker validation:

- `apps/web/public` did not exist, causing standalone Docker copy failure. Added tracked `apps/web/public/.gitkeep`.
- Host port `8000` was already occupied by the running `tos-pl-000-backend-dev` container. Galactic Gunners backend container port remains `8000`; host binding defaults to `8010`.
- Host port `3000` reset requests in the local environment. Galactic Gunners web container port remains `3000`; host binding defaults to `3002`.

## Verified Runtime URLs

| Surface | URL | Result |
|---|---|---|
| Web health | `http://127.0.0.1:3002/api/health` | HTTP 200 |
| Web root | `http://127.0.0.1:3002/` | HTTP 200 |
| Backend health | `http://127.0.0.1:8010/api/v1/health/` | HTTP 200 |
| Backend leaderboard | `http://127.0.0.1:8010/api/v1/leaderboard/` | HTTP 200 |

## API Smoke

| Scenario | Result |
|---|---|
| Start guest game run | PASS - HTTP 201 implicit |
| Complete game run | PASS - HTTP 200, score 125 |
| Duplicate completion | PASS - HTTP 409 |
| Invalid start payload | PASS - HTTP 400 |
| Missing run completion | PASS - HTTP 404 |
| Leaderboard publication | PASS - count 1, top score 125 |

## Database

`docker compose exec -T backend python manage.py shell -c "... connection.vendor ..."` returned `postgresql`.

## Safe Exit

`docker compose down -v`: PASS. Containers and the Galactic Gunners Postgres volume were removed. Existing unrelated orphan preview container `galactic-gunners-founder-local` was not modified.
