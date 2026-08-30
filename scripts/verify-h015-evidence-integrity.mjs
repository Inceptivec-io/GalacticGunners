import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

export const REQUIRED_GATES = [
  'runtime-hostile', 'campaign-progression', 'boarding-entry-abort',
  'boarding-success-return', 'level4-hazards', 'designer-roundtrip',
  'designer-review-matrix', 'splash-navigation', 'auth-redirect',
  'player-logout', 'closure-audit',
];

const GENERIC_OBSERVATIONS = new Set(['Rendered and interacted without console or network failure.']);
const FULL_SHA = /^[a-f0-9]{40}$/i;
const SHA256 = /^[a-f0-9]{64}$/i;
const GATE_CLASSIFICATIONS = new Set(['AUTOMATED_BROWSER', 'MANUAL_FOUNDER', 'API', 'UNIT', 'QA_DIAGNOSTIC']);
const NORMAL_GAMEPLAY_GATES = new Set(['runtime-hostile', 'campaign-progression', 'boarding-entry-abort', 'boarding-success-return', 'level4-hazards']);

export function sha256(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

function evidenceDigest(gates) {
  const canonical = gates
    .filter((gate) => gate.id !== 'closure-audit')
    .map((gate) => ({
      id: gate.id,
      result: gate.result,
      tested_sha: gate.tested_sha,
      evidence: (gate.evidence ?? []).map((item) => ({ path: item.path, sha256: item.sha256, mime_type: item.mime_type })),
    }));
  return createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
}

export function auditManifest(manifest, { root, expectedSha, allowPendingClosureGate = false }) {
  const failures = [];
  const fail = (message) => failures.push(message);
  if (manifest.schema_version !== '1.0') fail('schema_version must be 1.0.');
  if (manifest.repository !== 'Inceptivec-io/GalacticGunners') fail('repository identity is invalid.');
  if (!FULL_SHA.test(expectedSha ?? '')) fail('GG_TESTED_SHA must be a full commit SHA.');
  if (manifest.commit_sha !== expectedSha) fail('manifest commit_sha does not equal GG_TESTED_SHA.');
  if (!Array.isArray(manifest.gates)) fail('gates must be an array.');

  const gates = new Map((manifest.gates ?? []).map((gate) => [gate.id, gate]));
  for (const required of REQUIRED_GATES) if (!gates.has(required)) fail(`required gate missing: ${required}`);
  const screenshotHashes = new Map();
  for (const gate of manifest.gates ?? []) {
    if (!GATE_CLASSIFICATIONS.has(gate.classification)) fail(`gate ${gate.id} has an invalid classification.`);
    if (typeof gate.route !== 'string' || gate.route.length === 0) fail(`gate ${gate.id} has no route.`);
    if (!Array.isArray(gate.setup) || gate.setup.length === 0) fail(`gate ${gate.id} has no setup trace.`);
    if (gate.tested_sha !== expectedSha || !FULL_SHA.test(gate.tested_sha ?? '')) fail(`gate ${gate.id} has invalid tested_sha.`);
    if (!Array.isArray(gate.actions) || gate.actions.length === 0) fail(`gate ${gate.id} has no action trace.`);
    if (!Array.isArray(gate.assertions) || gate.assertions.length === 0) fail(`gate ${gate.id} has no assertions.`);
    if (GENERIC_OBSERVATIONS.has(gate.observed) || !gate.observed || /^rendered and interacted/i.test(gate.observed)) fail(`gate ${gate.id} has only generic observation text.`);
    if (NORMAL_GAMEPLAY_GATES.has(gate.id) && gate.normal_gameplay_interaction !== true) fail(`gate ${gate.id} does not prove normal gameplay interaction.`);
    const qaRoute = /(?:[?&]qa=|[?&]preview_|[?&]api=offline)/i.test(gate.route);
    const qaAction = (gate.actions ?? []).some((action) => /force(?:complete|fail)|qa hook|direct state|synthetic/i.test(action));
    if (gate.normal_gameplay_interaction === true && (gate.classification === 'QA_DIAGNOSTIC' || qaRoute || qaAction)) {
      fail(`gate ${gate.id} claims normal gameplay while its route or actions use QA diagnostics.`);
    }
    // A published closure result is never allowed to remain pending. The
    // narrowly scoped attestation command may inspect the immutable pre-audit
    // evidence manifest, but every other caller is fail-closed.
    if (gate.id === 'closure-audit' && gate.result === 'PENDING' && allowPendingClosureGate) continue;
    if (gate.result !== 'PASS') fail(`gate ${gate.id} is not PASS.`);
    if ((gate.console_errors ?? []).length) fail(`gate ${gate.id} has console errors.`);
    if ((gate.network_failures ?? []).length) fail(`gate ${gate.id} has network failures.`);
    if (!Array.isArray(gate.evidence) || gate.evidence.length === 0) fail(`gate ${gate.id} has no evidence.`);
    if (gate.id === 'closure-audit' && !gate.evidence?.some((entry) => entry.path === 'closure_audit/closure-audit-result.json')) {
      fail('closure-audit has no closure evidence.');
    }
    for (const evidence of gate.evidence ?? []) {
      const file = path.resolve(root, evidence.path ?? '');
      if (!existsSync(file) || !statSync(file).isFile()) { fail(`missing evidence: ${gate.id}:${evidence.path}`); continue; }
      const digest = sha256(file);
      if (digest !== evidence.sha256) fail(`evidence hash mismatch: ${gate.id}:${evidence.path}`);
      if (evidence.mime_type === 'image/png' && evidence.distinct_state_group) {
        const key = `${evidence.distinct_state_group}:${digest}`;
        const prior = screenshotHashes.get(key);
        if (prior) fail(`duplicate required-state screenshot hash: ${prior} and ${gate.id}:${evidence.path}`);
        screenshotHashes.set(key, `${gate.id}:${evidence.path}`);
      }
    }
  }
  const artifact = manifest.artifact;
  if (!artifact?.name || !artifact?.path || !/^https?:\/\/|^file:\/\//.test(artifact.url ?? '') || !SHA256.test(artifact.sha256 ?? '')) fail('artifact metadata is incomplete.');
  else {
    const artifactPath = path.resolve(root, artifact.path);
    if (!existsSync(artifactPath)) fail('artifact file is missing.');
    else if (sha256(artifactPath) !== artifact.sha256) fail('artifact hash mismatch.');
  }
  return failures;
}

function verifyClosureGate(manifest, root, expectedSha, fail) {
  const gate = manifest.gates.find((entry) => entry.id === 'closure-audit');
  if (!gate) return;
  const evidence = gate.evidence?.find((entry) => entry.path === 'closure_audit/closure-audit-result.json');
  if (!evidence) { fail('closure-audit has no generated audit result evidence.'); return; }
  const resultPath = path.resolve(root, evidence.path);
  try {
    const result = JSON.parse(readFileSync(resultPath, 'utf8'));
    if (result.result !== 'PASS' || result.tested_sha !== expectedSha) fail('closure-audit result does not prove the exact tested SHA passed.');
    if (result.audited_evidence_digest !== evidenceDigest(manifest.gates) || gate.audit_subject_digest !== result.audited_evidence_digest) fail('closure-audit result does not match the generated artifact evidence.');
  } catch {
    fail('closure-audit result evidence is unreadable.');
  }
}

if (import.meta.url === `file:///${process.argv[1].replaceAll('\\', '/')}`) {
  const manifestPath = process.env.GG_EVIDENCE_MANIFEST
    ?? path.resolve(process.env.GG_EVIDENCE_DIR ?? 'FOUNDER_REVIEW_EVIDENCE.local', 'h015-evidence-manifest.json');
  const expectedSha = process.env.GG_TESTED_SHA;
  if (!existsSync(manifestPath)) throw new Error(`H015 evidence manifest does not exist: ${manifestPath}`);
  const root = path.dirname(manifestPath);
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const failures = auditManifest(manifest, { root, expectedSha });
  verifyClosureGate(manifest, root, expectedSha, (message) => failures.push(message));
  if (failures.length) throw new Error(`H015 closure audit failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
  console.log(`H015_EVIDENCE_IDENTITY=PASS\nH015_EVIDENCE_UNIQUENESS=PASS\nH015_CLOSURE_AUDIT=PASS`);
}
