import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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
const founderEnvironmentPath = ".founder-review.env";
const founderReviewEnvironment = existsSync(founderEnvironmentPath)
  ? Object.fromEntries(
      readFileSync(founderEnvironmentPath, "utf8")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .map((line) => {
          const separator = line.indexOf("=");
          return [line.slice(0, separator), line.slice(separator + 1)];
        }),
    )
  : {};
// CI supplies the same review variables through its job environment and must
// not depend on an ignored local credential file.
const compose = existsSync(founderEnvironmentPath)
  ? "docker compose --env-file .founder-review.env"
  : "docker compose";

function executableCommand(command) {
  const backendTest = command.match(
    /^cd backend && python manage\.py test (.+)$/,
  );
  if (backendTest) {
    return `${compose} exec -T backend python manage.py test ${backendTest[1]}`;
  }
  return command;
}

function runShell(command) {
  const gitBash = "C:\\Program Files\\Git\\bin\\bash.exe";
  const shell =
    process.platform === "win32" && existsSync(gitBash) ? gitBash : "bash";
  return spawnSync(shell, ["-lc", command], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, ...founderReviewEnvironment },
  });
}

function scenarioSetup(command) {
  if (command.includes("tests/e2e/campaign-real-play.spec.ts"))
    return `${compose} exec -T backend python manage.py seed_browser_assurance_campaign --duration-ms 2500`;
  if (command.includes("tests/e2e/level4-hazards.spec.ts"))
    return `${compose} exec -T backend python manage.py seed_browser_assurance_campaign --duration-ms 2500 --scenario hazards`;
  if (command.includes("tests/e2e/boarding-ordinary.spec.ts"))
    return `${compose} exec -T backend python manage.py seed_browser_assurance_campaign --duration-ms 450 --scenario boarding`;
  if (command.includes("npx playwright test"))
    return `${compose} exec -T backend python manage.py seed_runtime_authority`;
  return null;
}

for (const command of new Set(cases.map((testCase) => testCase.command))) {
  const startedAt = new Date().toISOString();
  const deferred = deferredCommands.has(command);
  const setup = deferred ? null : scenarioSetup(command);
  const executedCommand = deferred ? null : executableCommand(command);
  const setupRun = setup ? runShell(setup) : null;
  const run =
    deferred || (setupRun && (setupRun.status !== 0 || setupRun.error))
      ? null
      : runShell(executedCommand);
  const safeName = `${commandResults.size + 1}-${command}`
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
  const record = {
    command,
    declared_command: command,
    executed_command: executedCommand,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    setup_command: setup,
    setup_exit_code: setupRun?.status ?? null,
    exit_code: run?.status ?? null,
    signal: run?.signal ?? null,
    result: deferred
      ? "DEFERRED"
      : run?.status === 0 && !run.error
        ? "PASS"
        : "FAIL",
    stdout: `${setupRun?.stdout ?? ""}${run?.stdout ?? ""}`,
    stderr: `${setupRun?.stderr ?? ""}${run?.stderr ?? ""}`,
    error: setupRun?.error?.message ?? run?.error?.message ?? null,
    log_path: `catalogue/commands/${safeName}.log`,
  };
  commandResults.set(command, record);
  const log = path.join(root, record.log_path);
  mkdirSync(path.dirname(log), { recursive: true });
  writeFileSync(
    log,
    `DECLARED_COMMAND=${command}\nEXECUTED_COMMAND=${executedCommand ?? "DEFERRED"}\n\n${record.stdout}${record.stderr}`,
  );
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
