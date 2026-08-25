# TARGET ARCHITECTURE

Required architecture after this sprint:

```text
Browser / future native shell
        |
        v
Next.js product client
        |
        +----------------------+
        |                      |
        v                      v
Phaser TypeScript core    /api/v1
                               |
                               v
                         Django + DRF
                               |
                 +-------------+-------------+
                 |             |             |
                 v             v             v
              Accounts      Game Runs    Leaderboard
                 |             |             |
                 +-------------+-------------+
                               |
                               v
                          PostgreSQL
```

## Authority boundaries

### Next.js

Owns:
- product/application shell;
- web routing;
- web UI composition;
- browser session/client integration;
- game mounting surface;
- API client boundary.

Does NOT own:
- authoritative user identity;
- authoritative scores;
- authoritative leaderboard state;
- game simulation logic.

### Phaser TypeScript core

Owns:
- gameplay runtime foundation;
- scenes/entities/systems/input/audio/service abstractions;
- deterministic game-facing event structures;
- client-side GameRun integration hooks.

Does NOT own:
- identity database;
- leaderboard persistence;
- authoritative score acceptance.

### Django + DRF

Owns:
- identity;
- player profile;
- game-version registry;
- game-run lifecycle;
- score submission;
- validation state;
- leaderboard publication/read model;
- API authority.

### PostgreSQL

Authoritative persistence.

Supabase may later supply managed PostgreSQL infrastructure, but Supabase Auth is NOT identity authority.

### Contracts

`packages/contracts/` is cross-layer interface authority.

Backend implementation, TypeScript consumer types and tests must reconcile to it.
