import * as Phaser from 'phaser';

import { BoardingSimulation, BOARDING_WORLD } from '../boarding/BoardingSimulation';
import type { BoardingOutcome } from '../boarding/types';

const ASSET_ROOT = '/gg-runtime-assets/boarding/';

/** Phaser projection of the deterministic H014 boarding simulation. */
export class BoardingScene extends Phaser.Scene {
  private simulation!: BoardingSimulation;
  private player!: Phaser.GameObjects.Image;
  private timer!: Phaser.GameObjects.Text;
  private elapsed = 0;
  private completed = false;

  constructor() { super('BoardingScene'); }

  init(data: { seed?: number; lives?: number; nukes?: number } = {}): void {
    this.simulation = new BoardingSimulation(data.seed ?? 1, { lives: data.lives ?? 3, nukes: data.nukes ?? 2 });
  }

  preload(): void {
    this.load.image('boarding.background', `${ASSET_ROOT}boarding/backgrounds/gg_boarding_bg_corridor_v001.png`);
    this.load.image('boarding.player', `${ASSET_ROOT}characters/player_001_v001.png`);
    this.load.image('boarding.alien', `${ASSET_ROOT}characters/alien_001_v001.png`);
    this.load.image('boarding.platform', `${ASSET_ROOT}boarding/tiles/gg_boarding_tiles_platform_a_v001.png`);
  }

  create(): void {
    this.cameras.main.setBounds(0, 0, BOARDING_WORLD.width, BOARDING_WORLD.height);
    this.add.image(BOARDING_WORLD.width / 2, 360, 'boarding.background').setDisplaySize(BOARDING_WORLD.width, 720).setScrollFactor(1);
    for (let x = 128; x < BOARDING_WORLD.width; x += 320) this.add.image(x, 640, 'boarding.platform').setDisplaySize(256, 96);
    this.player = this.add.image(128, 576, 'boarding.player').setDisplaySize(86, 104).setDepth(3);
    for (const alien of this.simulation.snapshot().aliens) this.add.image(alien.x, alien.y, 'boarding.alien').setDisplaySize(90, 92).setDepth(3);
    this.timer = this.add.text(24, 24, 'BOARDING 60', { fontFamily: 'GalacticGunnersHUD, monospace', fontSize: '28px', color: '#d9f8ff' }).setScrollFactor(0).setDepth(10);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.input.keyboard?.once('keydown-ESC', () => this.finish('ABORTED'));
  }

  update(_time: number, delta: number): void {
    if (this.completed) return;
    this.elapsed += delta;
    const keys = this.input.keyboard;
    const horizontal = keys?.addKey('D').isDown || keys?.addKey('RIGHT').isDown ? 1 : keys?.addKey('A').isDown || keys?.addKey('LEFT').isDown ? -1 : 0;
    this.simulation.step({ horizontal, jump: Boolean(keys?.addKey('W').isDown || keys?.addKey('UP').isDown), fire: Boolean(keys?.addKey('SPACE').isDown), interact: Boolean(keys?.addKey('E').isDown) });
    const state = this.simulation.snapshot();
    this.player.setPosition(state.player.x, state.player.y);
    const remaining = Math.max(0, Math.ceil((BOARDING_WORLD.durationMs - this.simulation.elapsedMs()) / 1000));
    this.timer.setText(`BOARDING ${remaining}`);
    if (this.simulation.elapsedMs() >= BOARDING_WORLD.durationMs) this.finish('TIMEOUT');
  }

  private finish(outcome: BoardingOutcome): void {
    this.completed = true;
    this.scene.stop();
    this.scene.resume('Level1Scene', { boardingOutcome: outcome, boardingSnapshot: this.simulation.snapshot() });
  }
}
