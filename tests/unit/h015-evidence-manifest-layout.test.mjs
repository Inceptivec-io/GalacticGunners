import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const testedSha = "a".repeat(40);
const root = mkdtempSync(path.join(os.tmpdir(), "gg-h015-manifest-layout-"));
const catalogueDirectory = path.join(root, "assurance_catalogue", "catalogue");
const ordinaryDirectory = path.join(root, "assurance_catalogue", "ordinary-browser", "campaign-progression");
mkdirSync(catalogueDirectory, { recursive: true });
mkdirSync(ordinaryDirectory, { recursive: true });

writeFileSync(
  path.join(catalogueDirectory, "assurance-catalogue-results.json"),
  JSON.stringify({ tested_sha: testedSha, result: "PASS" }),
);
for (const polarity of ["positive", "negative"]) {
  const stem = `campaign-${polarity}`;
  writeFileSync(path.join(ordinaryDirectory, `${stem}.png`), "png");
  writeFileSync(
    path.join(ordinaryDirectory, `${stem}.json`),
    JSON.stringify({
      classification: "E2E_ORDINARY_USER",
      gate: "campaign-progression",
      tested_sha: testedSha,
      actions: ["Use the visible Continue control."],
      assertions: ["Campaign state remains governed."],
    }),
  );
}

const run = spawnSync("node", ["scripts/build-h015-evidence-manifest.mjs"], {
  cwd: process.cwd(),
  encoding: "utf8",
  env: { ...process.env, GG_EVIDENCE_DIR: root, GG_TESTED_SHA: testedSha },
});
assert.equal(run.status, 0, run.stderr);
const manifest = JSON.parse(readFileSync(path.join(root, "h015-evidence-manifest.json"), "utf8"));
const campaign = manifest.gates.find((gate) => gate.id === "campaign-progression");
const catalogue = manifest.gates.find((gate) => gate.id === "assurance-catalogue");
assert.equal(campaign.result, "PASS");
assert.equal(campaign.evidence.length, 4);
assert.ok(campaign.evidence.every((item) => item.path.startsWith("assurance_catalogue/ordinary-browser/")));
assert.equal(catalogue.result, "PASS");
assert.ok(catalogue.evidence.some((item) => item.path === "assurance_catalogue/catalogue/assurance-catalogue-results.json"));
