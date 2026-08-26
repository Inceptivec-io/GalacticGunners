# REV1 Input And Collision Architecture

Input authority:

- `game/src/systems/InputSystem.ts` binds keyboard, pointer/touch and gamepad once.
- `Level1Scene` consumes normalized `ActionState`.
- `LEVEL1_DIRECT_DEVICE_POLLING = 0` for `createCursorKeys()` / `addKey()` in `Level1Scene`.
- No manual touch mode selector is used.

Collision authority:

- One active collision model: Phaser Arcade overlap with centered Arcade bodies.
- Removed the manual broad projectile envelope loop.
- Removed source texture-coordinate `setOffset(...)` usage from active player/scout/projectile collision bodies.
- Player body: 54 x 92 world pixels, centered on rendered player silhouette.
- Scout body: 58 x 44 world pixels, centered on rendered scout silhouette.
- Player/enemy laser body: 16 x 70 world pixels, centered on the rendered projectile core.
- Projectile body sizing compensates for rendered display scale, preventing undersized Arcade bodies.

Hostile semantic results:

| Case | Result |
|---|---|
| Direct player laser hit scores once | PASS |
| Player laser near miss scores zero | PASS |
| One laser multi-scout score duplication | PASS |
| One scout double-score duplication | PASS |
| Direct enemy laser hit applies one damage | PASS |
| Enemy laser near miss applies zero damage | PASS |
| Damage cooldown prevents duplicate hit | PASS |
| Replay reset clears projectiles/timers/state | PASS |
| Backend offline remains playable without fabricated run ID | PASS |

Executable source:
`scripts/verify-v1-slice-runtime.mjs`

Evidence output:
`docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV1/browser_runtime/runtime-hostile-verification.json`
