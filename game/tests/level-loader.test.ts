import test from 'node:test';
import assert from 'node:assert/strict';

import { LEVEL_ONE_DEFINITION } from '../src/levels/levelOneDefinition';
import { validateLevelDefinition } from '../src/levels/LevelValidator';

test('golden Level 1 preserves the accepted 58-enemy and 256-tile topology', () => {
  validateLevelDefinition(LEVEL_ONE_DEFINITION);
  assert.equal(LEVEL_ONE_DEFINITION.enemy_formations[0].rows * LEVEL_ONE_DEFINITION.enemy_formations[0].columns, 58);
  assert.equal(LEVEL_ONE_DEFINITION.shields[0].count * 32, 256);
});
