export class LifeSystem {
  #lives: number;
  readonly maxLives: number;

  constructor(initialLives: number) {
    if (!Number.isInteger(initialLives) || initialLives < 1) {
      throw new Error('LifeSystem requires a positive integer initial life count.');
    }
    this.maxLives = initialLives;
    this.#lives = initialLives;
  }

  get value(): number {
    return this.#lives;
  }

  get isDepleted(): boolean {
    return this.#lives === 0;
  }

  damage(amount = 1): number {
    this.#lives = Math.max(0, this.#lives - Math.max(0, Math.floor(amount)));
    return this.#lives;
  }

  reset(): void {
    this.#lives = this.maxLives;
  }
}
