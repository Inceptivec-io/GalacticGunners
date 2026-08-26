# H012 POST-MERGE RE-ENTRY

Associated pack:
`GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_012_CAMPAIGN_PLATFORM_FORMATION_PACK.zip`

SHA-256:
`09d36c279035990e004ac5204b46e8ccac495954bcfb73f1501620a5f8caf4e8`

Execute ONLY after Founder merges the Hotfix1 closure PR into `dev`.

Then:

```text
git fetch origin
git switch dev
git pull --ff-only origin dev
git rev-parse HEAD
```

Record exact merge head as `H012_ENTRY_SHA`.

Then:

```text
git switch feature/v1-config-driven-campaign-platform
git merge --ff-only origin/dev
git push origin feature/v1-config-driven-campaign-platform
```

Verify:

```text
dev = H012_ENTRY_SHA
local feature = H012_ENTRY_SHA
remote feature = H012_ENTRY_SHA
worktree = CLEAN
```

If non-fast-forward or mismatch:
`STOP — H012_POSTMERGE_SOURCE_MISMATCH`

No rebase, force-push or reset.

Then execute H012 immediately through:

- Gate A — Level/LevelVersion, checksum, GameRun binding, APIs, RBAC, import/export, audit
- Gate B — CombatLevelScene, LevelLoader, config runtime, Level1 golden parity
- Gate C — hidden `/inceptivec-gamification-admin` visual designer
- Gate D — NUKE/LIFE drops, deterministic generator, Levels 1–6
- Gate E — hostile, Docker, CI, governance

The merged corrected Level 1 runtime becomes part of the golden denominator.
