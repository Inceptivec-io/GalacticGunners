export type ClientType = 'web' | 'windows' | 'macos' | 'android' | 'ios' | 'unknown';
export type GameRunValidity = 'pending' | 'valid' | 'rejected';

export interface GameRunStartRequest {
  game_version: string;
  client_type: ClientType;
}

export interface GameRunRecord {
  id: string;
  game_version: string;
  client_type: ClientType;
  started_at: string;
  completed_at: string | null;
  score: number;
  level_reached: string;
  lives_used: number;
  nukes_used: number;
  victory: boolean;
  validity: GameRunValidity;
}

export interface GameRunCompletionRequest {
  claimed_score: number;
  level_reached: string;
  lives_used: number;
  nukes_used: number;
  victory: boolean;
  event_summary: Record<string, unknown>;
  payload_hash?: string;
  idempotency_key?: string | null;
}

export interface CompletedGameRunRecord {
  id: string;
  score: number;
  level_reached: string;
  lives_used: number;
  nukes_used: number;
  victory: boolean;
  validity: GameRunValidity;
  completed_at: string;
}

export interface LeaderboardEntry {
  run_id: string;
  display_name: string;
  score: number;
  published_at: string;
}

export interface LeaderboardResponse {
  count: number;
  results: LeaderboardEntry[];
}

export interface GameRunClient {
  health(): Promise<unknown>;
  startGameRun(request: GameRunStartRequest): Promise<GameRunRecord>;
  completeGameRun(runId: string, request: GameRunCompletionRequest): Promise<CompletedGameRunRecord>;
  getLeaderboard(limit?: number, offset?: number): Promise<LeaderboardResponse>;
}

export class GameApiClient implements GameRunClient {
  constructor(private readonly baseUrl: string) {}

  health(): Promise<unknown> {
    return this.request('/health/');
  }

  startGameRun(request: GameRunStartRequest): Promise<GameRunRecord> {
    return this.request('/game-runs/', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  completeGameRun(runId: string, request: GameRunCompletionRequest): Promise<CompletedGameRunRecord> {
    return this.request(`/game-runs/${runId}/complete/`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  getLeaderboard(limit = 20, offset = 0): Promise<LeaderboardResponse> {
    return this.request(`/leaderboard/?limit=${limit}&offset=${offset}`);
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl.replace(/\/+$/, '')}${path}`, {
      credentials: 'include',
      headers: {
        accept: 'application/json',
        ...(init.body ? { 'content-type': 'application/json' } : {}),
        ...init.headers,
      },
      ...init,
    });
    if (!response.ok) {
      throw new Error(`Galactic Gunners API request failed: ${response.status}`);
    }
    return response.json() as Promise<T>;
  }
}
