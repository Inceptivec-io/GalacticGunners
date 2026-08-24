$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost:8027"
$service = "galactic-gunners"
$container = "galactic-gunners-founder-local"
$assetPaths = @(
  "/",
  "/favicon.ico",
  "/index.html",
  "/assets/js/phaser.js",
  "/assets/js/game.js",
  "/assets/js/gg_runtime.js",
  "/assets/images/owned/branding/gg_logo_primary_v002.png",
  "/assets/images/owned/branding/gg_logo_primary_words_v002.png",
  "/assets/images/owned/branding/gg_logo_compact_v002.png",
  "/assets/images/owned/branding/gg_symbol_v001.png",
  "/assets/images/owned/branding/favicons/favicon.ico",
  "/assets/images/owned/branding/favicons/favicon-16.png",
  "/assets/images/owned/branding/favicons/favicon-32.png",
  "/assets/images/owned/branding/favicons/favicon-48.png",
  "/assets/images/owned/branding/favicons/favicon-180.png",
  "/assets/images/owned/branding/gg_game_over_panel_v002.png",
  "/assets/images/owned/branding/gg_victory_panel_v002.png",
  "/assets/images/owned/backgrounds/gg_bg_starfield_v002.png",
  "/assets/images/owned/sprites/gg_player_ship_v002_sheet.png",
  "/assets/images/owned/sprites/gg_enemy_scout_v002_sheet.png",
  "/assets/images/owned/sprites/gg_enemy_cruiser_v002_sheet.png",
  "/assets/images/owned/sprites/gg_enemy_destroyer_v002_sheet.png",
  "/assets/images/owned/sprites/gg_boss_mothership_normal_v002_sheet.png",
  "/assets/images/owned/sprites/gg_boss_mothership_hit_v002_sheet.png",
  "/assets/images/owned/sprites/gg_asteroid_v002_sheet.png",
  "/assets/images/owned/sprites/gg_comet_v002_sheet.png",
  "/assets/images/owned/sprites/gg_explosion_small_v002_sheet.png",
  "/assets/images/owned/sprites/gg_nuke_projectile_v002_sheet.png",
  "/assets/images/owned/sprites/gg_nuke_burst_v002_sheet.png",
  "/assets/fonts/title/GalacticGunners_Title_Font-v1.0.woff2",
  "/assets/fonts/display/GalacticGunnersDisplay-Regular-v1.3.woff2",
  "/assets/audio/gg_ui_select_v001.wav",
  "/assets/audio/gg_ui_confirm_v001.wav",
  "/assets/audio/gg_ui_back_v001.wav",
  "/assets/audio/gg_player_laser_v001.wav",
  "/assets/audio/gg_enemy_laser_v001.wav",
  "/assets/audio/gg_shield_hit_v001.wav",
  "/assets/audio/gg_explosion_small_v001.wav",
  "/assets/audio/gg_explosion_large_v001.wav",
  "/assets/audio/gg_nuke_fire_v001.wav",
  "/assets/audio/gg_nuke_burst_v001.wav",
  "/assets/audio/gg_comet_destroyed_v001.wav",
  "/assets/audio/gg_player_hit_v001.wav",
  "/assets/audio/gg_mothership_hit_v001.wav",
  "/assets/audio/gg_mothership_destroyed_v001.wav",
  "/assets/audio/gg_victory_stinger_v001.wav",
  "/assets/audio/gg_game_over_stinger_v001.wav"
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
