# STEP 6 ACCEPTANCE

## Entry proof

```text
FOUNDATION_SHA = 5a522f7076a95ad5d0e17c3d7f79da11a7e0a6bc
DEV_UNIQUE_WORK_AT_ENTRY = 0
STAGE_UNIQUE_WORK_AT_ENTRY = 0
MAIN_UNIQUE_WORK_AT_ENTRY = 0
PROD_EXISTS_AT_ENTRY = NO
```

If changed, reconcile and report before continuing.

## Final branch truth

```text
DEV_EXISTS = PASS
STAGE_EXISTS = PASS
PROD_EXISTS = PASS
MAIN_EXISTS = NO

DEFAULT_BRANCH = prod

ACCEPTED_FOUNDATION_CONTAINED_IN_DEV = PASS
DEV_STATE_CONTAINED_IN_STAGE = PASS
STAGE_STATE_CONTAINED_IN_PROD = PASS

UNEXPLAINED_DIVERGENCE = 0
FORCE_PUSH_USED = NO
HISTORY_REWRITE_USED = NO
```

## Quality

Final promoted state must pass:

```text
npm ci
npm run quality

backend:
check
makemigrations --check
migrate/test path
pytest

docker compose config
docker build/smoke

GitHub Actions:
backend SUCCESS
client-and-game SUCCESS
docker-smoke SUCCESS
```

## Branch-reference audit

Search repository active/current files for:

```text
main
master
```

Classify every occurrence.

Historical/evidence references are allowed when explicitly historical.

Active branch authority references to `main`:

```text
0
```

## Boundaries

```text
Legacy_Game mutated = NO
asset runtime integration performed = NO
v1.0 gameplay started = NO
commercial release claimed = NO
prod deployment performed without separate authority = NO
governance debt count = 0
```
