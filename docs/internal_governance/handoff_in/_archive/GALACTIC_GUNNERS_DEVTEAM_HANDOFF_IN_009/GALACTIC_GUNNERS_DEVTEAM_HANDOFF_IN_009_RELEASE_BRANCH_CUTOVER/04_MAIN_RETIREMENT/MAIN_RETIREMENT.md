# MAIN RETIREMENT GATES

Before deleting `main`, prove all:

```text
MAIN_TIP =
87923524833b737c7e3bf1764dde0b6ebf495e62
or a newly reconciled explicitly explained coordinate

MAIN_UNIQUE_COMMITS_OUTSIDE_PROD_LINEAGE = 0

MAIN_HISTORY_CONTAINED_IN_PROD = PASS

MAIN_OPEN_PR_DEPENDENCY = 0
or every dependency retargeted safely

MAIN_ACTIVE_CI_REFERENCE = 0

MAIN_ACTIVE_DEPLOYMENT_REFERENCE = 0

MAIN_ACTIVE_DOCUMENTATION_AUTHORITY = 0

MAIN_ACTIVE_BRANCH_PROTECTION_DEPENDENCY = 0

DEFAULT_BRANCH = prod

PROD_HEALTH = PASS

RECOVERY_SHA_RECORDED = PASS
```

Only then:

```text
DELETE REMOTE main
```

After deletion verify:

```text
REMOTE main = ABSENT
DEFAULT BRANCH = prod
prod HEAD resolves
dev resolves
stage resolves
```

No placeholder `main` branch should remain.
