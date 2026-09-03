# Galactic Gunners Founder Review

## Prerequisites

- Docker Desktop is installed and running.
- The repository is `C:\Users\Michael\dev\GalacticGunners`.
- The checked-out branch is `feature/v1-platform-foundation-campaign-continuity`.

## Start Review

Run the single governed command:

```powershell
cd C:\Users\Michael\dev\GalacticGunners
.\scripts\start-founder-review.ps1
```

It fails before starting a review when the branch, upstream SHA, worktree, build provenance, database, migrations, bootstrap data, audience access, API boundaries, campaign, Boarding, or container health is invalid. On success it writes `FOUNDER_REVIEW_READY=YES` and generates the ignored local access file `FOUNDER_REVIEW_ACCESS.local.txt`.

Use the exact URLs and generated credentials in that access file. Product review is always on `http://localhost:3002`; port `8010` is backend diagnostics only. Do not edit Docker Compose files or local environment files.

## Review Routes

- Player: `/play`, `/leaderboard`, and `/account`.
- Inceptivec Gamification Admin: `/inceptivec-gamification-admin`.
- Command Post: `/command-post`.

The access file contains one generated local identity for each audience. Verify each can reach its permitted surface and is denied from the other protected surface. The launcher also performs server-side denial checks; a browser redirect is not the authority boundary.

## Founder Review

1. Sign in as the Inceptivec administrator and inspect Campaign Designer. Add/select an asset, save a draft, reload it, and open the same-runtime preview.
2. Sign in as the Command Post customer. Confirm the organisation, maps, plan, members, scores, and profile are scoped to that organisation. Create or edit only its map.
3. Sign in as the player. Start the campaign, complete a level, use Continue, replay, return to menu, and verify score/lives/nukes continuity. Reach the Level 4 Boarding offer and return from Boarding to the shooter.
4. Complete a valid registered run and inspect leaderboard eligibility. Confirm anonymous play remains unranked.
5. Exercise logout for each audience and confirm the protected route returns to its sign-in gate.

Founder visual, functional, and acceptance decisions remain manual and pending until Michael records them.

## Failure Capture

Do not alter configuration to work around a review failure. Capture the failing URL, audience, action, browser console/network output, and a screenshot. Collect service logs with:

```powershell
docker compose logs --tail 200 web backend db
```

The diagnostic health endpoints are `http://localhost:3002/api/health` and `http://localhost:8010/api/v1/health/`.

## Status, Stop, Restart

```powershell
.\scripts\status-founder-review.ps1
.\scripts\stop-founder-review.ps1
.\scripts\start-founder-review.ps1
```

Stop and restart preserve the governed local database volume and local credentials. They do not remove volumes or require manual environment changes.
