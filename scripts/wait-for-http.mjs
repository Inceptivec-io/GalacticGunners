import { setTimeout as sleep } from "node:timers/promises";

const args = process.argv.slice(2);
const valueFor = (name, fallback) => {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
};

const url = valueFor("--url");
const timeoutMs = Number(valueFor("--timeout-ms", "120000"));
const intervalMs = Number(valueFor("--interval-ms", "5000"));
const requestTimeoutMs = Number(valueFor("--request-timeout-ms", "5000"));

if (!url || !Number.isFinite(timeoutMs) || !Number.isFinite(intervalMs) || !Number.isFinite(requestTimeoutMs)) {
  throw new Error("Usage: node scripts/wait-for-http.mjs --url <url> [--timeout-ms <ms>] [--interval-ms <ms>] [--request-timeout-ms <ms>]");
}

const deadline = Date.now() + timeoutMs;
let lastFailure = "No response received.";

while (Date.now() < deadline) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(requestTimeoutMs) });
    if (response.ok) {
      console.log(`HTTP readiness passed: ${url} (${response.status})`);
      process.exit(0);
    }
    lastFailure = `HTTP ${response.status}`;
  } catch (error) {
    lastFailure = error instanceof Error ? error.message : String(error);
  }

  const remainingMs = deadline - Date.now();
  if (remainingMs > 0) {
    await sleep(Math.min(intervalMs, remainingMs));
  }
}

console.error(`HTTP readiness timed out after ${timeoutMs}ms: ${url}; last failure: ${lastFailure}`);
process.exit(1);
