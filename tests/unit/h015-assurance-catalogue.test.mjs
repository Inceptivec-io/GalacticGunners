import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = mkdtempSync(path.join(os.tmpdir(), "gg-h015-catalogue-test-"));
const sha = "a".repeat(40);
const catalogue = path.join(root, "catalogue");
const ordinary = path.join(root, "ordinary-browser", "journey");
mkdirSync(catalogue, { recursive: true });
mkdirSync(ordinary, { recursive: true });

const checks = [
  "traceability",
  "evidence-integrity",
  "component",
  "sprites",
  "game",
  "coverage",
  "backend",
].map((id) => ({ id, result: "PASS" }));
for (const check of checks)
  writeFileSync(
    path.join(catalogue, `${check.id}.log`),
    `${check.id} passed\n`,
  );
writeFileSync(
  path.join(catalogue, "command-results.json"),
  `${JSON.stringify({ tested_sha: sha, result: "PASS", checks }, null, 2)}\n`,
);
writeFileSync(path.join(ordinary, "positive.json"), "{}\n");
writeFileSync(path.join(ordinary, "negative.json"), "{}\n");

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

const missingEvidence = mkdtempSync(
  path.join(os.tmpdir(), "gg-h015-catalogue-missing-"),
);
mkdirSync(path.join(missingEvidence, "catalogue"), { recursive: true });
writeFileSync(
  path.join(missingEvidence, "catalogue", "command-results.json"),
  `${JSON.stringify({ tested_sha: sha, result: "PASS", checks }, null, 2)}\n`,
);
const rejected = run(missingEvidence);
assert.notEqual(rejected.status, 0);
assert.match(rejected.stderr, /Missing ordinary browser evidence directory/);
