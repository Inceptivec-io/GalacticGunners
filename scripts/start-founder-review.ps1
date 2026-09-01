[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$env:COMPOSE_PROJECT_NAME = 'galactic-gunners-founder-review'
if ((git branch --show-current) -ne 'feature/v1-platform-foundation-campaign-continuity') { throw 'Founder review requires the H015 feature branch.' }
if (git status --porcelain) { throw 'Founder review requires a clean worktree; no files were changed.' }
$sourceSha = (git rev-parse HEAD).Trim()
$remoteSha = (git rev-parse '@{u}').Trim()
if ($sourceSha -ne $remoteSha) { throw 'Founder review requires local HEAD to equal the tracked feature branch HEAD.' }
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
function Invoke-ReviewCommand([scriptblock]$command, [string]$description) {
  & $command
  if ($LASTEXITCODE -ne 0) { throw "Founder review $description failed." }
}
function Wait-ReviewServices([string]$description) {
  foreach ($service in 'db','backend','web') {
    $deadline = (Get-Date).AddSeconds(90)
    do {
      $state = docker compose --env-file $envFile ps --format json $service | ConvertFrom-Json
      if ($state -and $state.Health -eq 'healthy') { break }
      Start-Sleep -Seconds 2
    } while ((Get-Date) -lt $deadline)
    if (-not $state -or $state.Health -ne 'healthy') { throw "Founder review $description left $service unhealthy." }
  }
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
  'DJANGO_SETTINGS_MODULE' = 'config.settings.local'; 'DJANGO_DEBUG' = 'true'; 'DJANGO_ALLOWED_HOSTS' = 'localhost,127.0.0.1,backend'; 'DJANGO_CSRF_TRUSTED_ORIGINS' = 'http://localhost:3002'; 'ENABLE_DJANGO_ADMIN' = 'false'; 'FOUNDER_REVIEW_MODE' = 'true';
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
$env:NEXT_PUBLIC_GG_QA_MODE = 'false'
Invoke-ReviewCommand { docker compose --env-file $envFile up --build -d } 'production container build/start'
Invoke-ReviewCommand { docker compose --env-file $envFile exec -T db psql -U $values.POSTGRES_USER -d $values.POSTGRES_DB -c 'select 1;' | Out-Null } 'database authentication'
Invoke-ReviewCommand { docker compose --env-file $envFile exec -T backend python manage.py migrate --noinput } 'migration'
Invoke-ReviewCommand { docker compose --env-file $envFile exec -T backend python manage.py migrate --check } 'migration drift check'
Invoke-ReviewCommand { docker compose --env-file $envFile exec -T backend python manage.py seed_service_plans } 'service-plan seed'
Invoke-ReviewCommand { docker compose --env-file $envFile exec -T backend python manage.py seed_runtime_authority } 'campaign seed'
Invoke-ReviewCommand { docker compose --env-file $envFile exec -T backend python manage.py bootstrap_founder_review } 'identity bootstrap'
Invoke-ReviewCommand { docker compose --env-file $envFile exec -T backend python manage.py review_founder_environment } 'identity smoke test'
Wait-ReviewServices 'production container build/start'
$health = Invoke-RestMethod 'http://localhost:3002/api/v1/health/'; $build = Invoke-RestMethod 'http://localhost:3002/api/v1/system/build/'
if ($health.status -ne 'ok' -or $build.source_sha -ne $sourceSha) { throw 'Founder review environment provenance or health check failed.' }
$webSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$csrf = Invoke-RestMethod 'http://localhost:3002/api/v1/auth/csrf/' -WebSession $webSession
if (-not $csrf.csrf_token) { throw 'Same-origin CSRF issuance failed.' }
$headers = @{ 'X-CSRFToken' = $csrf.csrf_token }
$login = Invoke-RestMethod 'http://localhost:3002/api/v1/auth/login/' -Method Post -WebSession $webSession -Headers $headers -ContentType 'application/json' -Body (@{ username = $values.FOUNDER_REVIEW_USERNAME; password = $values.FOUNDER_REVIEW_PASSWORD; audience = 'INCEPTIVEC_ADMIN' } | ConvertTo-Json -Compress)
if (-not $login.authenticated -or -not $login.platform_access) { throw 'Same-origin Founder administrator login failed.' }
$session = Invoke-RestMethod 'http://localhost:3002/api/v1/auth/me/' -WebSession $webSession
if (-not $session.authenticated -or -not $session.surface_grants.Contains('INCEPTIVEC_ADMIN')) { throw 'Same-origin session restoration failed.' }
$logoutCsrf = Invoke-RestMethod 'http://localhost:3002/api/v1/auth/csrf/' -WebSession $webSession
$logout = Invoke-RestMethod 'http://localhost:3002/api/v1/auth/logout/' -Method Post -WebSession $webSession -Headers @{ 'X-CSRFToken' = $logoutCsrf.csrf_token } -ContentType 'application/json' -Body '{}'
if ($logout.authenticated) { throw 'Same-origin logout failed.' }

# Runtime checks intentionally write to a temporary location. The launcher must
# verify the exact container build without dirtying the governed repository.
$env:GG_RUNTIME_URL = 'http://localhost:3002'
$env:GG_TESTED_SHA = $sourceSha
$evidenceRoot = Join-Path $env:TEMP "galactic-gunners-founder-review-$sourceSha"
function Invoke-EvidenceRuntime([string]$relativeDirectory, [scriptblock]$command, [string]$description) {
  $env:GG_EVIDENCE_DIR = Join-Path $evidenceRoot $relativeDirectory
  Invoke-ReviewCommand $command $description
}
Invoke-ReviewCommand { npm run quality } 'repository quality verification'
$env:GG_EVIDENCE_DIR = $evidenceRoot
$env:NEXT_PUBLIC_GG_QA_MODE = 'true'
Invoke-ReviewCommand { docker compose --env-file $envFile up --build -d } 'QA container build/start'
Wait-ReviewServices 'QA container build/start'
try {
  Invoke-EvidenceRuntime 'hostile' { npm run runtime:hostile } 'hostile runtime verification'
  Invoke-EvidenceRuntime 'rectification/stage-1' { npm run runtime:h015:stage1 } 'Stage 1 evidence verification'
  Invoke-EvidenceRuntime 'rectification/stage-2' { npm run runtime:h015:stage2 } 'splash and pause navigation verification'
  Invoke-EvidenceRuntime 'rectification/stage-3' { npm run runtime:h015:stage3 } 'Designer pointer verification'
  Invoke-EvidenceRuntime 'rectification/stage-4' { npm run runtime:h015:stage4 } 'Designer authoring verification'
  Invoke-EvidenceRuntime 'rectification/stage-9' { npm run runtime:h015:stage9 } 'same-origin authentication and logout verification'
  Invoke-EvidenceRuntime 'campaign_runtime' { npm run runtime:campaign } 'campaign continuity verification'
  Invoke-EvidenceRuntime 'rectification/level4_hazards' { npm run runtime:h015:level4-hazards } 'Level 4 hazard verification'
  Invoke-EvidenceRuntime 'rectification/boarding' { npm run runtime:h015:boarding } 'Boarding entry, pause, touch, and abort verification'
  Invoke-EvidenceRuntime 'rectification/boarding_success' { npm run runtime:h015:boarding-success } 'Boarding combat, physical exit, and server-return verification'
  Invoke-EvidenceRuntime 'rectification/designer_roundtrip' { npm run runtime:h015:designer-roundtrip } 'Designer draft, exact-checksum preview, publication, and runtime verification'
  Invoke-EvidenceRuntime 'review_matrix' { npm run runtime:h015:review-matrix } 'browser review matrix verification'
  # Readiness is prohibited until the complete traceability catalogue has
  # independently accepted every positive and hostile row for this exact SHA.
  Invoke-EvidenceRuntime 'assurance_catalogue' { npm run h015:run-catalogue } 'fail-closed H015 assurance catalogue verification'
} finally {
  $env:NEXT_PUBLIC_GG_QA_MODE = 'false'
  Invoke-ReviewCommand { docker compose --env-file $envFile up --build -d } 'production container restoration'
  Wait-ReviewServices 'production container restoration'
}
$env:GG_EVIDENCE_DIR = $evidenceRoot
Invoke-ReviewCommand { npm run h015:build-evidence-manifest } 'generated evidence manifest build'
$env:GG_EVIDENCE_MANIFEST = Join-Path $evidenceRoot 'h015-evidence-manifest.json'
$env:GG_EVIDENCE_ARTIFACT_ID = "local-$sourceSha"
$env:GG_EVIDENCE_ARTIFACT_NAME = "h015-browser-evidence-$sourceSha"
$env:GG_EVIDENCE_ARTIFACT_DIGEST = (Get-FileHash (Join-Path $evidenceRoot 'h015-evidence-index.json') -Algorithm SHA256).Hash.ToLowerInvariant()
$env:GG_CI_RUN_ID = 'local-founder'
$env:GG_CLOSURE_ATTESTATION_DIR = Join-Path (Split-Path -Parent $evidenceRoot) 'h015-closure-attestation'
Invoke-ReviewCommand { npm run h015:closure-attest } 'generated evidence closure attestation'
@(
  "Source SHA: $sourceSha", 'Product/play: http://localhost:3002/play', 'Leaderboard: http://localhost:3002/leaderboard', 'Inceptivec admin: http://localhost:3002/inceptivec-gamification-admin', 'Command Post: http://localhost:3002/command-post',
  "Inceptivec administrator: $($values.FOUNDER_REVIEW_USERNAME) / $($values.FOUNDER_REVIEW_PASSWORD)", "Command Post customer: $($values.COMMAND_POST_REVIEW_USERNAME) / $($values.COMMAND_POST_REVIEW_PASSWORD)", "Player: $($values.PLAYER_REVIEW_USERNAME) / $($values.PLAYER_REVIEW_PASSWORD)",
  'Review order: sign in to each permitted surface; verify cross-surface denial; play campaign Continue and Boarding; create/save a customer map; verify leaderboard and logout.', 'Stop: .\scripts\stop-founder-review.ps1', 'Restart: .\scripts\start-founder-review.ps1', 'Backend diagnostics only: http://localhost:8010. Django Admin is local technical tooling only when ENABLE_DJANGO_ADMIN=true.'
) | Set-Content -LiteralPath (Join-Path $root 'FOUNDER_REVIEW_ACCESS.local.txt') -Encoding ascii
Write-Output 'FOUNDER_REVIEW_GATES=PASS'
Write-Output 'FOUNDER_REVIEW_READY=YES'
