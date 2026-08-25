# v0.1 COMBAT INTERACTION MATRIX — FOUNDER / CTO AUTHORITY

| Source | Player | Shield | Enemy | Scout | Mothership | Asteroid | Comet |
|---|---|---|---|---|---|---|---|
| Player Laser | PASS | PASS | HIT | HIT | HIT | HIT | HIT |
| Player Nuke | PASS | PASS | HIT | HIT | HIT | HIT | HIT |
| Enemy Laser | HIT | HIT | PASS | PASS | PASS | PASS | PASS |
| Enemy Body | PASS | HIT | — | — | — | PASS | PASS |
| Asteroid Body | PASS | PASS | PASS | PASS | PASS | — | PASS |
| Comet Body | PASS | PASS | PASS | PASS | PASS | PASS | — |
| Player Body | — | PASS | PASS | PASS | PASS | PASS | PASS |

## Player damage authority

Only:

`ENEMY LASER → canonical enemy-projectile player-damage resolver → exactly one life decrement`

may damage the player in normal v0.1 combat.

No asteroid, comet, enemy-body, scout-body or mothership-body collision may decrement lives.

## Shield authority

Shield damage sources:
- enemy laser;
- enemy body contact.

Player laser and player nuke pass through/ignore shield tiles.

This current Founder rule supersedes the earlier legacy allowance for player-fire shield destruction.
