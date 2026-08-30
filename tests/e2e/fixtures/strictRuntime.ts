import { expect, test as base } from '@playwright/test';

type StrictRuntime = { unexpectedFailures: string[] };

export const test = base.extend<{ strictRuntime: StrictRuntime }>({
  strictRuntime: async ({ page }, use) => {
    const unexpectedFailures: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') unexpectedFailures.push(`console: ${message.text()}`);
    });
    page.on('pageerror', (error) => unexpectedFailures.push(`pageerror: ${error.message}`));
    page.on('requestfailed', (request) => unexpectedFailures.push(`requestfailed: ${request.url()} (${request.failure()?.errorText ?? 'unknown'})`));
    page.on('response', (response) => {
      if (response.status() >= 400 && response.request().resourceType() !== 'favicon') {
        unexpectedFailures.push(`http-${response.status()}: ${response.url()}`);
      }
    });
    await use({ unexpectedFailures });
    expect(unexpectedFailures, `unexpected browser failures:\n${unexpectedFailures.join('\n')}`).toEqual([]);
  },
});

export { expect };
