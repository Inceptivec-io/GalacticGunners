import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
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
