# CTO PRECHECK

Observed immediately before commission.

Accepted hardened foundation:

`feature/production-architecture-foundation`
`5a522f7076a95ad5d0e17c3d7f79da11a7e0a6bc`

Existing `dev`:

`5b91bed73ce8846ec577575dab10de1527084820`

Observed comparison:

```text
foundation ahead of dev = 14
foundation behind dev = 0
merge-base = dev HEAD
```

Existing `stage`:

`5b91bed73ce8846ec577575dab10de1527084820`

Existing `prod`:

```text
DOES NOT EXIST
```

Existing `main`:

`87923524833b737c7e3bf1764dde0b6ebf495e62`

Observed comparison:

```text
foundation ahead of main = 35
foundation behind main = 0
merge-base = main HEAD
```

Repository default branch at entry:

`main`

Interpretation at precheck:

- `dev` has no observed unique work outside accepted foundation lineage.
- `stage` starts on same old convergence coordinate as `dev`.
- `main` has no observed unique work outside accepted foundation lineage.
- `prod` must be established.

Development MUST independently re-run ancestry/unique-work proof before any branch mutation.

If any branch has moved or has unique work:

`STOP — BRANCH_STATE_MISMATCH`
