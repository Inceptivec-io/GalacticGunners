export type HazardType = "asteroid" | "comet";

export type HazardEmitterPolicy = {
  id: string;
  variant_mode?: "FIXED" | "ORDERED" | "SEEDED_RANDOM";
  variant_ids?: string[];
  entry_edges: Array<"TOP" | "RIGHT" | "BOTTOM" | "LEFT">;
  despawn_margin: number;
};

export function deterministicHazardRange(seed: number, minimum: number, maximum: number, key: string): number {
  let value = seed >>> 0;
  for (const character of key) value = Math.imul(value ^ character.charCodeAt(0), 16777619) >>> 0;
  return minimum + (value / 0xffffffff) * (maximum - minimum);
}

export function hazardVariantFrame(emitter: HazardEmitterPolicy | undefined, type: HazardType, ordinal: number, seed: number): number {
  const prefix = type === "asteroid" ? "ASTEROID_VARIANT_" : "COMET_VARIANT_";
  const ids = emitter?.variant_ids?.filter((id) => id.startsWith(prefix)) ?? [];
  if (!ids.length) return ordinal % 6;
  const index = emitter?.variant_mode === "SEEDED_RANDOM"
    ? Math.floor(deterministicHazardRange(seed, 0, ids.length, `${emitter.id}:variant:${ordinal}`)) % ids.length
    : ordinal % ids.length;
  const match = /_(\d{2})$/.exec(ids[index]);
  return match ? Number(match[1]) - 1 : 0;
}
