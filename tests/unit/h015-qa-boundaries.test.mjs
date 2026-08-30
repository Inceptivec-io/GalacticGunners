import assert from "node:assert/strict";
import test from "node:test";

import { validateQaBoundaries } from "../../scripts/validate-qa-hook-boundaries.mjs";

test("H015-EVID-006 positive: ordinary browser evidence excludes diagnostics", () => {
  assert.deepEqual(validateQaBoundaries({ rows: [] }), []);
});

test("H015-EVID-006 negative: a force hook cannot map to ordinary E2E proof", () => {
  const failures = validateQaBoundaries({
    rows: [
      {
        requirement_id: "H015-GAME-001",
        required_layers: ["E2E"],
        test_cases: [
          {
            classification: "E2E_ORDINARY_USER",
            command: "npm run runtime:hostile -- --forceComplete",
          },
        ],
      },
    ],
  });

  assert.ok(failures.some((failure) => failure.includes("QA diagnostic")));
});
