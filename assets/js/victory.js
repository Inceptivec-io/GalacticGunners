class Victory extends Phaser.Scene {
  constructor() {
    super({ key: "Victory" });
  }

  init(data) {
    this.finalState = data || window.ggFinalVictoryState || {};
  }

  create() {
    levelWon = true;
    RIP = false;
    score = typeof this.finalState.score === "number" ? this.finalState.score : score;
    finalScore = score;

    this.background = new Background(this, this.game.config.width * 0.5, this.game.config.height * 0.5, "backgroundstars");
    this.sfx = ggCreateUiSfx(this);
    this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.keyM = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);

    ggRenderVictory(
      this,
      "MISSION CLEARED",
      "GALAXY DEFENDED",
      "NEXT",
      function() {
        levelWon = false;
        this.scene.start("Titles");
      }.bind(this),
      {
        wave: "FINAL",
        bonus: this.finalState.bonus || 0,
        replayCallback: function() { ggRestartGameplay(this, "BossLevel"); }.bind(this),
        menuCallback: function() { ggResetToMenu(this); }.bind(this)
      }
    );
  }
}
