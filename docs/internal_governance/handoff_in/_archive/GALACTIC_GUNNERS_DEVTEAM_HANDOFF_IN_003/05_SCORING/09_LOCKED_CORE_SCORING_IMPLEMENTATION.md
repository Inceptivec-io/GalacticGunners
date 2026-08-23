# LOCKED CORE SCORING IMPLEMENTATION

Founder-authorised model:

```text
LASER TARGET              +5
ASTEROID DESTROYED        +10
SCOUT DESTROYED           +25
SHIP DESTROYED            +50
MOTHERSHIP HIT            +50
MOTHERSHIP DESTROYED      +1000
COMET DESTROYED           +500
COMET DESTROYED           +1 NUKE
ALIEN HIT ON SHIELD TILE  -1
```

## Explicit prohibition

Do not change player ship damage/lives.

```text
PLAYER HIT / DAMAGE
!=
SCORE PENALTY
```

No new player-damage scoring behaviour is authorised.

## Shield penalty

Only an enemy/alien attack destroying a defensive shield tile creates `-1`.

Player fire destroying a shield tile:
no score penalty is authorised.

## Implementation requirement

Create explicit score event definitions/constants rather than scattered unexplained magic numbers where practical.

Every event requires:
- one trigger;
- one award/deduction;
- no duplicate callback award;
- immediate HUD refresh;
- deterministic test evidence.

## Mothership

Successful hit:
`+50`

Final destruction:
`+1000` additional destruction bonus.

Do not accidentally replace per-hit score with destruction score or vice versa.

## Comet

On legitimate player destruction:
- `+500`
- increment nukes by exactly `1`
- update score and nuke HUD immediately.
