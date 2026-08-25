import assert from 'node:assert/strict';
import test from 'node:test';

import {
  COMET_NUKE_BONUS,
  MINIMUM_SCORE,
  PLAYER_DAMAGE_SCORE_PENALTY,
  SCORE_EVENT_VALUES,
  ScoreSystem,
  mergeInputCapabilities,
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
});
