import assert from "node:assert/strict";
import test from "node:test";

import {
  isGovernedSplashCopy,
  isGovernedSplashDuration,
  SPLASH_COPY,
  SPLASH_DURATION_MS,
} from "../src/config/splashCopy";

test("GG-PRODUCT-ENTRY-002 positive: holds the approved splash for exactly four seconds", () => {
  assert.equal(SPLASH_DURATION_MS, 4_000);
  assert.equal(isGovernedSplashDuration(SPLASH_DURATION_MS), true);
});

test("GG-PRODUCT-ENTRY-002 negative: rejects a premature or excessive splash duration", () => {
  assert.equal(isGovernedSplashDuration(3_999), false);
  assert.equal(isGovernedSplashDuration(4_001), false);
});

test("GG-PRODUCT-ENTRY-003 positive: uses the governed copyright and collaborator copy", () => {
  assert.equal(
    SPLASH_COPY,
    "Copyright © 2026. Powered by Inceptivec. All rights reserved.\nCollaborators: Aurora Leonardi",
  );
  assert.equal(isGovernedSplashCopy(SPLASH_COPY), true);
});

test("GG-PRODUCT-ENTRY-003 negative: does not retain the misspelled collaborator copy", () => {
  assert.equal(
    isGovernedSplashCopy(
      "Copyright © 2026. Powered by Inceptivec. All rights reserved.\nCollaborators: Aroura Leonardi",
    ),
    false,
  );
});
