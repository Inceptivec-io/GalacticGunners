import { mkdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const sha = process.env.GG_TESTED_SHA;
if (!/^[a-f0-9]{40}$/i.test(sha ?? ""))
  throw new Error("GG_TESTED_SHA must be an exact 40-character SHA.");

const root = path.resolve(
  process.env.GG_EVIDENCE_DIR ?? "FOUNDER_REVIEW_EVIDENCE.local",
);
const output = path.join(root, "catalogue", "command-results.json");
mkdirSync(path.dirname(output), { recursive: true });

const npm = "npm";
const checks = [
  {
    id: "traceability",
    command: npm,
    args: ["run", "test:h015:traceability"],
  },
  {
    id: "evidence-integrity",
    command: npm,
    args: ["run", "test:h015:evidence-integrity"],
  },
  { id: "component", command: npm, args: ["run", "test:component"] },
  { id: "sprites", command: npm, args: ["run", "test:sprites"] },
  { id: "game", command: npm, args: ["run", "game:test"] },
  { id: "coverage", command: npm, args: ["run", "test:coverage"] },
  {
    id: "backend",
    command: "docker",
    args: ["compose", "exec", "-T", "backend", "pytest", "-q"],
  },
];

const results = [];
for (const check of checks) {
  const startedAt = new Date().toISOString();
  const commandLine = [check.command, ...check.args].join(" ");
  const run = spawnSync(commandLine, {
    cwd: process.cwd(),
    encoding: "utf8",
    env: process.env,
    shell: true,
  });
  const record = {
    id: check.id,
    command: commandLine,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    exit_code: run.status,
    signal: run.signal,
    result: run.status === 0 && !run.error ? "PASS" : "FAIL",
    stdout: run.stdout ?? "",
    stderr: run.stderr ?? "",
    error: run.error?.message ?? null,
  };
  results.push(record);
  writeFileSync(
    path.join(root, "catalogue", `${check.id}.log`),
    `${record.command}\n\n${record.stdout}${record.stderr}`,
  );
  if (record.result !== "PASS") {
    writeFileSync(
      output,
      `${JSON.stringify({ tested_sha: sha, result: "FAIL", checks: results }, null, 2)}\n`,
    );
    throw new Error(`H015 catalogue check failed: ${check.id}`);
  }
}

writeFileSync(
  output,
  `${JSON.stringify(
    { tested_sha: sha, result: "PASS", checks: results },
    null,
    2,
  )}\n`,
);
console.log(`H015_CATALOGUE_COMMANDS=PASS\nH015_CATALOGUE_RESULTS=${output}`);
