import type { BoardingEvent, BoardingInput, BoardingResources, BoardingSnapshot } from './types';

export const BOARDING_WORLD = { width: 4096, height: 720, grid: 64, tickMs: 1000 / 60, durationMs: 60000 } as const;

/** Deterministic, renderer-independent boarding rules. Phaser only projects this state. */
export class BoardingSimulation {
  private tick = 0;
  private state: BoardingSnapshot;
  private nextEvent = 1;

  constructor(private readonly seed: number, resources: BoardingResources) {
    this.state = { version: 1, tick: 0, seed, player: { x: 128, y: 576, vx: 0, vy: 0, health: 1 }, aliens: Array.from({ length: 6 }, (_, index) => ({ id: `alien-${index + 1}`, x: 640 + index * 448, y: 448, alive: true })), containers: Array.from({ length: 4 }, (_, index) => ({ id: `container-${index + 1}`, open: false })), resources: { ...resources }, events: [] };
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
  killAlien(id: string): void { const alien = this.state.aliens.find((candidate) => candidate.id === id); if (alien?.alive) { alien.alive = false; this.event('ALIEN_KILLED', id); } }
  snapshot(): BoardingSnapshot { return JSON.parse(JSON.stringify(this.state)) as BoardingSnapshot; }
  elapsedMs(): number { return Math.min(BOARDING_WORLD.durationMs, Math.round(this.tick * BOARDING_WORLD.tickMs)); }

  private openNearbyContainer(): void {
    const container = this.state.containers.find((candidate) => !candidate.open && Math.abs(this.state.player.x - (512 + (Number(candidate.id.slice(-1)) - 1) * 960)) < 96);
    if (!container) return;
    container.open = true;
    const roll = this.nextRandom() % 3;
    container.pickup = roll === 0 ? 'LIFE' : roll === 1 ? 'NUKE' : 'EMPTY';
    if (container.pickup === 'LIFE') this.state.resources.lives = Math.min(3, this.state.resources.lives + 1);
    if (container.pickup === 'NUKE') this.state.resources.nukes = Math.min(2, this.state.resources.nukes + 1);
    this.event('CONTAINER_OPENED', container.id, undefined, container.pickup);
  }

  private nextRandom(): number { let value = this.seed ^ this.tick; value = Math.imul(value ^ (value >>> 16), 0x45d9f3b); value = Math.imul(value ^ (value >>> 16), 0x45d9f3b); return (value ^ (value >>> 16)) >>> 0; }
  private event(type: string, entity_id: string, target_id?: string, value?: 'LIFE' | 'NUKE' | 'EMPTY'): void { this.state.events.push({ sequence: this.nextEvent++, at_ms: this.elapsedMs(), type, entity_id, ...(target_id ? { target_id } : {}), ...(value ? { value } : {}) }); }
}
