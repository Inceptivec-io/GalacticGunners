$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)
$env:COMPOSE_PROJECT_NAME = 'galactic-gunners-founder-review'
docker compose down
