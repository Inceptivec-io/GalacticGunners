import { readFileSync } from "node:fs";
import YAML from "yaml";

const DIAGNOSTIC_MARKERS =
  /(?:[?&]qa=|force(?:complete|fail)|qa[_ -]?hook|direct state|synthetic)/i;

export function validateQaBoundaries(traceability) {
  const failures = [];
  for (const row of traceability.rows ?? []) {
    for (const testCase of row.test_cases ?? []) {
      const ordinary = testCase.classification === "E2E_ORDINARY_USER";
      const diagnostic = DIAGNOSTIC_MARKERS.test(
        `${testCase.command ?? ""} ${testCase.assertion ?? ""}`,
      );
      if (ordinary && diagnostic) {
        failures.push(
          `${row.requirement_id} maps a QA diagnostic to ordinary-user proof.`,
        );
      }
    }
  }
  return failures;
}

if (import.meta.url === `file:///${process.argv[1].replaceAll("\\", "/")}`) {
  const traceability = YAML.parse(
    readFileSync("docs/assurance/H015_REQUIREMENTS_TRACEABILITY.yaml", "utf8"),
  );
  const failures = validateQaBoundaries(traceability);
  console.log(
    JSON.stringify(
      { result: failures.length ? "FAIL" : "PASS", violations: failures },
      null,
      2,
    ),
  );
  if (failures.length) process.exitCode = 1;
}
