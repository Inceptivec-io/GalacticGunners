import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { auditManifest, REQUIRED_GATES, sha256 } from './verify-h015-evidence-integrity.mjs';

const manifestPath = path.resolve(process.env.GG_EVIDENCE_MANIFEST
  ?? path.join(process.env.GG_EVIDENCE_DIR ?? 'FOUNDER_REVIEW_EVIDENCE.local', 'h015-evidence-manifest.json'));
const root = path.dirname(manifestPath);
const testedSha = process.env.GG_TESTED_SHA;
const artifactId = process.env.GG_EVIDENCE_ARTIFACT_ID;
const artifactName = process.env.GG_EVIDENCE_ARTIFACT_NAME;
const artifactDigest = process.env.GG_EVIDENCE_ARTIFACT_DIGEST;
const ciRunId = process.env.GG_CI_RUN_ID ?? 'local-founder';
const outputDirectory = path.resolve(process.env.GG_CLOSURE_ATTESTATION_DIR ?? path.join(root, '..', 'h015-closure-attestation'));

function requireValue(value, name) {
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8').replace(/^\uFEFF/, ''));
const failures = auditManifest(manifest, { root, expectedSha: testedSha, allowPendingClosureGate: true });
const closureGate = manifest.gates?.find((gate) => gate.id === 'closure-audit');
if (!closureGate || closureGate.result !== 'PENDING' || (closureGate.evidence ?? []).length !== 0) {
  failures.push('pre-attestation evidence manifest must contain a PENDING closure-audit gate with no closure evidence.');
}
const requiredGates = manifest.gates?.filter((gate) => gate.id !== 'closure-audit') ?? [];
if (requiredGates.length !== REQUIRED_GATES.length - 1) failures.push('pre-attestation manifest does not contain every substantive required gate.');
if (failures.length) throw new Error(`H015 pre-attestation audit failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`);

const gateResults = manifest.gates.map((gate) => ({ id: gate.id, result: gate.id === 'closure-audit' ? 'PASS' : gate.result }));
const failedGates = gateResults.filter((gate) => gate.result === 'FAIL').length;
const pendingGates = gateResults.filter((gate) => gate.result === 'PENDING').length;
if (failedGates !== 0 || pendingGates !== 0) throw new Error(`H015 attestation cannot close with failed=${failedGates} pending=${pendingGates}.`);

mkdirSync(outputDirectory, { recursive: true });
const attestation = {
  schema_version: '1.0',
  attestation: 'H015 exact-SHA closure attestation',
  generated_at: new Date().toISOString(),
  tested_sha: requireValue(testedSha, 'GG_TESTED_SHA'),
  ci_run_id: ciRunId,
  evidence_artifact: {
    id: requireValue(artifactId, 'GG_EVIDENCE_ARTIFACT_ID'),
    name: requireValue(artifactName, 'GG_EVIDENCE_ARTIFACT_NAME'),
    digest: requireValue(artifactDigest, 'GG_EVIDENCE_ARTIFACT_DIGEST'),
  },
  manifest: { path: path.basename(manifestPath), sha256: sha256(manifestPath) },
  required_gates: gateResults,
  evidence_uniqueness: 'PASS',
  closure_audit: 'PASS',
  failed_gates: failedGates,
  pending_gates: pendingGates,
  auditor: {
    command: 'node scripts/generate-h015-closure-attestation.mjs',
    source_commit: testedSha,
    mode: 'strict substantive-gate audit over immutable uploaded evidence manifest',
  },
};
const output = path.join(outputDirectory, 'h015-closure-attestation.json');
writeFileSync(output, `${JSON.stringify(attestation, null, 2)}\n`);
console.log(`CLOSURE_ATTESTATION=${output}\nCLOSURE_AUDIT=PASS\nFAILED_GATES=0\nPENDING_GATES=0`);
