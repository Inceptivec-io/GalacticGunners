# DATABASE / MIGRATION SPECIFICATION

PostgreSQL is authoritative.

## Required

- create initial or corrective migrations for all production models;
- migrations must be committed;
- `makemigrations --check` must produce no pending model drift after generation;
- migration from empty database must succeed;
- Django system check must pass;
- tests must run against a real supported database path where practical.

## Apps

Expected model-owning apps:

```text
accounts
players
game_runs
leaderboard
```

Do not introduce a generic `core_models` app duplicating domain ownership.

## Migration discipline

Each schema change must have:

```text
MODEL CHANGE
+
MIGRATION
+
CONTRACT CHANGE IF EXTERNAL
+
TEST
+
CURRENTNESS UPDATE
```

Do not edit applied migration history merely to make tests pass.

Since this is pre-production foundation and no persistent commercial data is established, a clean initial migration reconciliation is permitted if necessary and clearly evidenced. Do not assume permission to rewrite migrations after promotion.
