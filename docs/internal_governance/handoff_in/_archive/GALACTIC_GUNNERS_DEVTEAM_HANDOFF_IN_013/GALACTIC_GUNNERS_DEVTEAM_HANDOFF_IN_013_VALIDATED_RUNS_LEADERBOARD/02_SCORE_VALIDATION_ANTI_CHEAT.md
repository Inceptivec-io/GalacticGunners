# SCORE VALIDATION & ANTI-CHEAT CONTRACT

## 1. Trust boundary

```text
BROWSER / CLIENT = UNTRUSTED
BACKEND = SCORE AUTHORITY
```

Client may report events.
Client may not declare an authoritative leaderboard score.

## 2. Exact content denominator

Every submitted run must bind:

```text
game_version
level_id
level_version
level_checksum
seed
```

Server must resolve the exact governed level definition played.

Reject if:
- unknown game version;
- unknown level;
- version mismatch;
- checksum mismatch;
- unsupported schema;
- malformed seed;
- unpublished/unauthorized content where leaderboard eligibility requires published content.

## 3. Locked core score arithmetic

Global scoring authority:

```text
LASER TARGET              +5
ASTEROID                  +10
SCOUT                     +25
SHIP                      +50
MOTHERSHIP HIT            +50
MOTHERSHIP DESTROYED      +1000
COMET                     +500
COMET BONUS               +1 NUKE
ALIEN HIT ON SHIELD TILE  -1
```

No player-damage score penalty.

Expected score formula must be generated from governed scoring constants and validated event counts.

Minimum semantic formula:

```text
expected =
laser_targets * 5
+ asteroids * 10
+ scouts * 25
+ ships * 50
+ mothership_hits * 50
+ mothership_kills * 1000
+ comets * 500
- enemy_shield_tile_hits
```

Never duplicate score constants in multiple ungoverned locations.

## 4. Validation layers

### A. Structural
- run exists;
- run not already accepted;
- payload schema valid;
- event count fields bounded/non-negative;
- timestamps sane.

### B. Identity/version
- game version valid;
- level identity valid;
- version valid;
- checksum valid;
- seed valid.

### C. Arithmetic
- submitted score == server reconstructed score.

### D. Event plausibility
Validate against exact LevelDefinition:
- kill count cannot exceed spawned/possible population;
- mothership kill count cannot exceed configured bosses;
- mothership hits within governed plausible range;
- nuke uses cannot exceed start + collected/rearmed policy;
- life pickups cannot exceed drop events;
- shield hits cannot exceed initial + valid regenerated shield capacity if regeneration ever exists;
- completed levels must follow valid campaign sequence.

### E. Duration plausibility
Reject impossible/near-impossible durations using explicit conservative lower bounds.

Do NOT overfit anti-cheat so legitimate fast players are rejected.

Validation should detect obvious impossible runs, not claim perfect cheat prevention.

### F. Duplicate/replay abuse
Reject:
- duplicate GameRun submission;
- duplicate event summary;
- resubmission of already accepted run;
- conflicting summaries for same run.

### G. Rate limiting
Apply server-side rate limits to:
- run creation;
- run completion;
- score submission;
- display-name changes;
- leaderboard query abuse where appropriate.

## 5. Validation state

Use explicit state:

```text
PENDING
VALIDATED
REJECTED
```

Rejection codes should be machine-readable, e.g.:

```text
RUN_NOT_FOUND
RUN_ALREADY_SUBMITTED
GAME_VERSION_MISMATCH
LEVEL_NOT_PUBLISHED
LEVEL_VERSION_MISMATCH
LEVEL_CHECKSUM_MISMATCH
SEED_MISMATCH
SCORE_ARITHMETIC_MISMATCH
IMPOSSIBLE_EVENT_COUNT
IMPOSSIBLE_DURATION
NUKE_STATE_INVALID
LIFE_STATE_INVALID
CAMPAIGN_SEQUENCE_INVALID
DUPLICATE_SUBMISSION
RATE_LIMITED
MALFORMED_SUMMARY
```

## 6. Deterministic trace digest

Where practical, client submits a deterministic compact trace/event digest derived from:
- level checksum;
- seed;
- ordered significant game events.

Server may use this for reproducibility/debugging.

It is evidence, not secret anti-cheat authority.

## 7. Leaderboard eligibility

Only:

```text
GameRun.validation_state = VALIDATED
AND
ScoreSubmission.validation_result = ACCEPTED
AND
LeaderboardEntry.visible = true
AND
moderation_state allows visibility
```

may appear publicly.
