import * as Phaser from "phaser";

import { REQUIRED_RUNTIME_ASSETS, RUNTIME_ASSETS } from "../config/assets";
import {
  GENERATED_SPRITE_ASSET_KEYS,
  GENERATED_SPRITE_BY_KEY,
  GENERATED_SPRITE_CATALOGUE,
} from "../config/generatedSpriteCatalogue";
import type { GameRuntimeConfig } from "../config/gameConfig";
import { levelChecksum } from "../levels/LevelChecksum";
import { compileLevelDocument } from "../levels/LevelCompiler";
import type { LevelDefinition } from "../levels/LevelDefinition";
import type { LevelRuntimeConfig } from "../levels/LevelRuntimeConfig";
import { CAMPAIGN_DEFINITIONS } from "../levels/campaignDefinitions";
import { LEVEL_ONE_DEFINITION } from "../levels/levelOneDefinition";
import { validateLevelDefinition } from "../levels/LevelValidator";
import { GameApiClient } from "../services/GameApiClient";
import { CampaignSession } from "../systems/CampaignSession";

export class BootScene extends Phaser.Scene {
  constructor(private readonly runtimeConfig: GameRuntimeConfig = {}) {
    super("BootScene");
  }

  preload(): void {
    this.registry.set("runtimeConfig", this.runtimeConfig);
    for (const asset of REQUIRED_RUNTIME_ASSETS) {
      if (GENERATED_SPRITE_ASSET_KEYS.has(asset.key)) continue;
      if (asset.key.startsWith("audio.")) {
        continue;
      } else {
        this.load.image(asset.key, asset.runtimePath);
      }
    }
    for (const definition of GENERATED_SPRITE_CATALOGUE) {
      if (definition.assetKey.startsWith("boarding.")) continue;
      if (definition.frameCount === 1) {
        this.load.image(definition.assetKey, definition.runtimePath);
      } else {
        this.load.spritesheet(definition.assetKey, definition.runtimePath, {
          frameWidth: definition.frameWidth,
          frameHeight: definition.frameHeight,
        });
      }
    }
  }

  async create(): Promise<void> {
    try {
      const missing = REQUIRED_RUNTIME_ASSETS.filter((asset) => {
        if (asset.key.startsWith("audio.")) {
          return false;
        }
        return !this.textures.exists(asset.key);
      });
      if (missing.length > 0) {
        this.add.text(
          40,
          40,
          `Missing required assets:\n${missing.map((asset) => asset.key).join("\n")}`,
          {
            color: "#ff3b30",
            fontFamily: "monospace",
            fontSize: "24px",
          },
        );
        return;
      }

      this.createShipAnimations();
      this.queueOptionalAudio();
      validateLevelDefinition(LEVEL_ONE_DEFINITION);
      // Golden Level 1 must start without an API request. Remote resolution is an
      // explicit campaign-loader capability, never an implicit gameplay dependency.
      const previewRuntime = this.runtimeConfig.previewRuntime;
      if (previewRuntime) {
        validateLevelDefinition(previewRuntime.definition);
        this.registry.set("campaignRuntime", [previewRuntime]);
        this.registry.set("levelRuntime", previewRuntime);
        this.registry.set("campaignPreview", true);
        this.registry.set(
          "campaignSession",
          new CampaignSession(null, previewRuntime.definition.seed),
        );
        this.createRuntimeAnimations();
        this.scene.start("Level1Scene", {
          sequence: previewRuntime.definition.sequence,
        });
        return;
      }
      const campaignSession = new CampaignSession(
        this.runtimeConfig.apiBaseUrl
          ? new GameApiClient(this.runtimeConfig.apiBaseUrl)
          : null,
        LEVEL_ONE_DEFINITION.seed,
      );
      const campaign = await campaignSession.start();
      let campaignRuntime: LevelRuntimeConfig[];
      if (
        campaign?.entry?.level.definition &&
        typeof campaign.entry.level.definition === "object"
      ) {
        const definition = compileLevelDocument(
          campaign.entry.level.definition as LevelDefinition,
        );
        validateLevelDefinition(definition);
        campaignRuntime = [
          {
            definition,
            version: campaign.entry.level.version,
            checksum: campaign.entry.level.checksum,
            source: "remote",
          },
        ];
      } else if (
        this.runtimeConfig.apiBaseUrl &&
        !this.runtimeConfig.allowOfflinePackage
      ) {
        // Browser campaign play is server-release governed. A healthy same-origin
        // API must never silently fall back to packaged content.
        throw new Error("Campaign release authority is unavailable.");
      } else {
        validateLevelDefinition(LEVEL_ONE_DEFINITION);
        campaignRuntime = [
          {
            definition: LEVEL_ONE_DEFINITION,
            version: LEVEL_ONE_DEFINITION.version,
            checksum: await levelChecksum(LEVEL_ONE_DEFINITION),
            source: "package",
          },
        ];
      }
      this.registry.set("campaignRuntime", campaignRuntime);
      this.registry.set("levelRuntime", campaignRuntime[0]);
      this.registry.set("campaignSession", campaignSession);

      this.createRuntimeAnimations();
      // Hostile verification exercises gameplay state, not the separately tested
      // launch presentation. Skipping the two-second splash here prevents
      // background-tab timer throttling from turning a condition wait into noise.
      this.scene.start(
        this.runtimeConfig.hostileQa ? "MainMenuScene" : "SplashScene",
      );
    } catch (error) {
      const runtimeError =
        error instanceof Error ? error : new Error(String(error));
      this.runtimeConfig.onRuntimeError?.(runtimeError);
      this.add.text(
        40,
        40,
        "Galactic Gunners could not start. Please return to the home screen and try again.",
        {
          color: "#ff3b30",
          fontFamily: "monospace",
          fontSize: "24px",
        },
      );
    }
  }

  private createRuntimeAnimations(): void {
    this.createCatalogueAnimation(
      "fx.explosionSmall",
      "fx.explosionSmall.play",
      true,
    );
    this.createCatalogueAnimation("projectile.nuke", "projectile.nuke.fly");
    this.createCatalogueAnimation("fx.nukeBurst", "fx.nukeBurst.play", true);
  }

  /**
   * WebKit can reject the Founder-supplied WAV container even after a valid
   * HTTP response. Audio is an enhancement, never permission for the visual
   * game boot to stall. Successful decodes join the cache asynchronously and
   * gameplay checks that cache before requesting a cue.
   */
  private queueOptionalAudio(): void {
    for (const asset of REQUIRED_RUNTIME_ASSETS) {
      if (asset.key.startsWith("audio.")) {
        this.load.audio(asset.key, asset.runtimePath);
      }
    }
    this.load.start();
  }

  private createShipAnimations(): void {
    this.createCatalogueAnimation("player.ship", "player.ship.idle");
    this.createCatalogueAnimation("enemy.scout", "enemy.scout.idle");
    this.createCatalogueAnimation("enemy.cruiser", "enemy.cruiser.idle");
    this.createCatalogueAnimation("enemy.destroyer", "enemy.destroyer.idle");
    this.createCatalogueAnimation("enemy.mothership", "enemy.mothership.idle");
  }

  private createCatalogueAnimation(
    assetKey: string,
    animationKey: string,
    hideOnComplete = false,
  ): void {
    const definition = GENERATED_SPRITE_BY_KEY.get(assetKey);
    if (!definition || definition.static) return;
    this.anims.create({
      key: animationKey,
      frames: this.anims.generateFrameNumbers(assetKey, {
        start: 0,
        end: definition.frameCount - 1,
      }),
      frameRate: definition.frameRate,
      repeat: definition.repeat ? -1 : 0,
      hideOnComplete,
    });
  }
}
