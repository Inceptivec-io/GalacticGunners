import * as Phaser from "phaser";

import { RUNTIME_ASSETS } from "../config/assets";
import { InputSystem } from "../systems/InputSystem";

declare global {
  interface Window {
    __GALACTIC_GUNNERS_MENU_QA__?: Record<string, unknown>;
  }
}

export class MainMenuScene extends Phaser.Scene {
  #inputSystem!: InputSystem;
  #started = false;
  #resumeSequence: number | null = null;
  #createdAt = 0;

  constructor() {
    super("MainMenuScene");
  }

  create(): void {
    // Splash completion returns control to the primary interactive surface.
    this.registry.get("runtimeConfig")?.onLaunchStateChange?.("main-menu");
    this.game.canvas.tabIndex = 0;
    this.game.canvas.focus();
    this.#createdAt = performance.now();
    this.#inputSystem = new InputSystem(this);
    const checkpoint = this.registry.get("campaignState") as
      { sequence?: number } | undefined;
    this.#resumeSequence =
      checkpoint?.sequence && checkpoint.sequence > 1
        ? checkpoint.sequence
        : null;

    this.add
      .image(
        this.scale.width / 2,
        this.scale.height / 2,
        RUNTIME_ASSETS.keyArt.heroBattle.key,
      )
      .setDisplaySize(this.scale.width, this.scale.height)
      .setDepth(0);
    this.add
      .rectangle(
        this.scale.width / 2,
        this.scale.height / 2,
        this.scale.width,
        this.scale.height,
        0x02050d,
        0.22,
      )
      .setDepth(1);
    this.add
      .image(
        this.scale.width / 2,
        Math.max(112, this.scale.height * 0.19),
        RUNTIME_ASSETS.branding.primaryLogo.key,
      )
      .setDisplaySize(
        Math.min(700, this.scale.width * 0.72),
        Math.min(234, this.scale.height * 0.26),
      )
      .setDepth(2);

    const subtitle = this.add
      .text(
        this.scale.width / 2,
        this.scale.height * 0.48,
        "DEFEND THE GALAXY",
        {
          color: "#d7e9ff",
          fontFamily: "GalacticGunnersSilverDisplay, Arial, sans-serif",
          fontSize: `${Math.max(26, Math.min(46, this.scale.width * 0.035))}px`,
          align: "center",
        },
      )
      .setOrigin(0.5)
      .setDepth(3);
    subtitle.setData("qa", "main-menu-subtitle");

    const start = this.add
      .text(
        this.scale.width / 2,
        this.scale.height * 0.63,
        this.#resumeSequence ? "RESUME CAMPAIGN" : "START",
        {
          color: "#f7d56a",
          fontFamily: "GalacticGunnersGoldDisplay, Arial, sans-serif",
          fontSize: `${Math.max(58, Math.min(92, this.scale.width * 0.07))}px`,
          align: "center",
        },
      )
      .setOrigin(0.5)
      .setDepth(3)
      .setInteractive({ useHandCursor: true });
    start.setData("qa", "start-button");

    const footer = this.add
      .text(
        this.scale.width / 2,
        this.scale.height * 0.82,
        "ENTER / SPACE / TOUCH / GAMEPAD A",
        {
          color: "#7ee8ff",
          fontFamily: "GalacticGunnersHUD, monospace",
          fontSize: `${Math.max(18, Math.min(24, this.scale.width * 0.017))}px`,
          align: "center",
        },
      )
      .setOrigin(0.5)
      .setDepth(3);
    footer.setData("qa", "input-hint");

    start.on("pointerover", () =>
      this.sound.play(RUNTIME_ASSETS.audio.uiSelect.key),
    );
    start.on("pointerdown", () => this.go());
    if (this.#resumeSequence) {
      const fresh = this.add
        .text(this.scale.width / 2, this.scale.height * 0.73, "NEW CAMPAIGN", {
          color: "#7ee8ff",
          fontFamily: "GalacticGunnersHUD, monospace",
          fontSize: `${Math.max(18, Math.min(28, this.scale.width * 0.022))}px`,
        })
        .setOrigin(0.5)
        .setDepth(3)
        .setInteractive({ useHandCursor: true });
      let confirmationRequested = false;
      fresh.on("pointerdown", () => {
        if (confirmationRequested) {
          this.registry.remove("campaignState");
          this.#resumeSequence = null;
          this.#started = false;
          this.go();
          return;
        }
        confirmationRequested = true;
        fresh.setText("CONFIRM NEW CAMPAIGN");
      });
      fresh.setData("qa", "new-campaign-button");
    }
    this.publishQaState();
  }

  update(): void {
    if (this.#inputSystem.actions.confirm) {
      this.go();
    }
    this.publishQaState();
  }

  private go(): void {
    if (this.#started) {
      return;
    }
    this.#started = true;
    this.sound.play(RUNTIME_ASSETS.audio.uiConfirm.key);
    this.scene.start("Level1Scene", { sequence: this.#resumeSequence ?? 1 });
  }

  private publishQaState(): void {
    if (
      !this.registry.get("runtimeConfig")?.qaDiagnostics ||
      typeof window === "undefined"
    ) {
      return;
    }
    window.__GALACTIC_GUNNERS_MENU_QA__ = {
      scene: "MainMenuScene",
      createdAt: this.#createdAt,
      viewport: { width: this.scale.width, height: this.scale.height },
      visibleTexts: this.children.list
        .filter(
          (child): child is Phaser.GameObjects.Text =>
            child instanceof Phaser.GameObjects.Text,
        )
        .map((text) => text.text),
      heroKeyArt: RUNTIME_ASSETS.keyArt.heroBattle.assetId,
      resumeAvailable: Boolean(this.#resumeSequence),
    };
  }
}
