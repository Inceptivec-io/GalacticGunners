import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const FULL_SHA = /^[a-f0-9]{40}$/i;
const SHA256 = /^[a-f0-9]{64}$/i;

export function verifyClosureAttestation(
  attestation,
  { testedSha, artifactId, artifactDigest, root },
) {
  const failures = [];
  if (!FULL_SHA.test(testedSha ?? ""))
    failures.push("tested SHA must be a full commit SHA.");
  if (attestation?.attestation !== "H015 exact-SHA closure attestation")
    failures.push("invalid attestation type.");
  if (attestation?.tested_sha !== testedSha)
    failures.push("attestation tested SHA does not match expected SHA.");
  if (attestation?.auditor?.source_commit !== testedSha)
    failures.push(
      "attestation auditor source commit does not match expected SHA.",
    );
  if (attestation?.evidence_artifact?.id !== String(artifactId))
    failures.push("attestation evidence artifact ID does not match.");
  if (
    !SHA256.test(artifactDigest ?? "") ||
    attestation?.evidence_artifact?.digest !== artifactDigest
  )
    failures.push("attestation evidence artifact digest does not match.");
  if (
    attestation?.evidence_artifact?.name !==
    `h015-browser-evidence-${testedSha}`
  )
    failures.push(
      "attestation evidence artifact name does not bind the expected SHA.",
    );
  if (
    attestation?.closure_audit !== "PASS" ||
    attestation?.failed_gates !== 0 ||
    attestation?.pending_gates !== 0
  )
    failures.push("attestation does not prove a clean closure audit.");
  const auditEvidence = attestation?.closure_audit_evidence;
  if (!auditEvidence?.path || !SHA256.test(auditEvidence.sha256 ?? "")) {
    failures.push("attestation has no sealed closure-audit evidence.");
  } else if (root) {
    const auditPath = path.resolve(root, auditEvidence.path);
    if (!existsSync(auditPath))
      failures.push("closure-audit evidence file is missing.");
    else if (
      createHash("sha256").update(readFileSync(auditPath)).digest("hex") !==
      auditEvidence.sha256
    )
      failures.push("closure-audit evidence hash does not match.");
    else {
      const audit = JSON.parse(readFileSync(auditPath, "utf8"));
      if (
        audit.result !== "PASS" ||
        audit.tested_sha !== testedSha ||
        audit.evidence_artifact?.id !== String(artifactId) ||
        audit.evidence_artifact?.digest !== artifactDigest ||
        audit.failed_gates !== 0 ||
        audit.pending_gates !== 0
      )
        failures.push(
          "closure-audit evidence does not bind the passing exact-SHA artifact.",
        );
    }
  }
  if (
    !Array.isArray(attestation?.required_gates) ||
    attestation.required_gates.some((gate) => gate.result !== "PASS")
  )
    failures.push("attestation contains a non-passing required gate.");
  return failures;
}

if (import.meta.url === `file:///${process.argv[1].replaceAll("\\", "/")}`) {
  const [file, testedSha, artifactId, artifactDigest] = process.argv.slice(2);
  if (!file || !testedSha || !artifactId || !artifactDigest)
    throw new Error(
      "usage: verify-h015-closure-attestation <file> <sha> <artifact-id> <artifact-digest>",
    );
  const failures = verifyClosureAttestation(
    JSON.parse(readFileSync(file, "utf8")),
    { testedSha, artifactId, artifactDigest, root: path.dirname(file) },
  );
  if (failures.length)
    throw new Error(
      `H015 closure attestation verification failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`,
    );
  console.log("H015_CLOSURE_ATTESTATION_IDENTITY=PASS");
}
