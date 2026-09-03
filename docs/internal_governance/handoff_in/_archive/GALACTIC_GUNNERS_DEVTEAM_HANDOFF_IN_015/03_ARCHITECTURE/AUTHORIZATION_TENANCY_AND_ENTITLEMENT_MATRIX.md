# Authorisation, Tenancy and Entitlement Matrix

## Decision order

Every protected request evaluates:

```text
authenticated?
→ account active?
→ platform permission OR active membership?
→ object belongs to permitted scope?
→ required entitlement active and unexpired?
→ lifecycle transition permitted?
→ audit result
```

Route visibility is convenience only. API enforcement is authority.

| Action | Platform Owner | Platform Admin | Business Admin | Editor | Player | Anonymous |
|---|---:|---:|---:|---:|---:|---:|
| Read published CORE game | Yes | Yes | Yes | Yes | Yes | Yes |
| Play official campaign | Yes | Yes | Yes | Yes | Yes | Yes |
| Publish leaderboard score | Yes | Yes | Yes | Yes | Yes | No |
| Claim own validated anonymous campaign | Yes | Yes | Yes | Yes | Yes | Registration/login required |
| Read Platform portal | Yes | delegated | No | No | No | No |
| Manage organisations/entitlements | Yes | only explicit permission | No | No | No | No |
| Draft CORE content | Yes | explicit core-edit permission | No | No | No | No |
| Publish CORE content/release | Yes | No by default | No | No | No | No |
| Read own organisation private content | if support-authorised | delegated | Yes | Yes | membership-limited | No |
| Manage own organisation members | Yes | delegated | Yes | No | No | No |
| Create organisation project | Yes | delegated | with `CUSTOM_GAMES` | No | No | No |
| Edit organisation draft | Yes | delegated | Yes | Yes | No | No |
| Publish organisation content | Yes | delegated | Yes | only explicit membership permission | No | No |
| Create user map | Yes | Yes | Yes | Yes | with `USER_MAPS` | No |
| Moderate scores | Yes | delegated moderator | No | No | No | No |
| View audit logs | Yes | delegated and scoped | own organisation subset | own actions only if exposed | No | No |

## Isolation rules

- Tenant queries begin from objects authorised for the caller; never fetch globally then check only in UI.
- A tenant UUID in the path does not establish membership.
- `select_related`/prefetch must not serialize inaccessible nested objects.
- Search, count, error and timing behaviour must not reveal another organisation's private object; return 404 for inaccessible object identity where disclosure would leak existence.
- Platform support access to tenant content requires explicit permission, reason and audit.
- Suspended organisation: read-only export may be allowed to Platform Owner; all tenant mutation/play publication denied.
- Archived project/version remains immutable and non-runnable except governed historical inspection.

## Entitlement rules

- `CUSTOM_GAMES`: create organisation GameProjects and level/interior drafts.
- `PRIVATE_MAPS`: publish/play organisation/private visibility.
- `CONNECTED_APP`: reserves API integration eligibility; no OAuth/client secret implementation in H015.
- `USER_MAPS`: personal GameProject creation.

An expired/suspended entitlement blocks new mutation/publication but does not delete data. Existing published private play may be denied according to entitlement policy with an explicit response; CORE play always remains available.

## Platform Owner protection

- Owner permissions cannot be granted through Business portal.
- Platform Owner group changes require an existing Platform Owner or break-glass superuser and step-up reauthentication (current password) in the same session.
- The final active Platform Owner cannot remove their own last owner assignment.
- Every owner/group/entitlement mutation records before/after, actor, reason and correlation ID.
- No committed default password. Bootstrap uses environment-bound `createsuperuser`/management command and must force an intentional password setup.

