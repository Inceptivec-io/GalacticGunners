# PLAYER LASER END-TO-END CONTRACT

Founder reports lasers still do not reliably shoot.

Test the complete chain:

```text
INPUT
→ FIRE REQUEST
→ COOLDOWN
→ PLAYER ACTIVE
→ LASER CREATED
→ GROUP ADD
→ BODY ENABLED
→ CORRECT SPAWN
→ VISIBLE RENDER
→ UPWARD VELOCITY
→ MOVEMENT
→ COLLISION / SWEPT COLLISION
→ TARGET OUTCOME
```

Prove separately:
- keyboard;
- Xbox/controller;
- touch.

For each test shot record:
- input source/time;
- player x/y;
- laser ID;
- spawn x/y;
- body bounds;
- velocity;
- next-frame position;
- later position;
- destruction reason.

FAIL if input occurs but no projectile spawns.
FAIL if it spawns but does not move.
FAIL if it moves but is not visibly rendered.
FAIL if it visibly crosses a hard target body without a hit.
