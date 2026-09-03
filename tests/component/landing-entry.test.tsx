import { cleanup, render, screen } from "@testing-library/react";
import assert from "node:assert/strict";
import React from "react";
import { afterEach, test } from "vitest";

import LandingPage from "../../apps/web/app/page";

afterEach(cleanup);

test("GG-PRODUCT-ENTRY-001 component positive: the public entry exposes the governed Play route", () => {
  render(<LandingPage />);

  const play = screen.getByRole("link", { name: "Play" });
  assert.equal(play.getAttribute("href"), "/play");
  assert.equal(
    screen.getByRole("region", { name: "Galactic Gunners launch" }).tagName,
    "SECTION",
  );
});

test("GG-PRODUCT-ENTRY-001 component negative: the public entry has no external or diagnostic Play destination", () => {
  render(<LandingPage />);

  const play = screen.getByRole("link", { name: "Play" });
  assert.match(play.getAttribute("href") ?? "", /^\/(?!\/|.*[?&]qa=)/);
});
