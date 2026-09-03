# GALACTIC GUNNERS MASTER PLAYLIST v1.3
## H015 Platform Foundation, Campaign Continuity and Boarding Completion

**Supersedes:** `GALACTIC_GUNNERS_MASTER_PLAYLIST_v1.2.md`  
**Identifier family:** `GG13-*`  
**Execution rule:** perform in order; a failed gate is corrected before proceeding.

## A. Admission and currentness

- `GG13-CUR-001` Verify `dev` at `3270be64c67863dc848ebad26e2a33daf8b70742`.
- `GG13-CUR-002` Create `feature/v1-platform-foundation-campaign-continuity` from that SHA.
- `GG13-CUR-003` Preserve and hash inbound H015 ZIP.
- `GG13-CUR-004` Record safe extraction, malware scan and inventory.
- `GG13-CUR-005` Archive Roadmap/Playlist v1.2 unchanged under `planning/_archive/v1.2/`.
- `GG13-CUR-006` Admit Roadmap/Playlist v1.3 as the only current pair.
- `GG13-CUR-007` Admit H015 as current handoff; record H014 Founder-accepted deferrals.
- `GG13-CUR-008` Resequence native/commercial/release programme documents to H016/H017/H018.
- `GG13-CUR-009` Update currentness and project-state registers.

## B. Baseline characterization

- `GG13-BASE-001` Add failing browser test for unauthenticated admin entry.
- `GG13-BASE-002` Add failing integration test reproducing Campaign Designer fetch failure.
- `GG13-BASE-003` Add campaign test proving Continue currently resets score/resources.
- `GG13-BASE-004` Add level identity/content-difference test for Levels 1–6.
- `GG13-BASE-005` Add anonymous ranking and score-claim characterization.
- `GG13-BASE-006` Add H014 Boarding end-to-end characterization for entry, success, timeout, death and restore.
- `GG13-BASE-007` Record screenshots/logs and root causes before correction.

## C. Same-origin API and session foundation

- `GG13-AUTH-001` Route browser API calls through same-origin `/api/v1` in web and Docker.
- `GG13-AUTH-002` Remove conflicting hard-coded browser API origins.
- `GG13-AUTH-003` Add CSRF bootstrap endpoint and client handling.
- `GG13-AUTH-004` Add register, login, logout and current-session endpoints.
- `GG13-AUTH-005` Use Django session authentication with secure production cookie settings.
- `GG13-AUTH-006` Enable credentials only for governed development origins where needed.
- `GG13-AUTH-007` Add login/registration throttles and request-size bounds.
- `GG13-AUTH-008` Enforce case-insensitive unique username.
- `GG13-AUTH-009` Enforce case-insensitive unique public display name.
- `GG13-AUTH-010` Apply Django password validation and generic login failure responses.
- `GG13-AUTH-011` Add explicit admin login page.
- `GG13-AUTH-012` Redirect unauthenticated admin requests before privileged shell render.
- `GG13-AUTH-013` Render intentional 403 for authenticated unauthorised users.
- `GG13-AUTH-014` Add logout/session-expiry handling without stale privileged state.
- `GG13-AUTH-015` Hostile-test CSRF, cookie, brute-force, enumeration and route denial.

## D. Platform, organisation and entitlement authority

- `GG13-IAM-001` Add `Organization` and status constraints.
- `GG13-IAM-002` Add `OrganizationMembership` with one active role per user/organisation.
- `GG13-IAM-003` Seed Django permissions/groups for Platform Owner and Platform Admin.
- `GG13-IAM-004` Implement Business Admin, Editor and Player membership roles.
- `GG13-IAM-005` Add `BusinessEntitlement` with feature code, limits and validity period.
- `GG13-IAM-006` Keep permission, membership and entitlement checks separate.
- `GG13-IAM-007` Add object-level policy service used by all tenant endpoints.
- `GG13-IAM-008` Deny cross-organisation reads and writes, including guessed UUIDs.
- `GG13-IAM-009` Restrict global publish, organisation lifecycle, role and entitlement mutation.
- `GG13-IAM-010` Add append-only `PlatformAuditEvent`.
- `GG13-IAM-011` Provide Platform Owner Businesses and Users pages.
- `GG13-IAM-012` Provide isolated Business portal and membership management.
- `GG13-IAM-013` Add audit evidence for permitted and denied operations.

## E. Game/content ownership

- `GG13-CONT-001` Add `GameProject` with `CORE|ORGANIZATION|USER` ownership.
- `GG13-CONT-002` Enforce exactly one matching owner for non-core scopes and no owner for core.
- `GG13-CONT-003` Make ownership immutable after creation.
- `GG13-CONT-004` Add visibility separate from lifecycle.
- `GG13-CONT-005` Add immutable `GameRelease` manifest/checksum.
- `GG13-CONT-006` Seed one official CORE Galactic Gunners project.
- `GG13-CONT-007` Attach existing official `Level` records to the CORE project.
- `GG13-CONT-008` Attach Boarding `Interior` records to the CORE project.
- `GG13-CONT-009` Permit custom project creation only with entitlement.
- `GG13-CONT-010` Pin custom projects to an optional published base release.
- `GG13-CONT-011` Implement audited copy/promotion; never mutate ownership in place.
- `GG13-CONT-012` Hostile-test scope, visibility, owner and entitlement constraints.

## F. Asset catalogue and editor interaction

- `GG13-ASSET-001` Add `AssetCategory` stable codes and editor modes.
- `GG13-ASSET-002` Add immutable-checksum `AssetRecord` with ownership and lifecycle.
- `GG13-ASSET-003` Register the admitted production asset estate with dimensions/media metadata.
- `GG13-ASSET-004` Store browser-safe thumbnail/runtime paths; reject external arbitrary URLs.
- `GG13-ASSET-005` Resolve asset availability from core plus permitted tenant scope/entitlements.
- `GG13-ASSET-006` Add paginated/searchable category API.
- `GG13-ASSET-007` Make each palette control open an image thumbnail chooser.
- `GG13-ASSET-008` Support keyboard selection and pointer/touch drag/drop.
- `GG13-ASSET-009` Persist stable `asset_id`, object type, transform, layer and typed properties.
- `GG13-ASSET-010` Render actual player/enemy/bunker/shield/pickup/Boarding imagery on canvas.
- `GG13-ASSET-011` Add inspector validation, accessible labels, focus and error handling.
- `GG13-ASSET-012` Make preview load exact draft through Phaser and the same validators.
- `GG13-ASSET-013` Prove missing/retired/unauthorised assets block validation/publish.

## G. Official database configuration and Levels 1–6

- `GG13-LVL-001` Make admin catalogue retrieval authenticated and recoverable.
- `GG13-LVL-002` Add admin list/detail/version endpoints with correct pagination.
- `GG13-LVL-003` Require `GameProject` ownership on every Level.
- `GG13-LVL-004` Require exact version/checksum/schema on every runtime load.
- `GG13-LVL-005` Preserve immutable published versions and audited lifecycle actions.
- `GG13-LVL-006` Author six materially distinct official published configs.
- `GG13-LVL-007` Give each level distinct formations/topology/objectives/hazards/drops/visual selection.
- `GG13-LVL-008` Keep Level 1 accepted 58-enemy/256-shield denominator.
- `GG13-LVL-009` Keep the governed Level 4 Boarding anchor only where eligible.
- `GG13-LVL-010` Generate matching packaged fallback files/checksums for all six levels.
- `GG13-LVL-011` Load every campaign level through `LevelLoader`; remove repeated shallow clones.
- `GG13-LVL-012` Reject duplicate official campaign sequence and checksum mismatch.
- `GG13-LVL-013` Prove Levels 1–6 differ materially and play in order.

## H. Campaign aggregate and continuity

- `GG13-CAMP-001` Add `CampaignRun` model and exact statuses.
- `GG13-CAMP-002` Pin each campaign to one `GameRelease`.
- `GG13-CAMP-003` Add anonymous capability hash and authenticated owner semantics.
- `GG13-CAMP-004` Attach each `GameRun` to one campaign and sequence/attempt.
- `GG13-CAMP-005` Add per-level entry snapshot, accepted score delta and exit snapshot.
- `GG13-CAMP-006` Start campaign endpoint returns Level 1 authority and anonymous claim capability when applicable.
- `GG13-CAMP-007` Continue endpoint atomically admits only the expected next sequence.
- `GG13-CAMP-008` Carry cumulative score, remaining lives and capped nukes.
- `GG13-CAMP-009` Preserve deterministic seed lineage and exact level checksums.
- `GG13-CAMP-010` Replay current level from its entry snapshot without duplicate reward.
- `GG13-CAMP-011` Resume non-terminal campaign after menu/reload when online.
- `GG13-CAMP-012` Reset only through explicit New Campaign.
- `GG13-CAMP-013` Row-lock campaign completion and enforce idempotency.
- `GG13-CAMP-014` Return level score, cumulative score and next action distinctly in UI/API.
- `GG13-CAMP-015` Complete final level into one terminal campaign result.
- `GG13-CAMP-016` Hostile-test sequence skipping, double Continue, stale version and reward replay.

## I. Anonymous play, account creation and validated score claim

- `GG13-CLAIM-001` Allow anonymous server-validated campaign start/complete.
- `GG13-CLAIM-002` Mark anonymous/offline results explicitly unranked.
- `GG13-CLAIM-003` Offer Save Your Score registration/login at eligible result.
- `GG13-CLAIM-004` Return claim capability once and store only its hash.
- `GG13-CLAIM-005` Claim only unowned, eligible, fully validated campaign.
- `GG13-CLAIM-006` Assign owner and publish leaderboard entry atomically.
- `GG13-CLAIM-007` Reject expired, reused, wrong-session, wrong-campaign and forged claims.
- `GG13-CLAIM-008` Authenticated campaigns bind owner at start and rank automatically after validation.
- `GG13-CLAIM-009` Migrate leaderboard authority to completed campaign while preserving legacy evidence.
- `GG13-CLAIM-010` Provide public top ten, paginated leaderboard and personal best.
- `GG13-CLAIM-011` Preserve moderation and audited suppress/restore.
- `GG13-CLAIM-012` Never expose email, token, capability or internal validation trace publicly.

## J. Administration pages

- `GG13-ADM-001` Add protected portal navigation: Campaign, Businesses, Users, Scores, Logs.
- `GG13-ADM-002` Campaign page lists projects, Levels/Interiors, versions and lifecycle.
- `GG13-ADM-003` Businesses page manages organisation status and entitlements under owner permission.
- `GG13-ADM-004` Users page searches users/memberships and changes permitted roles/status.
- `GG13-ADM-005` Scores page shows top ten, validated/rejected runs and moderation.
- `GG13-ADM-006` Logs page shows bounded, filterable platform/runtime audit events.
- `GG13-ADM-007` Business portal shows only its own games, members, assets and entitlement state.
- `GG13-ADM-008` Player account shows profile, campaign history and published scores.
- `GG13-ADM-009` Use loading, empty, unauthorised, unavailable and retry states deliberately.
- `GG13-ADM-010` Remove development-only wording and raw exception leakage.

## K. Boarding completion and server authority

- `GG13-BRD-001` Disable eligible source ship and award governed Shooter event at transition point.
- `GG13-BRD-002` Display eight-second Boarding offer without pausing Shooter prematurely.
- `GG13-BRD-003` Require player entry envelope plus explicit interact.
- `GG13-BRD-004` Serialize complete Shooter/campaign snapshot and digest.
- `GG13-BRD-005` Start authorised BoardingRun before scene admission.
- `GG13-BRD-006` Load exact DB/published or matching packaged InteriorVersion.
- `GG13-BRD-007` Implement movement/jump/collision through `InputSystem`.
- `GG13-BRD-008` Implement player/alien projectiles, hit, life, respawn and invulnerability.
- `GG13-BRD-009` Implement deterministic enemy movement/fire and entity identities.
- `GG13-BRD-010` Implement containers and once-only server-derived LIFE/NUKE pickups.
- `GG13-BRD-011` Implement exit interaction, success, timeout, death and abort.
- `GG13-BRD-012` Use production backgrounds, characters, tiles, props, doors, HUD and effects.
- `GG13-BRD-013` Process contact sheets deterministically into transparent frames where required; preserve sources/provenance.
- `GG13-BRD-014` Capture bounded input/event trace with sequence and fixed timestep.
- `GG13-BRD-015` Server replay exact seed/interior and derive outcome/resources/counters.
- `GG13-BRD-016` Reject impossible trace, counters, timing, state digest and duplicate completion.
- `GG13-BRD-017` Persist immutable rejected submission/audit evidence.
- `GG13-BRD-018` Apply valid return once to exact Shooter snapshot and campaign resources.
- `GG13-BRD-019` Timeout loses one life; last life reaches Game Over.
- `GG13-BRD-020` Keep Boarding-specific score delta zero.
- `GG13-BRD-021` Prove keyboard, touch, Xbox/common and Haute input paths.

## L. Contract and migration reconciliation

- `GG13-CON-001` Implement pack model constraints through migrations.
- `GG13-CON-002` Reconcile repository OpenAPI with implemented serializers/views.
- `GG13-CON-003` Reconcile web/game TypeScript clients with OpenAPI names and fields.
- `GG13-CON-004` Add JSON Schema validation for H015 domain transports.
- `GG13-CON-005` Use one error envelope and catalogue.
- `GG13-CON-006` Reject unknown fields on security/lifecycle mutations.
- `GG13-CON-007` Provide forward data migration for official project, Levels 1–6 and existing profiles/runs.
- `GG13-CON-008` Provide migration/backout analysis without destructive data loss.
- `GG13-CON-009` Ensure `makemigrations --check` and schema generation are clean.

## M. Validation and evidence

- `GG13-VAL-001` Run backend unit/integration tests.
- `GG13-VAL-002` Run web/game lint, typecheck, unit and build.
- `GG13-VAL-003` Run contract/schema/OpenAPI validation.
- `GG13-VAL-004` Run auth/session/CSRF/throttle hostile suite.
- `GG13-VAL-005` Run tenant isolation/IDOR/entitlement hostile suite.
- `GG13-VAL-006` Run campaign continuity and score-claim hostile suite.
- `GG13-VAL-007` Run substantive Boarding API replay and runtime suite.
- `GG13-VAL-008` Run Docker build/up/health/API/static-asset smoke.
- `GG13-VAL-009` Browser-test login, portals, editor and six-level campaign.
- `GG13-VAL-010` Browser-test anonymous result → register/login → valid claim → leaderboard.
- `GG13-VAL-011` Browser-test Boarding entry, success, timeout, death and Shooter restore.
- `GG13-VAL-012` Verify no console error, failed fetch, missing image or privileged-shell flash.
- `GG13-VAL-013` Capture screenshots/video/state JSON/logs at exact SHA.
- `GG13-VAL-014` Run GitHub Actions at final pushed SHA and reconcile every job.

## N. Documentation, return and Founder gate

- `GG13-RET-001` Update Player, Admin, Business/Editor, Developer and Regression guides.
- `GG13-RET-002` Update API docs, environment routing and safe credential bootstrap guide.
- `GG13-RET-003` Update applicable asset, evidence, currentness, project and governance-debt registers.
- `GG13-RET-004` Record all files changed/removed and migrations.
- `GG13-RET-005` Commit and push only to authorised feature branch.
- `GG13-RET-006` Open/reuse one draft PR to `dev`; do not merge.
- `GG13-RET-007` Reconcile local/remote SHA and clean worktree.
- `GG13-RET-008` Produce sealed non-self-referential Handoff-Out and SHA-256.
- `GG13-RET-009` Return truthful PASS/CONDITIONAL PASS/FAIL with blockers/debt.
- `GG13-RET-010` Founder performs manual acceptance and merge decision.

## Exit

H015 cannot close on file-presence tests or schematic screenshots. Every mandatory outcome in Roadmap v1.3 and the acceptance matrix must be exercised through real browser/API/runtime paths.
