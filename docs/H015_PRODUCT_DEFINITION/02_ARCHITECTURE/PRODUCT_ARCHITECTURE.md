# Product Architecture

Galactic Gunners is one connected product: Next.js provides the public/player
shell, Command Post and protected operational surfaces; Phaser owns interactive
Shooter and Boarding runtime; Django/DRF owns identity, content, runs, score
validation and audit; PostgreSQL owns persistent state.

The model is bound by `01_AUTHORITY/LOCKED_FOUNDER_CEO_COAI_PRODUCT_MODEL_VERBATIM.md`.
Implementation paths include `apps/web/`, `game/` and `backend/`.
