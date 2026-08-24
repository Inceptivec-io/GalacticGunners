# Game Core Execution Contract

Scope: `game/` only.

- Phaser owns moment-to-moment gameplay.
- Migrate legacy behaviour incrementally: extract → type → test → preserve behaviour.
- No mass rewrite and no React gameplay implementation.
- Stable semantic names only; no handoff/sprint identifiers in permanent source names.
- Every behavioural change updates fixtures/contracts/guides/currentness in the same change.
- The accepted GGF-1 baseline is the behavioural reference until its retirement is explicitly authorised.
