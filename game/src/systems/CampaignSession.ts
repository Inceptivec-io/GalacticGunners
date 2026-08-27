import type { CampaignRunRecord, GameRunClient } from '../services/GameApiClient';

/** Campaign state belongs to the run, not to a disposable Phaser scene. */
export class CampaignSession {
  #run: CampaignRunRecord | null = null;
  #offline = false;

  constructor(private readonly client: GameRunClient | null, private readonly seedRoot: number) {}

  get run() { return this.#run; }
  get offline() { return this.#offline; }

  async start(): Promise<CampaignRunRecord | null> {
    if (this.#run) return this.#run;
    if (!this.client) { this.#offline = true; return null; }
    try { this.#run = await this.client.startCampaign(this.seedRoot); return this.#run; }
    catch { this.#offline = true; return null; }
  }

  async complete(score: number, lives: number, nukes: number): Promise<CampaignRunRecord | null> {
    if (!this.#run?.entry || !this.client) return null;
    this.#run = await this.client.completeCampaignEntry(this.#run.id, this.#run.entry.id, { score, lives, nukes }, this.#run.capability);
    return this.#run;
  }
}
