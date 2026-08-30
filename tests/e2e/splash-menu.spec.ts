import { expect, test } from './fixtures/strictRuntime';

test('H015-LAUNCH-001__e2e_ordinary_user__fresh_play_shows_splash_before_menu', async ({ page, strictRuntime }) => {
  await page.goto('/play');
  await expect(page.locator('.game-canvas-host canvas')).toBeVisible();
  const initialCanvas = await page.locator('.game-canvas-host canvas').screenshot();
  await page.waitForTimeout(2_100);
  const menuCanvas = await page.locator('.game-canvas-host canvas').screenshot();
  expect(menuCanvas.equals(initialCanvas)).toBeFalsy();
  expect(strictRuntime.unexpectedFailures).toEqual([]);
});

test('H015-LAUNCH-001__e2e_ordinary_user_negative__internal_navigation_does_not_replay_splash', async ({ page, strictRuntime }) => {
  await page.goto('/play');
  await page.waitForTimeout(2_100);
  const menuCanvas = await page.locator('.game-canvas-host canvas').screenshot();
  await page.reload();
  await page.waitForTimeout(250);
  const replayCanvas = await page.locator('.game-canvas-host canvas').screenshot();
  expect(replayCanvas.equals(menuCanvas)).toBeFalsy();
  expect(strictRuntime.unexpectedFailures).toEqual([]);
});
