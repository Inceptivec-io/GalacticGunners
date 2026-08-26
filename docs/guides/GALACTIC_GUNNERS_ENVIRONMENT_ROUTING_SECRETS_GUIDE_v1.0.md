# Galactic Gunners Environment, Routing & Secrets Guide v1.0

## 1. Purpose

Every runtime environment must have one local ignored environment file containing:

- environment identity;
- application URL;
- API URL;
- health URLs/routes;
- canonical public/play/admin routes;
- environment-specific admin username;
- environment-specific admin password;
- credential-generation metadata.

The file naming convention is:

```text
env.feature
env.dev
env.stage
env.prod
```

These files are secrets and are ignored by Git through `env.*`.

## 2. Required environment variables

Each `env.<environment>` file must contain at least:

```text
GG_ENVIRONMENT=<feature|dev|stage|prod>

GG_APP_BASE_URL=<absolute web origin>
GG_API_BASE_URL=<absolute API base>

GG_HOME_ROUTE=/
GG_PLAY_ROUTE=/play
GG_ADMIN_ROUTE=/inceptivec-gamification-admin
GG_LEVEL_API_ROUTE=/api/v1/levels/
GG_ADMIN_LEVEL_API_ROUTE=/api/v1/admin/levels/

GG_WEB_HEALTH_URL=<absolute web health URL>
GG_API_HEALTH_URL=<absolute API health URL>

GG_ADMIN_USERNAME=<unique generated username>
GG_ADMIN_PASSWORD=<unique generated strong password>
GG_ADMIN_CREDENTIAL_GENERATED_AT=<ISO-8601 timestamp>
GG_ADMIN_CREDENTIAL_VERSION=1
```

Additional deployment-specific values may be added, but these names are the routing/security baseline.

## 3. Local feature/dev routing

The currently accepted Docker development topology uses:

```text
WEB: http://localhost:3002
API: http://localhost:8010/api/v1
PLAY: http://localhost:3002/play
WEB HEALTH: http://localhost:3002/api/health
API HEALTH: http://localhost:8010/api/v1/health/
ADMIN: http://localhost:3002/inceptivec-gamification-admin
```

When the feature or dev environment is run through the same local Docker topology, these are the expected URL values. If ports are deliberately changed, the corresponding `env.feature` / `env.dev` file must change in the same local setup.

## 4. Stage/prod routing

Do not invent stage or production URLs.

Before creating `env.stage` or `env.prod`, the exact deployed web/API origins must be known and verified. The bootstrap command requires those URLs explicitly.

Promotion of Git branch state to `stage` does not by itself create a deployed stage URL; environment routing becomes valid when the stage deployment endpoint exists.

## 5. Credential isolation

Each environment must have different credentials.

Forbidden:

```text
feature password = dev password
feature password = stage password
dev password = prod password
shared admin password across environments
committed credential files
credentials pasted into documentation
```

The bootstrap script generates credentials locally. Do not commit or paste generated values into pull requests, issues or chat.

## 6. Username/password policy

Generated usernames include environment identity and random entropy.

Passwords use cryptographically secure random bytes and must be at least 32 bytes of entropy before encoding.

Rotate credentials when:

- an environment is first commissioned;
- a credential may have been exposed;
- a privileged administrator leaves;
- security policy requires rotation.

Rotation must not silently overwrite an environment file without an explicit rotate/force option.

## 7. Hidden admin routing

Canonical admin route:

```text
/inceptivec-gamification-admin
```

It must not appear in public navigation, footer, sitemap, help, profile, credits, public search or player-facing documentation.

The route being unlisted is defense-in-depth only. Django authentication/RBAC remains the real security boundary.

## 8. Environment bootstrap

Use:

```text
node scripts/bootstrap-game-environment.mjs --environment feature
node scripts/bootstrap-game-environment.mjs --environment dev
```

Feature/dev default to the accepted local Docker URLs unless explicit URLs are supplied.

For stage/prod, supply verified deployment values:

```text
node scripts/bootstrap-game-environment.mjs \
  --environment stage \
  --app-url https://<stage-web-host> \
  --api-url https://<stage-api-host>/api/v1
```

The script writes `env.<environment>` in the repository root and refuses to overwrite an existing file unless `--rotate` is explicitly supplied.

## 9. Verification

Before testing an environment verify:

```text
file exists
file is git-ignored
GG_ENVIRONMENT matches intended environment
web URL responds
API health responds
play URL responds
admin URL resolves only for authorized admin
normal player cannot access admin
```

A wrong URL or wrong environment credential file is an environment defect, not a gameplay defect.
