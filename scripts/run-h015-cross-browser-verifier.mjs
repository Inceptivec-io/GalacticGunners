import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

const root = process.cwd();
const sha =
  process.env.GG_TESTED_SHA ?? exec("git", ["rev-parse", "HEAD"]).trim();
const evidenceRunId = new Date().toISOString().replace(/[:.]/g, "-");
const envFile = path.join(root, ".founder-review.env");
const evidenceRoot = path.resolve(
  process.env.GG_EVIDENCE_DIR ??
    path.join(os.tmpdir(), `gg-h015-cross-browser-${sha}-${evidenceRunId}`),
);
const lockPath = path.join(
  os.tmpdir(),
  "galactic-gunners-h015-runtime-verifier.lock",
);
const projects = ["chromium-desktop", "firefox-desktop", "webkit-desktop"];

function exec(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
}

function run(command, args, label) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    shell: false,
  });
  writeFileSync(
    path.join(evidenceRoot, `${label}.stdout.log`),
    result.stdout ?? "",
  );
  writeFileSync(
    path.join(evidenceRoot, `${label}.stderr.log`),
    result.stderr ?? "",
  );
  if (result.status !== 0)
    throw new Error(
      `${label} failed with exit ${result.status}: ${result.stderr || result.stdout}`,
    );
}

function docker(args, label) {
  run("docker", ["compose", "--env-file", envFile, ...args], label);
}

function composeIds() {
  const result = {};
  for (const service of ["web", "backend", "db"]) {
    result[service] = exec("docker", [
      "compose",
      "--env-file",
      envFile,
      "ps",
      "-q",
      service,
    ]).trim();
  }
  return result;
}

function generation() {
  const ids = composeIds();
  const state = {};
  for (const [service, id] of Object.entries(ids)) {
    if (!id) throw new Error(`Service ${service} has no container ID.`);
    state[service] = {
      id,
      restart_count: Number(
        exec("docker", ["inspect", "--format", "{{.RestartCount}}", id]).trim(),
      ),
    };
  }
  return state;
}

export function sameGeneration(before, after) {
  return Object.keys(before).every(
    (service) =>
      before[service]?.id === after[service]?.id &&
      before[service]?.restart_count === after[service]?.restart_count,
  );
}

export function assertStableGeneration(before, after) {
  if (!sameGeneration(before, after))
    throw new Error(
      `EXECUTION_INVALID: service generation changed: ${JSON.stringify({ before, after })}`,
    );
}

export async function runSerialProjects(projectNames, runProject) {
  const results = [];
  for (const project of projectNames) {
    results.push(await runProject(project));
  }
  return results;
}

async function probe(url) {
  try {
    const response = await fetch(url);
    return response.status === 200;
  } catch {
    return false;
  }
}

export async function waitStableReadiness({
  wait = (milliseconds) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds)),
  snapshot = generation,
  request = probe,
} = {}) {
  const transcript = [];
  let prior = null;
  for (let index = 0; index < 3; index += 1) {
    const web = await request("http://localhost:3002/api/v1/health/");
    const backend = await request("http://localhost:8010/api/v1/health/");
    const current = snapshot();
    const record = {
      probe: index + 1,
      web,
      backend,
      generation: current,
      at: new Date().toISOString(),
    };
    transcript.push(record);
    if (!web || !backend || (prior && !sameGeneration(prior, current)))
      throw new Error(`Stable readiness failed: ${JSON.stringify(record)}`);
    prior = current;
    if (index < 2) await wait(2000);
  }
  await wait(60000);
  const stable = snapshot();
  assertStableGeneration(prior, stable);
  return { generation: stable, transcript };
}

function updateReviewSha() {
  if (!existsSync(envFile))
    throw new Error("Founder review environment is unavailable.");
  const lines = readFileSync(envFile, "utf8")
    .split(/\r?\n/)
    .map((line) =>
      line.startsWith("SOURCE_SHA=")
        ? `SOURCE_SHA=${sha}`
        : line.startsWith("BUILD_ID=")
          ? `BUILD_ID=${sha}`
          : line,
    );
  writeFileSync(envFile, `${lines.filter(Boolean).join("\n")}\n`, "ascii");
}

function writeManifest(result) {
  const files = [];
  for (const name of exec("powershell", [
    "-NoProfile",
    "-Command",
    `Get-ChildItem -LiteralPath '${evidenceRoot.replaceAll("'", "''")}' -Recurse -File | ForEach-Object { $_.FullName }`,
  ])
    .split(/\r?\n/)
    .filter(Boolean)) {
    const data = readFileSync(name);
    files.push({
      path: path.relative(evidenceRoot, name).replaceAll("\\", "/"),
      sha256: createHash("sha256").update(data).digest("hex"),
      bytes: data.length,
    });
  }
  writeFileSync(
    path.join(evidenceRoot, "manifest.json"),
    `${JSON.stringify({ tested_sha: sha, result, files }, null, 2)}\n`,
  );
}

function acquireLock() {
  if (existsSync(lockPath))
    throw new Error(
      `EXECUTION_INVALID: lifecycle lock is already held at ${lockPath}.`,
    );
  mkdirSync(lockPath);
  writeFileSync(
    path.join(lockPath, "owner.json"),
    JSON.stringify({
      pid: process.pid,
      sha,
      started_at: new Date().toISOString(),
    }),
  );
}

if (import.meta.url === `file:///${process.argv[1].replaceAll("\\", "/")}`) {
  mkdirSync(evidenceRoot, { recursive: true });
  acquireLock();
  let result = "FAIL";
  try {
    updateReviewSha();
    docker(["down"], "01-compose-down");
    docker(["up", "--build", "-d"], "02-compose-up");
    docker(
      ["exec", "-T", "backend", "python", "manage.py", "migrate", "--noinput"],
      "03-migrate",
    );
    docker(
      ["exec", "-T", "backend", "python", "manage.py", "seed_service_plans"],
      "04-seed-plans",
    );
    docker(
      [
        "exec",
        "-T",
        "backend",
        "python",
        "manage.py",
        "seed_runtime_authority",
      ],
      "05-seed-runtime",
    );
    docker(
      [
        "exec",
        "-T",
        "backend",
        "python",
        "manage.py",
        "bootstrap_founder_review",
      ],
      "06-bootstrap-review",
    );
    docker(
      [
        "exec",
        "-T",
        "backend",
        "python",
        "manage.py",
        "seed_browser_assurance_campaign",
        "--duration-ms",
        "2500",
        "--scenario",
        "hazards",
      ],
      "07-seed-browser-assurance",
    );
    const readiness = await waitStableReadiness();
    writeFileSync(
      path.join(evidenceRoot, "readiness.json"),
      `${JSON.stringify(readiness, null, 2)}\n`,
    );
    const recordedRuns = [];
    await runSerialProjects(projects, async (project) => {
      const before = generation();
      const command = [
        "test",
        "tests/e2e/generated-sprites.spec.ts",
        "tests/e2e/level4-hazards.spec.ts",
        `--project=${project}`,
        "--workers=1",
        "--trace=on",
      ];
      const directory = path.join(evidenceRoot, project);
      const playwrightOutput = path.join(directory, "test-results");
      mkdirSync(directory, { recursive: true });
      const browser = spawnSync(
        process.execPath,
        [
          path.join(root, "node_modules", "@playwright", "test", "cli.js"),
          ...command,
        ],
        {
          cwd: root,
          encoding: "utf8",
          shell: false,
          env: {
            ...process.env,
            GG_EVIDENCE_DIR: evidenceRoot,
            GG_RUNTIME_EVIDENCE: "1",
            GG_TESTED_SHA: sha,
            GG_PLAYWRIGHT_OUTPUT_DIR: playwrightOutput,
          },
        },
      );
      writeFileSync(path.join(directory, "stdout.log"), browser.stdout ?? "");
      writeFileSync(path.join(directory, "stderr.log"), browser.stderr ?? "");
      const after = generation();
      const execution_valid = sameGeneration(before, after);
      const browserRun = {
        project,
        command: `${process.execPath} ${path.join("node_modules", "@playwright", "test", "cli.js")} ${command.join(" ")}`,
        exit_code: browser.status,
        spawn_error: browser.error?.message ?? null,
        before,
        after,
        execution_valid,
      };
      recordedRuns.push(browserRun);
      writeFileSync(
        path.join(evidenceRoot, "browser-runs.json"),
        `${JSON.stringify(recordedRuns, null, 2)}\n`,
      );
      if (!execution_valid)
        throw new Error(
          `EXECUTION_INVALID: ${project} service generation changed.`,
        );
      if (browser.error)
        throw new Error(
          `EXECUTION_INVALID: ${project} browser process could not start: ${browser.error.message}`,
        );
      if (browser.status !== 0)
        throw new Error(`BROWSER_FAIL: ${project} exited ${browser.status}.`);
      return browserRun;
    });
    result = "PASS";
  } catch (error) {
    writeFileSync(
      path.join(evidenceRoot, "failure.txt"),
      `${error.stack ?? error.message}\n`,
    );
    throw error;
  } finally {
    writeManifest(result);
    try {
      docker(["down"], "99-compose-down");
    } finally {
      rmSync(lockPath, { recursive: true, force: true });
    }
  }

  console.log(`H015_CROSS_BROWSER_RUNTIME=${result}`);
}
