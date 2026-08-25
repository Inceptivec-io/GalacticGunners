import * as Phaser from 'phaser';

import { Player } from '../entities/Player';
import { Scout } from '../entities/Scout';
import { RUNTIME_ASSETS } from '../config/assets';
import { GAME_HEIGHT, GAME_WIDTH, type GameRuntimeConfig } from '../config/gameConfig';
import { LEVEL_ONE_SLICE } from '../config/levelOneSlice';
import { GameApiClient } from '../services/GameApiClient';
import { AudioSystem } from '../systems/AudioSystem';
import { GameSession } from '../systems/GameSession';
import { LifeSystem } from '../systems/LifeSystem';
import { ScoreSystem } from '../systems/ScoreSystem';

type TerminalState = 'complete' | 'failed';

declare global {
  interface Window {
    __GALACTIC_GUNNERS_SLICE_QA__?: Record<string, unknown>;
  }
}

export class Level1Scene extends Phaser.Scene {
  #player!: Player;
  #score!: ScoreSystem;
  #lives!: LifeSystem;
  #audio!: AudioSystem;
  #session!: GameSession;
  #scouts!: Phaser.Physics.Arcade.Group;
  #playerLasers!: Phaser.Physics.Arcade.Group;
  #enemyLasers!: Phaser.Physics.Arcade.Group;
  #scoreText!: Phaser.GameObjects.Text;
  #lifeText!: Phaser.GameObjects.Text;
  #lastDamageAtMs = Number.NEGATIVE_INFINITY;
  #formationDirection: 1 | -1 = 1;
  #terminalState: TerminalState | null = null;

  constructor() {
    super('Level1Scene');
  }

  create(): void {
    this.#score = new ScoreSystem();
    this.#lives = new LifeSystem(LEVEL_ONE_SLICE.initialLives);
    this.#audio = new AudioSystem((cue) => this.sound.play(RUNTIME_ASSETS.audio[cue].key));
    const runtimeConfig = this.registry.get('runtimeConfig') as GameRuntimeConfig | undefined;
    this.#session = new GameSession(runtimeConfig?.apiBaseUrl ? new GameApiClient(runtimeConfig.apiBaseUrl) : null);
    void this.#session.start().finally(() => this.publishQaState());

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, RUNTIME_ASSETS.background.starfield.key)
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
      .setDepth(0);

    this.#player = new Player(this, GAME_WIDTH / 2, GAME_HEIGHT - 98);
    this.#playerLasers = this.physics.add.group({ maxSize: 24 });
    this.#enemyLasers = this.physics.add.group({ maxSize: 24 });
    this.#scouts = this.physics.add.group();
    this.createScoutWave();
    this.createHud();
    this.createCollisions();

    this.time.addEvent({
      delay: LEVEL_ONE_SLICE.scoutFireIntervalMs,
      loop: true,
      callback: () => this.fireEnemyLaser(),
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.#terminalState) {
        return;
      }
      if (pointer.y > GAME_HEIGHT * 0.62) {
        this.#player.move(pointer.x < this.#player.sprite.x ? -1 : 1);
      }
      this.firePlayerLaser();
    });
    this.input.on('pointerup', () => this.#player.move(0));
    this.input.keyboard?.on('keydown-M', () => this.#audio.toggleMute());
  }

  update(time: number): void {
    if (this.#terminalState) {
      return;
    }
    this.handleInput(time);
    this.#player.clampToPlayfield();
    this.updateScouts();
    this.resolveProjectileCollisions();
    this.cleanupProjectiles();
    this.checkTerminalConditions();
    this.publishQaState();
  }

  private createScoutWave(): void {
    const columns = LEVEL_ONE_SLICE.scoutColumns;
    const rows = LEVEL_ONE_SLICE.scoutRows;
    const left = 154;
    const gapX = (GAME_WIDTH - left * 2) / (columns - 1);
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < columns; col += 1) {
        const scout = new Scout(this, left + col * gapX, 126 + row * 84);
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
    this.#scoreText = this.add.text(GAME_WIDTH - 36, 22, 'SCORE 0', {
      color: '#f7d56a',
      fontFamily: 'GalacticGunnersHUD, monospace',
      fontSize: '24px',
    }).setOrigin(1, 0).setDepth(10);
  }

  private createCollisions(): void {
    this.physics.add.overlap(this.#playerLasers, this.#scouts, (laser, scout) => {
      this.destroyProjectile(laser as Phaser.Physics.Arcade.Image);
      this.destroyScout(scout as Phaser.Physics.Arcade.Image);
    });
    this.physics.add.overlap(this.#enemyLasers, this.#player.sprite, (laser) => {
      this.destroyProjectile(laser as Phaser.Physics.Arcade.Image);
      this.damagePlayer();
    });
    this.physics.add.overlap(this.#player.sprite, this.#scouts, (_player, scout) => {
      (scout as Phaser.Physics.Arcade.Image).disableBody(true, true);
      this.damagePlayer(true);
    });
  }

  private handleInput(time: number): void {
    const keyboard = this.input.keyboard;
    const cursors = keyboard?.createCursorKeys();
    const leftDown = Boolean(cursors?.left.isDown || keyboard?.addKey('A').isDown);
    const rightDown = Boolean(cursors?.right.isDown || keyboard?.addKey('D').isDown);
    const fireDown = Boolean(cursors?.space.isDown || keyboard?.addKey('W').isDown);
    const pad = this.input.gamepad?.getPad(0);
    const axis = pad?.axes[0]?.getValue() ?? 0;
    const padLeft = axis < -0.35 || Boolean(pad?.buttons[14]?.pressed);
    const padRight = axis > 0.35 || Boolean(pad?.buttons[15]?.pressed);
    const padFire = Boolean(pad?.buttons[0]?.pressed || pad?.buttons[2]?.pressed);

    const direction = leftDown || padLeft ? -1 : rightDown || padRight ? 1 : 0;
    this.#player.move(direction);
    if ((fireDown || padFire) && this.#player.canFire(time)) {
      this.firePlayerLaser(time);
    }
  }

  private updateScouts(): void {
    const active = this.#scouts.getChildren().filter((child) => child.active) as Phaser.Physics.Arcade.Image[];
    if (active.length === 0) {
      return;
    }
    const minX = Math.min(...active.map((scout) => scout.x));
    const maxX = Math.max(...active.map((scout) => scout.x));
    const hitEdge = (this.#formationDirection === 1 && maxX > GAME_WIDTH - 64)
      || (this.#formationDirection === -1 && minX < 64);
    if (hitEdge) {
      this.#formationDirection *= -1;
      active.forEach((scout) => {
        scout.y += LEVEL_ONE_SLICE.scoutDropDistance;
      });
    }
    active.forEach((scout) => {
      scout.setVelocityX(LEVEL_ONE_SLICE.scoutHorizontalSpeed * this.#formationDirection);
      if (scout.y > GAME_HEIGHT - 112) {
        this.showTerminal('failed');
      }
    });
  }

  private firePlayerLaser(nowMs = this.time.now): void {
    if (!this.#player.canFire(nowMs)) {
      return;
    }
    const laser = this.#playerLasers.get(this.#player.sprite.x, this.#player.sprite.y - 78, RUNTIME_ASSETS.projectile.playerLaser.key) as Phaser.Physics.Arcade.Image | null;
    if (!laser) {
      return;
    }
    this.#player.markFired(nowMs);
    laser.setActive(true).setVisible(true);
    laser.setName('player-laser');
    laser.setAngle(-90);
    laser.setDisplaySize(18, 70);
    laser.setDepth(3);
    laser.setVelocityY(-LEVEL_ONE_SLICE.playerLaserSpeed);
    const body = laser.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setSize(16, 58);
    body.setOffset(948, 382);
    this.#audio.play('playerLaser');
  }

  private fireEnemyLaser(): void {
    const active = this.#scouts.getChildren().filter((child) => child.active) as Phaser.Physics.Arcade.Image[];
    if (active.length === 0 || this.#terminalState) {
      return;
    }
    const scout = active[Math.floor(Math.random() * active.length)];
    const laser = this.#enemyLasers.get(scout.x, scout.y + 48, RUNTIME_ASSETS.projectile.enemyLaser.key) as Phaser.Physics.Arcade.Image | null;
    if (!laser) {
      return;
    }
    laser.setActive(true).setVisible(true);
    laser.setName('enemy-laser');
    laser.setAngle(90);
    laser.setDisplaySize(18, 70);
    laser.setDepth(3);
    laser.setVelocityY(LEVEL_ONE_SLICE.enemyLaserSpeed);
    const body = laser.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setSize(16, 58);
    body.setOffset(760, 482);
    this.#audio.play('enemyLaser');
  }

  private destroyScout(scout: Phaser.Physics.Arcade.Image): void {
    scout.disableBody(true, true);
    this.#score.apply('scout_destroyed', this.time.now, { source: 'player_laser' });
    this.#scoreText.setText(`SCORE ${this.#score.value}`);
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
        if (child.active && (child.y < -80 || child.y > GAME_HEIGHT + 80)) {
          this.destroyProjectile(child);
        }
      }
    }
  }

  private resolveProjectileCollisions(): void {
    const playerLasers = this.#playerLasers.getChildren().filter((child) => child.active) as Phaser.Physics.Arcade.Image[];
    const enemyLasers = this.#enemyLasers.getChildren().filter((child) => child.active) as Phaser.Physics.Arcade.Image[];
    const scouts = this.#scouts.getChildren().filter((child) => child.active) as Phaser.Physics.Arcade.Image[];

    for (const laser of playerLasers) {
      for (const scout of scouts) {
        if (laser.active && scout.active && this.withinCollisionEnvelope(laser, scout, 116, 96)) {
          this.destroyProjectile(laser);
          this.destroyScout(scout);
        }
      }
    }

    for (const laser of enemyLasers) {
      if (laser.active && this.withinCollisionEnvelope(laser, this.#player.sprite, 82, 118)) {
        this.destroyProjectile(laser);
        this.damagePlayer();
      }
    }
  }

  private withinCollisionEnvelope(
    projectile: Phaser.Physics.Arcade.Image,
    target: Phaser.Physics.Arcade.Image,
    halfWidth: number,
    halfHeight: number,
  ): boolean {
    return Math.abs(projectile.x - target.x) <= halfWidth && Math.abs(projectile.y - target.y) <= halfHeight;
  }

  private destroyProjectile(projectile: Phaser.Physics.Arcade.Image): void {
    projectile.disableBody(true, true);
  }

  private checkTerminalConditions(): void {
    const activeScouts = this.#scouts.getChildren().filter((child) => child.active).length;
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
    const title = state === 'complete' ? 'SLICE COMPLETE' : 'SLICE FAILED';
    const panel = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 620, 330, 0x05101f, 0.9)
      .setStrokeStyle(2, 0x7ee8ff)
      .setDepth(20);
    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 92, `${title}\nSCORE ${this.#score.value}\nLIVES ${this.#lives.value}/${this.#lives.maxLives}`, {
      color: state === 'complete' ? '#f7d56a' : '#ff8b6e',
      fontFamily: 'GalacticGunnersGoldDisplay, Arial, sans-serif',
      fontSize: '38px',
      align: 'center',
    }).setOrigin(0.5).setDepth(21);
    const replay = this.createTerminalButton(GAME_WIDTH / 2 - 132, GAME_HEIGHT / 2 + 104, state === 'complete' ? 'REPLAY SLICE' : 'RETRY SLICE', () => {
      this.scene.restart();
    });
    const menu = this.createTerminalButton(GAME_WIDTH / 2 + 150, GAME_HEIGHT / 2 + 104, 'MAIN MENU', () => {
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

  private publishQaState(): void {
    if (typeof window === 'undefined') {
      return;
    }
    window.__GALACTIC_GUNNERS_SLICE_QA__ = {
      scene: 'Level1Scene',
      score: this.#score.value,
      lives: this.#lives.value,
      maxLives: this.#lives.maxLives,
      activeScouts: this.#scouts?.getChildren().filter((child) => child.active).length ?? 0,
      playerLaserCount: this.#playerLasers?.getChildren().filter((child) => child.active).length ?? 0,
      enemyLaserCount: this.#enemyLasers?.getChildren().filter((child) => child.active).length ?? 0,
      playerX: this.#player?.sprite.x,
      activeScoutPositions: this.#scouts?.getChildren()
        .filter((child) => child.active)
        .slice(0, 14)
        .map((child) => ({ x: Math.round((child as Phaser.Physics.Arcade.Image).x), y: Math.round((child as Phaser.Physics.Arcade.Image).y) })) ?? [],
      playerLaserPositions: this.#playerLasers?.getChildren()
        .filter((child) => child.active)
        .map((child) => ({ x: Math.round((child as Phaser.Physics.Arcade.Image).x), y: Math.round((child as Phaser.Physics.Arcade.Image).y) })) ?? [],
      terminalState: this.#terminalState,
      gameRunId: this.#session.runId,
      offlineRunMode: this.#session.offline,
      gameRunCompleteAttempted: this.#session.completeAttempted,
    };
  }
}
