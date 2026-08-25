# PHASER ARCADE PHYSICS DEBUG MODE

The current game uses Arcade Physics and presently has `physics.arcade.debug = false`.

Add an explicit **test-only** physics debug mode.

Preferred activation:

```text
http://localhost:8027/?ggPhysicsDebug=1
```

or a deterministic equivalent documented in evidence.

Normal runtime:
`debug = false`

Debug runtime:
`debug = true`

Debug mode must visibly expose bodies for:
- player;
- enemy ships;
- boss;
- shield tiles;
- player laser;
- enemy laser;
- nuke;
- asteroid;
- comet.

Where useful add a test-only overlay for:
- logical sprite envelope;
- hard collision envelope;
- swept projectile previous→current path.

Debug mode must never change gameplay behaviour, scoring, velocity, or hit outcome.

Required proof:
normal-mode and debug-mode deterministic fixture results are identical.
