$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)
docker compose ps
Invoke-RestMethod 'http://localhost:3002/api/v1/health/' | ConvertTo-Json -Compress
Invoke-RestMethod 'http://localhost:3002/api/v1/system/build/' | ConvertTo-Json -Compress
