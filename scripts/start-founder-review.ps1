[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$branch = git branch --show-current
if ($branch -ne 'feature/v1-platform-foundation-campaign-continuity') { throw "Founder review requires the H015 feature branch; found $branch." }
if (git status --porcelain) { throw 'Founder review requires a clean worktree; no files were changed.' }
$sourceSha = (git rev-parse HEAD).Trim()
$envFile = Join-Path $root '.founder-review.env'
if (-not (Test-Path $envFile)) {
  $password = [Convert]::ToBase64String((1..24 | ForEach-Object { Get-Random -Maximum 256 })) -replace '[^A-Za-z0-9]', 'A'
  @("FOUNDER_REVIEW_MODE=true", 'FOUNDER_REVIEW_USERNAME=founder-review', "FOUNDER_REVIEW_PASSWORD=$password", 'FOUNDER_REVIEW_DISPLAY_NAME=Founder Review', "SOURCE_SHA=$sourceSha", "BUILD_ID=$sourceSha", 'NEXT_PUBLIC_API_BASE_URL=/api/v1', 'INTERNAL_API_ORIGIN=http://backend:8000') | Set-Content -LiteralPath $envFile -Encoding ascii
}
$values = Get-Content -LiteralPath $envFile | ConvertFrom-StringData
docker compose --env-file $envFile up --build -d
docker compose --env-file $envFile exec -T backend python manage.py migrate --noinput
docker compose --env-file $envFile exec -T backend python manage.py seed_service_plans
docker compose --env-file $envFile exec -T backend python manage.py seed_runtime_authority
docker compose --env-file $envFile exec -T backend python manage.py bootstrap_founder_review
$health = Invoke-RestMethod 'http://localhost:3002/api/v1/health/'
$build = Invoke-RestMethod 'http://localhost:3002/api/v1/system/build/'
if ($health.status -ne 'ok' -or $build.source_sha -ne $sourceSha) { throw 'Founder review environment provenance or health check failed.' }
$access = @("Source SHA: $sourceSha", "Product/play: http://localhost:3002/play", 'Inceptivec admin: http://localhost:3002/inceptivec-gamification-admin', 'Command Post: http://localhost:3002/command-post', 'Leaderboard: http://localhost:3002/leaderboard', "Product-admin username: $($values.FOUNDER_REVIEW_USERNAME)", "Product-admin password: $($values.FOUNDER_REVIEW_PASSWORD)")
$access | Set-Content -LiteralPath (Join-Path $root 'FOUNDER_REVIEW_ACCESS.local.txt') -Encoding ascii
Write-Output 'FOUNDER_REVIEW_READY=NO - full H015 browser, tenant, campaign, score-claim and Boarding gates remain required.'
