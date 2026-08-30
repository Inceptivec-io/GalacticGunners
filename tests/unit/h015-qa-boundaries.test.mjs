import assert from "node:assert/strict";
import test from "node:test";

import {
  validateQaBoundaries,
  validateTestInventory,
} from "../../scripts/validate-qa-hook-boundaries.mjs";

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

test("H015-EVID-006 positive: every discovered test has an allowed classification", () => {
  assert.deepEqual(
    validateTestInventory({
      discovered: ["tests/e2e/root.spec.ts", "backend/tests/test_api.py"],
      entries: [
        { file: "tests/e2e/root.spec.ts", classification: "E2E_ORDINARY_USER" },
        { file: "backend/tests/test_api.py", classification: "API" },
      ],
      contentsByFile: { "tests/e2e/root.spec.ts": "await page.click('Play')" },
    }),
    [],
  );
});

test("H015-EVID-006 negative: a missing or diagnostic ordinary test fails closed", () => {
  const failures = validateTestInventory({
    discovered: ["tests/e2e/root.spec.ts", "tests/e2e/missing.spec.ts"],
    entries: [
      { file: "tests/e2e/root.spec.ts", classification: "E2E_ORDINARY_USER" },
    ],
    contentsByFile: { "tests/e2e/root.spec.ts": "window.__GALACTIC_GUNNERS_HOSTILE__" },
  });
  assert.ok(failures.some((failure) => failure.includes("QA diagnostics")));
  assert.ok(failures.some((failure) => failure.includes("Unclassified test source")));
});
