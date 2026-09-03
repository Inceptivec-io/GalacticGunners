import type { LevelDefinition } from "./LevelDefinition";
import { LEVEL_ONE_DEFINITION } from "./levelOneDefinition";

const shields = LEVEL_ONE_DEFINITION.shields;
const level = (
  definition: Omit<
    LevelDefinition,
    | "schema_version"
    | "status"
    | "version"
    | "player"
    | "shields"
    | "performance_budget"
  >,
): LevelDefinition => ({
  ...definition,
  schema_version: "1.0",
  status: "PUBLISHED",
  version: 1,
  player: { x: 640, y: 610 },
  shields,
  performance_budget: { max_enemies: 58 },
});

/** Six authored, checksum-governed campaign entries. Level 1 is the accepted golden baseline. */
export const CAMPAIGN_DEFINITIONS: LevelDefinition[] = [
  LEVEL_ONE_DEFINITION,
  level({
    id: "level-02",
    slug: "level-02",
    name: "Asteroid Advance",
    sequence: 2,
    seed: 12002,
    enemy_formations: [
      {
        type: "scout",
        rows: 3,
        columns: 16,
        origin: { x: 70, y: 120 },
        spacing: { x: 66, y: 48 },
      },
      {
        type: "cruiser",
        rows: 1,
        columns: 8,
        origin: { x: 190, y: 255 },
        spacing: { x: 128, y: 0 },
      },
    ],
    hazards: [
      {
        type: "asteroid",
        count: 3,
        speed: 72,
        origin: { x: 180, y: 240 },
        spacing: { x: 290, y: 64 },
      },
      {
        type: "comet",
        count: 1,
        speed: 112,
        origin: { x: -64, y: 190 },
        spacing: { x: 0, y: 0 },
        entry_edge: "LEFT",
      },
      {
        type: "comet",
        count: 1,
        speed: 112,
        origin: { x: 1344, y: 260 },
        spacing: { x: 0, y: 0 },
        entry_edge: "RIGHT",
      },
      {
        type: "comet",
        count: 1,
        speed: 112,
        origin: { x: -64, y: 340 },
        spacing: { x: 0, y: 0 },
        entry_edge: "LEFT",
      },
      {
        type: "comet",
        count: 1,
        speed: 112,
        origin: { x: 1344, y: 420 },
        spacing: { x: 0, y: 0 },
        entry_edge: "RIGHT",
      },
      {
        type: "comet",
        count: 1,
        speed: 112,
        origin: { x: 720, y: -64 },
        spacing: { x: 0, y: 0 },
        entry_edge: "TOP",
      },
    ],
    drop_tables: [
      {
        host: "scout",
        entries: [
          { pickup: "nuke", weight: 0.6 },
          { pickup: "life", weight: 0.2 },
        ],
      },
    ],
  }),
  level({
    id: "level-03",
    slug: "level-03",
    name: "Cruiser Crossfire",
    sequence: 3,
    seed: 12003,
    enemy_formations: [
      {
        type: "scout",
        rows: 2,
        columns: 16,
        origin: { x: 72, y: 110 },
        spacing: { x: 64, y: 52 },
      },
      {
        type: "cruiser",
        rows: 2,
        columns: 6,
        origin: { x: 170, y: 220 },
        spacing: { x: 168, y: 52 },
      },
      {
        type: "destroyer",
        rows: 1,
        columns: 4,
        origin: { x: 220, y: 325 },
        spacing: { x: 248, y: 0 },
      },
    ],
    hazards: [
      {
        type: "asteroid",
        count: 2,
        speed: 96,
        origin: { x: 340, y: 265 },
        spacing: { x: 520, y: 1 },
      },
    ],
    drop_tables: [
      {
        host: "scout",
        entries: [
          { pickup: "nuke", weight: 0.9 },
          { pickup: "life", weight: 0.12 },
        ],
      },
    ],
  }),
  level({
    id: "level-04",
    slug: "level-04",
    name: "Frigate Breach",
    sequence: 4,
    seed: 12004,
    enemy_formations: [
      {
        type: "scout",
        rows: 2,
        columns: 15,
        origin: { x: 72, y: 110 },
        spacing: { x: 68, y: 50 },
        behaviour_profile: "enemy.scout.diver",
      },
      {
        type: "cruiser",
        rows: 1,
        columns: 6,
        origin: { x: 170, y: 220 },
        spacing: { x: 170, y: 0 },
      },
      {
        type: "destroyer",
        rows: 1,
        columns: 4,
        origin: { x: 240, y: 300 },
        spacing: { x: 240, y: 0 },
      },
    ],
    hazards: [
      {
        type: "comet",
        count: 1,
        speed: 132,
        origin: { x: -64, y: 268 },
        spacing: { x: 0, y: 0 },
        entry_edge: "LEFT",
      },
      {
        type: "comet",
        count: 1,
        speed: 132,
        origin: { x: 1344, y: 368 },
        spacing: { x: 0, y: 0 },
        entry_edge: "RIGHT",
      },
    ],
    drop_tables: [
      {
        host: "scout",
        entries: [
          { pickup: "nuke", weight: 0.75 },
          { pickup: "life", weight: 0.22 },
        ],
      },
    ],
    boarding_anchors: [
      {
        id: "level-04-alien-frigate-01",
        source_selector: { formation_index: 1, row: 0, column: 5 },
        source_entity_type: "cruiser",
        source_ship_type: "ALIEN_FRIGATE",
        source_entity_id: "level-04:formation-1:r0:c5",
        interior: {
          slug: "alien-frigate",
          version: 1,
          checksum:
            "e9b1af65f0daef6725a7ddf4683b5f6d503e25dabc97aef1212102e6b1e994f3",
        },
        entry_envelope: { width_px: 160, height_px: 128 },
        offer_duration_ms: 8000,
      },
    ],
  }),
  level({
    id: "level-05",
    slug: "level-05",
    name: "Elite Gauntlet",
    sequence: 5,
    seed: 12005,
    enemy_formations: [
      {
        type: "scout",
        rows: 2,
        columns: 12,
        origin: { x: 72, y: 105 },
        spacing: { x: 84, y: 48 },
      },
      {
        type: "cruiser",
        rows: 2,
        columns: 6,
        origin: { x: 160, y: 205 },
        spacing: { x: 176, y: 58 },
      },
      {
        type: "destroyer",
        rows: 2,
        columns: 4,
        origin: { x: 210, y: 325 },
        spacing: { x: 255, y: 55 },
      },
    ],
    hazards: [
      {
        type: "comet",
        count: 1,
        speed: 155,
        origin: { x: -64, y: 180 },
        spacing: { x: 0, y: 0 },
        entry_edge: "LEFT",
      },
      {
        type: "comet",
        count: 1,
        speed: 155,
        origin: { x: 1344, y: 260 },
        spacing: { x: 0, y: 0 },
        entry_edge: "RIGHT",
      },
      {
        type: "comet",
        count: 1,
        speed: 155,
        origin: { x: -64, y: 340 },
        spacing: { x: 0, y: 0 },
        entry_edge: "LEFT",
      },
      {
        type: "comet",
        count: 1,
        speed: 155,
        origin: { x: 1344, y: 420 },
        spacing: { x: 0, y: 0 },
        entry_edge: "RIGHT",
      },
      {
        type: "comet",
        count: 1,
        speed: 155,
        origin: { x: 640, y: -64 },
        spacing: { x: 0, y: 0 },
        entry_edge: "TOP",
      },
    ],
    drop_tables: [
      {
        host: "scout",
        entries: [
          { pickup: "nuke", weight: 0.45 },
          { pickup: "life", weight: 0.08 },
        ],
      },
    ],
  }),
  level({
    id: "level-06",
    slug: "level-06",
    name: "Final Assault",
    sequence: 6,
    seed: 12006,
    enemy_formations: [
      {
        type: "scout",
        rows: 2,
        columns: 9,
        origin: { x: 80, y: 96 },
        spacing: { x: 120, y: 46 },
      },
      {
        type: "cruiser",
        rows: 2,
        columns: 5,
        origin: { x: 170, y: 190 },
        spacing: { x: 220, y: 54 },
      },
      {
        type: "destroyer",
        rows: 2,
        columns: 3,
        origin: { x: 210, y: 305 },
        spacing: { x: 330, y: 55 },
      },
      {
        type: "mothership",
        rows: 1,
        columns: 1,
        origin: { x: 640, y: 120 },
        spacing: { x: 0, y: 0 },
        width: 260,
        height: 120,
        behaviour_profile: "enemy.mothership.boss",
      },
    ],
    hazards: [
      {
        type: "asteroid",
        count: 3,
        speed: 118,
        origin: { x: 150, y: 330 },
        spacing: { x: 350, y: 1 },
      },
      {
        type: "comet",
        count: 1,
        speed: 170,
        origin: { x: -64, y: 180 },
        spacing: { x: 0, y: 0 },
        entry_edge: "LEFT",
      },
      {
        type: "comet",
        count: 1,
        speed: 170,
        origin: { x: 1344, y: 260 },
        spacing: { x: 0, y: 0 },
        entry_edge: "RIGHT",
      },
      {
        type: "comet",
        count: 1,
        speed: 170,
        origin: { x: -64, y: 340 },
        spacing: { x: 0, y: 0 },
        entry_edge: "LEFT",
      },
      {
        type: "comet",
        count: 1,
        speed: 170,
        origin: { x: 1344, y: 420 },
        spacing: { x: 0, y: 0 },
        entry_edge: "RIGHT",
      },
      {
        type: "comet",
        count: 1,
        speed: 170,
        origin: { x: 640, y: -64 },
        spacing: { x: 0, y: 0 },
        entry_edge: "TOP",
      },
    ],
    drop_tables: [
      {
        host: "scout",
        entries: [
          { pickup: "nuke", weight: 0.3 },
          { pickup: "life", weight: 0.05 },
        ],
      },
    ],
  }),
];
