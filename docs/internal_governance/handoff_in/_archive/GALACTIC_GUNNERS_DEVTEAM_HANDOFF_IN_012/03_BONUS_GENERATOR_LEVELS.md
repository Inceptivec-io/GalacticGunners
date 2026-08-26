# BONUS / GENERATOR / SIX LEVELS

## Initial pickup registry

NUKE
LIFE

## Drop flow

source destroyed
→ seeded weighted drop resolution
→ optional pickup eject/jump
→ collectable pickup
→ player collision
→ state mutation
→ event trace

One source destruction resolves drop once.
One pickup collects once.
Respect life/nuke caps.

Drop table example:

{
  "id": "drops-standard",
  "max_drops_per_run": 4,
  "entries": [
    {"pickup_type": "NUKE", "weight": 25, "quantity": 1},
    {"pickup_type": "LIFE", "weight": 10, "quantity": 1},
    {"pickup_type": "NONE", "weight": 65, "quantity": 0}
  ]
}

## Deterministic RNG

level_version + checksum + seed
must reproduce:
- generated layout decisions;
- hazard variants;
- drop decisions;
- bonus decisions.

No Math.random() in governed level-content randomness.

## Generator

Inputs:
- seed
- template
- difficulty
- allowed enemy types
- enemy budget
- shield constraints
- hazard constraints
- bonus/drop constraints
- boarding-anchor constraints
- performance budget

Pipeline:
template
→ seeded candidate
→ geometry constraints
→ spawn safety
→ performance budget
→ schema validation
→ semantic validation
→ hostile simulation
→ DRAFT

AUTO-PUBLISH = NO.

## Six drafts

Level 1:
exact accepted H010 denominator.

Level 2:
escalation using same runtime.

Level 3:
mixed fleet using only runtime-ready registered enemy types.

Level 4:
hazards + NUKE/LIFE drops + dormant BoardingAnchor metadata.

Level 5:
elite/high-pressure multi-wave composition.

Level 6:
finale; use Mothership only if production runtime support is genuinely ready.

If an intended capability is not ready:
mark exact blocker.
Do not fake implementation.

Meaningful playable drafts required, not empty JSON placeholders.
