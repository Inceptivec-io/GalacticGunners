# GALACTIC GUNNERS DEVTEAM HANDOFF IN 010

## v1.0 BUILD — SPRINT 001
### Boot → Main Menu → Level 1 Playable Vertical Slice

Repository: `Inceptivec-io/GalacticGunners`

Base: `dev`

Verified base SHA:
`051c7fc9170ae73344a0dc88214c48fc94e0bfdc`

Execution branch:
`feature/v1-level1-vertical-slice`

Expected entry SHA:
`051c7fc9170ae73344a0dc88214c48fc94e0bfdc`

## Authority

Read first:

- `AGENTS.md`
- `docs/internal_governance/planning/GALACTIC_GUNNERS_MASTER_ROADMAP_v1.1.md`
- `docs/internal_governance/planning/GALACTIC_GUNNERS_MASTER_PLAYLIST_v1.1.md`
- `assets/README.md`
- `assets/OWNERSHIP_PROVENANCE_AND_IP_BASELINE.md`
- `assets/registers/GG_ASSET_REGISTER.csv`
- `assets/registers/GG_ASSET_PROVENANCE_REGISTER.csv`
- `Legacy_Game/README.md`

Roadmap doctrine:

`EXTRACT → TYPE → TEST → PRESERVE BEHAVIOUR`

## Sprint outcome

Founder must be able to run:

`docker compose up --build`

then:

```text
HOME
→ PLAY
→ PHASER MAIN MENU
→ START
→ PLAYABLE LEVEL 1 COMBAT SLICE
```

Required user-visible behaviour:

- canonical Galactic Gunners visual identity;
- real Phaser GameHost mounted inside existing Next.js application;
- BootScene;
- MainMenuScene;
- bounded Level1Scene combat slice;
- player visible;
- horizontal movement;
- player laser;
- scout enemy wave;
- enemy damage path sufficient to prove lives;
- collisions;
- score;
- HUD;
- temporary slice-complete state;
- temporary slice-failed state;
- replay/retry;
- return to Main Menu.

This is NOT full Level 1 completion.

Do not implement:
- Level 2;
- Boss;
- final Game Over;
- final Victory;
- Boarding;
- auth UI;
- leaderboard UI;
- native packaging;
- production deployment;
- v1.0 release/tag.

## Legacy boundary

`Legacy_Game/` is READ-ONLY behavioural evidence.

Allowed:
- inspect accepted movement values;
- inspect input behaviour;
- inspect Level 1 first-wave behaviour;
- inspect life/damage semantics;
- inspect firing cadence;
- inspect scene transitions;
- inspect responsive/layout behaviour.

Forbidden:
- import runtime code from `Legacy_Game`;
- execute legacy JS in new runtime;
- import runtime assets from `Legacy_Game`;
- mutate `Legacy_Game`;
- copy legacy globals wholesale.

Before permanent implementation, create an evidence matrix:

```text
legacy source path
behaviour observed
new TypeScript authority
test protecting behaviour
deferred behaviour
```

Unknown behaviour must not be silently invented.
