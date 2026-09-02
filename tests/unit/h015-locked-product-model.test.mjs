import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const received =
  "docs/internal_governance/handoff_in/_archive/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_015/13_LOCKED_PRODUCT_MODEL_SOURCE/received/Pasted markdown.md";
const projection =
  "docs/H015_PRODUCT_DEFINITION/01_AUTHORITY/LOCKED_FOUNDER_CEO_COAI_PRODUCT_MODEL_VERBATIM.md";
const expectedHash = "f1ff4f3c20c4bb033ade2ebab143e20df1596ad6c3081c6874725fd3945cda8b";

const count = (text, pattern) => (text.match(pattern) ?? []).length;
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

test("GG-H015-F22 positive: locked product model projection is a complete byte-identical admission", async () => {
  const [receivedBytes, projectionBytes] = await Promise.all([
    readFile(received),
    readFile(projection),
  ]);
  const source = receivedBytes.toString("utf8");
  const admitted = projectionBytes.toString("utf8");

  assert.deepEqual(projectionBytes, receivedBytes);
  assert.equal(sha256(receivedBytes), expectedHash);
  assert.equal(sha256(projectionBytes), expectedHash);
  assert.equal(count(admitted, /^```mermaid\s*$/gm), count(source, /^```mermaid\s*$/gm));
  assert.equal(count(admitted, /^```/gm), count(source, /^```/gm));
  assert.equal(count(admitted, /^\|/gm), count(source, /^\|/gm));
});

test("GG-H015-F22 negative: a changed locked model byte does not match the admitted hash", async () => {
  const projectionBytes = await readFile(projection);
  const altered = Buffer.from(projectionBytes);
  altered[0] ^= 1;
  assert.notEqual(sha256(altered), expectedHash);
});

test("GG-H015-F22 positive: the governed product-definition pack has every required surface", async () => {
  const required = [
    "00_START_HERE.md",
    "01_AUTHORITY/LOCKED_FOUNDER_CEO_COAI_PRODUCT_MODEL_VERBATIM.md",
    "01_AUTHORITY/AUTHORITY_AND_PRECEDENCE.md",
    "02_ARCHITECTURE/PRODUCT_ARCHITECTURE.md",
    "02_ARCHITECTURE/GAMEPLAY_ARCHITECTURE.md",
    "02_ARCHITECTURE/BOARDING_STATE_MACHINE.md",
    "02_ARCHITECTURE/CAMPAIGN_PUBLICATION_MODEL.md",
    "02_ARCHITECTURE/PLAYER_CREATOR_OPERATOR_JOURNEYS.md",
    "03_GAMEPLAY/SHOOTER_RUNTIME_SPEC.md",
    "03_GAMEPLAY/BOARDING_RUNTIME_SPEC.md",
    "03_GAMEPLAY/RESOURCES_AND_CONTINUITY.md",
    "03_GAMEPLAY/HAZARD_POLICY.md",
    "03_GAMEPLAY/HOSTILE_WEAPON_POLICY.md",
    "04_ASSETS/CANONICAL_SPRITE_STANDARD.md",
    "04_ASSETS/SHOOTER_SPRITE_DEFINITIONS.csv",
    "04_ASSETS/BOARDING_SPRITE_DEFINITIONS.csv",
    "04_ASSETS/SPRITE_GEOMETRY_INVARIANT.md",
    "04_ASSETS/ASSET_PROVENANCE.md",
    "05_PRODUCT_SURFACES/COMMAND_POST.md",
    "05_PRODUCT_SURFACES/GAMIFICATION_ADMIN.md",
    "05_PRODUCT_SURFACES/DESIGNER.md",
    "05_PRODUCT_SURFACES/ENTITY_CARDS.md",
    "06_GUIDES/USER_GUIDE_MODEL.md",
    "06_GUIDES/CREATOR_ADMIN_GUIDE_MODEL.md",
    "06_GUIDES/DEVELOPER_GUIDE_MODEL.md",
    "06_GUIDES/TEST_ACCEPTANCE_GUIDE_MODEL.md",
    "07_IMPLEMENTATION_TRACEABILITY/PRODUCT_MODEL_TO_IMPLEMENTATION_MATRIX.md",
    "07_IMPLEMENTATION_TRACEABILITY/REQUIREMENT_TO_CODE_TO_TEST_MATRIX.md",
    "07_IMPLEMENTATION_TRACEABILITY/GAP_REGISTER.md",
    "08_PLANNING/GALACTIC_GUNNERS_MASTER_ROADMAP_UPDATED.md",
    "08_PLANNING/GALACTIC_GUNNERS_MASTER_PLAYLIST_UPDATED.md",
    "09_H015_CLOSEOUT/DEFECT_CLOSURE_MATRIX.md",
    "09_H015_CLOSEOUT/TEST_MATRIX.md",
    "09_H015_CLOSEOUT/FOUNDER_REVIEW_GUIDE.md",
    "09_H015_CLOSEOUT/EVIDENCE_INDEX.md",
  ];
  await Promise.all(required.map((entry) => stat(`docs/H015_PRODUCT_DEFINITION/${entry}`)));
  const [shooter, boarding] = await Promise.all([
    readFile("docs/H015_PRODUCT_DEFINITION/04_ASSETS/SHOOTER_SPRITE_DEFINITIONS.csv", "utf8"),
    readFile("docs/H015_PRODUCT_DEFINITION/04_ASSETS/BOARDING_SPRITE_DEFINITIONS.csv", "utf8"),
  ]);
  assert.equal(shooter.trim().split("\n").length - 1, 14);
  assert.equal(boarding.trim().split("\n").length - 1, 13);
});
