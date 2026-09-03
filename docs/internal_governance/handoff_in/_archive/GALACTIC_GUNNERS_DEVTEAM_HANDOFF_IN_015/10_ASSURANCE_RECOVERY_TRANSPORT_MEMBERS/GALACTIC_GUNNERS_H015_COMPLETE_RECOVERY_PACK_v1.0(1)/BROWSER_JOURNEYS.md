# Mandatory Ordinary-User Browser Journeys

1. Root → Play → two-second splash → focused Phaser Main Menu; internal navigation does not replay splash.
2. Main Menu → ordinary Level 1 → pause → frozen state → keyboard resume → touch resume → Main Menu exit.
3. Level 1 ordinary combat: enemies, hazards, shield damage, scoring, result layout and Continue.
4. Designer: login → open published CORE level → create draft → move object → alter formation → alter enemy composition → alter recurring hazard → save → full refresh/relogin → reopen → exact-checksum preview.
5. Publication: publish the same draft → start new ordinary campaign → observe all changes → prove pre-existing campaign remains pinned → rollback as new version → prove restored new campaign.
6. Levels 1–6: direct safe preview and ordinary campaign progression through final Level 6 victory without force hooks.
7. Level 4 Continue: decline Boarding → resume exact Shooter checkpoint → prevent immediate offer loop → finish → Continue to next pinned entry.
8. Level 4 Board: enter visible airlock → physical traversal/combat → complete objective → reach separate exit → return exact Shooter checkpoint → finish level.
9. Boarding pause/abort: ESC opens choices → resume; repeat → confirm abort → return checkpoint without re-entry loop.
10. Boarding failure: death and API failure produce safe governed outcomes.
11. Hazards: normal play shows repeated asteroid/comet spawn, varied directions/speeds, rotation/orientation, max active, collision, projectile destruction and despawn.
12. Authentication: admin, Command Post and player login; hostile `next` values rejected; player logout invalidates session; cross-role and cross-organisation attempts denied.
13. Expandability: publish six-level and seven-level releases; reject gapped and duplicate sequence; final victory follows pinned final entry.

Each journey records setup, visible actions, assertions, exact SHA, relevant API transcript, console/network results, trace and distinct captures. A diagnostic setup may seed deterministic data before the journey, but cannot perform the behaviour being claimed.
