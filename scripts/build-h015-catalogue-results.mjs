import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { sha256 } from "./verify-h015-evidence-integrity.mjs";

const sha = process.env.GG_TESTED_SHA;
if (!/^[a-f0-9]{40}$/i.test(sha ?? ""))
  throw new Error("GG_TESTED_SHA must be an exact 40-character SHA.");

const root = path.resolve(
  process.env.GG_EVIDENCE_DIR ?? "FOUNDER_REVIEW_EVIDENCE.local",
);
const traceabilityPath = path.resolve(
  "docs/assurance/H015_REQUIREMENTS_TRACEABILITY.yaml",
);
const commandsPath = path.join(root, "catalogue", "command-results.json");
if (!existsSync(commandsPath))
  throw new Error("Missing catalogue command result record.");

const commands = JSON.parse(readFileSync(commandsPath, "utf8"));
if (commands.tested_sha !== sha || !Array.isArray(commands.cases))
  throw new Error(
    "Catalogue command results are not an exact-SHA case record.",
  );
const byTestCase = new Map(
  commands.cases.map((entry) => [entry.test_case_id, entry]),
);
const traceability = YAML.parse(readFileSync(traceabilityPath, "utf8"));

function evidenceFor(testCase) {
  const result = byTestCase.get(testCase.id);
  if (!result || result.result !== "PASS" || !result.log_path) return null;
  const file = path.join(root, result.log_path);
  if (!existsSync(file)) return null;
  return {
    path: result.log_path,
    sha256: sha256(file),
    mime_type: "text/plain",
    test_case_id: testCase.id,
    command: result.command,
  };
}

const rows = traceability.rows.map((row) => {
  const evidence = row.test_cases.map(evidenceFor).filter(Boolean);
  const positive = row.test_cases.filter(
    (testCase) => testCase.polarity === "POSITIVE",
  );
  const negative = row.test_cases.filter(
    (testCase) => testCase.polarity === "NEGATIVE",
  );
  const deferredClosureAudit =
    row.requirement_id === "H015-QUAL-004" &&
    positive.length === 1 &&
    negative.length === 1 &&
    byTestCase.get(positive[0].id)?.result === "DEFERRED" &&
    evidenceFor(negative[0]) !== null;
  return {
    requirement_id: row.requirement_id,
    result:
      evidence.length === row.test_cases.length &&
      positive.length &&
      negative.length
        ? "PASS"
        : deferredClosureAudit
          ? "PENDING"
          : "FAIL",
    tested_sha: sha,
    positive_test_ids: positive.map((testCase) => testCase.id),
    negative_test_ids: negative.map((testCase) => testCase.id),
    evidence,
  };
});
const unresolvedRows = rows.filter((row) => row.result !== "PASS");
const overall =
  unresolvedRows.length === 0 ||
  (unresolvedRows.length === 1 &&
    unresolvedRows[0].requirement_id === "H015-QUAL-004" &&
    unresolvedRows[0].result === "PENDING")
    ? "PASS"
    : "FAIL";
const output = path.join(root, "catalogue", "assurance-catalogue-results.json");
writeFileSync(
  output,
  `${JSON.stringify(
    {
      schema_version: "2.0",
      tested_sha: sha,
      result: overall,
      requirement_count: rows.length,
      passed_requirement_count: rows.filter((row) => row.result === "PASS")
        .length,
      pending_requirement_count: rows.filter((row) => row.result === "PENDING")
        .length,
      pending_closure_audit_only:
        unresolvedRows.length === 1 &&
        unresolvedRows[0].requirement_id === "H015-QUAL-004" &&
        unresolvedRows[0].result === "PENDING",
      rows,
    },
    null,
    2,
  )}\n`,
);
if (overall !== "PASS")
  throw new Error(
    `The exact-SHA catalogue contains incomplete assurance rows: ${rows
      .filter((row) => row.result === "FAIL")
      .map((row) => row.requirement_id)
      .join(", ")}`,
  );
console.log(`H015_ASSURANCE_CATALOGUE=PASS\nH015_ASSURANCE_RESULTS=${output}`);
