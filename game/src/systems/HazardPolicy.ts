export type HazardType = "asteroid" | "comet";

export type HazardEmitterPolicy = {
  id: string;
  variant_mode?: "FIXED" | "ORDERED" | "SEEDED_RANDOM";
  variant_ids?: string[];
  entry_edges: ReadonlyArray<"TOP" | "RIGHT" | "BOTTOM" | "LEFT">;
  despawn_margin: number;
};

export type HazardViewport = {
  width: number;
  height: number;
};

export type HazardEntryEdge = HazardEmitterPolicy["entry_edges"][number];

export function deterministicHazardRange(
  seed: number,
  minimum: number,
  maximum: number,
  key: string,
): number {
  let value = seed >>> 0;
  for (const character of key)
    value = Math.imul(value ^ character.charCodeAt(0), 16777619) >>> 0;
  return minimum + (value / 0xffffffff) * (maximum - minimum);
}

export function hazardVariantFrame(
  emitter: HazardEmitterPolicy | undefined,
  type: HazardType,
  ordinal: number,
  seed: number,
): number {
  const prefix = type === "asteroid" ? "ASTEROID_VARIANT_" : "COMET_VARIANT_";
  const ids = emitter?.variant_ids?.filter((id) => id.startsWith(prefix)) ?? [];
  if (!ids.length) return ordinal % 6;
  const index =
    emitter?.variant_mode === "SEEDED_RANDOM"
      ? Math.floor(
          deterministicHazardRange(
            seed,
            0,
            ids.length,
            `${emitter.id}:variant:${ordinal}`,
          ),
        ) % ids.length
      : ordinal % ids.length;
  const match = /_(\d{2})$/.exec(ids[index]);
  return match ? Number(match[1]) - 1 : 0;
}

export function hazardEntryEdge(
  emitter: HazardEmitterPolicy,
  ordinal: number,
): HazardEntryEdge {
  return emitter.entry_edges[ordinal % emitter.entry_edges.length] ?? "TOP";
}

export function hazardEntryPoint(
  emitter: HazardEmitterPolicy,
  ordinal: number,
  seed: number,
  viewport: HazardViewport,
): { x: number; y: number } {
  const edge = hazardEntryEdge(emitter, ordinal);
  const lane = deterministicHazardRange(
    seed,
    80,
    viewport.width - 80,
    `${emitter.id}:lane:${ordinal}`,
  );
  const verticalLane = lane * (viewport.height / viewport.width);
  if (edge === "LEFT") return { x: -emitter.despawn_margin, y: verticalLane };
  if (edge === "RIGHT")
    return { x: viewport.width + emitter.despawn_margin, y: verticalLane };
  if (edge === "BOTTOM")
    return { x: lane, y: viewport.height + emitter.despawn_margin };
  return { x: lane, y: -emitter.despawn_margin };
}

export function hazardTravelVector(
  edge: HazardEntryEdge,
  seed = 0,
  key = "hazard",
): {
  x: number;
  y: number;
} {
  if (edge === "LEFT") return { x: 1, y: 0.28 };
  if (edge === "RIGHT") return { x: -1, y: 0.28 };
  if (edge === "BOTTOM") return { x: 0, y: -1 };
  const topDirection =
    deterministicHazardRange(seed, 0, 1, `${key}:top-direction`) < 0.5
      ? -1
      : 1;
  return { x: 0.65 * topDirection, y: 1 };
}

/** Each asteroid must visibly rotate; the seed gives reproducible direction and speed. */
export function asteroidAngularVelocity(seed: number, key: string): number {
  const magnitude = deterministicHazardRange(seed, 40, 80, `${key}:magnitude`);
  const sign = deterministicHazardRange(seed, 0, 1, `${key}:sign`) < 0.5 ? -1 : 1;
  return sign * magnitude;
}

/**
 * The canonical comet image points down at zero rotation. Its leading body must
 * follow velocity while the authored tail trails behind on every entry edge.
 */
export function cometRotationForVelocity(vector: { x: number; y: number }): number {
  return Math.atan2(vector.y, vector.x) - Math.PI / 2;
}
