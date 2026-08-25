# GG-STD-001 — REPOSITORY GOVERNANCE STANDARD v1.0

## Authority

Founder Michael Leese → Inceptivec Gamification → Galactic Gunners.

## Repository

`Inceptivec-io/GalacticGunners`

## Branch rule

Normal development:

```text
CURRENT AUTHORISED FEATURE BRANCH
→ Founder review
→ Founder merge decision
→ main
```

No direct work on `main` without explicit Founder authority.

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
