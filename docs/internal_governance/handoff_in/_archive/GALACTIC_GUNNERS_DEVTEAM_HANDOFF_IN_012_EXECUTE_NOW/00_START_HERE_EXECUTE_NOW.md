# GALACTIC GUNNERS — H012 EXECUTE NOW

This is the single POST_BOX execution package for Handoff 012.

## Use

Repository:
`Inceptivec-io/GalacticGunners`

Working branch:
`feature/v1-config-driven-campaign-platform`

Current authorities already in repository:
- Roadmap v1.2
- Playlist v1.2
- `docs/guides/`

## Immediate start

Do not wait for another pack, hash, registration message, merge message, or local SHA instruction.

Run:

```text
git fetch origin
git switch feature/v1-config-driven-campaign-platform
git status --short
```

If the worktree is clean, synchronize:

```text
git merge --ff-only origin/feature/v1-config-driven-campaign-platform
```

Record the resulting local HEAD as:

`H012_ENTRY_SHA`

Then start Gate A immediately.

### Routine synchronization is NOT a STOP

Do not stop because:
- local is behind remote;
- this ZIP was not previously registered;
- this ZIP has no prior hash record;
- supporting POST_BOX files were not previously known;
- consumed transport requires ordinary cleanup.

Hash/inventory may be recorded internally after receipt, but neither is a prerequisite to execution.

### Real STOP conditions only

STOP only for:
- unexplained dirty worktree;
- non-fast-forward branch divergence;
- conflicting current authorities;
- destructive/data-loss uncertainty;
- failed required tests/CI/security controls;
- an implementation/specification contradiction that cannot be resolved from this package and current repository guides.

## Existing POST_BOX packs

The older H012 and Hotfix/re-entry ZIPs are superseded as execution inputs by this package.

They may be archived/cleared as historical transport records.

Do not execute their routing messages.

## Environment files

`LOCAL_ENVIRONMENT_FILES/env.feature`
`LOCAL_ENVIRONMENT_FILES/env.dev`
`LOCAL_ENVIRONMENT_FILES/env.stage`

These are LOCAL SECRET FILES.

Copy them to repository root as:
- `env.feature`
- `env.dev`
- `env.stage`

They are ignored by git.

DO NOT:
- commit them;
- add them to governance archives;
- print their passwords in evidence;
- upload their contents to GitHub.

They contain:
- environment name;
- app URL;
- API URL;
- home/play/admin/API routes;
- health URLs;
- unique admin username/password.

`env.prod` is created only when production is commissioned.

## Execution sequence

Execute this package continuously:

1. Gate A — content/backend authority.
2. Gate B — generic config-driven runtime + exact Level 1 parity.
3. Gate C — hidden admin designer.
4. Gate D — bonus/drop/generator + six campaign levels.
5. Gate E — regression/hostile/Docker/CI/governance closure.

Commit and push at each gate and continue.

Do not stop between gates for routine repository housekeeping.

## Final return

Return:

`GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_012`

Open one DRAFT PR:

`feature/v1-config-driven-campaign-platform` → `dev`

Do not merge.
