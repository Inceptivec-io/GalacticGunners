# P0 INTEGRATED RUNTIME TEST STANDARD

The previous REV5 test strategy is superseded for gameplay acceptance.

## Do not

The gameplay acceptance test must NOT:
- call `scene.time.removeAllEvents()`;
- clear and reconstruct the normal scene as its primary proof;
- call `ggHandlePlayerFiring` directly to prove keyboard firing;
- manually call `ggRunSweptCollisionContracts` to prove runtime collision;
- install a new overlap inside the test to prove a collision registration exists;
- directly call damage helpers as substitute for a real collision.

Those techniques are permitted for unit tests only.

They are not integrated gameplay proof.

## Actual runtime tests

Use Playwright against Docker and send real browser input.

### Test 1 — visible keyboard shot

1. load normal Docker URL;
2. start Level1 through normal UI/input path;
3. record player laser count;
4. `page.keyboard.down("Space")`;
5. wait 100 ms;
6. `page.keyboard.up("Space")`;
7. verify count increased;
8. capture screenshot with visible laser;
9. record laser Y;
10. wait 200 ms;
11. verify Y decreased materially.

No helper call.

### Test 2 — repeated keyboard fire

Hold Space 3 seconds in live scene.

Expected:
- multiple projectiles observed;
- projectiles move;
- no runtime exception;
- no self damage.

### Test 3 — no unexplained player death

Run actual Level1 for 60 seconds with deterministic enemy fire test mode OFF then ON.

When OFF:
- player does not die from movement/body contacts.

When ON:
- every life decrement must correlate to an enemy-laser/player collision trace.

No life change without trace.

### Test 4 — real comet hit

Use a deterministic TEST-ONLY spawn fixture that inserts a comet into the live scene but does NOT replace scene collision registrations.

Then fire using real Space key input.

Expected:
- visible laser travels;
- registered normal overlap hits comet;
- comet destroyed;
- +500;
- +1 nuke.

### Test 5 — shield pass

Place deterministic shield tile in live shot path using test fixture.

Fire real keyboard input.

Expected:
- laser remains active after passing shield line;
- shield remains active;
- projectile continues upward.

### Test 6 — enemy laser player

Use deterministic enemy-fire fixture to request one normal EnemyLaser through the same production spawn factory.

Do not call damage resolver directly.

Expected:
- visible enemy projectile moves down;
- visible/debug body reaches player;
- exactly one life lost;
- one explosion trace.

### Test 7 — visual physics debug

Repeat key cases at:

`?ggPhysicsDebug=1`

Screenshots must visibly show:
- laser visual;
- laser body;
- comet body;
- shield body;
- enemy laser body;
- player body.

## Test-only deterministic controls

A test mode may:
- seed RNG;
- suppress random enemy firing;
- request one production entity spawn;
- expose read-only runtime state/trace.

It may NOT:
- install alternate collision logic;
- call outcome resolvers directly;
- replace normal scene timers;
- manually step physics as the sole integration proof.
