import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
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
const evidenceRoot = path.resolve(
  process.env.GG_EVIDENCE_DIR ??
    path.join(os.tmpdir(), `gg-h015-cross-browser-${sha}-${evidenceRunId}`),
);
const composeEnvFile = path.join(
  os.tmpdir(),
  `gg-h015-runtime-verifier-${process.pid}.env`,
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
  run("docker", ["compose", "--env-file", composeEnvFile, ...args], label);
}

function composeIds() {
  const result = {};
  for (const service of ["web", "backend", "db"]) {
    result[service] = exec("docker", [
      "compose",
      "--env-file",
      composeEnvFile,
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
    const inspection = JSON.parse(exec("docker", ["inspect", id]));
    state[service] = {
      id,
      restart_count: inspection[0].RestartCount,
      status: inspection[0].State.Status,
      health: inspection[0].State.Health?.Status ?? null,
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
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
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
  maxAttempts = 60,
} = {}) {
  const transcript = [];
  let prior = null;
  let consecutiveHealthy = 0;
  for (let index = 0; index < maxAttempts; index += 1) {
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
    const healthy =
      web &&
      backend &&
      current.db?.health === "healthy" &&
      current.backend?.health === "healthy" &&
      current.web?.health === "healthy";
    if (prior && !sameGeneration(prior, current)) {
      throw new Error(
        `EXECUTION_INVALID: service generation changed during readiness: ${JSON.stringify(record)}`,
      );
    }
    prior = current;
    consecutiveHealthy = healthy ? consecutiveHealthy + 1 : 0;
    if (consecutiveHealthy === 3) break;
    if (index === maxAttempts - 1)
      throw new Error(`Stable readiness failed: ${JSON.stringify(record)}`);
    await wait(2000);
  }
  await wait(60000);
  const stable = snapshot();
  assertStableGeneration(prior, stable);
  return { generation: stable, transcript };
}

function parseEnvFile(file) {
  if (!existsSync(file)) return {};
  return Object.fromEntries(
    readFileSync(file, "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );
}

function createVerifierEnvironment() {
  const inherited = parseEnvFile(path.join(root, ".founder-review.env"));
  const composeKeys = [
    "FOUNDER_REVIEW_USERNAME",
    "FOUNDER_REVIEW_PASSWORD",
    "COMMAND_POST_REVIEW_USERNAME",
    "COMMAND_POST_REVIEW_PASSWORD",
    "PLAYER_REVIEW_USERNAME",
    "PLAYER_REVIEW_PASSWORD",
    "FOUNDER_REVIEW_DISPLAY_NAME",
    "COMMAND_POST_REVIEW_DISPLAY_NAME",
    "COMMAND_POST_REVIEW_ORGANIZATION_SLUG",
    "PLAYER_REVIEW_DISPLAY_NAME",
    "DJANGO_LOCAL_SUPERUSER_USERNAME",
    "DJANGO_LOCAL_SUPERUSER_PASSWORD",
    "POSTGRES_DB",
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
    "DATABASE_URL",
    "DJANGO_SECRET_KEY",
    "DJANGO_ALLOWED_HOSTS",
    "DJANGO_SETTINGS_MODULE",
    "DJANGO_DEBUG",
    "DJANGO_CSRF_TRUSTED_ORIGINS",
    "ENABLE_DJANGO_ADMIN",
  ];
  const supplied = Object.fromEntries(
    composeKeys
      .filter((key) => process.env[key] !== undefined)
      .map((key) => [key, process.env[key]]),
  );
  const values = {
    ...inherited,
    ...supplied,
    FOUNDER_REVIEW_MODE: "true",
    NEXT_PUBLIC_GG_QA_MODE: "true",
    SOURCE_SHA: sha,
    BUILD_ID: sha,
    WEB_HOST_PORT: "3002",
    BACKEND_HOST_PORT: "8010",
  };
  for (const key of [
    "FOUNDER_REVIEW_USERNAME",
    "FOUNDER_REVIEW_PASSWORD",
    "COMMAND_POST_REVIEW_USERNAME",
    "COMMAND_POST_REVIEW_PASSWORD",
    "PLAYER_REVIEW_USERNAME",
    "PLAYER_REVIEW_PASSWORD",
  ]) {
    if (!values[key]) throw new Error(`Runtime verifier requires ${key}.`);
  }
  writeFileSync(
    composeEnvFile,
    `${Object.entries(values)
      .map(([key, value]) => `${key}=${String(value).replaceAll("\n", "")}`)
      .join("\n")}\n`,
    "utf8",
  );
  return values;
}

function writeManifest(result) {
  const files = [];
  const walk = (directory) =>
    readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(target) : [target];
    });
  for (const name of walk(evidenceRoot)) {
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
    const verifierEnvironment = createVerifierEnvironment();
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
            ...verifierEnvironment,
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
        before_generation_id: createHash("sha256")
          .update(JSON.stringify(before))
          .digest("hex"),
        after_generation_id: createHash("sha256")
          .update(JSON.stringify(after))
          .digest("hex"),
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
      rmSync(composeEnvFile, { force: true });
      rmSync(lockPath, { recursive: true, force: true });
    }
  }

  console.log(`H015_CROSS_BROWSER_RUNTIME=${result}`);
}
