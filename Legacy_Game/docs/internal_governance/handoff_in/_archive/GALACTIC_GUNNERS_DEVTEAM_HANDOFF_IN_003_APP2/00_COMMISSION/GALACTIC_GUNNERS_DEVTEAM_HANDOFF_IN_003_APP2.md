# GALACTIC GUNNERS
# DEVTEAM HANDOFF IN 003 APP2
## VISUAL FIDELITY + SPRITE CORRECTION + RESULT-SCREEN CONTROL + VIEWPORT RECONSTRUCTION

**HANDOFF ID:** `GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_003_APP2`  
**Parent lineage:** `DEVTEAM-003 → APP1 → APP2`  
**Product:** Galactic Gunners  
**Founder Acceptance / Merge Authority:** Michael Leese

---

# 1. PURPOSE

APP2 is a bounded corrective movement.

It exists because the current technically functioning runtime is still not visually faithful or commercially acceptable.

This movement corrects:

```text
SPRITE-SHEET USAGE
+
ANIMATION FIDELITY
+
COMET RENDERING
+
EXPLOSION RENDERING
+
PLAYFIELD SCALE
+
FULL-VIEWPORT COMPOSITION
+
RESULT-SCREEN CONTROL
+
SCORE-STATE CONSISTENCY
+
EDGE CONTAINMENT
```

APP2 is not a fresh visual redesign.

It must preserve the current Founder-supplied art direction and accepted APP1 audio estate.

---

# 2. REPOSITORY / BRANCH

Repository:

```text
C:\Users\Michael\dev\GalacticGunners
```

Remote:

```text
https://github.com/Inceptivec-io/GalacticGunners.git
```

Branch:

```text
feature/GG-COM-001
```

No new branch.
No new worktree.
No merge.

Before mutation:

- read root `AGENTS.md`;
- fetch origin;
- verify local feature branch;
- verify local HEAD == remote feature HEAD;
- verify no uncommitted implementation work;
- record exact APP2 entry HEAD;
- inventory current runtime before mutation.

If state cannot be reconciled:

```text
STOP — ENTRY_STATE_MISMATCH
```

---

# 3. ACCEPTED STATE TO PRESERVE

APP2 must not regress:

- Founder-supplied v002 visual asset estate;
- accepted APP1 audio estate;
- locked scoring model;
- comet +500 / +1 nuke reward;
- player damage/life behaviour;
- shield per-tile destruction;
- event-driven title/result architecture direction;
- Docker preview workflow;
- single active branch policy.

Founder acceptance remains pending.
