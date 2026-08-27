import type { LevelStatus } from './LevelDefinition';

export type EntityType = 'SCOUT' | 'CRUISER' | 'DESTROYER' | 'MOTHERSHIP' | 'ASTEROID' | 'COMET' | 'SHIELD_TILE' | 'NUKE_PICKUP' | 'LIFE_PICKUP';
export interface AuthoredEntity { id: string; entity_type: EntityType; asset_id: string; x: number; y: number; width: number; height: number; rotation: number; z_index: number; behaviour_profile: string; enabled: boolean; tags: string[]; }
export interface LevelAuthoringDocument {
  schema_version: '1.1'; id: string; slug: string; name: string; version: number; status: LevelStatus; sequence: number; seed: number;
  canvas: { width: 1280; height: 720; grid_size: 8 | 16 | 24 | 32; snap_enabled: boolean; background_asset_id: string };
  player_spawns: Array<{ id: string; slot: 1 | 2; asset_id: string; x: number; y: number; rotation: number; enabled: boolean }>;
  entities: AuthoredEntity[];
  formations: Array<{ id: string; name: string; layout: 'GRID' | 'LINE' | 'WEDGE' | 'ARC' | 'FREEFORM'; bounds: { x: number; y: number; width: number; height: number }; member_ids: string[]; motion_profile: string; entry_delay_ms: number; repeat: number }>;
  hazard_emitters: Array<{ id: string; hazard_type: 'ASTEROID' | 'COMET'; asset_id: string; enabled: boolean; initial_count: number; maximum_active: number; spawn_interval_ms: number; spawn_jitter_ms: number; speed_min: number; speed_max: number; angular_velocity_min: number; angular_velocity_max: number; entry_edges: Array<'TOP' | 'RIGHT' | 'BOTTOM' | 'LEFT'>; spawn_pattern: 'RANDOM_EDGE' | 'ALTERNATING_EDGES' | 'LANE' | 'FIXED_POINTS'; spawn_points: Array<{ x: number; y: number }>; despawn_margin: number; collision_damage: number }>;
  shield_structures: Array<{ id: string; name: string; origin: { x: number; y: number }; tile_asset_id: string; tile_width: number; tile_height: number; matrix: number[][]; destructible: true }>;
  drop_rules: Array<{ id: string; host_entity_types: Array<'SCOUT' | 'CRUISER' | 'DESTROYER'>; pickup_type: 'NUKE' | 'LIFE'; probability: number; maximum_per_level: number; collection_window_ms: number }>;
  objectives: Array<{ id: string; type: 'DESTROY_ALL_HOSTILES' | 'DESTROY_MOTHERSHIP' | 'SURVIVE_DURATION' | 'BOARD_TARGET'; required: boolean; target_entity_ids: string[]; duration_ms: number | null }>;
  boarding_anchors: Array<{ id: string; source_entity_id: string; source_ship_type: 'ALIEN_FRIGATE'; interior: { slug: 'alien-frigate'; version: 1; checksum: string }; entry_envelope: { width_px: 160; height_px: 128 }; offer_duration_ms: 8000; interaction: 'BOARD' }>;
  gameplay: { player_lives_at_campaign_start: number; nukes_at_campaign_start: number; nuke_rearm_max: number; allow_pause: boolean; allow_replay: boolean; allow_main_menu_resume: boolean; completion_bonus_profile: string; scoring_profile: 'LEGACY_V1_GOVERNED' };
  performance_budget: { max_active_enemies: number; max_active_hazards: number; max_projectiles: number; max_shield_tiles: number; max_total_runtime_objects: number };
}
