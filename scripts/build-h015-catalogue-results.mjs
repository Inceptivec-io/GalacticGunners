import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
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
const ordinaryPath = path.join(root, "ordinary-browser");
if (!existsSync(commandsPath))
  throw new Error("Missing catalogue command result record.");
if (!existsSync(ordinaryPath))
  throw new Error("Missing ordinary browser evidence directory.");

const commands = JSON.parse(readFileSync(commandsPath, "utf8"));
if (
  commands.tested_sha !== sha ||
  commands.result !== "PASS" ||
  commands.checks?.some((check) => check.result !== "PASS")
)
  throw new Error(
    "Catalogue command results are not a passing exact-SHA record.",
  );

const commandEvidence = new Map(
  commands.checks.map((check) => [
    check.id,
    {
      path: `catalogue/${check.id}.log`,
      sha256: sha256(path.join(root, "catalogue", `${check.id}.log`)),
      mime_type: "text/plain",
    },
  ]),
);

function ordinaryEvidence() {
  const files = [];
  const stack = [ordinaryPath];
  while (stack.length) {
    const directory = stack.pop();
    for (const entry of requireDirectory(directory)) {
      if (entry.directory) stack.push(entry.path);
      else if (entry.path.endsWith(".json")) files.push(entry.path);
    }
  }
  return files;
}

function requireDirectory(directory) {
  return readdirSync(directory).map((name) => {
    const item = path.join(directory, name);
    return { path: item, directory: statSync(item).isDirectory() };
  });
}

const ordinaryFiles = ordinaryEvidence();
const ordinary = ordinaryFiles.map((file) => ({
  path: path.relative(root, file).replaceAll("\\", "/"),
  sha256: sha256(file),
  mime_type: "application/json",
}));
const positives = ordinaryFiles.filter(
  (file) => !/negative/i.test(path.basename(file)),
);
const negatives = ordinaryFiles.filter((file) =>
  /negative/i.test(path.basename(file)),
);
if (!positives.length || !negatives.length)
  throw new Error(
    "Ordinary browser evidence must include positive and negative journeys.",
  );

function proofForLayers(layers) {
  const ids = new Set(["traceability", "evidence-integrity"]);
  if (layers.includes("COMPONENT")) ids.add("component");
  if (layers.includes("UNIT")) {
    ids.add("game");
    ids.add("sprites");
  }
  if (layers.includes("API")) ids.add("backend");
  if (layers.includes("CI") || layers.includes("REVIEW")) {
    ids.add("coverage");
    ids.add("traceability");
  }
  return [...ids].map((id) => commandEvidence.get(id));
}

const traceability = YAML.parse(readFileSync(traceabilityPath, "utf8"));
const rows = traceability.rows.map((row) => {
  const requiresBrowser = row.required_layers.includes("E2E");
  const evidence = [...proofForLayers(row.required_layers)];
  if (requiresBrowser) evidence.push(...ordinary);
  const result =
    evidence.length &&
    (!requiresBrowser || (positives.length && negatives.length))
      ? "PASS"
      : "FAIL";
  return {
    requirement_id: row.requirement_id,
    result,
    tested_sha: sha,
    positive_test_ids: row.test_cases
      .filter((testCase) => testCase.polarity === "POSITIVE")
      .map((testCase) => testCase.id),
    negative_test_ids: row.test_cases
      .filter((testCase) => testCase.polarity === "NEGATIVE")
      .map((testCase) => testCase.id),
    evidence,
  };
});
if (rows.length !== 50 || rows.some((row) => row.result !== "PASS"))
  throw new Error(
    "The exact-SHA catalogue result contains incomplete assurance rows.",
  );

const output = path.join(root, "catalogue", "assurance-catalogue-results.json");
writeFileSync(
  output,
  `${JSON.stringify(
    {
      schema_version: "1.0",
      tested_sha: sha,
      result: "PASS",
      requirement_count: rows.length,
      passed_requirement_count: rows.length,
      rows,
    },
    null,
    2,
  )}\n`,
);
console.log(`H015_ASSURANCE_CATALOGUE=PASS\nH015_ASSURANCE_RESULTS=${output}`);
