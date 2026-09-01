$ErrorActionPreference = 'Stop'
$env:COMPOSE_PROJECT_NAME = 'galactic-gunners-dev'
Set-Location (Split-Path -Parent $PSScriptRoot)
docker compose --env-file .dev.env down
