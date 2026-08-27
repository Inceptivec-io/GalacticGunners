import { publicConfig } from '../config/publicConfig';

export interface HealthResponse {
  status: 'ok';
  service: 'galactic-gunners-api';
  api_version: 'v1';
}

export interface StartGameRunRequest {
  game_version: string;
  client_type: 'web' | 'windows' | 'macos' | 'android' | 'ios' | 'unknown';
}

export interface GameRunRecord {
  id: string;
  game_version: string;
  client_type: StartGameRunRequest['client_type'];
  started_at: string;
  completed_at: string | null;
  score: number;
  level_reached: string;
  lives_used: number;
  nukes_used: number;
  victory: boolean;
  validity: 'pending' | 'valid' | 'rejected';
}

export interface CompleteGameRunRequest {
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
  validity: 'pending' | 'valid' | 'rejected';
  completed_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  run_id: string;
  display_name: string;
  score: number;
  campaign_level_reached: number;
  victory: boolean;
  accepted_at: string;
}

export interface LeaderboardResponse {
  total: number;
  results: LeaderboardEntry[];
  player?: { rank: number | null; best_score: number | null };
}

export interface ApiErrorResponse {
  code: 'invalid_request' | 'not_found' | 'conflict' | 'request_failed';
  detail: string;
  errors: Record<string, unknown>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: ApiErrorResponse | null,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${publicConfig.apiBaseUrl}${path}`, {
    credentials: 'same-origin',
    headers: {
      accept: 'application/json',
      ...(init?.body ? { 'content-type': 'application/json' } : {}),
      ...init?.headers,
    },
    ...init,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = typeof body?.detail === 'string' ? body.detail : `HTTP ${response.status}`;
    throw new ApiError(`Galactic Gunners API request failed: ${detail}`, response.status, body);
  }
  return body as T;
}

export const apiClient = {
  health(): Promise<HealthResponse> {
    return request<HealthResponse>('/health/');
  },

  startGameRun(payload: StartGameRunRequest): Promise<GameRunRecord> {
    return request<GameRunRecord>('/game-runs/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  completeGameRun(runId: string, payload: CompleteGameRunRequest): Promise<CompletedGameRunRecord> {
    return request<CompletedGameRunRecord>(`/game-runs/${runId}/complete/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getLeaderboard(limit = 20, offset = 0): Promise<LeaderboardResponse> {
    return request<LeaderboardResponse>(`/leaderboard/?limit=${limit}&offset=${offset}`);
  },
};
