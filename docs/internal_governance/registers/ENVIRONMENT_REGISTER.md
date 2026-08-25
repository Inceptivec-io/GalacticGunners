# Environment Register

| Environment | Purpose | Branch relationship | Deployment state | Secrets source |
|---|---|---|---|---|
| local | developer/full-stack local runtime | any authorised work branch | Docker Compose groundwork | local `.env`, never committed |
| dev | integrated development | `dev` | provider binding to be commissioned | approved provider secret store |
| stage | release-candidate validation | `stage` | provider binding to be commissioned | approved provider secret store |
| production | Founder-authorised public runtime | `prod` | not authorised | approved provider secret store |
| local Docker web | host `3002` -> container `3000` | `feature/architecture-hardening-reconciliation` | Handoff 008 verified | no secrets; public API URL only |
| local Docker backend | host `8010` -> container `8000` | `feature/architecture-hardening-reconciliation` | Handoff 008 verified | local `.env`, never committed |
| local Docker database | internal Postgres `5432` | `feature/architecture-hardening-reconciliation` | Handoff 008 verified | local `.env`, never committed |

Branch relationship does not itself prove deployment or acceptance.
