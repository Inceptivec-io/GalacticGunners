$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)
$env:COMPOSE_PROJECT_NAME = 'galactic-gunners-founder-review'
$sourceSha = (git rev-parse HEAD).Trim()
$remoteSha = (git rev-parse '@{u}').Trim()
if ((git branch --show-current) -ne 'feature/v1-platform-foundation-campaign-continuity') { throw 'Founder review status requires the H015 feature branch.' }
if ($sourceSha -ne $remoteSha) { throw 'Founder review status found local/remote divergence.' }
docker compose ps
$health = Invoke-RestMethod 'http://localhost:3002/api/v1/health/'
$build = Invoke-RestMethod 'http://localhost:3002/api/v1/system/build/'
if ($health.status -ne 'ok' -or $build.source_sha -ne $sourceSha) { throw 'Founder review status found unhealthy or stale container provenance.' }
$health | ConvertTo-Json -Compress
$build | ConvertTo-Json -Compress
Write-Output 'FOUNDER_REVIEW_GATES=PASS'
Write-Output 'FOUNDER_REVIEW_READY=NOT_REEVALUATED'
Write-Output 'Run .\scripts\start-founder-review.ps1 to execute the full readiness gate.'
$env:COMPOSE_PROJECT_NAME = 'galactic-gunners-founder-review'
