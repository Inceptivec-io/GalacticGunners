# Handoff 010 Legacy Behaviour Extraction Matrix

Handoff:
`GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010`

Entry SHA:
`051c7fc9170ae73344a0dc88214c48fc94e0bfdc`

Legacy source status:
`Legacy_Game/` inspected as READ-ONLY evidence. No runtime imports, copies or mutations were made from `Legacy_Game/`.

| Legacy source | Behaviour observed | New TypeScript authority | Verification |
|---|---|---|---|
| `Legacy_Game/assets/js/game.js` | `maxLives = 3`; player state is held outside React. | `game/src/systems/LifeSystem.ts`; `game/src/config/levelOneSlice.ts` initial lives 3. | `npm --workspace game run test`: life denominator/clamp test PASS. |
| `Legacy_Game/assets/js/level1.js` | Keyboard cursor/space controls; player fires upward; Level 1 uses a first scout wave. | `game/src/scenes/Level1Scene.ts`; `game/src/entities/Player.ts`; `game/src/entities/Scout.ts`. | Playwright Docker verifier starts Level 1, fires, scores via real scout collision. |
| `Legacy_Game/assets/js/entities.js` | Player laser points upward; enemy laser points downward; player/enemy collision bodies should reflect meaningful silhouettes. | `Level1Scene` projectile spawn and collision-envelope handling; player clamp independent of source sheet dimensions. | Runtime verifier and hostile sweep PASS; player remains bounded; collisions score. |
| `Legacy_Game/assets/js/gg_runtime.js` | `SCOUT_DESTROYED = 25`; score clamps at minimum zero in current foundation; player damage has no score penalty. | `game/src/config/scoring.ts`; `game/src/systems/ScoreSystem.ts`. | Unit tests assert scout score value, minimum zero and event sequencing. |
| `Legacy_Game/assets/js/controller.js` | Gamepad confirm/fire/back/left/right abstraction exists. | `game/src/systems/InputSystem.ts`; Phaser gamepad input enabled in `game/src/runtime.ts`. | Unit tests cover gamepad button/axis normalization. Physical controller hardware not attached. |

Deferred by Handoff 010 scope:
Full Level 1, Level 2, boss/final states, boarding, leaderboard UI, auth UI, packaging and production deployment.
