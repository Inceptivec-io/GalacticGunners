import assert from "node:assert/strict";
import test from "node:test";

import { compileLevelDocument } from "../src/levels/LevelCompiler";
import type { LevelAuthoringDocument } from "../src/levels/LevelAuthoringDocument";
import { levelChecksum } from "../src/levels/LevelChecksum";
import { validateLevelDefinition } from "../src/levels/LevelValidator";
import { CAMPAIGN_DEFINITIONS } from "../src/levels/campaignDefinitions";
import {
  hazardEntryPoint,
  hazardTravelVector,
  hazardVariantFrame,
  cometRotationForVelocity,
  asteroidAngularVelocity,
} from "../src/systems/HazardPolicy";
import {
  hostileWeaponHardpoints,
  nextHostileIndex,
} from "../src/systems/HostileWeaponPolicy";

const document: LevelAuthoringDocument = {
  schema_version: "1.1",
  id: "level-02",
  slug: "level-02",
  name: "Mixed Formation",
  version: 2,
  status: "DRAFT",
  sequence: 2,
  seed: 7,
  canvas: {
    width: 1280,
    height: 720,
    grid_size: 16,
    snap_enabled: true,
    background_asset_id: "background.starfield",
  },
  player_spawns: [
    {
      id: "player-1",
      slot: 1,
      asset_id: "player.ship",
      x: 640,
      y: 610,
      rotation: 0,
      enabled: true,
    },
    {
      id: "player-2",
      slot: 2,
      asset_id: "player.ship",
      x: 640,
      y: 610,
      rotation: 0,
      enabled: false,
    },
  ],
  entities: [
    {
      id: "scout-1",
      entity_type: "SCOUT",
      asset_id: "enemy.scout",
      x: 300,
      y: 120,
      width: 44,
      height: 58,
      rotation: 0,
      z_index: 4,
      behaviour_profile: "enemy.scout.standard",
      enabled: true,
      tags: [],
    },
    {
      id: "cruiser-1",
      entity_type: "CRUISER",
      asset_id: "enemy.cruiser",
      x: 560,
      y: 160,
      width: 72,
      height: 64,
      rotation: 0,
      z_index: 4,
      behaviour_profile: "enemy.cruiser.standard",
      enabled: true,
      tags: [],
    },
  ],
  formations: [
    {
      id: "mixed",
      name: "Mixed",
      layout: "FREEFORM",
      bounds: { x: 280, y: 100, width: 360, height: 140 },
      member_ids: ["scout-1", "cruiser-1"],
      motion_profile: "formation.standard",
      entry_delay_ms: 0,
      repeat: 0,
    },
  ],
  hazard_emitters: [],
  shield_structures: [],
  drop_rules: [],
  objectives: [
    {
      id: "clear",
      type: "DESTROY_ALL_HOSTILES",
      required: true,
      target_entity_ids: [],
      duration_ms: null,
    },
  ],
  boarding_anchors: [],
  gameplay: {
    player_lives_at_campaign_start: 3,
    nukes_at_campaign_start: 2,
    nuke_rearm_max: 150,
    allow_pause: true,
    allow_replay: true,
    allow_main_menu_resume: true,
    completion_bonus_profile: "legacy",
    scoring_profile: "LEGACY_V1_GOVERNED",
  },
  performance_budget: {
    max_active_enemies: 10,
    max_active_hazards: 4,
    max_projectiles: 32,
    max_shield_tiles: 64,
    max_total_runtime_objects: 128,
  },
};

test("schema 1.1 compilation retains freeform mixed entities and stable IDs", () => {
  const compiled = compileLevelDocument(document);
  validateLevelDefinition(compiled);
  assert.equal(compiled.enemy_formations.length, 2);
  assert.deepEqual(
    compiled.enemy_formations.map((entity) => entity.entity_id),
    ["scout-1", "cruiser-1"],
  );
  assert.deepEqual(
    compiled.enemy_formations.map((entity) => entity.type),
    ["scout", "cruiser"],
  );
  assert.ok(compiled.enemy_formations.every((entity) => entity.fixed_position));
  assert.ok(
    compiled.enemy_formations.every(
      (entity) => entity.motion_profile === "formation.standard",
    ),
  );
});

test("schema 1.1 permits an authored timed hazard emitter with no initial instance", () => {
  const authored: LevelAuthoringDocument = {
    ...document,
    hazard_emitters: [
      {
        id: "comet-later",
        hazard_type: "COMET",
        asset_id: "hazard.comet",
        enabled: true,
        spawn_pattern: "ALTERNATING_EDGES",
        entry_edges: ["TOP"],
        spawn_points: [],
        spawn_interval_ms: 6000,
        spawn_jitter_ms: 0,
        initial_count: 0,
        maximum_active: 1,
        speed_min: 120,
        speed_max: 140,
        angular_velocity_min: 0,
        angular_velocity_max: 0,
        collision_damage: 1,
        despawn_margin: 64,
      },
    ],
  };
  const compiled = compileLevelDocument(authored);
  assert.equal(compiled.hazards?.[0].count, 0);
  validateLevelDefinition(compiled);
});

test("runtime validation rejects a malformed pickup table before it reaches Phaser", () => {
  const compiled = compileLevelDocument(document);
  compiled.drop_tables = [{ host: "scout", entries: [] }];
  assert.throws(
    () => validateLevelDefinition(compiled),
    /Invalid pickup table/,
  );
});

test("hazard variants remain deterministic and ignore the wrong asset family", () => {
  const emitter = {
    id: "level-04-comets",
    variant_mode: "ORDERED" as const,
    variant_ids: ["COMET_VARIANT_02", "COMET_VARIANT_05"],
    entry_edges: ["LEFT" as const],
    despawn_margin: 64,
  };
  assert.equal(hazardVariantFrame(emitter, "comet", 0, 12004), 1);
  assert.equal(hazardVariantFrame(emitter, "comet", 1, 12004), 4);
  assert.equal(hazardVariantFrame(emitter, "asteroid", 0, 12004), 0);
});

test("hazard policy emits reproducible off-screen entries and inward trajectories for every edge", () => {
  const emitter = {
    id: "level-04-hazards",
    variant_mode: "SEEDED_RANDOM" as const,
    variant_ids: ["COMET_VARIANT_01", "COMET_VARIANT_03", "COMET_VARIANT_06"],
    entry_edges: ["TOP", "RIGHT", "BOTTOM", "LEFT"] as const,
    despawn_margin: 64,
  };
  const viewport = { width: 1280, height: 720 };
  const expected = [
    { x: "lane", y: -64, direction: { x: 0.65, y: 1 } },
    { x: 1344, y: "lane", direction: { x: -1, y: 0.28 } },
    { x: "lane", y: 784, direction: { x: 0, y: -1 } },
    { x: -64, y: "lane", direction: { x: 1, y: 0.28 } },
  ];

  for (let ordinal = 0; ordinal < expected.length; ordinal += 1) {
    const point = hazardEntryPoint(emitter, ordinal, 12004, viewport);
    const repeated = hazardEntryPoint(emitter, ordinal, 12004, viewport);
    assert.deepEqual(point, repeated);
    const current = expected[ordinal];
    if (current.x === "lane") assert.ok(point.x >= 80 && point.x <= 1200);
    else assert.equal(point.x, current.x);
    if (current.y === "lane") assert.ok(point.y >= 45 && point.y <= 675);
    else assert.equal(point.y, current.y);
    assert.deepEqual(
      hazardTravelVector(
        emitter.entry_edges[ordinal],
        12004,
        `hazard:${ordinal}`,
      ),
      current.direction,
    );
  }
});

test("asteroid spin is deterministic, non-zero, and within the governed angular range", () => {
  const first = asteroidAngularVelocity(12002, "asteroid:0");
  assert.equal(first, asteroidAngularVelocity(12002, "asteroid:0"));
  assert.ok(Math.abs(first) >= 40 && Math.abs(first) <= 80);
  assert.notEqual(first, 0);
});

test("asteroid spin honours magnitude-only authoring and seeded direction", () => {
  const values = Array.from({ length: 24 }, (_, ordinal) =>
    asteroidAngularVelocity(12002, `asteroid:${ordinal}`, 50, 60),
  );
  assert.ok(values.every((value) => Math.abs(value) >= 50 && Math.abs(value) <= 60));
  assert.ok(values.every((value) => value !== 0));
  assert.ok(values.some((value) => value < 0));
  assert.ok(values.some((value) => value > 0));
  values.forEach((value, ordinal) =>
    assert.equal(
      value,
      asteroidAngularVelocity(12002, `asteroid:${ordinal}`, 50, 60),
    ),
  );
});

test("top-entry comets choose a deterministic lateral sign while retaining a downward path", () => {
  const directions = Array.from({ length: 32 }, (_, ordinal) =>
    hazardTravelVector("TOP", 12004 + ordinal, `comet:${ordinal}`),
  );
  assert.ok(directions.every((direction) => direction.y === 1));
  assert.ok(directions.every((direction) => Math.abs(direction.x) === 0.65));
  assert.ok(directions.some((direction) => direction.x < 0));
  assert.ok(directions.some((direction) => direction.x > 0));
});

test("official campaign comet entries remain lateral-biased and never use bottom entry", () => {
  const expected = new Map<number, readonly string[]>([
    [1, []],
    [2, ["LEFT", "RIGHT", "LEFT", "RIGHT", "TOP"]],
    [4, ["LEFT", "RIGHT"]],
    [5, ["LEFT", "RIGHT", "LEFT", "RIGHT", "TOP"]],
    [6, ["LEFT", "RIGHT", "LEFT", "RIGHT", "TOP"]],
  ]);
  for (const definition of CAMPAIGN_DEFINITIONS) {
    const entries = (definition.hazards ?? [])
      .filter((hazard) => hazard.type === "comet")
      .flatMap((hazard) =>
        Array.from({ length: hazard.count }, () => hazard.entry_edge),
      );
    assert.deepEqual(entries, expected.get(definition.sequence) ?? []);
    assert.equal(entries.includes("BOTTOM"), false);
  }
});

test("hostile weapon hardpoints are simultaneous, authored, and starvation-free", () => {
  assert.deepEqual(hostileWeaponHardpoints("scout"), [0]);
  assert.deepEqual(hostileWeaponHardpoints("cruiser"), [-0.22, 0.22]);
  assert.deepEqual(hostileWeaponHardpoints("destroyer"), [-0.28, 0.28]);
  assert.deepEqual(hostileWeaponHardpoints("mothership"), [-0.3, 0, 0.3]);

  assert.deepEqual(
    Array.from({ length: 8 }, (_, ordinal) => nextHostileIndex(ordinal, 4)),
    [0, 1, 2, 3, 0, 1, 2, 3],
  );
  assert.throws(() => nextHostileIndex(-1, 4), /non-negative/);
  assert.throws(() => nextHostileIndex(0, 0), /At least one/);
});

test("a hazard-focused authored level retains a real hostile runtime contract", () => {
  const hazardLevel: LevelAuthoringDocument = {
    ...document,
    id: "level-04-hazard-assurance",
    slug: "level-04-hazard-assurance",
    sequence: 4,
    entities: [{ ...document.entities[0], id: "hazard-scout", x: 180, y: 120 }],
    formations: [
      {
        id: "hazard-scout-formation",
        name: "Hazard Scout",
        layout: "FREEFORM",
        bounds: { x: 180, y: 120, width: 0, height: 0 },
        member_ids: ["hazard-scout"],
        motion_profile: "formation.standard",
        entry_delay_ms: 0,
        repeat: 0,
      },
    ],
    shield_structures: [],
    hazard_emitters: [
      {
        id: "hazard-comet",
        hazard_type: "COMET",
        asset_id: "hazard.comet",
        enabled: true,
        variant_mode: "FIXED",
        variant_ids: ["COMET_VARIANT_02"],
        spawn_pattern: "FIXED_POINTS",
        entry_edges: ["TOP"],
        spawn_points: [{ x: 640, y: 260 }],
        spawn_interval_ms: 30000,
        spawn_jitter_ms: 0,
        initial_count: 1,
        maximum_active: 1,
        speed_min: 90,
        speed_max: 90,
        angular_velocity_min: 0,
        angular_velocity_max: 0,
        collision_damage: 1,
        despawn_margin: 64,
      },
    ],
    objectives: [
      {
        id: "survive-hazard",
        type: "SURVIVE_DURATION",
        required: true,
        target_entity_ids: [],
        duration_ms: 30000,
      },
    ],
  };
  const compiled = compileLevelDocument(hazardLevel);
  validateLevelDefinition(compiled);
  assert.equal(compiled.enemy_formations.length, 1);
  assert.equal(compiled.hazards?.[0].type, "comet");
});

test("sparse authored grid compiles each real member without inventing phantom ships", () => {
  const sparse: LevelAuthoringDocument = {
    ...document,
    entities: [
      { ...document.entities[0], id: "grid-a", x: 300, y: 120 },
      { ...document.entities[0], id: "grid-b", x: 340, y: 120 },
      { ...document.entities[0], id: "grid-c", x: 300, y: 160 },
    ],
    formations: [
      {
        id: "sparse-grid",
        name: "Sparse grid",
        layout: "GRID",
        bounds: { x: 300, y: 120, width: 40, height: 40 },
        member_ids: ["grid-a", "grid-b", "grid-c"],
        motion_profile: "formation.standard",
        entry_delay_ms: 0,
        repeat: 0,
      },
    ],
  };
  const compiled = compileLevelDocument(sparse);
  validateLevelDefinition(compiled);
  assert.equal(compiled.enemy_formations.length, 3);
  assert.deepEqual(
    compiled.enemy_formations.map((entity) => entity.entity_id),
    ["grid-a", "grid-b", "grid-c"],
  );
  assert.ok(compiled.enemy_formations.every((entity) => entity.fixed_position));
});

test("canonical level checksums remain stable when nested object key insertion order differs", async () => {
  assert.equal(
    await levelChecksum({ z: { beta: 2, alpha: 1 }, a: [{ y: 2, x: 1 }] }),
    await levelChecksum({ a: [{ x: 1, y: 2 }], z: { alpha: 1, beta: 2 } }),
  );
});

test("published package retains the governed six-level population baseline", () => {
  const counts = CAMPAIGN_DEFINITIONS.map((definition) =>
    definition.enemy_formations.reduce(
      (total, formation) => total + formation.rows * formation.columns,
      0,
    ),
  );
  const byType = (sequence: number, type: string) =>
    CAMPAIGN_DEFINITIONS[sequence - 1].enemy_formations
      .filter((formation) => formation.type === type)
      .reduce(
        (total, formation) => total + formation.rows * formation.columns,
        0,
      );
  assert.deepEqual(counts, [58, 56, 48, 40, 44, 35]);
  assert.equal(byType(2, "scout"), 48);
  assert.equal(byType(2, "cruiser"), 8);
  assert.deepEqual(
    [byType(3, "scout"), byType(3, "cruiser"), byType(3, "destroyer")],
    [32, 12, 4],
  );
  assert.deepEqual(
    [byType(4, "scout"), byType(4, "cruiser"), byType(4, "destroyer")],
    [30, 6, 4],
  );
  assert.deepEqual(
    [byType(5, "scout"), byType(5, "cruiser"), byType(5, "destroyer")],
    [24, 12, 8],
  );
  assert.deepEqual(
    [
      byType(6, "scout"),
      byType(6, "cruiser"),
      byType(6, "destroyer"),
      byType(6, "mothership"),
    ],
    [18, 10, 6, 1],
  );
  assert.equal(CAMPAIGN_DEFINITIONS[0].shields[0].count * 32, 256);
  const boarding = CAMPAIGN_DEFINITIONS[3].boarding_anchors?.[0];
  assert.equal(boarding?.source_entity_type, "cruiser");
  assert.equal(boarding?.source_entity_id, "level-04:formation-1:r0:c5");
  assert.equal(boarding?.offer_duration_ms, 8000);
});

test("compiler preserves authored objectives and stable Boarding target identity", () => {
  const authored: LevelAuthoringDocument = {
    ...document,
    entities: [
      ...document.entities,
      {
        id: "destroyer-1",
        entity_type: "DESTROYER",
        asset_id: "enemy.destroyer",
        x: 760,
        y: 140,
        width: 92,
        height: 74,
        rotation: 0,
        z_index: 4,
        behaviour_profile: "enemy.destroyer.standard",
        enabled: true,
        tags: [],
      },
    ],
    boarding_anchors: [
      {
        id: "board-1",
        source_entity_id: "destroyer-1",
        source_ship_type: "ALIEN_FRIGATE",
        interior: {
          slug: "alien-frigate",
          version: 1,
          checksum:
            "e9b1af65f0daef6725a7ddf4683b5f6d503e25dabc97aef1212102e6b1e994f3",
        },
        entry_envelope: { width_px: 160, height_px: 128 },
        offer_duration_ms: 8000,
        interaction: "BOARD",
      },
    ],
    objectives: [
      {
        id: "board",
        type: "BOARD_TARGET",
        required: true,
        target_entity_ids: ["destroyer-1"],
        duration_ms: null,
      },
    ],
  };
  const compiled = compileLevelDocument(authored);
  assert.deepEqual(compiled.objectives, authored.objectives);
  assert.equal(compiled.boarding_anchors?.[0].source_entity_id, "destroyer-1");
  assert.equal(compiled.boarding_anchors?.[0].source_entity_type, "destroyer");
  assert.equal(
    compiled.boarding_anchors?.[0].source_selector.formation_index,
    2,
  );
});

test("comet orientation keeps the authored south-facing tail behind travel on every edge", () => {
  for (const edge of ["TOP", "RIGHT", "BOTTOM", "LEFT"] as const) {
    const velocity = hazardTravelVector(edge);
    const rotation = cometRotationForVelocity(velocity);
    // A zero-rotation comet points south. Convert the transformed authored
    // heading back to a world vector and compare its normalized direction.
    const heading = {
      x: Math.cos(rotation + Math.PI / 2),
      y: Math.sin(rotation + Math.PI / 2),
    };
    const magnitude = Math.hypot(velocity.x, velocity.y);
    assert.ok(Math.abs(heading.x - velocity.x / magnitude) < 0.000001, edge);
    assert.ok(Math.abs(heading.y - velocity.y / magnitude) < 0.000001, edge);
  }
});
