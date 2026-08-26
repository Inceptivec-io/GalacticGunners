# GALACTIC GUNNERS DEVTEAM HANDOFF IN 012
## Campaign Platform Formation Sprint

Repository: `Inceptivec-io/GalacticGunners`
Branch: `feature/v1-config-driven-campaign-platform`
Authority: Roadmap/Playlist v1.2

ENTRY GATE:
- H011 APP1 HOTFIX1 = CTO PASS
- projectile spawn/alignment defect = CLOSED
- runtime-hostile = PASS
- local == remote
- worktree clean
- accepted Level 1 golden topology unchanged

Record exact entry SHA as `H012_ENTRY_SHA`.

PURPOSE:
Complete the usable config-driven campaign platform end-to-end.

DELIVER:
1. Django Level / LevelVersion authority.
2. Published immutability + canonical checksum.
3. GameRun level/version/checksum/seed binding.
4. Public level read API + admin mutation API.
5. Server-side LevelDefinition validation.
6. Generic CombatLevelScene + LevelLoader + LevelRuntimeConfig.
7. Accepted Level 1 migrated to config with zero regression.
8. Hidden admin designer at `/inceptivec-gamification-admin`.
9. Draft/validate/publish/rollback/archive lifecycle.
10. Secure JSON import/export.
11. NUKE/LIFE bonus/drop authoring + runtime.
12. Deterministic RNG.
13. Procedural LevelDefinition DRAFT generator.
14. Packaged/cache/offline level resolution.
15. Six meaningful campaign drafts.
16. Hostile suites, Docker, CI, governance closure.

INTERNAL GATES:
A = content authority
B = generic runtime + Level1 parity
C = hidden admin designer
D = bonus/generator/Levels2-6
E = hardening/return

DO NOT:
- alter accepted Level 1 topology/sizing;
- implement Boarding runtime;
- create Level2Scene..Level6Scene duplication;
- allow arbitrary scripting;
- auto-publish generated levels;
- expose admin route publicly;
- deploy or merge.
