import assert from "node:assert/strict";
import test from "node:test";
import { verifyClosureAttestation } from "../../scripts/verify-h015-closure-attestation.mjs";

const sha = "a".repeat(40);
const digest = "b".repeat(64);
const attestation = {
  attestation: "H015 exact-SHA closure attestation",
  tested_sha: sha,
  auditor: { source_commit: sha },
  evidence_artifact: { id: "7", name: `h015-browser-evidence-${sha}`, digest },
  closure_audit_evidence: {
    path: "closure-audit-result.json",
    sha256: "c".repeat(64),
  },
  closure_audit: "PASS",
  failed_gates: 0,
  pending_gates: 0,
  required_gates: [{ id: "runtime-hostile", result: "PASS" }],
};

test("H015-EVID-002 positive: post-upload attestation binds the exact source and evidence artifact", () => {
  assert.deepEqual(
    verifyClosureAttestation(attestation, {
      testedSha: sha,
      artifactId: 7,
      artifactDigest: digest,
    }),
    [],
  );
});

test("H015-EVID-002 negative: mismatched SHA and evidence digest fail closed", () => {
  const altered = structuredClone(attestation);
  altered.tested_sha = "c".repeat(40);
  altered.evidence_artifact.digest = "d".repeat(64);
  assert.match(
    verifyClosureAttestation(altered, {
      testedSha: sha,
      artifactId: 7,
      artifactDigest: digest,
    }).join("\n"),
    /tested SHA|digest/,
  );
});

test("H015-EVID-005 negative: an attestation without sealed audit evidence fails closed", () => {
  const altered = structuredClone(attestation);
  delete altered.closure_audit_evidence;
  assert.match(
    verifyClosureAttestation(altered, {
      testedSha: sha,
      artifactId: 7,
      artifactDigest: digest,
    }).join("\n"),
    /sealed closure-audit evidence/,
  );
});
