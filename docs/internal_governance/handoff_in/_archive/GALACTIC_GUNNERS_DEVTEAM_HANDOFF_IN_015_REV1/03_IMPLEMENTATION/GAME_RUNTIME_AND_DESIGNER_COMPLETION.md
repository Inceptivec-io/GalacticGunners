# Shared Game Runtime and Designer Completion

## Campaign runtime

Move campaign-owned state above scene lifecycle. A semantic `CampaignSession` survives Continue, replay, menu/resume and Boarding. Individual combat scenes receive an exact entry snapshot and never construct campaign totals from defaults.

Required state:

- campaign/release/campaign-version IDs;
- current/next CampaignEntry IDs and positions;
- exact level version/checksum/seed;
- cumulative accepted score;
- current lives/nukes;
- rankability mode;
- level entry snapshot;
- active GameRun identity and idempotency state.

Continue is enabled only after server acceptance (or deterministic local-unranked completion). It resolves `next_entry` from the response/manifest. No `sequence + 1` hard-coded final-level assumption remains. Replay creates a new attempt from the saved entry snapshot. Main Menu retains active online campaign for Resume. Death reaches a deliberate result/Game Over surface; it must not silently reload.

## Current six-level baseline

Seed and package six explicit definitions. Level 1 remains exactly 58 enemies and 256 shield tiles. Each later level differs materially in at least two gameplay dimensions. Hazards are mandatory where configured and must visibly instantiate; definitions cannot list asteroids/comets that runtime ignores.

Minimum H015 content identity:

| Entry | Required distinction |
|---:|---|
| 1 | accepted foundational formation and shields |
| 2 | different formation/wave topology plus visible asteroid hazard |
| 3 | mixed governed enemy composition plus different objective/drop behaviour |
| 4 | visible advanced hazard plus the governed reachable Boarding anchor |
| 5 | elite/high-pressure formation and hazard/drop composition |
| 6 | supported terminal/finale objective and deliberate campaign victory |

Legacy content may inform authoring but must be converted into current schema-valid, provenance-safe definitions. Checksums of DB and packaged fallbacks must match.

## Result panels

Use the admitted production panels and buttons. Dynamic overlay text must clearly distinguish level score/delta, cumulative campaign score, level/entry, lives, nukes and ranked/unranked state. Required actions are Continue when next entry exists, Replay Level when valid, Main Menu, New Campaign/Try Again as appropriate, plus login/register score-save CTA for eligible anonymous online results.

## Designer shared component

Keep one shared Designer component with a mandatory context object:

```text
surface: INCEPTIVEC_ADMIN | COMMAND_POST
project_id
owner_scope
organization_id|null
effective_permissions[]
effective_limits
```

The server supplies and verifies context. Inceptivec mode can manage authorised CORE content. Command Post mode can only manage organisation-owned projects/maps.

Every palette button opens the image chooser specified by original H015. Selection/drag-drop persists stable `AssetRecord.id`; canvas renders the actual image; keyboard placement is equivalent. Inspector uses typed fields. Save uses concurrency token. Validate/publish/preview use the shared backend and Phaser runtime.

Command Post displays customer language such as Maps and Game Setup. It does not display raw lifecycle/checksum detail unless useful; internal admin may display full governance metadata.

## Boarding

Original H015 Boarding authority remains mandatory. Level 4 must provide a discoverable boardable target, 8-second offer, entry envelope and interact control. API failure restores exact Shooter state. Success/timeout/death/abort are server replayed and returned once. Production assets must render without checkerboards. Automated presence tests do not replace the real browser journey.

