# TEST MATRIX / FOUNDER ACCEPTANCE

## Technical tests

### Planning/currentness
- current Roadmap admitted;
- current Playlist admitted;
- predecessor Roadmaps/Playlists archived;
- no currentness ambiguity.

### Title
- logo hierarchy;
- Start;
- Info;
- sound toggle;
- keyboard selection;
- touch;
- controller;
- selector animation.

### Info
- typography;
- story readability;
- back action;
- controls layout.

### Gameplay
- Level 1;
- Level 2;
- Boss;
- player animation;
- scout animation;
- cruiser animation;
- destroyer animation;
- mothership animation/flash;
- asteroid animation;
- comet animation;
- lasers;
- explosions;
- nuke projectile;
- nuke burst;
- shield construction;
- individual shield destruction;
- HUD layout;
- no overlaps.

### Scoring
Test each locked score event independently.

Must prove:
- +5 laser target;
- +10 asteroid;
- +25 scout;
- +50 ship;
- +50 mothership hit;
- +1000 mothership destroyed;
- +500 comet;
- +1 nuke comet;
- -1 enemy shield hit;
- no player damage score penalty;
- no duplicate awards.

### Game Over
- correct composition;
- final score live;
- buttons live;
- no nested panel;
- restart/menu work.

### Victory
- correct composition;
- live values;
- buttons live;
- Next/Replay/Menu as applicable;
- selection state.

### Runtime
- no required asset 404;
- no new console exceptions;
- no broken sprite frames;
- no frame jitter;
- no destructive visual scaling.

## Docker Founder review

Update/rebuild Docker runtime as necessary.

Founder must be able to run:

```powershell
cd C:\Users\Michael\dev\GalacticGunners
docker compose up --build
```

and inspect the result locally.

Founder visual/gameplay acceptance remains:

```text
PENDING
```

until explicitly given.

Automated PASS is not Founder acceptance.
