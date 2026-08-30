import { expect, test } from "./fixtures/strictRuntime";

function accountIdentity() {
  const suffix = `${Date.now().toString(36).slice(-7)}${Math.floor(Math.random() * 1_000).toString(36)}`;
  return {
    username: `h015pilot${suffix}`,
    displayName: `Pilot ${suffix}`,
    password: "Arcade-Launch-2026!",
  };
}

async function registerPlayer(
  page: import("@playwright/test").Page,
  identity: ReturnType<typeof accountIdentity>,
) {
  await page.goto("/account/register");
  await page.getByLabel("Username").fill(identity.username);
  await page.getByLabel("Display name").fill(identity.displayName);
  await page.getByLabel("Password").fill(identity.password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/account$/);
  await expect(
    page.getByRole("heading", { name: identity.displayName }),
  ).toBeVisible();
}

test("H015-AUTH-002__e2e_ordinary_user__registration_restores_session_and_logout_clears_it", async ({
  page,
  strictRuntime,
}) => {
  const identity = accountIdentity();
  await registerPlayer(page, identity);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: identity.displayName }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Logout" }).click();
  await expect(
    page.getByRole("heading", { name: "Player account" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  expect(strictRuntime.unexpectedFailures).toEqual([]);
});

test("H015-AUTH-002__e2e_ordinary_user_negative__duplicate_username_is_rejected_without_replacing_session", async ({
  page,
  strictRuntime,
}) => {
  const identity = accountIdentity();
  await registerPlayer(page, identity);
  await page.goto("/account/register");
  await page.getByLabel("Username").fill(identity.username);
  await page.getByLabel("Display name").fill(identity.displayName);
  await page.getByLabel("Password").fill(identity.password);
  strictRuntime.allowHttpFailure(/\/api\/v1\/auth\/register\/$/, 400);
  strictRuntime.allowConsoleError(
    /Failed to load resource: the server responded with a status of 400/,
  );
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.locator('main p[role="alert"]')).toHaveText(
    /Account creation could not be completed/,
  );
  await page.goto("/account");
  await expect(
    page.getByRole("heading", { name: identity.displayName }),
  ).toBeVisible();
  expect(strictRuntime.unexpectedFailures).toEqual([]);
});
