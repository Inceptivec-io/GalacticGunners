# GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_011_APP1_HOTFIX1

Entry SHA: `ac60eb016543b11cb28bdf4f57c6385625901ebb`

Scope completed: pooled player/enemy/nuke projectile activation now resets the Arcade body at the visible spawn coordinate and records the reset centre for swept collision. The correction also includes the Founder-directed Level 1 movement, speed, nuke, pause, and POST_BOX closure fixes recorded in current evidence.

Verification: `npm run game:typecheck` PASS; Docker build/start PASS; full hostile browser matrix PASS with no unexpected console or network failures.

Closure: POST_BOX boundary controls only. H012 has not started. Founder and CTO retain merge and next-gate authority. The exact final pushed SHA, local/remote equality, and return seal are recorded externally after this committed record is pushed, avoiding a Git self-referential SHA loop.
