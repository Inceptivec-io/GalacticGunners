import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  auditManifest,
  REQUIRED_GATES,
  sha256,
} from "../../scripts/verify-h015-evidence-integrity.mjs";

function buildManifest() {
  const root = mkdtempSync(path.join(os.tmpdir(), "gg-h015-identity-"));
  const evidence = path.join(root, "evidence.json");
  const artifact = path.join(root, "artifact.json");
  const closureDirectory = path.join(root, "closure_audit");
  const closure = path.join(closureDirectory, "closure-audit-result.json");
  const testedSha = "a".repeat(40);
  writeFileSync(evidence, "{}\n");
  writeFileSync(artifact, "{}\n");
  mkdirSync(closureDirectory);
  writeFileSync(
    closure,
    JSON.stringify({ result: "PASS", tested_sha: testedSha }),
  );
  const gates = REQUIRED_GATES.map((id) => ({
    id,
    classification: "AUTOMATED_BROWSER",
    route: "/play",
    setup: ["Start an exact-SHA runtime."],
    actions: ["Use normal browser input."],
    assertions: ["Observe the required product result."],
    tested_sha: testedSha,
    observed: `Exact-SHA observation for ${id}.`,
    normal_gameplay_interaction: true,
    result: "PASS",
    evidence: [
      {
        path:
          id === "closure-audit"
            ? "closure_audit/closure-audit-result.json"
            : "evidence.json",
        sha256: sha256(id === "closure-audit" ? closure : evidence),
        mime_type: "application/json",
      },
    ],
    console_errors: [],
    network_failures: [],
  }));
  return {
    root,
    testedSha,
    manifest: {
      schema_version: "1.0",
      repository: "Inceptivec-io/GalacticGunners",
      branch: "feature/v1-platform-foundation-campaign-continuity",
      commit_sha: testedSha,
      gates,
      artifact: {
        name: "h015-browser-evidence",
        url: "file:///artifact.json",
        path: "artifact.json",
        sha256: sha256(artifact),
      },
    },
  };
}

test("GG-ASSURANCE-EVIDENCE-002 positive: every evidence gate carries the exact full SHA", () => {
  const { root, testedSha, manifest } = buildManifest();
  assert.deepEqual(
    auditManifest(manifest, { root, expectedSha: testedSha }),
    [],
  );
});

test("GG-ASSURANCE-EVIDENCE-002 negative: a shortened or different SHA fails evidence identity", () => {
  const { root, testedSha, manifest } = buildManifest();
  manifest.gates[0].tested_sha = "a".repeat(12);
  manifest.gates[1].tested_sha = "b".repeat(40);
  const failures = auditManifest(manifest, { root, expectedSha: testedSha });
  assert.ok(
    failures.filter((failure) => failure.includes("invalid tested_sha"))
      .length >= 2,
  );
});

test("GG-ASSURANCE-EVIDENCE-006 positive: ordinary browser evidence has its own explicit classification", () => {
  const { root, testedSha, manifest } = buildManifest();
  manifest.gates[0].classification = "E2E_ORDINARY_USER";
  assert.deepEqual(
    auditManifest(manifest, { root, expectedSha: testedSha }),
    [],
  );
});

test("GG-ASSURANCE-EVIDENCE-006 negative: an unclassified gate fails the closure audit", () => {
  const { root, testedSha, manifest } = buildManifest();
  manifest.gates[0].classification = "UNCLASSIFIED";
  assert.match(
    auditManifest(manifest, { root, expectedSha: testedSha }).join("\n"),
    /invalid classification/,
  );
});
