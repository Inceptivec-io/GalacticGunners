export type ClientType = 'web' | 'windows' | 'macos' | 'android' | 'ios' | 'unknown';
export type GameRunValidity = 'pending' | 'valid' | 'rejected';

export interface GameRunStartRequest {
  game_version: string;
  client_type: ClientType;
  level_slug: string;
  level_version: number;
  level_checksum: string;
  seed: number;
  campaign_run_id?: string;
  campaign_entry_id?: string;
  campaign_capability?: string | null;
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
  startBoardingRun(gameRunId: string, request: BoardingRunStartRequest): Promise<BoardingRunRecord>;
  completeBoardingRun(boardingRunId: string, request: BoardingRunCompletionRequest, capability?: string | null): Promise<BoardingRunRecord>;
}

export interface CampaignEntry { id: string; position: number; level: { slug: string; version: number; checksum: string; definition: unknown }; }
export interface CampaignRunRecord { id: string; status?: 'ACTIVE' | 'COMPLETED'; score: number; lives: number; nukes: number; entry: CampaignEntry | null; has_next_entry?: boolean; ranked: boolean; capability?: string | null; completed_entry_count?: number; }
export interface CampaignEntryCompletion { score: number; lives: number; nukes: number; }

export interface BoardingRunStartRequest {
  anchor_id: string;
  source_entity_id: string;
  source_entity_type: 'scout';
  source_ship_type: 'ALIEN_FRIGATE';
  level_version: number;
  level_checksum: string;
  interior_slug: 'alien-frigate';
  interior_version: 1;
  interior_checksum: string;
  shooter_state_digest: string;
  resources: { lives: number; nukes: number };
}

export interface BoardingRunRecord {
  id: string;
  status: 'ACTIVE' | 'COMPLETED' | 'REJECTED';
  validation_result: 'PENDING' | 'VALID' | 'INVALID';
  validation_code: string;
  seed: number;
  time_limit_ms: number;
  interior_slug: string;
  interior_version: number;
  interior_checksum: string;
  shooter_state_digest: string;
  resources_start: { lives: number; nukes: number };
  return_state: { lives: number; nukes: number; score_delta: number; remove_source_entity_id: string } | null;
  boarding_token?: string;
}

export interface BoardingRunCompletionRequest {
  outcome: 'SUCCESS' | 'TIMEOUT' | 'PLAYER_DEAD' | 'ABORTED';
  duration_ms: number;
  resources_end: { lives: number; nukes: number };
  aliens_killed: number;
  containers_opened: number;
  lives_found: number;
  nukes_found: number;
  score_events: [];
  shooter_state_digest: string;
  events: Array<Record<string, unknown>>;
}

export class GameApiClient implements GameRunClient {
  constructor(private readonly baseUrl: string) {}

  health(): Promise<unknown> {
    return this.request('/health/');
  }

  startGameRun(request: GameRunStartRequest): Promise<GameRunRecord> {
    const { campaign_capability, ...body } = request;
    return this.request('/game-runs/', {
      method: 'POST',
      headers: campaign_capability ? { 'X-Campaign-Token': campaign_capability } : {},
      body: JSON.stringify(body),
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

  startBoardingRun(gameRunId: string, request: BoardingRunStartRequest): Promise<BoardingRunRecord> {
    return this.request(`/game-runs/${gameRunId}/boarding-runs/start/`, { method: 'POST', body: JSON.stringify(request) });
  }

  completeBoardingRun(boardingRunId: string, request: BoardingRunCompletionRequest, capability?: string | null): Promise<BoardingRunRecord> {
    return this.request(`/boarding-runs/${boardingRunId}/complete/`, {
      method: 'POST',
      headers: {
        'Idempotency-Key': `boarding-${boardingRunId}`,
        ...(capability ? { 'X-Boarding-Token': capability } : {}),
      },
      body: JSON.stringify(request),
    });
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
