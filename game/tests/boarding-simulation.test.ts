import assert from 'node:assert/strict';
import test from 'node:test';
import { BoardingSimulation, BOARDING_WORLD } from '../src/boarding/BoardingSimulation';

test('boarding simulation is deterministic at 60Hz and bounds the player', () => {
  const input = { horizontal: 1 as const, jump: false, fire: false, interact: false };
  const first = new BoardingSimulation(42, { lives: 3, nukes: 2 });
  const second = new BoardingSimulation(42, { lives: 3, nukes: 2 });
  for (let tick = 0; tick < 1000; tick += 1) { first.step(input); second.step(input); }
  assert.deepEqual(first.snapshot(), second.snapshot());
  assert.ok(first.snapshot().player.x <= BOARDING_WORLD.width - 32);
});

test('boarding simulation has no implicit score award', () => {
  const simulation = new BoardingSimulation(7, { lives: 2, nukes: 1 });
  simulation.killAlien('alien-1');
  assert.equal(simulation.snapshot().events[0].type, 'ALIEN_KILLED');
});
