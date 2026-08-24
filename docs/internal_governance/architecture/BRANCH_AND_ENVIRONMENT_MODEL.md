# Branch and Environment Model

## Branch promotion

```text
feature/*
   ↓
dev
   ↓
stage
   ↓
main
```

- Feature branches are bounded semantic work branches.
- `dev` is the shared integration branch.
- `stage` is the promoted release-candidate validation branch.
- `main` is the Founder-authorised release line.

Branch promotion is not automatically an environment deployment.

## Environments

```text
local
 dev
 stage
 production
```

Environment configuration/credentials remain explicit and separately governed. A branch name does not itself prove that an environment is deployed or accepted.
