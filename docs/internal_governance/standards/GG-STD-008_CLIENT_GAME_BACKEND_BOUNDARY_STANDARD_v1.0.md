# GG-STD-008 Client, Game and Backend Boundary Standard v1.0

- React/Next.js shall not become the gameplay engine.
- Phaser shall not own authentication/database/entitlement authority.
- Browser/game code shall not hold privileged secrets.
- Django is authoritative for identity, player state, GameRun validation and leaderboard admission.
- Internal refactors shall not silently alter external contracts.
