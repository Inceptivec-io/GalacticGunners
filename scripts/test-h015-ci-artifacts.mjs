import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const workflowPath = path.resolve(".github/workflows/quality.yml");
const workflow = readFileSync(workflowPath, "utf8");

function assertArtifactContract(source) {
  const evidenceUpload = source.indexOf("- name: Upload immutable H015 browser evidence");
  const attestation = source.indexOf("- name: Generate H015 closure attestation");
  const attestationUpload = source.indexOf("- name: Upload H015 closure attestation");

  assert.ok(evidenceUpload >= 0, "the immutable browser evidence upload is required");
  assert.ok(attestation > evidenceUpload, "closure attestation must be generated after evidence upload");
  assert.ok(attestationUpload > attestation, "closure attestation must be uploaded after generation");

  const attestationBlock = source.slice(attestation, attestationUpload);
  for (const required of [
    "GG_EVIDENCE_ARTIFACT_ID: ${{ steps.upload-evidence.outputs.artifact-id }}",
    "GG_EVIDENCE_ARTIFACT_DIGEST: ${{ steps.upload-evidence.outputs.artifact-digest }}",
    "GG_EVIDENCE_ARTIFACT_NAME: h015-browser-evidence-${{ steps.source-sha.outputs.value }}",
    "GG_CI_RUN_ID: ${{ github.run_id }}",
  ]) {
    assert.ok(attestationBlock.includes(required), `missing post-upload attestation binding: ${required}`);
  }
}

assertArtifactContract(workflow);

const missingDigest = workflow.replace(
  "GG_EVIDENCE_ARTIFACT_DIGEST: ${{ steps.upload-evidence.outputs.artifact-digest }}",
  "",
);
assert.throws(() => assertArtifactContract(missingDigest), /missing post-upload attestation binding/);

const reordered = workflow.replace(
  "- name: Upload immutable H015 browser evidence",
  "- name: GENERATED_ATTESTATION_BEFORE_EVIDENCE",
).replace(
  "- name: Generate H015 closure attestation",
  "- name: Upload immutable H015 browser evidence",
).replace(
  "- name: GENERATED_ATTESTATION_BEFORE_EVIDENCE",
  "- name: Generate H015 closure attestation",
);
assert.throws(() => assertArtifactContract(reordered), /must be generated after evidence upload/);

console.log("H015-EVID-005 CI artifact contract positive and negative tests passed.");
