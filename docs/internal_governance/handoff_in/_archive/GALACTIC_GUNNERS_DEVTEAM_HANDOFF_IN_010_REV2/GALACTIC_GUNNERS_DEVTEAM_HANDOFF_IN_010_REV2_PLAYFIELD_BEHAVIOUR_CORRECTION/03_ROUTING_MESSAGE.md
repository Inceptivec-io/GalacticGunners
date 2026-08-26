HANDOFF REVISION:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010_REV2

TARGET:
PR #4
feature/v1-level1-vertical-slice

REV2 ENTRY HEAD:
6c1964a3148ab7743552c4f608ea8117730b499f

STATUS:
CTO QUALITY GATE = REV2 REQUIRED

ROOT DEFECT:
The current Phaser runtime still treats physical viewport dimensions as the simulation/playfield model. This is causing unstable composition and scaling. There is also a confirmed player-respawn behavioural regression.

REQUIRED:

1. Create ONE `PlayfieldLayout` authority:
   full-bleed stellar viewport + stable gameplay safe area + HUD bounds + spawn + movement bounds + formation bounds + responsive entity/projectile scales.

2. Restore accepted Level 1 formation denominator:
   29 columns × 2 rows = 58 enemies.
   If unsafe, STOP. Do not substitute 14.

3. Restore four-direction player flight:
   LEFT / RIGHT / UP / DOWN
   touch X/Y
   gamepad X/Y
   normalize diagonals.

4. Fix player hit lifecycle:
   ACTIVE → HIT → DAMAGE → REGENERATING/INVULNERABLE → RESPAWN → ACTIVE.
   One hit = one life.
   Score delta = 0.
   Respawn centre-bottom from PlayfieldLayout.
   No duplicate sprite.
   No ghost body.
   No multi-life cascade.
   At zero lives only → terminal failure.

5. Restore shield defensive zone using individual canonical `gg_shield_tile_v002.png` tiles and locked matrix.
   Enemy shield hit = -1 score.
   Player laser shield hit = 0 score penalty.

6. Derive player/scout/projectile visual sizes from layout ratios, not fixed viewport-independent constants.

7. Use physics debug in assurance:
   player/scout/player-laser/enemy-laser/shield bodies.
   Validate spawn origins, directions, direct hits, near misses, resize alignment and respawn body relocation.

8. Update hostile suite to test the actual defects:
   four-direction movement, diagonals, all bounds, real player hit + respawn, invulnerability, 58-enemy formation, shield collisions, active-game resize, projectile direct-hit/near-miss.

9. Legacy is minimum gameplay grammar, not final visual ceiling.
   Preserve its composition/readability and improve it with production assets.
   Return side-by-side comparison + intentional-deviation matrix.

10. Keep CI green:
    backend
    client-and-game
    docker-smoke
    runtime-hostile

DO NOT:
Level2
Boss
final GameOver
final Victory
Boarding
auth UI
leaderboard UI
deploy
tag
merge

RETURN:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_010_REV2

PR #4 stays OPEN / DRAFT / NOT MERGED.
RETURN FOR CTO / FOUNDER REVIEW.
