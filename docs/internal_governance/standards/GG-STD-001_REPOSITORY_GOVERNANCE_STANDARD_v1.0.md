# GG-STD-001 - REPOSITORY GOVERNANCE STANDARD v1.0

## Authority

Founder Michael Leese -> Inceptivec Gamification -> Galactic Gunners.

## Repository

`Inceptivec-io/GalacticGunners`

## Branch rule

Normal development:

```text
CURRENT AUTHORISED FEATURE BRANCH
-> dev
-> stage
-> prod
```

`prod` is the production/release authority and repository default after the governed Step 6 cutover.

No direct work on `prod` without explicit Founder authority. `main` is retired only after fail-closed proof confirms its history is contained in `prod`, no open PR depends on it, no active CI/deployment/documentation authority references it, the default branch is already `prod`, and `prod` health passes.

## Required root control

`AGENTS.md` is the repo-local execution contract and must be tracked.

## Required project governance

`docs/internal_governance/` is mandatory and must remain navigable/current.

## Change rule

Enhance / append / refine legitimate work. Do not silently fork, replace or fragment governance.

## Clean return

A handoff cannot PASS while:
- worktree dirty;
- authorised work untracked/uncommitted/unpushed;
- local feature HEAD differs from remote feature HEAD;
- POST_BOX contains consumed payload;
- required registers/evidence stale;
- untracked operational material exists.

Founder retains acceptance/merge authority.
