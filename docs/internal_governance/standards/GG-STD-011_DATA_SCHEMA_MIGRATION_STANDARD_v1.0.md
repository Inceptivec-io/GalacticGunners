# GG-STD-011 Data Schema and Migration Standard v1.0

Django models + committed migrations are the authoritative database change history. Material schema changes require model change, migration, schema impact, forward/rollback treatment where feasible, tests and documentation in the same change. Direct unmanaged production DDL is prohibited outside a governed emergency procedure.
