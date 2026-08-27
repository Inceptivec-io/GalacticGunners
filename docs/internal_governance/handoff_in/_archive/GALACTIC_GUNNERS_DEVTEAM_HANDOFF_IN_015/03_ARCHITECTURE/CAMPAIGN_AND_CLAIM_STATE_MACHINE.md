# Campaign, Level Attempt and Score-Claim State Machine

## Campaign lifecycle

```text
CREATE ACTIVE(seq=1, score=0, lives=3, nukes=2)
  ├─ start expected level attempt
  │    ├─ rejected submission → attempt REJECTED; campaign REJECTED
  │    ├─ player loses last life → attempt VALID; campaign FAILED
  │    ├─ level 1–5 complete → atomic checkpoint; ACTIVE(seq+1)
  │    └─ level 6 complete → atomic checkpoint; COMPLETED(seq=7)
  └─ explicit abandon → ABANDONED
```

No client transition directly sets campaign score/resources/sequence. The server derives the next checkpoint from the accepted attempt, previous locked checkpoint, exact level/release and replayed/validated event summary.

## Level attempt admission

Request names campaign and desired sequence. Server locks CampaignRun and rejects unless:

- campaign ACTIVE;
- caller owns it or presents valid anonymous capability;
- requested sequence equals `next_sequence` (or explicit replay of current entry snapshot);
- no active attempt exists;
- release/level version is still the campaign-pinned authority.

Response contains attempt/run ID, exact LevelVersion config/checksum, deterministic seed, and entry checkpoint. Anonymous capability is sent in `X-Campaign-Token`; it is never in URL/logs.

## Completion

Within one transaction:

1. lock CampaignRun and GameRun;
2. reject a second terminal submission unless identical idempotent replay;
3. validate/replay event summary and all Boarding children;
4. derive `score_delta`, `exit_lives`, `exit_nukes`, outcome and state digest;
5. persist immutable submission evidence;
6. update GameRun terminal state;
7. update CampaignRun cumulative checkpoint;
8. publish/update leaderboard only when owned, eligible and terminal policy permits;
9. commit audit.

Response distinguishes:

```json
{
  "level_score": 1450,
  "campaign_score": 3875,
  "lives": 2,
  "nukes": 1,
  "level_completed": 3,
  "next_sequence": 4,
  "next_action": "CONTINUE",
  "ranked": false
}
```

## Continue/replay/menu/new campaign

- `CONTINUE`: creates next-sequence attempt from accepted campaign checkpoint.
- `REPLAY_LEVEL`: creates a new attempt for the same sequence from that level's original entry snapshot. Previous attempt stays evidence. Campaign checkpoint is updated only by the newly accepted attempt; no reward can be applied twice.
- `MAIN_MENU`: stops scene and retains ACTIVE campaign for resume.
- `NEW_CAMPAIGN`: creates a new aggregate with initial resources; never mutates old campaign.

## Anonymous claim

```text
ANONYMOUS UNOWNED
  ├─ invalid/expired/wrong token → unchanged + rejected audit
  ├─ already owned → conflict
  ├─ ineligible/unvalidated → unranked conflict
  └─ authenticated caller + valid token
       → lock campaign
       → assign player
       → clear capability hash
       → record claimed_at
       → publish eligible leaderboard entry once
       → CLAIMED
```

Registration may accept a claim token only after account creation and session establishment; it must call the same claim service as explicit login-then-claim. A registration failure cannot consume the claim.

## Offline

If campaign/run start cannot reach backend, gameplay may start against packaged CORE levels in `LOCAL_UNRANKED` mode. Local score is displayed but has no server CampaignRun, cannot claim and cannot publish. UI must say so before/at result; it must never imply later ranking.
