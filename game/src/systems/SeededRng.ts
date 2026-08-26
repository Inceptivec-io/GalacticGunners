/** Deterministic content RNG. Never use Math.random for governed campaign drops. */
export class SeededRng {
  #state: number;
  constructor(seed: number) { this.#state = seed >>> 0 || 1; }
  next(): number { this.#state = (1664525 * this.#state + 1013904223) >>> 0; return this.#state / 0x1_0000_0000; }
}
