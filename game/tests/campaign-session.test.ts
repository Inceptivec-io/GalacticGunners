import assert from 'node:assert/strict';
import test from 'node:test';

import { CampaignSession } from '../src/systems/CampaignSession';
import type { CampaignRunRecord, GameRunClient } from '../src/services/GameApiClient';

const firstRun: CampaignRunRecord = {
  id: 'run-001',
  score: 40,
  lives: 3,
  nukes: 2,
  entry: {
    id: 'entry-001',
    position: 1,
    level: { slug: 'level-01', version: 1, checksum: 'a'.repeat(64), definition: {} },
  },
  has_next_entry: true,
  ranked: false,
  capability: 'campaign-capability',
};

const secondRun: CampaignRunRecord = {
  ...firstRun,
  score: 125,
  lives: 2,
  nukes: 1,
  entry: {
    id: 'entry-002',
    position: 2,
    level: { slug: 'level-02', version: 1, checksum: 'b'.repeat(64), definition: {} },
  },
};

function client(overrides: Partial<GameRunClient> = {}): GameRunClient {
  return {
    health: async () => ({}),
    startGameRun: async () => {
      throw new Error('not used');
    },
    completeGameRun: async () => {
      throw new Error('not used');
    },
    getLeaderboard: async () => ({ total: 0, results: [] }),
    startCampaign: async () => firstRun,
    completeCampaignEntry: async () => secondRun,
    startBoardingRun: async () => {
      throw new Error('not used');
    },
    completeBoardingRun: async () => {
      throw new Error('not used');
    },
    ...overrides,
  };
}

test('H015-GAME-005 positive server-pinned completion preserves returned score lives and nukes', async () => {
  const calls: Array<{ runId: string; entryId: string; score: number; lives: number; nukes: number; capability?: string | null }> = [];
  const session = new CampaignSession(client({
    completeCampaignEntry: async (runId, entryId, payload, capability) => {
      calls.push({ runId, entryId, ...payload, capability });
      return secondRun;
    },
  }), 15150);

  assert.equal(await session.start(), firstRun);
  assert.equal(await session.complete(125, 2, 1), secondRun);
  assert.equal(session.run, secondRun);
  assert.deepEqual(calls, [{
    runId: 'run-001', entryId: 'entry-001', score: 125, lives: 2, nukes: 1, capability: 'campaign-capability',
  }]);
});

test('H015-GAME-005 negative rejected completion cannot replace the active campaign checkpoint', async () => {
  const session = new CampaignSession(client({
    completeCampaignEntry: async () => {
      throw new Error('CAMPAIGN_CAPABILITY_INVALID');
    },
  }), 15150);

  await session.start();
  await assert.rejects(session.complete(999, 0, 0), /CAMPAIGN_CAPABILITY_INVALID/);
  assert.equal(session.run, firstRun);
  assert.deepEqual(
    { score: session.run?.score, lives: session.run?.lives, nukes: session.run?.nukes, entry: session.run?.entry?.id },
    { score: 40, lives: 3, nukes: 2, entry: 'entry-001' },
  );
});
