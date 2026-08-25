# PERMANENT BRANCH MODEL

```text
feature/*
   ↓
dev
   ↓
stage
   ↓
prod
```

## feature/*

Bounded implementation branches only.

## dev

Integrated development authority.

Normal future feature branches originate from current `dev`.

## stage

Release-candidate / pre-production validation authority.

No independent product development.

## prod

Production/release authority.

After this sprint:

```text
REPOSITORY DEFAULT BRANCH = prod
```

`prod` is the permanent successor to `main`.

Creating `prod` does NOT itself mean v1.0 has been commercially released.

## main

`main` is obsolete after successful cutover.

At sprint exit:

```text
main = DELETED
```

No compatibility alias is required unless an external dependency is discovered during reconciliation. If such a dependency exists, STOP before deletion and report it.
