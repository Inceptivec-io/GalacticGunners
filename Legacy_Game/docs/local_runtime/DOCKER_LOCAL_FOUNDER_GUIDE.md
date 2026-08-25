# Galactic Gunners Docker Local Founder Guide

## PREREQUISITES

- Docker Desktop installed/running
- Repository path: `C:\Users\Michael\dev\GalacticGunners`
- Required branch: `feature/GG-COM-001`

## START COMMAND

```powershell
cd C:\Users\Michael\dev\GalacticGunners
docker compose up --build
```

## STOP COMMAND

```powershell
docker compose down
```

## REBUILD COMMAND

```powershell
docker compose build
docker compose up
```

## CLEAN REBUILD COMMAND

```powershell
docker compose down
docker compose build --no-cache
docker compose up
```

## LOCAL URL

`http://localhost:8027`

## EXPECTED CONTAINER NAME

`galactic-gunners-founder-local`

## EXPECTED SERVICE NAME

`galactic-gunners`

## LOG COMMAND

```powershell
docker compose logs -f galactic-gunners
```

## HOW TO CONFIRM CONTAINER HEALTH

```powershell
docker inspect galactic-gunners-founder-local --format '{{.State.Status}} {{if .State.Health}}{{.State.Health.Status}}{{end}}'
```

Expected result after startup: `running healthy`

## HOW TO CONFIRM CURRENT FEATURE SHA

```powershell
git branch --show-current
git rev-parse HEAD
git rev-parse origin/feature/GG-COM-001
```

Expected branch: `feature/GG-COM-001`

## HOW TO TROUBLESHOOT PORT CONFLICT

If Docker reports that port `8027` is already allocated, stop the conflicting local service or temporarily edit `docker-compose.yml` to map another unused host port to container port `80`, for example:

```yaml
ports:
  - "8028:80"
```

Then open `http://localhost:8028`.

## HOW TO TROUBLESHOOT ASSET 404

Run:

```powershell
docker compose logs galactic-gunners
powershell -ExecutionPolicy Bypass -File tools\verify_docker_founder_runtime.ps1
```

If a specific asset reports HTTP 404, confirm the file exists in the repository under `assets\` and rebuild with:

```powershell
docker compose down
docker compose up --build
```

## HOW TO TROUBLESHOOT STALE DOCKER CACHE

Run:

```powershell
docker compose down
docker compose build --no-cache
docker compose up
```

Then hard-refresh the browser tab for `http://localhost:8027`.

## OPTIONAL VERIFICATION COMMAND

With the service running in another terminal:

```powershell
powershell -ExecutionPolicy Bypass -File tools\verify_docker_founder_runtime.ps1
```

This checks the Docker service, game root, core JavaScript, owned branding, owned sprites, owned background, and owned nuke audio over HTTP.

## FOUNDER ACCEPTANCE CHECKLIST

Founder visual acceptance remains manual.

Current required state:

```text
FOUNDER_VISUAL_ACCEPTANCE = PENDING
```

- [ ] main menu appearance
- [ ] Galactic Gunners branding
- [ ] owned background
- [ ] player sprite
- [ ] scout
- [ ] cruiser
- [ ] destroyer
- [ ] boss/mothership
- [ ] asteroid/comet
- [ ] explosion
- [ ] nuke visual
- [ ] nuke sound
- [ ] sound/mute UI
- [ ] info screen
- [ ] pause/resume
- [ ] restart
- [ ] game-over
- [ ] victory
- [ ] typography/readability
- [ ] keyboard controls
- [ ] touch where practical
- [ ] Xbox controller if Founder attaches one
- [ ] Haute M-series controller if Founder attaches one
- [ ] browser console
- [ ] missing assets / HTTP 404
- [ ] desktop sizing
- [ ] general commercial visual quality
