# GALACTIC GUNNERS DEVTEAM HANDOFF IN 011 APP1 HOTFIX 1
## Projectile Spawn / Physics-Body Alignment

Repository:
`Inceptivec-io/GalacticGunners`

Branch:
`feature/v1-config-driven-campaign-platform`

Entry checkpoint:
`ac60eb016543b11cb28bdf4f57c6385625901ebb`

# STATUS

APP1 Block 2 is PAUSED until this hotfix passes.

Founder runtime defect:

```text
PLAYER FIRE
→ no correctly visible player laser
→ left-side bunker tiles are removed
```

# ROOT CAUSE

Current pooled player-laser flow obtains/repositions a pooled game object, then `configureLaser()` re-enables its Arcade body without explicitly resetting the body to the current sprite spawn position.

The swept-collision system uses Arcade body coordinates and previous-body coordinates.

Therefore a recycled/stale body may remain at an old/initial position while the visible sprite is requested elsewhere.

This can produce:

```text
SPRITE SPAWN != PHYSICS BODY SPAWN
→ wrong swept path
→ false shield collision
```

This is a foundational collision defect.

# REQUIRED CORRECTION

Create/use one semantic projectile activation/reset path.

For every pooled projectile activation:

```text
1. obtain pooled object;
2. set intended world x/y;
3. set active/visible;
4. set visual orientation/size;
5. enable body;
6. RESET BODY TO CURRENT WORLD x/y;
7. apply final world-axis body size;
8. reset previous-body coordinates from the NEW body position;
9. clear spent/resolved state;
10. apply velocity.
```

For Phaser Arcade pooled objects, explicitly perform equivalent of:

```ts
laser.setPosition(x, y);
body.reset(x, y);
```

in the correct ordering.

Do not assume `group.get(x,y,texture)` alone synchronizes a previously disabled/recycled body.

# PLAYER LASER

At spawn:

```text
sprite center X ≈ player weapon X
body center X ≈ sprite center X
body center Y ≈ sprite/core center Y
previousBodyCenter = reset body center
```

Required:

```text
PLAYER_LASER_SPRITE_BODY_X_DELTA <= 1px
PLAYER_LASER_SPRITE_BODY_Y_DELTA <= 1px or documented core offset
STALE_PROJECTILE_BODY = 0
```

# ENEMY LASER

Apply the same invariant.

Do not leave enemy pooled projectiles vulnerable to stale-body reuse.

# NUKE

Apply the same invariant to pooled nuke projectiles.

Current nuke pool is also recycled. Explicitly reset its body to current launch x/y before velocity.

Required:

```text
NUKE_SPRITE_BODY_ALIGNMENT = PASS
NUKE_STALE_BODY = 0
```

# COLLISION BEHAVIOUR

Do not widen colliders further as a workaround.

Do not change:
- player scale;
- scout scale;
- bunker layout;
- shield locations;
- laser visual dimensions;
- projectile speed;
- Level 1 topology.

This hotfix is coordinate-state correctness only.

# REAL HOSTILE TESTS

Add deterministic runtime tests:

## A. Left
Move player into a known clear firing lane on left side.

Press Space through normal input.

Assert:
- visible player laser exists;
- sprite X matches player X;
- body X matches sprite X;
- no unrelated bunker tile disappears at spawn;
- projectile travels upward.

## B. Centre
Same at centre.

## C. Right
Same at right.

## D. Bunker intersection
Place player deliberately beneath a shield tile.

Press Space.

Assert:
- laser travels from actual player position;
- only the geometrically intersected tile is removed;
- unrelated left bunker does not change.

## E. Gap shot
Place player beneath a gap between bunkers and under an aligned scout.

Press Space.

Assert:
- no shield tile removed;
- laser reaches scout;
- scout destroyed;
- score +25.

## F. Recycled projectile
Fire/expire/reuse the same pool repeatedly across left/centre/right.

For each reuse:

```text
body center == new sprite center
previous center == new body center at activation
```

At least 20 recycle cycles.

## G. Nuke reuse
Fire/rearm/fire at differing X positions.

Assert pooled nuke body follows actual launch position.

# PHYSICS DEBUG EVIDENCE

Capture debug screenshots for:

- player laser left;
- player laser centre;
- player laser right;
- deliberate shield hit;
- clear gap shot;
- nuke.

Show sprite and body alignment.

# QUALITY

Required:

```text
npm run game:typecheck = PASS
npm run quality = PASS
runtime-hostile = PASS
```

The runtime-hostile suite must include the new pooled-projectile alignment cases.

# CHECKPOINT

Commit and push ONLY this hotfix after tests pass.

Record:

```text
HOTFIX1_FINAL_SHA
```

Local == remote.
Worktree clean.

Then STOP and return:

`GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_011_APP1_HOTFIX1`

Do not resume APP1 Block 2 until CTO/Founder review.

No PR merge.
