import { expect, test as base } from "@playwright/test";

type StrictRuntime = {
  unexpectedFailures: string[];
  allowHttpFailure: (url: RegExp, status: number) => void;
  allowConsoleError: (message: RegExp) => void;
  allowRequestFailure: (url: RegExp, error: RegExp) => void;
};

export const test = base.extend<{ strictRuntime: StrictRuntime }>({
  strictRuntime: async ({ page }, use) => {
    const unexpectedFailures: string[] = [];
    const allowedHttpFailures: Array<{ url: RegExp; status: number }> = [];
    const allowedConsoleErrors: RegExp[] = [];
    const allowedRequestFailures: Array<{ url: RegExp; error: RegExp }> = [];
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
    page.on("requestfailed", (request) => {
      const error = request.failure()?.errorText ?? "unknown";
      if (
        allowedRequestFailures.some(
          (rule) => rule.url.test(request.url()) && rule.error.test(error),
        )
      ) {
        return;
      }
      unexpectedFailures.push(`requestfailed: ${request.url()} (${error})`);
    });
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
      allowRequestFailure: (url, error) =>
        allowedRequestFailures.push({ url, error }),
    });
    expect(
      unexpectedFailures,
      `unexpected browser failures:\n${unexpectedFailures.join("\n")}`,
    ).toEqual([]);
  },
});

export { expect };
