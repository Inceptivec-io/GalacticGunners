# Execution charter

## Sprint outcome

Deliver a production-integrated Boarding Mode for one deterministic Level 4 ship. The player can disable the designated ship, accept an eight-second boarding offer, transition without losing shooter state, complete or fail a sixty-second side-view interior, and return with validated life/nuke deltas or reach game over.

## In scope

- Canonical admission and runtime sync of the supplied production imagery.
- Production normalization of the admitted player and alien platform concept sheets already in the repository.
- Versioned interior and boarding contracts.
- Django `boarding` app, migrations, serializers, services, endpoints, permissions, validation, and tests.
- Shared game-core state machine, deterministic simulation, pause/resume boundary, and offline invalidation.
- Phaser scene, physics/collisions, HUD, keyboard, gamepad, and touch input.
- Level 4 anchor/configuration and published checksum updates.
- Docker, CI, hostile tests, accessibility checks, and browser evidence.
- Governance/register/evidence updates.

## Explicitly out of scope

- Boarding in Levels 1–3, 5, or 6.
- More than one boarding attempt per Level 4 run.
- RPG health, inventory, crafting, shops, dialogue, stealth, ladders, elevators, bosses, or procedural maps.
- Boarding points, multiplier changes, bonus-score pickups, or leaderboard rule changes.
- New art, generative replacements, third-party assets, new music, or new audio.
- Replacing Phaser with React/DOM gameplay.
- Rewriting existing shooter architecture.
- Merging PRs or changing protected-branch policy.

## Source priority

1. Founder instruction recorded for this sprint.
2. This sealed H014 handoff.
3. Accepted repository governance and contracts at `ENTRY_SHA`.
4. Existing implementation where it does not conflict with 1–3.

Ambiguity is not permission. Stop and ask.

## Definition of done

Done means the complete online and offline flows work, server validation rejects hostile payloads, shooter state resumes exactly, all assets are admitted and traceable, all required suites are green locally and in GitHub Actions, the draft PR targets `dev`, the worktree is clean, and the return is sealed.
