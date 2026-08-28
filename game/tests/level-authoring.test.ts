import assert from 'node:assert/strict';
import test from 'node:test';

import { compileLevelDocument } from '../src/levels/LevelCompiler';
import type { LevelAuthoringDocument } from '../src/levels/LevelAuthoringDocument';
import { levelChecksum } from '../src/levels/LevelChecksum';
import { validateLevelDefinition } from '../src/levels/LevelValidator';
import { CAMPAIGN_DEFINITIONS } from '../src/levels/campaignDefinitions';

const document: LevelAuthoringDocument = {
  schema_version: '1.1', id: 'level-02', slug: 'level-02', name: 'Mixed Formation', version: 2, status: 'DRAFT', sequence: 2, seed: 7,
  canvas: { width: 1280, height: 720, grid_size: 16, snap_enabled: true, background_asset_id: 'background.starfield' },
  player_spawns: [{ id: 'player-1', slot: 1, asset_id: 'player.ship', x: 640, y: 610, rotation: 0, enabled: true }, { id: 'player-2', slot: 2, asset_id: 'player.ship', x: 640, y: 610, rotation: 0, enabled: false }],
  entities: [
    { id: 'scout-1', entity_type: 'SCOUT', asset_id: 'enemy.scout', x: 300, y: 120, width: 44, height: 58, rotation: 0, z_index: 4, behaviour_profile: 'enemy.scout.standard', enabled: true, tags: [] },
    { id: 'cruiser-1', entity_type: 'CRUISER', asset_id: 'enemy.cruiser', x: 560, y: 160, width: 72, height: 64, rotation: 0, z_index: 4, behaviour_profile: 'enemy.cruiser.standard', enabled: true, tags: [] },
  ],
  formations: [{ id: 'mixed', name: 'Mixed', layout: 'FREEFORM', bounds: { x: 280, y: 100, width: 360, height: 140 }, member_ids: ['scout-1', 'cruiser-1'], motion_profile: 'formation.standard', entry_delay_ms: 0, repeat: 0 }],
  hazard_emitters: [], shield_structures: [], drop_rules: [], objectives: [{ id: 'clear', type: 'DESTROY_ALL_HOSTILES', required: true, target_entity_ids: [], duration_ms: null }], boarding_anchors: [],
  gameplay: { player_lives_at_campaign_start: 3, nukes_at_campaign_start: 2, nuke_rearm_max: 150, allow_pause: true, allow_replay: true, allow_main_menu_resume: true, completion_bonus_profile: 'legacy', scoring_profile: 'LEGACY_V1_GOVERNED' }, performance_budget: { max_active_enemies: 10, max_active_hazards: 4, max_projectiles: 32, max_shield_tiles: 64, max_total_runtime_objects: 128 },
};

test('schema 1.1 compilation retains freeform mixed entities and stable IDs', () => {
  const compiled = compileLevelDocument(document);
  validateLevelDefinition(compiled);
  assert.equal(compiled.enemy_formations.length, 2);
  assert.deepEqual(compiled.enemy_formations.map((entity) => entity.entity_id), ['scout-1', 'cruiser-1']);
  assert.deepEqual(compiled.enemy_formations.map((entity) => entity.type), ['scout', 'cruiser']);
  assert.ok(compiled.enemy_formations.every((entity) => entity.fixed_position));
  assert.ok(compiled.enemy_formations.every((entity) => entity.motion_profile === 'formation.standard'));
});

test('schema 1.1 permits an authored timed hazard emitter with no initial instance', () => {
  const authored: LevelAuthoringDocument = {
    ...document,
    hazard_emitters: [{
      id: 'comet-later', hazard_type: 'COMET', asset_id: 'hazard.comet', enabled: true,
      spawn_pattern: 'ALTERNATING_EDGES', entry_edges: ['TOP'], spawn_points: [],
      spawn_interval_ms: 6000, spawn_jitter_ms: 0, initial_count: 0, maximum_active: 1,
      speed_min: 120, speed_max: 140, angular_velocity_min: 0, angular_velocity_max: 0,
      collision_damage: 1, despawn_margin: 64,
    }],
  };
  const compiled = compileLevelDocument(authored);
  assert.equal(compiled.hazards?.[0].count, 0);
  validateLevelDefinition(compiled);
});

test('sparse authored grid compiles each real member without inventing phantom ships', () => {
  const sparse: LevelAuthoringDocument = {
    ...document,
    entities: [
      { ...document.entities[0], id: 'grid-a', x: 300, y: 120 },
      { ...document.entities[0], id: 'grid-b', x: 340, y: 120 },
      { ...document.entities[0], id: 'grid-c', x: 300, y: 160 },
    ],
    formations: [{ id: 'sparse-grid', name: 'Sparse grid', layout: 'GRID', bounds: { x: 300, y: 120, width: 40, height: 40 }, member_ids: ['grid-a', 'grid-b', 'grid-c'], motion_profile: 'formation.standard', entry_delay_ms: 0, repeat: 0 }],
  };
  const compiled = compileLevelDocument(sparse);
  validateLevelDefinition(compiled);
  assert.equal(compiled.enemy_formations.length, 3);
  assert.deepEqual(compiled.enemy_formations.map((entity) => entity.entity_id), ['grid-a', 'grid-b', 'grid-c']);
  assert.ok(compiled.enemy_formations.every((entity) => entity.fixed_position));
});

test('canonical level checksums remain stable when nested object key insertion order differs', async () => {
  assert.equal(
    await levelChecksum({ z: { beta: 2, alpha: 1 }, a: [{ y: 2, x: 1 }] }),
    await levelChecksum({ a: [{ x: 1, y: 2 }], z: { alpha: 1, beta: 2 } }),
  );
});

test('published package retains the governed six-level population baseline', () => {
  const counts = CAMPAIGN_DEFINITIONS.map((definition) => definition.enemy_formations.reduce((total, formation) => total + formation.rows * formation.columns, 0));
  const byType = (sequence: number, type: string) => CAMPAIGN_DEFINITIONS[sequence - 1].enemy_formations
    .filter((formation) => formation.type === type)
    .reduce((total, formation) => total + formation.rows * formation.columns, 0);
  assert.deepEqual(counts, [58, 56, 48, 40, 44, 35]);
  assert.equal(byType(2, 'scout'), 48);
  assert.equal(byType(2, 'cruiser'), 8);
  assert.deepEqual([byType(3, 'scout'), byType(3, 'cruiser'), byType(3, 'destroyer')], [32, 12, 4]);
  assert.deepEqual([byType(4, 'scout'), byType(4, 'cruiser'), byType(4, 'destroyer')], [30, 6, 4]);
  assert.deepEqual([byType(5, 'scout'), byType(5, 'cruiser'), byType(5, 'destroyer')], [24, 12, 8]);
  assert.deepEqual([byType(6, 'scout'), byType(6, 'cruiser'), byType(6, 'destroyer'), byType(6, 'mothership')], [18, 10, 6, 1]);
  assert.equal(CAMPAIGN_DEFINITIONS[0].shields[0].count * 32, 256);
  const boarding = CAMPAIGN_DEFINITIONS[3].boarding_anchors?.[0];
  assert.equal(boarding?.source_entity_type, 'cruiser');
  assert.equal(boarding?.source_entity_id, 'level-04:formation-1:r0:c5');
  assert.equal(boarding?.offer_duration_ms, 8000);
});

test('compiler preserves authored objectives and stable Boarding target identity', () => {
  const authored: LevelAuthoringDocument = {
    ...document,
    entities: [...document.entities, { id: 'destroyer-1', entity_type: 'DESTROYER', asset_id: 'enemy.destroyer', x: 760, y: 140, width: 92, height: 74, rotation: 0, z_index: 4, behaviour_profile: 'enemy.destroyer.standard', enabled: true, tags: [] }],
    boarding_anchors: [{ id: 'board-1', source_entity_id: 'destroyer-1', source_ship_type: 'ALIEN_FRIGATE', interior: { slug: 'alien-frigate', version: 1, checksum: 'e9b1af65f0daef6725a7ddf4683b5f6d503e25dabc97aef1212102e6b1e994f3' }, entry_envelope: { width_px: 160, height_px: 128 }, offer_duration_ms: 8000, interaction: 'BOARD' }],
    objectives: [{ id: 'board', type: 'BOARD_TARGET', required: true, target_entity_ids: ['destroyer-1'], duration_ms: null }],
  };
  const compiled = compileLevelDocument(authored);
  assert.deepEqual(compiled.objectives, authored.objectives);
  assert.equal(compiled.boarding_anchors?.[0].source_entity_id, 'destroyer-1');
  assert.equal(compiled.boarding_anchors?.[0].source_entity_type, 'destroyer');
  assert.equal(compiled.boarding_anchors?.[0].source_selector.formation_index, 2);
});
