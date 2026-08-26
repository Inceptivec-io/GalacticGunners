# GALACTIC GUNNERS DEVTEAM HANDOFF IN 010 REV1

## Purpose
Correct the first v1.0 playable slice to commercial visual/runtime standard and make the hostile/runtime test system capable of catching the defects now visible.

Repository: `Inceptivec-io/GalacticGunners`

PR: `#4`

Branch: `feature/v1-level1-vertical-slice`

REV1 entry HEAD:
`fd7a7e00b6ccd4683e90cff9f41676e19f04517d`

Base:
`dev`

Do not open another PR.
Do not merge.

## Scope
Correct only the current Boot → Main Menu → bounded Level 1 slice and its assurance system.

Do not widen into:
- full Level 1;
- Level 2;
- Boss;
- final Game Over;
- final Victory;
- Boarding;
- auth UI;
- leaderboard UI;
- native packaging;
- commercial deployment.

## Commercial standing rule

```text
NO TECH-DEMO VISUALS WHERE APPROVED PRODUCTION ASSETS EXIST.
NO DEVELOPMENT TERMINOLOGY ON PLAYER-FACING SURFACES.
NO PLACEHOLDER-LIKE COMPOSITION.
NO GREEN TEST SUITE THAT CANNOT DETECT VISIBLE COMMERCIAL FAILURES.
```

All player-facing surfaces must be judged against the accepted Galactic Gunners visual estate, not against “it runs”.
