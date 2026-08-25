# APP2 Browser Regression Summary

Browser automation: Chrome DevTools Protocol fallback. agent-browser CLI was unavailable locally.

Runtime URL: http://localhost:8027/

## Result

- Page title: Galactic Gunners
- Favicon link count: 4
- Page overflow X/Y: 0 / 0
- Level1 active: True
- Player frame observed: 2
- Comets created for verification: 12
- Comet variants observed: 0, 1
- Game Over interactive zones: 3
- Duplicate RESTART/MENU text: False
- Score/finalScore: 1234 / 1234
- HUD visible under result: False
- Runtime exceptions: 0
- Network failures / HTTP >=400: 0

## Warning Classification

Chrome reported Phaser/Canvas readback warnings and AudioContext autoplay warnings in headless automation. These are browser/runtime warnings, not JavaScript exceptions, asset 404s, or audio decode failures. Founder manual preview occurs with user gesture and Docker remains available at the runtime URL.

## Screenshots

- 01_title.png
- 02_level1.png
- 03_comet_variants.png
- 04_explosions.png
- 05_game_over.png
- 06_victory.png
