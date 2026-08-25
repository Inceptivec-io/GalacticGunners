# Handoff 008 Local Quality Results

Handoff: `GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_008`

Branch: `feature/architecture-hardening-reconciliation`

Entry/base SHA: `c49a3108e7084daa1872c15fa3d6641af60c6f2a`

## Results

| Check | Command | Result |
|---|---|---|
| Django system check | `py -3.13 manage.py check --settings=config.settings.local` | PASS |
| Django migration check | `py -3.13 manage.py makemigrations --check --settings=config.settings.local` | PASS - no changes detected |
| Backend tests | `py -3.13 -m pytest -q` | PASS - 11 passed |
| Contract validation | `npm run contracts:validate` | PASS |
| Game typecheck | `npm run game:typecheck` | PASS |
| Game unit tests | `npm run game:test` | PASS - 2 passed |
| Web typecheck | `npm run web:typecheck` | PASS |
| Web production build | `npm run web:build` | PASS |
| Aggregate quality | `npm run quality` | PASS |

## Notes

- Initial separate `web:build` execution collided with the simultaneous aggregate Next build. The aggregate `npm run quality` build completed successfully and is the recorded quality authority.
- Next.js 16 generated route type references; `apps/web` typecheck now runs `next typegen && tsc --noEmit`.
