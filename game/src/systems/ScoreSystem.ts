import { MINIMUM_SCORE, SCORE_EVENTS, type ScoreEventName } from '../config/scoring';

export class ScoreSystem {
  #score = MINIMUM_SCORE;

  get value(): number {
    return this.#score;
  }

  apply(event: ScoreEventName): number {
    this.#score = Math.max(MINIMUM_SCORE, this.#score + SCORE_EVENTS[event]);
    return this.#score;
  }

  reset(): void {
    this.#score = MINIMUM_SCORE;
  }
}
