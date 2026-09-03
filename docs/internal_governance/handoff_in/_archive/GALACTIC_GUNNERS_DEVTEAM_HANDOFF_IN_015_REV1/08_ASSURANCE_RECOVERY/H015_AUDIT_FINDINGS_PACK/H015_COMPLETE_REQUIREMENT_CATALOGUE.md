# H015 Complete Requirement Catalogue

Every row is mandatory. Development must create machine-readable mappings to implementation, positive test, negative test, CI job and evidence.

| ID | Requirement | Positive proof | Negative proof |
|---|---|---|---|
| H015-ENTRY-001 | Root Play enters governed game launch | Real `/` → Play journey | Runtime failure shows safe error |
| H015-LAUNCH-001 | Fresh `/play` shows approved 2s splash and exact footer | Video + timing assertion | No premature menu; no replay on internal navigation |
| H015-MENU-001 | Main Menu focus and all actions usable | Keyboard/mouse/touch | Disabled/duplicate/hidden actions absent |
| H015-PAUSE-001 | Pause freezes full simulation | State ledger before/during/after | Inputs cannot mutate paused world |
| H015-PAUSE-002 | Resume, Restart, Main Menu work repeatedly | Three real inputs | No black overlay, loop or lost state |
| H015-RESULT-001 | Result detail is readable above artwork | Visual + DOM/runtime positions | No overlap across supported viewports |
| H015-RESULT-002 | Continue only when pinned release has next entry | Six- and seven-level releases | Final entry has no Continue |
| H015-AUTH-001 | Internal redirect validator accepts same-origin path | Valid internal destinations | External, protocol-relative, backslash, encoded and script URLs rejected |
| H015-AUTH-002 | Visible CSRF-protected logout clears session | UI logout and denied API afterward | Missing/invalid CSRF rejected |
| H015-PERM-001 | Only internal admin edits/publishes CORE | Authorised admin success | Player and tenant customer denied server-side |
| H015-PERM-002 | Tenant authors only owned content | Same-tenant CRUD | Cross-tenant read/edit/preview/publish/archive denied |
| H015-DES-POINTER-001 | Pointer mapping correct at 50/75/100/125/150% | Real mouse drag centre/edge | Outside/overlap/cancel cannot corrupt coordinates |
| H015-DES-POINTER-002 | Touch and pen-compatible pointer capture | Real touchscreen/browser pointer path | Lost pointer/cancel produces safe state |
| H015-DES-UNDO-001 | One drag creates one undo transaction | Undo/redo exact coordinate | Partial moves do not create multiple history entries |
| H015-DES-THUMB-001 | Animated assets show canonical single-frame preview | Catalogue-driven previews | Raw full sprite sheet never rendered as thumbnail |
| H015-DES-META-001 | Name, slug, sequence, seed editable/validated | Valid edit roundtrip | Invalid/duplicate/out-of-range rejected |
| H015-DES-CANVAS-001 | Canvas size, grid, snap, background editable | Valid edit roundtrip | Unsafe bounds/unknown asset rejected |
| H015-DES-SPAWN-001 | Player asset/position/rotation/enabled editable | Exactly one enabled spawn | Zero/multiple enabled spawns rejected |
| H015-DES-ENTITY-001 | All entity fields editable | Each type and field persists | Invalid type/asset/bounds/profile rejected |
| H015-DES-FORM-001 | Formation layout/bounds/members/motion/delay/repeat editable | Grid/wedge/freeform/mixed roundtrip | Duplicate/missing member and invalid bounds rejected |
| H015-DES-HAZARD-001 | Every emitter field editable and consumed | Asteroid/comet valid matrix | Invalid intervals/speeds/edges/counts rejected |
| H015-DES-SHIELD-001 | Matrix editor, destructible tiles, clone/move/delete | Visual and runtime roundtrip | Invalid matrix/tile asset/budget rejected |
| H015-DES-DROP-001 | Host types, pickup, probability, maximum/window editable | Valid drop rule runtime | Probability/range/reference errors rejected |
| H015-DES-OBJ-001 | Objective type/state/targets/duration editable | Each used objective compiles/runs | Unknown/missing target and invalid duration rejected |
| H015-DES-BOARD-001 | Boarding source/interior/envelope/duration/interaction editable | Valid anchor launches | Missing source/checksum/ownership rejected |
| H015-DES-GAME-001 | Lives/nukes/rearm/pause/replay/menu/scoring/reward editable | Runtime consumes each value | Unsafe range/unknown profile rejected |
| H015-DES-BUDGET-001 | Enemy/hazard/projectile/shield/total budgets editable | Runtime respects budgets | Over-budget publication rejected |
| H015-DES-ROUND-001 | Full save/reload/checksum preview/publish journey | Complete 22-step browser journey | Stale version/checksum and invalid draft rejected |
| H015-DES-PIN-001 | Existing campaign remains pinned after new publication | Old and new campaigns compared | Silent mutation impossible |
| H015-DES-ROLL-001 | Rollback publishes new derived version | Restored new campaign | Historical record cannot be overwritten/deleted |
| H015-DES-AUDIT-001 | Every edit/publication records actor/time/source/new/checksums/reason | Audit record comparison | Missing actor/reason and unauthorised mutation rejected |
| H015-LEVELS-001 | Levels 1–6 directly openable, complete and previewable | UI iteration over all levels | Missing/draft/unauthorised preview rejected |
| H015-CAMP-001 | Six-level ordered release publishes | Real release and journey | Gap/duplicate/draft/unauthorised reference rejected |
| H015-CAMP-002 | Seven-plus-level release supported | Publish and enter Level 7 | No exact-six ceiling remains |
| H015-CAMP-003 | Levels 1–6 complete through ordinary mechanics | Real-play video/event ledger | Unwinnable/invalid objective detected; force hooks prohibited |
| H015-HAZ-001 | Recurring hazards spawn with governed variation | Multi-direction/speed/rotation/despawn evidence | Max-active and invalid emitter safeguards |
| H015-HAZ-002 | Collision and projectile destruction behave once | Real collision and real aim/fire | Invisible body/double score/out-of-world collision rejected |
| H015-BOARD-ENTRY-001 | Visible distinct entry and exit airlocks | Physical arrival/departure | Premature exit denied |
| H015-BOARD-COMBAT-001 | Movement/jump/fire/enemy movement/fire/health/hit/death operate | Keyboard and touch real play | Collision, health and projectile invalid states rejected |
| H015-BOARD-ANIM-001 | Player/alien required animation states use admitted metadata | State-by-state visual/runtime assertion | Missing frame/unknown atlas falls safe and blocks publication |
| H015-BOARD-PAUSE-001 | ESC opens explicit Resume/Abort/Menu surface | Resume and confirmed abort | ESC cannot immediately mutate/abort |
| H015-BOARD-RETURN-001 | Success/abort return exact Shooter checkpoint without retrigger | Both journeys | Stale/double completion and immediate retrigger rejected |
| H015-BOARD-FAIL-001 | Death and API failure resolve safely | Controlled failure journeys | No loop, fabricated success or resource corruption |
| H015-UI-ASSET-001 | Asset-gap register lists every temporary control/state/size | Register-to-runtime reconciliation | Unregistered generated control fails closure |
| H015-A11Y-001 | Web/admin/account/Command Post keyboard and axe checks | Zero critical violations | Focus trap, inaccessible name and contrast failures block |
| H015-PERF-001 | Runtime honours object/frame/startup budgets | Telemetry under representative load | Budget breach fails CI |
| H015-PROD-001 | Production mode excludes review identities and QA controls | Production build negative inspection | `qa=hostile`, globals and bootstrap endpoints cannot activate |
| H015-EVID-001 | Every gate exact-SHA, action-bound and independently attested | Two-artifact audit | Missing/failed/pending/duplicate/mismatched evidence rejected |
| H015-CODE-001 | Lint, format, type, complexity and documentation standards pass | Standard tool reports | Any bypass or warning-as-success rejected |
| H015-TEST-001 | Every requirement has positive and negative tests | Traceability validator | Orphan requirement/test/evidence blocks closure |

## Closure rule

The complete catalogue, not a selected subset, is the closure denominator. `FOUNDER_REVIEW_READY=YES` is forbidden until every row is PASS or an explicit Founder-approved exception is recorded.
