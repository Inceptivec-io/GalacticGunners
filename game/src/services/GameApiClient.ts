export type ClientType = 'web' | 'windows' | 'macos' | 'android' | 'ios' | 'unknown';
export type GameRunValidity = 'pending' | 'valid' | 'rejected';

export interface GameRunStartRequest {
  game_version: string;
  client_type: ClientType;
  level_slug: string;
  level_version: number;
  level_checksum: string;
  seed: number;
}

export interface GameRunRecord {
  id: string;
  validation_state: 'ACTIVE';
  started_at: string;
  level: { slug: string; version: number; checksum: string };
  seed: number;
}

export interface GameRunCompletionRequest {
  score: number;
  level_reached: number;
  lives_end: number;
  nukes_end: number;
  duration_ms: number;
  victory: boolean;
  event_summary: Record<string, unknown>;
  payload_hash?: string;
  idempotency_key?: string | null;
}

export interface CompletedGameRunRecord {
  run_id: string;
  validation_state: 'VALIDATED' | 'REJECTED';
  validated_score: number | null;
  leaderboard_eligible: boolean;
  rejection_codes: string[];
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
}

export interface GameRunClient {
  health(): Promise<unknown>;
  startGameRun(request: GameRunStartRequest): Promise<GameRunRecord>;
  completeGameRun(runId: string, request: GameRunCompletionRequest): Promise<CompletedGameRunRecord>;
  getLeaderboard(limit?: number, offset?: number): Promise<LeaderboardResponse>;
  startCampaign(seedRoot: number): Promise<CampaignRunRecord>;
  completeCampaignEntry(runId: string, entryId: string, payload: CampaignEntryCompletion, capability?: string | null): Promise<CampaignRunRecord>;
}

export interface CampaignEntry { id: string; position: number; level: { slug: string; version: number; checksum: string; definition: unknown }; }
export interface CampaignRunRecord { id: string; status?: 'ACTIVE' | 'COMPLETED'; score: number; lives: number; nukes: number; entry: CampaignEntry | null; has_next_entry?: boolean; ranked: boolean; capability?: string | null; completed_entry_count?: number; }
export interface CampaignEntryCompletion { score: number; lives: number; nukes: number; }

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

  startCampaign(seedRoot: number): Promise<CampaignRunRecord> {
    return this.request('/campaign-runs/start/', { method: 'POST', body: JSON.stringify({ seed_root: seedRoot }) });
  }

  completeCampaignEntry(runId: string, entryId: string, payload: CampaignEntryCompletion, capability?: string | null): Promise<CampaignRunRecord> {
    return this.request(`/campaign-runs/${runId}/complete-entry/`, { method: 'POST', headers: capability ? { 'X-Campaign-Token': capability } : {}, body: JSON.stringify({ entry_id: entryId, ...payload }) });
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const csrfToken = init.method && init.method !== 'GET' && init.method !== 'HEAD' ? await this.csrfToken() : null;
    const response = await fetch(`${this.baseUrl.replace(/\/+$/, '')}${path}`, {
      credentials: 'same-origin',
      headers: {
        accept: 'application/json',
        ...(init.body ? { 'content-type': 'application/json' } : {}),
        ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
        ...init.headers,
      },
      ...init,
    });
    if (!response.ok) {
      throw new Error(`Galactic Gunners API request failed: ${response.status}`);
    }
    return response.json() as Promise<T>;
  }

  private async csrfToken(): Promise<string> {
    const response = await fetch(`${this.baseUrl.replace(/\/+$/, '')}/auth/csrf/`, { credentials: 'same-origin' });
    if (!response.ok) throw new Error('Unable to obtain CSRF token.');
    const value = await response.json() as { csrf_token?: string };
    if (!value.csrf_token) throw new Error('CSRF token was not supplied.');
    return value.csrf_token;
  }
}
