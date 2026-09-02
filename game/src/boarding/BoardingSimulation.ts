import type { BoardingEvent, BoardingInput, BoardingResources, BoardingSnapshot } from './types';
import { SeededRng } from '../systems/SeededRng';

export const BOARDING_WORLD = { width: 4096, height: 720, grid: 64, tickMs: 1000 / 60, durationMs: 60000 } as const;

/** Deterministic, renderer-independent boarding rules. Phaser only projects this state. */
export class BoardingSimulation {
  private tick = 0;
  private state: BoardingSnapshot;
  private nextEvent = 0;
  private readonly rng: SeededRng;

  constructor(private readonly seed: number, resources: BoardingResources) {
    this.rng = new SeededRng(seed);
    this.state = {
      version: 1,
      tick: 0,
      seed,
      player: { x: 128, y: 520, vx: 0, vy: 0, health: 1 },
      aliens: [704, 1280, 1792, 2304, 2816, 3520].map((x, index) => ({ id: `alien-0${index + 1}`, x, y: 536, alive: true })),
      containers: ['crate-01', 'barrel-01', 'crate-02', 'barrel-02'].map(id => ({ id, open: false })),
      resources: { ...resources },
      events: [],
    };
  }

  step(input: BoardingInput): void {
    if (this.tick >= 3600 || this.state.player.health <= 0) return;
    const player = this.state.player;
    player.vx = input.horizontal * 260;
    player.x = Math.max(32, Math.min(BOARDING_WORLD.width - 32, player.x + player.vx * BOARDING_WORLD.tickMs / 1000));
    if (input.jump && player.y >= 576) player.vy = -440;
    player.vy = Math.min(720, player.vy + 1050 * BOARDING_WORLD.tickMs / 1000);
    player.y = Math.min(576, player.y + player.vy * BOARDING_WORLD.tickMs / 1000);
    if (player.y >= 576) player.vy = 0;
    if (input.fire) this.event('PLAYER_FIRE', 'player');
    if (input.interact) this.openNearbyContainer();
    this.tick += 1;
    this.state.tick = this.tick;
  }

  hitPlayer(): void { if (this.state.player.health > 0) { this.state.player.health = 0; this.event('PLAYER_HIT', 'player'); } }
  alienFire(id: string): void { this.event('ALIEN_FIRE', id); }
  killAlien(id: string): void { const alien = this.state.aliens.find((candidate) => candidate.id === id); if (alien?.alive) { alien.alive = false; this.event('ALIEN_KILLED', id); } }
  synchronizePlayerProjection(position: { x: number; y: number }): void {
    this.state.player.x = Math.max(32, Math.min(BOARDING_WORLD.width - 32, position.x));
    this.state.player.y = Math.max(0, Math.min(576, position.y));
  }
  exit(): boolean {
    if (this.state.player.x < BOARDING_WORLD.width - 128) return false;
    this.event('EXIT_INTERACTED', 'exit-airlock');
    return true;
  }
  timeout(): void { this.state.events = [{ sequence: 0, at_ms: BOARDING_WORLD.durationMs, type: 'TIMEOUT', entity_id: 'boarding-clock' }]; }
  snapshot(): BoardingSnapshot { return JSON.parse(JSON.stringify(this.state)) as BoardingSnapshot; }
  elapsedMs(): number { return Math.min(BOARDING_WORLD.durationMs, Math.round(this.tick * BOARDING_WORLD.tickMs)); }

  private openNearbyContainer(): void {
    const containerPositions: Record<string, number> = { 'crate-01': 1536, 'barrel-01': 2176, 'crate-02': 2688, 'barrel-02': 3264 };
    const container = this.state.containers.find((candidate) => !candidate.open && Math.abs(this.state.player.x - containerPositions[candidate.id]) < 96);
    if (!container) return;
    container.open = true;
    const roll = Math.floor(this.rng.next() * 100);
    container.pickup = roll < 15 ? 'LIFE' : roll < 30 ? 'NUKE' : 'EMPTY';
    if (container.pickup === 'LIFE') this.state.resources.lives += 1;
    if (container.pickup === 'NUKE') this.state.resources.nukes += 1;
    this.event('CONTAINER_OPENED', container.id, undefined, container.pickup);
  }

  private event(type: string, entity_id: string, target_id?: string, value?: 'LIFE' | 'NUKE' | 'EMPTY'): void { this.state.events.push({ sequence: this.nextEvent++, at_ms: this.elapsedMs(), type, entity_id, ...(target_id ? { target_id } : {}), ...(value ? { value } : {}) }); }
}
