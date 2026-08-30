import { expect, test as base } from "@playwright/test";

type StrictRuntime = {
  unexpectedFailures: string[];
  allowHttpFailure: (url: RegExp, status: number) => void;
  allowConsoleError: (message: RegExp) => void;
};

export const test = base.extend<{ strictRuntime: StrictRuntime }>({
  strictRuntime: async ({ page }, use) => {
    const unexpectedFailures: string[] = [];
    const allowedHttpFailures: Array<{ url: RegExp; status: number }> = [];
    const allowedConsoleErrors: RegExp[] = [];
    page.on("console", (message) => {
      if (
        message.type() === "error" &&
        !allowedConsoleErrors.some((pattern) => pattern.test(message.text()))
      ) {
        unexpectedFailures.push(`console: ${message.text()}`);
      }
    });
    page.on("pageerror", (error) =>
      unexpectedFailures.push(`pageerror: ${error.message}`),
    );
    page.on("requestfailed", (request) =>
      unexpectedFailures.push(
        `requestfailed: ${request.url()} (${request.failure()?.errorText ?? "unknown"})`,
      ),
    );
    page.on("response", (response) => {
      const allowed = allowedHttpFailures.some(
        (rule) =>
          rule.status === response.status() && rule.url.test(response.url()),
      );
      if (
        response.status() >= 400 &&
        response.request().resourceType() !== "favicon" &&
        !allowed
      ) {
        unexpectedFailures.push(`http-${response.status()}: ${response.url()}`);
      }
    });
    await use({
      unexpectedFailures,
      allowHttpFailure: (url, status) =>
        allowedHttpFailures.push({ url, status }),
      allowConsoleError: (message) => allowedConsoleErrors.push(message),
    });
    expect(
      unexpectedFailures,
      `unexpected browser failures:\n${unexpectedFailures.join("\n")}`,
    ).toEqual([]);
  },
});

export { expect };
