import * as Phaser from 'phaser';

import { Player, type MovementVector } from '../entities/Player';
import { hostileDisplaySize, Scout } from '../entities/Scout';
import { RUNTIME_ASSETS } from '../config/assets';
import { type GameRuntimeConfig } from '../config/gameConfig';
import { LEVEL_ONE_SLICE } from '../config/levelOneSlice';
import { GameApiClient } from '../services/GameApiClient';
import { AudioSystem } from '../systems/AudioSystem';
import { GameSession } from '../systems/GameSession';
import { CampaignSession } from '../systems/CampaignSession';
import { InputSystem } from '../systems/InputSystem';
import { LifeSystem } from '../systems/LifeSystem';
import { PickupSystem, type PickupType } from '../systems/PickupSystem';
import { SeededRng } from '../systems/SeededRng';
import { createPlayfieldLayout, type PlayfieldLayout } from '../systems/PlayfieldLayout';
import { ScoreSystem } from '../systems/ScoreSystem';
import { CombatLevelScene } from './CombatLevelScene';
import type { LevelDefinition } from '../levels/LevelDefinition';
import type { LevelAuthoringDocument } from '../levels/LevelAuthoringDocument';
import type { LevelRuntimeConfig } from '../levels/LevelRuntimeConfig';
import { CAMPAIGN_DEFINITIONS } from '../levels/campaignDefinitions';
import { validateLevelDefinition } from '../levels/LevelValidator';
import { compileLevelDocument } from '../levels/LevelCompiler';

type TerminalState = 'complete' | 'failed';
type PlayerState = 'active' | 'hit' | 'regenerating';
type TerminalAction = 'continue' | 'replay' | 'try-again' | 'menu';
type CampaignRuntimeState = { sequence: number; score: number; lives: number; nukes: number };
type SweptHitTarget =
  | { kind: 'player'; body: Phaser.Physics.Arcade.Body }
  | { kind: 'scout'; body: Phaser.Physics.Arcade.Body; scout: Phaser.Physics.Arcade.Sprite }
  | { kind: 'shield'; body: Phaser.Physics.Arcade.Body; tile: Phaser.Physics.Arcade.Image }
  | { kind: 'hazard'; body: Phaser.Physics.Arcade.Body; hazard: Phaser.Physics.Arcade.Sprite };
type RuntimeHazardEmitter = {
  id: string;
  hazard_type: 'ASTEROID' | 'COMET';
  initial_count: number;
  maximum_active: number;
  spawn_interval_ms: number;
  speed_min: number;
  speed_max: number;
  angular_velocity_min: number;
  angular_velocity_max: number;
  entry_edges: Array<'TOP' | 'RIGHT' | 'BOTTOM' | 'LEFT'>;
  spawn_pattern: string;
  spawn_points: Array<{ x: number; y: number }>;
  despawn_margin: number;
};

const SHIELD_MATRIX = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 0, 0, 0, 0, 1, 1],
  [1, 1, 0, 0, 0, 0, 1, 1],
] as const;

interface HostileQaApi {
  firePlayerLaserAtScout: (index?: number, offsetX?: number) => Record<string, unknown>;
  firePlayerLaserForVisual: (offsetX?: number) => Record<string, unknown>;
  fireEnemyLaserAtPlayer: (offsetX?: number) => Record<string, unknown>;
  fireEnemyLaserAtShield: (index?: number) => Record<string, unknown>;
  firePlayerLaserAtShield: (index?: number) => Record<string, unknown>;
  fireNukeAtScout: (index?: number) => Record<string, unknown>;
  verifyPlayerLaserPool: () => Record<string, unknown>[];
  verifyNukePool: () => Record<string, unknown>[];
  verifyNukeAmmoGuard: () => Record<string, unknown>;
  verifyNukeRearmLifecycle: () => Record<string, unknown>;
  setPlayerUnderScout: (index?: number, offsetX?: number) => Record<string, unknown>;
  gamepadY: () => Record<string, unknown>;
  forceComplete: () => void;
  forceFail: () => void;
  continueCampaign: () => void;
  replay: () => void;
  menu: () => void;
  triggerBoarding: () => Record<string, unknown>;
  state: () => Record<string, unknown>;
}

declare global {
  interface Window {
    __GALACTIC_GUNNERS_SLICE_QA__?: Record<string, unknown>;
    __GALACTIC_GUNNERS_HOSTILE__?: HostileQaApi;
  }
}

export class Level1Scene extends CombatLevelScene {
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
  #hazards!: Phaser.Physics.Arcade.Group;
  #pickups!: Phaser.Physics.Arcade.Group;
  #pickupSystem!: PickupSystem;
  #pickupCounts = new Map<PickupType, number>();
  #lifeIcons: Phaser.GameObjects.Image[] = [];
  #soundIcon!: Phaser.GameObjects.Image;
  #scoreText!: Phaser.GameObjects.Text;
  #nukeIcons: Phaser.GameObjects.Image[] = [];
  #rearmText!: Phaser.GameObjects.Text;
  #rearmBarBack!: Phaser.GameObjects.Rectangle;
  #rearmBarFill!: Phaser.GameObjects.Rectangle;
  #lastDamageAtMs = Number.NEGATIVE_INFINITY;
  #respawnAtMs = Number.POSITIVE_INFINITY;
  #formationDirection: 1 | -1 = 1;
  #formationOffsetX = 0;
  #formationDropY = 0;
  #currentNukes: number = LEVEL_ONE_SLICE.maxNukes;
  #rearmProgress: number = LEVEL_ONE_SLICE.nukeRearmMax;
  #nukesFired = 0;
  #lastUpdateAtMs = 0;
  #pauseInputBlockedUntilMs = 0;
  #terminalState: TerminalState | null = null;
  #playerState: PlayerState = 'active';
  #invulnerableUntilMs = Number.NEGATIVE_INFINITY;
  #runtimeConfig: GameRuntimeConfig = {};
  #definition!: LevelDefinition;
  #campaignSequence = 1;
  #terminalActions: Array<{ action: TerminalAction; x: number; y: number; width: number; height: number; source: 'production-asset' | 'production-derived' }> = [];
  #terminalActionHandled = false;
  #boardingActive = false;
  #campaignSession: CampaignSession | null = null;
  #hazardEmitterState = new Map<string, { emitted: number; nextAtMs: number }>();
  #lastMothershipDeployAtMs = Number.NEGATIVE_INFINITY;
  #enemyFireOrdinal = 0;
  #levelStartedAtMs = 0;
  #entryScore = 0;

  constructor() {
    super('Level1Scene');
  }

  init(data: { sequence?: number } = {}): void {
    this.#campaignSequence = data.sequence ?? 1;
  }

  create(): void {
    this.#runtimeConfig = this.registry.get('runtimeConfig') as GameRuntimeConfig | undefined ?? {};
    this.#levelStartedAtMs = this.time.now;
    this.#campaignSession = this.registry.get('campaignSession') as CampaignSession | undefined ?? null;
    const campaignRuntime = this.registry.get('campaignRuntime') as LevelRuntimeConfig[] | undefined ?? [];
    const packagedDefinition = CAMPAIGN_DEFINITIONS.find((definition) => definition.sequence === this.#campaignSequence);
    const configuredRuntime = campaignRuntime.find((runtime) => runtime.definition.sequence === this.#campaignSequence);
    if (!packagedDefinition && !configuredRuntime) {
      throw new Error(`Campaign sequence ${this.#campaignSequence} is not defined.`);
    }
    this.levelRuntime = configuredRuntime
      ?? (this.#campaignSequence === 1 ? this.registry.get('levelRuntime') as LevelRuntimeConfig | undefined ?? null : null);
    this.#definition = this.levelRuntime?.definition ?? packagedDefinition!;
    validateLevelDefinition(this.#definition);
    this.#layout = createPlayfieldLayout(this.scale.width, this.scale.height);
    this.#terminalState = null;
    this.#playerState = 'active';
    this.#lastDamageAtMs = Number.NEGATIVE_INFINITY;
    this.#invulnerableUntilMs = Number.NEGATIVE_INFINITY;
    this.#respawnAtMs = Number.POSITIVE_INFINITY;
    this.#formationDirection = 1;
    this.#formationOffsetX = 0;
    this.#formationDropY = 0;
    this.#enemyFireOrdinal = 0;
    const campaignState = this.registry.get('campaignState') as CampaignRuntimeState | undefined;
    this.#currentNukes = campaignState?.sequence === this.#campaignSequence ? campaignState.nukes : LEVEL_ONE_SLICE.maxNukes;
    this.#rearmProgress = LEVEL_ONE_SLICE.nukeRearmMax;
    this.#nukesFired = 0;
    this.#lastUpdateAtMs = 0;
    this.#pauseInputBlockedUntilMs = 0;
    this.#terminalActions = [];
    this.#terminalActionHandled = false;
    this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);

    this.#score = new ScoreSystem();
    this.#lives = new LifeSystem(LEVEL_ONE_SLICE.initialLives);
    if (campaignState?.sequence === this.#campaignSequence) {
      this.#score.restore(campaignState.score);
      this.#lives.restore(campaignState.lives);
    }
    this.#entryScore = this.#score.value;
    this.#audio = new AudioSystem((cue) => this.sound.play(RUNTIME_ASSETS.audio[cue].key));
    const campaignRun = this.#campaignSession?.run;
    this.#session = new GameSession(this.#runtimeConfig.apiBaseUrl ? new GameApiClient(this.#runtimeConfig.apiBaseUrl) : null, {
      slug: this.#definition.slug,
      version: this.levelRuntime?.version ?? this.#definition.version,
      checksum: this.levelRuntime?.checksum ?? '',
      seed: this.#definition.seed,
    }, campaignRun?.entry ? {
      runId: campaignRun.id,
      entryId: campaignRun.entry.id,
      capability: campaignRun.capability,
    } : null);
    this.#inputSystem = new InputSystem(this);
    void this.#session.start().finally(() => this.publishQaState());

    this.#background = this.add.image(this.scale.width / 2, this.scale.height / 2, RUNTIME_ASSETS.background.starfield.key)
      .setDisplaySize(this.scale.width, this.scale.height)
      .setDepth(0);

    this.#player = new Player(this, this.#layout, {
      x: (this.#definition.player.x / 1280) * this.scale.width,
      y: (this.#definition.player.y / 720) * this.scale.height,
    });
    this.#playerLasers = this.physics.add.group({ maxSize: 48 });
    this.#enemyLasers = this.physics.add.group({ maxSize: 48 });
    this.#nukes = this.physics.add.group({ maxSize: LEVEL_ONE_SLICE.maxNukes });
    this.#scouts = this.physics.add.group();
    this.#hazards = this.physics.add.group();
    this.#pickups = this.physics.add.group({ maxSize: 12 });
    this.#pickupSystem = new PickupSystem(new SeededRng(this.#definition.seed));
    this.#pickupCounts.clear();
    this.#shieldTiles = this.physics.add.group();
    this.createScoutWave();
    this.createHazards();
    this.createShieldZone();
    this.createHud();
    this.createLevelEntryNotice();
      this.createCollisions();
      this.events.on('resume', this.handleBoardingReturn, this);
      this.installHostileQa();

    this.time.addEvent({
      delay: LEVEL_ONE_SLICE.scoutFireIntervalMs,
      loop: true,
      // Hostile cases place their own projectile deterministically. Ambient fire
      // would otherwise mutate the initial golden shield topology before capture.
      callback: () => { if (!this.#runtimeConfig.hostileQa) this.fireEnemyLaser(); },
    });

    this.scale.on('resize', this.handleResize, this);
    this.input.keyboard?.on('keydown-P', this.handlePauseKeyDown, this);
    this.events.on('resume', this.handleResume, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.handleResize, this);
      this.input.keyboard?.off('keydown-P', this.handlePauseKeyDown, this);
      this.events.off('resume', this.handleResume, this);
      if (typeof window !== 'undefined') {
        delete window.__GALACTIC_GUNNERS_HOSTILE__;
      }
    });
  }

  update(time: number): void {
    if (this.#terminalState) {
      const actions = this.#inputSystem.actions;
      if (actions.confirm) {
        this.runTerminalAction(this.primaryTerminalAction());
      } else if (actions.back) {
        this.runTerminalAction('menu');
      }
      return;
    }
    const deltaMs = this.#lastUpdateAtMs === 0 ? 0 : Math.max(time - this.#lastUpdateAtMs, 0);
    this.#lastUpdateAtMs = time;

    if (this.#playerState === 'hit' && time >= this.#respawnAtMs) {
      this.respawnPlayer();
    }
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
    this.resolveSweptProjectileCollisions();
    this.cleanupProjectiles();
    this.recordProjectilePreviousPositions();
    this.checkTerminalConditions();
    this.publishQaState();
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    this.#layout = createPlayfieldLayout(gameSize.width, gameSize.height);
    this.physics.world.setBounds(0, 0, gameSize.width, gameSize.height);
    this.#background.setPosition(gameSize.width / 2, gameSize.height / 2).setDisplaySize(gameSize.width, gameSize.height);
    this.#player.setSpawn({ x: (this.#definition.player.x / 1280) * gameSize.width, y: (this.#definition.player.y / 720) * gameSize.height });
    this.#player.applyLayout(this.#layout);
    this.#player.clampToPlayfield(this.#layout);
    this.reflowHud();
    this.reflowScoutWave();
    this.reflowShieldZone();
    this.reflowActiveProjectiles();
    this.publishQaState();
  }

  private createScoutWave(): void {
    this.#definition.enemy_formations.forEach((formation, formationIndex) => {
      for (let row = 0; row < formation.rows; row += 1) {
        for (let col = 0; col < formation.columns; col += 1) {
          const position = this.scoutPosition(formationIndex, row, col);
          const scout = new Scout(this, position.x, position.y, this.#layout, formation.type, { width: formation.width, height: formation.height });
          scout.sprite.setData('formation', formationIndex);
          scout.sprite.setData('row', row);
          scout.sprite.setData('col', col);
          scout.sprite.setData('entityId', formation.entity_id ?? `${this.#definition.slug}:formation-${formationIndex}:r${row}:c${col}`);
          scout.sprite.setData('formationId', formation.id ?? `formation-${formationIndex}`);
          scout.sprite.setData('behaviourProfile', formation.behaviour_profile ?? `enemy.${formation.type}.standard`);
          this.#scouts.add(scout.sprite);
        }
      }
    });
  }

  private reflowScoutWave(): void {
    for (const scout of this.#scouts.getChildren() as Phaser.Physics.Arcade.Sprite[]) {
      if (!scout.active) {
        continue;
      }
      const formationIndex = Number(scout.getData('formation'));
      if (formationIndex < 0) {
        const size = hostileDisplaySize(this.#layout, 'scout');
        scout.setDisplaySize(size.width, size.height);
        const body = scout.body as Phaser.Physics.Arcade.Body;
        body.setSize(size.width * 0.72 / scout.scaleX, size.height * 0.7 / scout.scaleY, true);
        continue;
      }
      const row = Number(scout.getData('row'));
      const col = Number(scout.getData('col'));
      const position = this.scoutPosition(formationIndex, row, col);
      scout.setPosition(position.x, position.y);
      const formation = this.#definition.enemy_formations[formationIndex];
      const type = scout.getData('enemyType') as 'scout' | 'cruiser' | 'destroyer' | 'mothership';
      const size = hostileDisplaySize(this.#layout, type, { width: formation.width, height: formation.height });
      scout.setDisplaySize(size.width, size.height);
      const body = scout.body as Phaser.Physics.Arcade.Body;
      body.setSize(size.width * 0.72 / scout.scaleX, size.height * 0.7 / scout.scaleY, true);
    }
  }

  private scoutPosition(formationIndex: number, row: number, col: number): Phaser.Math.Vector2 {
    const formation = this.#definition.enemy_formations[formationIndex];
    if (formation.fixed_position) {
      return new Phaser.Math.Vector2(
        (formation.origin.x / 1280) * this.scale.width,
        (formation.origin.y / 720) * this.scale.height,
      );
    }
    const travelMargin = this.formationTravelMargin();
    const usableWidth = Math.max(
      this.#layout.formationBounds.width - travelMargin * 2,
      this.#layout.scoutSize.width * Math.max(formation.columns - 1, 1),
    );
    const gapX = formation.columns === 1 ? 0 : usableWidth / (formation.columns - 1);
    const gapY = Math.max(this.#layout.scoutSize.height * 1.8, 30);
    return new Phaser.Math.Vector2(
      this.#layout.formationBounds.x + travelMargin + col * gapX + this.#formationOffsetX,
      (this.#campaignSequence === 1 && formationIndex === 0 ? this.#layout.formationBounds.y : formation.origin.y) + row * gapY + this.#formationDropY,
    );
  }

  private createHazards(): void {
    for (const definition of this.#definition.hazards ?? []) {
      const emitter = definition.emitter as RuntimeHazardEmitter | undefined;
      for (let index = 0; index < definition.count; index += 1) {
        this.spawnHazard(definition.type, definition.speed, { x: definition.origin.x + definition.spacing.x * index, y: definition.origin.y + definition.spacing.y * index }, emitter, index);
      }
      if (emitter) this.#hazardEmitterState.set(emitter.id, { emitted: definition.count, nextAtMs: this.time.now + emitter.spawn_interval_ms });
    }
  }

  private spawnHazard(type: 'asteroid' | 'comet', speed: number, origin: { x: number; y: number }, emitter?: RuntimeHazardEmitter, ordinal = 0): void {
    const asset = type === 'asteroid' ? RUNTIME_ASSETS.fx.asteroid : RUNTIME_ASSETS.fx.comet;
    const hazard = this.physics.add.sprite(origin.x, origin.y, asset.key, 'stable-0')
      .setDisplaySize(type === 'asteroid' ? 54 : 72, 54).setDepth(3);
    hazard.setName(`${type}-hazard`).setData('hazardType', type).setData('emitterId', emitter?.id ?? null);
    const body = hazard.body as Phaser.Physics.Arcade.Body;
    body.setSize(hazard.displayWidth * 0.68 / hazard.scaleX, hazard.displayHeight * 0.68 / hazard.scaleY, true);
    const edge = emitter?.entry_edges.length ? emitter.entry_edges[ordinal % emitter.entry_edges.length] : 'TOP';
    const magnitude = emitter ? this.deterministicRange(emitter.speed_min, emitter.speed_max, `${emitter.id}:speed:${ordinal}`) : speed;
    const direction = edge === 'LEFT' ? new Phaser.Math.Vector2(1, 0.4) : edge === 'RIGHT' ? new Phaser.Math.Vector2(-1, 0.4) : edge === 'BOTTOM' ? new Phaser.Math.Vector2(0, -1) : new Phaser.Math.Vector2(0, 1);
    direction.normalize().scale(magnitude);
    hazard.setVelocity(direction.x, direction.y);
    if (type === 'asteroid') {
      hazard.setAngularVelocity(emitter ? this.deterministicRange(emitter.angular_velocity_min, emitter.angular_velocity_max, `${emitter.id}:spin:${ordinal}`) : 28);
    } else {
      hazard.setRotation(direction.angle() + Math.PI / 2);
    }
    this.#hazards.add(hazard);
  }

  private deterministicRange(minimum: number, maximum: number, key: string): number {
    let value = this.#definition.seed >>> 0;
    for (const character of key) value = Math.imul(value ^ character.charCodeAt(0), 16777619) >>> 0;
    return minimum + (value / 0xffffffff) * (maximum - minimum);
  }

  private updateHazardEmitters(time: number): void {
    for (const definition of this.#definition.hazards ?? []) {
      const emitter = definition.emitter as RuntimeHazardEmitter | undefined;
      if (!emitter) continue;
      const state = this.#hazardEmitterState.get(emitter.id);
      if (!state || time < state.nextAtMs) continue;
      const active = (this.#hazards.getChildren() as Phaser.Physics.Arcade.Sprite[]).filter((hazard) => hazard.active && hazard.getData('emitterId') === emitter.id).length;
      if (active < emitter.maximum_active) {
        const point = emitter.spawn_points.length ? emitter.spawn_points[state.emitted % emitter.spawn_points.length] : this.hazardEntryPoint(emitter, state.emitted);
        this.spawnHazard(definition.type, definition.speed, point, emitter, state.emitted);
        state.emitted += 1;
      }
      state.nextAtMs = time + emitter.spawn_interval_ms;
    }
  }

  private hazardEntryPoint(emitter: RuntimeHazardEmitter, ordinal: number): { x: number; y: number } {
    const edge = emitter.entry_edges[ordinal % emitter.entry_edges.length] ?? 'TOP';
    const lane = this.deterministicRange(80, this.scale.width - 80, `${emitter.id}:lane:${ordinal}`);
    if (edge === 'LEFT') return { x: -emitter.despawn_margin, y: lane * (this.scale.height / this.scale.width) };
    if (edge === 'RIGHT') return { x: this.scale.width + emitter.despawn_margin, y: lane * (this.scale.height / this.scale.width) };
    if (edge === 'BOTTOM') return { x: lane, y: this.scale.height + emitter.despawn_margin };
    return { x: lane, y: -emitter.despawn_margin };
  }

  private formationTravelMargin(): number {
    return Math.max(this.#layout.scoutSize.width * 2.2, this.#layout.formationBounds.width * 0.055);
  }

  private createShieldZone(): void {
    if (this.#definition.shields.some((shield) => shield.origin)) {
      this.createAuthoredShieldStructures();
      return;
    }
    const bunkerCount = this.#definition.shields[0].count;
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

  private createAuthoredShieldStructures(): void {
    this.#definition.shields.forEach((structure, bunker) => {
      const tileW = structure.tile_width ?? this.#layout.shieldTileSize.width;
      const tileH = structure.tile_height ?? this.#layout.shieldTileSize.height;
      const origin = structure.origin ?? { x: this.#layout.shieldZone.x, y: this.#layout.shieldZone.y };
      structure.matrix.forEach((row, rowIndex) => row.forEach((cell, colIndex) => {
        if (cell !== 1) return;
        const tile = this.physics.add.image(
          (origin.x / 1280) * this.scale.width + (colIndex + 0.5) * tileW,
          (origin.y / 720) * this.scale.height + (rowIndex + 0.5) * tileH,
          RUNTIME_ASSETS.shield.tile.key,
        );
        tile.setName('shield-tile').setData('bunker', bunker).setData('row', rowIndex).setData('col', colIndex).setDepth(4);
        tile.setDisplaySize(tileW, tileH);
        const body = tile.body as Phaser.Physics.Arcade.Body;
        body.setSize(tileW * 0.92 / tile.scaleX, tileH * 0.92 / tile.scaleY, true);
        this.#shieldTiles.add(tile);
      }));
    });
  }

  private reflowShieldZone(): void {
    if (this.#definition.shields.some((shield) => shield.origin)) {
      for (const tile of this.#shieldTiles.getChildren() as Phaser.Physics.Arcade.Image[]) {
        if (!tile.active) continue;
        const structure = this.#definition.shields[Number(tile.getData('bunker'))];
        const tileW = structure.tile_width ?? this.#layout.shieldTileSize.width;
        const tileH = structure.tile_height ?? this.#layout.shieldTileSize.height;
        const origin = structure.origin ?? { x: 0, y: 0 };
        tile.setPosition(
          (origin.x / 1280) * this.scale.width + (Number(tile.getData('col')) + 0.5) * tileW,
          (origin.y / 720) * this.scale.height + (Number(tile.getData('row')) + 0.5) * tileH,
        ).setDisplaySize(tileW, tileH);
        const body = tile.body as Phaser.Physics.Arcade.Body;
        body.setSize(tileW * 0.92 / tile.scaleX, tileH * 0.92 / tile.scaleY, true);
      }
      return;
    }
    const tileW = this.#layout.shieldTileSize.width;
    const tileH = this.#layout.shieldTileSize.height;
    for (const tile of this.#shieldTiles.getChildren() as Phaser.Physics.Arcade.Image[]) {
      if (!tile.active) {
        continue;
      }
      const bunker = Number(tile.getData('bunker'));
      const row = Number(tile.getData('row'));
      const col = Number(tile.getData('col'));
      const bunkerCenterX = this.#layout.shieldZone.x + (this.#layout.shieldZone.width * (bunker + 0.5)) / this.#definition.shields[0].count;
      const startX = bunkerCenterX - tileW * 4;
      tile.setPosition(startX + col * tileW + tileW / 2, this.#layout.shieldZone.y + row * tileH + tileH / 2);
      tile.setDisplaySize(tileW, tileH);
      const body = tile.body as Phaser.Physics.Arcade.Body;
      body.setSize(this.#layout.shieldBodySize.width / tile.scaleX, this.#layout.shieldBodySize.height / tile.scaleY, true);
    }
  }

  private createHud(): void {
    this.#scoreText = this.add.text(0, 0, 'SCORE 0', {
      color: '#d7e9ff',
      fontFamily: 'GalacticGunnersHUD, monospace',
      fontSize: '24px',
    }).setDepth(10);
    this.#soundIcon = this.add.image(0, 0, RUNTIME_ASSETS.ui.soundOn.key)
      .setDisplaySize(42, 28)
      .setDepth(10)
      .setInteractive({ useHandCursor: true });
    this.#soundIcon.on('pointerdown', () => {
      this.#audio.toggleMute();
      this.updateSoundHud();
    });
    this.#lifeIcons = Array.from({ length: this.#lives.maxLives }, () => this.add.image(0, 0, RUNTIME_ASSETS.ui.lifeIcon.key)
      .setDisplaySize(39, 39)
      .setDepth(10));
    this.#nukeIcons = Array.from({ length: LEVEL_ONE_SLICE.maxNukes }, () => this.add.image(0, 0, RUNTIME_ASSETS.ui.nukeIcon.key)
      .setDisplaySize(35, 35)
      .setDepth(10));
    this.#rearmText = this.add.text(0, 0, 'ENERGISE', {
      color: '#d7e9ff',
      fontFamily: 'GalacticGunnersHUD, monospace',
      fontSize: '18px',
    }).setOrigin(0, 0.5).setDepth(10);
    this.#rearmBarBack = this.add.rectangle(0, 0, 150, 10, 0x142744, 0.86)
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, 0xd7e9ff, 0.82)
      .setDepth(10);
    this.#rearmBarFill = this.add.rectangle(0, 0, 150, 8, 0x7ee8ff, 0.95)
      .setOrigin(0, 0.5)
      .setDepth(11);
    this.reflowHud();
  }

  private createLevelEntryNotice(): void {
    const notice = this.add.text(this.scale.width / 2, this.#layout.hudSafeRect.y + 72,
      `LEVEL ${this.#campaignSequence}: ${this.#definition.name.toUpperCase()}\nSCORE ${this.#score.value}  LIVES ${this.#lives.value}  NUKES ${this.#currentNukes}`, {
        color: '#d7e9ff', fontFamily: 'GalacticGunnersSilverDisplay, Arial, sans-serif', fontSize: `${Math.max(16, Math.min(26, this.scale.width * 0.022))}px`, align: 'center',
      }).setOrigin(0.5).setDepth(12);
    this.tweens.add({ targets: notice, alpha: 0, delay: 1500, duration: 650, onComplete: () => notice.destroy() });
  }

  private reflowHud(): void {
    const left = Math.max(24, this.#layout.viewport.width * 0.028);
    const right = this.#layout.viewport.width - Math.max(30, this.#layout.viewport.width * 0.028);
    const bottom = this.#layout.viewport.height - 50;
    const barWidth = Phaser.Math.Clamp(this.#layout.viewport.width * 0.1, 72, 170);
    const lifeSpacing = 34;
    const nukeSpacing = 36;
    const nukeBarX = right - barWidth;
    this.#scoreText.setPosition(left, this.#layout.hudSafeRect.y + 12);
    this.#soundIcon.setPosition(right - 4, this.#layout.hudSafeRect.y + 28);
    this.#lifeIcons.forEach((icon, index) => {
      icon.setPosition(left + 20 + index * lifeSpacing, bottom + 12);
    });
    this.#nukeIcons.forEach((icon, index) => {
      icon.setPosition(nukeBarX - (LEVEL_ONE_SLICE.maxNukes - index) * nukeSpacing, bottom + 12);
    });
    this.#rearmText.setPosition(nukeBarX, bottom + 20);
    this.#rearmBarBack.setPosition(nukeBarX, bottom + 38).setDisplaySize(barWidth, 10);
    this.#rearmBarFill.setPosition(nukeBarX, bottom + 38);
    this.updateNukeHud();
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
      this.handleEnemyLaserShieldOverlap(laser as Phaser.Physics.Arcade.Image, tile as Phaser.Physics.Arcade.Image);
    });
    this.physics.add.overlap(this.#playerLasers, this.#shieldTiles, (laser, tile) => {
      this.handlePlayerLaserShieldOverlap(laser as Phaser.Physics.Arcade.Image, tile as Phaser.Physics.Arcade.Image);
    });
    this.physics.add.overlap(this.#nukes, this.#scouts, (nuke, scout) => {
      this.handleNukeScoutOverlap(nuke as Phaser.Physics.Arcade.Sprite, scout as Phaser.Physics.Arcade.Sprite);
    });
    this.physics.add.overlap(this.#playerLasers, this.#hazards, (laser, hazard) => {
      if (!(laser as Phaser.Physics.Arcade.Image).getData('spent')) {
        this.destroyProjectile(laser as Phaser.Physics.Arcade.Image);
        this.destroyHazard(hazard as Phaser.Physics.Arcade.Sprite);
      }
    });
    this.physics.add.overlap(this.#player.sprite, this.#hazards, (_player, hazard) => {
      (hazard as Phaser.Physics.Arcade.Sprite).disableBody(true, true);
      this.damagePlayer(true);
    });
    this.physics.add.overlap(this.#player.sprite, this.#pickups, (_player, pickup) => {
      const item = pickup as Phaser.Physics.Arcade.Image;
      const type = item.getData('pickupType') as PickupType;
      item.disableBody(true, true);
      if (type === 'nuke') this.#currentNukes = Math.min(LEVEL_ONE_SLICE.maxNukes, this.#currentNukes + 1);
      if (type === 'life') this.#lives.restore(Math.min(this.#lives.maxLives, this.#lives.value + 1));
      this.updateLifeHud();
      this.updateNukeHud();
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
    if (time < this.#pauseInputBlockedUntilMs) {
      this.#inputSystem.syncOneShotState();
    } else if (this.#inputSystem.consumePauseToggle()) {
      this.pauseLevel();
    }
    if (this.#inputSystem.consumeMuteToggle()) {
      this.#audio.toggleMute();
      this.updateSoundHud();
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
      const formation = Number(scout.getData('formation'));
      const row = Number(scout.getData('row'));
      const col = Number(scout.getData('col'));
      if (formation < 0) {
        if (scout.y > this.#layout.movementBounds.bottom) this.showTerminal('failed');
        return;
      }
      const position = this.scoutPosition(formation, row, col);
      const profile = String(scout.getData('behaviourProfile') ?? '');
      if (profile === 'enemy.scout.diver') {
        const phaseSeed = String(scout.getData('entityId')).split('').reduce((sum, character) => sum + character.charCodeAt(0), 0);
        const cycle = ((time + phaseSeed * 31) % 5400) / 5400;
        const arc = Math.sin(cycle * Math.PI);
        position.x += Math.sin(cycle * Math.PI * 2) * this.#layout.scoutSize.width * 3.2;
        position.y += arc * Math.min(this.#layout.viewport.height * 0.42, 290);
      }
      scout.setPosition(position.x, position.y);
      scout.setVelocity(0, 0);
      if (scout.y > this.#layout.movementBounds.bottom) {
        this.showTerminal('failed');
      }
    });
    this.deployMothershipScout(time);
    for (const hazard of this.#hazards.getChildren() as Phaser.Physics.Arcade.Sprite[]) {
      if (hazard.active && (hazard.x < -100 || hazard.x > this.scale.width + 100 || hazard.y < -100 || hazard.y > this.scale.height + 100)) hazard.disableBody(true, true);
    }
    for (const pickup of this.#pickups.getChildren() as Phaser.Physics.Arcade.Image[]) {
      if (pickup.active && pickup.y > this.scale.height + 48) pickup.disableBody(true, true);
    }
    this.updateHazardEmitters(time);
    if (time % 250 < this.game.loop.delta) {
      this.publishQaState();
    }
  }

  private deployMothershipScout(time: number): void {
    const mothership = this.getActiveScouts().find((scout) => scout.getData('enemyType') === 'mothership');
    if (!mothership || time - this.#lastMothershipDeployAtMs < 4200) return;
    if (this.getActiveScouts().length >= this.#definition.performance_budget.max_enemies) return;
    const scout = new Scout(this, mothership.x, mothership.y + mothership.displayHeight * 0.45, this.#layout, 'scout');
    scout.sprite.setData('formation', -1);
    scout.sprite.setData('row', 0);
    scout.sprite.setData('col', 0);
    scout.sprite.setData('entityId', `${mothership.getData('entityId')}:deployed:${Math.floor(time / 4200)}`);
    scout.sprite.setData('formationId', 'mothership-deployment');
    scout.sprite.setData('behaviourProfile', 'enemy.scout.diver');
    scout.sprite.setVelocityY(Math.max(38, this.#layout.viewport.height * 0.075));
    this.#scouts.add(scout.sprite);
    this.#lastMothershipDeployAtMs = time;
  }

  private firePlayerLaser(nowMs = this.time.now, x = this.#player.sprite.x, y = this.#player.sprite.y - this.#layout.playerSize.height * 0.52): Phaser.Physics.Arcade.Image | null {
    if (!this.#player.canFire(nowMs)) {
      return null;
    }
    const laser = this.#playerLasers.get(x, y, RUNTIME_ASSETS.projectile.playerLaser.key) as Phaser.Physics.Arcade.Image | null;
    if (!laser) {
      return null;
    }
    laser.setPosition(x, y);
    if (Number.isFinite(nowMs)) {
      this.#player.markFired(nowMs);
    }
    this.configureLaser(laser, 'player-laser', -90, -this.playerLaserSpeed());
    this.#audio.play('playerLaser');
    return laser;
  }

  private playerLaserSpeed(): number {
    return LEVEL_ONE_SLICE.playerLaserSpeed;
  }

  private enemyLaserSpeed(): number {
    return LEVEL_ONE_SLICE.enemyLaserSpeed;
  }

  private fireEnemyLaser(): Phaser.Physics.Arcade.Image | null {
    const active = this.getActiveScouts();
    if (active.length === 0 || this.#terminalState) {
      return null;
    }
    const selection = Math.floor(this.deterministicRange(0, active.length, `enemy-fire:${this.#enemyFireOrdinal++}`));
    const scout = active[Math.min(active.length - 1, selection)];
    const spawnY = scout.y + scout.displayHeight * 0.55;
    const laser = this.#enemyLasers.get(scout.x, spawnY, RUNTIME_ASSETS.projectile.enemyLaser.key) as Phaser.Physics.Arcade.Image | null;
    if (!laser) {
      return null;
    }
    laser.setPosition(scout.x, spawnY);
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
    const body = laser.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setSize(this.#layout.projectileBodySize.width / laser.scaleX, this.#layout.projectileBodySize.height / laser.scaleY, true);
    body.reset(laser.x, laser.y);
    body.position.set(laser.x - body.width / 2, laser.y - body.height / 2);
    body.prev.set(body.x, body.y);
    laser.setData('previousBodyCenterX', body.x + body.width / 2);
    laser.setData('previousBodyCenterY', body.y + body.height / 2);
    laser.setVelocity(0, velocityY);
  }

  private reflowActiveProjectiles(): void {
    for (const laser of [...this.#playerLasers.getChildren(), ...this.#enemyLasers.getChildren()] as Phaser.Physics.Arcade.Image[]) {
      if (!laser.active) {
        continue;
      }
      laser.setDisplaySize(this.#layout.projectileSize.width, this.#layout.projectileSize.height);
      const body = laser.body as Phaser.Physics.Arcade.Body;
      body.setSize(this.#layout.projectileBodySize.width / laser.scaleX, this.#layout.projectileBodySize.height / laser.scaleY, true);
      laser.setData('previousBodyCenterX', body.x + body.width / 2);
      laser.setData('previousBodyCenterY', body.y + body.height / 2);
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
    this.damageHostile(scout);
  }

  private damageHostile(scout: Phaser.Physics.Arcade.Sprite): void {
    const type = scout.getData('enemyType') as 'scout' | 'cruiser' | 'destroyer' | 'mothership';
    const health = Number(scout.getData('health') ?? 1);
    if (type === 'mothership' && health > 1) {
      scout.setData('health', health - 1);
      scout.setTexture(RUNTIME_ASSETS.enemy.mothershipHit.key);
      this.time.delayedCall(110, () => {
        if (scout.active && !scout.getData('destroyed')) scout.setTexture(RUNTIME_ASSETS.enemy.mothership.key, 'stable-0');
      });
      this.#score.apply('mothership_hit', this.time.now, { source: 'player_laser', entity_id: scout.getData('entityId') });
      this.#scoreText.setText(`SCORE ${this.#score.value}`);
      return;
    }
    if (health > 1) {
      scout.setData('health', health - 1);
      return;
    }
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

  private handleEnemyLaserShieldOverlap(laser: Phaser.Physics.Arcade.Image, tile: Phaser.Physics.Arcade.Image): void {
    if (laser.getData('spent')) {
      return;
    }
    laser.setData('spent', true);
    this.destroyProjectile(laser);
    this.destroyShieldTile(tile, true);
  }

  private destroyHazard(hazard: Phaser.Physics.Arcade.Sprite): void {
    if (!hazard.active) return;
    const type = hazard.getData('hazardType') as 'asteroid' | 'comet';
    hazard.disableBody(true, true);
    this.#score.apply(type === 'comet' ? 'comet_destroyed' : 'asteroid_destroyed', this.time.now, { source: 'player_laser' });
    this.#scoreText.setText(`SCORE ${this.#score.value}`);
    this.createExplosion(hazard.x, hazard.y, 60);
  }

  private handlePlayerLaserShieldOverlap(laser: Phaser.Physics.Arcade.Image, tile: Phaser.Physics.Arcade.Image): void {
    if (laser.getData('spent')) {
      return;
    }
    laser.setData('spent', true);
    this.destroyProjectile(laser);
    this.destroyShieldTile(tile, false);
  }

  private resolveSweptProjectileCollisions(): void {
    for (const laser of this.#playerLasers.getChildren() as Phaser.Physics.Arcade.Image[]) {
      if (!laser.active || laser.getData('spent')) {
        continue;
      }
      const candidates: SweptHitTarget[] = [
        ...this.getActiveShieldTiles().map((tile) => ({ kind: 'shield' as const, tile, body: tile.body as Phaser.Physics.Arcade.Body })),
        ...this.getActiveScouts().map((scout) => ({ kind: 'scout' as const, scout, body: scout.body as Phaser.Physics.Arcade.Body })),
        ...(this.#hazards.getChildren().filter((hazard) => hazard.active) as Phaser.Physics.Arcade.Sprite[]).map((hazard) => ({ kind: 'hazard' as const, hazard, body: hazard.body as Phaser.Physics.Arcade.Body })),
      ];
      const hit = this.findSweptHit(laser, -1, candidates);
      if (hit?.kind === 'shield') {
        this.handlePlayerLaserShieldOverlap(laser, hit.tile);
      } else if (hit?.kind === 'scout') {
        this.handlePlayerLaserScoutOverlap(laser, hit.scout);
      } else if (hit?.kind === 'hazard') {
        this.destroyProjectile(laser);
        this.destroyHazard(hit.hazard);
      }
    }

    for (const laser of this.#enemyLasers.getChildren() as Phaser.Physics.Arcade.Image[]) {
      if (!laser.active || laser.getData('spent')) {
        continue;
      }
      const playerBody = this.#player.sprite.body as Phaser.Physics.Arcade.Body;
      const candidates: SweptHitTarget[] = [
        ...this.getActiveShieldTiles().map((tile) => ({ kind: 'shield' as const, tile, body: tile.body as Phaser.Physics.Arcade.Body })),
        { kind: 'player', body: playerBody },
      ];
      const hit = this.findSweptHit(laser, 1, candidates);
      if (hit?.kind === 'shield') {
        this.handleEnemyLaserShieldOverlap(laser, hit.tile);
      } else if (hit?.kind === 'player') {
        this.handleEnemyLaserPlayerOverlap(laser);
      }
    }
  }

  private findSweptHit(
    projectile: Phaser.Physics.Arcade.Image,
    directionY: -1 | 1,
    targets: SweptHitTarget[],
  ): SweptHitTarget | null {
    const projectileBody = projectile.body as Phaser.Physics.Arcade.Body;
    const currentX = projectileBody.x + projectileBody.width / 2;
    const currentY = projectileBody.y + projectileBody.height / 2;
    const previousX = Number(projectile.getData('previousBodyCenterX') ?? currentX);
    const previousY = Number(projectile.getData('previousBodyCenterY') ?? currentY);
    const minY = Math.min(previousY, currentY) - projectileBody.height / 2;
    const maxY = Math.max(previousY, currentY) + projectileBody.height / 2;
    const centerX = (previousX + currentX) / 2;
    const halfWidth = projectileBody.width / 2;
    let best: { target: SweptHitTarget; entry: number } | null = null;

    for (const target of targets) {
      if (!target.body.enable) {
        continue;
      }
      const left = target.body.x - halfWidth;
      const right = target.body.x + target.body.width + halfWidth;
      const top = target.body.y - projectileBody.height / 2;
      const bottom = target.body.y + target.body.height + projectileBody.height / 2;
      if (centerX < left || centerX > right || maxY < top || minY > bottom) {
        continue;
      }
      const entry = directionY > 0 ? top : bottom;
      if (!best || (directionY > 0 ? entry < best.entry : entry > best.entry)) {
        best = { target, entry };
      }
    }

    return best?.target ?? null;
  }

  private recordProjectilePreviousPositions(): void {
    for (const laser of [...this.#playerLasers.getChildren(), ...this.#enemyLasers.getChildren()] as Phaser.Physics.Arcade.Image[]) {
      if (!laser.active) {
        continue;
      }
      const body = laser.body as Phaser.Physics.Arcade.Body;
      laser.setData('previousBodyCenterX', body.x + body.width / 2);
      laser.setData('previousBodyCenterY', body.y + body.height / 2);
    }
  }

  private destroyScoutBody(scout: Phaser.Physics.Arcade.Sprite, awardScore: boolean): void {
    if (scout.getData('destroyed')) {
      return;
    }
    const anchor = this.#definition.boarding_anchors?.[0];
    if (awardScore && anchor && !this.#boardingActive
      && !scout.getData('boarding-resolved')
      && (scout.getData('entityId') === anchor.source_entity_id
        || (Number(scout.getData('row')) === anchor.source_selector.row
          && Number(scout.getData('col')) === anchor.source_selector.column))) {
      this.#boardingActive = true;
      scout.setData('boarding-anchor', true);
      this.scene.pause();
      this.scene.launch('BoardingScene', {
        seed: this.#definition.seed,
        lives: this.#lives.value,
        nukes: this.#currentNukes,
        anchorId: anchor.id,
        sourceEntityId: anchor.source_entity_id,
        sourceEntityType: anchor.source_entity_type,
        interior: anchor.interior,
        apiBaseUrl: this.#runtimeConfig.apiBaseUrl,
        gameRunId: this.#session.runId ?? undefined,
        levelVersion: this.levelRuntime?.version ?? this.#definition.version,
        levelChecksum: this.levelRuntime?.checksum ?? '',
      });
      return;
    }
    scout.setData('destroyed', true);
    scout.disableBody(true, true);
    if (awardScore) {
      const enemyType = scout.getData('enemyType') as 'scout' | 'cruiser' | 'destroyer' | 'mothership';
      const event = enemyType === 'mothership' ? 'mothership_destroyed' : enemyType === 'scout' ? 'scout_destroyed' : 'ship_destroyed';
      this.#score.apply(event, this.time.now, { source: 'player_laser', entity_id: scout.getData('entityId') });
      this.#scoreText.setText(`SCORE ${this.#score.value}`);
      this.spawnPickupForHost(scout);
    }
    this.#audio.play('explosionSmall');
    this.createExplosion(scout.x, scout.y, 70);
  }

  private spawnPickupForHost(host: Phaser.Physics.Arcade.Sprite): void {
    const type = host.getData('enemyType') as 'scout' | 'cruiser' | 'destroyer' | 'mothership';
    if (type === 'mothership') return;
    const table = this.#definition.drop_tables?.find((candidate) => candidate.host === type);
    if (!table) return;
    const pickup = this.#pickupSystem.choose(String(host.getData('entityId')), table.entries);
    if (!pickup) return;
    const limit = table.entries.find((entry) => entry.pickup === pickup)?.maximum_per_level;
    if (limit !== undefined && (this.#pickupCounts.get(pickup) ?? 0) >= limit) return;
    const asset = pickup === 'nuke' ? RUNTIME_ASSETS.ui.nukeIcon : RUNTIME_ASSETS.ui.lifeIcon;
    const item = this.#pickups.get(host.x, host.y, asset.key) as Phaser.Physics.Arcade.Image | null;
    if (!item) return;
    item.setPosition(host.x, host.y).setActive(true).setVisible(true).setDisplaySize(34, 34).setDepth(5).setData('pickupType', pickup);
    const body = item.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.reset(item.x, item.y);
    item.setVelocityY(80);
    this.#pickupCounts.set(pickup, (this.#pickupCounts.get(pickup) ?? 0) + 1);
  }

  private handleBoardingReturn(_system: unknown, data?: { boardingOutcome?: string; boardingReturnState?: { lives: number; nukes: number; score_delta: number; remove_source_entity_id: string } | null; boardingValidated?: boolean }): void {
    if (!this.#boardingActive) return;
    if (!data?.boardingValidated || !data.boardingReturnState) {
      this.#boardingActive = false;
      return;
    }
    const anchoredScout = this.getActiveScouts().find((scout) => scout.getData('boarding-anchor'));
    if (anchoredScout) {
      anchoredScout.setData('boarding-anchor', false);
      anchoredScout.setData('boarding-resolved', true);
      this.destroyScoutBody(anchoredScout, true);
    }
    this.#boardingActive = false;
    this.#lives.restore(data.boardingReturnState.lives);
    this.#currentNukes = data.boardingReturnState.nukes;
    this.updateLifeHud();
    this.updateNukeHud();
    if (data?.boardingOutcome === 'PLAYER_DEAD') this.damagePlayer(true);
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
    this.createShieldImpact(tile.x, tile.y);
  }

  private fireNuke(x = this.#player.sprite.x, y = this.#player.sprite.y - this.#layout.playerSize.height * 0.62): Phaser.Physics.Arcade.Sprite | null {
    if (this.#currentNukes <= 0 || this.#rearmProgress < LEVEL_ONE_SLICE.nukeRearmMax || this.#terminalState) {
      return null;
    }
    const nuke = this.#nukes.get(x, y, RUNTIME_ASSETS.projectile.nuke.key) as Phaser.Physics.Arcade.Sprite | null;
    if (!nuke) {
      return null;
    }
    nuke.setPosition(x, y);
    this.#currentNukes = Math.max(0, this.#currentNukes - 1);
    this.#rearmProgress = 0;
    this.#nukesFired += 1;
    this.updateNukeHud();
    nuke.setActive(true).setVisible(true);
    nuke.setName('nuke-projectile');
    nuke.setAngle(0);
    nuke.setDisplaySize(this.#layout.nukeProjectileSize.width, this.#layout.nukeProjectileSize.height);
    nuke.setDepth(4);
    nuke.setData('spent', false);
    if (this.anims.exists('projectile.nuke.fly')) {
      nuke.play('projectile.nuke.fly');
    }
    this.configureNukeBody(nuke);
    nuke.setVelocity(0, -LEVEL_ONE_SLICE.nukeProjectileSpeed);
    this.#audio.play('nukeFire');
    return nuke;
  }

  private configureNukeBody(nuke: Phaser.Physics.Arcade.Sprite): void {
    nuke.setDisplaySize(this.#layout.nukeProjectileSize.width, this.#layout.nukeProjectileSize.height);
    const body = nuke.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setSize(this.#layout.nukeProjectileBodySize.width / nuke.scaleX, this.#layout.nukeProjectileBodySize.height / nuke.scaleY, true);
    body.reset(nuke.x, nuke.y);
    body.position.set(nuke.x - body.width / 2, nuke.y - body.height / 2);
    body.prev.set(body.x, body.y);
    nuke.setData('previousBodyCenterX', body.x + body.width / 2);
    nuke.setData('previousBodyCenterY', body.y + body.height / 2);
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
    if (this.anims.exists('fx.nukeBurst.play')) {
      burst.play('fx.nukeBurst.play');
      burst.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => burst.destroy());
    } else {
      this.time.delayedCall(260, () => burst.destroy());
    }
    this.#audio.play('nukeBurst');
  }

  private destroyScoutsInNukeBurst(x: number, y: number): number {
    const radius = this.#layout.nukeBurstSize.width * 0.48;
    let destroyed = 0;
    for (const scout of this.getActiveScouts()) {
      if (Phaser.Math.Distance.Between(x, y, scout.x, scout.y) <= radius) {
        if (scout.getData('enemyType') === 'mothership') {
          // The boss must retain its governed 30-health, hit-image, and score
          // lifecycle. A burst cannot silently bypass that authored contract.
          this.damageHostile(scout);
        } else {
          this.destroyScoutBody(scout, true);
          destroyed += 1;
        }
      }
    }
    return destroyed;
  }

  private updateNukeRearm(deltaMs: number): void {
    if (this.#rearmProgress >= LEVEL_ONE_SLICE.nukeRearmMax) {
      this.updateNukeHud();
      return;
    }
    this.#rearmProgress = Math.min(LEVEL_ONE_SLICE.nukeRearmMax, this.#rearmProgress + deltaMs / 50);
    this.updateNukeHud();
  }

  private updateNukeHud(): void {
    this.#rearmText?.setText('ENERGISE');
    this.#nukeIcons.forEach((icon, index) => {
      icon.setVisible(index < this.#currentNukes);
    });
    const progress = Phaser.Math.Clamp(this.#rearmProgress / LEVEL_ONE_SLICE.nukeRearmMax, 0, 1);
    const barWidth = Phaser.Math.Clamp(this.#layout.viewport.width * 0.1, 72, 170);
    this.#rearmBarFill?.setDisplaySize(Math.max(2, barWidth * progress), 8);
  }

  private updateLifeHud(): void {
    this.#lifeIcons.forEach((icon, index) => {
      icon.setVisible(index < this.#lives.value);
    });
  }

  private updateSoundHud(): void {
    this.#soundIcon?.setTexture(this.#audio.muted ? RUNTIME_ASSETS.ui.soundOff.key : RUNTIME_ASSETS.ui.soundOn.key);
  }

  private pauseLevel(): void {
    if (this.scene.isSleeping()) {
      return;
    }
    this.#player.stop();
    this.scene.launch('PauseScene');
    this.scene.sleep();
  }

  private handlePauseKeyDown(): void {
    if (this.#terminalState || this.time.now < this.#pauseInputBlockedUntilMs) {
      return;
    }
    this.#inputSystem.syncOneShotState();
    this.pauseLevel();
  }

  private handleResume(): void {
    this.input.keyboard?.resetKeys();
    this.#inputSystem.syncOneShotState();
    this.#lastUpdateAtMs = 0;
    this.#pauseInputBlockedUntilMs = this.time.now + 250;
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
    this.updateLifeHud();
    for (const laser of this.#enemyLasers.getChildren() as Phaser.Physics.Arcade.Image[]) {
      if (laser.active) {
        this.destroyProjectile(laser);
      }
    }
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
    this.#respawnAtMs = this.time.now + 420;
  }

  private respawnPlayer(): void {
    if (this.#terminalState) {
      return;
    }
    this.#playerState = 'regenerating';
    this.#respawnAtMs = Number.POSITIVE_INFINITY;
    this.#player.respawn(this.#layout);
    this.#inputSystem.resetPointerState();
    this.#invulnerableUntilMs = this.time.now + 1200;
    this.publishQaState();
  }

  private createExplosion(x: number, y: number, size: number): void {
    const explosion = this.add.sprite(x, y, RUNTIME_ASSETS.fx.explosionSmall.key)
      .setDisplaySize(size, size)
      .setDepth(6);
    if (this.anims.exists('fx.explosionSmall.play')) {
      explosion.play('fx.explosionSmall.play');
      explosion.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => explosion.destroy());
    } else {
      this.time.delayedCall(220, () => explosion.destroy());
    }
  }

  private createShieldImpact(x: number, y: number): void {
    this.add.rectangle(x, y, this.#layout.shieldTileSize.width * 1.15, this.#layout.shieldTileSize.height * 1.15, 0x020406, 0.72)
      .setDepth(3.5);
    this.createExplosion(x, y, Math.max(26, this.#layout.shieldTileSize.width * 3.8));
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
    const objectives = this.#definition.objectives ?? [{ type: 'DESTROY_ALL_HOSTILES', required: true, target_entity_ids: [], duration_ms: null }];
    const requiredObjectives = objectives.filter((objective) => objective.required);
    const completed = requiredObjectives.every((objective) => this.isObjectiveComplete(objective));
    if (completed) {
      this.showTerminal('complete');
    }
  }

  private isObjectiveComplete(objective: { type: string; target_entity_ids?: string[]; duration_ms?: number | null }): boolean {
    const active = this.getActiveScouts();
    if (objective.type === 'SURVIVE_DURATION') {
      return this.time.now - this.#levelStartedAtMs >= (objective.duration_ms ?? Number.POSITIVE_INFINITY);
    }
    if (objective.type === 'DESTROY_MOTHERSHIP') {
      return !active.some((scout) => scout.getData('enemyType') === 'mothership');
    }
    if (objective.type === 'BOARD_TARGET') {
      const targets = new Set(objective.target_entity_ids ?? []);
      return [...targets].every((id) => !active.some((scout) => scout.getData('entityId') === id));
    }
    return active.length === 0;
  }

  private showTerminal(state: TerminalState): void {
    if (this.#terminalState) {
      return;
    }
    this.#terminalState = state;
    this.#terminalActions = [];
    this.#terminalActionHandled = false;
    this.#player.stop();
    this.#playerLasers.clear(true, true);
    this.#enemyLasers.clear(true, true);
    const isComplete = state === 'complete';
    const isFinalLevel = this.#campaignSession?.run ? !this.#campaignSession.run.has_next_entry : this.#campaignSequence >= this.campaignLength();
    const centreX = this.scale.width / 2;
    const centreY = this.scale.height / 2;
    const panelAsset = isComplete ? RUNTIME_ASSETS.ui.victoryPanel : RUNTIME_ASSETS.ui.gameOverPanel;
    const panelAspect = isComplete ? 1448 / 1086 : 1672 / 941;
    const panelWidth = Math.min(this.scale.width * 0.8, 920);
    const panelHeight = panelWidth / panelAspect;
    const panel = this.add.image(centreX, centreY - 16, panelAsset.key)
      .setDisplaySize(panelWidth, panelHeight)
      .setDepth(20);
    const bonus = isComplete ? this.#lives.value * 100 : 0;
    const levelScoreDelta = Math.max(0, this.#score.value - this.#entryScore);
    const rankedState = this.#campaignSession?.run?.ranked ? 'RANKED' : 'UNRANKED';
    const heading = isComplete
      ? (isFinalLevel ? 'CAMPAIGN VICTORY' : 'MISSION CLEARED')
      : 'GAME OVER';
    const values = isComplete
      ? `${heading}\nLEVEL ${this.#campaignSequence}: ${this.#definition.name.toUpperCase()}\nLEVEL SCORE ${levelScoreDelta}\nCAMPAIGN SCORE ${this.#score.value}\nLIVES ${this.#lives.value}  NUKES ${this.#currentNukes}\nBONUS ${bonus}  ${rankedState}`
      : `${heading}\nLEVEL ${this.#campaignSequence}: ${this.#definition.name.toUpperCase()}\nCAMPAIGN SCORE ${this.#score.value}\nLIVES ${this.#lives.value}  NUKES ${this.#currentNukes}\n${rankedState}`;
    const text = this.add.text(centreX, centreY - panelHeight * 0.12, values, {
      color: isComplete ? '#f7d56a' : '#ff8b6e',
      fontFamily: isComplete ? 'GalacticGunnersGoldDisplay, Arial, sans-serif' : 'GalacticGunnersSilverDisplay, Arial, sans-serif',
      fontSize: `${Math.max(20, Math.min(34, panelWidth * 0.042))}px`,
      align: 'center',
    }).setOrigin(0.5).setDepth(21);
    const actionY = centreY + panelHeight * 0.24;
    if (isComplete && !isFinalLevel) {
      this.createContinueControl(centreX, actionY - 8);
      this.createProductionTerminalButton(centreX - panelWidth * 0.18, actionY + 74, 'replay');
      this.createProductionTerminalButton(centreX + panelWidth * 0.18, actionY + 74, 'menu');
    } else if (isComplete) {
      this.createProductionTerminalButton(centreX - panelWidth * 0.18, actionY + 34, 'replay');
      this.createProductionTerminalButton(centreX + panelWidth * 0.18, actionY + 34, 'menu');
      if (!this.#campaignSession?.run?.ranked && typeof window !== 'undefined') {
        const claim = this.add.text(centreX, actionY + 92, 'CREATE PILOT ACCOUNT TO CLAIM ELIGIBLE SCORE', {
          color: '#7ee8ff', fontFamily: 'GalacticGunnersHUD, monospace', fontSize: `${Math.max(14, Math.min(20, panelWidth * 0.024))}px`, align: 'center',
        }).setOrigin(0.5).setDepth(23).setInteractive({ useHandCursor: true });
        claim.on('pointerup', () => window.location.assign('/account/register?claim=eligible'));
        claim.setData('qa', 'anonymous-score-claim-cta');
      }
    } else {
      this.createProductionTerminalButton(centreX - panelWidth * 0.18, actionY + 34, 'try-again');
      this.createProductionTerminalButton(centreX + panelWidth * 0.18, actionY + 34, 'menu');
    }
    panel.setData('qa', 'terminal-panel');
    text.setData('qa', 'terminal-text');
    void this.#session.complete({
      score: this.#score.value,
      livesUsed: this.#lives.maxLives - this.#lives.value,
      livesEnd: this.#lives.value,
      nukesEnd: this.#currentNukes,
      levelReached: this.#campaignSequence,
      victory: isComplete && isFinalLevel,
      eventSummary: this.#score.eventSummary(),
    }).catch(() => undefined).finally(() => this.publishQaState());
    this.publishQaState();
  }

  private primaryTerminalAction(): TerminalAction {
    if (this.#terminalState === 'failed') {
      return 'try-again';
    }
    return this.#campaignSession?.run?.has_next_entry || this.#campaignSession?.offline && this.#campaignSequence < this.campaignLength() ? 'continue' : 'replay';
  }

  private createContinueControl(x: number, y: number): void {
    const width = Phaser.Math.Clamp(this.scale.width * 0.19, 174, 250);
    const height = Phaser.Math.Clamp(this.scale.height * 0.065, 48, 64);
    const surface = this.add.rectangle(x, y, width, height, 0x123763, 0.96)
      .setStrokeStyle(2, 0xf7d56a, 0.96)
      .setDepth(22)
      .setInteractive({ useHandCursor: true });
    const label = this.add.text(x, y, 'CONTINUE', {
      color: '#f7d56a',
      fontFamily: 'GalacticGunnersGoldDisplay, Arial, sans-serif',
      fontSize: `${Math.max(22, Math.round(height * 0.48))}px`,
    }).setOrigin(0.5).setDepth(23);
    surface.on('pointerover', () => surface.setFillStyle(0x24538b, 1));
    surface.on('pointerout', () => surface.setFillStyle(0x123763, 0.96));
    surface.on('pointerup', () => this.runTerminalAction('continue'));
    surface.setData('qa', 'terminal-continue');
    label.setData('qa', 'terminal-continue-label');
    this.#terminalActions.push({ action: 'continue', x, y, width, height, source: 'production-derived' });
  }

  private createProductionTerminalButton(x: number, y: number, action: Exclude<TerminalAction, 'continue'>): void {
    const textures = action === 'menu'
      ? { off: RUNTIME_ASSETS.ui.mainMenuOff.key, on: RUNTIME_ASSETS.ui.mainMenuOnclick.key }
      : action === 'replay'
        ? { off: RUNTIME_ASSETS.ui.replayOff.key, on: RUNTIME_ASSETS.ui.replayOnclick.key }
        : { off: RUNTIME_ASSETS.ui.tryAgainOff.key, on: RUNTIME_ASSETS.ui.tryAgainOnclick.key };
    const sourceWidth = action === 'replay' ? 420 : action === 'menu' ? 340 : 350;
    const width = Phaser.Math.Clamp(this.scale.width * 0.19, 144, 220);
    const height = width * (140 / sourceWidth);
    const button = this.add.image(x, y, textures.off)
      .setDisplaySize(width, height)
      .setDepth(22)
      .setInteractive({ useHandCursor: true });
    button.on('pointerover', () => {
      button.setTexture(textures.on);
      this.#audio.play('uiSelect');
    });
    button.on('pointerout', () => button.setTexture(textures.off));
    button.on('pointerdown', () => button.setTexture(textures.on));
    button.on('pointerup', () => {
      button.setTexture(textures.off);
      this.runTerminalAction(action);
    });
    button.setData('qa', `terminal-${action}`);
    this.#terminalActions.push({ action, x, y, width, height, source: 'production-asset' });
  }

  private runTerminalAction(action: TerminalAction): void {
    if (!this.#terminalState || this.#terminalActionHandled) {
      return;
    }
    this.#terminalActionHandled = true;
    this.#audio.play('uiConfirm');
    if (action === 'continue') {
      void this.continueCampaign();
      return;
    }
    if (action === 'menu') {
      this.scene.start('MainMenuScene');
      return;
    }
    this.scene.restart({ sequence: this.#campaignSequence });
  }

  private async continueCampaign(): Promise<void> {
    try {
      const serverResult = await this.#campaignSession?.complete(this.#score.value, this.#lives.value, this.#currentNukes);
      const serverDefinition = serverResult?.entry?.level.definition;
      const nextSequence = serverResult?.entry?.position;
      if (serverDefinition && typeof serverDefinition === 'object') {
        const compiledDefinition = compileLevelDocument(serverDefinition as LevelDefinition | LevelAuthoringDocument);
        validateLevelDefinition(compiledDefinition);
        const runtimes = this.registry.get('campaignRuntime') as LevelRuntimeConfig[];
        const replacement = { definition: compiledDefinition, version: serverResult?.entry?.level.version ?? compiledDefinition.version, checksum: serverResult?.entry?.level.checksum ?? '', source: 'remote' as const };
        this.registry.set('campaignRuntime', [...runtimes.filter((runtime) => runtime.definition.sequence !== nextSequence), replacement]);
      }
      if (nextSequence && serverDefinition && typeof serverDefinition === 'object') {
        this.registry.set('campaignState', { sequence: nextSequence, score: this.#score.value, lives: this.#lives.value, nukes: this.#currentNukes } satisfies CampaignRuntimeState);
        this.scene.restart({ sequence: nextSequence });
      }
    } catch {
      // An online server rejection must not manufacture progression. Offline
      // mode is explicitly deterministic and may use the packaged authority.
      if (this.#campaignSession?.offline) {
        const nextSequence = this.#campaignSequence + 1;
        if (nextSequence <= this.campaignLength()) {
          this.registry.set('campaignState', { sequence: nextSequence, score: this.#score.value, lives: this.#lives.value, nukes: this.#currentNukes } satisfies CampaignRuntimeState);
          this.scene.restart({ sequence: nextSequence });
        }
      } else {
        this.#terminalActionHandled = false;
      }
    }
  }

  private campaignLength(): number {
    return (this.registry.get('campaignRuntime') as LevelRuntimeConfig[] | undefined)?.length ?? CAMPAIGN_DEFINITIONS.length;
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
      firePlayerLaserForVisual: (offsetX = 0) => {
        const laser = this.firePlayerLaser(Number.POSITIVE_INFINITY, this.#player.sprite.x + offsetX, this.#player.sprite.y - this.#layout.playerSize.height * 0.52);
        const body = laser?.body as Phaser.Physics.Arcade.Body | undefined;
        return {
          fired: Boolean(laser),
          playerX: this.#player.sprite.x,
          laserX: laser?.x,
          bodyCenterX: body ? body.x + body.width / 2 : null,
          bodyCenterY: body ? body.y + body.height / 2 : null,
          previousBodyCenterX: laser?.getData('previousBodyCenterX') ?? null,
          previousBodyCenterY: laser?.getData('previousBodyCenterY') ?? null,
          offsetX,
        };
      },
      fireEnemyLaserAtPlayer: (offsetX = 0) => {
        const laser = this.#enemyLasers.get(this.#player.sprite.x + offsetX, this.#player.sprite.y - this.#layout.playerSize.height * 0.42, RUNTIME_ASSETS.projectile.enemyLaser.key) as Phaser.Physics.Arcade.Image | null;
        if (!laser) {
          return { fired: false, reason: 'no-laser' };
        }
        laser.setPosition(this.#player.sprite.x + offsetX, this.#player.sprite.y - this.#layout.playerSize.height * 0.42);
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
        laser.setPosition(tile.x, tile.y - this.#layout.projectileSize.height * 0.62);
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
        const body = nuke?.body as Phaser.Physics.Arcade.Body | undefined;
        return {
          fired: Boolean(nuke),
          scoutX: scout.x,
          nukeX: nuke?.x,
          bodyCenterX: body ? body.x + body.width / 2 : null,
          bodyCenterY: body ? body.y + body.height / 2 : null,
          previousBodyCenterX: nuke?.getData('previousBodyCenterX') ?? null,
          previousBodyCenterY: nuke?.getData('previousBodyCenterY') ?? null,
          currentNukes: this.#currentNukes,
        };
      },
      verifyPlayerLaserPool: () => {
        const lanes = [
          this.#layout.movementBounds.left + this.#layout.playerSize.width * 0.5,
          this.scale.width / 2,
          this.#layout.movementBounds.right - this.#layout.playerSize.width * 0.5,
        ];
        return Array.from({ length: 24 }, (_, index) => {
          const x = lanes[index % lanes.length];
          const laser = this.firePlayerLaser(Number.POSITIVE_INFINITY, x, this.#player.sprite.y - this.#layout.playerSize.height * 0.52);
          const body = laser?.body as Phaser.Physics.Arcade.Body | undefined;
          const result = {
            cycle: index + 1,
            expectedX: x,
            spriteX: laser?.x ?? null,
            bodyCenterX: body ? body.x + body.width / 2 : null,
            bodyCenterY: body ? body.y + body.height / 2 : null,
            previousBodyCenterX: laser?.getData('previousBodyCenterX') ?? null,
            previousBodyCenterY: laser?.getData('previousBodyCenterY') ?? null,
          };
          if (laser) {
            this.destroyProjectile(laser);
          }
          return result;
        });
      },
      verifyNukePool: () => {
        const initialNukes = this.#currentNukes;
        const initialRearm = this.#rearmProgress;
        const initialFired = this.#nukesFired;
        const lanes = [
          this.#layout.movementBounds.left + this.#layout.playerSize.width,
          this.scale.width / 2,
          this.#layout.movementBounds.right - this.#layout.playerSize.width,
        ];
        const results = lanes.map((x, index) => {
          this.#currentNukes = LEVEL_ONE_SLICE.maxNukes;
          this.#rearmProgress = LEVEL_ONE_SLICE.nukeRearmMax;
          const nuke = this.fireNuke(x, this.#player.sprite.y - this.#layout.playerSize.height * 0.62);
          const body = nuke?.body as Phaser.Physics.Arcade.Body | undefined;
          const result = {
            cycle: index + 1,
            expectedX: x,
            spriteX: nuke?.x ?? null,
            bodyCenterX: body ? body.x + body.width / 2 : null,
            bodyCenterY: body ? body.y + body.height / 2 : null,
            previousBodyCenterX: nuke?.getData('previousBodyCenterX') ?? null,
            previousBodyCenterY: nuke?.getData('previousBodyCenterY') ?? null,
          };
          if (nuke) {
            this.destroyProjectile(nuke);
          }
          return result;
        });
        this.#currentNukes = initialNukes;
        this.#rearmProgress = initialRearm;
        this.#nukesFired = initialFired;
        this.updateNukeHud();
        return results;
      },
      verifyNukeAmmoGuard: () => {
        const initialNukes = this.#currentNukes;
        const initialRearm = this.#rearmProgress;
        const initialFired = this.#nukesFired;
        this.#currentNukes = LEVEL_ONE_SLICE.maxNukes;
        this.#rearmProgress = LEVEL_ONE_SLICE.nukeRearmMax;
        const first = this.fireNuke();
        if (first) this.destroyProjectile(first);
        this.#rearmProgress = LEVEL_ONE_SLICE.nukeRearmMax;
        const second = this.fireNuke();
        if (second) this.destroyProjectile(second);
        const exhaustedNukes = this.#currentNukes;
        const blocked = this.fireNuke();
        if (blocked) this.destroyProjectile(blocked);
        const result = {
          firstFired: Boolean(first),
          secondFired: Boolean(second),
          exhaustedNukes,
          thirdBlocked: blocked === null,
          activeProjectiles: this.#nukes.getChildren().filter((child) => child.active).length,
        };
        this.#currentNukes = initialNukes;
        this.#rearmProgress = initialRearm;
        this.#nukesFired = initialFired;
        this.updateNukeHud();
        return result;
      },
      verifyNukeRearmLifecycle: () => {
        const initialNukes = this.#currentNukes;
        const initialRearm = this.#rearmProgress;
        this.#currentNukes = 0;
        this.#rearmProgress = LEVEL_ONE_SLICE.nukeRearmMax - 1;
        this.updateNukeRearm(50);
        const firstCompletion = { currentNukes: this.#currentNukes, rearmProgress: this.#rearmProgress };
        this.#currentNukes = LEVEL_ONE_SLICE.maxNukes - 1;
        this.#rearmProgress = LEVEL_ONE_SLICE.nukeRearmMax - 1;
        this.updateNukeRearm(50);
        const cappedCompletion = { currentNukes: this.#currentNukes, rearmProgress: this.#rearmProgress };
        this.#currentNukes = initialNukes;
        this.#rearmProgress = initialRearm;
        this.updateNukeHud();
        return { firstCompletion, cappedCompletion };
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
      continueCampaign: () => this.runTerminalAction('continue'),
      replay: () => this.runTerminalAction('replay'),
      menu: () => this.runTerminalAction('menu'),
      triggerBoarding: () => {
        const anchor = this.#definition.boarding_anchors?.[0];
        const scout = anchor ? this.getActiveScouts().find((candidate) => candidate.getData('entityId') === anchor.source_entity_id
          || (Number(candidate.getData('row')) === anchor.source_selector.row
            && Number(candidate.getData('col')) === anchor.source_selector.column)) : null;
        if (!scout) return { launched: false, reason: 'boarding-anchor-not-available' };
        this.destroyScoutBody(scout, true);
        return { launched: this.#boardingActive, anchorId: anchor?.id ?? null, gameRunId: this.#session.runId };
      },
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
      campaign: {
        sequence: this.#campaignSequence,
        levelId: this.#definition.id,
        levelName: this.#definition.name,
        checksum: this.levelRuntime?.checksum ?? null,
        source: this.levelRuntime?.source ?? 'package',
        finalSequence: CAMPAIGN_DEFINITIONS.length,
      },
      score: this.#score.value,
      lives: this.#lives.value,
      maxLives: this.#lives.maxLives,
      activeScouts: this.getActiveScouts().length,
      activeShieldTiles: this.getActiveShieldTiles().length,
      bunkerCount: this.#definition.shields[0].count,
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
      terminalActions: this.#terminalActions.map((action) => ({ ...action })),
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
      hudPositions: {
        score: { x: Math.round(this.#scoreText.x), y: Math.round(this.#scoreText.y) },
        sound: { x: Math.round(this.#soundIcon.x), y: Math.round(this.#soundIcon.y), texture: this.#soundIcon.texture.key },
        lives: this.#lifeIcons.map((icon) => ({ x: Math.round(icon.x), y: Math.round(icon.y), visible: icon.visible, texture: icon.texture.key })),
        nukes: this.#nukeIcons.map((icon) => ({ x: Math.round(icon.x), y: Math.round(icon.y), visible: icon.visible, texture: icon.texture.key })),
        rearm: { x: Math.round(this.#rearmText.x), y: Math.round(this.#rearmText.y), text: this.#rearmText.text },
        rearmBar: {
          x: Math.round(this.#rearmBarBack.x),
          y: Math.round(this.#rearmBarBack.y),
          width: Math.round(this.#rearmBarBack.displayWidth),
          fillWidth: Math.round(this.#rearmBarFill.displayWidth),
        },
      },
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
      shieldBottomGapPlayerHeights: (this.#layout.playerSpawn.y - (this.#layout.shieldZone.y + this.#layout.shieldZone.height)) / this.#layout.playerSize.height,
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
          angle: scout.angle,
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
        return { x: Math.round(laser.x), y: Math.round(laser.y), angle: laser.angle, display: { width: Math.round(laser.displayWidth), height: Math.round(laser.displayHeight) }, worldBounds: { width: Math.round(bounds.width), height: Math.round(bounds.height) }, body: { x: Math.round(body.x), y: Math.round(body.y), width: Math.round(body.width), height: Math.round(body.height) }, previousBodyCenterX: laser.getData('previousBodyCenterX'), previousBodyCenterY: laser.getData('previousBodyCenterY') };
      }),
      enemyLaserBodies: (this.#enemyLasers?.getChildren().filter((child) => child.active) as Phaser.Physics.Arcade.Image[] ?? []).map((laser) => {
        const body = laser.body as Phaser.Physics.Arcade.Body;
        const bounds = laser.getBounds();
        return { x: Math.round(laser.x), y: Math.round(laser.y), angle: laser.angle, display: { width: Math.round(laser.displayWidth), height: Math.round(laser.displayHeight) }, worldBounds: { width: Math.round(bounds.width), height: Math.round(bounds.height) }, body: { x: Math.round(body.x), y: Math.round(body.y), width: Math.round(body.width), height: Math.round(body.height) }, previousBodyCenterX: laser.getData('previousBodyCenterX'), previousBodyCenterY: laser.getData('previousBodyCenterY') };
      }),
      nukeBodies: (this.#nukes?.getChildren().filter((child) => child.active) as Phaser.Physics.Arcade.Sprite[] ?? []).map((nuke) => {
        const body = nuke.body as Phaser.Physics.Arcade.Body;
        const bounds = nuke.getBounds();
        return { x: Math.round(nuke.x), y: Math.round(nuke.y), texture: nuke.texture.key, animation: nuke.anims.currentAnim?.key ?? null, angle: nuke.angle, display: { width: Math.round(nuke.displayWidth), height: Math.round(nuke.displayHeight) }, worldBounds: { width: Math.round(bounds.width), height: Math.round(bounds.height) }, body: { x: Math.round(body.x), y: Math.round(body.y), width: Math.round(body.width), height: Math.round(body.height) }, previousBodyCenterX: nuke.getData('previousBodyCenterX'), previousBodyCenterY: nuke.getData('previousBodyCenterY') };
      }),
    };
  }
}
