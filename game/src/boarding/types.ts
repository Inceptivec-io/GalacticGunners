export type BoardingOutcome = 'SUCCESS' | 'TIMEOUT' | 'PLAYER_DEAD' | 'ABORTED';
export type BoardingState = 'OFFERED' | 'ACTIVE' | 'COMPLETING' | 'RETURNED' | 'REJECTED';

export interface BoardingInput { horizontal: -1 | 0 | 1; jump: boolean; fire: boolean; interact: boolean; }
export interface BoardingResources { lives: number; nukes: number; }
export interface BoardingEvent { sequence: number; at_ms: number; type: string; entity_id: string; target_id?: string; value?: 'LIFE' | 'NUKE' | 'EMPTY'; }
export interface BoardingSnapshot { version: 1; tick: number; seed: number; player: { x: number; y: number; vx: number; vy: number; health: number }; aliens: Array<{ id: string; x: number; y: number; alive: boolean }>; containers: Array<{ id: string; open: boolean; pickup?: 'LIFE' | 'NUKE' | 'EMPTY' }>; resources: BoardingResources; events: BoardingEvent[]; }
