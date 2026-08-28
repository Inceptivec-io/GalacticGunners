import * as Phaser from 'phaser';

import { BoardingCoordinator } from '../boarding/BoardingCoordinator';
import { BoardingSimulation, BOARDING_WORLD } from '../boarding/BoardingSimulation';
import type { BoardingOutcome } from '../boarding/types';
import { digestBoardingSnapshot } from '../boarding/snapshot';
import { GameApiClient, type BoardingRunRecord } from '../services/GameApiClient';

const ASSET_ROOT = '/gg-runtime-assets/boarding/';

interface BoardingLaunch {
  anchorId: string;
  sourceEntityId: string;
  sourceEntityType: 'scout' | 'cruiser' | 'destroyer';
  interior: { slug: 'alien-frigate'; version: 1; checksum: string };
  levelVersion: number;
  levelChecksum: string;
}

interface BoardingQaState {
  active: boolean;
  completed: boolean;
  serverRunId: string | null;
  serverError: string | null;
  elapsedMs: number;
  player: { x: number; y: number };
  exitUnlocked: boolean;
  touchControls: string[];
  playerShotsInFlight: number;
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
  private player!: Phaser.Physics.Arcade.Sprite;
  private aliens!: Phaser.Physics.Arcade.Group;
  private playerShots!: Phaser.Physics.Arcade.Group;
  private alienShots!: Phaser.Physics.Arcade.Group;
  private exitAirlock!: Phaser.Physics.Arcade.Sprite;
  private exitUnlocked = false;
  private lastFireAt = Number.NEGATIVE_INFINITY;
  private lastAlienFireAt = Number.NEGATIVE_INFINITY;
  private readonly keys: Record<string, Phaser.Input.Keyboard.Key> = {};
  private timer!: Phaser.GameObjects.Text;
  private elapsed = 0;
  private starting = true;
  private active = false;
  private completed = false;
  private pauseBlockedUntil = 0;
  private serverRun: BoardingRunRecord | null = null;
  private serverError: string | null = null;
  private api: GameApiClient | null = null;
  private gameRunId: string | null = null;
  private shooterStateDigest = '';
  private statusText!: Phaser.GameObjects.Text;
  private readonly touchInput = { left: false, right: false, jump: false, fire: false, interact: false };
  private readonly touchControls: Phaser.GameObjects.GameObject[] = [];
  private pausePressed = false;
  private launch: BoardingLaunch = { anchorId: 'level-04-alien-frigate-01', sourceEntityId: 'level-04:formation-0:r0:c14', sourceEntityType: 'scout', interior: { slug: 'alien-frigate', version: 1, checksum: 'e9b1af65f0daef6725a7ddf4683b5f6d503e25dabc97aef1212102e6b1e994f3' }, levelVersion: 1, levelChecksum: '' };

  constructor() { super('BoardingScene'); }

  init(data: { seed?: number; lives?: number; nukes?: number; anchorId?: string; sourceEntityId?: string; sourceEntityType?: 'scout' | 'cruiser' | 'destroyer'; interior?: { slug: 'alien-frigate'; version: 1; checksum: string }; apiBaseUrl?: string; gameRunId?: string; levelVersion?: number; levelChecksum?: string } = {}): void {
    this.simulation = new BoardingSimulation(data.seed ?? 1, { lives: data.lives ?? 3, nukes: data.nukes ?? 2 });
    this.coordinator = new BoardingCoordinator();
    this.elapsed = 0;
    this.active = false;
    this.starting = true;
    this.completed = false;
    this.serverRun = null;
    this.serverError = null;
    this.api = data.apiBaseUrl ? new GameApiClient(data.apiBaseUrl) : null;
    this.gameRunId = data.gameRunId ?? null;
    this.launch = {
      anchorId: data.anchorId ?? 'level-04-alien-frigate-01',
      sourceEntityId: data.sourceEntityId ?? 'level-04:formation-0:r0:c14',
      sourceEntityType: data.sourceEntityType ?? 'scout',
      interior: data.interior ?? { slug: 'alien-frigate', version: 1, checksum: 'e9b1af65f0daef6725a7ddf4683b5f6d503e25dabc97aef1212102e6b1e994f3' },
      levelVersion: data.levelVersion ?? 1,
      levelChecksum: data.levelChecksum ?? '',
    };
  }

  preload(): void {
    this.load.image('boarding.background', `${ASSET_ROOT}boarding/backgrounds/gg_boarding_bg_corridor_v001.png`);
    this.load.image('boarding.player', `${ASSET_ROOT}characters/player_001_v001.png`);
    this.load.image('boarding.alien', `${ASSET_ROOT}characters/alien_001_v001.png`);
    this.load.image('boarding.platform', `${ASSET_ROOT}boarding/tiles/gg_boarding_tiles_floor_a_v001.png`);
    this.load.image('boarding.airlock', `${ASSET_ROOT}boarding/transit/gg_boarding_door_airlock_v001.png`);
    this.load.image('boarding.airlock-open', `${ASSET_ROOT}boarding/transit/gg_boarding_door_airlock_open_v001.png`);
    this.load.image('boarding.muzzle', `${ASSET_ROOT}boarding/effects/gg_boarding_fx_muzzle_flash_v001.png`);
    this.load.image('boarding.explosion', `${ASSET_ROOT}boarding/effects/gg_boarding_fx_explosion_v001.png`);
  }

  create(): void {
    this.cameras.main.setBounds(0, 0, BOARDING_WORLD.width, BOARDING_WORLD.height);
    this.add.image(BOARDING_WORLD.width / 2, 360, 'boarding.background').setDisplaySize(BOARDING_WORLD.width, 720).setScrollFactor(1);
    const floor = this.physics.add.staticGroup();
    for (let x = 128; x < BOARDING_WORLD.width; x += 256) {
      const tile = floor.create(x, 648, 'boarding.platform') as Phaser.Physics.Arcade.Sprite;
      tile.setDisplaySize(256, 72).refreshBody();
    }
    this.player = this.physics.add.sprite(128, 530, 'boarding.player').setCrop(40, 130, 290, 590).setDisplaySize(68, 104).setDepth(3);
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setSize(34, 82, true).setCollideWorldBounds(true);
    this.aliens = this.physics.add.group();
    this.playerShots = this.physics.add.group({ maxSize: 16 });
    this.alienShots = this.physics.add.group({ maxSize: 16 });
    for (const alien of this.simulation.snapshot().aliens) {
      const sprite = this.aliens.create(alien.x, alien.y, 'boarding.alien') as Phaser.Physics.Arcade.Sprite;
      sprite.setCrop(40, 120, 290, 600).setDisplaySize(70, 100).setDepth(3).setData('alienId', alien.id);
      (sprite.body as Phaser.Physics.Arcade.Body).setSize(38, 76, true).setCollideWorldBounds(true);
    }
    this.exitAirlock = this.physics.add.staticSprite(BOARDING_WORLD.width - 72, 550, 'boarding.airlock').setDisplaySize(104, 180).setDepth(3);
    (this.exitAirlock.body as Phaser.Physics.Arcade.StaticBody).setSize(86, 154, true).updateFromGameObject();
    this.physics.add.collider(this.player, floor);
    this.physics.add.collider(this.aliens, floor);
    this.physics.add.collider(this.playerShots, floor, (shot) => this.destroyShot(shot as Phaser.Physics.Arcade.Sprite));
    this.physics.add.collider(this.alienShots, floor, (shot) => this.destroyShot(shot as Phaser.Physics.Arcade.Sprite));
    this.physics.add.overlap(this.playerShots, this.aliens, (shot, alien) => this.hitAlien(shot as Phaser.Physics.Arcade.Sprite, alien as Phaser.Physics.Arcade.Sprite));
    this.physics.add.overlap(this.alienShots, this.player, (shot) => this.hitPlayer(shot as Phaser.Physics.Arcade.Sprite));
    this.timer = this.add.text(24, 24, 'BOARDING 60', { fontFamily: 'GalacticGunnersHUD, monospace', fontSize: '28px', color: '#d9f8ff' }).setScrollFactor(0).setDepth(10);
    this.statusText = this.add.text(this.scale.width / 2, this.scale.height * 0.18, 'ALIEN FRIGATE BREACH\nESTABLISHING SECURE BOARDING LINK...', { align: 'center', fontFamily: 'GalacticGunnersGoldDisplay, monospace', fontSize: '30px', color: '#f5d15f' }).setOrigin(0.5).setScrollFactor(0).setDepth(20);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    void this.openServerRun();
    if (typeof window !== 'undefined') {
      window.__GALACTIC_GUNNERS_BOARDING_QA__ = {
        state: () => ({
          active: this.active,
          completed: this.completed,
          serverRunId: this.serverRun?.id ?? null,
          serverError: this.serverError,
          elapsedMs: this.simulation.elapsedMs(),
          player: { x: Math.round(this.player.x), y: Math.round(this.player.y) },
          exitUnlocked: this.exitUnlocked,
          touchControls: this.touchControls.map((control) => String(control.getData('qa'))),
          playerShotsInFlight: this.playerShots.getChildren().filter((shot) => shot.active).length,
        }),
      };
    }
    this.input.keyboard?.once('keydown-ESC', () => this.finish('ABORTED'));
    this.input.keyboard?.on('keydown-P', this.pauseBoarding, this);
    for (const key of ['A', 'D', 'LEFT', 'RIGHT', 'W', 'UP', 'SPACE', 'E']) this.keys[key] = this.input.keyboard!.addKey(key);
    this.createTouchControls();
    this.events.on('resume', this.onResume, this);
    this.events.once('shutdown', () => {
      this.input.keyboard?.off('keydown-P', this.pauseBoarding, this);
      this.events.off('resume', this.onResume, this);
      this.touchControls.splice(0).forEach((control) => control.destroy());
    });
  }

  private pauseBoarding(): void {
    if (this.completed || !this.active || this.time.now < this.pauseBlockedUntil) return;
    this.scene.launch('PauseScene', { targetScene: 'BoardingScene' });
    this.scene.sleep();
  }

  onResume(): void {
    this.pauseBlockedUntil = this.time.now + 250;
    this.input.keyboard?.resetKeys();
  }

  update(_time: number, delta: number): void {
    if (this.completed) return;
    if (!this.active) {
      if (this.serverError) {
        this.statusText.setText(`BOARDING LINK UNAVAILABLE\n${this.serverError}`);
        return;
      }
      this.statusText.setText('ALIEN FRIGATE BREACH\nESTABLISHING SECURE BOARDING LINK...');
      return;
    }
    this.elapsed += delta;
    const gamepad = this.input.gamepad?.getPad(0);
    const axisX = gamepad?.axes[0]?.getValue() ?? 0;
    const horizontal = this.keys.D.isDown || this.keys.RIGHT.isDown || this.touchInput.right || gamepad?.buttons[15]?.pressed || axisX > 0.35
      ? 1
      : this.keys.A.isDown || this.keys.LEFT.isDown || this.touchInput.left || gamepad?.buttons[14]?.pressed || axisX < -0.35
        ? -1
        : 0;
    const jump = Phaser.Input.Keyboard.JustDown(this.keys.W) || Phaser.Input.Keyboard.JustDown(this.keys.UP) || this.touchInput.jump || Boolean(gamepad?.buttons[1]?.pressed);
    const fire = this.keys.SPACE.isDown || this.touchInput.fire || Boolean(gamepad?.buttons[0]?.pressed);
    const interact = Phaser.Input.Keyboard.JustDown(this.keys.E) || this.touchInput.interact || Boolean(gamepad?.buttons[2]?.pressed);
    const pauseDown = Boolean(gamepad?.buttons[9]?.pressed);
    if (pauseDown && !this.pausePressed) this.pauseBoarding();
    this.pausePressed = pauseDown;
    this.player.setVelocityX(horizontal * 260);
    if (jump && (this.player.body as Phaser.Physics.Arcade.Body).blocked.down) this.player.setVelocityY(-440);
    if (fire && this.time.now - this.lastFireAt >= 180) this.firePlayerShot();
    this.simulation.step({ horizontal, jump, fire, interact });
    if (this.time.now - this.lastAlienFireAt >= 1250) this.fireAlienShot();
    const remaining = Math.max(0, Math.ceil((BOARDING_WORLD.durationMs - this.simulation.elapsedMs()) / 1000));
    this.timer.setText(`BOARDING ${remaining}`);
    const atExit = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.exitAirlock.x, this.exitAirlock.y) < 110;
    if (!this.exitUnlocked && !this.aliens.getChildren().some((alien) => (alien as Phaser.Physics.Arcade.Sprite).active)) this.unlockExit();
    if (interact && this.exitUnlocked && atExit && this.simulation.exit()) this.finish('SUCCESS');
    else if (this.simulation.elapsedMs() >= BOARDING_WORLD.durationMs) {
      this.simulation.timeout();
      this.finish('TIMEOUT');
    }
  }

  private firePlayerShot(): void {
    const shot = this.playerShots.get(this.player.x + 32, this.player.y - 18, 'boarding.muzzle') as Phaser.Physics.Arcade.Sprite | null;
    if (!shot) return;
    this.lastFireAt = this.time.now;
    shot.setPosition(this.player.x + 34, this.player.y - 18).setActive(true).setVisible(true).setDisplaySize(30, 18);
    const body = shot.body as Phaser.Physics.Arcade.Body;
    body.enable = true; body.reset(shot.x, shot.y); body.setSize(26, 12, true);
    shot.setVelocityX(620); shot.setData('spent', false);
  }

  private createTouchControls(): void {
    const { width, height } = this.scale;
    const bind = (x: number, label: string, input: keyof typeof this.touchInput) => {
      const control = this.add.text(x, height - 58, label, {
        color: '#d7f8ff',
        backgroundColor: '#123763',
        fontFamily: 'GalacticGunnersHUD, monospace',
        fontSize: '22px',
        padding: { x: 16, y: 10 },
      }).setOrigin(0.5).setScrollFactor(0).setDepth(30).setAlpha(0.88).setInteractive({ useHandCursor: true });
      const release = () => { this.touchInput[input] = false; };
      control.on('pointerdown', () => {
        this.touchInput[input] = true;
        if (input !== 'left' && input !== 'right') this.time.delayedCall(125, release);
      });
      control.on('pointerup', () => {
        if (input === 'left' || input === 'right') release();
      });
      control.on('pointerout', release);
      control.setData('qa', `boarding-touch-${input}`);
      this.touchControls.push(control);
    };
    bind(58, 'LEFT', 'left');
    bind(154, 'RIGHT', 'right');
    bind(width - 284, 'JUMP', 'jump');
    bind(width - 178, 'FIRE', 'fire');
    bind(width - 70, 'EXIT', 'interact');
  }

  private fireAlienShot(): void {
    const candidates = this.aliens.getChildren().filter((alien) => (alien as Phaser.Physics.Arcade.Sprite).active) as Phaser.Physics.Arcade.Sprite[];
    const alien = candidates.find((item) => item.x > this.player.x) ?? candidates[0];
    if (!alien) return;
    const shot = this.alienShots.get(alien.x - 36, alien.y, 'boarding.muzzle') as Phaser.Physics.Arcade.Sprite | null;
    if (!shot) return;
    this.lastAlienFireAt = this.time.now;
    shot.setPosition(alien.x - 36, alien.y).setActive(true).setVisible(true).setDisplaySize(30, 18).setFlipX(true);
    const body = shot.body as Phaser.Physics.Arcade.Body;
    body.enable = true; body.reset(shot.x, shot.y); body.setSize(26, 12, true);
    shot.setVelocityX(-360); shot.setData('spent', false); this.simulation.alienFire(String(alien.getData('alienId')));
  }

  private destroyShot(shot: Phaser.Physics.Arcade.Sprite): void { shot.disableBody(true, true); }

  private hitAlien(shot: Phaser.Physics.Arcade.Sprite, alien: Phaser.Physics.Arcade.Sprite): void {
    if (!shot.active || !alien.active) return;
    this.destroyShot(shot); alien.disableBody(true, true);
    this.simulation.killAlien(String(alien.getData('alienId')));
    const effect = this.add.image(alien.x, alien.y, 'boarding.explosion').setDisplaySize(72, 72).setDepth(6);
    this.tweens.add({ targets: effect, alpha: 0, scale: 1.4, duration: 280, onComplete: () => effect.destroy() });
  }

  private hitPlayer(shot: Phaser.Physics.Arcade.Sprite): void {
    if (!shot.active || this.completed) return;
    this.destroyShot(shot); this.simulation.hitPlayer(); void this.finish('PLAYER_DEAD');
  }

  private unlockExit(): void {
    this.exitUnlocked = true;
    this.exitAirlock.setTexture('boarding.airlock-open');
    this.statusText.setText('AIRLOCK UNLOCKED\nMOVE TO EXIT AND PRESS E');
    this.time.delayedCall(1800, () => { if (!this.completed && this.statusText.active) this.statusText.setText(''); });
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

  private startActive(): void {
    if (this.active || this.completed || !this.serverRun) return;
    this.coordinator.accept();
    this.active = true;
    this.starting = false;
    this.statusText.destroy();
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
        source_entity_type: this.launch.sourceEntityType,
        source_ship_type: 'ALIEN_FRIGATE',
        level_version: this.launch.levelVersion,
        level_checksum: this.launch.levelChecksum,
        interior_slug: this.launch.interior.slug,
        interior_version: this.launch.interior.version,
        interior_checksum: this.launch.interior.checksum,
        shooter_state_digest: this.shooterStateDigest,
        resources: snapshot.resources,
      });
      this.startActive();
    } catch {
      this.serverError = 'SERVER AUTHORITY REQUIRED';
    }
  }
}
