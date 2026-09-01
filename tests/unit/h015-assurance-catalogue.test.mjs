import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import YAML from "yaml";

const root = mkdtempSync(path.join(os.tmpdir(), "gg-h015-catalogue-test-"));
const sha = "a".repeat(40);
const catalogue = path.join(root, "catalogue");
mkdirSync(path.join(catalogue, "commands"), { recursive: true });

const traceability = YAML.parse(
  await import("node:fs/promises").then(({ readFile }) =>
    readFile("docs/assurance/H015_REQUIREMENTS_TRACEABILITY.yaml", "utf8"),
  ),
);
const cases = traceability.rows
  .flatMap((row) => row.test_cases)
  .map((testCase, index) => {
    const logPath = `catalogue/commands/${index + 1}.log`;
    writeFileSync(path.join(root, logPath), `${testCase.id} passed\n`);
    return {
      test_case_id: testCase.id,
      command: testCase.command,
      result: "PASS",
      log_path: logPath,
    };
  });
writeFileSync(
  path.join(catalogue, "command-results.json"),
  `${JSON.stringify({ tested_sha: sha, result: "PASS", cases }, null, 2)}\n`,
);

function run(directory) {
  return spawnSync("node", ["scripts/build-h015-catalogue-results.mjs"], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, GG_TESTED_SHA: sha, GG_EVIDENCE_DIR: directory },
  });
}

const passing = run(root);
assert.equal(passing.status, 0, passing.stderr);
const result = JSON.parse(
  await import("node:fs/promises").then(({ readFile }) =>
    readFile(path.join(catalogue, "assurance-catalogue-results.json"), "utf8"),
  ),
);
assert.equal(result.result, "PASS");
assert.equal(result.requirement_count, 50);
assert.equal(result.rows.filter((row) => row.result === "PASS").length, 50);

const preAttestation = mkdtempSync(
  path.join(os.tmpdir(), "gg-h015-catalogue-pre-attestation-"),
);
mkdirSync(path.join(preAttestation, "catalogue", "commands"), {
  recursive: true,
});
const preAttestationCases = cases.map((entry) => ({ ...entry }));
for (const entry of preAttestationCases) {
  writeFileSync(
    path.join(preAttestation, entry.log_path),
    `${entry.test_case_id} passed\n`,
  );
}
const closurePositive = preAttestationCases.find(
  (entry) => entry.test_case_id === "H015-QUAL-004 positive",
);
assert.ok(closurePositive);
closurePositive.result = "DEFERRED";
writeFileSync(
  path.join(preAttestation, "catalogue", "command-results.json"),
  `${JSON.stringify(
    { tested_sha: sha, result: "PENDING", cases: preAttestationCases },
    null,
    2,
  )}\n`,
);
const preAttestationResult = run(preAttestation);
assert.equal(preAttestationResult.status, 0, preAttestationResult.stderr);
const preAttestationCatalogue = JSON.parse(
  await import("node:fs/promises").then(({ readFile }) =>
    readFile(
      path.join(
        preAttestation,
        "catalogue",
        "assurance-catalogue-results.json",
      ),
      "utf8",
    ),
  ),
);
assert.equal(preAttestationCatalogue.result, "PASS");
assert.equal(preAttestationCatalogue.pending_requirement_count, 1);
assert.equal(preAttestationCatalogue.pending_closure_audit_only, true);
assert.equal(
  preAttestationCatalogue.rows.find(
    (row) => row.requirement_id === "H015-QUAL-004",
  ).result,
  "PENDING",
);

const genericOnly = mkdtempSync(
  path.join(os.tmpdir(), "gg-h015-catalogue-generic-"),
);
mkdirSync(path.join(genericOnly, "catalogue", "commands"), { recursive: true });
const genericCases = cases.map((entry, index) =>
  index === 0 ? entry : { ...entry, result: "MISSING" },
);
writeFileSync(path.join(genericOnly, cases[0].log_path), "generic passed\n");
writeFileSync(
  path.join(genericOnly, "catalogue", "command-results.json"),
  `${JSON.stringify({ tested_sha: sha, result: "PASS", cases: genericCases }, null, 2)}\n`,
);
const rejected = run(genericOnly);
assert.notEqual(rejected.status, 0);
assert.match(rejected.stderr, /incomplete assurance rows/);
