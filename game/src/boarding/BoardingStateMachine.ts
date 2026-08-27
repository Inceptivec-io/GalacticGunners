import type { BoardingState } from './types';

const transitions: Record<BoardingState, BoardingState[]> = { OFFERED: ['ACTIVE', 'REJECTED'], ACTIVE: ['COMPLETING', 'REJECTED'], COMPLETING: ['RETURNED', 'REJECTED'], RETURNED: [], REJECTED: [] };

export class BoardingStateMachine {
  state: BoardingState = 'OFFERED';
  transition(next: BoardingState): BoardingState { if (!transitions[this.state].includes(next)) throw new Error(`Illegal Boarding transition ${this.state} -> ${next}`); this.state = next; return this.state; }
}
