[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$envFile = Join-Path $root '.dev.env'
$env:COMPOSE_PROJECT_NAME = 'galactic-gunners-dev'

function New-DevSecret { ([Convert]::ToBase64String((1..30 | ForEach-Object { Get-Random -Maximum 256 })) -replace '[^A-Za-z0-9]', 'A') }

if (-not (Test-Path $envFile)) {
  $dbPassword = New-DevSecret
  @(
    'POSTGRES_DB=galactic_gunners_dev', 'POSTGRES_USER=galactic_gunners_dev', "POSTGRES_PASSWORD=$dbPassword", "DATABASE_URL=postgresql://galactic_gunners_dev:$dbPassword@db:5432/galactic_gunners_dev",
    "DJANGO_SECRET_KEY=$(New-DevSecret)", 'DJANGO_SETTINGS_MODULE=config.settings.local', 'DJANGO_DEBUG=true', 'DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,backend', 'DJANGO_CSRF_TRUSTED_ORIGINS=http://localhost:3003', 'ENABLE_DJANGO_ADMIN=false', 'FOUNDER_REVIEW_MODE=false',
    'NEXT_PUBLIC_API_BASE_URL=/api/v1', 'INTERNAL_API_ORIGIN=http://backend:8000', 'WEB_HOST_PORT=3003', 'BACKEND_HOST_PORT=8011', 'SOURCE_SHA=dev-local', 'BUILD_ID=dev-local'
  ) | Set-Content -LiteralPath $envFile -Encoding ascii
}

docker compose --env-file $envFile up --build -d
if ($LASTEXITCODE -ne 0) { throw 'DEV environment failed to start.' }
Write-Output 'DEV_ENVIRONMENT=READY'
Write-Output 'DEV_URL=http://localhost:3003/play'
