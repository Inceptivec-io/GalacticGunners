$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost:8027"
$service = "galactic-gunners"
$container = "galactic-gunners-founder-local"
$assetPaths = @(
  "/",
  "/index.html",
  "/assets/js/phaser.js",
  "/assets/js/game.js",
  "/assets/images/owned/branding/gg_logo_primary_v001.png",
  "/assets/images/owned/branding/gg_menu_titlecard_v001.png",
  "/assets/images/owned/branding/gg_symbol_v001.png",
  "/assets/images/owned/backgrounds/gg_starfield_16x9_v001.png",
  "/assets/images/owned/sprites/gg_player_v001_sheet.png",
  "/assets/images/owned/sprites/gg_scout_v001_sheet.png",
  "/assets/images/owned/sprites/gg_cruiser_v001_sheet.png",
  "/assets/images/owned/sprites/gg_destroyer_v001_sheet.png",
  "/assets/images/owned/sprites/gg_boss_v001_sheet.png",
  "/assets/images/owned/sprites/gg_asteroid_v001.png",
  "/assets/images/owned/sprites/gg_comet_v001.png",
  "/assets/images/owned/sprites/gg_explosion_v001_sheet.png",
  "/assets/images/owned/sprites/gg_nuke_v001_sheet.png",
  "/assets/audio/gg_nuke_v001.wav"
)

$composePs = docker compose ps $service --format json
if (-not $composePs) {
  throw "Docker Compose service '$service' is not running. Start it with: docker compose up --build"
}

$containerState = docker inspect $container --format '{{.State.Status}}|{{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}'
Write-Host "Container: $containerState"

foreach ($path in $assetPaths) {
  $url = "$baseUrl$path"
  $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
  if ($response.StatusCode -ne 200) {
    throw "Unexpected HTTP $($response.StatusCode) for $url"
  }
  Write-Host "HTTP 200 $url"
}

$head = git rev-parse HEAD
$branch = git branch --show-current
Write-Host "Branch: $branch"
Write-Host "Current SHA: $head"
Write-Host "Founder Docker runtime verification: PASS"
