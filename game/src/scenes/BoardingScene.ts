import * as Phaser from 'phaser';

import { BoardingCoordinator } from '../boarding/BoardingCoordinator';
import { BoardingSimulation, BOARDING_WORLD } from '../boarding/BoardingSimulation';
import type { BoardingOutcome } from '../boarding/types';
import { digestBoardingSnapshot } from '../boarding/snapshot';
import { GameApiClient, type BoardingRunRecord } from '../services/GameApiClient';

const ASSET_ROOT = '/gg-runtime-assets/boarding/';
const OFFER_DURATION_MS = 8000;

interface BoardingLaunch {
  anchorId: string;
  sourceEntityId: string;
  levelVersion: number;
  levelChecksum: string;
}

interface BoardingQaState {
  active: boolean;
  completed: boolean;
  serverRunId: string | null;
  serverError: string | null;
  elapsedMs: number;
}

declare global {
  interface Window {
    __GALACTIC_GUNNERS_BOARDING_QA__?: { state: () => BoardingQaState };
  }
}

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
  private serverRun: BoardingRunRecord | null = null;
  private serverError: string | null = null;
  private api: GameApiClient | null = null;
  private gameRunId: string | null = null;
  private shooterStateDigest = '';
  private offerText!: Phaser.GameObjects.Text;
  private enterLabel!: Phaser.GameObjects.Text;
  private enterButton!: Phaser.GameObjects.Image;
  private launch: BoardingLaunch = { anchorId: 'level-04-alien-frigate-01', sourceEntityId: 'level-04:formation-0:r0:c14', levelVersion: 1, levelChecksum: '' };

  constructor() { super('BoardingScene'); }

  init(data: { seed?: number; lives?: number; nukes?: number; anchorId?: string; sourceEntityId?: string; apiBaseUrl?: string; gameRunId?: string; levelVersion?: number; levelChecksum?: string } = {}): void {
    this.simulation = new BoardingSimulation(data.seed ?? 1, { lives: data.lives ?? 3, nukes: data.nukes ?? 2 });
    this.coordinator = new BoardingCoordinator();
    this.offerElapsed = 0;
    this.elapsed = 0;
    this.active = false;
    this.completed = false;
    this.serverRun = null;
    this.serverError = null;
    this.api = data.apiBaseUrl ? new GameApiClient(data.apiBaseUrl) : null;
    this.gameRunId = data.gameRunId ?? null;
    this.launch = {
      anchorId: data.anchorId ?? 'level-04-alien-frigate-01',
      sourceEntityId: data.sourceEntityId ?? 'level-04:formation-0:r0:c14',
      levelVersion: data.levelVersion ?? 1,
      levelChecksum: data.levelChecksum ?? '',
    };
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
    this.offerText = this.add.text(this.scale.width / 2, this.scale.height * 0.3, 'ALIEN FRIGATE BREACH\nSECURING BOARDING LINK...', { align: 'center', fontFamily: 'GalacticGunnersGoldDisplay, monospace', fontSize: '30px', color: '#f5d15f' }).setOrigin(0.5).setScrollFactor(0).setDepth(20);
    this.enterButton = this.add.image(this.scale.width / 2, this.scale.height * 0.48, 'boarding.platform').setDisplaySize(240, 80).setTint(0x72d8ff).setScrollFactor(0).setDepth(20).setInteractive({ useHandCursor: true });
    this.enterButton.on('pointerover', () => this.enterButton.setTint(0xf5d15f));
    this.enterButton.on('pointerout', () => this.enterButton.setTint(0x72d8ff));
    this.enterButton.on('pointerup', () => this.acceptOffer());
    this.enterLabel = this.add.text(this.scale.width / 2, this.scale.height * 0.48, 'ENTER', { fontFamily: 'GalacticGunnersHUD, monospace', fontSize: '26px', color: '#ffffff' }).setOrigin(0.5).setScrollFactor(0).setDepth(21);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    void this.openServerRun();
    if (typeof window !== 'undefined') {
      window.__GALACTIC_GUNNERS_BOARDING_QA__ = {
        state: () => ({ active: this.active, completed: this.completed, serverRunId: this.serverRun?.id ?? null, serverError: this.serverError, elapsedMs: this.simulation.elapsedMs() }),
      };
    }
    this.input.keyboard?.once('keydown-ENTER', () => this.acceptOffer());
    this.input.keyboard?.once('keydown-ESC', () => this.finish('ABORTED'));
  }

  update(_time: number, delta: number): void {
    if (this.completed) return;
    if (!this.active) {
      if (this.serverError) {
        this.offerText.setText(`BOARDING LINK UNAVAILABLE\n${this.serverError}`);
        return;
      }
      this.offerElapsed += delta;
      this.offerText.setText(`ALIEN FRIGATE BREACH\nENTER BOARDING MODE? ${Math.max(0, Math.ceil((OFFER_DURATION_MS - this.offerElapsed) / 1000))}`);
      if (this.offerElapsed >= OFFER_DURATION_MS) this.finish('ABORTED');
      return;
    }
    this.elapsed += delta;
    const keys = this.input.keyboard;
    const horizontal = keys?.addKey('D').isDown || keys?.addKey('RIGHT').isDown ? 1 : keys?.addKey('A').isDown || keys?.addKey('LEFT').isDown ? -1 : 0;
    const interact = Boolean(keys?.addKey('E').isDown);
    this.simulation.step({ horizontal, jump: Boolean(keys?.addKey('W').isDown || keys?.addKey('UP').isDown), fire: Boolean(keys?.addKey('SPACE').isDown), interact });
    const state = this.simulation.snapshot();
    this.player.setPosition(state.player.x, state.player.y);
    const remaining = Math.max(0, Math.ceil((BOARDING_WORLD.durationMs - this.simulation.elapsedMs()) / 1000));
    this.timer.setText(`BOARDING ${remaining}`);
    if (interact && this.simulation.exit()) this.finish('SUCCESS');
    else if (this.simulation.elapsedMs() >= BOARDING_WORLD.durationMs) {
      this.simulation.timeout();
      this.finish('TIMEOUT');
    }
  }

  private async finish(outcome: BoardingOutcome): Promise<void> {
    if (this.completed) return;
    this.completed = true;
    if (this.coordinator.state === 'OFFERED') this.coordinator.reject();
    if (this.coordinator.state === 'ACTIVE') this.coordinator.complete(outcome, this.simulation.snapshot().resources);
    let returnState: BoardingRunRecord['return_state'] = null;
    if (this.serverRun && this.api) {
      try {
        const snapshot = this.simulation.snapshot();
        const initial = this.serverRun.resources_start;
        const aborted = outcome === 'ABORTED';
        const events = aborted ? [] : snapshot.events.map((event, index) => ({ ...event, sequence: index }));
        const result = await this.api.completeBoardingRun(this.serverRun.id, {
          outcome,
          duration_ms: outcome === 'TIMEOUT' ? BOARDING_WORLD.durationMs : this.simulation.elapsedMs(),
          resources_end: aborted ? initial : snapshot.resources,
          aliens_killed: aborted ? 0 : snapshot.aliens.filter((alien) => !alien.alive).length,
          containers_opened: aborted ? 0 : snapshot.containers.filter((container) => container.open).length,
          lives_found: aborted ? 0 : Math.max(0, snapshot.resources.lives - initial.lives),
          nukes_found: aborted ? 0 : Math.max(0, snapshot.resources.nukes - initial.nukes),
          score_events: [],
          shooter_state_digest: this.shooterStateDigest,
          events,
        }, this.serverRun.boarding_token);
        returnState = result.return_state;
      } catch {
        this.serverError = 'RETURN VALIDATION FAILED';
      }
    }
    this.scene.stop();
    if (typeof window !== 'undefined') delete window.__GALACTIC_GUNNERS_BOARDING_QA__;
    this.scene.resume('Level1Scene', { boardingOutcome: outcome, boardingSnapshot: this.simulation.snapshot(), boardingReturnState: returnState, boardingValidated: Boolean(returnState) });
  }

  private acceptOffer(): void {
    if (this.active || this.completed || !this.serverRun) return;
    this.coordinator.accept();
    this.active = true;
    this.offerText.destroy();
    this.enterButton.destroy();
    this.enterLabel.destroy();
  }

  private async openServerRun(): Promise<void> {
    const snapshot = this.simulation.snapshot();
    const opened = await this.coordinator.open({ anchorId: this.launch.anchorId, sourceEntityId: this.launch.sourceEntityId, resources: snapshot.resources, snapshot });
    this.shooterStateDigest = opened.shooterStateDigest;
    if (!this.api || !this.gameRunId || !this.launch.levelChecksum) {
      this.serverError = 'SERVER AUTHORITY REQUIRED';
      return;
    }
    try {
      this.serverRun = await this.api.startBoardingRun(this.gameRunId, {
        anchor_id: this.launch.anchorId,
        source_entity_id: this.launch.sourceEntityId,
        source_entity_type: 'scout',
        source_ship_type: 'ALIEN_FRIGATE',
        level_version: this.launch.levelVersion,
        level_checksum: this.launch.levelChecksum,
        interior_slug: 'alien-frigate',
        interior_version: 1,
        interior_checksum: 'e9b1af65f0daef6725a7ddf4683b5f6d503e25dabc97aef1212102e6b1e994f3',
        shooter_state_digest: this.shooterStateDigest,
        resources: snapshot.resources,
      });
    } catch {
      this.serverError = 'SERVER AUTHORITY REQUIRED';
    }
  }
}
