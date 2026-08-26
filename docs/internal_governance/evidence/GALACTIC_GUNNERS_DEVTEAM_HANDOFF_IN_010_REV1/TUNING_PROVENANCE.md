# REV1 Level 1 Tuning Provenance

| Parameter | Legacy Source | Legacy Value | V1 Value | Classification | Reason | Test |
|---|---|---:|---:|---|---|---|
| playerSpeed | Legacy_Game read-only reference / Handoff 010 baseline | not asserted as exact | 420 | PROVISIONAL_V1_TUNING | Tuned for responsive web Level1 bounded slice. | `runtime-hostile` left/right bounds and sustained play |
| playerFireCooldownMs | Legacy_Game read-only reference / Handoff 010 baseline | not asserted as exact | 280 | PROVISIONAL_V1_TUNING | Maintains readable projectile cadence without stacking. | sustained fire / projectile cleanup |
| playerLaserSpeed | Legacy_Game read-only reference / Handoff 010 baseline | not asserted as exact | 760 | PROVISIONAL_V1_TUNING | Fast visible upward fire for Level1 slice. | direct hit / near miss |
| enemyLaserSpeed | Legacy_Game read-only reference / Handoff 010 baseline | not asserted as exact | 300 | PROVISIONAL_V1_TUNING | Readable downward threat speed for Level1 slice. | enemy direct hit / near miss |
| scoutRows | Legacy_Game read-only reference / Handoff 010 baseline | not asserted as exact | 2 | PROVISIONAL_V1_TUNING | Bounded Level1 slice formation. | viewport matrix activeScouts 14 |
| scoutColumns | Legacy_Game read-only reference / Handoff 010 baseline | not asserted as exact | 7 | PROVISIONAL_V1_TUNING | Bounded Level1 slice formation. | viewport matrix activeScouts 14 |
| scoutFireIntervalMs | Legacy_Game read-only reference / Handoff 010 baseline | not asserted as exact | 1500 | PROVISIONAL_V1_TUNING | Allows enemy pressure without overwhelming the bounded slice. | hostile enemy fire/damage path |
| scoutHorizontalSpeed | Legacy_Game read-only reference / Handoff 010 baseline | not asserted as exact | 70 | PROVISIONAL_V1_TUNING | Keeps formation movement readable across viewports. | visual matrix and left/right bounds |
| scoutDropDistance | Legacy_Game read-only reference / Handoff 010 baseline | not asserted as exact | 22 | PROVISIONAL_V1_TUNING | Preserves descending-formation game pressure in bounded scope. | formation/bounds runtime path |
| playerDamageCooldownMs | Legacy_Game read-only reference / Handoff 010 baseline | not asserted as exact | 850 | PROVISIONAL_V1_TUNING | Prevents duplicate damage from one hostile contact. | damage cooldown hostile case |

No parameter above is claimed as exact legacy preservation.
