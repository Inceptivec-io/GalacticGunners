# OFFLINE / SECURITY / HOSTILE ASSURANCE

## Offline resolution

remote published version
→ schema validate
→ semantic validate
→ checksum verify
→ cache
→ play

If unavailable/invalid:
→ last validated cache
→ packaged release definition

Unvalidated config never executes.

Package validated campaign definitions.

## Security hostile

Protect:
- admin publish authority
- level version integrity
- GameRun denominator
- audit history

Reject:
- anonymous admin access
- normal-player admin access
- draft public leakage
- prototype pollution
- oversized JSON
- deep nesting
- unknown fields
- unsupported schema
- unknown entity/asset
- forged checksum
- executable payloads in prohibited fields

Published LevelVersion immutable.

## Hostile test matrix

Level1 golden parity at:
1365x768
1440x900
1920x1080
2560x1440
1024x768

Compare:
player geometry
58 enemies
8 bunkers/256 tiles
HUD
lasers
nukes
pause
respawn
score
terminal flow

Schema hostile:
invalid enum
invalid coordinates
unknown entity
invalid matrix
excessive budgets

Admin:
anonymous denied
player denied
admin allowed
route not public

Generator:
same seed → same checksum/output
100-seed sweep → valid or explicit reject, never invalid executable level

Offline:
online
backend down
invalid remote
unsupported schema
corrupt cache
packaged fallback

Runtime:
real projectile collisions
pause
respawn
nukes
pickup collection
drop determinism
no stale timers/listeners/projectiles

Required CI families:
backend
client-and-game
docker-smoke
runtime-hostile
level-definition-hostile
admin-hostile
generator-hostile

Can combine jobs only if individual failure reporting remains explicit.
