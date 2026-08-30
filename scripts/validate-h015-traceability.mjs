import { readFileSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";

const ALLOWED_STATUS = new Set(["PASS", "FAIL", "BLOCKED_FOUNDER_AUTHORITY"]);
const FULL_SHA = /^[a-f0-9]{40}$/i;

function catalogueIds(file) {
  const lines = readFileSync(file, "utf8").trim().split(/\r?\n/);
  return lines.slice(1).map((line) => line.split(",", 1)[0]);
}

export function validateTraceability(register, expectedIds) {
  const failures = [];
  const rows = register?.rows;
  if (register?.expected_requirement_count !== 50)
    failures.push("expected_requirement_count must be 50.");
  if (!Array.isArray(rows)) return ["rows must be an array."];

  const indexed = new Map();
  for (const row of rows) {
    if (!expectedIds.includes(row.requirement_id))
      failures.push(`unknown requirement: ${row.requirement_id}`);
    if (indexed.has(row.requirement_id))
      failures.push(`duplicate requirement: ${row.requirement_id}`);
    indexed.set(row.requirement_id, row);
    for (const field of [
      "implementation_paths",
      "required_layers",
      "positive_proof",
      "negative_or_hostile_proof",
      "evidence_gate",
      "reason",
    ]) {
      const value = row[field];
      if ((Array.isArray(value) && value.length === 0) || !value)
        failures.push(`${row.requirement_id} has no ${field}.`);
    }
    if (!ALLOWED_STATUS.has(row.status))
      failures.push(`${row.requirement_id} has invalid status.`);
    if (!Array.isArray(row.test_cases) || row.test_cases.length < 2) {
      failures.push(
        `${row.requirement_id} must map positive and negative tests.`,
      );
      continue;
    }
    const polarities = new Set(row.test_cases.map((entry) => entry.polarity));
    if (!polarities.has("POSITIVE") || !polarities.has("NEGATIVE"))
      failures.push(
        `${row.requirement_id} is missing a positive or negative test mapping.`,
      );
    for (const testCase of row.test_cases) {
      for (const field of [
        "id",
        "classification",
        "polarity",
        "command",
        "assertion",
      ]) {
        if (!testCase[field])
          failures.push(`${row.requirement_id} test mapping has no ${field}.`);
      }
    }
    if (row.status === "PASS") {
      if (!Array.isArray(row.evidence_paths) || row.evidence_paths.length === 0)
        failures.push(`${row.requirement_id} PASS has no evidence paths.`);
      for (const testCase of row.test_cases) {
        if (/^UNPROVEN:/i.test(testCase.command ?? ""))
          failures.push(
            `${row.requirement_id} PASS depends on an unproven test mapping.`,
          );
      }
      if (row.tested_sha && !FULL_SHA.test(row.tested_sha))
        failures.push(`${row.requirement_id} has an invalid tested_sha.`);
    }
    if (row.status === "BLOCKED_FOUNDER_AUTHORITY" && !row.blocker)
      failures.push(
        `${row.requirement_id} Founder block has no precise blocker.`,
      );
  }
  for (const id of expectedIds)
    if (!indexed.has(id)) failures.push(`catalogue requirement missing: ${id}`);
  return failures;
}

function main() {
  const registerFile = path.resolve(
    process.argv[2] ?? "docs/assurance/H015_REQUIREMENTS_TRACEABILITY.yaml",
  );
  const catalogueFile = path.resolve(
    "docs/internal_governance/handoff_in/_archive/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_015/10_ASSURANCE_RECOVERY_TRANSPORT_MEMBERS/GALACTIC_GUNNERS_H015_COMPLETE_RECOVERY_PACK_v1.0(1)/REQUIREMENT_CATALOGUE.csv",
  );
  const register = YAML.parse(readFileSync(registerFile, "utf8"));
  const expectedIds = catalogueIds(catalogueFile);
  const failures = validateTraceability(register, expectedIds);
  const totals = (register.rows ?? []).reduce(
    (summary, row) => {
      summary.statuses[row.status] = (summary.statuses[row.status] ?? 0) + 1;
      for (const layer of row.required_layers ?? [])
        summary.layers[layer] = (summary.layers[layer] ?? 0) + 1;
      return summary;
    },
    { statuses: {}, layers: {} },
  );
  console.log(
    JSON.stringify(
      {
        result: failures.length ? "FAIL" : "PASS",
        catalogue_total: expectedIds.length,
        mapped_total: register.rows?.length ?? 0,
        failures,
        totals,
      },
      null,
      2,
    ),
  );
  if (failures.length) process.exitCode = 1;
}

if (import.meta.url === `file:///${process.argv[1].replaceAll("\\", "/")}`)
  main();
