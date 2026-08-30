import { readFileSync } from 'node:fs';
import YAML from 'yaml';

const traceability = YAML.parse(readFileSync('docs/assurance/H015_REQUIREMENTS_TRACEABILITY.yaml', 'utf8'));
const failures = (traceability.requirements ?? [])
  .filter((row) => row.test_layer === 'E2E_ORDINARY_USER' && Array.isArray(row.qa_hooks) && row.qa_hooks.length)
  .map((row) => `${row.id} assigns QA hooks to ordinary-user proof.`);

console.log(JSON.stringify({ result: failures.length ? 'FAIL' : 'PASS', violations: failures }, null, 2));
if (failures.length) process.exitCode = 1;
