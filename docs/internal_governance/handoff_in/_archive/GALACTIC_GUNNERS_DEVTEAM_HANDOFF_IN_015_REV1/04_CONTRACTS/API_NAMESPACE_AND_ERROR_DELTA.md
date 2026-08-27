# API Namespace and Error Delta

## Namespace rule

- `/admin/*` API operations are platform-wide administration only.
- `/command-post/*` API operations are customer organisation overview, membership, plan, score and project listing/creation only.
- `/authoring/*` is the one shared content-authoring API used by both Inceptivec Admin and Command Post Designer.
- public/player/campaign/leaderboard/Boarding endpoints remain under their original semantic namespaces.

The original `/admin/game-projects/...` content endpoints are replaced by `/authoring/...`; do not maintain two implementations. A temporary server-side compatibility redirect is inappropriate for state-changing API calls. If already consumed by local H015 code, update the client and return a documented `410` for the old mutation paths during development until removal before merge.

`AuthoringContext` is computed server-side and contains project identity, owner scope, owning organisation when authorised, effective actions, active plan limits/usage and preview/publish eligibility. The browser never submits an ownership scope to elevate itself.

## Additional stable error codes

Append to the original error registry:

```text
PORTAL_ACCESS_DENIED
DJANGO_ADMIN_DISABLED
PLAN_REQUIRED
PLAN_SUSPENDED
PLAN_RETIRED
MAP_LIMIT_REACHED
CAPABILITY_RESERVED
PLAY_MODE_UNAVAILABLE
CAMPAIGN_VERSION_MISMATCH
CAMPAIGN_ENTRY_MISMATCH
CAMPAIGN_ENTRY_GAP
BUILD_PROVENANCE_MISMATCH
REVIEW_ENVIRONMENT_NOT_READY
```

`MAP_LIMIT_REACHED` is HTTP 409. `CAPABILITY_RESERVED` and `PLAY_MODE_UNAVAILABLE` are HTTP 403 for authenticated customer operations and 422 for schema-valid play requests whose mode is not released. Build/readiness failures are not exposed as public stack detail.

