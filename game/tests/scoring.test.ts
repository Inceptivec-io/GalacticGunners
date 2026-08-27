import assert from 'node:assert/strict';
import test from 'node:test';

import {
  AudioSystem,
  COMET_NUKE_BONUS,
  GameSession,
  LifeSystem,
  MINIMUM_SCORE,
  PLAYER_DAMAGE_SCORE_PENALTY,
  SCORE_EVENT_VALUES,
  ScoreSystem,
  mergeInputCapabilities,
  normalizeGamepadAxes,
  normalizeGamepadButtons,
  type CompletedGameRunRecord,
  type GameRunClient,
  type GameRunCompletionRequest,
  type GameRunRecord,
  type GameRunStartRequest,
} from '../src/index';

test('scoring foundation uses locked event values and clamps at zero', () => {
  assert.equal(SCORE_EVENT_VALUES.laser_target_hit, 5);
  assert.equal(SCORE_EVENT_VALUES.asteroid_destroyed, 10);
  assert.equal(SCORE_EVENT_VALUES.scout_destroyed, 25);
  assert.equal(SCORE_EVENT_VALUES.ship_destroyed, 50);
  assert.equal(SCORE_EVENT_VALUES.mothership_hit, 50);
  assert.equal(SCORE_EVENT_VALUES.mothership_destroyed, 1000);
  assert.equal(SCORE_EVENT_VALUES.comet_destroyed, 500);
  assert.equal(COMET_NUKE_BONUS, 1);
  assert.equal(SCORE_EVENT_VALUES.shield_tile_hit, -1);
  assert.equal(PLAYER_DAMAGE_SCORE_PENALTY, 0);

  const system = new ScoreSystem();
  assert.equal(system.value, MINIMUM_SCORE);
  assert.equal(system.apply('shield_tile_hit'), MINIMUM_SCORE);
  assert.equal(system.apply('laser_target_hit'), 5);
  assert.equal(system.apply('shield_tile_hit'), 4);
  assert.deepEqual(system.events.map((event) => event.sequence), [1, 2, 3]);
  assert.equal(system.events[1]?.points_delta, 5);
  assert.equal(system.eventSummary().event_count, 3);
});

test('input capability model supports coexistence without manual mode selection', () => {
  assert.deepEqual(mergeInputCapabilities(), {
    keyboard: true,
    pointer: true,
    touch: true,
    gamepad: true,
  });
  assert.deepEqual(mergeInputCapabilities({ gamepad: false }), {
    keyboard: true,
    pointer: true,
    touch: true,
    gamepad: false,
  });
  assert.deepEqual(normalizeGamepadButtons([{ pressed: true }]), {
    left: false,
    right: false,
    up: false,
    down: false,
    fire: true,
    nuke: false,
    pause: false,
    confirm: true,
    back: false,
  });
  assert.deepEqual(normalizeGamepadAxes([-0.6]), { left: true, right: false, up: false, down: false });
  assert.deepEqual(normalizeGamepadAxes([0.6]), { left: false, right: true, up: false, down: false });
  assert.deepEqual(normalizeGamepadAxes([0, -0.6]), { left: false, right: false, up: true, down: false });
  assert.deepEqual(normalizeGamepadAxes([0, 0.6]), { left: false, right: false, up: false, down: true });
});

test('life system preserves Level 1 denominator and clamps damage at zero', () => {
  const lives = new LifeSystem(3);
  assert.equal(lives.value, 3);
  assert.equal(lives.damage(), 2);
  assert.equal(lives.damage(4), 0);
  assert.equal(lives.isDepleted, true);
  assert.equal(lives.damage(), 0);
  lives.reset();
  assert.equal(lives.value, 3);
});

test('audio system gates playback while muted', () => {
  const cues: string[] = [];
  const audio = new AudioSystem((cue) => cues.push(cue));
  audio.play('uiConfirm');
  assert.equal(audio.toggleMute(), true);
  audio.play('playerLaser');
  assert.deepEqual(cues, ['uiConfirm']);
  assert.equal(audio.toggleMute(), false);
  audio.play('playerLaser');
  assert.deepEqual(cues, ['uiConfirm', 'playerLaser']);
});

class FakeGameRunClient implements GameRunClient {
  starts = 0;
  completions = 0;

  health(): Promise<unknown> {
    return Promise.resolve({ ok: true });
  }

  startGameRun(_request: GameRunStartRequest): Promise<GameRunRecord> {
    this.starts += 1;
    return Promise.resolve({
      id: 'run-001',
      validation_state: 'ACTIVE',
      started_at: new Date(0).toISOString(),
      level: { slug: 'level-01', version: 1, checksum: '0'.repeat(64) },
      seed: 11001,
    });
  }

  completeGameRun(_runId: string, _request: GameRunCompletionRequest): Promise<CompletedGameRunRecord> {
    this.completions += 1;
    return Promise.resolve({
      run_id: 'run-001',
      validation_state: 'VALIDATED',
      validated_score: 25,
      leaderboard_eligible: false,
      rejection_codes: [],
    });
  }

  getLeaderboard(): never {
    throw new Error('Leaderboard is out of scope for Sprint 001.');
  }

  startCampaign() {
    return Promise.resolve({ id: 'campaign-001', score: 0, lives: 3, nukes: 2, ranked: false, capability: 'test-capability', entry: { id: 'entry-001', position: 1, level: { slug: 'level-01', version: 1, checksum: '0'.repeat(64), definition: {} } } });
  }

  completeCampaignEntry() {
    return Promise.resolve({ id: 'campaign-001', status: 'ACTIVE' as const, score: 25, lives: 3, nukes: 2, ranked: false, capability: 'test-capability', entry: { id: 'entry-002', position: 2, level: { slug: 'level-02', version: 1, checksum: '1'.repeat(64), definition: {} } } });
  }

  startBoardingRun() {
    return Promise.resolve({
      id: 'boarding-001', status: 'ACTIVE' as const, validation_result: 'PENDING' as const,
      validation_code: '', seed: 1, time_limit_ms: 60000, interior_slug: 'alien-frigate',
      interior_version: 1, interior_checksum: '0'.repeat(64), shooter_state_digest: '0'.repeat(64),
      resources_start: { lives: 3, nukes: 2 }, return_state: null,
    });
  }

  completeBoardingRun() {
    return Promise.resolve({
      id: 'boarding-001', status: 'COMPLETED' as const, validation_result: 'VALID' as const,
      validation_code: '', seed: 1, time_limit_ms: 60000, interior_slug: 'alien-frigate',
      interior_version: 1, interior_checksum: '0'.repeat(64), shooter_state_digest: '0'.repeat(64),
      resources_start: { lives: 3, nukes: 2 }, return_state: { lives: 3, nukes: 2, score_delta: 0, remove_source_entity_id: 'enemy-001' },
    });
  }
}

test('game session starts online runs and completes each run once', async () => {
  const client = new FakeGameRunClient();
  const session = new GameSession(client, { slug: 'level-01', version: 1, checksum: '0'.repeat(64), seed: 11001 });
  await session.start();
  await session.start();
  assert.equal(client.starts, 1);
  assert.equal(session.runId, 'run-001');
  await session.complete({ score: 25, livesUsed: 1, livesEnd: 2, nukesEnd: 2, levelReached: 1, victory: false, eventSummary: { scout_destroyed: 1 } });
  await session.complete({ score: 25, livesUsed: 1, livesEnd: 2, nukesEnd: 2, levelReached: 1, victory: false, eventSummary: { scout_destroyed: 1 } });
  assert.equal(client.completions, 1);
});

test('game session remains playable offline without fabricated run id', async () => {
  const session = new GameSession(null);
  await session.start();
  assert.equal(session.offline, true);
  assert.equal(session.runId, null);
  assert.equal(await session.complete({ score: 25, livesUsed: 0, livesEnd: 3, nukesEnd: 2, levelReached: 1, victory: false, eventSummary: {} }), null);
});
