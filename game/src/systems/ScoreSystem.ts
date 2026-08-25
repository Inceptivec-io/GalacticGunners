import { MINIMUM_SCORE, SCORE_EVENT_VALUES, type ScoreEventType } from '../config/scoring';

export class ScoreSystem {
  #score = MINIMUM_SCORE;

  get value(): number {
    return this.#score;
  }

  apply(event: ScoreEventType): number {
    this.#score = Math.max(MINIMUM_SCORE, this.#score + SCORE_EVENT_VALUES[event]);
    return this.#score;
  }

  reset(): void {
    this.#score = MINIMUM_SCORE;
  }
}
