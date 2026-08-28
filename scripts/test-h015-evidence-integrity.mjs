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
const gate = (id, index) => ({ id, classification: 'AUTOMATED_BROWSER', route: '/play', setup: ['start clean runtime'], actions: [`perform action ${index}`], assertions: [`assert outcome ${index}`], tested_sha: sha, observed: `Observed outcome ${index}`, result: 'PASS', evidence: [{ path: 'evidence.png', sha256: sha256(image), mime_type: index ? 'application/json' : 'image/png' }], console_errors: [], network_failures: [] });
const manifest = { schema_version: '1.0', repository: 'Inceptivec-io/GalacticGunners', branch: 'feature/v1-platform-foundation-campaign-continuity', commit_sha: sha, ci_run_id: '1', generated_at: new Date().toISOString(), runner: { kind: 'local-founder', os: process.platform, browser: 'Chromium' }, gates: REQUIRED_GATES.map(gate), artifact: { name: 'test', path: 'artifact.json', sha256: sha256(artifact) } };
assert.deepEqual(auditManifest(manifest, { root, expectedSha: sha }), []);
manifest.gates[0].tested_sha = 'UNSPECIFIED';
assert.match(auditManifest(manifest, { root, expectedSha: sha }).join('\n'), /invalid tested_sha/);
console.log('H015 evidence integrity tests passed.');
