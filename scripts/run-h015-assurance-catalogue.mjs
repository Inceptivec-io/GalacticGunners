import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import YAML from "yaml";

const sha = process.env.GG_TESTED_SHA;
if (!/^[a-f0-9]{40}$/i.test(sha ?? ""))
  throw new Error("GG_TESTED_SHA must be an exact 40-character SHA.");

const root = path.resolve(
  process.env.GG_EVIDENCE_DIR ?? "FOUNDER_REVIEW_EVIDENCE.local",
);
const output = path.join(root, "catalogue", "command-results.json");
const traceabilityPath = path.resolve(
  "docs/assurance/H015_REQUIREMENTS_TRACEABILITY.yaml",
);
mkdirSync(path.dirname(output), { recursive: true });

const catalogue = YAML.parse(readFileSync(traceabilityPath, "utf8"));
const cases = catalogue.rows.flatMap((row) =>
  row.test_cases.map((testCase) => ({
    requirement_id: row.requirement_id,
    test_case_id: testCase.id,
    polarity: testCase.polarity,
    command: testCase.command,
  })),
);

// The closure audit necessarily runs after the manifest is assembled. It is
// represented as deferred rather than silently skipped or treated as a pass.
const deferredCommands = new Set(["npm run h015:closure-audit"]);
const commandResults = new Map();

for (const command of new Set(cases.map((testCase) => testCase.command))) {
  const startedAt = new Date().toISOString();
  const deferred = deferredCommands.has(command);
  const run = deferred
    ? null
    : spawnSync(command, {
        cwd: process.cwd(),
        encoding: "utf8",
        env: process.env,
        shell: true,
      });
  const safeName = `${commandResults.size + 1}-${command}`
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
  const record = {
    command,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    exit_code: run?.status ?? null,
    signal: run?.signal ?? null,
    result: deferred
      ? "DEFERRED"
      : run?.status === 0 && !run.error
        ? "PASS"
        : "FAIL",
    stdout: run?.stdout ?? "",
    stderr: run?.stderr ?? "",
    error: run?.error?.message ?? null,
    log_path: `catalogue/commands/${safeName}.log`,
  };
  commandResults.set(command, record);
  const log = path.join(root, record.log_path);
  mkdirSync(path.dirname(log), { recursive: true });
  writeFileSync(log, `${command}\n\n${record.stdout}${record.stderr}`);
}

const results = cases.map((testCase) => ({
  ...testCase,
  ...commandResults.get(testCase.command),
}));
const result = results.every((entry) => entry.result === "PASS")
  ? "PASS"
  : results.some((entry) => entry.result === "FAIL")
    ? "FAIL"
    : "PENDING";
writeFileSync(
  output,
  `${JSON.stringify({ tested_sha: sha, result, cases: results }, null, 2)}\n`,
);
if (result !== "PASS")
  throw new Error(
    `H015 catalogue is not complete: ${results
      .filter((entry) => entry.result !== "PASS")
      .map((entry) => entry.test_case_id)
      .join(", ")}`,
  );
console.log(`H015_CATALOGUE_COMMANDS=PASS\nH015_CATALOGUE_RESULTS=${output}`);
