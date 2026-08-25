# DETERMINISTIC COLLISION VISUAL FIXTURES

Create controlled fixtures, not random gameplay only.

Required:
- laser → destroyer;
- laser → scout;
- laser → cruiser;
- laser → asteroid;
- laser → shield;
- nuke → enemy;
- near miss.

For each hit fixture:
- one player/projectile;
- one stationary target;
- unobstructed path;
- debug body visible in debug run;
- swept path visible where custom debug layer is used;
- target reacts exactly once;
- correct score/state event.

Run all fixtures in normal and debug modes.

Expected results must be identical.
