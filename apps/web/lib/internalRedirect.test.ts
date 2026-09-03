import assert from 'node:assert/strict';
import test from 'node:test';

import { safeInternalRedirect } from './internalRedirect';

const origin = 'https://galactic-gunners.example';

test('GG-AUTH-SESSION-001 accepts same-origin application paths', () => {
  assert.equal(safeInternalRedirect('/command-post?tab=maps#draft', '/account', origin), '/command-post?tab=maps#draft');
  assert.equal(safeInternalRedirect('/inceptivec-gamification-admin', '/account', origin), '/inceptivec-gamification-admin');
});

test('GG-AUTH-SESSION-001 negative rejects external and encoded redirect attacks', () => {
  for (const candidate of ['https://attacker.example', '//attacker.example', '\\attacker', '/%2f%2fattacker', '/%5cattacker', 'javascript:alert(1)', '/play%3Fnext=https://attacker.example']) {
    assert.equal(safeInternalRedirect(candidate, '/account', origin), '/account', candidate);
  }
});
