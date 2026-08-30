import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '../e2e/fixtures/strictRuntime';

test('H015-A11Y-001__e2e_ordinary_user__public_entry_has_no_serious_axe_violations', async ({ page, strictRuntime }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['critical', 'serious'].includes(violation.impact ?? '')).map((violation) => violation.id)).toEqual([]);
  expect(strictRuntime.unexpectedFailures).toEqual([]);
});
