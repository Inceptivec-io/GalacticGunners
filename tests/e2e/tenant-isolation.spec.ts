import { expect, test } from "./fixtures/strictRuntime";

function commandPostCredentials() {
  const username = process.env.COMMAND_POST_REVIEW_USERNAME;
  const password = process.env.COMMAND_POST_REVIEW_PASSWORD;
  if (!username || !password) {
    throw new Error(
      "Command Post browser verification credentials are required.",
    );
  }
  return { username, password };
}

async function loginToCommandPost(page: import("@playwright/test").Page) {
  const credentials = commandPostCredentials();
  await page.goto("/command-post/login");
  await page.getByLabel("Username").fill(credentials.username);
  await page.getByLabel("Password").fill(credentials.password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/command-post$/);
  await expect(
    page.getByRole("heading", { name: "Command Post" }),
  ).toBeVisible();
}

test("H015-PERM-002__e2e_ordinary_user__command_post_member_reads_only_its_authorised_workspace", async ({
  page,
  strictRuntime,
}) => {
  await loginToCommandPost(page);
  strictRuntime.allowRequestFailure(
    /\/command-post\/[a-z0-9-]+\?_rsc=/,
    /net::ERR_ABORTED/,
  );

  const organization = page.locator("main ul a").first();
  await expect(organization).toBeVisible();
  const organizationHref = await organization.getAttribute("href");
  expect(organizationHref).toMatch(/^\/command-post\/[a-z0-9-]+$/);
  await organization.click();
  await expect(page).toHaveURL(/\/command-post\/[a-z0-9-]+$/);
  await expect(
    page.getByRole("heading", { name: "Command Post" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Maps" })).toBeVisible();
  expect(strictRuntime.unexpectedFailures).toEqual([]);
});

test("H015-PERM-002__e2e_ordinary_user_negative__command_post_member_cannot_open_an_unrelated_workspace", async ({
  page,
  strictRuntime,
}) => {
  await loginToCommandPost(page);
  strictRuntime.allowHttpFailure(
    /\/api\/v1\/portal\/organizations\/unrelated-tenant\/$/,
    404,
  );
  strictRuntime.allowConsoleError(
    /Failed to load resource: the server responded with a status of 404/,
  );
  await page.goto("/command-post/unrelated-tenant");
  await expect(page.getByRole("status")).toHaveText(
    "Organisation authority is unavailable.",
  );
  await expect(page.getByText("Maps", { exact: true })).toHaveCount(0);
  expect(strictRuntime.unexpectedFailures).toEqual([]);
});
