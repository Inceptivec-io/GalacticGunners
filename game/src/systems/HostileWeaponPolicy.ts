export type HostileShipType = "scout" | "cruiser" | "destroyer" | "mothership";

/**
 * Display-width fractions for authored world-axis weapon hardpoints. These are
 * emitted in one global fire event; the scene must not sequence them over time.
 */
export function hostileWeaponHardpoints(
  type: HostileShipType,
): readonly number[] {
  switch (type) {
    case "mothership":
      return [-0.3, 0, 0.3];
    case "destroyer":
      return [-0.28, 0.28];
    case "cruiser":
      return [-0.22, 0.22];
    case "scout":
      return [0];
  }
}

/** Deterministic round-robin selection prevents an eligible ship class starving. */
export function nextHostileIndex(ordinal: number, eligibleCount: number): number {
  if (!Number.isInteger(ordinal) || ordinal < 0) {
    throw new RangeError("Hostile fire ordinal must be a non-negative integer.");
  }
  if (!Number.isInteger(eligibleCount) || eligibleCount <= 0) {
    throw new RangeError("At least one eligible hostile is required.");
  }
  return ordinal % eligibleCount;
}
