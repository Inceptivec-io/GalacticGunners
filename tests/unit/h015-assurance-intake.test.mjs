import assert from "node:assert/strict";
import test from "node:test";

import { validateAssuranceRecoveryIntake } from "../../scripts/verify-h015-assurance-intake.mjs";

const replacementAdmissionRoot =
  "docs/internal_governance/handoff_in/_archive/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_015/11_ASSURANCE_RECOVERY_REPLACEMENT_TRANSPORT_MEMBERS/unpacked";

test("H015-EVID-001 positive: the delivered replacement sources and receipt reconcile", () => {
  assert.deepEqual(validateAssuranceRecoveryIntake({ root: replacementAdmissionRoot }), []);
});

test("H015-EVID-001 negative: a changed required transport hash fails closed", () => {
  const failures = validateAssuranceRecoveryIntake({
    expectedTransportHashes: {
      "GALACTIC_GUNNERS_H015_AUDIT_FINDINGS_PACK_v1.0.zip": "0".repeat(64),
    },
  });

  assert.ok(failures.some((failure) => failure.includes("transport hash")));
});
