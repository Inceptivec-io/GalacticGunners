# WORK POST BOX Boundary

Boundary ID: _WORK_00000001_POST_BOX
Identity class: WORK
Handoff ID: GALACTIC_GUNNERS_GG_COM_001_HANDOFF_IN_001
Worker identity: CODEX_DEVELOPMENT_AGENT_GG_COM_001_WORKER_001
Permitted repository: C:\Users\Michael\dev\GalacticGunners
Permitted branch: feature/GG-COM-001
Entry HEAD: 87923524833b737c7e3bf1764dde0b6ebf495e62
Mutation mode: bounded repository execution for GG-COM-001 only.

## Direction

- handoff_in/: receives and preserves inbound commissions and authorized working copies.
- handoff_out/: contains the governed return package after work completion.
- evidence/: contains durable execution evidence for this work box.

## Stop/fail-closed conditions

Stop with AUTHORITY_BOUNDARY_CONFLICT if repository path, remote, branch, entry HEAD, received authority or boundary identity cannot be reconciled exactly from the handoff. Do not infer missing authority.

Prohibited: merge to main, self-acceptance, historical repository mutation, CLOM mutation, broad modernization, platform packaging, leaderboard/accounts/Supabase work, console work, new commercial asset creation, or execution of IP_FREEDOM_LICENSE_PROTECTION_ASSET_CREATION.
