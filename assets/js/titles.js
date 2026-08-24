class Titles extends Phaser.Scene {
  constructor() {
    super({ key: "Titles" });
  }

  create() {
    this.background = new Background(this, this.game.config.width * 0.5, this.game.config.height * 0.5, "backgroundstars");
    this.sfx = ggCreateUiSfx(this);
    this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.keyM = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);

    var w = this.game.config.width;
    var h = this.game.config.height;
    var logo = this.add.image(w * 0.5, h * 0.12, "logoPrimary").setOrigin(0.5);
    Align.scaleToGameW(logo, 0.34);

    ggMakeText(this, w * 0.5, h * 0.28, "CREDITS / PROVENANCE", ggGoldStyle(64, "#ffb43c"));
    ggMakeText(this, w * 0.5, h * 0.42, TitlesText, ggDisplayStyle(32, "#f6f7ff")).setLineSpacing(8);
    ggMakeText(this, w * 0.5, h * 0.67, "FINAL SCORE  " + score, ggDisplayStyle(34, "#70fff2"));

    var replay = ggAddPanelHit(this, "REPLAY", w * 0.42, h * 0.86, w * 0.2, h * 0.09, function() {
      ggRestartGameplay(this, "Level1");
    }.bind(this));
    var menu = ggAddPanelHit(this, "MENU", w * 0.58, h * 0.86, w * 0.2, h * 0.09, function() {
      ggResetToMenu(this);
    }.bind(this));
    ggMakeText(this, replay.x, replay.y, "PLAY AGAIN", ggGoldStyle(30, "#ffb43c")).setDepth(27);
    ggMakeText(this, menu.x, menu.y, "MENU", ggDisplayStyle(30, "#70fff2")).setDepth(27);

    this.time.addEvent({
      delay: 100,
      callback: function() {
        if (this.keyEnter.isDown || this.keyR.isDown || controllerActionPressed("start") || controllerActionPressed("restart")) {
          ggRestartGameplay(this, "Level1");
        }
        if (this.keyM.isDown || controllerActionPressed("info")) {
          ggResetToMenu(this);
        }
      },
      callbackScope: this,
      loop: true
    });
  }
}
