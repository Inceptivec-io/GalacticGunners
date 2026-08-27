/** Normative H014 object surface. Runtime/generated types must remain structurally equivalent. */
export type Sha256Hex = string;
export type Uuid = string;
export type BoardingState =
  | 'SHOOTER_ACTIVE' | 'BOARDING_OFFERED' | 'BOARDING_STARTING'
  | 'BOARDING_ACTIVE' | 'BOARDING_RESOLVING' | 'SHOOTER_RESUMING' | 'GAME_OVER';
export type BoardingRunStatus = 'ACTIVE' | 'COMPLETED' | 'REJECTED';
export type BoardingOutcome = 'SUCCESS' | 'TIMEOUT' | 'PLAYER_DEAD' | 'ABORTED';
export type ValidationResult = 'PENDING' | 'VALID' | 'INVALID';
export type PickupType = 'LIFE' | 'NUKE';
export type DropType = PickupType | 'EMPTY';
export type InputAction = 'JUMP' | 'FIRE' | 'INTERACT';

export interface Resources { lives: 0 | 1 | 2 | 3; nukes: 0 | 1 | 2; }
export interface SourceSelector { formation_index: 0; row: 0; column: 14; }
export interface BoardingAnchor {
  id: 'level-04-alien-frigate-01';
  source_selector: SourceSelector;
  source_entity_type: 'scout';
  source_ship_type: 'ALIEN_FRIGATE';
  source_entity_id: 'level-04:formation-0:r0:c14';
  interior: { slug: 'alien-frigate'; version: 1; checksum: Sha256Hex };
  entry_envelope: { width_px: 160; height_px: 128 };
  offer_duration_ms: 8000;
}

export interface BoardingStartRequest {
  anchor_id: BoardingAnchor['id'];
  source_entity_id: BoardingAnchor['source_entity_id'];
  source_entity_type: 'scout';
  source_ship_type: 'ALIEN_FRIGATE';
  level_version: number;
  level_checksum: Sha256Hex;
  interior_slug: 'alien-frigate';
  interior_version: 1;
  interior_checksum: Sha256Hex;
  shooter_state_digest: Sha256Hex;
  resources: Resources & { lives: 1 | 2 | 3 };
}

export type BoardingEventType =
  | 'INPUT_CHANGED' | 'PLAYER_FIRE' | 'PLAYER_HIT' | 'PLAYER_RESPAWN'
  | 'ALIEN_FIRE' | 'ALIEN_HIT' | 'ALIEN_KILLED' | 'CONTAINER_OPENED'
  | 'PICKUP_COLLECTED' | 'EXIT_INTERACTED' | 'TIMEOUT'
  | 'PAUSE_STARTED' | 'PAUSE_ENDED';
export interface BoardingEvent {
  sequence: number;
  at_ms: number;
  type: BoardingEventType;
  entity_id: string;
  target_id?: string;
  value?: DropType;
  horizontal?: -1 | 0 | 1;
  pressed_actions?: InputAction[];
}
export interface BoardingCompletionRequest {
  outcome: BoardingOutcome;
  duration_ms: number;
  resources_end: Resources;
  aliens_killed: number;
  containers_opened: number;
  lives_found: number;
  nukes_found: number;
  score_events: [];
  shooter_state_digest: Sha256Hex;
  events: BoardingEvent[];
}
export interface ReturnState extends Resources {
  score_delta: 0;
  remove_source_entity_id: BoardingAnchor['source_entity_id'];
}
export interface BoardingStartResponse {
  id: Uuid;
  game_run_id: Uuid;
  status: 'ACTIVE';
  seed: number;
  time_limit_ms: 60000;
  boarding_token?: string;
  interior: { slug: 'alien-frigate'; version: 1; checksum: Sha256Hex; definition: InteriorDefinition };
  resources_start: Resources & { lives: 1 | 2 | 3 };
  shooter_state_digest: Sha256Hex;
}
export interface BoardingRunDetail {
  id: Uuid;
  game_run_id: Uuid;
  status: BoardingRunStatus;
  outcome: BoardingOutcome | null;
  validation_result: ValidationResult;
  validation_code: string;
  seed: number;
  time_limit_ms: 60000;
  duration_ms: number | null;
  interior_slug: 'alien-frigate';
  interior_version: 1;
  interior_checksum: Sha256Hex;
  shooter_state_digest: Sha256Hex;
  resources_start: Resources & { lives: 1 | 2 | 3 };
  return_state: ReturnState | null;
  counters?: { aliens_killed: number; containers_opened: number; lives_found: number; nukes_found: number };
}

export interface InteriorDefinition {
  schema_version: 1;
  slug: 'alien-frigate';
  version: 1;
  ship_type: 'ALIEN_FRIGATE';
  world: { width_px: 4096; height_px: 720; grid_px: 64; gravity_px_s2: 1800 };
  performance: { fixed_step_hz: 60; time_limit_ms: 60000; max_enemies: 6; max_projectiles: number; max_trace_events: 512 };
  rooms: readonly InteriorRoom[];
  connectors: readonly InteriorConnector[];
  spawn: InteriorPoint;
  exit: InteriorRect;
  enemies: readonly InteriorEnemy[];
  containers: readonly InteriorContainer[];
  hazards: readonly InteriorRect[];
  pickups: { allowed_types: readonly ['LIFE', 'NUKE']; lives_cap: 3; nukes_cap: 2 };
  assets: Record<'backgrounds' | 'tilekit' | 'props' | 'characters' | 'projectiles' | 'effects' | 'ui' | 'audio', readonly string[]>;
}
export interface InteriorPoint { id: string; room_id: string; x_px: number; y_px: number; }
export interface InteriorRect extends InteriorPoint { width_px: number; height_px: number; }
export interface InteriorRoom { id: string; x_px: number; width_px: number; background_asset: string; floor_y_px: 648; collision_rects: readonly InteriorRect[]; }
export interface InteriorConnector { id: string; from_room_id: string; to_room_id: string; door_id: string; }
export interface InteriorEnemy extends InteriorPoint { type: 'ALIEN_GUNNER'; patrol_min_x_px: number; patrol_max_x_px: number; fire_interval_ms: { min: 900; max: 1500 }; }
export interface InteriorContainer extends InteriorPoint { prop_type: 'CRATE' | 'BARREL'; hit_points: 1; drop_table: readonly { type: DropType; weight: number }[]; }
