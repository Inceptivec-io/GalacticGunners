import assert from "node:assert/strict";
import test from "node:test";

const {
  assertStableGeneration,
  runSerialProjects,
  sameGeneration,
  waitStableReadiness,
} = await import("../../scripts/run-h015-cross-browser-verifier.mjs");

const stable = {
  web: { id: "web-a", restart_count: 0 },
  backend: { id: "backend-a", restart_count: 1 },
  db: { id: "db-a", restart_count: 0 },
};

test("runtime lifecycle accepts an unchanged service generation", () => {
  assert.equal(sameGeneration(stable, structuredClone(stable)), true);
  assert.doesNotThrow(() =>
    assertStableGeneration(stable, structuredClone(stable)),
  );
});

test("runtime lifecycle rejects a container recreation during a browser run", () => {
  const changed = structuredClone(stable);
  changed.web.id = "web-b";
  assert.equal(sameGeneration(stable, changed), false);
  assert.throws(
    () => assertStableGeneration(stable, changed),
    /EXECUTION_INVALID/,
  );
});

test("runtime lifecycle rejects a restart-count mutation during a browser run", () => {
  const changed = structuredClone(stable);
  changed.backend.restart_count += 1;
  assert.throws(
    () => assertStableGeneration(stable, changed),
    /EXECUTION_INVALID/,
  );
});

test("runtime lifecycle rejects unavailable services before browser launch", async () => {
  await assert.rejects(
    waitStableReadiness({
      wait: async () => {},
      snapshot: () => structuredClone(stable),
      request: async () => false,
    }),
    /Stable readiness failed/,
  );
});

test("runtime lifecycle accepts three healthy probes and an unchanged stability window", async () => {
  const result = await waitStableReadiness({
    wait: async () => {},
    snapshot: () => structuredClone(stable),
    request: async () => true,
  });
  assert.equal(result.transcript.length, 3);
  assert.deepEqual(result.generation, stable);
});

test("runtime lifecycle runs browser projects serially", async () => {
  const active = new Set();
  const observed = [];
  const results = await runSerialProjects(
    ["chromium", "firefox", "webkit"],
    async (project) => {
      assert.equal(active.size, 0, "browser projects must not overlap");
      active.add(project);
      observed.push(project);
      await Promise.resolve();
      active.delete(project);
      return project;
    },
  );
  assert.deepEqual(observed, ["chromium", "firefox", "webkit"]);
  assert.deepEqual(results, observed);
});
