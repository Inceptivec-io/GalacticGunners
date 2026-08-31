import { expect, test } from "./fixtures/strictRuntime";
import { captureOrdinaryJourney } from "./fixtures/ordinaryEvidence";

const administrator = {
  username: process.env.FOUNDER_REVIEW_USERNAME,
  password: process.env.FOUNDER_REVIEW_PASSWORD,
};

function coordinates(label: string | null) {
  const match = label?.match(/ at (\d+), (\d+)$/);
  if (!match)
    throw new Error(
      `Expected an authored placement label, received ${label ?? "none"}.`,
    );
  return { x: Number(match[1]), y: Number(match[2]) };
}

async function loginAsAdministrator(page: import("@playwright/test").Page) {
  if (!administrator.username || !administrator.password) {
    throw new Error(
      "FOUNDER_REVIEW_USERNAME and FOUNDER_REVIEW_PASSWORD are required for the Designer journey.",
    );
  }
  await page.goto("/inceptivec-gamification-admin/login");
  await page.getByLabel("Username").fill(administrator.username);
  await page.getByLabel("Password").fill(administrator.password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.locator('[data-designer-route="campaign"]')).toBeVisible();
  await expect(
    page.locator('button[aria-label^="SCOUT at"]').first(),
  ).toBeVisible();
}

async function reachableScout(page: import("@playwright/test").Page) {
  const placement = await page
    .locator('button[aria-label^="SCOUT at"]')
    .evaluateAll((buttons) => {
      const placement = [...buttons].reverse().find((button) => {
        const bounds = button.getBoundingClientRect();
        const target = document.elementFromPoint(
          bounds.x + bounds.width / 2,
          bounds.y + bounds.height / 2,
        );
        return target === button || button.contains(target);
      });
      return placement
        ? {
            id: placement.getAttribute("data-designer-placement-id"),
            label: placement.getAttribute("aria-label"),
          }
        : null;
    });
  if (!placement?.id)
    throw new Error("The Designer has no reachable scout placement.");
  return page.locator(`[data-designer-placement-id="${placement.id}"]`);
}

test("H015-DES-POINTER-001__e2e_ordinary_user__native_mouse_drag_undo_redo_is_exact_at_supported_zoom", async ({
  page,
  strictRuntime,
}) => {
  test.skip(
    "hasTouch" in test.info().project.use &&
      Boolean(test.info().project.use.hasTouch),
    "Native mouse drag is exercised by the desktop project.",
  );
  await loginAsAdministrator(page);
  const zoom = page.getByLabel("Canvas zoom");
  const gridSize = Number(
    await page
      .getByLabel("Level configuration")
      .getByLabel("Grid size")
      .inputValue(),
  );
  expect([8, 16, 24, 32]).toContain(gridSize);
  const playfield = page.locator(".designer-playfield");

  for (const value of ["0.5", "0.75", "1", "1.25", "1.5"]) {
    const entity = await reachableScout(page);
    await zoom.fill(value);
    await expect(zoom).toHaveValue(value);

    const beforeLabel = await entity.getAttribute("aria-label");
    const before = coordinates(beforeLabel);
    const fieldBox = await playfield.boundingBox();
    if (!fieldBox)
      throw new Error(`Designer geometry was unavailable at ${value} zoom.`);
    await entity.dragTo(playfield, {
      targetPosition: { x: fieldBox.width * 0.16, y: fieldBox.height * 0.2 },
    });

    const afterLabel = await entity.getAttribute("aria-label");
    const after = coordinates(afterLabel);
    expect(after).not.toEqual(before);
    expect(after.x).toBeGreaterThanOrEqual(0);
    expect(after.x).toBeLessThanOrEqual(1280);
    expect(after.y).toBeGreaterThanOrEqual(0);
    expect(after.y).toBeLessThanOrEqual(720);
    expect(after.x % gridSize).toBe(0);
    expect(after.y % gridSize).toBe(0);
    await page.getByRole("button", { name: "Undo" }).click();
    await expect(entity).toHaveAttribute("aria-label", beforeLabel);
    await page.getByRole("button", { name: "Redo" }).click();
    await expect(entity).toHaveAttribute("aria-label", afterLabel);
    await page.reload();
    await expect(
      page.locator('[data-designer-route="campaign"]'),
    ).toBeVisible();
    await expect(entity).toBeVisible();
  }

  expect(strictRuntime.unexpectedFailures).toEqual([]);
  await captureOrdinaryJourney({
    page,
    testInfo: test.info(),
    gate: "designer-roundtrip",
    route: "/inceptivec-gamification-admin/login",
    actions: [
      "Authenticated through the visible Administrator login form.",
      "Dragged a real Scout placement at each supported zoom.",
      "Used visible Undo and Redo controls, then reloaded the Designer.",
    ],
    assertions: [
      "Pointer placement stayed grid-aligned, undo and redo restored exact positions, and the persisted configuration reloaded.",
    ],
  });
});

test("H015-DES-POINTER-001__e2e_ordinary_user_negative__outside_drag_is_clamped_and_undoable", async ({
  page,
  strictRuntime,
}) => {
  test.skip(
    "hasTouch" in test.info().project.use &&
      Boolean(test.info().project.use.hasTouch),
    "Native mouse drag is exercised by the desktop project.",
  );
  await loginAsAdministrator(page);
  const entity = await reachableScout(page);
  const beforeLabel = await entity.getAttribute("aria-label");
  const fieldBox = await page.locator(".designer-playfield").boundingBox();
  if (!fieldBox)
    throw new Error("Designer geometry was unavailable for the boundary drag.");

  await entity.dragTo(page.locator(".designer-playfield"), {
    targetPosition: { x: 0, y: 0 },
  });

  const after = coordinates(await entity.getAttribute("aria-label"));
  expect(after.x).toBeGreaterThanOrEqual(0);
  expect(after.y).toBeGreaterThanOrEqual(0);
  expect(after.x).toBeLessThanOrEqual(1280);
  expect(after.y).toBeLessThanOrEqual(720);
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(entity).toHaveAttribute("aria-label", beforeLabel);
  expect(strictRuntime.unexpectedFailures).toEqual([]);
  await captureOrdinaryJourney({
    page,
    testInfo: test.info(),
    gate: "designer-roundtrip",
    route: "/inceptivec-gamification-admin/login",
    actions: [
      "Authenticated through the visible Administrator login form.",
      "Dragged a placed Scout to the canvas edge and selected Undo.",
    ],
    assertions: [
      "The placement remained inside the governed canvas and Undo restored its original position.",
    ],
  });
});

test("H015-DES-THUMB-001__e2e_ordinary_user__palette_uses_loaded_canonical_single-frame_previews", async ({
  page,
  strictRuntime,
}) => {
  await loginAsAdministrator(page);
  await page.getByRole("button", { name: "Alien Ships", exact: true }).click();
  const previewImages = page.locator(".designer-chooser .tool-button img");
  await expect(previewImages).toHaveCount(3);
  const previews = await previewImages.evaluateAll((images) =>
    images.map((image) => ({
      src: image.getAttribute("src"),
      complete: image.complete,
      naturalWidth: image.naturalWidth,
    })),
  );
  expect(
    previews.every((preview) =>
      preview.src?.includes("/gg-runtime-assets/generated/thumbnails/"),
    ),
  ).toBe(true);
  expect(
    previews.every((preview) => preview.complete && preview.naturalWidth > 0),
  ).toBe(true);
  expect(
    previews.some((preview) => /sprite|sheet/i.test(preview.src ?? "")),
  ).toBe(false);
  await page.getByRole("button", { name: "Close chooser" }).click();
  expect(strictRuntime.unexpectedFailures).toEqual([]);
  await captureOrdinaryJourney({
    page,
    testInfo: test.info(),
    gate: "designer-review-matrix",
    route: "/inceptivec-gamification-admin/login",
    actions: [
      "Authenticated as Administrator.",
      "Opened the visible Alien Ships chooser and inspected its asset thumbnails.",
    ],
    assertions: [
      "Every chooser thumbnail loaded a canonical single-frame preview rather than a source sheet.",
    ],
  });
});

test("H015-DES-META-001__e2e_ordinary_user__valid_seed_save_reloads_from_immutable_draft", async ({
  page,
  strictRuntime,
}) => {
  await loginAsAdministrator(page);
  const configuration = page.getByLabel("Level configuration");
  const seed = configuration.getByLabel("Deterministic seed");
  const nextSeed = Number(await seed.inputValue()) + 1;
  await seed.fill(String(nextSeed));
  const saved = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      /\/api\/v1\/admin\/levels\/[^/]+\/drafts\/$/.test(
        new URL(response.url()).pathname,
      ),
  );
  await page.getByRole("button", { name: "Save immutable draft" }).click();
  expect((await saved).status()).toBe(201);
  await page.reload();
  await expect(page.locator('[data-designer-route="campaign"]')).toBeVisible();
  await expect(
    page.getByLabel("Level configuration").getByLabel("Deterministic seed"),
  ).toHaveValue(String(nextSeed));
  expect(strictRuntime.unexpectedFailures).toEqual([]);
  await captureOrdinaryJourney({
    page,
    testInfo: test.info(),
    gate: "designer-roundtrip",
    route: "/inceptivec-gamification-admin/login",
    actions: [
      "Authenticated as Administrator.",
      "Changed the visible deterministic seed and selected Save immutable draft.",
      "Reloaded the Designer.",
    ],
    assertions: [
      "The server created a draft and the saved seed reloaded from the immutable draft.",
    ],
  });
});

test("H015-DES-META-001__e2e_ordinary_user_negative__invalid_seed_is_rejected_by_the_server", async ({
  page,
  strictRuntime,
}) => {
  await loginAsAdministrator(page);
  await page
    .getByLabel("Level configuration")
    .getByLabel("Deterministic seed")
    .fill("-1");
  strictRuntime.allowHttpFailure(
    /\/api\/v1\/admin\/levels\/[^/]+\/drafts\/$/,
    400,
  );
  strictRuntime.allowConsoleError(
    /Failed to load resource: the server responded with a status of 400/,
  );
  const rejected = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      /\/api\/v1\/admin\/levels\/[^/]+\/drafts\/$/.test(
        new URL(response.url()).pathname,
      ),
  );
  await page.getByRole("button", { name: "Save immutable draft" }).click();
  const response = await rejected;
  expect(response.status()).toBe(400);
  expect(await response.json()).toMatchObject({
    errors: {
      code: "LEVEL_DEFINITION_INVALID",
      detail: "Level definition failed validation.",
    },
  });
  await expect(
    page.getByText(/level definition failed validation/i),
  ).toBeVisible();
  expect(strictRuntime.unexpectedFailures).toEqual([]);
  await captureOrdinaryJourney({
    page,
    testInfo: test.info(),
    gate: "designer-roundtrip",
    route: "/inceptivec-gamification-admin/login",
    actions: [
      "Authenticated as Administrator.",
      "Entered an invalid deterministic seed and selected Save immutable draft.",
    ],
    assertions: [
      "The product displayed the server validation failure and did not accept the invalid draft.",
    ],
  });
});

test("H015-DES-CANVAS-001__e2e_ordinary_user__governed_canvas_and_grid_save_reload", async ({
  page,
  strictRuntime,
}) => {
  await loginAsAdministrator(page);
  const configuration = page.getByLabel("Level configuration");
  await expect(configuration.getByLabel("Canvas width")).toHaveValue("1280");
  await expect(configuration.getByLabel("Canvas width")).toBeDisabled();
  await expect(configuration.getByLabel("Canvas height")).toHaveValue("720");
  await expect(configuration.getByLabel("Canvas height")).toBeDisabled();
  const grid = configuration.getByLabel("Grid size");
  await grid.selectOption("8");
  const saved = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      /\/api\/v1\/admin\/levels\/[^/]+\/drafts\/$/.test(
        new URL(response.url()).pathname,
      ),
  );
  await page.getByRole("button", { name: "Save immutable draft" }).click();
  expect((await saved).status()).toBe(201);
  await page.reload();
  await expect(
    page.getByLabel("Level configuration").getByLabel("Grid size"),
  ).toHaveValue("8");
  expect(strictRuntime.unexpectedFailures).toEqual([]);
  await captureOrdinaryJourney({
    page,
    testInfo: test.info(),
    gate: "designer-roundtrip",
    route: "/inceptivec-gamification-admin/login",
    actions: [
      "Authenticated as Administrator.",
      "Selected an allowed grid size and saved an immutable draft.",
      "Reloaded the Designer.",
    ],
    assertions: [
      "Governed canvas dimensions remained immutable and the selected grid persisted.",
    ],
  });
});

test("H015-DES-POINTER-002__e2e_ordinary_user__touch_chooser_places_a_canonical_scout", async ({
  page,
  strictRuntime,
}) => {
  test.skip(
    !("hasTouch" in test.info().project.use) ||
      !test.info().project.use.hasTouch,
    "Touch interaction is exercised by the mobile and tablet projects.",
  );
  await loginAsAdministrator(page);
  const scouts = page.locator('button[aria-label^="SCOUT at"]');
  const before = await scouts.count();
  const category = page.getByRole("button", {
    name: "Alien Ships",
    exact: true,
  });
  const categoryBox = await category.boundingBox();
  if (!categoryBox)
    throw new Error("The Alien Ships palette control is not touch reachable.");
  await page.touchscreen.tap(
    categoryBox.x + categoryBox.width / 2,
    categoryBox.y + categoryBox.height / 2,
  );
  const chooser = page.getByRole("dialog", { name: "Alien Ships chooser" });
  await expect(chooser).toBeVisible();
  const scoutOption = chooser.getByRole("button", { name: /^SCOUT/ });
  const scoutBox = await scoutOption.boundingBox();
  if (!scoutBox)
    throw new Error("The Scout asset control is not touch reachable.");
  await page.touchscreen.tap(
    scoutBox.x + scoutBox.width / 2,
    scoutBox.y + scoutBox.height / 2,
  );
  await expect(chooser).toBeHidden();
  await expect(scouts).toHaveCount(before + 1);
  await expect(scouts.last()).toBeVisible();
  expect(strictRuntime.unexpectedFailures).toEqual([]);
  await captureOrdinaryJourney({
    page,
    testInfo: test.info(),
    gate: "designer-review-matrix",
    route: "/inceptivec-gamification-admin/login",
    actions: [
      "Authenticated as Administrator on a touch viewport.",
      "Tapped the Alien Ships chooser and tapped the Scout option.",
    ],
    assertions: [
      "The chooser closed and the canonical Scout was added to the visible canvas.",
    ],
  });
});

test("H015-DES-POINTER-002__e2e_ordinary_user_negative__touch_cancel_leaves_the_canvas_unchanged", async ({
  page,
  strictRuntime,
}) => {
  test.skip(
    !("hasTouch" in test.info().project.use) ||
      !test.info().project.use.hasTouch,
    "Touch interaction is exercised by the mobile and tablet projects.",
  );
  await loginAsAdministrator(page);
  const scouts = page.locator('button[aria-label^="SCOUT at"]');
  const before = await scouts.count();
  const category = page.getByRole("button", {
    name: "Alien Ships",
    exact: true,
  });
  const categoryBox = await category.boundingBox();
  if (!categoryBox)
    throw new Error("The Alien Ships palette control is not touch reachable.");
  await page.touchscreen.tap(
    categoryBox.x + categoryBox.width / 2,
    categoryBox.y + categoryBox.height / 2,
  );
  const chooser = page.getByRole("dialog", { name: "Alien Ships chooser" });
  const cancel = chooser.getByRole("button", { name: "Close chooser" });
  const cancelBox = await cancel.boundingBox();
  if (!cancelBox)
    throw new Error("The chooser cancel control is not touch reachable.");
  await page.touchscreen.tap(
    cancelBox.x + cancelBox.width / 2,
    cancelBox.y + cancelBox.height / 2,
  );
  await expect(chooser).toBeHidden();
  await expect(scouts).toHaveCount(before);
  expect(strictRuntime.unexpectedFailures).toEqual([]);
  await captureOrdinaryJourney({
    page,
    testInfo: test.info(),
    gate: "designer-review-matrix",
    route: "/inceptivec-gamification-admin/login",
    actions: [
      "Authenticated as Administrator on a touch viewport.",
      "Opened the Alien Ships chooser and tapped Close chooser.",
    ],
    assertions: ["Cancelling the chooser left the authored canvas unchanged."],
  });
});
