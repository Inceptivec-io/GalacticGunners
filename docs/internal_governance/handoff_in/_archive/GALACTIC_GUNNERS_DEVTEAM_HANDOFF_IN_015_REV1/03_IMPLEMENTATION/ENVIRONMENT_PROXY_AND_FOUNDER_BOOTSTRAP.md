# Environment, Same-Origin Proxy and Founder Bootstrap

## Required topology

```text
Browser http://localhost:3002
  ├── product pages
  ├── game assets
  └── /api/v1/*  → server-side proxy/rewrite → http://backend:8000/api/v1/*

Technical backend http://localhost:8010
  ├── /api/v1/health/ for diagnostics
  └── /django-admin/ only when local enable flag is true
```

The Founder never uses port 8010 for `/play`, product admin or Command Post.

## Exact configuration changes

1. Browser API default and Docker value: `NEXT_PUBLIC_API_BASE_URL=/api/v1`.
2. Server-only proxy target: `INTERNAL_API_ORIGIN=http://backend:8000` in Docker and `http://localhost:8010` only for non-container Next.js development.
3. `apps/web/next.config.ts` rewrites `/api/v1/:path*` to `${INTERNAL_API_ORIGIN}/api/v1/:path*`.
4. No browser bundle may contain `INTERNAL_API_ORIGIN`.
5. Local direct cross-origin CORS is diagnostic compatibility only. If enabled, exact allowed origins are configured and `CORS_ALLOW_CREDENTIALS=true`; wildcard origins are forbidden with credentials.
6. Add parsed `DJANGO_CSRF_TRUSTED_ORIGINS`, proxy SSL header and forwarded-host handling appropriate to deployment.
7. Container/web health verifies both `/api/health` and proxied `/api/v1/health/`.

## Required environment names

The supplied env example is canonical. Real values belong in ignored `.env`/secret storage. Production settings fail closed for missing secret, database, allowed host, CSRF origin and admin-disable values.

## Founder review account bootstrap

Provide semantic management command:

```text
python manage.py bootstrap_founder_review
```

It reads:

```text
FOUNDER_REVIEW_USERNAME
FOUNDER_REVIEW_PASSWORD
FOUNDER_REVIEW_DISPLAY_NAME
```

The command is local-only and refuses to execute unless `FOUNDER_REVIEW_MODE=true` and settings environment is local. It is idempotent and transactionally:

1. normalises/creates the Django user;
2. sets the password to the exact current environment value every run;
3. sets active profile/display name;
4. assigns Platform Owners plus required portal permissions;
5. does not set `is_superuser` or `is_staff` unless separate local Django-admin bootstrap is explicitly invoked;
6. prints no password or session secret;
7. emits safe success/failure status.

Django Admin technical credentials use separate optional local-only names `DJANGO_LOCAL_SUPERUSER_USERNAME` and `DJANGO_LOCAL_SUPERUSER_PASSWORD`. They must not be confused with the product-admin login.

## One-command review scripts

Required Windows scripts at repository root/scripts:

- `scripts/start-founder-review.ps1`
- `scripts/status-founder-review.ps1`
- `scripts/stop-founder-review.ps1`

Start must:

1. prove active H015 branch, local SHA, remote relation and dirty state without discarding work;
2. load ignored local env or create safe local random credentials when missing;
3. run Docker Compose with build/recreate so source/container drift cannot remain hidden;
4. migrate, seed runtime authority and bootstrap Founder review account;
5. wait for DB, backend, proxied API, web and required assets;
6. query build provenance endpoint and prove it equals the source SHA or explicitly fail;
7. perform login/CSRF/logout smoke through port 3002;
8. write ignored `FOUNDER_REVIEW_ACCESS.local.txt` containing source SHA, container SHA/build ID, exact URLs, product-admin username/password and review order;
9. finish with `FOUNDER_REVIEW_READY=YES` only when every gate passes.

Status repeats provenance/health without mutation. Stop performs `docker compose down` without volume deletion. No script uses `down -v`, deletes credentials, resets Git or removes unique work.

## Build provenance endpoint

`GET /api/v1/system/build/` returns safe non-secret values:

```json
{
  "application": "galactic-gunners",
  "source_sha": "40-lowercase-hex",
  "build_id": "string",
  "environment": "local",
  "api_version": "v1",
  "schema_state": "CURRENT"
}
```

The web review banner may show the short SHA in local Founder mode only. Stage/Production may expose a safe build identifier but no filesystem/config detail.

