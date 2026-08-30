import { readFileSync } from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const CATALOGUE_IDS = [
  'H015-ENTRY-001', 'H015-LAUNCH-001', 'H015-MENU-001', 'H015-PAUSE-001', 'H015-PAUSE-002', 'H015-RESULT-001', 'H015-RESULT-002',
  'H015-AUTH-001', 'H015-AUTH-002', 'H015-PERM-001', 'H015-PERM-002', 'H015-DES-POINTER-001', 'H015-DES-POINTER-002', 'H015-DES-UNDO-001',
  'H015-DES-THUMB-001', 'H015-DES-META-001', 'H015-DES-CANVAS-001', 'H015-DES-SPAWN-001', 'H015-DES-ENTITY-001', 'H015-DES-FORM-001',
  'H015-DES-HAZARD-001', 'H015-DES-SHIELD-001', 'H015-DES-DROP-001', 'H015-DES-OBJ-001', 'H015-DES-BOARD-001', 'H015-DES-GAME-001',
  'H015-DES-BUDGET-001', 'H015-DES-ROUND-001', 'H015-DES-PIN-001', 'H015-DES-ROLL-001', 'H015-DES-AUDIT-001', 'H015-LEVELS-001',
  'H015-CAMP-001', 'H015-CAMP-002', 'H015-CAMP-003', 'H015-HAZ-001', 'H015-HAZ-002', 'H015-BOARD-ENTRY-001', 'H015-BOARD-COMBAT-001',
  'H015-BOARD-ANIM-001', 'H015-BOARD-PAUSE-001', 'H015-BOARD-RETURN-001', 'H015-BOARD-FAIL-001', 'H015-UI-ASSET-001', 'H015-A11Y-001',
  'H015-PERF-001', 'H015-PROD-001', 'H015-EVID-001', 'H015-CODE-001', 'H015-TEST-001',
];
const ALLOWED_LAYERS = new Set(['UNIT', 'COMPONENT', 'API', 'INTEGRATION', 'E2E_ORDINARY_USER', 'QA_DIAGNOSTIC']);
const ALLOWED_STATUS = new Set(['PENDING', 'PASS', 'FAIL', 'EXEMPT', 'BLOCKED_FOUNDER_AUTHORITY']);
const FULL_SHA = /^[a-f0-9]{40}$/i;

export function validateTraceability(register) {
  const failures = [];
  const rows = register?.requirements;
  if (!Array.isArray(rows)) return ['requirements must be an array.'];
  const indexed = new Map();
  for (const row of rows) {
    if (!CATALOGUE_IDS.includes(row.id)) failures.push(`unknown requirement: ${row.id}`);
    if (indexed.has(row.id)) failures.push(`duplicate requirement: ${row.id}`);
    indexed.set(row.id, row);
    for (const field of ['implementation', 'positive_tests', 'negative_tests', 'ci_jobs', 'evidence']) {
      if (!Array.isArray(row[field]) || row[field].length === 0) failures.push(`${row.id} has no ${field}.`);
    }
    if (!ALLOWED_LAYERS.has(row.test_layer)) failures.push(`${row.id} has invalid test_layer.`);
    if (!ALLOWED_STATUS.has(row.status)) failures.push(`${row.id} has invalid status.`);
    if (row.status === 'PASS') {
      if (!Array.isArray(row.evidence_receipts) || row.evidence_receipts.length === 0) {
        failures.push(`${row.id} PASS has no executable evidence_receipts.`);
      } else {
        for (const receipt of row.evidence_receipts) {
          if (typeof receipt.command !== 'string' || !receipt.command.trim()) failures.push(`${row.id} receipt has no command.`);
          if (!FULL_SHA.test(receipt.tested_sha ?? '')) failures.push(`${row.id} receipt has invalid tested_sha.`);
          if (receipt.result !== 'PASS') failures.push(`${row.id} receipt is not PASS.`);
        }
      }
    }
    if (row.status === 'BLOCKED_FOUNDER_AUTHORITY' && typeof row.blocker !== 'string') {
      failures.push(`${row.id} Founder block has no precise blocker.`);
    }
    if (row.test_layer === 'E2E_ORDINARY_USER' && row.qa_hooks?.length) failures.push(`${row.id} ordinary proof declares QA hooks.`);
    if (row.status === 'EXEMPT' && !row.exception_approval) failures.push(`${row.id} exemption has no Founder approval.`);
  }
  for (const id of CATALOGUE_IDS) if (!indexed.has(id)) failures.push(`catalogue requirement missing: ${id}`);
  return failures;
}

function main() {
  const file = path.resolve(process.argv[2] ?? 'docs/assurance/H015_REQUIREMENTS_TRACEABILITY.yaml');
  const register = YAML.parse(readFileSync(file, 'utf8'));
  const failures = validateTraceability(register);
  const totals = (register.requirements ?? []).reduce((accumulator, row) => {
    accumulator[row.status] = (accumulator[row.status] ?? 0) + 1;
    accumulator.layers[row.test_layer] = (accumulator.layers[row.test_layer] ?? 0) + 1;
    return accumulator;
  }, { layers: {} });
  const report = { result: failures.length ? 'FAIL' : 'PASS', catalogue_total: CATALOGUE_IDS.length, mapped_total: register.requirements?.length ?? 0, failures, totals };
  console.log(JSON.stringify(report, null, 2));
  if (failures.length) process.exitCode = 1;
}

if (import.meta.url === `file:///${process.argv[1].replaceAll('\\', '/')}`) main();
