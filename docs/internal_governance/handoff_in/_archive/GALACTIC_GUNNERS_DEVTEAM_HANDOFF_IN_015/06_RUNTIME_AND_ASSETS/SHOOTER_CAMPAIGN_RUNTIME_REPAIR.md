# Shooter Campaign Runtime Repair

## Current defects to remove

- `Level1Scene` restarts with a sequence but constructs new `ScoreSystem`, `LifeSystem` and nuke state each time.
- campaign definitions are shallow Level 1 variations rather than authored release content;
- each level starts/completes an unrelated GameRun, so no aggregate checkpoint exists;
- the UI labels local level score as if it were campaign score.

## Client runtime model

Add a semantic `CampaignSession` owned above individual Phaser scene restarts:

```ts
interface CampaignCheckpoint {
  campaignId: string | null;
  mode: 'ONLINE_RANKABLE' | 'LOCAL_UNRANKED' | 'PREVIEW';
  releaseId: string;
  nextSequence: number;
  score: number;
  lives: number;
  nukes: number;
  seedRoot: number;
  levelEntry?: LevelEntrySnapshot;
}
```

It is created by Boot/GameHost, stored in Phaser registry or a single runtime service, and injected into `CombatLevelScene`. Scene restart must not reconstruct campaign totals from global defaults.

`LevelEntrySnapshot` contains exact cumulative score/resources/sequence/level version/checksum/seed at attempt start. Replay restores this snapshot. Continue accepts only the server completion checkpoint and then loads the exact next config. New Campaign creates a new CampaignSession.

## Score semantics

- `ScoreSystem` may keep a level-local delta internally.
- HUD campaign score = `entryScore + levelDelta`.
- completion submits events, never trusts displayed total.
- accepted response replaces provisional values with server-derived `level_score` and `campaign_score`.
- rejected online completion cannot continue/rank; show safe validation failure.
- offline/local mode computes display score using the same shared deterministic rules but remains unranked.

## Levels 1–6

Replace shallow cloning with six explicit JSON definition fixtures seeded into `LevelVersion` and copied to packaged release files. At minimum each later level differs in two or more material dimensions among formation topology, wave rules, enemy class mix, hazards, objectives, drops, shield composition or visual theme. Slug/name/seed-only difference fails.

Level 1 preserves 58 enemies and 256 shield tiles. Level 4 preserves the governed Boarding anchor. Level 6 has a terminal objective supported by the existing governed scoring/runtime; do not invent unauthorised score values.

Boot loads the campaign-pinned `GameRelease` manifest, then exact LevelVersion definitions. Remote failure falls back only to packaged definitions with matching release/version/checksum. A stale cached different checksum cannot silently replace the campaign-pinned authority.

## Scene actions

- Continue: wait for accepted completion/checkpoint; then start next exact sequence.
- Replay: start a new attempt from the current entry snapshot.
- Try Again after life exhaustion: new campaign or explicitly allowed same-level attempt based on product result action; never resurrect the terminal campaign silently.
- Main Menu: retain active campaign for Resume.
- Quit/New Campaign: explicit confirmation where progress would be abandoned.

## Tests

Assert cumulative values through all six levels, replay without duplicated reward, menu/resume, double-click Continue idempotency, remote/cache/package identity, distinct configuration fingerprints, final campaign terminal state and anonymous/local rankability labels.

