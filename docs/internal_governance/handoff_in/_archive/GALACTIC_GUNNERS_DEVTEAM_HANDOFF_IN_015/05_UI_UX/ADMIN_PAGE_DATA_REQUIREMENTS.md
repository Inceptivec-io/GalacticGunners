# Administration Page Data Requirements

## Campaign

- project identity, scope/owner/visibility/entitlements;
- releases and checksums;
- Level/Interior list with sequence, active version, lifecycle, checksum and last actor/time;
- open Designer, clone/create, validate, publish/rollback/archive according to permission;
- no mutation of CORE content by Business users.

## Businesses

- organisation name/slug/status;
- active member counts by role;
- active entitlement codes, dates and limits;
- create/suspend/archive and grant/suspend entitlement only for Platform Owner permission;
- detail route shows safe audit history.

## Users

- username, display name, account/profile status, joined/last-login timestamp where policy permits;
- platform group assignments only for owner-authorised actors;
- organisation memberships scoped to actor permissions;
- never return password hash, reset token, raw session, email to unauthorised roles or capabilities.

## Scores

- public top ten view plus admin moderation state;
- filters for validated/rejected, player, campaign status and date;
- detail shows safe event counts/checksums/validation codes, not sensitive capabilities;
- suppress/restore/rename requires reason and immutable audit.

## Logs

- default latest 100 with server pagination;
- filters: event area, result, actor, organisation, target, correlation ID and date;
- redacted detail only;
- logs are not editable or deletable through product UI.

## Business portal

- own organisation header and entitlement summary;
- own members under Business Admin;
- own GameProjects, levels/interiors, releases and permitted asset catalogue;
- zero cross-tenant counts, search results, IDs or error detail.
