import assert from "node:assert/strict";
import test from "node:test";

import { validateAssuranceRecoveryIntake } from "../../scripts/verify-h015-assurance-intake.mjs";

test("H015-EVID-001 positive: the admitted recovery sources and receipt reconcile", () => {
  assert.deepEqual(validateAssuranceRecoveryIntake(), []);
});

test("H015-EVID-001 negative: a changed required transport hash fails closed", () => {
  const failures = validateAssuranceRecoveryIntake({
    expectedTransportHashes: {
      "GALACTIC_GUNNERS_H015_AUDIT_FINDINGS_PACK_v1.0.zip": "0".repeat(64),
    },
  });

  assert.ok(failures.some((failure) => failure.includes("transport hash")));
});
