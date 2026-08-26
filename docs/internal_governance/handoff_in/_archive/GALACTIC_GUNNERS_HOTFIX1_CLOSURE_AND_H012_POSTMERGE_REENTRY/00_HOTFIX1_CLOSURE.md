# HOTFIX1 CLOSURE

Branch: `feature/v1-config-driven-campaign-platform`

Remote head independently verified:
`e4c4c87ddd1aae6a416b52703075ef2dede5e045`

Required before CTO/Founder review:

1. `git fetch origin`
2. verify local HEAD == remote HEAD == `e4c4c87ddd1aae6a416b52703075ef2dede5e045`
3. verify worktree CLEAN
4. verify POST_BOX contains only `BOUNDARY.md` and `README.md`
5. rerun exact-head:
   - `npm run game:typecheck`
   - `npm run quality`
   - `docker compose config`
   - `docker compose up --build -d`
   - web/API health
   - `GG_RUNTIME_URL=http://localhost:3002 npm run runtime:hostile`
6. verify corrected runtime:
   - pooled projectile body alignment PASS
   - visible player laser PASS
   - real player laser hit PASS
   - false left-bunker damage = 0
   - full-screen movement bounds PASS
   - accepted 50% player speed preserved
   - accepted equal laser speeds preserved
   - pause surface functional
   - nuke projectile/burst PASS
   - ENERGISE cooldown-only
   - zero-ammo fire blocking PASS
7. open one DRAFT PR to `dev`
8. all required CI green
9. return `GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_011_APP1_HOTFIX1_CLOSURE`

Do not merge.
