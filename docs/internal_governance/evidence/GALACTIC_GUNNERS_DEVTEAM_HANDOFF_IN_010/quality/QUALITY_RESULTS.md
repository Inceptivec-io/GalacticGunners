# Handoff 010 Quality Results

Handoff:
`GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010`

Branch:
`feature/v1-level1-vertical-slice`

## Node / Web / Game

`npm run quality`

Result:
PASS

Coverage:
- canonical asset sync: PASS, 17 assets;
- contract validation: PASS;
- game typecheck: PASS;
- game tests: PASS, 6/6;
- web typecheck: PASS;
- web production build: PASS;
- routes emitted: `/`, `/api/health`, `/play`.

## Backend

Executed with Python 3.13:

- `py -3.13 manage.py check`: PASS;
- `py -3.13 manage.py makemigrations --check --dry-run`: PASS, no changes detected;
- `py -3.13 -m pytest`: PASS, 11/11.

Initial Python 3.12 attempt failed because the backend declares `requires-python >=3.13`; verification was rerun under Python 3.13.

## Browser / Runtime

`npm run runtime:verify`

Result:
PASS

Evidence:
- `docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010/browser_runtime/runtime-verification.json`
- screenshots `01-main-menu.png`, `02-level1-start.png`, `03-after-scout-collision.png`

Assertions:
- one Phaser canvas: PASS;
- Level 1 started: PASS;
- player-laser/scout collision scored: PASS;
- scout count decremented: PASS;
- console errors: 0;
- network failures / HTTP 4xx or 5xx: 0.

Additional hostile sweep:
- screenshot `04-hostile-sweep.png`;
- sustained keyboard movement: PASS;
- player bounded: PASS;
- collisions scored: PASS;
- player damage/failure path exercised: PASS;
- console errors: 0;
- network failures / HTTP 4xx or 5xx: 0.
