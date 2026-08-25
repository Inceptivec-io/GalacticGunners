# Docker Founder Acceptance Runtime Evidence

Handoff: `GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_002`

Scope: Docker local runtime enablement only. Founder visual acceptance remains manual.

## Tested Branch And SHA

- Branch: `feature/GG-COM-001`
- Runtime-tested SHA: `77e221d43165b7825501cb7815599c68a0238605`
- Local URL tested: `http://localhost:8027/`

## Docker Build Result

Command:

```powershell
docker compose build --no-cache
```

Result: PASS

Evidence summary:

```text
Image galacticgunners-galactic-gunners Built
Dockerfile transferred
.dockerignore transferred
Runtime context copied: index.html, assets, LICENSE, README.md, THIRD_PARTY_NOTICES.md
Image tagged: docker.io/library/galacticgunners-galactic-gunners:latest
```

## Container Startup Evidence

Command:

```powershell
docker compose up -d
docker compose ps
docker inspect galactic-gunners-founder-local --format '{{.State.Status}} {{if .State.Health}}{{.State.Health.Status}}{{end}}'
```

Result: PASS

Evidence:

```text
SERVICE: galactic-gunners
CONTAINER: galactic-gunners-founder-local
STATUS: Up / healthy
PORTS: 0.0.0.0:8027->80/tcp, [::]:8027->80/tcp
INSPECT: running healthy
```

## Local HTTP Result

Command:

```powershell
powershell -ExecutionPolicy Bypass -File tools\verify_docker_founder_runtime.ps1
```

Result: PASS

Evidence:

```text
Container: running|healthy
HTTP 200 http://localhost:8027/
HTTP 200 http://localhost:8027/index.html
HTTP 200 http://localhost:8027/assets/js/phaser.js
HTTP 200 http://localhost:8027/assets/js/game.js
HTTP 200 http://localhost:8027/assets/images/owned/branding/gg_logo_primary_v001.png
HTTP 200 http://localhost:8027/assets/images/owned/branding/gg_menu_titlecard_v001.png
HTTP 200 http://localhost:8027/assets/images/owned/branding/gg_symbol_v001.png
HTTP 200 http://localhost:8027/assets/images/owned/backgrounds/gg_starfield_16x9_v001.png
HTTP 200 http://localhost:8027/assets/images/owned/sprites/gg_player_v001_sheet.png
HTTP 200 http://localhost:8027/assets/images/owned/sprites/gg_scout_v001_sheet.png
HTTP 200 http://localhost:8027/assets/images/owned/sprites/gg_cruiser_v001_sheet.png
HTTP 200 http://localhost:8027/assets/images/owned/sprites/gg_destroyer_v001_sheet.png
HTTP 200 http://localhost:8027/assets/images/owned/sprites/gg_boss_v001_sheet.png
HTTP 200 http://localhost:8027/assets/images/owned/sprites/gg_asteroid_v001.png
HTTP 200 http://localhost:8027/assets/images/owned/sprites/gg_comet_v001.png
HTTP 200 http://localhost:8027/assets/images/owned/sprites/gg_explosion_v001_sheet.png
HTTP 200 http://localhost:8027/assets/images/owned/sprites/gg_nuke_v001_sheet.png
HTTP 200 http://localhost:8027/assets/audio/gg_nuke_v001.wav
Branch: feature/GG-COM-001
Current SHA: 77e221d43165b7825501cb7815599c68a0238605
Founder Docker runtime verification: PASS
```

## Browser Console / Network Result

Command:

```powershell
node docs\internal_governance\evidence\GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_002\docker_founder_acceptance\check_docker_browser_console.mjs
```

Result: PASS

Detailed result file:

`docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_002/docker_founder_acceptance/browser-console-network-result.json`

Summary:

```text
Runtime URL: http://localhost:8027/
Console exceptions: 0
Network failures: 0
HTTP 4xx/5xx responses: 0
Expected Phaser texture keys present: PASS
```

The Phaser version banner was present as a normal console log.

## Stop / Restart Result

Stop command:

```powershell
docker compose down
```

Stop result: PASS

Restart command:

```powershell
docker compose up -d
```

Restart result: PASS

Final stop command executed after verification:

```powershell
docker compose down
```

Final stopped-state proof:

```text
docker compose ps
NAME      IMAGE     COMMAND   SERVICE   CREATED   STATUS    PORTS
```

## POST_BOX Status

POST_BOX was not used or mutated for Docker runtime enablement.

Boundary inventory remains persistent boundary controls only:

```text
_EXTERNAL_GalacticGunners/BOUNDARY.md
_EXTERNAL_GalacticGunners/README.md
_EXTERNAL_GalacticGunners/_GalacticGunners_MAIN_POST_BOX/BOUNDARY.md
_EXTERNAL_GalacticGunners/_GalacticGunners_MAIN_POST_BOX/README.md
_EXTERNAL_GalacticGunners/_GalacticGunners_MAIN_POST_BOX/_WORK_00000001_POST_BOX/BOUNDARY.md
_EXTERNAL_GalacticGunners/_GalacticGunners_MAIN_POST_BOX/_WORK_00000001_POST_BOX/README.md
```

Active POST_BOX payload: `0`

## Acceptance Boundary

```text
DOCKER_LOCAL_FOUNDER_ACCEPTANCE_RUNTIME = AVAILABLE
FOUNDER_VISUAL_ACCEPTANCE = PENDING
```

Development did not mark the visual design commercially accepted.
