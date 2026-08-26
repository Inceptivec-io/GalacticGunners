# Galactic Gunners Guide Set v1.0

**Authority:** Galactic Gunners CTO / Founder acceptance  
**Purpose:** Single operational guide surface for players, administrators, developers, testers and release operators.

## Status vocabulary

- **CURRENT** — implemented and expected in the accepted runtime now.
- **H012 TARGET** — specified behaviour to be implemented by the Campaign Platform Formation Sprint. Development must implement to this contract rather than infer alternatives.
- **DEFERRED** — intentionally outside current scope.

## Guides

1. `GALACTIC_GUNNERS_PLAYER_GUIDE_v1.0.md` — controls, scoring, lives, nukes, pause and expected gameplay behaviour.
2. `GALACTIC_GUNNERS_ADMIN_GUIDE_v1.0.md` — hidden admin access, level lifecycle, authoring and security rules.
3. `GALACTIC_GUNNERS_LEVEL_AUTHORING_GUIDE_v1.0.md` — LevelDefinition model, designer workflow, validation and generation rules.
4. `GALACTIC_GUNNERS_DEVELOPER_GUIDE_v1.0.md` — architecture, source-of-truth boundaries and implementation rules.
5. `GALACTIC_GUNNERS_TEST_REGRESSION_GUIDE_v1.0.md` — functional/regression matrix and evidence requirements.
6. `GALACTIC_GUNNERS_UI_UX_REVIEW_SNAGGING_GUIDE_v1.0.md` — Founder UI/UX review and defect classification.
7. `GALACTIC_GUNNERS_ENVIRONMENT_ROUTING_SECRETS_GUIDE_v1.0.md` — feature/dev/stage/prod URLs, routing and local secret files.
8. `GALACTIC_GUNNERS_RELEASE_PROMOTION_GUIDE_v1.0.md` — feature → dev → stage → prod promotion gates.

## Governing rule

When implementation and these guides disagree, Development must not silently choose one. Stop and return the conflict for CTO/Founder resolution.

```text
IMPLEMENTATION CURRENT
=
GUIDES CURRENT
=
SCHEMAS CURRENT
=
TESTS CURRENT
=
ROADMAP / PLAYLIST CURRENT
```

The accepted Level 1 golden denominator includes the corrected projectile/body alignment, visible player lasers, correct bunker collision behaviour, accepted movement bounds, accepted player/laser speed settings, pause, nuke lifecycle, cooldown-only Energise, zero-ammo blocking, and accepted topography/sizing.
