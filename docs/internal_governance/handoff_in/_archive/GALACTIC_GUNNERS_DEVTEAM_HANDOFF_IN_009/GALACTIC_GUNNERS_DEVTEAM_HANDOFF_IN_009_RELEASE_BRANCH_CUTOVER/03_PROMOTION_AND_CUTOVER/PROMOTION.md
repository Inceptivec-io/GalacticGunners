# PROMOTION AND CUTOVER

## Phase A — pre-mutation proof

For:

- `feature/production-architecture-foundation`
- `feature/release-branch-establishment`
- `dev`
- `stage`
- `main`
- `prod` if it unexpectedly exists

record:

- SHA;
- merge base;
- left/right unique commit count;
- ancestry;
- open PR dependencies;
- branch protection/ruleset state;
- default branch.

No destructive operation before this record exists.

## Phase B — reconcile branch-model implementation

On:

`feature/release-branch-establishment`

refine existing CI, README, AGENTS, standards, guides, registers and currentness so active branch authority is:

```text
feature/* -> dev -> stage -> prod
```

Remove active/release assumptions that `main` remains permanent.

Do not fork branch standards.

## Phase C — promote accepted state to dev

Promote the accepted foundation + Step 6 branch-model reconciliation to `dev`.

Required:

```text
accepted foundation contained in dev = PASS
Step 6 branch-model state contained in dev = PASS
```

No force push.

No history rewrite.

## Phase D — promote dev to stage

Promote the exact accepted `dev` state to `stage`.

Required:

```text
dev ⊆ stage
stage unique application commits = 0
```

## Phase E — establish/promote prod

If `prod` does not exist:

create it only from the accepted `stage` lineage.

Then ensure:

```text
stage ⊆ prod
prod unique application commits outside promotion lineage = 0
```

## Phase F — default branch cutover

Set repository default branch:

```text
main -> prod
```

Verify GitHub reports:

```text
default_branch = prod
```

before deleting `main`.

## Phase G — delete main

Only after every main-retirement gate passes, delete remote `main`.

Do not delete the historical commits.

The old `main` tip remains recoverable by SHA:

`87923524833b737c7e3bf1764dde0b6ebf495e62`

Record this coordinate in the branch-transition evidence.

## No force operations

Forbidden:

- force push;
- force-with-lease;
- shared-branch hard reset;
- history rewrite;
- rebase of governed evidence merely to simplify topology.

If GitHub branch protection prevents a required action, report the exact blocker rather than bypassing it.
