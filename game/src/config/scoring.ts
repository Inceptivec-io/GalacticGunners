export const SCORE_EVENT_VALUES = Object.freeze({
  laser_target_hit: 5,
  asteroid_destroyed: 10,
  scout_destroyed: 25,
  ship_destroyed: 50,
  mothership_hit: 50,
  mothership_destroyed: 1000,
  comet_destroyed: 500,
  comet_nuke_bonus: 0,
  shield_tile_hit: -1
} as const);

export const MINIMUM_SCORE = 0;
export const PLAYER_DAMAGE_SCORE_PENALTY = 0;
export const COMET_NUKE_BONUS = 1;

export type ScoreEventType = keyof typeof SCORE_EVENT_VALUES;

export interface ScoreEvent {
  event_type: ScoreEventType;
  sequence: number;
  occurred_at_ms: number;
  points_delta: number;
  target_type?: 'laser_target' | 'asteroid' | 'scout' | 'ship' | 'mothership' | 'comet' | 'shield_tile';
  metadata?: Record<string, unknown>;
}
