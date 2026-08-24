# Environment Register

| Environment | Purpose | Branch relationship | Deployment state | Secrets source |
|---|---|---|---|---|
| local | developer/full-stack local runtime | any authorised work branch | Docker Compose groundwork | local `.env`, never committed |
| dev | integrated development | `dev` | provider binding to be commissioned | approved provider secret store |
| stage | release-candidate validation | `stage` | provider binding to be commissioned | approved provider secret store |
| production | Founder-authorised public runtime | `main` | not authorised | approved provider secret store |

Branch relationship does not itself prove deployment or acceptance.
