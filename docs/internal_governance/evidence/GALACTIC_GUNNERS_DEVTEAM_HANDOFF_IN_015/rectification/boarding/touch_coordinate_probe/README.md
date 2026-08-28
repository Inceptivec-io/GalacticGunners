# Boarding Touch Coordinate Probe - Pre-Fix Evidence

**Status:** failed verifier probe retained as diagnostic evidence.

The Boarding touch controls were present, but the verifier calculated the Fire
tap from a guessed viewport coordinate rather than the Phaser canvas transform.
No product failure was inferred from this probe. The next verification uses the
runtime-published control coordinates and the actual canvas scale.
