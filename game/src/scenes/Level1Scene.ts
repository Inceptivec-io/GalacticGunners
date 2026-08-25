import * as Phaser from 'phaser';

import { Player } from '../entities/Player';
import { Scout } from '../entities/Scout';
import { RUNTIME_ASSETS } from '../config/assets';
import { type GameRuntimeConfig } from '../config/gameConfig';
import { LEVEL_ONE_SLICE } from '../config/levelOneSlice';
import { GameApiClient } from '../services/GameApiClient';
import { AudioSystem } from '../systems/AudioSystem';
import { GameSession } from '../systems/GameSession';
import { InputSystem } from '../systems/InputSystem';
import { LifeSystem } from '../systems/LifeSystem';
import { ScoreSystem } from '../systems/ScoreSystem';

type TerminalState = 'complete' | 'failed';

interface HostileQaApi {
  firePlayerLaserAtScout: (index?: number, offsetX?: number) => Record<string, unknown>;
  fireEnemyLaserAtPlayer: (offsetX?: number) => Record<string, unknown>;
  forceComplete: () => void;
  forceFail: () => void;
  replay: () => void;
  menu: () => void;
  state: () => Record<string, unknown>;
}

declare global {
  interface Window {
    __GALACTIC_GUNNERS_SLICE_QA__?: Record<string, unknown>;
    __GALACTIC_GUNNERS_HOSTILE__?: HostileQaApi;
  }
}

export class Level1Scene extends Phaser.Scene {
  #player!: Player;
  #score!: ScoreSystem;
  #lives!: LifeSystem;
  #audio!: AudioSystem;
  #session!: GameSession;
  #inputSystem!: InputSystem;
  #background!: Phaser.GameObjects.Image;
  #scouts!: Phaser.Physics.Arcade.Group;
  #playerLasers!: Phaser.Physics.Arcade.Group;
  #enemyLasers!: Phaser.Physics.Arcade.Group;
  #scoreText!: Phaser.GameObjects.Text;
  #lifeText!: Phaser.GameObjects.Text;
  #lastDamageAtMs = Number.NEGATIVE_INFINITY;
  #formationDirection: 1 | -1 = 1;
  #terminalState: TerminalState | null = null;
  #runtimeConfig: GameRuntimeConfig = {};

  constructor() {
    super('Level1Scene');
  }

  create(): void {
    this.#runtimeConfig = this.registry.get('runtimeConfig') as GameRuntimeConfig | undefined ?? {};
    this.#terminalState = null;
    this.#lastDamageAtMs = Number.NEGATIVE_INFINITY;
    this.#formationDirection = 1;
    this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);

    this.#score = new ScoreSystem();
    this.#lives = new LifeSystem(LEVEL_ONE_SLICE.initialLives);
    this.#audio = new AudioSystem((cue) => this.sound.play(RUNTIME_ASSETS.audio[cue].key));
    this.#session = new GameSession(this.#runtimeConfig.apiBaseUrl ? new GameApiClient(this.#runtimeConfig.apiBaseUrl) : null);
    this.#inputSystem = new InputSystem(this);
    void this.#session.start().finally(() => this.publishQaState());

    this.#background = this.add.image(this.scale.width / 2, this.scale.height / 2, RUNTIME_ASSETS.background.starfield.key)
      .setDisplaySize(this.scale.width, this.scale.height)
      .setDepth(0);

    this.#player = new Player(this, this.scale.width / 2, this.scale.height - 98);
    this.#playerLasers = this.physics.add.group({ maxSize: 32 });
    this.#enemyLasers = this.physics.add.group({ maxSize: 32 });
    this.#scouts = this.physics.add.group();
    this.createScoutWave();
    this.createHud();
    this.createCollisions();
    this.installHostileQa();

    this.time.addEvent({
      delay: LEVEL_ONE_SLICE.scoutFireIntervalMs,
      loop: true,
      callback: () => this.fireEnemyLaser(),
    });

    this.scale.on('resize', this.handleResize, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.handleResize, this);
      if (typeof window !== 'undefined') {
        delete window.__GALACTIC_GUNNERS_HOSTILE__;
      }
    });
  }

  update(time: number): void {
    if (this.#terminalState) {
      const actions = this.#inputSystem.actions;
      if (actions.confirm) {
        this.scene.restart();
      } else if (actions.back) {
        this.scene.start('MainMenuScene');
      }
      return;
    }
    this.handleInput(time);
    this.#player.clampToPlayfield();
    this.updateScouts();
    this.cleanupProjectiles();
    this.checkTerminalConditions();
    this.publishQaState();
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    this.physics.world.setBounds(0, 0, gameSize.width, gameSize.height);
    this.#background.setPosition(gameSize.width / 2, gameSize.height / 2).setDisplaySize(gameSize.width, gameSize.height);
    this.#player.sprite.y = gameSize.height - 98;
    this.#player.clampToPlayfield();
    this.#scoreText.setPosition(gameSize.width - 36, 22);
  }

  private createScoutWave(): void {
    const columns = LEVEL_ONE_SLICE.scoutColumns;
    const rows = LEVEL_ONE_SLICE.scoutRows;
    const margin = Math.max(86, this.scale.width * 0.12);
    const gapX = (this.scale.width - margin * 2) / (columns - 1);
    const startY = Math.max(114, this.scale.height * 0.18);
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < columns; col += 1) {
        const scout = new Scout(this, margin + col * gapX, startY + row * 86);
        this.#scouts.add(scout.sprite);
      }
    }
  }

  private createHud(): void {
    this.add.image(44, 38, RUNTIME_ASSETS.ui.lifeIcon.key)
      .setDisplaySize(34, 34)
      .setDepth(10);
    this.#lifeText = this.add.text(72, 22, `LIVES ${this.#lives.value}/${this.#lives.maxLives}`, {
      color: '#d7e9ff',
      fontFamily: 'GalacticGunnersHUD, monospace',
      fontSize: '24px',
    }).setDepth(10);
    this.#scoreText = this.add.text(this.scale.width - 36, 22, 'SCORE 0', {
      color: '#f7d56a',
      fontFamily: 'GalacticGunnersHUD, monospace',
      fontSize: '24px',
    }).setOrigin(1, 0).setDepth(10);
  }

  private createCollisions(): void {
    this.physics.add.overlap(this.#playerLasers, this.#scouts, (laser, scout) => {
      this.handlePlayerLaserScoutOverlap(laser as Phaser.Physics.Arcade.Image, scout as Phaser.Physics.Arcade.Sprite);
    });
    this.physics.add.overlap(this.#enemyLasers, this.#player.sprite, (laser) => {
      this.handleEnemyLaserPlayerOverlap(laser as Phaser.Physics.Arcade.Image);
    });
    this.physics.add.overlap(this.#player.sprite, this.#scouts, (_player, scout) => {
      this.destroyScoutBody(scout as Phaser.Physics.Arcade.Sprite, false);
      this.damagePlayer(true);
    });
  }

  private handleInput(time: number): void {
    const actions = this.#inputSystem.actions;
    const direction = actions.left ? -1 : actions.right ? 1 : 0;
    this.#player.move(direction);
    if (actions.fire && this.#player.canFire(time)) {
      this.firePlayerLaser(time);
    }
    if (this.#inputSystem.consumeMuteToggle()) {
      this.#audio.toggleMute();
    }
  }

  private updateScouts(): void {
    const active = this.getActiveScouts();
    if (active.length === 0) {
      return;
    }
    const minX = Math.min(...active.map((scout) => scout.x));
    const maxX = Math.max(...active.map((scout) => scout.x));
    const hitEdge = (this.#formationDirection === 1 && maxX > this.scale.width - 58)
      || (this.#formationDirection === -1 && minX < 58);
    if (hitEdge) {
      this.#formationDirection *= -1;
      active.forEach((scout) => {
        scout.y += LEVEL_ONE_SLICE.scoutDropDistance;
      });
    }
    active.forEach((scout) => {
      scout.setVelocityX(LEVEL_ONE_SLICE.scoutHorizontalSpeed * this.#formationDirection);
      if (scout.y > this.scale.height - 92) {
        this.showTerminal('failed');
      }
    });
  }

  private firePlayerLaser(nowMs = this.time.now, x = this.#player.sprite.x, y = this.#player.sprite.y - 82): Phaser.Physics.Arcade.Image | null {
    if (!this.#player.canFire(nowMs)) {
      return null;
    }
    const laser = this.#playerLasers.get(x, y, RUNTIME_ASSETS.projectile.playerLaser.key) as Phaser.Physics.Arcade.Image | null;
    if (!laser) {
      return null;
    }
    if (Number.isFinite(nowMs)) {
      this.#player.markFired(nowMs);
    }
    this.configureLaser(laser, 'player-laser', -90, 22, 92, -LEVEL_ONE_SLICE.playerLaserSpeed);
    this.#audio.play('playerLaser');
    return laser;
  }

  private fireEnemyLaser(): Phaser.Physics.Arcade.Image | null {
    const active = this.getActiveScouts();
    if (active.length === 0 || this.#terminalState) {
      return null;
    }
    const scout = active[Math.floor(Math.random() * active.length)];
    const laser = this.#enemyLasers.get(scout.x, scout.y + 48, RUNTIME_ASSETS.projectile.enemyLaser.key) as Phaser.Physics.Arcade.Image | null;
    if (!laser) {
      return null;
    }
    this.configureLaser(laser, 'enemy-laser', 90, 22, 92, LEVEL_ONE_SLICE.enemyLaserSpeed);
    this.#audio.play('enemyLaser');
    return laser;
  }

  private configureLaser(
    laser: Phaser.Physics.Arcade.Image,
    name: string,
    angle: number,
    width: number,
    height: number,
    velocityY: number,
  ): void {
    laser.setActive(true).setVisible(true);
    laser.setName(name);
    laser.setAngle(angle);
    laser.setDisplaySize(width, height);
    laser.setDepth(3);
    laser.setData('spent', false);
    laser.setVelocity(0, velocityY);
    const body = laser.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setSize(16 / laser.scaleX, 70 / laser.scaleY, true);
  }

  private handlePlayerLaserScoutOverlap(laser: Phaser.Physics.Arcade.Image, scout: Phaser.Physics.Arcade.Sprite): void {
    if (laser.getData('spent') || scout.getData('destroyed')) {
      return;
    }
    laser.setData('spent', true);
    this.destroyProjectile(laser);
    this.destroyScoutBody(scout, true);
  }

  private handleEnemyLaserPlayerOverlap(laser: Phaser.Physics.Arcade.Image): void {
    if (laser.getData('spent')) {
      return;
    }
    laser.setData('spent', true);
    this.destroyProjectile(laser);
    this.damagePlayer();
  }

  private destroyScoutBody(scout: Phaser.Physics.Arcade.Sprite, awardScore: boolean): void {
    if (scout.getData('destroyed')) {
      return;
    }
    scout.setData('destroyed', true);
    scout.disableBody(true, true);
    if (awardScore) {
      this.#score.apply('scout_destroyed', this.time.now, { source: 'player_laser' });
      this.#scoreText.setText(`SCORE ${this.#score.value}`);
    }
    this.#audio.play('explosionSmall');
    const explosion = this.add.sprite(scout.x, scout.y, RUNTIME_ASSETS.fx.explosionSmall.key)
      .setDisplaySize(96, 96)
      .setDepth(6);
    explosion.play('fx.explosionSmall.play');
  }

  private damagePlayer(force = false): void {
    if (!force && this.time.now - this.#lastDamageAtMs < LEVEL_ONE_SLICE.playerDamageCooldownMs) {
      return;
    }
    this.#lastDamageAtMs = this.time.now;
    this.#lives.damage(1);
    this.#lifeText.setText(`LIVES ${this.#lives.value}/${this.#lives.maxLives}`);
    this.#audio.play('playerHit');
    this.cameras.main.shake(120, 0.006);
    if (this.#lives.isDepleted) {
      this.showTerminal('failed');
    }
  }

  private cleanupProjectiles(): void {
    for (const group of [this.#playerLasers, this.#enemyLasers]) {
      for (const child of group.getChildren() as Phaser.Physics.Arcade.Image[]) {
        if (child.active && (child.y < -100 || child.y > this.scale.height + 100)) {
          this.destroyProjectile(child);
        }
      }
    }
  }

  private destroyProjectile(projectile: Phaser.Physics.Arcade.Image): void {
    projectile.disableBody(true, true);
  }

  private checkTerminalConditions(): void {
    const activeScouts = this.getActiveScouts().length;
    if (activeScouts === 0) {
      this.showTerminal('complete');
    }
  }

  private showTerminal(state: TerminalState): void {
    if (this.#terminalState) {
      return;
    }
    this.#terminalState = state;
    this.#player.move(0);
    this.#playerLasers.clear(true, true);
    this.#enemyLasers.clear(true, true);
    const title = state === 'complete' ? 'MISSION CLEARED' : 'MISSION FAILED';
    const panel = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 620, 330, 0x05101f, 0.9)
      .setStrokeStyle(2, 0x7ee8ff)
      .setDepth(20);
    const text = this.add.text(this.scale.width / 2, this.scale.height / 2 - 92, `${title}\nSCORE ${this.#score.value}\nLIVES ${this.#lives.value}/${this.#lives.maxLives}`, {
      color: state === 'complete' ? '#f7d56a' : '#ff8b6e',
      fontFamily: 'GalacticGunnersGoldDisplay, Arial, sans-serif',
      fontSize: '38px',
      align: 'center',
    }).setOrigin(0.5).setDepth(21);
    const replay = this.createTerminalButton(this.scale.width / 2 - 132, this.scale.height / 2 + 104, state === 'complete' ? 'PLAY AGAIN' : 'TRY AGAIN', () => {
      this.scene.restart();
    });
    const menu = this.createTerminalButton(this.scale.width / 2 + 150, this.scale.height / 2 + 104, 'MAIN MENU', () => {
      this.scene.start('MainMenuScene');
    });
    panel.setData('qa', 'terminal-panel');
    text.setData('qa', 'terminal-text');
    replay.setData('qa', 'terminal-replay');
    menu.setData('qa', 'terminal-menu');
    void this.#session.complete({
      score: this.#score.value,
      livesUsed: this.#lives.maxLives - this.#lives.value,
      eventSummary: this.#score.eventSummary(),
    }).catch(() => undefined).finally(() => this.publishQaState());
  }

  private createTerminalButton(x: number, y: number, label: string, callback: () => void): Phaser.GameObjects.Text {
    const button = this.add.text(x, y, label, {
      color: '#d7e9ff',
      backgroundColor: '#123763',
      fontFamily: 'GalacticGunnersHUD, monospace',
      fontSize: '24px',
      padding: { x: 18, y: 12 },
    }).setOrigin(0.5).setDepth(22).setInteractive({ useHandCursor: true });
    button.on('pointerdown', callback);
    return button;
  }

  private installHostileQa(): void {
    if (!this.#runtimeConfig.hostileQa || typeof window === 'undefined') {
      return;
    }
    window.__GALACTIC_GUNNERS_HOSTILE__ = {
      firePlayerLaserAtScout: (index = 0, offsetX = 0) => {
        const scout = this.getActiveScouts()[index];
        if (!scout) {
          return { fired: false, reason: 'no-scout' };
        }
        const laser = this.firePlayerLaser(Number.POSITIVE_INFINITY, scout.x + offsetX, scout.y + 74);
        return { fired: Boolean(laser), scoutX: scout.x, laserX: laser?.x, offsetX };
      },
      fireEnemyLaserAtPlayer: (offsetX = 0) => {
        const laser = this.#enemyLasers.get(this.#player.sprite.x + offsetX, this.#player.sprite.y - 74, RUNTIME_ASSETS.projectile.enemyLaser.key) as Phaser.Physics.Arcade.Image | null;
        if (!laser) {
          return { fired: false, reason: 'no-laser' };
        }
        this.configureLaser(laser, 'enemy-laser', 90, 22, 92, LEVEL_ONE_SLICE.enemyLaserSpeed);
        return { fired: true, playerX: this.#player.sprite.x, laserX: laser.x, offsetX };
      },
      forceComplete: () => {
        this.getActiveScouts().forEach((scout) => scout.disableBody(true, true));
        this.showTerminal('complete');
      },
      forceFail: () => this.showTerminal('failed'),
      replay: () => this.scene.restart(),
      menu: () => this.scene.start('MainMenuScene'),
      state: () => this.buildQaState(),
    };
  }

  private getActiveScouts(): Phaser.Physics.Arcade.Sprite[] {
    return this.#scouts.getChildren().filter((child) => child.active) as Phaser.Physics.Arcade.Sprite[];
  }

  private publishQaState(): void {
    if (typeof window === 'undefined') {
      return;
    }
    window.__GALACTIC_GUNNERS_SLICE_QA__ = this.buildQaState();
  }

  private buildQaState(): Record<string, unknown> {
    const playerBody = this.#player?.sprite.body as Phaser.Physics.Arcade.Body | undefined;
    const visibleTexts = this.children.list
      .filter((child): child is Phaser.GameObjects.Text => child instanceof Phaser.GameObjects.Text)
      .map((text) => text.text);

    return {
      scene: 'Level1Scene',
      score: this.#score.value,
      lives: this.#lives.value,
      maxLives: this.#lives.maxLives,
      activeScouts: this.getActiveScouts().length,
      playerLaserCount: this.#playerLasers?.getChildren().filter((child) => child.active).length ?? 0,
      enemyLaserCount: this.#enemyLasers?.getChildren().filter((child) => child.active).length ?? 0,
      playerX: this.#player?.sprite.x,
      terminalState: this.#terminalState,
      gameRunId: this.#session.runId,
      offlineRunMode: this.#session.offline,
      gameRunCompleteAttempted: this.#session.completeAttempted,
      viewport: { width: this.scale.width, height: this.scale.height },
      visibleTexts,
      playerBody: playerBody ? { x: Math.round(playerBody.x), y: Math.round(playerBody.y), width: playerBody.width, height: playerBody.height } : null,
      scoutBodies: this.getActiveScouts().slice(0, 14).map((scout) => {
        const body = scout.body as Phaser.Physics.Arcade.Body;
        return {
          x: Math.round(scout.x),
          y: Math.round(scout.y),
          body: { x: Math.round(body.x), y: Math.round(body.y), width: body.width, height: body.height },
          frame: scout.frame.name,
        };
      }),
      playerLaserBodies: (this.#playerLasers?.getChildren().filter((child) => child.active) as Phaser.Physics.Arcade.Image[] ?? []).map((laser) => {
        const body = laser.body as Phaser.Physics.Arcade.Body;
        return { x: Math.round(laser.x), y: Math.round(laser.y), angle: laser.angle, body: { width: body.width, height: body.height } };
      }),
      enemyLaserBodies: (this.#enemyLasers?.getChildren().filter((child) => child.active) as Phaser.Physics.Arcade.Image[] ?? []).map((laser) => {
        const body = laser.body as Phaser.Physics.Arcade.Body;
        return { x: Math.round(laser.x), y: Math.round(laser.y), angle: laser.angle, body: { width: body.width, height: body.height } };
      }),
    };
  }
}
