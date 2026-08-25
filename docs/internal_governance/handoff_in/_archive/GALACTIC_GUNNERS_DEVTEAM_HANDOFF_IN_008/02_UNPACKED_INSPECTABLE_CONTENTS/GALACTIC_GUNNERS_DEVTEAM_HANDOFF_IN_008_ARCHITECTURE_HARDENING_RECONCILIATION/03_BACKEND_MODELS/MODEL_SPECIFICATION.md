# BACKEND DOMAIN MODEL SPECIFICATION

Enhance the existing Django models. Do not create competing domain models.

All database changes require committed migrations.

Use `settings.AUTH_USER_MODEL` for user relations.

## `accounts.User`

Existing authority:

`backend/accounts/models.py`

Required hardened model:

```text
User
----
id                  UUID primary key
username            inherited AbstractUser, unique
email               inherited AbstractUser
is_active           inherited
is_staff            inherited
is_superuser        inherited
date_joined         inherited
last_login          inherited
```

### Rules

- Django User is authoritative identity.
- Use UUID primary key now, before production data exists.
- Do not introduce Supabase Auth identity.
- Do not create a second user table.
- No social login implementation in this sprint.
- Do not expose sensitive auth fields through game-run APIs.

## `players.PlayerProfile`

Existing authority:

`backend/players/models.py`

Required:

```text
PlayerProfile
-------------
id                  UUID primary key
user                OneToOne -> User, CASCADE, related_name=player_profile
display_name        varchar(64), unique, indexed as appropriate
created_at          datetime
updated_at          datetime
```

Rules:
- display name is public-facing identity.
- normalize/validate whitespace.
- define an explicit maximum and test it.
- no rank/XP/economy fields in this sprint.

## `game_runs.GameVersion`

Existing authority:

`backend/game_runs/models.py`

Required:

```text
GameVersion
-----------
id                  UUID primary key
version             varchar(32), unique
build_hash          varchar(64), blank allowed
is_active           boolean, default true
released_at         datetime nullable
created_at          datetime
```

Rules:
- semantic/version label is immutable after referenced production use unless explicit migration authority exists.
- build hash is metadata, not executable trust proof.

## `game_runs.GameRun`

Existing authority:

`backend/game_runs/models.py`

Required:

```text
GameRun
-------
id                  UUID primary key
player              FK User nullable, SET_NULL, related_name=game_runs
game_version        FK GameVersion, PROTECT, related_name=game_runs
client_type         constrained semantic string/choice
started_at          datetime auto
completed_at        datetime nullable
score               non-negative integer default 0
level_reached       constrained semantic string/choice or varchar with validation
lives_used          non-negative integer default 0
nukes_used          non-negative integer default 0
victory             boolean default false
validity            pending | valid | rejected
validation_result   JSON object default {}
created/source metadata only if genuinely required
```

Recommended client types for this foundation:

```text
web
windows
macos
android
ios
unknown
```

Do NOT add console types merely as release claims; future clients may be added compatibly.

### Lifecycle invariants

```text
START:
completed_at = null
validity = pending

COMPLETE:
completed_at != null

PUBLISHABLE:
completed_at != null
validity = valid
score >= 0
```

A client cannot directly declare its run `valid`.

Completion/validation is backend-owned.

## `game_runs.ScoreSubmission`

Existing authority:

`backend/game_runs/models.py`

Required:

```text
ScoreSubmission
---------------
id                  UUID primary key
run                 OneToOne -> GameRun, CASCADE, related_name=score_submission
claimed_score       non-negative integer
event_summary       JSON object
payload_hash        sha256/64-char string where implemented
idempotency_key     bounded string, nullable/blank until client support exists
submitted_at        datetime
```

Rules:
- at most one canonical score submission per run.
- duplicate completion request must not create duplicate submissions.
- payload/event detail remains bounded; do not create an unbounded telemetry lake in this sprint.
- do not trust claimed score simply because schema validates.

## `leaderboard.LeaderboardEntry`

Existing authority:

`backend/leaderboard/models.py`

Required:

```text
LeaderboardEntry
----------------
id                  UUID primary key
run                 OneToOne -> GameRun, CASCADE, related_name=leaderboard_entry
score               non-negative integer, indexed
display_name        snapshot or deterministic read from player profile
published_at        datetime
```

Preferred model:
- preserve score as publication snapshot;
- if display_name snapshot is introduced, document why and how later profile changes behave.

### Publication invariant

Only valid completed runs are publishable.

```text
run.validity == valid
run.completed_at != null
entry.score == run.score
```

Leaderboard ranking is computed/read ordering, not a permanently stored rank integer.

## Constraints / indexes

Add database-level constraints where practical for:
- non-negative numerical fields;
- unique one-to-one relationships;
- expected unique identifiers;
- ordering/query indexes for leaderboard score + publication time;
- idempotency key if it is globally or per-run unique.

Do not use application checks where a durable database constraint is appropriate.
