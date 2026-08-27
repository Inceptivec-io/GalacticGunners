# RANKING, MODERATION & PRIVACY CONTRACT

## 1. Ranking order

Global leaderboard ordering is fixed:

```text
1. validated_score DESC
2. campaign_level_reached DESC
3. accepted_at ASC
4. GameRun UUID ASC
```

This ensures deterministic total ordering.

## 2. One player / many entries

Recommended v1 public leaderboard:

**best validated run per player**.

Reason:
- prevents one player flooding the board;
- gives meaningful global ranking;
- simpler moderation.

Store all validated LeaderboardEntry records if useful, but public query should rank the player's best visible entry.

If anonymous play is leaderboard-ineligible, state that explicitly.

Recommended:
- game remains playable anonymously/offline;
- public global leaderboard requires authenticated player identity.

## 3. Display name policy

Public display name:
- not email;
- not legal name by default;
- 3–20 characters;
- trimmed;
- safe Unicode policy or conservative `[A-Za-z0-9 _-]`;
- no control characters;
- no markup;
- no URLs;
- server sanitization;
- profanity/reserved-name policy.

Recommended reserved names:
- ADMIN
- MODERATOR
- INCEPTIVEC
- SECUVARA
- GALACTIC GUNNERS
- SYSTEM
- OFFICIAL

Case-insensitive normalized matching for reserved words.

## 4. Moderation states

```text
VISIBLE
SUPPRESSED_ENTRY
SUPPRESSED_PLAYER
NAME_REVIEW_REQUIRED
```

Moderation never deletes authoritative GameRun evidence.

Public suppression only affects presentation.

## 5. Moderation reason codes

Examples:

```text
CHEAT_SUSPECTED
OFFENSIVE_NAME
IMPERSONATION
ABUSE
DATA_CORRECTION
ADMIN_TEST_ENTRY
OTHER
```

Require human-readable reason for privileged mutation.

## 6. Manual overrides

Do not let moderators directly rewrite validated score.

If score validation is wrong:
- fix validator;
- revalidate through governed administrative process;
- record audit.

Manual score editing is prohibited in v1.

## 7. Privacy

Public leaderboard returns minimum necessary data only.

Allowed:
- display name;
- rank;
- score;
- level reached;
- victory indicator;
- acceptance timestamp or coarse date if desired.

Not public:
- email;
- real name;
- IP;
- user UUID unless explicitly public-safe;
- device ID;
- auth data;
- rejection details;
- moderation notes.

## 8. Retention

GameRun/validation evidence retained according to product/legal policy.

Do not implement destructive automatic deletion as part of H013 unless already governed.
