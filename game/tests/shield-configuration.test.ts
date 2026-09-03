import assert from 'node:assert/strict';
import test from 'node:test';

import { compileLevelDocument } from '../src/levels/LevelCompiler';
import { validateLevelDefinition } from '../src/levels/LevelValidator';
import type { LevelAuthoringDocument } from '../src/levels/LevelAuthoringDocument';

const noShieldBoardingLevel: LevelAuthoringDocument = {
  schema_version: '1.1', id: 'no-shield-boarding', slug: 'no-shield-boarding', name: 'No Shield Boarding', version: 1,
  status: 'PUBLISHED', sequence: 4, seed: 15150,
  canvas: { width: 1280, height: 720, grid_size: 16, snap_enabled: true, background_asset_id: 'background.starfield' },
  player_spawns: [{ id: 'player-1', slot: 1, asset_id: 'player.ship', x: 640, y: 610, rotation: 0, enabled: true }],
  entities: [{ id: 'frigate', entity_type: 'CRUISER', asset_id: 'enemy.cruiser', x: 640, y: 220, width: 72, height: 64, rotation: 0, z_index: 4, behaviour_profile: 'enemy.cruiser.standard', enabled: true, tags: [] }],
  formations: [{ id: 'frigate-formation', name: 'Frigate', layout: 'LINE', bounds: { x: 640, y: 220, width: 0, height: 0 }, member_ids: ['frigate'], motion_profile: 'formation.standard', entry_delay_ms: 0, repeat: 0 }],
  hazard_emitters: [], shield_structures: [], drop_rules: [],
  objectives: [{ id: 'survive', type: 'SURVIVE_DURATION', required: true, target_entity_ids: [], duration_ms: 30000 }],
  boarding_anchors: [{ id: 'frigate-anchor', source_entity_id: 'frigate', source_ship_type: 'ALIEN_FRIGATE', interior: { slug: 'alien-frigate', version: 1, checksum: 'e9b1af65f0daef6725a7ddf4683b5f6d503e25dabc97aef1212102e6b1e994f3' }, entry_envelope: { width_px: 160, height_px: 128 }, offer_duration_ms: 8000, interaction: 'BOARD' }],
  gameplay: { player_lives_at_campaign_start: 3, nukes_at_campaign_start: 2, nuke_rearm_max: 150, allow_pause: true, allow_replay: true, allow_main_menu_resume: true, completion_bonus_profile: 'legacy', scoring_profile: 'LEGACY_V1_GOVERNED' },
  performance_budget: { max_active_enemies: 58, max_active_hazards: 12, max_projectiles: 96, max_shield_tiles: 512, max_total_runtime_objects: 1024 },
};

test('GG-BOARDING-001 positive a no-shield authored boarding level compiles to a valid runtime definition', () => {
  const compiled = compileLevelDocument(noShieldBoardingLevel);
  assert.deepEqual(compiled.shields, []);
  assert.doesNotThrow(() => validateLevelDefinition(compiled));
});

test('GG-BOARDING-001 negative no-shield configuration is not replaced with an invented fallback bunker', () => {
  const compiled = compileLevelDocument(noShieldBoardingLevel);
  assert.equal(compiled.shields.length, 0);
  assert.notDeepEqual(compiled.shields, [{ count: 8 }]);
});
