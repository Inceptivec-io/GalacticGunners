import { SeededRng } from './SeededRng';

export type PickupType = 'nuke' | 'life';

export class PickupSystem {
  #collected = new Set<string>();
  constructor(private readonly rng: SeededRng) {}
  choose(hostId: string, entries: Array<{ pickup: PickupType; weight: number }>): PickupType | null {
    if (this.#collected.has(hostId) || entries.length === 0) return null;
    const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = this.rng.next() * total;
    for (const entry of entries) { roll -= entry.weight; if (roll <= 0) return entry.pickup; }
    return entries.at(-1)?.pickup ?? null;
  }
  collect(hostId: string): boolean { if (this.#collected.has(hostId)) return false; this.#collected.add(hostId); return true; }
}
