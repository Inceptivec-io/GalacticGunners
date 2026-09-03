# Surface Permission Matrix

| Capability | Platform Owner | Platform Admin (delegated) | Business Admin | Editor | Player | Anonymous |
|---|---:|---:|---:|---:|---:|---:|
| Open Inceptivec Admin | Yes | only with portal permission | No | No | No | No |
| Publish CORE campaign/release | Yes | No unless explicit `platform.publish_core` Founder grant | No | No | No | No |
| Manage plans/organisation assignments | Yes | only explicit permission | No | No | No | No |
| Moderate global scores/logs | Yes | delegated | No | No | No | No |
| Open Command Post | membership-dependent | membership-dependent | Yes | Yes | Yes/light pages | No |
| Read own organisation content | support access must be explicit/audited | same | Yes | Yes | membership-limited | No |
| Create organisation project/map | explicit support policy | same | plan/entitlement | only if membership grants create | No | No |
| Edit organisation draft | explicit audited support | same | Yes | Yes | No | No |
| Publish organisation content | explicit audited support | same | Yes | explicit publish grant only | No | No |
| Manage organisation members | explicit audited support | same | Yes | No | No | No |
| View own plan/usage | support permission | same | Yes | Yes | Yes | No |
| Change own plan | platform-only in H015 | platform-only | No | No | No | No |
| Play CORE campaign | Yes | Yes | Yes | Yes | Yes | Yes |
| Play authorised organisation SOLO game | Yes when support-authorised | same | Yes | Yes | Yes | invitation/public policy | 
| Start dual-player mode | No — capability reserved | No | No | No | No | No |
| Publish anonymous leaderboard score | N/A | N/A | N/A | N/A | login/claim required | No |

Platform roles are Django permissions/groups. Organisation roles are membership records. Plans/entitlements are commercial capabilities. These remain independent predicates.

Support access does not automatically follow from Platform Owner or superuser status in ordinary product APIs. If break-glass superuser bypass exists locally, it must be deliberate, visibly labelled and audited.

