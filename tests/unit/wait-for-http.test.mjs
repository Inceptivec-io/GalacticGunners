import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { once } from "node:events";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const script = new URL("../../scripts/wait-for-http.mjs", import.meta.url);
const scriptPath = fileURLToPath(script);

function runWaitForHttp(args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [scriptPath, ...args], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk;
    });
    child.stderr.on("data", (chunk) => {
      output += chunk;
    });
    child.on("close", (code) => resolve({ code, output }));
  });
}

test("CI readiness accepts an HTTP 200 response", async () => {
  const server = createServer((_request, response) => {
    response.writeHead(200, { "content-type": "application/json" });
    response.end('{"status":"ok"}');
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();

  try {
    const result = await runWaitForHttp([
      "--url",
      `http://127.0.0.1:${port}`,
      "--timeout-ms",
      "1000",
      "--interval-ms",
      "10",
      "--request-timeout-ms",
      "200",
    ]);
    assert.equal(result.code, 0, result.output);
  } finally {
    server.close();
    await once(server, "close");
  }
});

test("CI readiness fails closed when no server can respond", async () => {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();
  server.close();
  await once(server, "close");

  const result = await runWaitForHttp([
    "--url",
    `http://127.0.0.1:${port}`,
    "--timeout-ms",
    "50",
    "--interval-ms",
    "5",
    "--request-timeout-ms",
    "10",
  ]);
  assert.equal(result.code, 1);
  assert.match(result.output, /timed out/i);
});

test("CI readiness terminates a connection that never sends an HTTP response", async () => {
  const server = createServer(() => {});
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();

  try {
    const startedAt = Date.now();
    const result = await runWaitForHttp([
      "--url",
      `http://127.0.0.1:${port}`,
      "--timeout-ms",
      "80",
      "--interval-ms",
      "10",
      "--request-timeout-ms",
      "500",
    ]);
    assert.equal(result.code, 1);
    assert.match(result.output, /timed out/i);
    assert.ok(Date.now() - startedAt < 400, result.output);
  } finally {
    server.close();
    await once(server, "close");
  }
});
