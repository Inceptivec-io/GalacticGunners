# Handoff 010 Docker Results

Handoff:
`GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_010`

Commands verified:

- `docker compose config`: PASS;
- `docker compose build`: PASS;
- `docker compose up -d`: PASS;
- final `docker compose build web`: PASS;
- final `docker compose up -d web`: PASS.

Final healthy services:

```text
galacticgunners-db-1        healthy
galacticgunners-backend-1   healthy, 0.0.0.0:8010->8000
galacticgunners-web-1       healthy, 0.0.0.0:3002->3000
```

HTTP checks:

- `http://localhost:3002/`: 200;
- `http://localhost:3002/play`: 200;
- `http://localhost:8010/api/v1/health/`: 200;
- `http://localhost:3002/gg-runtime-assets/manifest.json`: 200.

Founder preview URL:
`http://localhost:3002/play`

Stop command:
`docker compose down`
