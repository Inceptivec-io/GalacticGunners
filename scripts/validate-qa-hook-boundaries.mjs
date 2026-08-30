import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";

const DIAGNOSTIC_MARKERS =
  /(?:force(?:complete|fail)|qa[_ -]?hook|direct state|window\.__GALACTIC_GUNNERS_(?:HOSTILE__|SLICE_QA__))/i;
const CLASSIFICATIONS = new Set([
  "UNIT",
  "COMPONENT",
  "API",
  "INTEGRATION",
  "E2E_ORDINARY_USER",
  "QA_DIAGNOSTIC",
]);
const TEST_FILE = /(?:\.(?:test|spec)\.[cm]?[jt]sx?$|^test_.*\.py$)/;

function discoverTests(root) {
  const discovered = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else if (TEST_FILE.test(entry.name))
        discovered.push(absolute.replaceAll("\\", "/"));
    }
  };
  walk(root);
  return discovered.map((file) => path.relative(root, file).replaceAll("\\", "/"));
}

export function validateTestInventory({ discovered, entries, contentsByFile }) {
  const failures = [];
  const indexed = new Map();
  for (const entry of entries ?? []) {
    if (!entry.file || !CLASSIFICATIONS.has(entry.classification)) {
      failures.push(`Invalid test classification entry: ${entry.file ?? "<missing>"}.`);
      continue;
    }
    if (indexed.has(entry.file)) failures.push(`Duplicate test classification: ${entry.file}.`);
    indexed.set(entry.file, entry);
    if (
      entry.classification === "E2E_ORDINARY_USER" &&
      DIAGNOSTIC_MARKERS.test(contentsByFile?.[entry.file] ?? "")
    ) {
      failures.push(`${entry.file} uses QA diagnostics but is classified as ordinary user.`);
    }
  }
  for (const file of discovered ?? []) {
    if (!indexed.has(file)) failures.push(`Unclassified test source: ${file}.`);
  }
  for (const file of indexed.keys()) {
    if (!(discovered ?? []).includes(file)) failures.push(`Classification references missing test source: ${file}.`);
  }
  return failures;
}

export function validateQaBoundaries(traceability) {
  const failures = [];
  for (const row of traceability.rows ?? []) {
    for (const testCase of row.test_cases ?? []) {
      const ordinary = testCase.classification === "E2E_ORDINARY_USER";
      const diagnostic = DIAGNOSTIC_MARKERS.test(
        `${testCase.command ?? ""} ${testCase.assertion ?? ""}`,
      );
      if (ordinary && diagnostic) {
        failures.push(
          `${row.requirement_id} maps a QA diagnostic to ordinary-user proof.`,
        );
      }
    }
  }
  return failures;
}

if (import.meta.url === `file:///${process.argv[1].replaceAll("\\", "/")}`) {
  const inventoryFile = "docs/assurance/H015_TEST_CLASSIFICATION.json";
  const roots = ["tests", "game/tests", "backend"];
  const discovered = roots.flatMap((root) =>
    discoverTests(root).map((file) => `${root}/${file}`),
  );
  const contentsByFile = Object.fromEntries(
    discovered.map((file) => [file, readFileSync(file, "utf8")]),
  );
  const inventory = JSON.parse(readFileSync(inventoryFile, "utf8"));
  const traceability = YAML.parse(
    readFileSync("docs/assurance/H015_REQUIREMENTS_TRACEABILITY.yaml", "utf8"),
  );
  const failures = [
    ...validateQaBoundaries(traceability),
    ...validateTestInventory({
      discovered,
      entries: inventory.entries,
      contentsByFile,
    }),
  ];
  console.log(
    JSON.stringify(
      { result: failures.length ? "FAIL" : "PASS", violations: failures },
      null,
      2,
    ),
  );
  if (failures.length) process.exitCode = 1;
}
