# CI / DOCUMENTATION / GOVERNANCE ALIGNMENT

Refine existing authorities, including as applicable:

- `.github/workflows/quality.yml`
- `README.md`
- `AGENTS.md`
- `docs/internal_governance/standards/`
- `docs/internal_governance/guides/`
- `docs/internal_governance/currentness/`
- `docs/internal_governance/registers/`

Permanent active branch model:

`feature/* -> dev -> stage -> prod`

CI must remain active for:
- pull requests;
- `dev`;
- `stage`;
- `prod`;

as appropriate to the existing quality workflow.

Remove `main` from active branch triggers after cutover.

Do not weaken:
- backend checks;
- migrations;
- pytest;
- client/game quality;
- contract validation;
- web build;
- Docker smoke.

Repository documentation must state:

```text
DEFAULT BRANCH = prod
DEVELOPMENT INTEGRATION = dev
RELEASE CANDIDATE = stage
PRODUCTION AUTHORITY = prod
main = RETIRED / DELETED
```

Update currentness after actual branch changes, not before.

Required:

`GOVERNANCE_DEBT_COUNT = 0`
