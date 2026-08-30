import assert from 'node:assert/strict';
import { validateTraceability } from './validate-h015-traceability.mjs';

const valid = (id) => ({ id, implementation: ['x'], positive_tests: ['x'], negative_tests: ['x'], test_layer: 'UNIT', ci_jobs: ['unit'], evidence: ['junit'], status: 'PENDING' });
assert.ok(validateTraceability({ requirements: [] }).some((failure) => failure.startsWith('catalogue requirement missing:')));
const rows = [
  ...['H015-ENTRY-001', 'H015-LAUNCH-001', 'H015-MENU-001', 'H015-PAUSE-001', 'H015-PAUSE-002', 'H015-RESULT-001', 'H015-RESULT-002', 'H015-AUTH-001', 'H015-AUTH-002', 'H015-PERM-001', 'H015-PERM-002', 'H015-DES-POINTER-001', 'H015-DES-POINTER-002', 'H015-DES-UNDO-001', 'H015-DES-THUMB-001', 'H015-DES-META-001', 'H015-DES-CANVAS-001', 'H015-DES-SPAWN-001', 'H015-DES-ENTITY-001', 'H015-DES-FORM-001', 'H015-DES-HAZARD-001', 'H015-DES-SHIELD-001', 'H015-DES-DROP-001', 'H015-DES-OBJ-001', 'H015-DES-BOARD-001', 'H015-DES-GAME-001', 'H015-DES-BUDGET-001', 'H015-DES-ROUND-001', 'H015-DES-PIN-001', 'H015-DES-ROLL-001', 'H015-DES-AUDIT-001', 'H015-LEVELS-001', 'H015-CAMP-001', 'H015-CAMP-002', 'H015-CAMP-003', 'H015-HAZ-001', 'H015-HAZ-002', 'H015-BOARD-ENTRY-001', 'H015-BOARD-COMBAT-001', 'H015-BOARD-ANIM-001', 'H015-BOARD-PAUSE-001', 'H015-BOARD-RETURN-001', 'H015-BOARD-FAIL-001', 'H015-UI-ASSET-001', 'H015-A11Y-001', 'H015-PERF-001', 'H015-PROD-001', 'H015-EVID-001', 'H015-CODE-001', 'H015-TEST-001'].map(valid),
];
assert.equal(validateTraceability({ requirements: rows }).length, 0);
rows[0].test_layer = 'E2E_ORDINARY_USER'; rows[0].qa_hooks = ['__GALACTIC_GUNNERS_HOSTILE__'];
assert.ok(validateTraceability({ requirements: rows }).some((failure) => failure.includes('ordinary proof')));
rows[0].qa_hooks = [];
rows[0].status = 'PASS';
assert.ok(validateTraceability({ requirements: rows }).some((failure) => failure.includes('PASS has no executable evidence_receipts')));
rows[0].evidence_receipts = [{ command: 'npm run test', tested_sha: 'a'.repeat(40), result: 'PASS' }];
assert.equal(validateTraceability({ requirements: rows }).length, 0);
rows[0].status = 'BLOCKED_FOUNDER_AUTHORITY'; delete rows[0].evidence_receipts;
assert.ok(validateTraceability({ requirements: rows }).some((failure) => failure.includes('Founder block has no precise blocker')));
console.log('H015 traceability validator negative tests PASS');
