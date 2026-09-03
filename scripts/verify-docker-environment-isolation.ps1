[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$dev = 'galactic-gunners-dev'
$feature = 'galactic-gunners-founder-review'
$devConfig = docker compose -p $dev --env-file .dev.env config --format json | ConvertFrom-Json
$featureConfig = docker compose -p $feature --env-file .founder-review.env config --format json | ConvertFrom-Json
if ($devConfig.services.web.ports[0].published -eq $featureConfig.services.web.ports[0].published) { throw 'DEV and FEATURE web ports overlap.' }
if ($devConfig.services.backend.ports[0].published -eq $featureConfig.services.backend.ports[0].published) { throw 'DEV and FEATURE backend ports overlap.' }
if ($devConfig.services.db.environment.POSTGRES_DB -eq $featureConfig.services.db.environment.POSTGRES_DB) { throw 'DEV and FEATURE database names overlap.' }
$devVolume = "${dev}_galactic_gunners_postgres"
$featureVolume = "${feature}_galactic_gunners_postgres"
if ($devVolume -eq $featureVolume) { throw 'DEV and FEATURE volumes overlap.' }
[pscustomobject]@{ result = 'PASS'; dev_web_port = $devConfig.services.web.ports[0].published; feature_web_port = $featureConfig.services.web.ports[0].published; dev_backend_port = $devConfig.services.backend.ports[0].published; feature_backend_port = $featureConfig.services.backend.ports[0].published; dev_database = $devConfig.services.db.environment.POSTGRES_DB; feature_database = $featureConfig.services.db.environment.POSTGRES_DB; dev_volume = $devVolume; feature_volume = $featureVolume } | ConvertTo-Json -Compress
