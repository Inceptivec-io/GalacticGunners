# Validation and Hostile Test Delta

Original H015 validation remains mandatory. Add these exact gates.

## Environment and provenance

- default/public API base equals `/api/v1`;
- built browser JS contains no `http://localhost:8010` or `backend:8000`;
- proxied health/auth work from 3002 with cookies/CSRF;
- direct cross-origin credential workflow is not used by Founder scripts;
- source SHA mismatch fails readiness;
- stale pre-existing image/container cannot pass readiness;
- missing/wrong Founder env values are safely generated/reset by bootstrap;
- secrets absent from Git diff, logs and evidence.

## Route and auth separation

- unauthenticated internal admin and Command Post show only their login/neutral state;
- player credentials denied for internal admin;
- non-member player denied Command Post;
- customer member denied internal admin and CORE APIs;
- internal admin support access to tenant content requires explicit permission/reason/audit;
- Django Admin unavailable when `ENABLE_DJANGO_ADMIN=false` and requires staff superuser when enabled;
- no product navigation links Django Admin;
- legacy `/gamification` redirects once; no duplicate UI/API implementation.

## Quotas and plans

- exact four seed plans validate and seed idempotently;
- limits are 5/100/250/500 respectively;
- plan rename/display changes do not alter stable code;
- create/clone/unarchive at quota is denied atomically;
- two concurrent creates at one remaining slot create exactly one map;
- versions do not increment map count;
- another organisation's count is not leaked;
- reserved dual-player/public-sharing routes or modes return unavailable/denied and cannot start play;
- changing assignment preserves auditable snapshot; suspension does not delete content.

## Expandable campaigns

- publish validation accepts current six contiguous entries;
- a seventh explicit test entry can be added through normal model/API/runtime with no engine code or enum change;
- duplicate/gapped positions fail publish;
- run pins exact campaign version/release;
- next entry resolves by pinned ordered identity;
- final entry is detected by `next_entry=null`, not by position 6;
- old six-entry runs remain reproducible after a longer release publishes.

## UI/runtime observations

- Level 2 layout differs and asteroid hazard is visible/collidable/scored;
- Level 4 Boarding anchor visible and reachable;
- Continue retains server-accepted cumulative score/lives/nukes;
- death shows deliberate panel/actions and never automatic reload;
- internal and Command Post Designer render same saved definition while enforcing different ownership effects;
- Command Post terminology is customer-friendly and exposes no platform-only controls;
- all admitted production imagery categories are represented in chooser/runtime evidence.

## Required CI job additions

- `environment-contract`
- `surface-auth-hostile`
- `plan-quota-hostile`
- `expandable-campaign-hostile`
- `founder-review-smoke`

They may be combined with substantive existing jobs only if individual failures remain attributable. Do not replace behavioural tests with filename/text-presence checks.

