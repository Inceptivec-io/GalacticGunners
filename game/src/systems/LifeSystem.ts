export class LifeSystem {
  #lives: number;
  readonly initialLives: number;

  constructor(initialLives: number) {
    if (!Number.isInteger(initialLives) || initialLives < 1) {
      throw new Error('LifeSystem requires a positive integer initial life count.');
    }
    this.initialLives = initialLives;
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
    this.#lives = this.initialLives;
  }

  restore(lives: number): void {
    if (!Number.isInteger(lives) || lives < 0) {
      throw new Error('LifeSystem restore requires a valid life count.');
    }
    this.#lives = lives;
  }

  collect(amount = 1): number {
    if (!Number.isInteger(amount) || amount < 0) {
      throw new Error('LifeSystem collect requires a non-negative integer.');
    }
    this.#lives += amount;
    return this.#lives;
  }
}
