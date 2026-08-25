import * as Phaser from 'phaser';

import { Player, type MovementVector } from '../entities/Player';
import { Scout } from '../entities/Scout';
import { RUNTIME_ASSETS } from '../config/assets';
import { type GameRuntimeConfig } from '../config/gameConfig';
import { LEVEL_ONE_SLICE } from '../config/levelOneSlice';
import { GameApiClient } from '../services/GameApiClient';
import { AudioSystem } from '../systems/AudioSystem';
import { GameSession } from '../systems/GameSession';
import { InputSystem } from '../systems/InputSystem';
import { LifeSystem } from '../systems/LifeSystem';
import { createPlayfieldLayout, type PlayfieldLayout } from '../systems/PlayfieldLayout';
import { ScoreSystem } from '../systems/ScoreSystem';

type TerminalState = 'complete' | 'failed';
type PlayerState = 'active' | 'hit' | 'regenerating';

const SHIELD_MATRIX = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 0, 0, 0, 0, 1, 1],
  [1, 1, 0, 0, 0, 0, 1, 1],
] as const;

interface HostileQaApi {
  firePlayerLaserAtScout: (index?: number, offsetX?: number) => Record<string, unknown>;
  fireEnemyLaserAtPlayer: (offsetX?: number) => Record<string, unknown>;
  fireEnemyLaserAtShield: (index?: number) => Record<string, unknown>;
  firePlayerLaserAtShield: (index?: number) => Record<string, unknown>;
  fireNukeAtScout: (index?: number) => Record<string, unknown>;
  setPlayerUnderScout: (index?: number, offsetX?: number) => Record<string, unknown>;
  gamepadY: () => Record<string, unknown>;
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
  #layout!: PlayfieldLayout;
  #background!: Phaser.GameObjects.Image;
  #scouts!: Phaser.Physics.Arcade.Group;
  #shieldTiles!: Phaser.Physics.Arcade.Group;
  #playerLasers!: Phaser.Physics.Arcade.Group;
  #enemyLasers!: Phaser.Physics.Arcade.Group;
  #nukes!: Phaser.Physics.Arcade.Group;
  #scoreText!: Phaser.GameObjects.Text;
  #lifeText!: Phaser.GameObjects.Text;
  #nukeText!: Phaser.GameObjects.Text;
  #rearmText!: Phaser.GameObjects.Text;
  #lastDamageAtMs = Number.NEGATIVE_INFINITY;
  #formationDirection: 1 | -1 = 1;
  #formationOffsetX = 0;
  #formationDropY = 0;
  #currentNukes: number = LEVEL_ONE_SLICE.maxNukes;
  #rearmProgress: number = LEVEL_ONE_SLICE.nukeRearmMax;
  #nukesFired = 0;
  #lastUpdateAtMs = 0;
  #terminalState: TerminalState | null = null;
  #playerState: PlayerState = 'active';
  #invulnerableUntilMs = Number.NEGATIVE_INFINITY;
  #runtimeConfig: GameRuntimeConfig = {};

  constructor() {
    super('Level1Scene');
  }

  create(): void {
    this.#runtimeConfig = this.registry.get('runtimeConfig') as GameRuntimeConfig | undefined ?? {};
    this.#layout = createPlayfieldLayout(this.scale.width, this.scale.height);
    this.#terminalState = null;
    this.#playerState = 'active';
    this.#lastDamageAtMs = Number.NEGATIVE_INFINITY;
    this.#invulnerableUntilMs = Number.NEGATIVE_INFINITY;
    this.#formationDirection = 1;
    this.#formationOffsetX = 0;
    this.#formationDropY = 0;
    this.#currentNukes = LEVEL_ONE_SLICE.maxNukes;
    this.#rearmProgress = LEVEL_ONE_SLICE.nukeRearmMax;
    this.#nukesFired = 0;
    this.#lastUpdateAtMs = 0;
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

    this.#player = new Player(this, this.#layout);
    this.#playerLasers = this.physics.add.group({ maxSize: 48 });
    this.#enemyLasers = this.physics.add.group({ maxSize: 48 });
    this.#nukes = this.physics.add.group({ maxSize: LEVEL_ONE_SLICE.maxNukes });
    this.#scouts = this.physics.add.group();
    this.#shieldTiles = this.physics.add.group();
    this.createScoutWave();
    this.createShieldZone();
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
    const deltaMs = this.#lastUpdateAtMs === 0 ? 0 : Math.max(time - this.#lastUpdateAtMs, 0);
    this.#lastUpdateAtMs = time;

    if (this.#playerState === 'regenerating' && time >= this.#invulnerableUntilMs) {
      this.#playerState = 'active';
      this.#player.sprite.setAlpha(1);
    } else if (this.#playerState === 'regenerating') {
      this.#player.sprite.setAlpha(Math.floor(time / 120) % 2 === 0 ? 0.52 : 1);
    }

    this.handleInput(time);
    this.updateNukeRearm(deltaMs);
    this.#player.clampToPlayfield(this.#layout);
    this.updateScouts(time);
    this.cleanupProjectiles();
    this.checkTerminalConditions();
    this.publishQaState();
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    this.#layout = createPlayfieldLayout(gameSize.width, gameSize.height);
    this.physics.world.setBounds(0, 0, gameSize.width, gameSize.height);
    this.#background.setPosition(gameSize.width / 2, gameSize.height / 2).setDisplaySize(gameSize.width, gameSize.height);
    this.#player.applyLayout(this.#layout);
    this.#player.clampToPlayfield(this.#layout);
    this.#scoreText.setPosition(this.#layout.hudSafeRect.x + this.#layout.hudSafeRect.width, this.#layout.hudSafeRect.y + 8);
    this.reflowScoutWave();
    this.reflowShieldZone();
    this.reflowActiveProjectiles();
    this.publishQaState();
  }

  private createScoutWave(): void {
    for (let row = 0; row < LEVEL_ONE_SLICE.scoutRows; row += 1) {
      for (let col = 0; col < LEVEL_ONE_SLICE.scoutColumns; col += 1) {
        const position = this.scoutPosition(row, col);
        const scout = new Scout(this, position.x, position.y, this.#layout);
        scout.sprite.setData('row', row);
        scout.sprite.setData('col', col);
        this.#scouts.add(scout.sprite);
      }
    }
  }

  private reflowScoutWave(): void {
    for (const scout of this.#scouts.getChildren() as Phaser.Physics.Arcade.Sprite[]) {
      if (!scout.active) {
        continue;
      }
      const row = Number(scout.getData('row'));
      const col = Number(scout.getData('col'));
      const position = this.scoutPosition(row, col);
      scout.setPosition(position.x, position.y);
      scout.setDisplaySize(this.#layout.scoutSize.width, this.#layout.scoutSize.height);
      const body = scout.body as Phaser.Physics.Arcade.Body;
      body.setSize(this.#layout.scoutBodySize.width / scout.scaleX, this.#layout.scoutBodySize.height / scout.scaleY, true);
    }
  }

  private scoutPosition(row: number, col: number): Phaser.Math.Vector2 {
    const travelMargin = this.formationTravelMargin();
    const usableWidth = Math.max(
      this.#layout.formationBounds.width - travelMargin * 2,
      this.#layout.scoutSize.width * (LEVEL_ONE_SLICE.scoutColumns - 1),
    );
    const gapX = usableWidth / (LEVEL_ONE_SLICE.scoutColumns - 1);
    const gapY = Math.max(this.#layout.scoutSize.height * 1.8, 30);
    return new Phaser.Math.Vector2(
      this.#layout.formationBounds.x + travelMargin + col * gapX + this.#formationOffsetX,
      this.#layout.formationBounds.y + row * gapY + this.#formationDropY,
    );
  }

  private formationTravelMargin(): number {
    return Math.max(this.#layout.scoutSize.width * 2.2, this.#layout.formationBounds.width * 0.055);
  }

  private createShieldZone(): void {
    const bunkerCount = LEVEL_ONE_SLICE.bunkerCount;
    const tileW = this.#layout.shieldTileSize.width;
    const tileH = this.#layout.shieldTileSize.height;
    for (let bunker = 0; bunker < bunkerCount; bunker += 1) {
      const bunkerCenterX = this.#layout.shieldZone.x + (this.#layout.shieldZone.width * (bunker + 0.5)) / bunkerCount;
      const startX = bunkerCenterX - tileW * 4;
      for (let row = 0; row < SHIELD_MATRIX.length; row += 1) {
        for (let col = 0; col < SHIELD_MATRIX[row].length; col += 1) {
          if (SHIELD_MATRIX[row][col] !== 1) {
            continue;
          }
          const tile = this.physics.add.image(startX + col * tileW + tileW / 2, this.#layout.shieldZone.y + row * tileH + tileH / 2, RUNTIME_ASSETS.shield.tile.key);
          tile.setName('shield-tile');
          tile.setData('bunker', bunker);
          tile.setData('row', row);
          tile.setData('col', col);
          tile.setDisplaySize(tileW, tileH);
          tile.setDepth(4);
          const body = tile.body as Phaser.Physics.Arcade.Body;
          body.setSize(this.#layout.shieldBodySize.width / tile.scaleX, this.#layout.shieldBodySize.height / tile.scaleY, true);
          this.#shieldTiles.add(tile);
        }
      }
    }
  }

  private reflowShieldZone(): void {
    const tileW = this.#layout.shieldTileSize.width;
    const tileH = this.#layout.shieldTileSize.height;
    for (const tile of this.#shieldTiles.getChildren() as Phaser.Physics.Arcade.Image[]) {
      if (!tile.active) {
        continue;
      }
      const bunker = Number(tile.getData('bunker'));
      const row = Number(tile.getData('row'));
      const col = Number(tile.getData('col'));
      const bunkerCenterX = this.#layout.shieldZone.x + (this.#layout.shieldZone.width * (bunker + 0.5)) / LEVEL_ONE_SLICE.bunkerCount;
      const startX = bunkerCenterX - tileW * 4;
      tile.setPosition(startX + col * tileW + tileW / 2, this.#layout.shieldZone.y + row * tileH + tileH / 2);
      tile.setDisplaySize(tileW, tileH);
      const body = tile.body as Phaser.Physics.Arcade.Body;
      body.setSize(this.#layout.shieldBodySize.width / tile.scaleX, this.#layout.shieldBodySize.height / tile.scaleY, true);
    }
  }

  private createHud(): void {
    this.add.image(this.#layout.hudSafeRect.x + 18, this.#layout.hudSafeRect.y + 24, RUNTIME_ASSETS.ui.lifeIcon.key)
      .setDisplaySize(34, 34)
      .setDepth(10);
    this.#lifeText = this.add.text(this.#layout.hudSafeRect.x + 46, this.#layout.hudSafeRect.y + 8, `LIVES ${this.#lives.value}/${this.#lives.maxLives}`, {
      color: '#d7e9ff',
      fontFamily: 'GalacticGunnersHUD, monospace',
      fontSize: '24px',
    }).setDepth(10);
    this.#scoreText = this.add.text(this.#layout.hudSafeRect.x + this.#layout.hudSafeRect.width, this.#layout.hudSafeRect.y + 8, 'SCORE 0', {
      color: '#f7d56a',
      fontFamily: 'GalacticGunnersHUD, monospace',
      fontSize: '24px',
    }).setOrigin(1, 0).setDepth(10);
    this.add.image(this.#layout.hudSafeRect.x + 18, this.#layout.hudSafeRect.y + 66, RUNTIME_ASSETS.ui.nukeIcon.key)
      .setDisplaySize(30, 30)
      .setDepth(10);
    this.#nukeText = this.add.text(this.#layout.hudSafeRect.x + 46, this.#layout.hudSafeRect.y + 52, `NUKES ${this.#currentNukes}/${LEVEL_ONE_SLICE.maxNukes}`, {
      color: '#f7d56a',
      fontFamily: 'GalacticGunnersHUD, monospace',
      fontSize: '20px',
    }).setDepth(10);
    this.#rearmText = this.add.text(this.#layout.hudSafeRect.x + 46, this.#layout.hudSafeRect.y + 78, `REARM ${Math.floor(this.#rearmProgress)}/${LEVEL_ONE_SLICE.nukeRearmMax}`, {
      color: '#d7e9ff',
      fontFamily: 'GalacticGunnersHUD, monospace',
      fontSize: '18px',
    }).setDepth(10);
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
    this.physics.add.overlap(this.#enemyLasers, this.#shieldTiles, (laser, tile) => {
      this.destroyProjectile(laser as Phaser.Physics.Arcade.Image);
      this.destroyShieldTile(tile as Phaser.Physics.Arcade.Image, true);
    });
    this.physics.add.overlap(this.#playerLasers, this.#shieldTiles, (laser, tile) => {
      this.destroyProjectile(laser as Phaser.Physics.Arcade.Image);
      this.destroyShieldTile(tile as Phaser.Physics.Arcade.Image, false);
    });
    this.physics.add.overlap(this.#nukes, this.#scouts, (nuke, scout) => {
      this.handleNukeScoutOverlap(nuke as Phaser.Physics.Arcade.Sprite, scout as Phaser.Physics.Arcade.Sprite);
    });
  }

  private handleInput(time: number): void {
    const actions = this.#inputSystem.actions;
    const vector: MovementVector = {
      x: actions.left ? -1 : actions.right ? 1 : 0,
      y: actions.up ? -1 : actions.down ? 1 : 0,
    };
    if (this.#playerState === 'hit') {
      this.#player.stop();
    } else {
      this.#player.move(vector, this.#layout);
    }
    if (actions.fire && this.#playerState !== 'hit' && this.#player.canFire(time)) {
      this.firePlayerLaser(time);
    }
    if (this.#inputSystem.consumeNuke() && this.#playerState !== 'hit') {
      this.fireNuke();
    }
    if (this.#inputSystem.consumePauseToggle()) {
      this.pauseLevel();
    }
    if (this.#inputSystem.consumeMuteToggle()) {
      this.#audio.toggleMute();
    }
  }

  private updateScouts(time: number): void {
    const active = this.getActiveScouts();
    if (active.length === 0) {
      return;
    }
    const maxTravel = this.formationTravelMargin();
    const deltaSeconds = Math.max(this.game.loop.delta, 0) / 1000;
    this.#formationOffsetX += LEVEL_ONE_SLICE.scoutHorizontalSpeed * this.#formationDirection * deltaSeconds;
    const hitEdge = Math.abs(this.#formationOffsetX) >= maxTravel;
    if (hitEdge) {
      this.#formationOffsetX = Phaser.Math.Clamp(this.#formationOffsetX, -maxTravel, maxTravel);
      this.#formationDirection *= -1;
      this.#formationDropY += LEVEL_ONE_SLICE.scoutDropDistance;
    }
    active.forEach((scout) => {
      const row = Number(scout.getData('row'));
      const col = Number(scout.getData('col'));
      const position = this.scoutPosition(row, col);
      scout.setPosition(position.x, position.y);
      scout.setVelocity(0, 0);
      if (scout.y > this.#layout.movementBounds.bottom) {
        this.showTerminal('failed');
      }
    });
    if (time % 250 < this.game.loop.delta) {
      this.publishQaState();
    }
  }

  private firePlayerLaser(nowMs = this.time.now, x = this.#player.sprite.x, y = this.#player.sprite.y - this.#layout.playerSize.height * 0.52): Phaser.Physics.Arcade.Image | null {
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
    this.configureLaser(laser, 'player-laser', -90, -this.playerLaserSpeed());
    this.#audio.play('playerLaser');
    return laser;
  }

  private playerLaserSpeed(): number {
    return this.#layout.gameplayRect.height / 3;
  }

  private enemyLaserSpeed(): number {
    return this.#layout.gameplayRect.height * 0.078125;
  }

  private fireEnemyLaser(): Phaser.Physics.Arcade.Image | null {
    const active = this.getActiveScouts();
    if (active.length === 0 || this.#terminalState) {
      return null;
    }
    const scout = active[Math.floor(Math.random() * active.length)];
    const laser = this.#enemyLasers.get(scout.x, scout.y + this.#layout.scoutSize.height * 0.55, RUNTIME_ASSETS.projectile.enemyLaser.key) as Phaser.Physics.Arcade.Image | null;
    if (!laser) {
      return null;
    }
    this.configureLaser(laser, 'enemy-laser', 90, this.enemyLaserSpeed());
    this.#audio.play('enemyLaser');
    return laser;
  }

  private configureLaser(
    laser: Phaser.Physics.Arcade.Image,
    name: string,
    angle: number,
    velocityY: number,
  ): void {
    laser.setActive(true).setVisible(true);
    laser.setName(name);
    laser.setAngle(angle);
    laser.setDisplaySize(this.#layout.projectileSize.width, this.#layout.projectileSize.height);
    laser.setDepth(3);
    laser.setData('spent', false);
    laser.setVelocity(0, velocityY);
    const body = laser.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setSize(this.#layout.projectileBodySize.width / laser.scaleX, this.#layout.projectileBodySize.height / laser.scaleY, true);
  }

  private reflowActiveProjectiles(): void {
    for (const laser of [...this.#playerLasers.getChildren(), ...this.#enemyLasers.getChildren()] as Phaser.Physics.Arcade.Image[]) {
      if (!laser.active) {
        continue;
      }
      laser.setDisplaySize(this.#layout.projectileSize.width, this.#layout.projectileSize.height);
      const body = laser.body as Phaser.Physics.Arcade.Body;
      body.setSize(this.#layout.projectileBodySize.width / laser.scaleX, this.#layout.projectileBodySize.height / laser.scaleY, true);
    }
    for (const nuke of this.#nukes.getChildren() as Phaser.Physics.Arcade.Sprite[]) {
      if (!nuke.active) {
        continue;
      }
      this.configureNukeBody(nuke);
    }
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
    this.createExplosion(scout.x, scout.y, 70);
  }

  private destroyShieldTile(tile: Phaser.Physics.Arcade.Image, scorePenalty: boolean): void {
    if (tile.getData('destroyed')) {
      return;
    }
    tile.setData('destroyed', true);
    tile.disableBody(true, true);
    if (scorePenalty) {
      this.#score.apply('shield_tile_hit', this.time.now, { source: 'enemy_laser' });
      this.#scoreText.setText(`SCORE ${this.#score.value}`);
    }
  }

  private fireNuke(x = this.#player.sprite.x, y = this.#player.sprite.y - this.#layout.playerSize.height * 0.62): Phaser.Physics.Arcade.Sprite | null {
    if (this.#currentNukes <= 0 || this.#terminalState) {
      return null;
    }
    const nuke = this.#nukes.get(x, y, RUNTIME_ASSETS.projectile.nuke.key) as Phaser.Physics.Arcade.Sprite | null;
    if (!nuke) {
      return null;
    }
    this.#currentNukes = Math.max(0, this.#currentNukes - 1);
    this.#rearmProgress = 0;
    this.#nukesFired += 1;
    this.updateNukeHud();
    nuke.setActive(true).setVisible(true);
    nuke.setName('nuke-projectile');
    nuke.setAngle(-90);
    nuke.setDisplaySize(this.#layout.nukeProjectileSize.width, this.#layout.nukeProjectileSize.height);
    nuke.setDepth(4);
    nuke.setData('spent', false);
    nuke.setVelocity(0, -this.playerLaserSpeed() * 0.72);
    nuke.play('projectile.nuke.fly');
    this.configureNukeBody(nuke);
    this.#audio.play('nukeFire');
    return nuke;
  }

  private configureNukeBody(nuke: Phaser.Physics.Arcade.Sprite): void {
    nuke.setDisplaySize(this.#layout.nukeProjectileSize.width, this.#layout.nukeProjectileSize.height);
    const body = nuke.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setSize(this.#layout.nukeProjectileBodySize.width / nuke.scaleX, this.#layout.nukeProjectileBodySize.height / nuke.scaleY, true);
  }

  private handleNukeScoutOverlap(nuke: Phaser.Physics.Arcade.Sprite, scout: Phaser.Physics.Arcade.Sprite): void {
    if (nuke.getData('spent')) {
      return;
    }
    nuke.setData('spent', true);
    this.detonateNuke(nuke.x, nuke.y);
    this.destroyProjectile(nuke);
    this.destroyScoutsInNukeBurst(scout.x, scout.y);
  }

  private detonateNuke(x: number, y: number): void {
    const burst = this.add.sprite(x, y, RUNTIME_ASSETS.fx.nukeBurst.key)
      .setDisplaySize(this.#layout.nukeBurstSize.width, this.#layout.nukeBurstSize.height)
      .setDepth(7);
    burst.play('fx.nukeBurst.play');
    this.#audio.play('nukeBurst');
  }

  private destroyScoutsInNukeBurst(x: number, y: number): number {
    const radius = this.#layout.nukeBurstSize.width * 0.48;
    let destroyed = 0;
    for (const scout of this.getActiveScouts()) {
      if (Phaser.Math.Distance.Between(x, y, scout.x, scout.y) <= radius) {
        this.destroyScoutBody(scout, true);
        destroyed += 1;
      }
    }
    return destroyed;
  }

  private updateNukeRearm(deltaMs: number): void {
    if (this.#currentNukes >= LEVEL_ONE_SLICE.maxNukes) {
      this.#rearmProgress = LEVEL_ONE_SLICE.nukeRearmMax;
      this.updateNukeHud();
      return;
    }
    this.#rearmProgress = Math.min(LEVEL_ONE_SLICE.nukeRearmMax, this.#rearmProgress + deltaMs / 50);
    if (this.#rearmProgress >= LEVEL_ONE_SLICE.nukeRearmMax) {
      this.#currentNukes = Math.min(LEVEL_ONE_SLICE.maxNukes, this.#currentNukes + 1);
      this.#rearmProgress = this.#currentNukes >= LEVEL_ONE_SLICE.maxNukes ? LEVEL_ONE_SLICE.nukeRearmMax : 0;
    }
    this.updateNukeHud();
  }

  private updateNukeHud(): void {
    this.#nukeText?.setText(`NUKES ${this.#currentNukes}/${LEVEL_ONE_SLICE.maxNukes}`);
    this.#rearmText?.setText(`REARM ${Math.floor(this.#rearmProgress)}/${LEVEL_ONE_SLICE.nukeRearmMax}`);
  }

  private pauseLevel(): void {
    this.#player.stop();
    this.scene.launch('PauseScene');
    this.scene.sleep();
  }

  private damagePlayer(force = false): void {
    if (this.#playerState !== 'active') {
      return;
    }
    if (!force && this.time.now - this.#lastDamageAtMs < LEVEL_ONE_SLICE.playerDamageCooldownMs) {
      return;
    }
    this.#lastDamageAtMs = this.time.now;
    this.#playerState = 'hit';
    this.#lives.damage(1);
    this.#lifeText.setText(`LIVES ${this.#lives.value}/${this.#lives.maxLives}`);
    this.#audio.play('playerHit');
    this.createExplosion(this.#player.sprite.x, this.#player.sprite.y, this.#layout.playerSize.height * 0.78);
    this.cameras.main.shake(120, 0.006);
    this.#player.sprite.disableBody(true, false);
    this.#player.stop();
    this.#inputSystem.resetPointerState();
    if (this.#lives.isDepleted) {
      this.showTerminal('failed');
      return;
    }
    this.time.delayedCall(420, () => this.respawnPlayer());
  }

  private respawnPlayer(): void {
    if (this.#terminalState) {
      return;
    }
    this.#playerState = 'regenerating';
    this.#player.respawn(this.#layout);
    this.#inputSystem.resetPointerState();
    this.#invulnerableUntilMs = this.time.now + 1200;
    this.publishQaState();
  }

  private createExplosion(x: number, y: number, size: number): void {
    const explosion = this.add.sprite(x, y, RUNTIME_ASSETS.fx.explosionSmall.key)
      .setDisplaySize(size, size)
      .setDepth(6);
    explosion.play('fx.explosionSmall.play');
  }

  private cleanupProjectiles(): void {
    for (const group of [this.#playerLasers, this.#enemyLasers]) {
      for (const child of group.getChildren() as Phaser.Physics.Arcade.Image[]) {
        if (child.active && (child.y < -100 || child.y > this.scale.height + 100)) {
          this.destroyProjectile(child);
        }
      }
    }
    for (const nuke of this.#nukes.getChildren() as Phaser.Physics.Arcade.Sprite[]) {
      if (nuke.active && nuke.y < -100) {
        this.detonateNuke(nuke.x, Math.max(40, nuke.y));
        this.destroyProjectile(nuke);
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
    this.#player.stop();
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
        const laser = this.firePlayerLaser(Number.POSITIVE_INFINITY, scout.x + offsetX, scout.y + this.#layout.scoutSize.height * 0.95);
        return { fired: Boolean(laser), scoutX: scout.x, laserX: laser?.x, offsetX };
      },
      fireEnemyLaserAtPlayer: (offsetX = 0) => {
        const laser = this.#enemyLasers.get(this.#player.sprite.x + offsetX, this.#player.sprite.y - this.#layout.playerSize.height * 0.42, RUNTIME_ASSETS.projectile.enemyLaser.key) as Phaser.Physics.Arcade.Image | null;
        if (!laser) {
          return { fired: false, reason: 'no-laser' };
        }
        this.configureLaser(laser, 'enemy-laser', 90, this.enemyLaserSpeed());
        return { fired: true, playerX: this.#player.sprite.x, laserX: laser.x, offsetX };
      },
      fireEnemyLaserAtShield: (index = 0) => {
        const tile = this.getActiveShieldTiles()[index];
        if (!tile) {
          return { fired: false, reason: 'no-shield' };
        }
        const laser = this.#enemyLasers.get(tile.x, tile.y - this.#layout.projectileSize.height * 0.62, RUNTIME_ASSETS.projectile.enemyLaser.key) as Phaser.Physics.Arcade.Image | null;
        if (!laser) {
          return { fired: false, reason: 'no-laser' };
        }
        this.configureLaser(laser, 'enemy-laser', 90, this.enemyLaserSpeed());
        return { fired: true, tileX: tile.x, laserX: laser.x };
      },
      firePlayerLaserAtShield: (index = 0) => {
        const tile = this.getActiveShieldTiles()[index];
        if (!tile) {
          return { fired: false, reason: 'no-shield' };
        }
        const laser = this.firePlayerLaser(Number.POSITIVE_INFINITY, tile.x, tile.y + this.#layout.projectileSize.height * 0.62);
        return { fired: Boolean(laser), tileX: tile.x, laserX: laser?.x };
      },
      fireNukeAtScout: (index = 0) => {
        const scout = this.getActiveScouts()[index];
        if (!scout) {
          return { fired: false, reason: 'no-scout' };
        }
        const nuke = this.fireNuke(scout.x, scout.y + this.#layout.scoutSize.height * 1.8);
        return { fired: Boolean(nuke), scoutX: scout.x, nukeX: nuke?.x, currentNukes: this.#currentNukes };
      },
      setPlayerUnderScout: (index = 0, offsetX = 0) => {
        const scout = this.getActiveScouts()[index];
        if (!scout) {
          return { moved: false, reason: 'no-scout' };
        }
        const x = Phaser.Math.Clamp(scout.x + offsetX, this.#layout.movementBounds.left, this.#layout.movementBounds.right);
        this.#player.sprite.setPosition(x, this.#player.sprite.y);
        this.#player.clampToPlayfield(this.#layout);
        return { moved: true, playerX: this.#player.sprite.x, scoutX: scout.x, offsetX };
      },
      gamepadY: () => {
        const nuke = this.fireNuke();
        return { consumed: Boolean(nuke), currentNukes: this.#currentNukes, nukeCount: this.#nukes.getChildren().filter((child) => child.active).length };
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

  private getActiveShieldTiles(): Phaser.Physics.Arcade.Image[] {
    return this.#shieldTiles.getChildren().filter((child) => child.active) as Phaser.Physics.Arcade.Image[];
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
    const playerVelocity = playerBody?.velocity;

    return {
      scene: 'Level1Scene',
      score: this.#score.value,
      lives: this.#lives.value,
      maxLives: this.#lives.maxLives,
      activeScouts: this.getActiveScouts().length,
      activeShieldTiles: this.getActiveShieldTiles().length,
      bunkerCount: LEVEL_ONE_SLICE.bunkerCount,
      playerLaserCount: this.#playerLasers?.getChildren().filter((child) => child.active).length ?? 0,
      enemyLaserCount: this.#enemyLasers?.getChildren().filter((child) => child.active).length ?? 0,
      nukeProjectileCount: this.#nukes?.getChildren().filter((child) => child.active).length ?? 0,
      currentNukes: this.#currentNukes,
      maxNukes: LEVEL_ONE_SLICE.maxNukes,
      rearmProgress: Math.floor(this.#rearmProgress),
      rearmMax: LEVEL_ONE_SLICE.nukeRearmMax,
      nukesFired: this.#nukesFired,
      playerX: this.#player?.sprite.x,
      playerY: this.#player?.sprite.y,
      playerState: this.#playerState,
      playerVisible: this.#player?.sprite.visible,
      playerAlpha: this.#player?.sprite.alpha,
      playerVelocity: playerVelocity ? { x: Math.round(playerVelocity.x), y: Math.round(playerVelocity.y), speed: Math.round(Math.hypot(playerVelocity.x, playerVelocity.y)) } : null,
      terminalState: this.#terminalState,
      gameRunId: this.#session.runId,
      offlineRunMode: this.#session.offline,
      gameRunCompleteAttempted: this.#session.completeAttempted,
      viewport: this.#layout.viewport,
      gameplayRect: this.#layout.gameplayRect,
      hudSafeRect: this.#layout.hudSafeRect,
      movementBounds: this.#layout.movementBounds,
      formationBounds: this.#layout.formationBounds,
      formationOffsetX: Math.round(this.#formationOffsetX),
      formationDropY: Math.round(this.#formationDropY),
      formationDirection: this.#formationDirection,
      formationTravelMargin: Math.round(this.formationTravelMargin()),
      shieldZone: this.#layout.shieldZone,
      playerSpawn: this.#layout.playerSpawn,
      playerSize: this.#layout.playerSize,
      scoutSize: this.#layout.scoutSize,
      projectileSize: this.#layout.projectileSize,
      nukeProjectileSize: this.#layout.nukeProjectileSize,
      nukeBurstSize: this.#layout.nukeBurstSize,
      shieldTileSize: this.#layout.shieldTileSize,
      laserSourceDimensions: {
        player: { width: 1912, height: 823 },
        enemy: { width: 1536, height: 1024 },
      },
      projectileSpeeds: {
        player: Math.round(this.playerLaserSpeed()),
        enemy: Math.round(this.enemyLaserSpeed()),
      },
      shieldBottomGapPlayerHeights: (this.#layout.movementBounds.bottom - (this.#layout.shieldZone.y + this.#layout.shieldZone.height)) / this.#layout.playerSize.height,
      visibleTexts,
      playerBody: playerBody ? { x: Math.round(playerBody.x), y: Math.round(playerBody.y), width: Math.round(playerBody.width), height: Math.round(playerBody.height) } : null,
      playerCount: this.children.list.filter((child) => child.name === 'player').length,
      scoutBodies: this.getActiveScouts().map((scout) => {
        const body = scout.body as Phaser.Physics.Arcade.Body;
        return {
          x: Math.round(scout.x),
          y: Math.round(scout.y),
          body: { x: Math.round(body.x), y: Math.round(body.y), width: Math.round(body.width), height: Math.round(body.height) },
          frame: scout.frame.name,
          row: scout.getData('row'),
          col: scout.getData('col'),
        };
      }),
      shieldBodies: this.getActiveShieldTiles().map((tile) => {
        const body = tile.body as Phaser.Physics.Arcade.Body;
        return { x: Math.round(tile.x), y: Math.round(tile.y), body: { x: Math.round(body.x), y: Math.round(body.y), width: Math.round(body.width), height: Math.round(body.height) } };
      }),
      playerLaserBodies: (this.#playerLasers?.getChildren().filter((child) => child.active) as Phaser.Physics.Arcade.Image[] ?? []).map((laser) => {
        const body = laser.body as Phaser.Physics.Arcade.Body;
        const bounds = laser.getBounds();
        return { x: Math.round(laser.x), y: Math.round(laser.y), angle: laser.angle, display: { width: Math.round(laser.displayWidth), height: Math.round(laser.displayHeight) }, worldBounds: { width: Math.round(bounds.width), height: Math.round(bounds.height) }, body: { width: Math.round(body.width), height: Math.round(body.height) } };
      }),
      enemyLaserBodies: (this.#enemyLasers?.getChildren().filter((child) => child.active) as Phaser.Physics.Arcade.Image[] ?? []).map((laser) => {
        const body = laser.body as Phaser.Physics.Arcade.Body;
        const bounds = laser.getBounds();
        return { x: Math.round(laser.x), y: Math.round(laser.y), angle: laser.angle, display: { width: Math.round(laser.displayWidth), height: Math.round(laser.displayHeight) }, worldBounds: { width: Math.round(bounds.width), height: Math.round(bounds.height) }, body: { width: Math.round(body.width), height: Math.round(body.height) } };
      }),
      nukeBodies: (this.#nukes?.getChildren().filter((child) => child.active) as Phaser.Physics.Arcade.Sprite[] ?? []).map((nuke) => {
        const body = nuke.body as Phaser.Physics.Arcade.Body;
        const bounds = nuke.getBounds();
        return { x: Math.round(nuke.x), y: Math.round(nuke.y), angle: nuke.angle, display: { width: Math.round(nuke.displayWidth), height: Math.round(nuke.displayHeight) }, worldBounds: { width: Math.round(bounds.width), height: Math.round(bounds.height) }, body: { width: Math.round(body.width), height: Math.round(body.height) } };
      }),
    };
  }
}
