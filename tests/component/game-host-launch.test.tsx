import { cleanup, render, screen, waitFor } from "@testing-library/react";
import assert from "node:assert/strict";
import React from "react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { SPLASH_COPY } from "@galactic-gunners/game";

let publishLaunchState:
  | ((state: "splash" | "main-menu" | "gameplay" | "paused") => void)
  | undefined;

vi.mock("@galactic-gunners/game", async () => {
  const actual = await vi.importActual<typeof import("@galactic-gunners/game")>(
    "@galactic-gunners/game",
  );
  return {
    ...actual,
    createGalacticGunnersGame: vi.fn(async (config) => {
      publishLaunchState = config.onLaunchStateChange;
      config.onLaunchStateChange?.("splash");
      return {} as never;
    }),
    destroyGalacticGunnersGame: vi.fn(),
  };
});

import { GameHost } from "../../apps/web/game/GameHost";

beforeEach(() => {
  publishLaunchState = undefined;
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: { load: () => Promise.resolve([]) },
  });
});

afterEach(cleanup);

test("H015-ENTRY-003 component positive: the governed splash copy is rendered exactly", async () => {
  render(<GameHost />);

  await waitFor(() => {
    assert.equal(
      document.querySelector("[data-game-splash-copy]")?.textContent,
      SPLASH_COPY,
    );
  });
  assert.equal(
    screen.getByRole("region", { name: "Galactic Gunners game runtime" })
      .tagName,
    "SECTION",
  );
});

test("H015-ENTRY-003 component negative: unapproved splash copy is not rendered", async () => {
  render(<GameHost />);

  await waitFor(() => expect(publishLaunchState).toBeTypeOf("function"));
  assert.equal(
    screen.queryByText(/Aurora Leonardi and unapproved contributor/i),
    null,
  );
});

test("H015-ENTRY-004 component positive and negative: launch state exposes a usable status and removes splash copy on Main Menu", async () => {
  render(<GameHost />);

  await waitFor(() => expect(publishLaunchState).toBeTypeOf("function"));
  assert.equal(
    screen.getByRole("status").textContent,
    "Galactic Gunners launch sequence.",
  );
  publishLaunchState?.("main-menu");
  await waitFor(() => {
    assert.equal(
      screen.getByRole("status").textContent,
      "Galactic Gunners main menu ready.",
    );
  });
  assert.equal(document.querySelector("[data-game-splash-copy]"), null);
});
