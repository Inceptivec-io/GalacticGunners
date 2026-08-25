# CONFIG / ENVIRONMENT / DOCKER SPECIFICATION

REFINE EXISTING:

- `.env.example`
- `docker-compose.yml`
- `backend/Dockerfile`
- `apps/web/Dockerfile`
- backend settings modules
- web environment/config handling

## Environment contract

At minimum document/validate:

```text
POSTGRES_DB
POSTGRES_USER
POSTGRES_PASSWORD
DATABASE_URL

DJANGO_SETTINGS_MODULE
DJANGO_SECRET_KEY
DJANGO_ALLOWED_HOSTS
DJANGO_DEBUG
DJANGO_CORS_ALLOWED_ORIGINS (if CORS used)

NEXT_PUBLIC_API_BASE_URL
```

Do not expose server secrets to the browser.

`.env.example` contains placeholders only.

No real credentials.

## Docker target

One command should bring up the foundation:

```text
docker compose up --build
```

Expected services:

```text
db
backend
web
```

## Required health behaviour

- PostgreSQL healthcheck.
- backend service health endpoint.
- web should wait on/recover from backend availability appropriately.
- startup must not rely on arbitrary sleeps if health/dependency mechanisms can be used.
- backend container must apply the intended startup command deterministically.

## Ports

Foundation defaults:

```text
web      3000
backend  8000
postgres internal 5432
```

Do not expose PostgreSQL publicly unless required for local development and explicitly justified.

## Docker verification

Required:

```text
docker compose config = PASS
docker compose build = PASS
docker compose up = HEALTHY
GET web surface = PASS
GET /api/v1/health/ = 200
database connectivity = PASS
```

Record exact commands/results.
