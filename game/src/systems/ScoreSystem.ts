import {
  MINIMUM_SCORE,
  SCORE_EVENT_VALUES,
  type ScoreEvent,
  type ScoreEventType,
} from '../config/scoring';

export class ScoreSystem {
  #score = MINIMUM_SCORE;
  #sequence = 0;
  #events: ScoreEvent[] = [];

  get value(): number {
    return this.#score;
  }

  get events(): readonly ScoreEvent[] {
    return this.#events;
  }

  apply(event: ScoreEventType, occurredAtMs = 0, metadata: ScoreEvent['metadata'] = {}): number {
    const pointsDelta = SCORE_EVENT_VALUES[event];
    this.#score = Math.max(MINIMUM_SCORE, this.#score + pointsDelta);
    this.#sequence += 1;
    this.#events.push({
      event_type: event,
      sequence: this.#sequence,
      occurred_at_ms: Math.max(0, Math.floor(occurredAtMs)),
      points_delta: pointsDelta,
      target_type: this.targetForEvent(event),
      metadata,
    });
    return this.#score;
  }

  reset(): void {
    this.#score = MINIMUM_SCORE;
    this.#sequence = 0;
    this.#events = [];
  }

  restore(score: number): void {
    if (!Number.isFinite(score) || score < MINIMUM_SCORE) {
      throw new Error('ScoreSystem restore requires a non-negative score.');
    }
    this.#score = Math.floor(score);
  }

  eventSummary(): Record<string, unknown> {
    const counts = this.#events.reduce<Record<string, number>>((summary, event) => {
      summary[event.event_type] = (summary[event.event_type] ?? 0) + 1;
      return summary;
    }, {});
    return {
      score: this.#score,
      event_count: this.#events.length,
      event_counts: counts,
      events: this.#events,
    };
  }

  private targetForEvent(event: ScoreEventType): ScoreEvent['target_type'] {
    switch (event) {
      case 'laser_target_hit':
        return 'laser_target';
      case 'asteroid_destroyed':
        return 'asteroid';
      case 'scout_destroyed':
        return 'scout';
      case 'ship_destroyed':
        return 'ship';
      case 'mothership_hit':
      case 'mothership_destroyed':
        return 'mothership';
      case 'comet_destroyed':
      case 'comet_nuke_bonus':
        return 'comet';
      case 'shield_tile_hit':
        return 'shield_tile';
    }
  }
}
