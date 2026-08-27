[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
if ((git branch --show-current) -ne 'feature/v1-platform-foundation-campaign-continuity') { throw 'Founder review requires the H015 feature branch.' }
if (git status --porcelain) { throw 'Founder review requires a clean worktree; no files were changed.' }
$sourceSha = (git rev-parse HEAD).Trim()
$envFile = Join-Path $root '.founder-review.env'

function New-ReviewSecret { ([Convert]::ToBase64String((1..30 | ForEach-Object { Get-Random -Maximum 256 })) -replace '[^A-Za-z0-9]', 'A') }
function Read-ReviewEnvironment {
  $result = @{}
  Get-Content -LiteralPath $envFile | Where-Object { $_ -match '^[A-Z0-9_]+=' } | ForEach-Object { $name, $value = $_ -split '=', 2; $result[$name] = $value }
  return $result
}
function Set-ReviewValue([string]$name, [string]$value) {
  $lines = @(Get-Content -LiteralPath $envFile); $match = "^$([regex]::Escape($name))="
  if ($lines -match $match) { $lines = $lines | ForEach-Object { if ($_ -match $match) { "$name=$value" } else { $_ } } } else { $lines += "$name=$value" }
  Set-Content -LiteralPath $envFile -Value $lines -Encoding ascii
}
if (-not (Test-Path $envFile)) {
  $dbPassword = New-ReviewSecret
  @(
    'POSTGRES_DB=galactic_gunners', 'POSTGRES_USER=galactic_gunners', "POSTGRES_PASSWORD=$dbPassword", "DATABASE_URL=postgresql://galactic_gunners:$dbPassword@db:5432/galactic_gunners",
    "DJANGO_SECRET_KEY=$(New-ReviewSecret)", 'DJANGO_SETTINGS_MODULE=config.settings.local', 'DJANGO_DEBUG=true', 'DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,backend', 'DJANGO_CSRF_TRUSTED_ORIGINS=http://localhost:3002', 'ENABLE_DJANGO_ADMIN=false', 'FOUNDER_REVIEW_MODE=true',
    'FOUNDER_REVIEW_USERNAME=founder-review', "FOUNDER_REVIEW_PASSWORD=$(New-ReviewSecret)", 'FOUNDER_REVIEW_DISPLAY_NAME=Founder Review', 'COMMAND_POST_REVIEW_USERNAME=command-post-review', "COMMAND_POST_REVIEW_PASSWORD=$(New-ReviewSecret)", 'COMMAND_POST_REVIEW_DISPLAY_NAME=Command Post Review', 'COMMAND_POST_REVIEW_ORGANIZATION_SLUG=founder-demo',
    'PLAYER_REVIEW_USERNAME=player-review', "PLAYER_REVIEW_PASSWORD=$(New-ReviewSecret)", 'PLAYER_REVIEW_DISPLAY_NAME=Player Review', 'DJANGO_LOCAL_SUPERUSER_USERNAME=django-local-admin', "DJANGO_LOCAL_SUPERUSER_PASSWORD=$(New-ReviewSecret)",
    'NEXT_PUBLIC_API_BASE_URL=/api/v1', 'INTERNAL_API_ORIGIN=http://backend:8000', 'WEB_HOST_PORT=3002', 'BACKEND_HOST_PORT=8010', "SOURCE_SHA=$sourceSha", "BUILD_ID=$sourceSha"
  ) | Set-Content -LiteralPath $envFile -Encoding ascii
}
$existing = Read-ReviewEnvironment
if (-not $existing['POSTGRES_DB'] -or -not $existing['POSTGRES_USER'] -or -not $existing['POSTGRES_PASSWORD']) {
  $dbEnv = @{}
  $runningDb = docker compose ps -q db
  if ($runningDb) {
    (docker inspect $runningDb --format '{{range .Config.Env}}{{println .}}{{end}}') | ForEach-Object {
      if ($_ -match '^POSTGRES_(DB|USER|PASSWORD)=') { $name, $value = $_ -split '=', 2; $dbEnv[$name] = $value }
    }
  }
  if (-not $dbEnv['POSTGRES_DB']) { $dbEnv['POSTGRES_DB'] = 'galactic_gunners'; $dbEnv['POSTGRES_USER'] = 'galactic_gunners'; $dbEnv['POSTGRES_PASSWORD'] = New-ReviewSecret }
  foreach ($name in 'POSTGRES_DB','POSTGRES_USER','POSTGRES_PASSWORD') { if (-not $existing[$name]) { Set-ReviewValue $name $dbEnv[$name] } }
  Set-ReviewValue 'DATABASE_URL' "postgresql://$($dbEnv['POSTGRES_USER']):$($dbEnv['POSTGRES_PASSWORD'])@db:5432/$($dbEnv['POSTGRES_DB'])"
}
$reviewDefaults = @{
  'DJANGO_CSRF_TRUSTED_ORIGINS' = 'http://localhost:3002'; 'ENABLE_DJANGO_ADMIN' = 'false'; 'FOUNDER_REVIEW_MODE' = 'true';
  'COMMAND_POST_REVIEW_USERNAME' = 'command-post-review'; 'COMMAND_POST_REVIEW_DISPLAY_NAME' = 'Command Post Review'; 'COMMAND_POST_REVIEW_ORGANIZATION_SLUG' = 'founder-demo';
  'PLAYER_REVIEW_USERNAME' = 'player-review'; 'PLAYER_REVIEW_DISPLAY_NAME' = 'Player Review'; 'DJANGO_LOCAL_SUPERUSER_USERNAME' = 'django-local-admin';
  'NEXT_PUBLIC_API_BASE_URL' = '/api/v1'; 'INTERNAL_API_ORIGIN' = 'http://backend:8000'; 'WEB_HOST_PORT' = '3002'; 'BACKEND_HOST_PORT' = '8010'
}
foreach ($name in $reviewDefaults.Keys) { if (-not $existing[$name]) { Set-ReviewValue $name $reviewDefaults[$name] } }
foreach ($name in 'COMMAND_POST_REVIEW_PASSWORD','PLAYER_REVIEW_PASSWORD','DJANGO_LOCAL_SUPERUSER_PASSWORD') { if (-not $existing[$name]) { Set-ReviewValue $name (New-ReviewSecret) } }
if (-not $existing['DJANGO_SECRET_KEY']) { Set-ReviewValue 'DJANGO_SECRET_KEY' (New-ReviewSecret) }
Set-ReviewValue 'SOURCE_SHA' $sourceSha; Set-ReviewValue 'BUILD_ID' $sourceSha
$values = Read-ReviewEnvironment
$required = 'POSTGRES_DB','POSTGRES_USER','POSTGRES_PASSWORD','DATABASE_URL','DJANGO_SECRET_KEY','DJANGO_ALLOWED_HOSTS','DJANGO_CSRF_TRUSTED_ORIGINS','ENABLE_DJANGO_ADMIN','FOUNDER_REVIEW_USERNAME','FOUNDER_REVIEW_PASSWORD','FOUNDER_REVIEW_DISPLAY_NAME','COMMAND_POST_REVIEW_USERNAME','COMMAND_POST_REVIEW_PASSWORD','COMMAND_POST_REVIEW_DISPLAY_NAME','COMMAND_POST_REVIEW_ORGANIZATION_SLUG','PLAYER_REVIEW_USERNAME','PLAYER_REVIEW_PASSWORD','PLAYER_REVIEW_DISPLAY_NAME','DJANGO_LOCAL_SUPERUSER_USERNAME','DJANGO_LOCAL_SUPERUSER_PASSWORD'
foreach ($name in $required) { if (-not $values[$name]) { throw "Founder review environment is missing $name." } }
if ($values.DATABASE_URL -ne "postgresql://$($values.POSTGRES_USER):$($values.POSTGRES_PASSWORD)@db:5432/$($values.POSTGRES_DB)") { throw 'DATABASE_URL does not match the configured PostgreSQL authority; resolve retained-volume credential drift without deleting the volume.' }
docker compose --env-file $envFile up --build -d
docker compose --env-file $envFile exec -T db psql -U $values.POSTGRES_USER -d $values.POSTGRES_DB -c 'select 1;' | Out-Null
docker compose --env-file $envFile exec -T backend python manage.py migrate --noinput
docker compose --env-file $envFile exec -T backend python manage.py migrate --check
docker compose --env-file $envFile exec -T backend python manage.py seed_service_plans
docker compose --env-file $envFile exec -T backend python manage.py seed_runtime_authority
docker compose --env-file $envFile exec -T backend python manage.py bootstrap_founder_review
docker compose --env-file $envFile exec -T backend python manage.py review_founder_environment
$health = Invoke-RestMethod 'http://localhost:3002/api/v1/health/'; $build = Invoke-RestMethod 'http://localhost:3002/api/v1/system/build/'
if ($health.status -ne 'ok' -or $build.source_sha -ne $sourceSha) { throw 'Founder review environment provenance or health check failed.' }
@(
  "Source SHA: $sourceSha", 'Product/play: http://localhost:3002/play', 'Leaderboard: http://localhost:3002/leaderboard', 'Inceptivec admin: http://localhost:3002/inceptivec-gamification-admin', 'Command Post: http://localhost:3002/command-post',
  "Inceptivec administrator: $($values.FOUNDER_REVIEW_USERNAME) / $($values.FOUNDER_REVIEW_PASSWORD)", "Command Post customer: $($values.COMMAND_POST_REVIEW_USERNAME) / $($values.COMMAND_POST_REVIEW_PASSWORD)", "Player: $($values.PLAYER_REVIEW_USERNAME) / $($values.PLAYER_REVIEW_PASSWORD)",
  'Review order: sign in to each permitted surface; verify cross-surface denial; play campaign Continue and Boarding; create/save a customer map; verify leaderboard and logout.', 'Stop: docker compose down', 'Restart: .\scripts\start-founder-review.ps1', 'Backend diagnostics only: http://localhost:8010. Django Admin is local technical tooling only when ENABLE_DJANGO_ADMIN=true.'
) | Set-Content -LiteralPath (Join-Path $root 'FOUNDER_REVIEW_ACCESS.local.txt') -Encoding ascii
Write-Output 'FOUNDER_REVIEW_READY=YES'
