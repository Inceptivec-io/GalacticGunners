# H013 DOMAIN MODELS

Use existing models where present; enhance rather than fork.

## 1. GameRun

Authoritative lifecycle:

```text
CREATED
→ ACTIVE
→ COMPLETED_PENDING_VALIDATION
→ VALIDATED | REJECTED
```

Minimum fields:

```text
GameRun
├── id UUID
├── player FK nullable
├── client_type
├── game_version
├── level FK / level_id
├── level_version
├── level_checksum
├── seed
├── started_at
├── completed_at nullable
├── duration_ms nullable
├── victory boolean
├── level_reached
├── lives_start
├── lives_end
├── lives_lost
├── nukes_start
├── nukes_end
├── nukes_used
├── raw_client_score
├── validated_score nullable
├── validation_state
├── validation_code nullable
├── validation_detail JSONB
├── submitted_at nullable
└── accepted_at nullable
```

If existing names differ, preserve current authority and map semantics cleanly.

## 2. GameRunEventSummary

Prefer structured validated summary rather than storing every frame.

Conceptual object:

```text
GameRunEventSummary
├── scout_kills
├── ship_kills
├── asteroid_kills
├── mothership_hits
├── mothership_kills
├── comet_kills
├── shield_enemy_hits
├── nuke_uses
├── life_pickups
├── nuke_pickups
├── bonus_events
├── levels_completed[]
├── level_terminal_state
└── deterministic_trace_digest
```

May be JSONB on submission if separate relational model adds no value.

## 3. ScoreSubmission

```text
ScoreSubmission
├── id UUID
├── game_run OneToOne
├── submitted_score
├── expected_score
├── accepted_score nullable
├── arithmetic_valid
├── event_counts_valid
├── duration_valid
├── version_valid
├── level_identity_valid
├── checksum_valid
├── seed_valid
├── duplicate_valid
├── rate_valid
├── validation_result
├── rejection_codes[]
├── created_at
└── validated_at
```

One GameRun may produce one accepted submission only.

## 4. LeaderboardEntry

```text
LeaderboardEntry
├── id UUID
├── player nullable
├── display_name
├── game_run FK unique
├── validated_score
├── campaign_level_reached
├── victory
├── accepted_at
├── moderation_state
├── visible boolean
├── suppression_reason nullable
├── created_at
└── updated_at
```

`game_run` must reference a VALIDATED run.

## 5. PlayerLeaderboardProfile

Only add if existing profile does not already own this concern.

Concept:

```text
PlayerLeaderboardProfile
├── player FK
├── display_name
├── display_name_normalized
├── leaderboard_enabled
├── moderation_state
├── created_at
└── updated_at
```

Do not duplicate identity authority.

Django remains identity authority.

## 6. ModerationAuditEvent

Reuse existing audit system if present.

Required operations:
- suppress entry;
- restore entry;
- suppress player;
- restore player;
- rename/moderate display name;
- reject submission;
- manual validation override only if explicitly authorized;
- bulk moderation if added.

Record:
- actor;
- action;
- target;
- reason;
- before;
- after;
- timestamp.

No silent moderation mutation.
