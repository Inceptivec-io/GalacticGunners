import { GAME_VERSION } from '../config/gameConfig';
import type {
  CompletedGameRunRecord,
  GameRunClient,
  GameRunRecord,
} from '../services/GameApiClient';

export interface TerminalGameRunPayload {
  score: number;
  livesUsed: number;
  nukesUsed?: number;
  eventSummary: Record<string, unknown>;
}

export class GameSession {
  #run: GameRunRecord | null = null;
  #startAttempted = false;
  #completeAttempted = false;
  #offline = false;

  constructor(private readonly client: GameRunClient | null) {}

  get runId(): string | null {
    return this.#run?.id ?? null;
  }

  get offline(): boolean {
    return this.#offline;
  }

  get completeAttempted(): boolean {
    return this.#completeAttempted;
  }

  async start(): Promise<void> {
    if (this.#startAttempted) {
      return;
    }
    this.#startAttempted = true;
    if (!this.client) {
      this.#offline = true;
      return;
    }
    try {
      this.#run = await this.client.startGameRun({
        game_version: GAME_VERSION,
        client_type: 'web',
      });
    } catch {
      this.#offline = true;
    }
  }

  async complete(payload: TerminalGameRunPayload): Promise<CompletedGameRunRecord | null> {
    if (this.#completeAttempted) {
      return null;
    }
    this.#completeAttempted = true;
    if (!this.client || !this.#run) {
      return null;
    }
    return this.client.completeGameRun(this.#run.id, {
      claimed_score: payload.score,
      level_reached: 'level_1_slice',
      lives_used: payload.livesUsed,
      nukes_used: payload.nukesUsed ?? 0,
      victory: false,
      event_summary: payload.eventSummary,
      idempotency_key: `level-1-slice-${this.#run.id}`,
    });
  }
}
