"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

type EntityType =
  | "SCOUT"
  | "CRUISER"
  | "DESTROYER"
  | "MOTHERSHIP"
  | "ASTEROID"
  | "COMET"
  | "SHIELD_TILE"
  | "NUKE_PICKUP"
  | "LIFE_PICKUP";
type Layout = "GRID" | "LINE" | "WEDGE" | "ARC" | "FREEFORM";
type Asset = {
  id: string;
  key: string;
  object_type: string;
  thumbnail_path: string;
  checksum: string;
};
type Entity = {
  id: string;
  entity_type: EntityType;
  asset_id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  z_index: number;
  behaviour_profile: string;
  enabled: boolean;
  tags: string[];
};
type Formation = {
  id: string;
  name: string;
  layout: Layout;
  bounds: { x: number; y: number; width: number; height: number };
  member_ids: string[];
  motion_profile: string;
  entry_delay_ms: number;
  repeat: number;
};
type Emitter = {
  id: string;
  hazard_type: "ASTEROID" | "COMET";
  asset_id: string;
  enabled: boolean;
  initial_count: number;
  maximum_active: number;
  spawn_interval_ms: number;
  spawn_jitter_ms: number;
  speed_min: number;
  speed_max: number;
  angular_velocity_min: number;
  angular_velocity_max: number;
  entry_edges: Array<"TOP" | "RIGHT" | "BOTTOM" | "LEFT">;
  spawn_pattern: "RANDOM_EDGE" | "ALTERNATING_EDGES" | "LANE" | "FIXED_POINTS";
  spawn_points: Array<{ x: number; y: number }>;
  despawn_margin: number;
  collision_damage: number;
};
type Shield = {
  id: string;
  name: string;
  origin: { x: number; y: number };
  tile_asset_id: string;
  tile_width: number;
  tile_height: number;
  matrix: number[][];
  destructible: true;
};
type Objective = {
  id: string;
  type:
    | "DESTROY_ALL_HOSTILES"
    | "DESTROY_MOTHERSHIP"
    | "SURVIVE_DURATION"
    | "BOARD_TARGET";
  required: boolean;
  target_entity_ids: string[];
  duration_ms: number | null;
};
type Anchor = {
  id: string;
  source_entity_id: string;
  source_ship_type: "ALIEN_FRIGATE";
  interior: { slug: string; version: number; checksum: string };
  entry_envelope: { width_px: number; height_px: number };
  offer_duration_ms: number;
  interaction: "BOARD";
};
type AuthoringDocument = {
  schema_version: "1.1";
  id: string;
  slug: string;
  name: string;
  version: number;
  status: string;
  sequence: number;
  seed: number;
  canvas: {
    width: 1280;
    height: 720;
    grid_size: 8 | 16 | 24 | 32;
    snap_enabled: boolean;
    background_asset_id: string;
  };
  player_spawns: Array<{
    id: string;
    slot: 1 | 2;
    asset_id: string;
    x: number;
    y: number;
    rotation: number;
    enabled: boolean;
  }>;
  entities: Entity[];
  formations: Formation[];
  hazard_emitters: Emitter[];
  shield_structures: Shield[];
  drop_rules: Array<{
    id: string;
    host_entity_types: Array<"SCOUT" | "CRUISER" | "DESTROYER">;
    pickup_type: "NUKE" | "LIFE";
    probability: number;
    maximum_per_level: number;
    collection_window_ms: number;
  }>;
  objectives: Objective[];
  boarding_anchors: Anchor[];
  gameplay: Record<string, unknown>;
  performance_budget: {
    max_active_enemies: number;
    max_active_hazards: number;
    max_projectiles: number;
    max_shield_tiles: number;
    max_total_runtime_objects: number;
  };
};
type DesignerLevel = {
  id: string;
  slug: string;
  name: string;
  sequence: number;
  active_version?: {
    version: number;
    status: string;
    checksum: string;
    config: Record<string, unknown>;
  } | null;
  editable_version?: {
    version: number;
    status: string;
    checksum: string;
    config: Record<string, unknown>;
  } | null;
  versions?: Array<{
    version: number;
    status: string;
    checksum: string;
    config: Record<string, unknown>;
    created_at?: string;
    published_at?: string | null;
  }>;
};
export interface DesignerContext {
  surface: "INCEPTIVEC_ADMIN" | "COMMAND_POST";
  project_id?: string;
  owner_scope?: "CORE" | "ORGANIZATION";
  organization_id?: string | null;
  organizationSlug?: string;
  effective_permissions?: string[];
  effective_limits?: {
    active_map_limit: number;
    max_active_enemies: number;
    max_active_hazards: number;
    max_shield_tiles: number;
  };
}
type Category =
  | "Player"
  | "Alien Ships"
  | "Boss Ships"
  | "Hazards"
  | "Shields and Bunkers"
  | "Pickups"
  | "Objectives"
  | "Boarding";

const categoryTypes: Record<Category, EntityType[]> = {
  Player: [],
  "Alien Ships": ["SCOUT", "CRUISER", "DESTROYER"],
  "Boss Ships": ["MOTHERSHIP"],
  Hazards: ["ASTEROID", "COMET"],
  "Shields and Bunkers": ["SHIELD_TILE"],
  Pickups: ["NUKE_PICKUP", "LIFE_PICKUP"],
  Objectives: [],
  Boarding: [],
};
const assetForType: Record<EntityType, string> = {
  SCOUT: "enemy.scout",
  CRUISER: "enemy.cruiser",
  DESTROYER: "enemy.destroyer",
  MOTHERSHIP: "enemy.mothership",
  ASTEROID: "hazard.asteroid",
  COMET: "hazard.comet",
  SHIELD_TILE: "shield.tile",
  NUKE_PICKUP: "projectile.nuke",
  LIFE_PICKUP: "ui.life-icon",
};
const profileForType: Record<EntityType, string> = {
  SCOUT: "enemy.scout.standard",
  CRUISER: "enemy.cruiser.standard",
  DESTROYER: "enemy.destroyer.standard",
  MOTHERSHIP: "enemy.mothership.boss",
  ASTEROID: "hazard.asteroid.standard",
  COMET: "hazard.comet.standard",
  SHIELD_TILE: "shield.destructible",
  NUKE_PICKUP: "pickup.nuke",
  LIFE_PICKUP: "pickup.life",
};
const dimensions: Record<EntityType, [number, number]> = {
  SCOUT: [44, 58],
  CRUISER: [72, 64],
  DESTROYER: [92, 74],
  MOTHERSHIP: [260, 120],
  ASTEROID: [54, 54],
  COMET: [72, 54],
  SHIELD_TILE: [10, 10],
  NUKE_PICKUP: [34, 44],
  LIFE_PICKUP: [42, 52],
};
const descriptions: Record<EntityType, string> = {
  SCOUT: "Standard formation fighter",
  CRUISER: "Armoured pressure ship",
  DESTROYER: "Heavy burst-fire ship",
  MOTHERSHIP: "Boss with hit state and scout deployment",
  ASTEROID: "Rotating destructible hazard",
  COMET: "Fast velocity-oriented hazard",
  SHIELD_TILE: "Destructible bunker tile",
  NUKE_PICKUP: "Governed nuke drop",
  LIFE_PICKUP: "Governed life drop",
};
const uid = (prefix: string) =>
  `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
const defaultDocument = (level: DesignerLevel): AuthoringDocument => ({
  schema_version: "1.1",
  id: level.slug,
  slug: level.slug,
  name: level.name,
  version: (level.editable_version ?? level.active_version)?.version ?? 1,
  status: "DRAFT",
  sequence: level.sequence,
  seed: 12000 + level.sequence,
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
  entities: [],
  formations: [],
  hazard_emitters: [],
  shield_structures: [],
  drop_rules: [],
  objectives: [
    {
      id: "destroy-hostiles",
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
    max_active_enemies: 80,
    max_active_hazards: 12,
    max_projectiles: 96,
    max_shield_tiles: 512,
    max_total_runtime_objects: 1024,
  },
});
function migrateLegacyDocument(
  level: DesignerLevel,
  config: Record<string, unknown>,
): AuthoringDocument {
  const legacy = config as {
    player?: { x: number; y: number };
    enemy_formations?: Array<{
      type: "scout" | "cruiser" | "destroyer" | "mothership";
      rows: number;
      columns: number;
      origin: { x: number; y: number };
      spacing: { x: number; y: number };
      width?: number;
      height?: number;
      behaviour_profile?: string;
    }>;
    shields?: Array<{ count: number; matrix: number[][] }>;
    hazards?: Array<{
      type: "asteroid" | "comet";
      count: number;
      speed: number;
      origin: { x: number; y: number };
      spacing: { x: number; y: number };
    }>;
  };
  const result = defaultDocument(level);
  const typeMap = {
    scout: "SCOUT",
    cruiser: "CRUISER",
    destroyer: "DESTROYER",
    mothership: "MOTHERSHIP",
  } as const;
  if (legacy.player)
    result.player_spawns = result.player_spawns.map((spawn) => ({
      ...spawn,
      x: legacy.player!.x,
      y: legacy.player!.y,
    }));
  for (const [formationIndex, formation] of (
    legacy.enemy_formations ?? []
  ).entries()) {
    const entityType = typeMap[formation.type];
    const members: string[] = [];
    for (let row = 0; row < formation.rows; row += 1)
      for (let column = 0; column < formation.columns; column += 1) {
        const id = `${level.slug}:formation-${formationIndex}:r${row}:c${column}`;
        members.push(id);
        const [defaultWidth, defaultHeight] = dimensions[entityType];
        result.entities.push({
          id,
          entity_type: entityType,
          asset_id: assetForType[entityType],
          x: formation.origin.x + column * formation.spacing.x,
          y: formation.origin.y + row * formation.spacing.y,
          width: formation.width ?? defaultWidth,
          height: formation.height ?? defaultHeight,
          rotation: 0,
          z_index: 4,
          behaviour_profile:
            formation.behaviour_profile ?? profileForType[entityType],
          enabled: true,
          tags: [],
        });
      }
    result.formations.push({
      id: `formation-${formationIndex}`,
      name: `Formation ${formationIndex + 1}`,
      layout: "GRID",
      bounds: {
        x: formation.origin.x,
        y: formation.origin.y,
        width: Math.max(1, formation.columns - 1) * formation.spacing.x,
        height: Math.max(1, formation.rows - 1) * formation.spacing.y,
      },
      member_ids: members,
      motion_profile: "formation.standard",
      entry_delay_ms: 0,
      repeat: 0,
    });
  }
  for (const [index, shield] of (legacy.shields ?? []).entries())
    for (let bunker = 0; bunker < shield.count; bunker += 1)
      result.shield_structures.push({
        id: `shield-${index}-${bunker}`,
        name: `Bunker ${bunker + 1}`,
        origin: { x: 70 + bunker * 150, y: 520 },
        tile_asset_id: "shield.tile",
        tile_width: 10,
        tile_height: 10,
        matrix: shield.matrix,
        destructible: true,
      });
  for (const [index, hazard] of (legacy.hazards ?? []).entries())
    result.hazard_emitters.push({
      id: `${hazard.type}-emitter-${index}`,
      hazard_type: hazard.type.toUpperCase() as "ASTEROID" | "COMET",
      asset_id: `hazard.${hazard.type}`,
      enabled: true,
      initial_count: hazard.count,
      maximum_active: hazard.count,
      spawn_interval_ms: 3500,
      spawn_jitter_ms: 0,
      speed_min: hazard.speed,
      speed_max: hazard.speed,
      angular_velocity_min: hazard.type === "asteroid" ? -30 : 0,
      angular_velocity_max: hazard.type === "asteroid" ? 30 : 0,
      entry_edges: ["TOP"],
      spawn_pattern: "FIXED_POINTS",
      spawn_points: Array.from({ length: hazard.count }, (_, item) => ({
        x: hazard.origin.x + item * hazard.spacing.x,
        y: hazard.origin.y + item * hazard.spacing.y,
      })),
      despawn_margin: 64,
      collision_damage: 1,
    });
  return result;
}
function asDocument(level: DesignerLevel): AuthoringDocument {
  const config = (level.editable_version ?? level.active_version)?.config;
  if (config?.schema_version === "1.1")
    return config as unknown as AuthoringDocument;
  return config?.schema_version === "1.0"
    ? migrateLegacyDocument(level, config)
    : defaultDocument(level);
}
function formationBounds(items: Entity[]) {
  const left = Math.min(...items.map((item) => item.x));
  const top = Math.min(...items.map((item) => item.y));
  return {
    x: left,
    y: top,
    width: Math.max(...items.map((item) => item.x)) - left,
    height: Math.max(...items.map((item) => item.y)) - top,
  };
}

export function CampaignDesigner({
  context = { surface: "INCEPTIVEC_ADMIN" },
}: {
  context?: DesignerContext;
}) {
  const [levels, setLevels] = useState<DesignerLevel[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [document, setDocument] = useState<AuthoringDocument | null>(null);
  const [history, setHistory] = useState<AuthoringDocument[]>([]);
  const [future, setFuture] = useState<AuthoringDocument[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [message, setMessage] = useState(
    "Loading governed campaign authority...",
  );
  const [operationMessage, setOperationMessage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [portalProjectId, setPortalProjectId] = useState<string | null>(null);
  const [activeCampaignRelease, setActiveCampaignRelease] = useState<{
    version: string;
    campaign_checksum: string;
  } | null>(null);
  const [dragStart, setDragStart] = useState<{
    x: number;
    y: number;
    ids: string[];
    pointerId: number;
    bounds: { left: number; top: number; width: number; height: number };
  } | null>(null);
  const [dragInitial, setDragInitial] = useState<AuthoringDocument | null>(null);
  const [selectionStart, setSelectionStart] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const playfieldRef = useRef<HTMLDivElement>(null);
  // Pointer moves can arrive before React has committed state from pointerdown.
  // Keep the active gesture synchronously available for mouse, pen, and touch.
  const dragStartRef = useRef<{
    x: number;
    y: number;
    ids: string[];
    pointerId: number;
    bounds: { left: number; top: number; width: number; height: number };
  } | null>(null);
  const dragInitialRef = useRef<AuthoringDocument | null>(null);
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null);
  const selectedLevel = useMemo(
    () => levels.find((level) => level.id === selectedLevelId) ?? null,
    [levels, selectedLevelId],
  );
  const selectedEntity =
    document?.entities.find((entity) => entity.id === selectedIds[0]) ?? null;
  const selectedPlayerSpawn =
    document?.player_spawns.find(
      (spawn) => selectedIds[0] === `player:${spawn.id}`,
    ) ?? null;
  const selectedFormation =
    document?.formations.find((formation) =>
      selectedIds.includes(formation.id),
    ) ?? null;
  const selectedShield =
    document?.shield_structures.find(
      (shield) => selectedIds[0] === `shield:${shield.id}`,
    ) ?? null;
  const selectedEmitter =
    document?.hazard_emitters.find(
      (emitter) => selectedIds[0] === `emitter:${emitter.id}`,
    ) ?? null;
  const chooserAssets = useMemo(
    () =>
      category
        ? categoryTypes[category]
            .map((type) => ({
              type,
              asset: assets.find((asset) => asset.key === assetForType[type]),
            }))
            .filter((item) => item.asset)
        : [],
    [assets, category],
  );
  const editable =
    context.surface === "INCEPTIVEC_ADMIN" ||
    (context.effective_permissions ?? []).includes("MAP_WRITE");
  const mutate = (change: (current: AuthoringDocument) => AuthoringDocument) =>
    setDocument((current) => {
      if (!current) return current;
      setHistory((past) => [...past.slice(-49), current]);
      setFuture([]);
      return change(current);
    });
  const restore = (next: AuthoringDocument, source: "undo" | "redo") =>
    setDocument((current) => {
      if (current)
        (source === "undo" ? setFuture : setHistory)((items) => [
          ...items,
          current,
        ]);
      return next;
    });
  async function call(path: string, init?: RequestInit) {
    const mutating = Boolean(
      init?.method && init.method !== "GET" && init.method !== "HEAD",
    );
    const csrf = mutating
      ? await fetch("/api/v1/auth/csrf/", { credentials: "same-origin" }).then(
          async (response) => {
            if (!response.ok)
              throw new Error(
                "Unable to establish the protected editor session.",
              );
            return ((await response.json()) as { csrf_token: string })
              .csrf_token;
          },
        )
      : null;
    const response = await fetch(`/api/v1${path}`, {
      credentials: "same-origin",
      headers: {
        ...(init?.body ? { "content-type": "application/json" } : {}),
        ...(csrf ? { "X-CSRFToken": csrf } : {}),
        ...init?.headers,
      },
      ...init,
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(
        body.detail ?? body.code ?? `Request failed (${response.status})`,
      );
    }
    return response.json();
  }
  async function load() {
    try {
      const [levelData, assetData] = await Promise.all([
        context.surface === "COMMAND_POST" && context.organizationSlug
          ? call(`/portal/organizations/${context.organizationSlug}/`)
          : call("/admin/levels/authority/"),
        call(
          context.surface === "COMMAND_POST" && context.organizationSlug
            ? `/assets/catalogue/?organization=${encodeURIComponent(context.organizationSlug)}`
            : "/assets/catalogue/",
        ),
      ]);
      const nextLevels =
        context.surface === "COMMAND_POST"
          ? (levelData.maps ?? [])
          : (levelData.results ?? levelData);
      setLevels(nextLevels);
      setActiveCampaignRelease(levelData.active_campaign_release ?? null);
      setAssets(assetData.results ?? []);
      setPortalProjectId(
        (current) =>
          current ?? context.project_id ?? levelData.projects?.[0]?.id ?? null,
      );
      setSelectedLevelId((current) => current ?? nextLevels[0]?.id ?? null);
      setMessage("Authenticated campaign authority, revision lineage and approved assets loaded.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load governed catalogue.",
      );
    }
  }
  useEffect(() => {
    void load();
  }, []);
  useEffect(() => {
    if (selectedLevel) {
      setDocument(asDocument(selectedLevel));
      setSelectedIds([]);
      setHistory([]);
      setFuture([]);
    }
  }, [selectedLevel]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (history.length) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [history.length]);
  const snap = (value: number) => {
    const grid = document?.canvas.grid_size ?? 16;
    return document?.canvas.snap_enabled
      ? Math.round(value / grid) * grid
      : Math.round(value);
  };
  const point = (
    event: { clientX: number; clientY: number },
    fixedBounds?: { left: number; top: number; width: number; height: number },
  ) => {
    // The transformed playfield, rather than its scrollable outer wrapper, is
    // the sole pointer-to-authoring coordinate authority.
    const bounds = fixedBounds ?? playfieldRef.current?.getBoundingClientRect();
    const mapped = !bounds
      ? { x: 640, y: 360 }
      : {
          x: snap(
            Math.max(
              0,
              Math.min(
                1280,
                ((event.clientX - bounds.left) / bounds.width) * 1280,
              ),
            ),
          ),
          y: snap(
            Math.max(
              0,
              Math.min(
                720,
                ((event.clientY - bounds.top) / bounds.height) * 720,
              ),
            ),
          ),
        };
    return mapped;
  };
  function addEntity(type: EntityType, x = 640, y = 360) {
    const [width, height] = dimensions[type];
    const entity: Entity = {
      id: uid(type.toLowerCase()),
      entity_type: type,
      asset_id: assetForType[type],
      x: snap(Math.max(0, Math.min(1280, x))),
      y: snap(Math.max(0, Math.min(720, y))),
      width,
      height,
      rotation: 0,
      z_index: 4,
      behaviour_profile: profileForType[type],
      enabled: true,
      tags: [],
    };
    mutate((current) => ({
      ...current,
      entities: [...current.entities, entity],
    }));
    setSelectedIds([entity.id]);
    setCategory(null);
  }
  function updatePlayerSpawn(
    field: "x" | "y" | "rotation" | "enabled",
    value: number | boolean,
  ) {
    if (!selectedPlayerSpawn) return;
    mutate((current) => ({
      ...current,
      player_spawns: current.player_spawns.map((spawn) =>
        spawn.id === selectedPlayerSpawn.id
          ? {
              ...spawn,
              [field]: typeof value === "number" ? snap(value) : value,
            }
          : spawn,
      ),
    }));
  }
  function addEmitter(type: "ASTEROID" | "COMET") {
    const emitter: Emitter = {
      id: uid(`${type.toLowerCase()}-emitter`),
      hazard_type: type,
      asset_id: assetForType[type],
      enabled: true,
      initial_count: 1,
      maximum_active: type === "COMET" ? 3 : 5,
      spawn_interval_ms: type === "COMET" ? 4200 : 3400,
      spawn_jitter_ms: 400,
      speed_min: type === "COMET" ? 180 : 90,
      speed_max: type === "COMET" ? 260 : 150,
      angular_velocity_min: type === "ASTEROID" ? -90 : 0,
      angular_velocity_max: type === "ASTEROID" ? 90 : 0,
      entry_edges: ["TOP", "LEFT", "RIGHT"],
      spawn_pattern: "ALTERNATING_EDGES",
      spawn_points: [],
      despawn_margin: 64,
      collision_damage: 1,
    };
    mutate((current) => ({
      ...current,
      hazard_emitters: [...current.hazard_emitters, emitter],
    }));
    setMessage(`${type} recurring emitter added.`);
    setCategory(null);
  }
  function addShield() {
    const shield: Shield = {
      id: uid("shield"),
      name: `Bunker ${(document?.shield_structures.length ?? 0) + 1}`,
      origin: { x: 120, y: 520 },
      tile_asset_id: "shield.tile",
      tile_width: 10,
      tile_height: 10,
      matrix: Array.from({ length: 4 }, () =>
        Array.from({ length: 8 }, () => 1),
      ),
      destructible: true,
    };
    mutate((current) => ({
      ...current,
      shield_structures: [...current.shield_structures, shield],
    }));
    setCategory(null);
  }
  function addObjective() {
    mutate((current) => ({
      ...current,
      objectives: [
        ...current.objectives,
        {
          id: uid("objective"),
          type: "SURVIVE_DURATION",
          required: true,
          target_entity_ids: [],
          duration_ms: 30000,
        },
      ],
    }));
    setCategory(null);
  }
  function addBoarding() {
    const target = document?.entities.find(
      (entity) =>
        entity.entity_type === "CRUISER" || entity.entity_type === "DESTROYER",
    );
    if (!target) {
      setMessage(
        "Place a Cruiser or Destroyer before creating the governed Boarding anchor.",
      );
      return;
    }
    mutate((current) => ({
      ...current,
      boarding_anchors: [
        ...current.boarding_anchors,
        {
          id: uid("boarding"),
          source_entity_id: target.id,
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
    }));
    setCategory(null);
  }
  function moveSelected(deltaX: number, deltaY: number) {
    mutate((current) => {
      const formation = current.formations.find((item) =>
        selectedIds.includes(item.id),
      );
      const affected = new Set<string>([
        ...selectedIds,
        ...(formation?.member_ids ?? []),
      ]);
      return {
        ...current,
        entities: current.entities.map((entity) =>
          affected.has(entity.id)
            ? {
                ...entity,
                x: snap(Math.max(0, Math.min(1280, entity.x + deltaX))),
                y: snap(Math.max(0, Math.min(720, entity.y + deltaY))),
              }
            : entity,
        ),
        player_spawns: current.player_spawns.map((spawn) =>
          selectedIds.includes(`player:${spawn.id}`)
            ? {
                ...spawn,
                x: snap(Math.max(0, Math.min(1280, spawn.x + deltaX))),
                y: snap(Math.max(0, Math.min(720, spawn.y + deltaY))),
              }
            : spawn,
        ),
        formations: current.formations.map((item) =>
          selectedIds.includes(item.id)
            ? {
                ...item,
                bounds: {
                  ...item.bounds,
                  x: snap(Math.max(0, item.bounds.x + deltaX)),
                  y: snap(Math.max(0, item.bounds.y + deltaY)),
                },
              }
            : item,
        ),
      };
    });
  }
  function updateSelected(
    field: keyof Entity,
    value: string | number | boolean | string[],
  ) {
    if (!selectedEntity) return;
    mutate((current) => ({
      ...current,
      entities: current.entities.map((entity) =>
        entity.id === selectedEntity.id
          ? {
              ...entity,
              [field]: typeof value === "number" ? snap(value) : value,
            }
          : entity,
      ),
    }));
  }
  function duplicateSelection() {
    if (!document || !selectedIds.length) return;
    const copies = document.entities
      .filter((entity) => selectedIds.includes(entity.id))
      .map((entity) => ({
        ...entity,
        id: uid(entity.entity_type.toLowerCase()),
        x: snap(Math.min(1280, entity.x + 24)),
        y: snap(Math.min(720, entity.y + 24)),
      }));
    mutate((current) => ({
      ...current,
      entities: [...current.entities, ...copies],
    }));
    setSelectedIds(copies.map((copy) => copy.id));
  }
  function deleteSelection() {
    mutate((current) => ({
      ...current,
      entities: current.entities.filter(
        (entity) => !selectedIds.includes(entity.id),
      ),
      formations: current.formations
        .filter((formation) => !selectedIds.includes(formation.id))
        .map((formation) => ({
          ...formation,
          member_ids: formation.member_ids.filter(
            (id) => !selectedIds.includes(id),
          ),
        })),
    }));
    setSelectedIds([]);
  }
  function removeFormationWithMembers(formation: Formation) {
    mutate((current) => ({
      ...current,
      entities: current.entities.filter(
        (entity) => !formation.member_ids.includes(entity.id),
      ),
      formations: current.formations.filter((item) => item.id !== formation.id),
      boarding_anchors: current.boarding_anchors.filter(
        (anchor) => !formation.member_ids.includes(anchor.source_entity_id),
      ),
    }));
    setSelectedIds([]);
  }
  function createFormation() {
    if (!document || selectedIds.length < 2) return;
    const members = document.entities.filter((entity) =>
      selectedIds.includes(entity.id),
    );
    const formation: Formation = {
      id: uid("formation"),
      name: `Formation ${document.formations.length + 1}`,
      layout: "FREEFORM",
      bounds: formationBounds(members),
      member_ids: selectedIds,
      motion_profile: "formation.standard",
      entry_delay_ms: 0,
      repeat: 0,
    };
    mutate((current) => ({
      ...current,
      formations: [...current.formations, formation],
    }));
    setSelectedIds([formation.id]);
  }
  function reflowFormation(formation: Formation) {
    mutate((current) => {
      const members = current.entities.filter((entity) =>
        formation.member_ids.includes(entity.id),
      );
      const columns = Math.max(1, Math.ceil(Math.sqrt(members.length)));
      const spacingX = Math.max(
        40,
        formation.bounds.width / Math.max(1, columns - 1),
      );
      const spacingY = Math.max(
        40,
        formation.bounds.height /
          Math.max(1, Math.ceil(members.length / columns) - 1),
      );
      return {
        ...current,
        entities: current.entities.map((entity) => {
          const index = formation.member_ids.indexOf(entity.id);
          if (index < 0) return entity;
          const col = index % columns;
          const row = Math.floor(index / columns);
          const wedge =
            formation.layout === "WEDGE"
              ? Math.abs(col - (columns - 1) / 2) * 18
              : 0;
          const arc =
            formation.layout === "ARC"
              ? Math.sin((col / Math.max(1, columns - 1)) * Math.PI) * 42
              : 0;
          return {
            ...entity,
            x: snap(formation.bounds.x + col * spacingX),
            y: snap(formation.bounds.y + row * spacingY + wedge - arc),
          };
        }),
      };
    });
  }
  function updateFormation(id: string, change: Partial<Formation>) {
    mutate((current) => ({
      ...current,
      formations: current.formations.map((formation) =>
        formation.id === id ? { ...formation, ...change } : formation,
      ),
    }));
  }
  function resizeFormation(
    formation: Formation,
    dimension: "width" | "height",
    value: number,
    reflow: boolean,
  ) {
    const bounds = { ...formation.bounds, [dimension]: Math.max(32, value) };
    updateFormation(formation.id, { bounds });
    if (reflow) reflowFormation({ ...formation, bounds });
  }
  function removeFormation(formation: Formation, removeMembers: boolean) {
    mutate((current) => ({
      ...current,
      formations: current.formations.filter((item) => item.id !== formation.id),
      entities: removeMembers
        ? current.entities.filter(
            (entity) => !formation.member_ids.includes(entity.id),
          )
        : current.entities,
    }));
    setSelectedIds([]);
  }
  function toggleShieldTile(shieldId: string, row: number, column: number) {
    mutate((current) => ({
      ...current,
      shield_structures: current.shield_structures.map((shield) =>
        shield.id !== shieldId
          ? shield
          : {
              ...shield,
              matrix: shield.matrix.map((values, rowIndex) =>
                rowIndex !== row
                  ? values
                  : values.map((value, columnIndex) =>
                      columnIndex === column ? (value ? 0 : 1) : value,
                    ),
              ),
            },
      ),
    }));
  }
  function updateShieldOrigin(field: "x" | "y", value: number) {
    if (!selectedShield) return;
    mutate((current) => ({
      ...current,
      shield_structures: current.shield_structures.map((shield) =>
        shield.id === selectedShield.id
          ? {
              ...shield,
              origin: { ...shield.origin, [field]: snap(value) },
            }
          : shield,
      ),
    }));
  }
  function updateEmitter<K extends keyof Emitter>(field: K, value: Emitter[K]) {
    if (!selectedEmitter) return;
    mutate((current) => ({
      ...current,
      hazard_emitters: current.hazard_emitters.map((emitter) =>
        emitter.id === selectedEmitter.id
          ? (() => {
              const next = { ...emitter, [field]: value } as Emitter;
              if (field === "initial_count" && typeof value === "number") next.maximum_active = Math.max(emitter.maximum_active, value);
              if (field === "maximum_active" && typeof value === "number") next.initial_count = Math.min(emitter.initial_count, value);
              if (field === "speed_min" && typeof value === "number") next.speed_max = Math.max(emitter.speed_max, value);
              if (field === "speed_max" && typeof value === "number") next.speed_min = Math.min(emitter.speed_min, value);
              return next;
            })()
          : emitter,
      ),
    }));
  }
  function align(axis: "x" | "y") {
    if (!document || selectedIds.length < 2) return;
    const members = document.entities.filter((entity) =>
      selectedIds.includes(entity.id),
    );
    const average = Math.round(
      members.reduce((sum, entity) => sum + entity[axis], 0) / members.length,
    );
    mutate((current) => ({
      ...current,
      entities: current.entities.map((entity) =>
        selectedIds.includes(entity.id)
          ? { ...entity, [axis]: snap(average) }
          : entity,
      ),
    }));
  }
  function distribute(axis: "x" | "y") {
    if (!document || selectedIds.length < 3) return;
    const members = document.entities
      .filter((entity) => selectedIds.includes(entity.id))
      .sort((a, b) => a[axis] - b[axis]);
    const start = members[0][axis];
    const end = members[members.length - 1][axis];
    mutate((current) => ({
      ...current,
      entities: current.entities.map((entity) => {
        const index = members.findIndex((member) => member.id === entity.id);
        return index < 0
          ? entity
          : {
              ...entity,
              [axis]: snap(
                start + ((end - start) * index) / (members.length - 1),
              ),
            };
      }),
    }));
  }
  function onCanvasDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const type = event.dataTransfer.getData(
      "application/x-gg-entity",
    ) as EntityType;
    if (type) {
      const position = point(event);
      addEntity(type, position.x, position.y);
    }
  }
  function canvasPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const start = point(event);
    selectionStartRef.current = start;
    setSelectionStart(start);
    setSelectedIds([]);
  }
  function canvasPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const activeDrag = dragStartRef.current;
    if (activeDrag) {
      if (dragInitialRef.current) {
        const initial = dragInitialRef.current;
        setHistory((past) => [...past.slice(-49), initial]);
        setFuture([]);
      }
      dragStartRef.current = null;
      dragInitialRef.current = null;
      setDragStart(null);
      setDragInitial(null);
      return;
    }
    const activeSelection = selectionStartRef.current;
    if (!activeSelection || !document) return;
    const end = point(event);
    const left = Math.min(activeSelection.x, end.x);
    const right = Math.max(activeSelection.x, end.x);
    const top = Math.min(activeSelection.y, end.y);
    const bottom = Math.max(activeSelection.y, end.y);
    if (Math.abs(right - left) >= 8 || Math.abs(bottom - top) >= 8)
      setSelectedIds(
        document.entities
          .filter(
            (entity) =>
              entity.x >= left &&
              entity.x <= right &&
              entity.y >= top &&
              entity.y <= bottom,
          )
          .map((entity) => entity.id),
      );
    selectionStartRef.current = null;
    setSelectionStart(null);
  }
  function beginDrag(event: PointerEvent<HTMLButtonElement>, id: string) {
    event.stopPropagation();
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    const rect = playfieldRef.current?.getBoundingClientRect();
    if (!rect) return;
    const bounds = {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
    const position = point(event, bounds);
    const ids = event.shiftKey
      ? [...new Set([...selectedIds, id])]
      : selectedIds.includes(id)
        ? selectedIds
        : [id];
    setSelectedIds(ids);
    dragInitialRef.current = document;
    setDragInitial(document);
    try {
      playfieldRef.current?.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic accessibility and browser-verification events have no native
      // active pointer to capture; their explicit target remains the playfield.
    }
    const nextDrag = { ...position, ids, pointerId: event.pointerId, bounds };
    dragStartRef.current = nextDrag;
    setDragStart(nextDrag);
  }
  function dragMove(event: PointerEvent<HTMLDivElement>) {
    const activeDrag = dragStartRef.current;
    if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
    const at = point(event, activeDrag.bounds);
    const dx = at.x - activeDrag.x;
    const dy = at.y - activeDrag.y;
    if (dx || dy) {
      setDocument((current) => current ? ({
        ...current,
        entities: current.entities.map((entity) =>
          activeDrag.ids.includes(entity.id)
            ? {
                ...entity,
                x: snap(Math.max(0, Math.min(1280, entity.x + dx))),
                y: snap(Math.max(0, Math.min(720, entity.y + dy))),
              }
            : entity,
        ),
        player_spawns: current.player_spawns.map((spawn) =>
          activeDrag.ids.includes(`player:${spawn.id}`)
            ? {
                ...spawn,
                x: snap(Math.max(0, Math.min(1280, spawn.x + dx))),
                y: snap(Math.max(0, Math.min(720, spawn.y + dy))),
              }
            : spawn,
        ),
      }) : current);
      const nextDrag = { ...at, ids: activeDrag.ids, pointerId: activeDrag.pointerId, bounds: activeDrag.bounds };
      dragStartRef.current = nextDrag;
      setDragStart(nextDrag);
    }
  }
  function keyMove(event: KeyboardEvent<HTMLButtonElement>) {
    if (!selectedIds.length) return;
    const delta = event.shiftKey ? 24 : 8;
    const direction: Record<string, [number, number]> = {
      ArrowLeft: [-delta, 0],
      ArrowRight: [delta, 0],
      ArrowUp: [0, -delta],
      ArrowDown: [0, delta],
    };
    if (direction[event.key]) {
      event.preventDefault();
      moveSelected(...direction[event.key]);
    }
  }
  async function saveDraft() {
    // The server's optimistic-concurrency contract is the newest immutable
    // version, regardless of lifecycle state. Authority returns this lineage
    // newest first, so use it rather than a potentially stale active shortcut.
    const baseVersion = selectedLevel?.versions?.[0]
      ?? selectedLevel?.editable_version
      ?? selectedLevel?.active_version;
    if (!selectedLevel || !baseVersion || !document) return;
    try {
      const path =
        context.surface === "COMMAND_POST" && context.organizationSlug
          ? `/portal/organizations/${context.organizationSlug}/maps/${selectedLevel.id}/drafts/`
          : `/admin/levels/${selectedLevel.id}/drafts/`;
      const draft = await call(path, {
        method: "POST",
        body: JSON.stringify({
          expected_checksum: baseVersion.checksum,
          config: document,
        }),
      });
      setHistory([]);
      await load();
      setOperationMessage(
        `Draft v${draft.version} saved with immutable checksum ${draft.checksum.slice(0, 12)}.`,
      );
    } catch (error) {
      setOperationMessage(error instanceof Error ? error.message : "Draft save failed.");
    }
  }
  async function createTenantMap() {
    if (!context.organizationSlug || !portalProjectId) return;
    try {
      const nextSequence = levels.length + 1;
      const created = await call(`/portal/organizations/${context.organizationSlug}/maps/`, {
        method: "POST",
        body: JSON.stringify({
          project_id: portalProjectId,
          slug: `map-${Date.now().toString(36)}`,
          name: `Custom Map ${nextSequence}`,
          sequence: nextSequence,
        }),
      }) as { id: string };
      await load();
      setSelectedLevelId(created.id);
      setOperationMessage("Blank organisation map created.");
    } catch (error) {
      setOperationMessage(
        error instanceof Error ? error.message : "Map creation failed.",
      );
    }
  }
  async function archiveTenantMap() {
    if (!context.organizationSlug || !selectedLevel || context.surface !== "COMMAND_POST") return;
    try {
      await call(`/portal/organizations/${context.organizationSlug}/maps/${selectedLevel.id}/`, {
        method: "DELETE",
      });
      setSelectedLevelId(null);
      await load();
      setOperationMessage("Selected organisation map archived. Revision history is retained.");
    } catch (error) {
      setOperationMessage(error instanceof Error ? error.message : "Map archive failed.");
    }
  }
  async function lifecycle(action: "validate" | "publish" | "rollback", version?: number) {
    if (!selectedLevel) return;
    if (action === "publish" && !window.confirm("Publish this immutable level revision into a new CORE campaign release? Existing campaigns remain pinned.")) return;
    if (action === "rollback" && !window.confirm("Create a new published revision from this historical record? Campaign audit history remains immutable.")) return;
    try {
      await call(`/admin/levels/${selectedLevel.id}/${action}/`, {
        method: "POST",
        body: JSON.stringify({ version: version ?? (selectedLevel.editable_version ?? selectedLevel.active_version)?.version }),
      });
      await load();
      setOperationMessage(`${action} completed through the authenticated version workflow.`);
    } catch (error) {
      setOperationMessage(error instanceof Error ? error.message : `${action} failed.`);
    }
  }
  const draftChecksum =
    selectedLevel?.versions?.[0]?.checksum ??
    selectedLevel?.editable_version?.checksum ??
    selectedLevel?.active_version?.checksum;
  const previewUrl =
    selectedLevel && draftChecksum
      ? `/play?preview_level_id=${encodeURIComponent(selectedLevel.id)}&preview_checksum=${encodeURIComponent(draftChecksum)}${context.surface === "COMMAND_POST" && context.organizationSlug ? `&preview_organization=${encodeURIComponent(context.organizationSlug)}` : ""}`
      : null;
  return (
    <main className="designer-shell" data-designer-route="campaign">
      <aside className="designer-sidebar">
        <h1>
          {context.surface === "COMMAND_POST"
            ? "Map Designer"
            : "Campaign Designer"}
        </h1>
        <button onClick={() => { setOperationMessage(null); void load(); }}>Refresh authority</button>
        {context.surface === "COMMAND_POST" ? (
          <>
            <button
              onClick={createTenantMap}
              disabled={!portalProjectId || !editable}
            >
              Create blank map
            </button>
            <button
              onClick={archiveTenantMap}
              disabled={!selectedLevel || !editable}
            >
              Archive selected map
            </button>
          </>
        ) : null}
        <button onClick={saveDraft} disabled={!selectedLevel || !editable}>
          Save immutable draft
        </button>
        {context.surface === "INCEPTIVEC_ADMIN" ? (
          <p className="designer-authority-status">
            Active CORE release: {activeCampaignRelease?.version ?? "not yet published"}
            {activeCampaignRelease ? ` / ${activeCampaignRelease.campaign_checksum.slice(0, 12)}` : ""}
          </p>
        ) : null}
        <section>
          <h2>Palette</h2>
          {(Object.keys(categoryTypes) as Category[]).map((item) => (
            <button key={item} onClick={() => setCategory(item)}>
              {item}
            </button>
          ))}
        </section>
        <label>
          <input
            type="checkbox"
            checked={document?.canvas.snap_enabled ?? true}
            onChange={(event) =>
              mutate((current) => ({
                ...current,
                canvas: {
                  ...current.canvas,
                  snap_enabled: event.target.checked,
                },
              }))
            }
          />{" "}
          Snap to grid
        </label>
      </aside>
      <section className="designer-workspace">
        <header>
          <strong>{selectedLevel?.name ?? "No level selected"}</strong>
          <span role="status">{operationMessage ?? message}</span>
          <label>
            Zoom{" "}
            <input
              aria-label="Canvas zoom"
              type="range"
              min="0.5"
              max="1.5"
              step="0.25"
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
            />
          </label>
        </header>
        <div
          className="designer-canvas"
          style={{ "--designer-zoom": zoom } as CSSProperties}
          aria-label="Level canvas"
          onDragOver={(event) => event.preventDefault()}
          onDrop={onCanvasDrop}
        >
          <div
            ref={playfieldRef}
            className="designer-playfield"
            onPointerDown={canvasPointerDown}
            onPointerMove={dragMove}
            onPointerUp={canvasPointerUp}
            onPointerCancel={canvasPointerUp}
          >
            {document?.player_spawns
              .filter((spawn) => spawn.enabled)
              .map((spawn) => {
                const asset = assets.find((item) => item.key === spawn.asset_id);
                return (
                  <button
                    key={spawn.id}
                    type="button"
                    className={`designer-placement ${selectedIds.includes(`player:${spawn.id}`) ? "selected" : ""}`}
                    aria-label={`Player spawn at ${spawn.x}, ${spawn.y}`}
                    style={{
                      left: `${spawn.x / 12.8}%`,
                      top: `${spawn.y / 7.2}%`,
                      width: "38px",
                      height: "48px",
                      transform: `translate(-50%, -50%) rotate(${spawn.rotation}deg)`,
                    }}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedIds([`player:${spawn.id}`]);
                    }}
                    onPointerDown={(event) => beginDrag(event, `player:${spawn.id}`)}
                    onKeyDown={keyMove}
                  >
                    {asset ? <img src={asset.thumbnail_path} alt="" /> : "PLAYER"}
                  </button>
                );
              })}
            {document?.shield_structures.map((shield) => (
              <div
                key={shield.id}
                className={`designer-shield ${selectedIds.includes(`shield:${shield.id}`) ? "selected" : ""}`}
                role="group"
                aria-label={`${shield.name} destructible tile matrix`}
                style={{
                  left: `${shield.origin.x / 12.8}%`,
                  top: `${shield.origin.y / 7.2}%`,
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedIds([`shield:${shield.id}`]);
                }}
              >
                {shield.matrix.flatMap((row, rowIndex) =>
                  row.map((tile, columnIndex) => (
                    <button
                      key={`${rowIndex}-${columnIndex}`}
                      type="button"
                      className={tile ? "tile-present" : "tile-empty"}
                      aria-label={`${tile ? "Remove" : "Add"} ${shield.name} tile ${rowIndex + 1}, ${columnIndex + 1}`}
                      style={{
                        left: columnIndex * shield.tile_width,
                        top: rowIndex * shield.tile_height,
                        width: shield.tile_width,
                        height: shield.tile_height,
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleShieldTile(shield.id, rowIndex, columnIndex);
                      }}
                    />
                  )),
                )}
              </div>
            ))}
            {document?.formations.map((formation) => (
              <button
                key={formation.id}
                type="button"
                className={`designer-formation-box ${selectedIds.includes(formation.id) ? "selected" : ""}`}
                style={{
                  left: `${formation.bounds.x / 12.8}%`,
                  top: `${formation.bounds.y / 7.2}%`,
                  width: `${Math.max(2, formation.bounds.width / 12.8)}%`,
                  height: `${Math.max(2, formation.bounds.height / 7.2)}%`,
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedIds([formation.id]);
                }}
              >
                <span>{formation.name}</span>
              </button>
            ))}
            {document?.hazard_emitters.map((emitter, index) => {
              const asset = assets.find((item) => item.key === emitter.asset_id);
              const point = emitter.spawn_points[0] ?? {
                x: 104 + index * 84,
                y: 96,
              };
              return (
                <button
                  key={emitter.id}
                  type="button"
                  className={`designer-placement designer-emitter ${selectedIds.includes(`emitter:${emitter.id}`) ? "selected" : ""}`}
                  aria-label={`${emitter.hazard_type} emitter at ${point.x}, ${point.y}`}
                  style={{
                    left: `${point.x / 12.8}%`,
                    top: `${point.y / 7.2}%`,
                    width: "38px",
                    height: "38px",
                    transform: "translate(-50%, -50%)",
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedIds([`emitter:${emitter.id}`]);
                  }}
                >
                  {asset ? <img src={asset.thumbnail_path} alt="" /> : emitter.hazard_type}
                </button>
              );
            })}
            {document?.entities.map((entity) => {
              const asset = assets.find((item) => item.key === entity.asset_id);
              return (
                <button
                  key={entity.id}
                  type="button"
                  className={`designer-placement ${selectedIds.includes(entity.id) ? "selected" : ""}`}
                  aria-label={`${entity.entity_type} at ${entity.x}, ${entity.y}`}
                  style={{
                    left: `${entity.x / 12.8}%`,
                    top: `${entity.y / 7.2}%`,
                    width: `${Math.max(22, entity.width * 0.55)}px`,
                    height: `${Math.max(22, entity.height * 0.55)}px`,
                    transform: `translate(-50%, -50%) rotate(${entity.rotation}deg)`,
                  }}
                  onMouseDown={(event) => event.preventDefault()}
                  onPointerDown={(event) => beginDrag(event, entity.id)}
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedIds(
                      event.shiftKey
                        ? [...new Set([...selectedIds, entity.id])]
                        : [entity.id],
                    );
                  }}
                  onKeyDown={keyMove}
                >
                  {asset ? (
                    <img src={asset.thumbnail_path} alt="" />
                  ) : (
                    entity.entity_type
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <footer>
          <button
            onClick={() => {
              const prior = history.at(-1);
              if (prior) {
                setHistory((items) => items.slice(0, -1));
                restore(prior, "undo");
              }
            }}
            disabled={!history.length}
          >
            Undo
          </button>
          <button
            onClick={() => {
              const next = future.at(-1);
              if (next) {
                setFuture((items) => items.slice(0, -1));
                restore(next, "redo");
              }
            }}
            disabled={!future.length}
          >
            Redo
          </button>
          <button onClick={createFormation} disabled={selectedIds.length < 2}>
            Create formation
          </button>
          <button onClick={duplicateSelection} disabled={!selectedIds.length}>
            Duplicate
          </button>
          <button onClick={() => align("x")} disabled={selectedIds.length < 2}>
            Align X
          </button>
          <button onClick={() => align("y")} disabled={selectedIds.length < 2}>
            Align Y
          </button>
          <button
            onClick={() => distribute("x")}
            disabled={selectedIds.length < 3}
          >
            Distribute X
          </button>
          <button
            onClick={() => distribute("y")}
            disabled={selectedIds.length < 3}
          >
            Distribute Y
          </button>
          <button onClick={deleteSelection} disabled={!selectedIds.length}>
            Delete
          </button>
          {context.surface !== "COMMAND_POST" ? (
            <>
              <button
                onClick={() => lifecycle("validate")}
                disabled={!selectedLevel}
              >
                Validate
              </button>
              <button
                onClick={() => lifecycle("publish")}
                disabled={!selectedLevel}
              >
                Publish
              </button>
            </>
          ) : null}
          <button
            onClick={() => previewUrl && window.open(previewUrl, "_blank")}
            disabled={!previewUrl}
          >
            Same-runtime preview
          </button>
        </footer>
      </section>
      <aside className="designer-inspector">
        <h2>Levels</h2>
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => setSelectedLevelId(level.id)}
            className={selectedLevelId === level.id ? "selected" : ""}
          >
            {level.sequence}. {level.name}
            <small>
              {level.editable_version?.status ??
                level.active_version?.status ??
                "DRAFT"}
            </small>
          </button>
        ))}
        {context.surface === "INCEPTIVEC_ADMIN" && selectedLevel?.versions?.length ? (
          <section className="designer-version-history" aria-label="Immutable version history">
            <h2>Version history</h2>
            {selectedLevel.versions.map((version) => (
              <div key={`${version.version}-${version.checksum}`}>
                <span>v{version.version} {version.status} {version.checksum.slice(0, 10)}</span>
                {["PUBLISHED", "SUPERSEDED"].includes(version.status) ? (
                  <button type="button" onClick={() => lifecycle("rollback", version.version)}>
                    Restore as new version
                  </button>
                ) : null}
              </div>
            ))}
          </section>
        ) : null}
        <h2>Layers</h2>
        <p>
          {document?.entities.length ?? 0} entities /{" "}
          {document?.hazard_emitters.length ?? 0} emitters /{" "}
          {document?.shield_structures.length ?? 0} bunkers
        </p>
        <p>
          Budget: {document?.performance_budget.max_active_enemies ?? 0} hostile
          max
        </p>
        <h2>Inspector</h2>
        {!selectedEntity && !selectedPlayerSpawn && !selectedShield && !selectedEmitter && !selectedFormation && document ? (
          <div className="designer-fields" aria-label="Level configuration">
            <label>Name<input value={document.name} onChange={(event) => mutate((current) => ({ ...current, name: event.target.value }))} /></label>
            <label>Slug<input value={document.slug} onChange={(event) => mutate((current) => ({ ...current, slug: event.target.value }))} /></label>
            <label>Sequence<input type="number" min="1" value={document.sequence} onChange={(event) => mutate((current) => ({ ...current, sequence: Number(event.target.value) }))} /></label>
            <label>Deterministic seed<input type="number" value={document.seed} onChange={(event) => mutate((current) => ({ ...current, seed: Number(event.target.value) }))} /></label>
            <label>Version<input value={`v${document.version} ${document.status}`} disabled /></label>
            <label>Canvas width<input type="number" value={document.canvas.width} disabled /></label>
            <label>Canvas height<input type="number" value={document.canvas.height} disabled /></label>
            <label>Grid size<select value={document.canvas.grid_size} onChange={(event) => mutate((current) => ({ ...current, canvas: { ...current.canvas, grid_size: Number(event.target.value) as 8 | 16 | 24 | 32 } }))}>{[8, 16, 24, 32].map((grid) => <option key={grid} value={grid}>{grid}</option>)}</select></label>
            <label>Background asset<select value={document.canvas.background_asset_id} onChange={(event) => mutate((current) => ({ ...current, canvas: { ...current.canvas, background_asset_id: event.target.value } }))}>{assets.filter((asset) => asset.key.startsWith("background.")).map((asset) => <option key={asset.key}>{asset.key}</option>)}</select></label>
            <fieldset><legend>Gameplay settings</legend>
              {([['player_lives_at_campaign_start', 'Starting lives'], ['nukes_at_campaign_start', 'Starting nukes'], ['nuke_rearm_max', 'Nuke rearm maximum']] as const).map(([field, label]) => <label key={field}>{label}<input type="number" min="0" value={Number(document.gameplay[field] ?? 0)} onChange={(event) => mutate((current) => ({ ...current, gameplay: { ...current.gameplay, [field]: Number(event.target.value) } }))} /></label>)}
              {([['allow_pause', 'Pause'], ['allow_replay', 'Replay'], ['allow_main_menu_resume', 'Menu resume']] as const).map(([field, label]) => <label key={field}><input type="checkbox" checked={Boolean(document.gameplay[field])} onChange={(event) => mutate((current) => ({ ...current, gameplay: { ...current.gameplay, [field]: event.target.checked } }))} /> {label}</label>)}
              <label>Completion reward profile<input value={String(document.gameplay.completion_bonus_profile ?? "")} onChange={(event) => mutate((current) => ({ ...current, gameplay: { ...current.gameplay, completion_bonus_profile: event.target.value } }))} /></label>
              <label>Scoring profile<input value={String(document.gameplay.scoring_profile ?? "")} onChange={(event) => mutate((current) => ({ ...current, gameplay: { ...current.gameplay, scoring_profile: event.target.value } }))} /></label>
            </fieldset>
            <fieldset><legend>Performance budgets</legend>{Object.entries(document.performance_budget).map(([field, value]) => <label key={field}>{field}<input type="number" min="0" value={value} onChange={(event) => mutate((current) => ({ ...current, performance_budget: { ...current.performance_budget, [field]: Number(event.target.value) } }))} /></label>)}</fieldset>
            <fieldset><legend>Drop rules</legend>
              {document.drop_rules.map((rule, index) => <div key={rule.id}>
                <label>Hosts<select multiple value={rule.host_entity_types} onChange={(event) => mutate((current) => ({ ...current, drop_rules: current.drop_rules.map((item, itemIndex) => itemIndex === index ? { ...item, host_entity_types: Array.from(event.target.selectedOptions).map((option) => option.value) as typeof item.host_entity_types } : item) }))}>{["SCOUT", "CRUISER", "DESTROYER"].map((type) => <option key={type}>{type}</option>)}</select></label>
                <label>Pickup<select value={rule.pickup_type} onChange={(event) => mutate((current) => ({ ...current, drop_rules: current.drop_rules.map((item, itemIndex) => itemIndex === index ? { ...item, pickup_type: event.target.value as typeof item.pickup_type } : item) }))}><option>NUKE</option><option>LIFE</option></select></label>
                {([['probability', 'Probability'], ['maximum_per_level', 'Maximum'], ['collection_window_ms', 'Collection window (ms)']] as const).map(([field, label]) => <label key={field}>{label}<input type="number" min="0" max={field === 'probability' ? 1 : undefined} step={field === 'probability' ? 0.01 : 1} value={rule[field]} onChange={(event) => mutate((current) => ({ ...current, drop_rules: current.drop_rules.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: Number(event.target.value) } : item) }))} /></label>)}
                <button type="button" onClick={() => mutate((current) => ({ ...current, drop_rules: current.drop_rules.filter((_, itemIndex) => itemIndex !== index) }))}>Delete drop rule</button>
              </div>)}
              <button type="button" onClick={() => mutate((current) => ({ ...current, drop_rules: [...current.drop_rules, { id: uid('drop'), host_entity_types: ['SCOUT'], pickup_type: 'NUKE', probability: 0.1, maximum_per_level: 1, collection_window_ms: 6000 }] }))}>Add drop rule</button>
            </fieldset>
            <fieldset><legend>Objectives</legend>{document.objectives.map((objective, index) => <div key={objective.id}><label>Type<select value={objective.type} onChange={(event) => mutate((current) => ({ ...current, objectives: current.objectives.map((item, itemIndex) => itemIndex === index ? { ...item, type: event.target.value as Objective['type'] } : item) }))}>{["DESTROY_ALL_HOSTILES", "DESTROY_MOTHERSHIP", "SURVIVE_DURATION", "BOARD_TARGET"].map((type) => <option key={type}>{type}</option>)}</select></label><label><input type="checkbox" checked={objective.required} onChange={(event) => mutate((current) => ({ ...current, objectives: current.objectives.map((item, itemIndex) => itemIndex === index ? { ...item, required: event.target.checked } : item) }))} /> Required</label><label>Target entities<select multiple value={objective.target_entity_ids} onChange={(event) => mutate((current) => ({ ...current, objectives: current.objectives.map((item, itemIndex) => itemIndex === index ? { ...item, target_entity_ids: Array.from(event.target.selectedOptions).map((option) => option.value) } : item) }))}>{document.entities.map((entity) => <option key={entity.id} value={entity.id}>{entity.entity_type} {entity.id.slice(-8)}</option>)}</select></label><label>Duration (ms)<input type="number" min="0" value={objective.duration_ms ?? ""} onChange={(event) => mutate((current) => ({ ...current, objectives: current.objectives.map((item, itemIndex) => itemIndex === index ? { ...item, duration_ms: event.target.value === "" ? null : Number(event.target.value) } : item) }))} /></label><button type="button" onClick={() => mutate((current) => ({ ...current, objectives: current.objectives.filter((_, itemIndex) => itemIndex !== index) }))}>Delete objective</button></div>)}<button type="button" onClick={addObjective}>Add objective</button></fieldset>
            <fieldset><legend>Boarding anchors</legend>{document.boarding_anchors.map((anchor, index) => <div key={anchor.id}><label>Source entity<select value={anchor.source_entity_id} onChange={(event) => mutate((current) => ({ ...current, boarding_anchors: current.boarding_anchors.map((item, itemIndex) => itemIndex === index ? { ...item, source_entity_id: event.target.value } : item) }))}>{document.entities.filter((entity) => entity.entity_type === "CRUISER" || entity.entity_type === "DESTROYER").map((entity) => <option key={entity.id} value={entity.id}>{entity.entity_type} {entity.id.slice(-8)}</option>)}</select></label><label>Interior slug<input value={anchor.interior.slug} onChange={(event) => mutate((current) => ({ ...current, boarding_anchors: current.boarding_anchors.map((item, itemIndex) => itemIndex === index ? { ...item, interior: { ...item.interior, slug: event.target.value } } : item) }))} /></label><label>Interior version<input type="number" min="1" value={anchor.interior.version} onChange={(event) => mutate((current) => ({ ...current, boarding_anchors: current.boarding_anchors.map((item, itemIndex) => itemIndex === index ? { ...item, interior: { ...item.interior, version: Number(event.target.value) } } : item) }))} /></label><label>Checksum<input value={anchor.interior.checksum} onChange={(event) => mutate((current) => ({ ...current, boarding_anchors: current.boarding_anchors.map((item, itemIndex) => itemIndex === index ? { ...item, interior: { ...item.interior, checksum: event.target.value } } : item) }))} /></label><label>Entry width<input type="number" min="1" value={anchor.entry_envelope.width_px} onChange={(event) => mutate((current) => ({ ...current, boarding_anchors: current.boarding_anchors.map((item, itemIndex) => itemIndex === index ? { ...item, entry_envelope: { ...item.entry_envelope, width_px: Number(event.target.value) } } : item) }))} /></label><label>Entry height<input type="number" min="1" value={anchor.entry_envelope.height_px} onChange={(event) => mutate((current) => ({ ...current, boarding_anchors: current.boarding_anchors.map((item, itemIndex) => itemIndex === index ? { ...item, entry_envelope: { ...item.entry_envelope, height_px: Number(event.target.value) } } : item) }))} /></label><label>Offer duration<input type="number" min="0" value={anchor.offer_duration_ms} onChange={(event) => mutate((current) => ({ ...current, boarding_anchors: current.boarding_anchors.map((item, itemIndex) => itemIndex === index ? { ...item, offer_duration_ms: Number(event.target.value) } : item) }))} /></label><label>Interaction<select value={anchor.interaction} onChange={(event) => mutate((current) => ({ ...current, boarding_anchors: current.boarding_anchors.map((item, itemIndex) => itemIndex === index ? { ...item, interaction: event.target.value as Anchor['interaction'] } : item) }))}><option>BOARD</option></select></label><button type="button" onClick={() => mutate((current) => ({ ...current, boarding_anchors: current.boarding_anchors.filter((_, itemIndex) => itemIndex !== index) }))}>Delete anchor</button></div>)}<button type="button" onClick={addBoarding}>Add Boarding anchor</button></fieldset>
          </div>
        ) : selectedEntity ? (
          <div className="designer-fields">
            <label>
              Type
              <select value={selectedEntity.entity_type} onChange={(event) => {
                const entity_type = event.target.value as EntityType;
                mutate((current) => ({ ...current, entities: current.entities.map((entity) => entity.id === selectedEntity.id ? { ...entity, entity_type, asset_id: assetForType[entity_type], behaviour_profile: profileForType[entity_type], width: dimensions[entity_type][0], height: dimensions[entity_type][1] } : entity) }));
              }}>{(Object.keys(assetForType) as EntityType[]).map((type) => <option key={type}>{type}</option>)}</select>
            </label>
            <label>Asset<select value={selectedEntity.asset_id} onChange={(event) => updateSelected("asset_id", event.target.value)}>{assets.filter((asset) => asset.key === selectedEntity.asset_id).map((asset) => <option key={asset.key}>{asset.key}</option>)}</select></label>
            <label>
              X
              <input
                type="number"
                value={selectedEntity.x}
                onChange={(event) =>
                  updateSelected("x", Number(event.target.value))
                }
              />
            </label>
            <label>
              Y
              <input
                type="number"
                value={selectedEntity.y}
                onChange={(event) =>
                  updateSelected("y", Number(event.target.value))
                }
              />
            </label>
            <label>
              Width
              <input
                type="number"
                value={selectedEntity.width}
                onChange={(event) =>
                  updateSelected("width", Number(event.target.value))
                }
              />
            </label>
            <label>
              Height
              <input
                type="number"
                value={selectedEntity.height}
                onChange={(event) =>
                  updateSelected("height", Number(event.target.value))
                }
              />
            </label>
            <label>
              Rotation
              <input
                type="number"
                value={selectedEntity.rotation}
                onChange={(event) =>
                  updateSelected("rotation", Number(event.target.value))
                }
              />
            </label>
            <label>Z index<input type="number" value={selectedEntity.z_index} onChange={(event) => updateSelected("z_index", Number(event.target.value))} /></label>
            <label>Tags (comma separated)<input value={selectedEntity.tags.join(", ")} onChange={(event) => updateSelected("tags", event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean))} /></label>
            <label>Formation<select value={document?.formations.find((formation) => formation.member_ids.includes(selectedEntity.id))?.id ?? ""} onChange={(event) => mutate((current) => ({ ...current, formations: current.formations.map((formation) => ({ ...formation, member_ids: event.target.value === formation.id ? [...new Set([...formation.member_ids, selectedEntity.id])] : formation.member_ids.filter((id) => id !== selectedEntity.id) })) }))}><option value="">Ungrouped</option>{document?.formations.map((formation) => <option key={formation.id} value={formation.id}>{formation.name}</option>)}</select></label>
            <label>
              Profile
              <input
                value={selectedEntity.behaviour_profile}
                onChange={(event) =>
                  updateSelected("behaviour_profile", event.target.value)
                }
              />
            </label>
            <label>
              <input
                type="checkbox"
                checked={selectedEntity.enabled}
                onChange={(event) =>
                  updateSelected("enabled", event.target.checked)
                }
              />{" "}
              Enabled
            </label>
          </div>
        ) : selectedPlayerSpawn ? (
          <div className="designer-fields">
            <label>
              Type
              <input value="PLAYER SPAWN (SLOT 1)" disabled />
            </label>
            <label>Asset<input value={selectedPlayerSpawn.asset_id} disabled /></label>
            <label>
              X
              <input
                type="number"
                value={selectedPlayerSpawn.x}
                onChange={(event) => updatePlayerSpawn("x", Number(event.target.value))}
              />
            </label>
            <label>
              Y
              <input
                type="number"
                value={selectedPlayerSpawn.y}
                onChange={(event) => updatePlayerSpawn("y", Number(event.target.value))}
              />
            </label>
            <label>
              Rotation
              <input
                type="number"
                value={selectedPlayerSpawn.rotation}
                onChange={(event) => updatePlayerSpawn("rotation", Number(event.target.value))}
              />
            </label>
            <label>
              <input
                type="checkbox"
                checked={selectedPlayerSpawn.enabled}
                onChange={(event) => mutate((current) => ({ ...current, player_spawns: current.player_spawns.map((spawn) => spawn.id === selectedPlayerSpawn.id ? { ...spawn, enabled: event.target.checked } : spawn) }))}
              />{" "}
              Enabled required spawn
            </label>
          </div>
        ) : selectedShield ? (
          <div className="designer-fields">
            <label>
              Structure
              <input value={selectedShield.name} onChange={(event) => mutate((current) => ({ ...current, shield_structures: current.shield_structures.map((shield) => shield.id === selectedShield.id ? { ...shield, name: event.target.value } : shield) }))} />
            </label>
            <label>Tile asset<input value={selectedShield.tile_asset_id} disabled /></label>
            <label>Tile width<input type="number" min="1" value={selectedShield.tile_width} onChange={(event) => mutate((current) => ({ ...current, shield_structures: current.shield_structures.map((shield) => shield.id === selectedShield.id ? { ...shield, tile_width: Number(event.target.value) } : shield) }))} /></label>
            <label>Tile height<input type="number" min="1" value={selectedShield.tile_height} onChange={(event) => mutate((current) => ({ ...current, shield_structures: current.shield_structures.map((shield) => shield.id === selectedShield.id ? { ...shield, tile_height: Number(event.target.value) } : shield) }))} /></label>
            <label><input type="checkbox" checked={selectedShield.destructible} onChange={(event) => mutate((current) => ({ ...current, shield_structures: current.shield_structures.map((shield) => shield.id === selectedShield.id ? { ...shield, destructible: event.target.checked as true } : shield) }))} /> Destructible</label>
            <label>
              Origin X
              <input
                type="number"
                value={selectedShield.origin.x}
                onChange={(event) => updateShieldOrigin("x", Number(event.target.value))}
              />
            </label>
            <label>
              Origin Y
              <input
                type="number"
                value={selectedShield.origin.y}
                onChange={(event) => updateShieldOrigin("y", Number(event.target.value))}
              />
            </label>
            <p>Click any matrix cell to add or remove its real shield tile.</p>
            <button type="button" onClick={() => mutate((current) => ({ ...current, shield_structures: [...current.shield_structures, { ...selectedShield, id: uid("shield"), name: `${selectedShield.name} copy`, origin: { x: snap(Math.min(1280, selectedShield.origin.x + 32)), y: snap(Math.min(720, selectedShield.origin.y + 32)) }, matrix: selectedShield.matrix.map((row) => [...row]) }] }))}>Clone structure</button>
            <button type="button" onClick={() => { mutate((current) => ({ ...current, shield_structures: current.shield_structures.filter((shield) => shield.id !== selectedShield.id) })); setSelectedIds([]); }}>Delete structure</button>
          </div>
        ) : selectedEmitter ? (
          <div className="designer-fields">
            <label>
              Hazard type
              <select
                value={selectedEmitter.hazard_type}
                onChange={(event) =>
                  updateEmitter("hazard_type", event.target.value as Emitter["hazard_type"])
                }
              >
                <option value="ASTEROID">ASTEROID</option>
                <option value="COMET">COMET</option>
              </select>
            </label>
            <label>Asset<input value={selectedEmitter.asset_id} disabled /></label>
            <label>
              Initial count
              <input type="number" min="0" value={selectedEmitter.initial_count} onChange={(event) => updateEmitter("initial_count", Number(event.target.value))} />
            </label>
            <label>
              Maximum active
              <input type="number" min="0" value={selectedEmitter.maximum_active} onChange={(event) => updateEmitter("maximum_active", Number(event.target.value))} />
            </label>
            <label>
              Spawn interval (ms)
              <input type="number" min="0" value={selectedEmitter.spawn_interval_ms} onChange={(event) => updateEmitter("spawn_interval_ms", Number(event.target.value))} />
            </label>
            <label>Spawn jitter (ms)<input type="number" min="0" value={selectedEmitter.spawn_jitter_ms} onChange={(event) => updateEmitter("spawn_jitter_ms", Number(event.target.value))} /></label>
            <label>
              Minimum speed
              <input type="number" min="0" value={selectedEmitter.speed_min} onChange={(event) => updateEmitter("speed_min", Number(event.target.value))} />
            </label>
            <label>
              Maximum speed
              <input type="number" min="0" value={selectedEmitter.speed_max} onChange={(event) => updateEmitter("speed_max", Number(event.target.value))} />
            </label>
            <label>Minimum angular velocity<input type="number" value={selectedEmitter.angular_velocity_min} onChange={(event) => updateEmitter("angular_velocity_min", Number(event.target.value))} /></label>
            <label>Maximum angular velocity<input type="number" value={selectedEmitter.angular_velocity_max} onChange={(event) => updateEmitter("angular_velocity_max", Number(event.target.value))} /></label>
            <label>Entry edges<select multiple value={selectedEmitter.entry_edges} onChange={(event) => updateEmitter("entry_edges", Array.from(event.target.selectedOptions).map((option) => option.value) as Emitter["entry_edges"])}>{["TOP", "RIGHT", "BOTTOM", "LEFT"].map((edge) => <option key={edge}>{edge}</option>)}</select></label>
            <label>Spawn pattern<select value={selectedEmitter.spawn_pattern} onChange={(event) => updateEmitter("spawn_pattern", event.target.value as Emitter["spawn_pattern"])}>{["RANDOM_EDGE", "ALTERNATING_EDGES", "LANE", "FIXED_POINTS"].map((pattern) => <option key={pattern}>{pattern}</option>)}</select></label>
            <label>Fixed spawn points (x,y; x,y)<input value={selectedEmitter.spawn_points.map((point) => `${point.x},${point.y}`).join("; ")} onChange={(event) => updateEmitter("spawn_points", event.target.value.split(";").map((pair) => pair.trim().split(",").map(Number)).filter((pair) => pair.length === 2 && pair.every(Number.isFinite)).map(([x, y]) => ({ x, y })))} /></label>
            <label>Despawn margin<input type="number" min="0" value={selectedEmitter.despawn_margin} onChange={(event) => updateEmitter("despawn_margin", Number(event.target.value))} /></label>
            <label>Collision damage<input type="number" min="0" value={selectedEmitter.collision_damage} onChange={(event) => updateEmitter("collision_damage", Number(event.target.value))} /></label>
            <label>
              <input type="checkbox" checked={selectedEmitter.enabled} onChange={(event) => updateEmitter("enabled", event.target.checked)} /> Enabled
            </label>
          </div>
        ) : selectedFormation ? (
          <div className="designer-fields">
            <label>Name<input value={selectedFormation.name} onChange={(event) => updateFormation(selectedFormation.id, { name: event.target.value })} /></label>
            <label>
              Layout
              <select
                value={selectedFormation.layout}
                onChange={(event) =>
                  mutate((current) => ({
                    ...current,
                    formations: current.formations.map((item) =>
                      item.id === selectedFormation.id
                        ? { ...item, layout: event.target.value as Layout }
                        : item,
                    ),
                  }))
                }
              >
                {(["GRID", "LINE", "WEDGE", "ARC", "FREEFORM"] as Layout[]).map(
                  (layout) => (
                    <option key={layout}>{layout}</option>
                  ),
                )}
              </select>
            </label>
            <label>Origin X<input type="number" value={selectedFormation.bounds.x} onChange={(event) => updateFormation(selectedFormation.id, { bounds: { ...selectedFormation.bounds, x: Number(event.target.value) } })} /></label>
            <label>Origin Y<input type="number" value={selectedFormation.bounds.y} onChange={(event) => updateFormation(selectedFormation.id, { bounds: { ...selectedFormation.bounds, y: Number(event.target.value) } })} /></label>
            <label>
              Width
              <input
                type="number"
                value={selectedFormation.bounds.width}
                onChange={(event) =>
                  mutate((current) => ({
                    ...current,
                    formations: current.formations.map((item) =>
                      item.id === selectedFormation.id
                        ? {
                            ...item,
                            bounds: {
                              ...item.bounds,
                              width: Number(event.target.value),
                            },
                          }
                        : item,
                    ),
                  }))
                }
              />
            </label>
            <label>
              Height
              <input
                type="number"
                value={selectedFormation.bounds.height}
                onChange={(event) =>
                  mutate((current) => ({
                    ...current,
                    formations: current.formations.map((item) =>
                      item.id === selectedFormation.id
                        ? {
                            ...item,
                            bounds: {
                              ...item.bounds,
                              height: Number(event.target.value),
                            },
                          }
                        : item,
                    ),
                  }))
                }
              />
            </label>
            <label>
              Motion
              <input
                value={selectedFormation.motion_profile}
                onChange={(event) =>
                  mutate((current) => ({
                    ...current,
                    formations: current.formations.map((item) =>
                      item.id === selectedFormation.id
                        ? { ...item, motion_profile: event.target.value }
                        : item,
                    ),
                  }))
                }
              />
            </label>
            <label>Entry delay (ms)<input type="number" min="0" value={selectedFormation.entry_delay_ms} onChange={(event) => updateFormation(selectedFormation.id, { entry_delay_ms: Number(event.target.value) })} /></label>
            <label>Repeat<input type="number" min="0" value={selectedFormation.repeat} onChange={(event) => updateFormation(selectedFormation.id, { repeat: Number(event.target.value) })} /></label>
            <label>Members<select multiple value={selectedFormation.member_ids} onChange={(event) => updateFormation(selectedFormation.id, { member_ids: Array.from(event.target.selectedOptions).map((option) => option.value) })}>{document?.entities.filter((entity) => ["SCOUT", "CRUISER", "DESTROYER", "MOTHERSHIP"].includes(entity.entity_type)).map((entity) => <option key={entity.id} value={entity.id}>{entity.entity_type} {entity.id.slice(-8)}</option>)}</select></label>
            <button onClick={() => reflowFormation(selectedFormation)}>
              Reflow members
            </button>
            <button
              onClick={() =>
                mutate((current) => ({
                  ...current,
                  formations: current.formations.filter(
                    (item) => item.id !== selectedFormation.id,
                  ),
                }))
              }
            >
              Ungroup, keep members
            </button>
            <button onClick={() => removeFormationWithMembers(selectedFormation)}>
              Remove formation and members
            </button>
          </div>
        ) : (
          <p>
            Select saved objects. Shift-click or drag across the canvas to build
            a multi-selection. Drag to move, arrows to nudge, Shift+arrows for
            coarse movement.
          </p>
        )}
      </aside>
      {category ? (
        <div
          className="designer-chooser"
          role="dialog"
          aria-modal="true"
          aria-label={`${category} chooser`}
        >
          <section>
            <button
              aria-label="Close chooser"
              onClick={() => setCategory(null)}
            >
              X
            </button>
            <h2>{category}</h2>
            {category === "Player" ? (
              <button
                className="tool-button"
                onClick={() => {
                  const player = document?.player_spawns.find((spawn) => spawn.slot === 1);
                  if (player) setSelectedIds([`player:${player.id}`]);
                  setCategory(null);
                }}
              >
                <img src={assets.find((asset) => asset.key === "player.ship")?.thumbnail_path} alt="" />
                <span>
                  Player spawn
                  <small>Required Slot 1 spawn. Select to position and inspect.</small>
                </span>
                <strong>Select</strong>
              </button>
            ) : null}
            {chooserAssets.map(({ type, asset }) => (
              <button
                key={type}
                className="tool-button"
                draggable
                onDragStart={(event) =>
                  event.dataTransfer.setData("application/x-gg-entity", type)
                }
                onClick={() => addEntity(type)}
              >
                <img src={asset?.thumbnail_path} alt="" />
                <span>
                  {type}
                  <small>
                    {descriptions[type]} | {dimensions[type][0]} x{" "}
                    {dimensions[type][1]}
                  </small>
                </span>
                <strong>Select</strong>
              </button>
            ))}
            {category === "Hazards" ? (
              <div className="chooser-actions">
                {(["ASTEROID", "COMET"] as const).map((type) => (
                  <button key={type} onClick={() => addEmitter(type)}>
                    Add recurring {type} emitter
                  </button>
                ))}
              </div>
            ) : null}
            {category === "Shields and Bunkers" ? (
              <button onClick={addShield}>
                Add destructible bunker matrix
              </button>
            ) : null}
            {category === "Objectives" ? (
              <button onClick={addObjective}>
                Add survive-duration objective
              </button>
            ) : null}
            {category === "Boarding" ? (
              <button onClick={addBoarding}>
                Attach governed Boarding anchor
              </button>
            ) : null}
          </section>
        </div>
      ) : null}
    </main>
  );
}
