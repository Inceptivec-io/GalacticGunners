# Docker Founder Local Runtime Config Inventory

Handoff: `GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_002`

Purpose: local Docker runtime for Founder manual visual and functional acceptance of the current IP Freedom integration.

## Runtime Files

| File | Purpose | SHA-256 |
|---|---|---|
| `Dockerfile` | Nginx static container serving `index.html` and `assets/` from the repository. | `F3534D6FDA7BDDED5CC07ABAF382DA43BA99A1CEB14E3402AC1F57B65FEB6776` |
| `docker-compose.yml` | Founder command surface; service `galactic-gunners`, container `galactic-gunners-founder-local`, host port `8027`. | `AFCEBBFE10215D360075A31B6DB96C1900EEADF0F5E425FFD00998D443291FE6` |
| `.dockerignore` | Excludes Git, external boundary, archived governance/evidence, testing fixtures and packaged archives from Docker build context. | `B4770BFFC55E7A25649B33E33A0F932540FD80A2B24EEBFBAA87112F41FA4082` |
| `tools/verify_docker_founder_runtime.ps1` | Optional Founder/development verification helper for container state, HTTP root and core asset reachability. | `F5D82F605459E97C7376236753CAE0F4210249B8FDA3E7FFED66B1835352FB66` |
| `docs/local_runtime/DOCKER_LOCAL_FOUNDER_GUIDE.md` | Founder-operable local Docker guide and acceptance checklist. | `285B8C2ED73B9F5A8BAD6E75FA9671C77DDD989DDEA06945F155C275BAFB5622` |

## Runtime Model

- Static web server only.
- Base image: `nginx:1.27-alpine`.
- Container port: `80`.
- Host URL: `http://localhost:8027`.
- No database.
- No Supabase.
- No backend application framework.
- No reverse proxy stack.
- No gameplay or asset changes.

