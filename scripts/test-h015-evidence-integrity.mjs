import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { auditManifest, REQUIRED_GATES, sha256 } from './verify-h015-evidence-integrity.mjs';

const root = mkdtempSync(path.join(os.tmpdir(), 'gg-h015-evidence-test-'));
const image = path.join(root, 'evidence.png');
const artifact = path.join(root, 'artifact.json');
writeFileSync(image, 'distinct test image');
writeFileSync(artifact, '{}');
const sha = 'a'.repeat(40);
const gate = (id, index) => ({ id, classification: 'AUTOMATED_BROWSER', route: '/play', setup: ['start clean runtime'], actions: [`perform action ${index}`], assertions: [`assert outcome ${index}`], tested_sha: sha, observed: `Observed outcome ${index}`, normal_gameplay_interaction: true, result: 'PASS', evidence: [{ path: 'evidence.png', sha256: sha256(image), mime_type: index ? 'application/json' : 'image/png' }], console_errors: [], network_failures: [] });
const manifest = { schema_version: '1.0', repository: 'Inceptivec-io/GalacticGunners', branch: 'feature/v1-platform-foundation-campaign-continuity', commit_sha: sha, ci_run_id: '1', generated_at: new Date().toISOString(), runner: { kind: 'local-founder', os: process.platform, browser: 'Chromium' }, gates: REQUIRED_GATES.map(gate), artifact: { name: 'test', url: 'file:///artifact.json', path: 'artifact.json', sha256: sha256(artifact) } };
assert.deepEqual(auditManifest(manifest, { root, expectedSha: sha }), []);

const cloneManifest = () => structuredClone(manifest);
const invalidSha = cloneManifest();
invalidSha.gates[0].tested_sha = 'UNSPECIFIED';
assert.match(auditManifest(invalidSha, { root, expectedSha: sha }).join('\n'), /invalid tested_sha/);

const genericObservation = cloneManifest();
genericObservation.gates[0].observed = 'Rendered and interacted without console or network failure.';
assert.match(auditManifest(genericObservation, { root, expectedSha: sha }).join('\n'), /generic observation/);

const duplicateScreenshot = cloneManifest();
duplicateScreenshot.gates[0].evidence[0].distinct_state_group = 'campaign-progression';
duplicateScreenshot.gates[1].evidence[0].mime_type = 'image/png';
duplicateScreenshot.gates[1].evidence[0].distinct_state_group = 'campaign-progression';
assert.match(auditManifest(duplicateScreenshot, { root, expectedSha: sha }).join('\n'), /duplicate required-state screenshot hash/);

const missingActionTrace = cloneManifest();
missingActionTrace.gates[0].actions = [];
assert.match(auditManifest(missingActionTrace, { root, expectedSha: sha }).join('\n'), /no action trace/);

const failedGate = cloneManifest();
failedGate.gates.find((entry) => entry.id === 'campaign-progression').result = 'FAIL';
assert.match(auditManifest(failedGate, { root, expectedSha: sha }).join('\n'), /campaign-progression is not PASS/);

const missingGate = cloneManifest();
missingGate.gates = missingGate.gates.filter((entry) => entry.id !== 'boarding-success-return');
assert.match(auditManifest(missingGate, { root, expectedSha: sha }).join('\n'), /required gate missing: boarding-success-return/);

const missingEvidence = cloneManifest();
missingEvidence.gates.find((entry) => entry.id === 'designer-roundtrip').evidence[0].path = 'missing-designer-evidence.png';
assert.match(auditManifest(missingEvidence, { root, expectedSha: sha }).join('\n'), /missing evidence: designer-roundtrip/);

const mismatchedSha = cloneManifest();
mismatchedSha.gates.find((entry) => entry.id === 'boarding-success-return').tested_sha = 'b'.repeat(40);
assert.match(auditManifest(mismatchedSha, { root, expectedSha: sha }).join('\n'), /invalid tested_sha/);

const duplicateDesigner = cloneManifest();
duplicateDesigner.gates.find((entry) => entry.id === 'designer-roundtrip').evidence[0].mime_type = 'image/png';
duplicateDesigner.gates.find((entry) => entry.id === 'designer-roundtrip').evidence[0].distinct_state_group = 'designer-review-matrix';
duplicateDesigner.gates.find((entry) => entry.id === 'designer-review-matrix').evidence[0].mime_type = 'image/png';
duplicateDesigner.gates.find((entry) => entry.id === 'designer-review-matrix').evidence[0].distinct_state_group = 'designer-review-matrix';
assert.match(auditManifest(duplicateDesigner, { root, expectedSha: sha }).join('\n'), /duplicate required-state screenshot hash/);

const duplicateBoarding = cloneManifest();
duplicateBoarding.gates.find((entry) => entry.id === 'boarding-entry-abort').evidence[0].mime_type = 'image/png';
duplicateBoarding.gates.find((entry) => entry.id === 'boarding-entry-abort').evidence[0].distinct_state_group = 'boarding-success-return';
duplicateBoarding.gates.find((entry) => entry.id === 'boarding-success-return').evidence[0].mime_type = 'image/png';
duplicateBoarding.gates.find((entry) => entry.id === 'boarding-success-return').evidence[0].distinct_state_group = 'boarding-success-return';
assert.match(auditManifest(duplicateBoarding, { root, expectedSha: sha }).join('\n'), /duplicate required-state screenshot hash/);
console.log('H015 evidence integrity tests passed.');
