export type LevelStatus = 'DRAFT' | 'VALIDATED' | 'PUBLISHED' | 'SUPERSEDED' | 'ARCHIVED';

export interface LevelDefinition {
  id: string;
  slug: string;
  name: string;
  version: number;
  schema_version: '1.0';
  status: LevelStatus;
  sequence: number;
  seed: number;
  player: { x: number; y: number };
  enemy_formations: Array<{
    id?: string;
    entity_id?: string;
    type: 'scout' | 'cruiser' | 'destroyer' | 'mothership';
    rows: number;
    columns: number;
    origin: { x: number; y: number };
    spacing: { x: number; y: number };
    width?: number;
    height?: number;
    behaviour_profile?: string;
    /** A schema 1.1 entity keeps its authored coordinate instead of reflowing as a legacy grid. */
    fixed_position?: boolean;
  }>;
  shields: Array<{ id?: string; count: number; matrix: number[][]; origin?: { x: number; y: number }; tile_width?: number; tile_height?: number }>;
  /** Runtime-instantiated hazards. They are part of the level checksum and are never decorative metadata. */
  hazards?: Array<{ type: 'asteroid' | 'comet'; count: number; speed: number; origin: { x: number; y: number }; spacing: { x: number; y: number }; emitter?: unknown }>;
  drop_tables?: Array<{ host: 'scout' | 'cruiser' | 'destroyer'; entries: Array<{ pickup: 'nuke' | 'life'; weight: number; maximum_per_level?: number }> }>;
  performance_budget: { max_enemies: number };
  boarding_anchors?: Array<{
    id: string;
    source_selector: { formation_index: number; row: number; column: number };
    source_entity_type: 'scout';
    source_ship_type: 'ALIEN_FRIGATE';
    source_entity_id: string;
    interior: { slug: 'alien-frigate'; version: 1; checksum: string };
    entry_envelope: { width_px: 160; height_px: 128 };
    offer_duration_ms: 8000;
  }>;
}
