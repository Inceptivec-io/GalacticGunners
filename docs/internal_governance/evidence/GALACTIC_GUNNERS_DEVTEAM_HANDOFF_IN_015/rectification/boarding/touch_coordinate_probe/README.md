# Boarding Touch Coordinate Probe - Pre-Fix Evidence

**Status:** failed verifier probe retained as diagnostic evidence.

The Boarding touch controls were present, but the verifier calculated the Fire
tap from a guessed viewport coordinate rather than the Phaser canvas transform.
No product failure was inferred from the initial coordinate probe. A second
capture confirmed that those coordinates reconcile; the next verification
records the Phaser `pointerdown` activation and then the resulting projectile.
