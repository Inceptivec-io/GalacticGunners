# Founder Local Review Guide — Required Final Form

Development must commit `docs/internal_governance/guides/FOUNDER_LOCAL_REVIEW_GUIDE.md` with this short, exact structure and current commands. It must not ask the Founder to edit `.env`, guess a password, choose a port or determine which branch/container is running.

## 1. Start

From repository root in PowerShell:

```powershell
.\scripts\start-founder-review.ps1
```

Continue only if the final line says:

```text
FOUNDER_REVIEW_READY=YES
```

Open ignored `FOUNDER_REVIEW_ACCESS.local.txt` for the exact SHA, URLs and product-admin credentials.

## 2. Only use these product origins

- Product/play: `http://localhost:3002/play`
- Inceptivec admin: `http://localhost:3002/inceptivec-gamification-admin`
- Command Post: `http://localhost:3002/command-post`
- Leaderboard: `http://localhost:3002/leaderboard`

Port 8010 is backend diagnostics/technical local Django Admin only. `/play` on 8010 is not a product route.

## 3. Review order

1. Open internal admin in a new incognito window: explicit branded login must appear before any admin shell.
2. Login with the generated product-admin credentials.
3. Review Overview, Campaigns, Businesses, Users, Scores and Logs.
4. Open Designer; confirm six distinct levels, image chooser, drag/drop, real images, save/validate/preview.
5. Logout; confirm protected admin is inaccessible.
6. Open Command Post; confirm customer login and organisation-only pages. Use separately generated customer fixture credentials listed in the access file.
7. Confirm Command Post cannot reach CORE/global administration or another organisation.
8. Play Levels 1–2: confirm different layout/hazards and cumulative score/lives/nukes after Continue.
9. Test Replay, Main Menu/Resume and death/Game Over; no silent reload/reset.
10. Test anonymous validated result, registration/login, score claim and leaderboard.
11. Reach Level 4 Boarding; test entry and exact return.

## 4. Status and stop

```powershell
.\scripts\status-founder-review.ps1
.\scripts\stop-founder-review.ps1
```

Stop preserves the database volume for further review.

## 5. Reporting

For a failure, send the displayed Source SHA, URL, visible message and screenshot. The guide must explain how to export console/network evidence with one supplied script; the Founder is not expected to diagnose CORS, cookies or container drift.

