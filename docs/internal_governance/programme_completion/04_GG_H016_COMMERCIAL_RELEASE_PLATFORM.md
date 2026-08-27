# GG-H016 — COMMERCIAL RELEASE PLATFORM + PRODUCTION OPERATIONS

## Outcome

Turn the accepted game into an operable commercial service with production deployment, observability, backup, rollback, legal/product surfaces, and release controls.

## Deployment topology

Preferred initial target remains:

```text
Vercel
- Next.js web/product shell

Railway
- Django/DRF API

Managed PostgreSQL
- Railway Postgres or approved managed Postgres
```

Native clients consume the same API.

Do not add Redis/Celery unless a measured requirement exists.

## Environment model

Required environments:

```text
feature
 dev
 stage
 prod
```

Each environment contract defines:
- web base URL;
- API base URL;
- health endpoints;
- canonical routes;
- admin route;
- database identity;
- storage/cache location;
- release channel;
- CORS/CSRF origins;
- secret-provider location.

Local `env.<environment>` files remain ignored.
Hosted secrets live in deployment-provider secret stores.

## Production security baseline

Required:
- HTTPS only;
- secure cookies/tokens;
- CSRF;
- restrictive CORS;
- CSP;
- rate limiting;
- secret management;
- dependency scanning;
- structured logging;
- audit retention;
- secure admin route/RBAC;
- error sanitization;
- backup encryption/provider controls;
- no debug mode in production.

## Health/readiness

Required:

```text
GET /api/v1/health/
```

Health must distinguish process liveness from required dependency readiness where practical.

Production monitoring covers:
- web availability;
- API availability;
- DB connectivity;
- error rate;
- latency;
- failed GameRun validation rate;
- admin publish failures;
- critical client-version failures.

## Observability

Define structured events for:
- app start;
- run start/complete/reject;
- level load/fallback;
- leaderboard validation;
- Boarding run;
- admin level lifecycle;
- auth security events;
- unhandled errors.

Do not log passwords/tokens or unnecessary personal data.

## Backups / recovery

Document and prove:
- database backup schedule;
- restore procedure;
- retention;
- Level/LevelVersion recovery;
- user/leaderboard/GameRun recovery;
- rollback after bad deployment.

A restore drill is required on non-production data before release.

## Release deployment

Required flow:

```text
feature → dev
→ stage
→ Founder/CTO stage acceptance
→ prod release candidate
→ smoke/health
→ release tag
```

No direct feature → prod.

## Product/legal surfaces

Player-facing production shell must contain current:
- product name/branding;
- privacy notice;
- terms;
- credits/notices;
- support/help;
- version/build information where appropriate;
- music/asset attribution where legally required.

No development terminology/placeholders.

## Metadata / store readiness

Repository must define canonical:
- product title `Galactic Gunners: Final Assault™`;
- `An Inceptivec Gamification Production` placement policy;
- favicon/icons;
- desktop/mobile icons;
- splash;
- screenshots requirements;
- short/long descriptions;
- age/rating content questionnaire inputs;
- privacy/support URLs;
- release notes template.

## Data protection

Minimize personal data.
Document:
- account data;
- leaderboard display data;
- retention/deletion flow;
- audit/legal retention exceptions;
- data subject request operational path.

## Operational admin

Admin guide must cover:
- environment access;
- account administration;
- level publish/rollback;
- leaderboard moderation;
- release rollback;
- incident response;
- backup restore escalation.

## Hostile/release tests

Required:
- prod settings prohibit debug;
- secret leakage scan;
- CORS/CSRF negative tests;
- CSP validation;
- rate-limit tests;
- unauthorised admin denial;
- migration forward/backout plan;
- backup restore drill;
- stage deployment smoke;
- invalid level rollback;
- API outage/degraded client behavior.

## Exit gate

```text
STAGE DEPLOYMENT = PASS
PROD TOPOLOGY = READY
SECURITY BASELINE = PASS
OBSERVABILITY = PASS
BACKUP = PASS
RESTORE DRILL = PASS
ROLLBACK = PASS
LEGAL/HELP/CREDITS = CURRENT
STORE METADATA = READY
NO SECRETS IN REPO = PASS
GOVERNANCE_DEBT_COUNT = 0
```

PR target: `dev`, Draft, not merged by Development.
