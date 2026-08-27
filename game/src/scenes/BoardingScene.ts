import * as Phaser from 'phaser';

import { BoardingCoordinator } from '../boarding/BoardingCoordinator';
import { BoardingSimulation, BOARDING_WORLD } from '../boarding/BoardingSimulation';
import type { BoardingOutcome } from '../boarding/types';

const ASSET_ROOT = '/gg-runtime-assets/boarding/';
const OFFER_DURATION_MS = 8000;

/** Phaser projection of the deterministic H014 boarding simulation. */
export class BoardingScene extends Phaser.Scene {
  private coordinator = new BoardingCoordinator();
  private simulation!: BoardingSimulation;
  private player!: Phaser.GameObjects.Image;
  private timer!: Phaser.GameObjects.Text;
  private elapsed = 0;
  private offerElapsed = 0;
  private active = false;
  private completed = false;
  private offerText!: Phaser.GameObjects.Text;
  private enterLabel!: Phaser.GameObjects.Text;
  private enterButton!: Phaser.GameObjects.Image;
  private launch = { anchorId: 'level-04-alien-frigate-01', sourceEntityId: 'level-04:formation-0:r0:c14' };

  constructor() { super('BoardingScene'); }

  init(data: { seed?: number; lives?: number; nukes?: number; anchorId?: string; sourceEntityId?: string } = {}): void {
    this.simulation = new BoardingSimulation(data.seed ?? 1, { lives: data.lives ?? 3, nukes: data.nukes ?? 2 });
    this.coordinator = new BoardingCoordinator();
    this.launch = { anchorId: data.anchorId ?? 'level-04-alien-frigate-01', sourceEntityId: data.sourceEntityId ?? 'level-04:formation-0:r0:c14' };
    this.offerElapsed = 0;
    this.active = false;
    this.completed = false;
  }

  preload(): void {
    this.load.image('boarding.background', `${ASSET_ROOT}boarding/backgrounds/gg_boarding_bg_corridor_v001.png`);
    this.load.image('boarding.player', `${ASSET_ROOT}characters/player_001_v001.png`);
    this.load.image('boarding.alien', `${ASSET_ROOT}characters/alien_001_v001.png`);
    this.load.image('boarding.platform', `${ASSET_ROOT}boarding/tiles/gg_boarding_tiles_floor_a_v001.png`);
  }

  create(): void {
    this.cameras.main.setBounds(0, 0, BOARDING_WORLD.width, BOARDING_WORLD.height);
    this.add.image(BOARDING_WORLD.width / 2, 360, 'boarding.background').setDisplaySize(BOARDING_WORLD.width, 720).setScrollFactor(1);
    for (let x = 128; x < BOARDING_WORLD.width; x += 256) this.add.image(x, 648, 'boarding.platform').setDisplaySize(256, 72);
    this.player = this.add.image(128, 576, 'boarding.player').setDisplaySize(86, 104).setDepth(3);
    for (const alien of this.simulation.snapshot().aliens) this.add.image(alien.x, alien.y, 'boarding.alien').setDisplaySize(90, 92).setDepth(3);
    this.timer = this.add.text(24, 24, 'BOARDING 60', { fontFamily: 'GalacticGunnersHUD, monospace', fontSize: '28px', color: '#d9f8ff' }).setScrollFactor(0).setDepth(10);
    this.offerText = this.add.text(this.scale.width / 2, this.scale.height * 0.3, 'ALIEN FRIGATE BREACH\nENTER BOARDING MODE?', { align: 'center', fontFamily: 'GalacticGunnersDisplay, monospace', fontSize: '30px', color: '#f5d15f' }).setOrigin(0.5).setScrollFactor(0).setDepth(20);
    this.enterButton = this.add.image(this.scale.width / 2, this.scale.height * 0.48, 'boarding.platform').setDisplaySize(240, 80).setTint(0x72d8ff).setScrollFactor(0).setDepth(20).setInteractive({ useHandCursor: true });
    this.enterButton.on('pointerover', () => this.enterButton.setTint(0xf5d15f));
    this.enterButton.on('pointerout', () => this.enterButton.setTint(0x72d8ff));
    this.enterButton.on('pointerup', () => this.acceptOffer());
    this.enterLabel = this.add.text(this.scale.width / 2, this.scale.height * 0.48, 'ENTER', { fontFamily: 'GalacticGunnersHUD, monospace', fontSize: '26px', color: '#ffffff' }).setOrigin(0.5).setScrollFactor(0).setDepth(21);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    void this.coordinator.open({ anchorId: this.launch.anchorId, sourceEntityId: this.launch.sourceEntityId, resources: this.simulation.snapshot().resources, snapshot: this.simulation.snapshot() });
    this.input.keyboard?.once('keydown-ENTER', () => this.acceptOffer());
    this.input.keyboard?.once('keydown-ESC', () => this.finish('ABORTED'));
  }

  update(_time: number, delta: number): void {
    if (this.completed) return;
    if (!this.active) {
      this.offerElapsed += delta;
      this.offerText.setText(`ALIEN FRIGATE BREACH\nENTER BOARDING MODE? ${Math.max(0, Math.ceil((OFFER_DURATION_MS - this.offerElapsed) / 1000))}`);
      if (this.offerElapsed >= OFFER_DURATION_MS) this.finish('ABORTED');
      return;
    }
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
    if (this.coordinator.state === 'OFFERED') this.coordinator.reject();
    if (this.coordinator.state === 'ACTIVE') this.coordinator.complete(outcome, this.simulation.snapshot().resources);
    this.scene.stop();
    this.scene.resume('Level1Scene', { boardingOutcome: outcome, boardingSnapshot: this.simulation.snapshot() });
  }

  private acceptOffer(): void {
    if (this.active || this.completed) return;
    this.coordinator.accept();
    this.active = true;
    this.offerText.destroy();
    this.enterButton.destroy();
    this.enterLabel.destroy();
  }
}
