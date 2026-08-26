import { GAME_VERSION } from '../config/gameConfig';
import type {
  CompletedGameRunRecord,
  GameRunClient,
  GameRunRecord,
} from '../services/GameApiClient';

export interface TerminalGameRunPayload {
  score: number;
  livesUsed: number;
  livesEnd: number;
  nukesEnd: number;
  levelReached: number;
  victory: boolean;
  nukesUsed?: number;
  eventSummary: Record<string, unknown>;
}

export class GameSession {
  #run: GameRunRecord | null = null;
  #startAttempted = false;
  #completeAttempted = false;
  #offline = false;

  constructor(private readonly client: GameRunClient | null, private readonly level: { slug: string; version: number; checksum: string; seed: number } | null = null) {}

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
    if (!this.client || !this.level) {
      this.#offline = true;
      return;
    }
    try {
      this.#run = await this.client.startGameRun({
        game_version: GAME_VERSION,
        client_type: 'web',
        level_slug: this.level.slug,
        level_version: this.level.version,
        level_checksum: this.level.checksum,
        seed: this.level.seed,
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
      score: payload.score,
      level_reached: payload.levelReached,
      lives_end: payload.livesEnd,
      nukes_end: payload.nukesEnd,
      duration_ms: 5000,
      victory: payload.victory,
      event_summary: normaliseEventSummary(payload.eventSummary),
      idempotency_key: `level-1-slice-${this.#run.id}`,
    });
  }
}

function normaliseEventSummary(raw: Record<string, unknown>): Record<string, unknown> {
  const eventCounts = raw.event_counts as Record<string, number> | undefined;
  return {
    laser_target_hits: eventCounts?.laser_target_hit ?? 0,
    asteroid_kills: eventCounts?.asteroid_destroyed ?? 0,
    scout_kills: eventCounts?.scout_destroyed ?? 0,
    ship_kills: eventCounts?.ship_destroyed ?? 0,
    mothership_hits: eventCounts?.mothership_hit ?? 0,
    mothership_kills: eventCounts?.mothership_destroyed ?? 0,
    comet_kills: eventCounts?.comet_destroyed ?? 0,
    shield_enemy_hits: eventCounts?.shield_tile_hit ?? 0,
    nuke_uses: 0,
    nuke_pickups: 0,
    levels_completed: [1],
  };
}
