# H013 HOSTILE TEST / CI MATRIX

## A. Score arithmetic

Test exact scoring:
- scout;
- ship;
- asteroid;
- mothership hit;
- mothership kill;
- comet;
- shield enemy hit;
- combined run;
- floor at zero if global ScoreSystem enforces non-negative score.

## B. Content denominator

Reject:
- wrong level ID;
- wrong level version;
- wrong checksum;
- unsupported game version;
- unpublished level where not eligible;
- malformed seed.

## C. Impossible counts

Reject:
- scout kills > possible scouts;
- mothership kills > configured motherships;
- nuke uses impossible from start/rearm/pickups;
- pickups > possible drops;
- campaign level skip;
- impossible terminal state.

## D. Duplicate abuse

- same GameRun submit twice;
- mutated second summary;
- concurrent duplicate submission;
- replay old accepted request.

Only one accepted submission.

## E. Duration

- zero duration;
- negative;
- absurdly low;
- excessive malformed values.

Conservative legitimate fast-play threshold.

## F. Rate limiting

- run creation burst;
- completion burst;
- display-name change burst;
- admin endpoint unauthorized burst.

## G. Leaderboard ranking

Fixtures prove exact deterministic ordering:

```text
score DESC
level DESC
accepted_at ASC
UUID ASC
```

Also:
- one best public entry per player;
- suppressed entry excluded;
- suppressed player excluded;
- restored entry returns correctly;
- pagination stable.

## H. Privacy

Assert public API never exposes:
- email;
- password/auth data;
- IP;
- validation internals;
- moderation notes.

## I. Display-name hostile

Reject:
- empty;
- too long;
- markup;
- script tags;
- control chars;
- reserved names;
- invalid Unicode if conservative policy used.

Escape output.

## J. Admin RBAC

- anonymous denied;
- normal player denied;
- authorized moderator allowed;
- audit event created.

## K. Backend unavailable

Game remains playable.

Leaderboard surface:
- graceful degraded state;
- no game crash;
- queued/retry behavior only if explicitly implemented.

## L. CI jobs

Required explicit job families or clearly isolated steps:

```text
backend
client-and-game
docker-smoke
runtime-hostile
score-validation-hostile
leaderboard-hostile
moderation-hostile
```

Every failure must identify the failed suite.

## M. Docker

Full stack:
- database;
- backend;
- web/game.

Required:
- migrate empty database;
- seed/configure test level data;
- health;
- run start/complete;
- validated score;
- leaderboard query;
- admin RBAC.
