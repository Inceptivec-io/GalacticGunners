import assert from "node:assert/strict";
import test from "node:test";

import { SPLASH_COPY, SPLASH_DURATION_MS } from "../src/config/splashCopy";

test("H015-ENTRY-002 positive: holds the approved splash for exactly two seconds", () => {
  assert.equal(SPLASH_DURATION_MS, 2_000);
});

test("H015-ENTRY-002 negative: rejects a premature or excessive splash duration", () => {
  assert.ok(SPLASH_DURATION_MS >= 2_000);
  assert.ok(SPLASH_DURATION_MS <= 2_000);
});

test("H015-ENTRY-003 positive: uses the governed copyright and collaborator copy", () => {
  assert.equal(
    SPLASH_COPY,
    "Copyright © 2026. Powered by Inceptivec. All rights reserved.\nCollaborators: Aurora Leonardi",
  );
});

test("H015-ENTRY-003 negative: does not retain the misspelled collaborator copy", () => {
  assert.doesNotMatch(SPLASH_COPY, /Aroura/);
});
