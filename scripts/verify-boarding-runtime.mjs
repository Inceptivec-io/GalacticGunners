import { existsSync, readFileSync } from 'node:fs';

const required = [
  'game/src/boarding/BoardingSimulation.ts',
  'game/src/boarding/BoardingStateMachine.ts',
  'game/src/scenes/BoardingScene.ts',
  'backend/boarding/models.py',
  'backend/boarding/views.py',
  'backend/boarding/fixtures/interior-alien-frigate-v1.json',
  'apps/web/public/gg-runtime-assets/boarding/boarding/backgrounds/gg_boarding_bg_corridor_v001.png',
  'apps/web/public/gg-runtime-assets/boarding/characters/player_001_v001.png',
  'apps/web/public/gg-runtime-assets/boarding/characters/alien_001_v001.png',
];
const missing = required.filter((file) => !existsSync(file));
if (missing.length) throw new Error(`Boarding runtime missing: ${missing.join(', ')}`);
const manifest = JSON.parse(readFileSync('apps/web/public/gg-runtime-assets/manifest.json', 'utf8'));
const boardingAssets = manifest.assets.filter((asset) => asset.key.startsWith('boarding.'));
if (boardingAssets.length < 50) throw new Error(`Expected admitted boarding runtime assets, received ${boardingAssets.length}`);
console.log(`Boarding runtime verified: ${boardingAssets.length} admitted assets and deterministic core present.`);
