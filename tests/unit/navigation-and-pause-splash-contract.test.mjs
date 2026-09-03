import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("GG-PRODUCT-ENTRY-002 verifier asserts the approved four-second splash contract", async () => {
  const verifier = await readFile("scripts/verify-navigation-and-pause.mjs", "utf8");
  assert.match(verifier, /splash\.durationMs === 4_000/);
  assert.match(verifier, /splashDuration >= 3_700/);
  assert.match(verifier, /splashDuration <= 5_400/);
  assert.doesNotMatch(verifier, /two-second launch hold/);
});
