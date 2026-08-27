# H015 Carry-Forward From H014

Status: planning-only. This is not H015 execution authority.

H014 closeout result: `FOUNDER ACCEPTED — KNOWN PLATFORM AND RUNTIME ITEMS DEFERRED TO H015`.

## H015 Entry Gate

Founder must merge PR #11 into `dev`. H015 must then start on a fresh branch created from the updated `dev` branch. No H015 work is to continue on `feature/v1-boarding-mode`.

## Founder-Prioritized Carry-Forward

1. Require explicit login before any privileged administration interface is shown.
2. Restore Campaign Designer level-data retrieval.
3. Populate the administration level list and asset previews.
4. Load distinct level configurations rather than repeating levels.
5. Preserve campaign score when Continue is selected.
6. Preserve campaign score, lives, nukes and progression across the campaign.
7. Make Shooter and Boarding layouts database-backed, versioned configurations.
8. Permit anonymous play while preventing anonymous leaderboard-score publication.
9. Offer account creation/login with a unique username so registered players can save a server-validated score.
10. Provide a simple administration backend for users/IAM, level configuration, scores/top ten, and audit/runtime logs.
11. Visibly integrate production artwork into both the game and administration previews.
12. Review and complete the remaining Boarding runtime, server-authority and end-to-end evidence gaps.

## H015 Boundaries

- Initial roles are administrator and player only.
- Use the existing identity system for standard secure username/password login.
- Do not introduce enterprise SSO, a complex IAM hierarchy or unnecessary services.
- Administration navigation is limited initially to Campaign, Users, Scores and Logs.
- H015 evidence must cover complete browser and API player and administrator flows.
- The accepted Campaign Designer shell is not to be redesigned.
