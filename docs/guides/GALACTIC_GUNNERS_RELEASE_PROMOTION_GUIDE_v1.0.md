# Galactic Gunners Release & Promotion Guide v1.0

## Branch authority

```text
feature/* → dev → stage → prod
```

`prod` is the release authority. `main` must not be recreated.

## Promotion principle

Promotion moves an already accepted source state forward. It is not the place to add new feature work or repair defects opportunistically.

## Feature → dev

Required before merge:

```text
bounded handoff complete
local == remote
worktree clean
POST_BOX active payload = 0
required local tests PASS
Docker/runtime evidence PASS
GitHub CI GREEN
CTO gate PASS
Founder acceptance where required
```

Merge using the exact reviewed head SHA.

## dev → stage

Stage is the integrated regression/UI/UX acceptance environment.

Before promotion:

- `dev` contains only accepted merged work;
- documentation/guides match the implementation;
- environment routing contract is current;
- CI on dev-equivalent promoted content is green;
- no known P0/P1 defect is intentionally promoted without explicit Founder/CTO decision.

Promotion target must contain the exact accepted dev content. No stage-only code edits.

## Stage purpose

Use stage for:

- full regression;
- UI/UX review;
- snagging;
- device/viewport matrix;
- admin security/access checks;
- level/config validation as H012 capabilities land;
- offline/degraded-backend checks;
- release-candidate evidence.

A stage pass does not automatically authorize prod.

## stage → prod

Required:

```text
stage regression PASS
UI/UX acceptance PASS
known P0/P1 = 0
security gate PASS
migration/backup/rollback evidence PASS
commercial metadata/legal/credits current
CTO release recommendation PASS
Founder release acceptance PASS
```

## Environment files

Each checkout/runtime environment uses an ignored `env.<environment>` file containing its exact URLs/routes and unique admin credentials.

Branch promotion and deployed-environment configuration are separate operations: do not invent a deployed URL merely because a branch exists.

## Rollback

Rollback must identify the previously accepted SHA/version and preserve evidence. Do not rewrite published level history or force-reset protected programme history as a substitute for a governed rollback.

## Release evidence

For every promotion record:

```text
source branch/SHA
target branch/pre-promotion SHA
target branch/post-promotion SHA
CI run/results
runtime URL if deployed
environment config identity (never secret values)
known defects
acceptance authority
rollback coordinate
```
