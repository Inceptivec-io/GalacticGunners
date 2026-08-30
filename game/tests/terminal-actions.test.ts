import assert from 'node:assert/strict';
import test from 'node:test';

import { primaryTerminalAction } from '../src/systems/TerminalActions';

test('H015-RESULT-002 primary action continues every non-final server-pinned campaign entry', () => {
  for (const position of [1, 2, 3, 4, 5, 6]) {
    assert.equal(primaryTerminalAction({ terminalState: 'complete', hasNextEntry: true, offline: false, sequence: position, campaignLength: 7 }), 'continue');
  }
});

test('H015-RESULT-002 negative final entry and server rejection never expose Continue', () => {
  assert.equal(primaryTerminalAction({ terminalState: 'complete', hasNextEntry: false, offline: false, sequence: 7, campaignLength: 7 }), 'replay');
  assert.equal(primaryTerminalAction({ terminalState: 'failed', hasNextEntry: true, offline: false, sequence: 2, campaignLength: 7 }), 'try-again');
  assert.equal(primaryTerminalAction({ terminalState: 'complete', hasNextEntry: false, offline: false, sequence: 5, campaignLength: 7 }), 'replay');
});

test('H015-RESULT-002 explicit offline package progression never exceeds its configured campaign length', () => {
  assert.equal(primaryTerminalAction({ terminalState: 'complete', hasNextEntry: false, offline: true, sequence: 6, campaignLength: 7 }), 'continue');
  assert.equal(primaryTerminalAction({ terminalState: 'complete', hasNextEntry: false, offline: true, sequence: 7, campaignLength: 7 }), 'replay');
});
