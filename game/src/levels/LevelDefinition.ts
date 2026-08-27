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
  enemy_formations: Array<{ type: 'scout' | 'cruiser' | 'destroyer'; rows: number; columns: number; origin: { x: number; y: number }; spacing: { x: number; y: number } }>;
  shields: Array<{ count: number; matrix: number[][] }>;
  /** Runtime-instantiated hazards. They are part of the level checksum and are never decorative metadata. */
  hazards?: Array<{ type: 'asteroid' | 'comet'; count: number; speed: number; origin: { x: number; y: number }; spacing: { x: number; y: number } }>;
  drop_tables?: Array<{ host: 'scout'; entries: Array<{ pickup: 'nuke' | 'life'; weight: number }> }>;
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
