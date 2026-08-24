export interface GameRunStartResponse {
  runId: string;
  gameVersion: string;
  startedAt: string;
}

export interface GameRunCompletion {
  score: number;
  levelReached: string;
  victory: boolean;
}

export class GameApiClient {
  constructor(private readonly baseUrl: string) {}

  async startRun(): Promise<GameRunStartResponse> {
    const response = await fetch(`${this.baseUrl}/game-runs/`, { method: 'POST', credentials: 'include' });
    if (!response.ok) throw new Error(`Unable to start game run: ${response.status}`);
    return response.json() as Promise<GameRunStartResponse>;
  }

  async completeRun(runId: string, completion: GameRunCompletion): Promise<void> {
    const response = await fetch(`${this.baseUrl}/game-runs/${runId}/complete/`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(completion)
    });
    if (!response.ok) throw new Error(`Unable to complete game run: ${response.status}`);
  }
}
