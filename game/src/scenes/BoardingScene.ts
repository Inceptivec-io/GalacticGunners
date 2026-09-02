import * as Phaser from 'phaser';

import { BoardingCoordinator } from '../boarding/BoardingCoordinator';
import { BoardingSimulation, BOARDING_WORLD } from '../boarding/BoardingSimulation';
import type { BoardingOutcome } from '../boarding/types';
import { digestBoardingSnapshot } from '../boarding/snapshot';
import { GENERATED_SPRITE_CATALOGUE } from '../config/generatedSpriteCatalogue';
import { GameApiClient, type BoardingRunRecord } from '../services/GameApiClient';

const ASSET_ROOT = '/gg-runtime-assets/boarding/';

interface BoardingLaunch {
  anchorId: string;
  sourceEntityId: string;
  sourceEntityType: 'scout' | 'cruiser' | 'destroyer';
  interior: { slug: 'alien-frigate'; version: 1; checksum: string };
  levelVersion: number;
  levelChecksum: string;
  admittedServerRun?: BoardingRunRecord;
  shooterStateDigest?: string;
}

interface BoardingQaState {
  active: boolean;
  completed: boolean;
  serverRunId: string | null;
  serverError: string | null;
  elapsedMs: number;
  player: { x: number; y: number };
  exitUnlocked: boolean;
  touchControls: Array<{ id: string; x: number; y: number }>;
  playerShotsInFlight: number;
  playerShotsFired: number;
  playerShotAttempts: number;
  playerShotPoolUnavailable: number;
  activeAliens: number;
  resources: { lives: number; nukes: number };
  playerBody: { x: number; y: number; width: number; height: number };
  playerPhysics: { velocityX: number; blockedLeft: boolean; blockedRight: boolean; touchingLeft: boolean; touchingRight: boolean; enabled: boolean; moves: boolean; embedded: boolean; allowGravity: boolean; worldPaused: boolean };
  simulationPlayerX: number;
  floorBodies: Array<{ x: number; y: number; width: number; height: number }>;
  runtime: { sceneActive: boolean; sceneSleeping: boolean; scenePaused: boolean; loopRunning: boolean; documentHidden: boolean; documentFocused: boolean; updateTicks: number };
  playerShots: Array<{ x: number; y: number; body: { x: number; y: number; width: number; height: number } }>;
  alienBodies: Array<{ id: string; x: number; y: number; body: { x: number; y: number; width: number; height: number } }>;
  viewport: { width: number; height: number };
  lastTouchInput: string | null;
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
  private floor!: Phaser.Physics.Arcade.StaticGroup;
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
  private lastTouchInput: string | null = null;
  private pausePressed = false;
  private playerShotsFired = 0;
  private playerShotAttempts = 0;
  private playerShotPoolUnavailable = 0;
  private playerHitEnabledAt = Number.POSITIVE_INFINITY;
  private updateTicks = 0;
  private cursorHideEvent?: Phaser.Time.TimerEvent;
  private cursorMoveHandler?: () => void;
  private onGameplayAnnouncement: ((announcement: string) => void) | undefined;
  private launch: BoardingLaunch = { anchorId: 'level-04-alien-frigate-01', sourceEntityId: 'level-04:formation-0:r0:c14', sourceEntityType: 'scout', interior: { slug: 'alien-frigate', version: 1, checksum: 'e9b1af65f0daef6725a7ddf4683b5f6d503e25dabc97aef1212102e6b1e994f3' }, levelVersion: 1, levelChecksum: '' };

  constructor() { super('BoardingScene'); }

  init(data: { seed?: number; lives?: number; nukes?: number; anchorId?: string; sourceEntityId?: string; sourceEntityType?: 'scout' | 'cruiser' | 'destroyer'; interior?: { slug: 'alien-frigate'; version: 1; checksum: string }; apiBaseUrl?: string; gameRunId?: string; levelVersion?: number; levelChecksum?: string; admittedServerRun?: BoardingRunRecord; shooterStateDigest?: string; onGameplayAnnouncement?: (announcement: string) => void } = {}): void {
    this.simulation = new BoardingSimulation(data.seed ?? 1, { lives: data.lives ?? 3, nukes: data.nukes ?? 2 });
    this.coordinator = new BoardingCoordinator();
    this.elapsed = 0;
    this.active = false;
    this.starting = true;
    this.completed = false;
    this.playerShotsFired = 0;
    this.playerShotAttempts = 0;
    this.playerShotPoolUnavailable = 0;
    this.updateTicks = 0;
    this.playerHitEnabledAt = Number.POSITIVE_INFINITY;
    this.serverRun = null;
    this.serverError = null;
    this.onGameplayAnnouncement = data.onGameplayAnnouncement;
    this.api = data.apiBaseUrl ? new GameApiClient(data.apiBaseUrl) : null;
    this.gameRunId = data.gameRunId ?? null;
    this.launch = {
      anchorId: data.anchorId ?? 'level-04-alien-frigate-01',
      sourceEntityId: data.sourceEntityId ?? 'level-04:formation-0:r0:c14',
      sourceEntityType: data.sourceEntityType ?? 'scout',
      interior: data.interior ?? { slug: 'alien-frigate', version: 1, checksum: 'e9b1af65f0daef6725a7ddf4683b5f6d503e25dabc97aef1212102e6b1e994f3' },
      levelVersion: data.levelVersion ?? 1,
      levelChecksum: data.levelChecksum ?? '',
      admittedServerRun: data.admittedServerRun,
      shooterStateDigest: data.shooterStateDigest,
    };
    this.serverRun = data.admittedServerRun ?? null;
    this.shooterStateDigest = data.shooterStateDigest ?? '';
  }

  preload(): void {
    this.load.image('boarding.background', `${ASSET_ROOT}boarding/backgrounds/gg_boarding_bg_corridor_v001.png`);
    for (const definition of GENERATED_SPRITE_CATALOGUE) {
      if (!definition.assetKey.startsWith('boarding.')) continue;
      this.load.spritesheet(definition.assetKey, definition.runtimePath, {
        frameWidth: definition.frameWidth,
        frameHeight: definition.frameHeight,
      });
    }
    this.load.image('boarding.platform', `${ASSET_ROOT}boarding/tiles/gg_boarding_tiles_floor_a_v001.png`);
    this.load.image('boarding.airlock', `${ASSET_ROOT}boarding/transit/gg_boarding_door_airlock_v001.png`);
    this.load.image('boarding.airlock-open', `${ASSET_ROOT}boarding/transit/gg_boarding_door_airlock_open_v001.png`);
    this.load.image('boarding.muzzle', `${ASSET_ROOT}boarding/effects/gg_boarding_fx_muzzle_flash_v001.png`);
    this.load.image('boarding.explosion', `${ASSET_ROOT}boarding/effects/gg_boarding_fx_explosion_v001.png`);
  }

  create(): void {
    // Level1 pauses while handing control to Boarding. Arcade Physics is shared
    // by the game, so Boarding must explicitly resume its own active world.
    this.physics.world.resume();
    this.physics.world.gravity.set(0, 1050);
    this.cameras.main.setBounds(0, 0, BOARDING_WORLD.width, BOARDING_WORLD.height);
    this.physics.world.setBounds(0, 0, BOARDING_WORLD.width, BOARDING_WORLD.height);
    this.add.image(BOARDING_WORLD.width / 2, 360, 'boarding.background').setDisplaySize(BOARDING_WORLD.width, 720).setScrollFactor(1);
    for (let x = 128; x < BOARDING_WORLD.width; x += 256) {
      this.add.image(x, 648, 'boarding.platform').setDisplaySize(256, 72);
    }
    // The tiled floor is visual decoration. One continuous physics deck prevents
    // decorative tile seams from becoming invisible horizontal blockers.
    this.floor = this.physics.add.staticGroup();
    const deck = this.floor.create(BOARDING_WORLD.width / 2, 648, 'boarding.platform') as Phaser.Physics.Arcade.Sprite;
    deck.setVisible(false).setDisplaySize(BOARDING_WORLD.width, 72);
    const deckBody = deck.body as Phaser.Physics.Arcade.StaticBody;
    deckBody.setSize(BOARDING_WORLD.width / deck.scaleX, 72 / deck.scaleY, true).updateFromGameObject();
    deckBody.checkCollision.left = false;
    deckBody.checkCollision.right = false;
    this.createBoardingAnimations();
    this.player = this.physics.add.sprite(128, 530, 'boarding.player.idle', 0).setDisplaySize(68, 104).setDepth(3);
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setSize(34 / this.player.scaleX, 82 / this.player.scaleY, true).setCollideWorldBounds(true).setAllowGravity(true);
    this.player.play('boarding.player.idle.play');
    this.aliens = this.physics.add.group();
    this.playerShots = this.physics.add.group({ maxSize: 48 });
    this.alienShots = this.physics.add.group({ maxSize: 48 });
    for (const alien of this.simulation.snapshot().aliens) {
      const sprite = this.aliens.create(alien.x, alien.y, 'boarding.alien.idle', 0) as Phaser.Physics.Arcade.Sprite;
      sprite.setDisplaySize(70, 100).setDepth(3).setData('alienId', alien.id);
      sprite.play('boarding.alien.idle.play');
      (sprite.body as Phaser.Physics.Arcade.Body).setSize(38 / sprite.scaleX, 76 / sprite.scaleY, true).setCollideWorldBounds(true).setAllowGravity(true);
    }
    this.exitAirlock = this.physics.add.staticSprite(BOARDING_WORLD.width - 72, 550, 'boarding.airlock').setDisplaySize(104, 180).setDepth(3);
    (this.exitAirlock.body as Phaser.Physics.Arcade.StaticBody).setSize(86 / this.exitAirlock.scaleX, 154 / this.exitAirlock.scaleY, true).updateFromGameObject();
    this.physics.add.collider(this.player, this.floor);
    this.physics.add.collider(this.aliens, this.floor);
    this.physics.add.collider(this.playerShots, this.floor, (shot) => this.destroyShot(shot as Phaser.Physics.Arcade.Sprite));
    this.physics.add.collider(this.alienShots, this.floor, (shot) => this.destroyShot(shot as Phaser.Physics.Arcade.Sprite));
    this.physics.add.overlap(this.playerShots, this.aliens, (shot, alien) => this.hitAlien(shot as Phaser.Physics.Arcade.Sprite, alien as Phaser.Physics.Arcade.Sprite));
    this.physics.add.overlap(this.alienShots, this.player, (first, second) => {
      const shot = first === this.player ? second : first;
      this.hitPlayer(shot as Phaser.Physics.Arcade.Sprite);
    });
    this.timer = this.add.text(24, 24, 'BOARDING 60', { fontFamily: 'GalacticGunnersHUD, monospace', fontSize: '28px', color: '#d9f8ff' }).setScrollFactor(0).setDepth(10);
    this.statusText = this.add.text(this.scale.width / 2, this.scale.height * 0.18, 'ALIEN FRIGATE BREACH\nESTABLISHING SECURE BOARDING LINK...', { align: 'center', fontFamily: 'GalacticGunnersGoldDisplay, monospace', fontSize: '30px', color: '#f5d15f' }).setOrigin(0.5).setScrollFactor(0).setDepth(20);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    if (this.serverRun) this.startActive();
    else void this.openServerRun();
    if (this.registry.get('runtimeConfig')?.qaDiagnostics && typeof window !== 'undefined') {
      window.__GALACTIC_GUNNERS_BOARDING_QA__ = {
        state: () => ({
          active: this.active,
          completed: this.completed,
          serverRunId: this.serverRun?.id ?? null,
          serverError: this.serverError,
          elapsedMs: this.simulation.elapsedMs(),
          player: { x: Math.round(this.player.x), y: Math.round(this.player.y) },
          exitUnlocked: this.exitUnlocked,
          touchControls: this.touchControls.map((control) => ({
            id: String(control.getData('qa')),
            x: Math.round((control as Phaser.GameObjects.Text).x),
            y: Math.round((control as Phaser.GameObjects.Text).y),
          })),
          playerShotsInFlight: this.playerShots.getChildren().filter((shot) => shot.active).length,
          playerShotsFired: this.playerShotsFired,
          playerShotAttempts: this.playerShotAttempts,
          playerShotPoolUnavailable: this.playerShotPoolUnavailable,
          activeAliens: this.aliens.getChildren().filter((alien) => (alien as Phaser.Physics.Arcade.Sprite).active).length,
          resources: { ...this.simulation.snapshot().resources },
          playerBody: (() => {
            const body = this.player.body as Phaser.Physics.Arcade.Body;
            return { x: Math.round(body.x), y: Math.round(body.y), width: Math.round(body.width), height: Math.round(body.height) };
          })(),
          playerPhysics: (() => {
            const body = this.player.body as Phaser.Physics.Arcade.Body;
            return {
              velocityX: Math.round(body.velocity.x),
              blockedLeft: body.blocked.left,
              blockedRight: body.blocked.right,
              touchingLeft: body.touching.left,
              touchingRight: body.touching.right,
              enabled: body.enable,
              moves: body.moves,
              embedded: body.embedded,
              allowGravity: body.allowGravity,
              worldPaused: this.physics.world.isPaused,
            };
          })(),
          simulationPlayerX: Math.round(this.simulation.snapshot().player.x),
          floorBodies: (this.floor.getChildren() as Phaser.Physics.Arcade.Sprite[])
            .filter((tile) => Math.abs(tile.x - this.player.x) < 300)
            .map((tile) => {
              const body = tile.body as Phaser.Physics.Arcade.StaticBody;
              return { x: Math.round(body.x), y: Math.round(body.y), width: Math.round(body.width), height: Math.round(body.height) };
            }),
          runtime: {
            sceneActive: this.scene.isActive(),
            sceneSleeping: this.scene.isSleeping(),
            scenePaused: this.scene.isPaused(),
            loopRunning: this.game.loop.running,
            documentHidden: document.hidden,
            documentFocused: document.hasFocus(),
            updateTicks: this.updateTicks,
          },
          playerShots: (this.playerShots.getChildren().filter((shot) => shot.active) as Phaser.Physics.Arcade.Sprite[]).map((shot) => {
            const body = shot.body as Phaser.Physics.Arcade.Body;
            return { x: Math.round(shot.x), y: Math.round(shot.y), body: { x: Math.round(body.x), y: Math.round(body.y), width: Math.round(body.width), height: Math.round(body.height) } };
          }),
          alienBodies: (this.aliens.getChildren().filter((alien) => alien.active) as Phaser.Physics.Arcade.Sprite[]).map((alien) => {
            const body = alien.body as Phaser.Physics.Arcade.Body;
            return { id: String(alien.getData('alienId')), x: Math.round(alien.x), y: Math.round(alien.y), body: { x: Math.round(body.x), y: Math.round(body.y), width: Math.round(body.width), height: Math.round(body.height) } };
          }),
          viewport: { width: this.scale.width, height: this.scale.height },
          lastTouchInput: this.lastTouchInput,
        }),
      };
    }
    for (const key of ['A', 'D', 'LEFT', 'RIGHT', 'W', 'UP', 'SPACE', 'E', 'P', 'ESC']) this.keys[key] = this.input.keyboard!.addKey(key);
    this.createTouchControls();
    this.installGameplayCursor();
    this.events.on('resume', this.onResume, this);
    this.events.once('shutdown', () => {
      this.events.off('resume', this.onResume, this);
      this.cursorHideEvent?.remove(false);
      this.cursorHideEvent = undefined;
      if (this.cursorMoveHandler) this.game.canvas.removeEventListener('pointermove', this.cursorMoveHandler);
      this.game.canvas.style.cursor = '';
      this.touchControls.splice(0).forEach((control) => control.destroy());
    });
  }

  private pauseBoarding(): void {
    if (
      this.completed ||
      !this.active ||
      this.time.now < this.pauseBlockedUntil ||
      this.scene.isActive('PauseScene')
    ) {
      return;
    }
    this.scene.launch('PauseScene', { targetScene: 'BoardingScene' });
    // PauseScene owns pausing its target after it has created. Sleeping here
    // races that launch and leaves Boarding visible with no usable overlay.
  }

  abortFromPause(): void {
    void this.finish('ABORTED');
  }

  onResume(): void {
    this.pauseBlockedUntil = this.time.now + 250;
    this.input.keyboard?.resetKeys();
  }

  update(_time: number, delta: number): void {
    this.updateTicks += 1;
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
    if (Phaser.Input.Keyboard.JustDown(this.keys.P) || Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
      this.pauseBoarding();
    }
    const pauseDown = Boolean(gamepad?.buttons[9]?.pressed);
    if (pauseDown && !this.pausePressed) this.pauseBoarding();
    this.pausePressed = pauseDown;
    this.player.setVelocityX(horizontal * 260);
    if (jump && (this.player.body as Phaser.Physics.Arcade.Body).blocked.down) this.player.setVelocityY(-440);
    if (fire && this.time.now - this.lastFireAt >= 180) this.firePlayerShot();
    this.updateBoardingAnimations(horizontal, fire);
    this.simulation.step({ horizontal, jump, fire, interact });
    // Arcade Physics is the runtime movement authority. Keep the deterministic
    // campaign projection aligned each frame so a valid visible airlock arrival
    // cannot be rejected because a browser frame advanced farther than the
    // simulation's fixed-step approximation.
    this.simulation.synchronizePlayerProjection({ x: this.player.x, y: this.player.y });
    if (this.time.now - this.lastAlienFireAt >= 1250) this.fireAlienShot();
    const remaining = Math.max(0, Math.ceil((BOARDING_WORLD.durationMs - this.simulation.elapsedMs()) / 1000));
    this.timer.setText(`BOARDING ${remaining}`);
    const atExit = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.exitAirlock.x, this.exitAirlock.y) < 110;
    if (!this.exitUnlocked && !this.aliens.getChildren().some((alien) => (alien as Phaser.Physics.Arcade.Sprite).active)) this.unlockExit();
    if (interact && this.exitUnlocked && atExit) {
      if (this.simulation.exit()) this.finish('SUCCESS');
    }
    else if (this.simulation.elapsedMs() >= BOARDING_WORLD.durationMs) {
      this.simulation.timeout();
      this.finish('TIMEOUT');
    }
    this.cleanupProjectiles();
  }

  private firePlayerShot(): void {
    this.playerShotAttempts += 1;
    const shot = this.playerShots.get(this.player.x + 32, this.player.y, 'boarding.muzzle') as Phaser.Physics.Arcade.Sprite | null;
    if (!shot) {
      this.playerShotPoolUnavailable += 1;
      return;
    }
    this.lastFireAt = this.time.now;
    this.player.play('boarding.player.fire.play', true);
    this.playerShotsFired += 1;
    shot.setPosition(this.player.x + 34, this.player.y).setActive(true).setVisible(true).setDisplaySize(30, 18);
    const body = shot.body as Phaser.Physics.Arcade.Body;
    body.enable = true; body.reset(shot.x, shot.y); body.setSize(26 / shot.scaleX, 12 / shot.scaleY, true);
    body.setAllowGravity(false);
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
        this.lastTouchInput = input;
        this.touchInput[input] = true;
        // A tap must produce the same immediate, visible firing response as a
        // keyboard press. Waiting for a later simulation frame made touch fire
        // nondeterministic on a constrained browser runner.
        if (input === 'fire' && this.active && this.time.now - this.lastFireAt >= 180) {
          this.firePlayerShot();
        }
        if (input !== 'left' && input !== 'right') this.time.delayedCall(125, release);
      });
      control.on('pointerup', () => {
        if (input === 'left' || input === 'right') release();
      });
      control.on('pointerout', () => {
        if (input === 'left' || input === 'right') release();
      });
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
    const view = this.cameras.main.worldView;
    const engagementWidth = this.cameras.main.width * 0.8;
    const candidates = this.aliens.getChildren().filter((candidate) => {
      const alien = candidate as Phaser.Physics.Arcade.Sprite;
      if (!alien.active || alien.getData('dying')) return false;
      const body = alien.body as Phaser.Physics.Arcade.Body;
      const insideView = body.right >= view.x + 32 && body.left <= view.right - 32 && body.bottom >= view.y + 32 && body.top <= view.bottom - 32;
      const distance = Phaser.Math.Distance.Between(alien.x, alien.y, this.player.x, this.player.y);
      // Boarding weapons are directional and may only engage a player visibly
      // in front of the alien within the settled camera engagement region.
      return insideView && distance <= engagementWidth && this.player.x < alien.x;
    }) as Phaser.Physics.Arcade.Sprite[];
    const alien = candidates.find((item) => item.x > this.player.x) ?? candidates[0];
    if (!alien) return;
    const shot = this.alienShots.get(alien.x - 36, alien.y, 'boarding.muzzle') as Phaser.Physics.Arcade.Sprite | null;
    if (!shot) return;
    this.lastAlienFireAt = this.time.now;
    alien.play('boarding.alien.fire.play', true);
    shot.setPosition(alien.x - 36, alien.y).setActive(true).setVisible(true).setDisplaySize(30, 18).setFlipX(true);
    const body = shot.body as Phaser.Physics.Arcade.Body;
    body.enable = true; body.reset(shot.x, shot.y); body.setSize(26 / shot.scaleX, 12 / shot.scaleY, true);
    body.setAllowGravity(false);
    shot.setVelocityX(-360); shot.setData('spent', false); this.simulation.alienFire(String(alien.getData('alienId')));
  }

  private cleanupProjectiles(): void {
    const margin = 64;
    for (const shot of [...this.playerShots.getChildren(), ...this.alienShots.getChildren()] as Phaser.Physics.Arcade.Sprite[]) {
      if (!shot.active) continue;
      if (shot.x < -margin || shot.x > BOARDING_WORLD.width + margin || shot.y < -margin || shot.y > BOARDING_WORLD.height + margin) {
        this.destroyShot(shot);
      }
    }
  }

  private destroyShot(shot: Phaser.Physics.Arcade.Sprite): void {
    if (shot === this.player) {
      throw new Error('Boarding projectile cleanup received the player sprite.');
    }
    shot.disableBody(true, true);
  }

  private hitAlien(shot: Phaser.Physics.Arcade.Sprite, alien: Phaser.Physics.Arcade.Sprite): void {
    if (!shot.active || !alien.active) return;
    this.destroyShot(shot);
    alien.setData('dying', true).setVelocity(0, 0).play('boarding.alien.hit_death.play', true);
    const alienId = String(alien.getData('alienId'));
    this.simulation.killAlien(alienId);
    this.onGameplayAnnouncement?.(`Boarding target ${alienId} eliminated.`);
    const effect = this.add.image(alien.x, alien.y, 'boarding.explosion').setDisplaySize(72, 72).setDepth(6);
    this.tweens.add({ targets: effect, alpha: 0, scale: 1.4, duration: 280, onComplete: () => effect.destroy() });
    this.time.delayedCall(600, () => {
      if (alien.active) alien.disableBody(true, true);
    });
  }

  private hitPlayer(shot: Phaser.Physics.Arcade.Sprite): void {
    if (!shot.active || this.completed) return;
    this.destroyShot(shot);
    if (this.simulation.elapsedMs() < this.playerHitEnabledAt) return;
    this.player.setVelocity(0, 0).play('boarding.player.hit_death.play', true);
    this.simulation.hitPlayer(); void this.finish('PLAYER_DEAD');
  }

  private createBoardingAnimations(): void {
    for (const definition of GENERATED_SPRITE_CATALOGUE) {
      if (!definition.assetKey.startsWith('boarding.')) continue;
      const animationKey = `${definition.assetKey}.play`;
      if (!this.textures.exists(definition.assetKey)) {
        throw new Error(`Boarding texture '${definition.assetKey}' was unavailable after preload.`);
      }
      if (this.anims.exists(animationKey)) continue;
      this.anims.create({
        key: animationKey,
        frames: this.anims.generateFrameNumbers(definition.assetKey, {
          start: 0,
          end: definition.frameCount - 1,
        }),
        frameRate: definition.frameRate,
        repeat: definition.repeat ? -1 : 0,
      });
    }
  }

  private installGameplayCursor(): void {
    const reveal = () => {
      this.game.canvas.style.cursor = '';
      this.cursorHideEvent?.remove(false);
      this.cursorHideEvent = this.time.delayedCall(5_000, () => {
        this.game.canvas.style.cursor = 'none';
      });
    };
    this.cursorMoveHandler = reveal;
    this.game.canvas.addEventListener('pointermove', reveal);
    reveal();
  }

  private updateBoardingAnimations(horizontal: number, fire: boolean): void {
    if (!this.player.active || this.player.getData('dying')) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (!body.blocked.down) {
      this.player.play('boarding.player.jump.play', true);
    } else if (fire) {
      this.player.play('boarding.player.fire.play', true);
    } else if (horizontal !== 0) {
      this.player.setFlipX(horizontal < 0).play('boarding.player.walk.play', true);
    } else {
      this.player.play('boarding.player.idle.play', true);
    }
    for (const alien of this.aliens.getChildren() as Phaser.Physics.Arcade.Sprite[]) {
      if (!alien.active || alien.getData('dying') || alien.anims.currentAnim?.key === 'boarding.alien.fire.play') continue;
      alien.play('boarding.alien.idle.play', true);
    }
  }

  private unlockExit(): void {
    this.exitUnlocked = true;
    for (const shot of this.alienShots.getChildren() as Phaser.Physics.Arcade.Sprite[]) {
      if (shot.active) this.destroyShot(shot);
    }
    this.exitAirlock.setTexture('boarding.airlock-open');
    const notice = this.add.text(this.scale.width / 2, this.scale.height * 0.18, 'AIRLOCK UNLOCKED\nMOVE TO EXIT AND PRESS E', {
      align: 'center', fontFamily: 'GalacticGunnersGoldDisplay, monospace', fontSize: '30px', color: '#f5d15f',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(20);
    this.time.delayedCall(1800, () => notice.destroy());
  }

  private async finish(outcome: BoardingOutcome): Promise<void> {
    if (this.completed) return;
    this.completed = true;
    // A pre-admitted run has already crossed the authoritative Shooter
    // boundary. Its fresh Phaser scene has no local offer, so it must not
    // attempt to reject or complete one during return handling.
    if (!this.launch.admittedServerRun) {
      if (this.coordinator.state === 'OFFERED') this.coordinator.reject();
      if (this.coordinator.state === 'ACTIVE') {
        this.coordinator.complete(outcome, this.simulation.snapshot().resources);
      }
    }
    let returnState: BoardingRunRecord['return_state'] = null;
    if (this.serverRun && this.api) {
      try {
        const snapshot = this.simulation.snapshot();
        const initial = this.serverRun.resources_start;
        const aborted = outcome === 'ABORTED';
        const events = aborted ? [] : snapshot.events.map((event, index) => ({ ...event, sequence: index }));
        const resourcesEnd = (outcome === 'TIMEOUT' || outcome === 'PLAYER_DEAD')
          ? { ...snapshot.resources, lives: Math.max(0, snapshot.resources.lives - 1) }
          : snapshot.resources;
        const result = await this.api.completeBoardingRun(this.serverRun.id, {
          outcome,
          duration_ms: outcome === 'TIMEOUT' ? BOARDING_WORLD.durationMs : this.simulation.elapsedMs(),
          resources_end: aborted ? initial : resourcesEnd,
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
    this.registry.get('runtimeConfig')?.onLaunchStateChange?.('gameplay');
    this.onGameplayAnnouncement?.(
      outcome === 'ABORTED'
        ? 'Boarding aborted. Shooter assault resumed.'
        : outcome === 'SUCCESS'
          ? 'Boarding complete. Shooter assault resumed.'
          : 'Boarding ended. Shooter assault resumed.',
    );
  }

  private startActive(): void {
    if (this.active || this.completed || !this.serverRun) return;
    // Level1 obtains server admission before it pauses. That handoff has no
    // local OFFERED state in this fresh scene, so accepting it again throws and
    // prevents the real Boarding scene from becoming visible. The fallback
    // launch path still owns a local offer and must complete that transition.
    if (!this.launch.admittedServerRun) this.coordinator.accept();
    // Admission must begin from a playable state. A first hostile shot is
    // scheduled after the scene is visibly active rather than inherited from
    // pre-admission/update timing.
    this.lastAlienFireAt = this.time.now + 1_500;
    this.playerHitEnabledAt = 0;
    this.active = true;
    this.starting = false;
    this.statusText.destroy();
    this.onGameplayAnnouncement?.(
      'Boarding active. Clear the frigate and reach the airlock.',
    );
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
