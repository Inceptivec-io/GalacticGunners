# VISUAL TEST SUITE

Run both:

1. NORMAL VISUAL SUITE
2. PHYSICS-DEBUG VISUAL SUITE

Normal screenshots:
- new landing hero;
- Level1 HUD;
- player laser in flight;
- laser impact;
- shield normal;
- shield legitimate impact;
- Pause;
- Victory;
- Game Over;
- boss.

Debug screenshots:
- player body;
- player-laser body/path;
- enemy body;
- shield bodies;
- nuke body;
- comet body;
- boss normal/hit bodies;
- deterministic laser→enemy fixture.

Screenshot capture alone is not PASS.

Machine-readable assertions should include:
- texture key;
- visibility;
- display size;
- component bounds;
- viewport containment;
- body size/position;
- projectile velocity/path.
