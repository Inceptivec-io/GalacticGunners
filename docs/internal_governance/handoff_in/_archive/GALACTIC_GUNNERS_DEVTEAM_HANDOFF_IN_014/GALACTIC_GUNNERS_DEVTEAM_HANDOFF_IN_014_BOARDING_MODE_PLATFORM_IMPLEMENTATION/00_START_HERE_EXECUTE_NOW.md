# GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_014

## Boarding Mode platform implementation

This is a bounded construction sprint. Implement the complete Level 4 Boarding Mode vertical slice defined in this pack. Do not infer missing mechanics, assets, routes, fields, defaults, or acceptance criteria. If two instructions appear to conflict, stop and return the exact conflict to the Founder.

## Entry gate — fail closed

Do not change code until all statements below are true:

1. Founder acceptance of Handoff OUT 013 is recorded by the merge of PR #10.
2. PR #10 is merged into `dev` at merge commit `59a2209fc51ae157b40cbcafb420a0316280cf9e`.
3. PR #9 programme authority is merged after PR #10 at merge commit `989d56a511f1de1af72b66144eb5c93fc2a80921`.
4. `git fetch origin --prune` has completed and `origin/dev` is the base.
5. `origin/dev` resolves exactly to `989d56a511f1de1af72b66144eb5c93fc2a80921`. Both `git merge-base --is-ancestor 93f178098d50c4738921e9a67469a480224e8139 origin/dev` and `git merge-base --is-ancestor 0c53d0ba1b0d8170da864ca26abf9cf1697a2380 origin/dev` must exit zero. Otherwise stop with `H014_ENTRY_SHA_OR_ANCESTRY_MISMATCH`.
6. The imagery transport object named `GalacticGunners_Imagery_Pack_v1.0_PRODUCTION.zip` exists in POST_BOX and hashes to `71a9fdde58bf84f3a01618cdc3cb72211cfe4f5cff4d5154f7455de94ec14930`. Otherwise stop with `IMAGERY_PACK_MISSING_OR_HASH_MISMATCH`.
7. The starting worktree is clean.

Record `ENTRY_SHA=989d56a511f1de1af72b66144eb5c93fc2a80921`. Create exactly one branch from it:

`feature/v1-boarding-mode`

Open one draft PR targeting `dev`. Never merge it. Founder acceptance and merge remain outside this sprint.

## Execution order

1. Read every file in this handoff before editing.
2. Receive, hash, scan, inventory, and admit the imagery pack per `02_INPUT_RECEIVING_AND_ASSET_ADMISSION.md`.
3. Add the shared contracts and fixtures before consumers.
4. Implement the Django authority and migrations.
5. Implement the deterministic game-core state machine and Phaser Boarding scene.
6. Wire browser clients to the API without moving authority into the browser.
7. Run all tests, hostile suites, Docker smoke, and visual evidence capture.
8. Update governance registers and produce one sealed Handoff OUT 014.

## Non-negotiable boundaries

- Phaser owns moment-to-moment play. React remains the shell.
- Django owns run lifecycle, validation, durable state, and leaderboard eligibility.
- The browser is untrusted.
- Boarding adds zero score in v1. The standard disabled scout kill remains the only score event associated with entry.
- Do not commit the transport ZIP. Commit only admitted, inspectable assets and their evidence/register updates.
- Do not invent art, audio, animation frames, APIs, or gameplay.
- Do not rewrite the shooter. Integrate through an explicit coordinator and preserve its state.
- Never self-merge.

## Required return

Return exactly the evidence and machine block specified in `10_GOVERNANCE_EVIDENCE_AND_RETURN.md`. A partial vertical slice, mocked backend, skipped hostile suite, red CI, unclean tree, or missing browser evidence is `CLOSURE=FAIL`.
