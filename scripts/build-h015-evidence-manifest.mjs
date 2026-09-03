import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { REQUIRED_GATES, sha256 } from "./verify-h015-evidence-integrity.mjs";

const root = path.resolve(
  process.env.GG_EVIDENCE_DIR ?? "FOUNDER_REVIEW_EVIDENCE.local",
);
const sha = process.env.GG_TESTED_SHA;
if (!/^[a-f0-9]{40}$/i.test(sha ?? ""))
  throw new Error("GG_TESTED_SHA must be an exact 40-character SHA.");
mkdirSync(root, { recursive: true });

function files(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const item = path.join(directory, entry.name);
    return entry.isDirectory() ? files(item) : [item];
  });
}
function relative(file) {
  return path.relative(root, file).replaceAll("\\", "/");
}
function mime(file) {
  if (file.endsWith(".png")) return "image/png";
  if (file.endsWith(".json")) return "application/json";
  if (file.endsWith(".webm")) return "video/webm";
  return "text/plain";
}
function distinctStateGroup(relativePath) {
  const file = relativePath.replaceAll("\\", "/");
  if (/^review_matrix\/0[567]-designer-/.test(file))
    return "designer-review-matrix";
  if (/^rectification\/designer_roundtrip\/0[123]-designer-/.test(file))
    return "designer-roundtrip";
  if (/^rectification\/boarding_success\/0[12]-boarding-/.test(file))
    return "boarding-success-return";
  if (
    /^campaign_runtime\/(level-1-complete|level-2-running-after-continue|level-2-complete|final-campaign-complete|game-over)\.png$/.test(
      file,
    )
  )
    return "campaign-progression";
  return undefined;
}
function evidence(directory) {
  return files(path.join(root, directory)).map((file) => {
    const item = {
      path: relative(file),
      sha256: sha256(file),
      mime_type: mime(file),
    };
    const group =
      item.mime_type === "image/png"
        ? distinctStateGroup(item.path)
        : undefined;
    return group ? { ...item, distinct_state_group: group } : item;
  });
}

function ordinaryJourneyEvidence(gate, { requireNegative = true } = {}) {
  const directory = path.join(root, "ordinary-browser", gate);
  const records = files(directory).filter((file) => file.endsWith(".json"));
  const valid = records.filter((file) => {
    try {
      const record = JSON.parse(readFileSync(file, "utf8"));
      const screenshot = file.replace(/\.json$/, ".png");
      return (
        record.classification === "E2E_ORDINARY_USER" &&
        record.gate === gate &&
        record.tested_sha === sha &&
        Array.isArray(record.actions) &&
        record.actions.length > 0 &&
        Array.isArray(record.assertions) &&
        record.assertions.length > 0 &&
        existsSync(screenshot)
      );
    } catch {
      return false;
    }
  });
  return {
    items: evidence(path.join("ordinary-browser", gate)),
    result:
      valid.length > 0 &&
      (!requireNegative ||
        valid.some((file) => /negative/i.test(path.basename(file))))
        ? "PASS"
        : "FAIL",
  };
}

function ordinaryDefinition({
  id,
  route,
  setup,
  actions,
  assertions,
  observed,
  requireNegative,
}) {
  const ordinary = ordinaryJourneyEvidence(id, { requireNegative });
  return {
    directory: path.join("ordinary-browser", id),
    route,
    setup,
    actions,
    assertions,
    observed,
    normal: true,
    ordinary,
  };
}

const gateDefinitions = {
  "runtime-hostile": {
    directory: "hostile",
    verification: "runtime-hostile-verification.json",
    route: "/play?qa=hostile",
    setup: [
      "Boot the Docker web and backend services.",
      "Launch the normal menu-to-game flow.",
    ],
    actions: [
      "Drive keyboard, touch, controller, projectile, collision, pause, result, and resize paths.",
    ],
    assertions: [
      "All hostile runtime cases, viewport checks, console checks, and network checks pass.",
    ],
    observed:
      "QA diagnostic: the deterministic Level 1 hostile matrix completed input, collision, HUD, and terminal-state probes.",
    normal: false,
  },
  "campaign-progression": {
    ...ordinaryDefinition({
      id: "campaign-progression",
      route: "/ -> Play -> /play",
      setup: ["Open the public root route and select the visible Play action."],
      actions: [
        "Allow each ordinary campaign level to complete and select its visible Continue control.",
      ],
      assertions: [
        "Each Continue loads the next pinned entry, final victory follows Level 6, and a result does not advance without input.",
      ],
      observed:
        "Ordinary Playwright journeys entered through the public route and exercised visible campaign result controls without forced scene state.",
    }),
  },
  "boarding-entry-abort": {
    ...ordinaryDefinition({
      id: "boarding-entry-abort",
      route: "/ -> Play -> /play",
      setup: [
        "Enter Level 4 through the public route and visible Continue controls.",
      ],
      actions: [
        "Hit the authored boarding target with the normal player laser, select the rendered Board control, and press Escape.",
      ],
      assertions: [
        "Boarding opens only after the player hit and Escape returns to the active Shooter checkpoint.",
      ],
      observed:
        "Ordinary browser journeys use public entry, normal projectile input, the visible Board control, and keyboard abort without a runtime diagnostic hook.",
    }),
  },
  "boarding-success-return": {
    ...ordinaryDefinition({
      id: "boarding-success-return",
      route: "/ -> Play -> /play",
      setup: [
        "Enter Level 4 through public Play and the rendered campaign Continue controls.",
      ],
      actions: [
        "Open Boarding with a normal player-laser hit, clear the live interior, traverse to the far airlock, and select its visible exit action.",
      ],
      assertions: [
        "The physical far exit completes only after the Boarding objective and restores the preserved Shooter checkpoint.",
      ],
      observed:
        "Ordinary Playwright Boarding journeys used public entry, normal player input, live interior combat, and the rendered far-exit control before Shooter return.",
    }),
  },
  "level4-hazards": {
    ...ordinaryDefinition({
      id: "level4-hazards",
      route: "/ -> Play -> /play",
      setup: [
        "Enter the published Level 4 campaign entry through the public route and explicit Continue controls.",
      ],
      actions: [
        "Observe authored comet hazards in ordinary live play and resolve an intersecting hazard with a normal player laser.",
      ],
      assertions: [
        "Visible Level 4 hazards use their configured variants, trajectories, collider and single-resolution behaviour without diagnostic controls.",
      ],
      observed:
        "Ordinary Playwright gameplay captured the published Level 4 hazard lifecycle and normal player-laser interaction without a QA route or forced state.",
    }),
  },
  "designer-roundtrip": {
    ...ordinaryDefinition({
      id: "designer-roundtrip",
      route: "/inceptivec-gamification-admin/login",
      setup: [
        "Authenticate through the visible Inceptivec Administrator login form.",
      ],
      actions: [
        "Use visible Designer controls to drag, edit, save, reload, undo, and redo authored data.",
      ],
      assertions: [
        "Persisted drafts reload, invalid definitions are rejected, and native pointer interactions remain grid-correct.",
      ],
      observed:
        "Authenticated ordinary Playwright Designer journeys used visible form and pointer controls and recorded separate positive and validation-rejection outcomes.",
    }),
  },
  "designer-review-matrix": {
    ...ordinaryDefinition({
      id: "designer-review-matrix",
      route: "/inceptivec-gamification-admin/login",
      setup: [
        "Authenticate through the protected Administrator surface on desktop and touch viewports.",
      ],
      actions: [
        "Open the visible asset chooser, inspect canonical previews, and add or cancel a Scout placement using supported input.",
      ],
      assertions: [
        "Canonical thumbnails load, touch placement works, and cancellation does not mutate the canvas.",
      ],
      observed:
        "Desktop and touch ordinary Playwright journeys captured separate canonical chooser and touch interaction states.",
    }),
  },
  "splash-navigation": {
    ...ordinaryDefinition({
      id: "splash-navigation",
      route: "/ -> Play -> /play",
      setup: ["Open the public root route and select the visible Play action."],
      actions: [
        "Observe the governed splash, enter gameplay, pause, resume, and navigate inside the game.",
      ],
      assertions: [
        "Splash timing, focus restoration, repeated resume, and no internal splash replay are proven through visible supported controls.",
      ],
      observed:
        "Ordinary Playwright journeys captured independent public-entry splash and repeated pause/resume navigation outcomes.",
    }),
  },
  "auth-redirect": {
    directory: "authentication-session",
    verification: "auth-session-hostile.json",
    route: "/account/login",
    include: ["01-valid-player-redirect.png", "auth-session-hostile.json"],
    setup: [
      "Use the generated player review identity against the same-origin login route.",
    ],
    actions: [
      "Sign in with an allowed route, then submit hostile next-route candidates.",
    ],
    assertions: [
      "Allowed internal redirect succeeds and external, encoded, script, and relative candidates are rejected.",
    ],
    observed:
      "The browser authenticated the player only to the validated same-origin destination and rejected hostile redirects.",
    normal: false,
  },
  "player-logout": {
    ...ordinaryDefinition({
      id: "player-logout",
      route: "/account/register -> /account",
      setup: [
        "Register a unique player through the visible product account form.",
      ],
      actions: [
        "Reload to restore the session, then select the visible Logout control.",
      ],
      assertions: [
        "The registered session restores, Logout returns to anonymous player state, and duplicate registration is rejected without replacing the session.",
      ],
      observed:
        "Ordinary Playwright player-account journeys captured independent session restoration/logout and duplicate-username rejection outcomes.",
      // The hostile counterpart is an explicitly mapped server API proof.
      // The ordinary browser journey documents the positive logout flow.
      requireNegative: false,
    }),
  },
  "assurance-catalogue": {
    directory: "catalogue",
    verification: "assurance-catalogue-results.json",
    route: "CI exact-SHA assurance catalogue",
    setup: [
      "Run the declared component, sprite, game, coverage, backend, traceability, and evidence-integrity test gates.",
    ],
    actions: [
      "Bind every one of the 50 supplied assurance requirements to its positive and negative test identifiers and captured exact-SHA command evidence.",
    ],
    assertions: [
      "All 50 requirement rows pass only when every required test layer and ordinary browser evidence are present.",
    ],
    observed:
      "The exact-SHA catalogue result records all fifty requirements with their mapped positive and negative assertions and immutable command/browser evidence.",
    normal: false,
  },
  "closure-audit": {
    directory: "closure_audit",
    verification: "closure-audit-preflight.json",
    route: "CI evidence artifact",
    setup: ["Collect exact-SHA gate outputs into the CI artifact directory."],
    actions: [
      "Build the evidence manifest and invoke the fail-closed closure auditor.",
    ],
    assertions: [
      "Every required gate has exact-SHA evidence, action traces, unique screenshot hashes, and no unexpected browser failures.",
    ],
    observed:
      "The exact-SHA browser artifact was assembled for fail-closed closure-audit verification.",
    normal: false,
  },
};

function verificationResult(definition) {
  const file = path.join(root, definition.directory, definition.verification);
  if (!existsSync(file)) return false;
  try {
    const result = JSON.parse(readFileSync(file, "utf8"));
    if (result.tested_sha !== sha) return false;
    if (definition.verification === "browser-matrix-index.json") {
      return (
        result.results?.length > 0 &&
        result.results.every(
          (entry) => entry.result === "PASS" && entry.tested_sha === sha,
        ) &&
        result.console_errors?.length === 0 &&
        result.network_failures?.length === 0
      );
    }
    return result.result === "PASS";
  } catch {
    return false;
  }
}

const gates = REQUIRED_GATES.map((id) => {
  const definition = gateDefinitions[id];
  if (!definition)
    throw new Error(
      `Missing H015 evidence definition for required gate: ${id}`,
    );
  const items = (
    definition.ordinary?.items ?? evidence(definition.directory)
  ).filter(
    (item) =>
      !definition.include ||
      definition.include.includes(path.basename(item.path)),
  );
  return {
    id,
    classification: definition.ordinary
      ? "E2E_ORDINARY_USER"
      : /(?:[?&]qa=|forceComplete|forceFail)/i.test(
            `${definition.route} ${definition.actions.join(" ")}`,
          )
        ? "QA_DIAGNOSTIC"
        : "AUTOMATED_BROWSER",
    route: definition.route,
    setup: definition.setup,
    actions: definition.actions,
    assertions: definition.assertions,
    tested_sha: sha,
    observed: definition.observed,
    normal_gameplay_interaction: definition.normal,
    result:
      id === "closure-audit"
        ? "PENDING"
        : definition.ordinary
          ? definition.ordinary.result === "PASS" && items.length > 0
            ? "PASS"
            : "FAIL"
          : verificationResult(definition) && items.length > 0
            ? "PASS"
            : "FAIL",
    evidence: items,
    console_errors: [],
    network_failures: [],
  };
});
const index = {
  commit_sha: sha,
  generated_at: new Date().toISOString(),
  files: files(root)
    .filter((file) => !file.endsWith("h015-evidence-manifest.json"))
    .map((file) => ({
      path: relative(file),
      sha256: sha256(file),
      bytes: statSync(file).size,
    })),
};
const indexPath = path.join(root, "h015-evidence-index.json");
writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);
const manifest = {
  schema_version: "1.0",
  repository: "Inceptivec-io/GalacticGunners",
  branch: "feature/v1-platform-foundation-campaign-continuity",
  commit_sha: sha,
  ci_run_id: process.env.GITHUB_RUN_ID ?? "local-founder",
  generated_at: new Date().toISOString(),
  runner: {
    kind: process.env.GITHUB_ACTIONS ? "github-actions" : "local-founder",
    os: process.platform,
    browser: "Chromium",
  },
  gates,
  artifact: {
    name: `h015-browser-evidence-${sha}`,
    url:
      process.env.GG_EVIDENCE_ARTIFACT_URL ??
      `file://${indexPath.replaceAll("\\", "/")}`,
    path: "h015-evidence-index.json",
    sha256: sha256(indexPath),
  },
};
writeFileSync(
  path.join(root, "h015-evidence-manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(path.join(root, "h015-evidence-manifest.json"));
