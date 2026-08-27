# Routes, Authentication and Authorisation Contract

## Browser routes

All browser product routes use `http://localhost:3002` during Founder review.

| Route | Surface | Gate |
|---|---|---|
| `/`, `/play`, `/leaderboard` | public product | none |
| `/account/login`, `/account/register`, `/account` | player account | account gate where protected |
| `/inceptivec-gamification-admin/login` | internal login | anonymous only or redirect authorised user |
| `/inceptivec-gamification-admin` | internal overview | `INCEPTIVEC_ADMIN` surface grant |
| `/inceptivec-gamification-admin/campaigns` | CORE campaign/release management | platform campaign read/edit permission |
| `/inceptivec-gamification-admin/designer/{projectId}/{levelId?}` | shared Designer in CORE context | CORE object permission |
| `/inceptivec-gamification-admin/businesses` | organisation/plan/entitlement management | platform organisation/entitlement permission |
| `/inceptivec-gamification-admin/users` | safe identity/membership management | platform user/role permission |
| `/inceptivec-gamification-admin/scores` | score moderation/top ten | moderation permission |
| `/inceptivec-gamification-admin/logs` | platform/audit/runtime logs | audit permission |
| `/command-post/login` | customer login | anonymous only or redirect eligible user |
| `/command-post` | customer organisation chooser/overview | `COMMAND_POST` surface grant |
| `/command-post/{orgSlug}` | organisation overview | active membership |
| `/command-post/{orgSlug}/maps` | own maps | active membership plus entitlement for mutation |
| `/command-post/{orgSlug}/games` | own campaigns/releases | active membership plus role/entitlement |
| `/command-post/{orgSlug}/designer/{projectId}/{levelId?}` | shared Designer in organisation context | scoped project/map permission |
| `/command-post/{orgSlug}/scores` | own organisation results | scoped membership |
| `/command-post/{orgSlug}/members` | own members | BUSINESS_ADMIN |
| `/command-post/{orgSlug}/plan` | current plan/limits/capabilities | active membership; mutation forbidden |

Legacy `/gamification...` routes, if already implemented locally, issue a temporary 308 redirect to the exact `/command-post...` equivalent and contain no separate page/data implementation. New code and documentation use only Command Post.

## Django Admin

- backend path: `/django-admin/`;
- local setting only: `ENABLE_DJANGO_ADMIN=true`;
- Stage/Production default and required value: `false`;
- `config.urls` conditionally registers `admin.site.urls` only when enabled;
- no Next.js rewrite, navigation link or product credential supports it;
- access requires active staff superuser;
- `DEBUG=false` for Stage/Production.

## One identity, three login audiences

`POST /api/v1/auth/login/` requires `audience`:

```text
PLAYER_ACCOUNT | COMMAND_POST | INCEPTIVEC_ADMIN
```

Eligibility after valid username/password:

- `PLAYER_ACCOUNT`: active account and active profile;
- `COMMAND_POST`: above plus at least one active membership in an active organisation;
- `INCEPTIVEC_ADMIN`: above plus at least one platform portal permission; Platform Owner/Admin group alone is not inferred from route knowledge.

Invalid credentials always return generic `INVALID_CREDENTIALS`. Valid credentials lacking the requested audience return `PORTAL_ACCESS_DENIED` without establishing that audience session. The same Django session may later access every surface for which `auth/me` reports a grant; separate identity records are prohibited.

`GET /auth/me/` returns:

- authenticated identity/profile;
- `surface_grants`: `PLAYER_ACCOUNT`, `COMMAND_POST`, `INCEPTIVEC_ADMIN` as authorised;
- scoped memberships;
- platform permissions;
- no password hash, session ID, email, capability or inaccessible organisation.

Protected layouts resolve `auth/me` server-side or before rendering navigation/data. Exact state order remains CHECKING, UNAUTHENTICATED, UNAUTHORISED, AVAILABLE, SERVICE_UNAVAILABLE, SESSION_EXPIRED. A privileged shell is never painted underneath an unauthenticated message.

## Session and CSRF

- Session cookie: HttpOnly, SameSite=Lax, Secure in Stage/Production.
- CSRF cookie: SameSite=Lax, Secure in Stage/Production; readable only as required by Django's double-submit contract.
- Browser calls only relative `/api/v1/...`, with `credentials: 'same-origin'` or `include` consistently.
- Mutations send `X-CSRFToken`; obtain it from `GET /api/v1/auth/csrf/`.
- Login rotates session key; logout flushes session and clears client-sensitive cache.
- `Cache-Control: no-store` on auth, portal grants, capability and Founder review state.
- No auth/session/capability token in URL or localStorage.

## Server-side policy

Every endpoint evaluates account, surface, permission/membership, object scope, entitlement/quota and lifecycle. A caller who knows a UUID or route gains nothing. Cross-tenant inaccessible objects return 404 where existence would leak. Denials and privileged successes are audited using safe reason codes.

