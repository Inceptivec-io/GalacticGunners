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
  enemy_formations: Array<{ type: 'scout'; rows: number; columns: number; origin: { x: number; y: number }; spacing: { x: number; y: number } }>;
  shields: Array<{ count: number; matrix: number[][] }>;
  performance_budget: { max_enemies: number };
}
