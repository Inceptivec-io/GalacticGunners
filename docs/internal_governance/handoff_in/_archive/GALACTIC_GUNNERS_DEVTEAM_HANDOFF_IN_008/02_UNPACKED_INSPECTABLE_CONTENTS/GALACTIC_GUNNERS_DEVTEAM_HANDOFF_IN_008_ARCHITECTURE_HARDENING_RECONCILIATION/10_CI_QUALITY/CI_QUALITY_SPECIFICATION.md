# CI / QUALITY SPECIFICATION

REFINE EXISTING:

`.github/workflows/quality.yml`

and root `package.json`.

## Root quality command

`npm run quality` must become an authoritative aggregate for the JS/TS/contract surfaces, not a partial check.

It should include, as applicable:

```text
game typecheck
game tests
web typecheck
web build
contract validation
```

Avoid running expensive duplicate stages unnecessarily, but local and CI gates must be semantically equivalent.

## Backend quality

CI backend job must include:

```text
dependency install
python formatting/lint if configured
Django system check
makemigrations --check
pytest
```

## Client/game quality

Must include:

```text
deterministic npm install (`npm ci` once lockfile is authoritative)
contract validation
game typecheck
web typecheck
web build
tests where present
```

## Docker CI

Add a bounded Docker integration/smoke job or equivalent verification where practical.

It must prove the composed stack can build/start and health endpoints respond.

If runtime constraints make GitHub-hosted Docker smoke unsuitable, document and evidence the alternative. Do not silently omit full-stack proof.

## Branch references

Current workflow references to `main` must be reviewed against the programme direction:

```text
feature/* -> dev -> stage -> prod
```

Do NOT retire `main` in this sprint.

Where a future `prod` reference is needed, prepare standards/currentness without prematurely changing the repository default branch or release system.

The final branch transition is a later controlled movement.
