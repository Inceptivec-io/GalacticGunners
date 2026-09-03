import assert from "node:assert/strict";
import { validateTraceability } from "./validate-h015-traceability.mjs";

const ids = ["GG-ASSURANCE-EVIDENCE-001"];
const row = () => ({
  requirement_id: "GG-ASSURANCE-EVIDENCE-001",
  implementation_paths: ["docs/receipt.md"],
  required_layers: ["PROCESS"],
  positive_proof: "receipt matches",
  negative_or_hostile_proof: "altered receipt fails",
  evidence_gate: "intake",
  evidence_paths: [],
  status: "FAIL",
  reason: "proof is incomplete",
  test_cases: [
    {
      id: "positive",
      classification: "PROCESS",
      polarity: "POSITIVE",
      command: "UNPROVEN: add test",
      assertion: "matches",
    },
    {
      id: "negative",
      classification: "PROCESS",
      polarity: "NEGATIVE",
      command: "UNPROVEN: add test",
      assertion: "fails",
    },
  ],
});

assert.deepEqual(
  validateTraceability({ expected_requirement_count: 50, rows: [row()] }, ids),
  [],
);

const missingNegative = row();
missingNegative.test_cases.pop();
assert.ok(
  validateTraceability(
    { expected_requirement_count: 50, rows: [missingNegative] },
    ids,
  ).some((failure) => failure.includes("positive and negative")),
);

const manualPass = row();
manualPass.status = "PASS";
manualPass.evidence_paths = ["receipt.md"];
assert.ok(
  validateTraceability(
    { expected_requirement_count: 50, rows: [manualPass] },
    ids,
  ).some((failure) => failure.includes("unproven test mapping")),
);

const pending = row();
pending.status = "PENDING";
assert.ok(
  validateTraceability(
    { expected_requirement_count: 50, rows: [pending] },
    ids,
  ).some((failure) => failure.includes("invalid status")),
);

console.log("Semantic traceability validator negative tests PASS");
