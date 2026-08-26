import test from 'node:test';
import assert from 'node:assert/strict';

import { PickupSystem } from '../src/systems/PickupSystem';
import { SeededRng } from '../src/systems/SeededRng';

test('seeded pickup selection and collection are deterministic and deduplicated', () => {
  const entries = [{ pickup: 'nuke' as const, weight: 1 }, { pickup: 'life' as const, weight: 1 }];
  const first = new PickupSystem(new SeededRng(12002));
  const second = new PickupSystem(new SeededRng(12002));
  assert.equal(first.choose('scout-1', entries), second.choose('scout-1', entries));
  assert.equal(first.collect('scout-1'), true);
  assert.equal(first.collect('scout-1'), false);
  assert.equal(first.choose('scout-1', entries), null);
});
