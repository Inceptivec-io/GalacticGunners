import assert from 'node:assert/strict';
import test from 'node:test';
import { BoardingSimulation, BOARDING_WORLD } from '../src/boarding/BoardingSimulation';
import { canonicalBoardingJson } from '../src/boarding/snapshot';
import { SeededRng } from '../src/systems/SeededRng';
import { BoardingCoordinator } from '../src/boarding/BoardingCoordinator';

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
  simulation.killAlien('alien-01');
  assert.equal(simulation.snapshot().events[0].type, 'ALIEN_KILLED');
});

test('boarding snapshot canonicalization sorts nested objects and rejects non-finite values', () => {
  assert.equal(canonicalBoardingJson({ z: { b: 2, a: 1 }, a: [{ d: 4, c: 3 }] }), '{"a":[{"c":3,"d":4}],"z":{"a":1,"b":2}}');
  assert.throws(() => canonicalBoardingJson({ nan: Number.NaN }), /non-finite/);
});

test('boarding uses the specified LCG sequence', () => {
  const rng = new SeededRng(2387739613);
  const states = Array.from({ length: 3 }, () => Math.floor(rng.next() * 0x1_0000_0000));
  assert.deepEqual(states, [2226664344, 1747984919, 146069642]);
});

test('boarding coordinator freezes score authority at the scene boundary', async () => {
  const simulation = new BoardingSimulation(99, { lives: 2, nukes: 1 });
  const coordinator = new BoardingCoordinator();
  const opened = await coordinator.open({ anchorId: 'level-04-alien-frigate-01', sourceEntityId: 'level-04:formation-0:r0:c14', resources: { lives: 2, nukes: 1 }, snapshot: simulation.snapshot() });
  assert.match(opened.shooterStateDigest, /^[0-9a-f]{64}$/);
  coordinator.accept();
  const result = coordinator.complete('SUCCESS', { lives: 4, nukes: -1 });
  assert.deepEqual(result.resources, { lives: 3, nukes: 0 });
  assert.equal(result.offer.sourceEntityId, 'level-04:formation-0:r0:c14');
});
