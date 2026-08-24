class Paused extends Phaser.Scene {
    constructor() {
        super({ key: "Paused" });
    }

    create() {
        this.background = new Background(this, this.game.config.width * 0.5, this.game.config.height * 0.5, "backgroundstars");
        this.sfx = ggCreateUiSfx(this);
        this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.ggResumeLocked = false;

        var w = this.game.config.width;
        var h = this.game.config.height;
        var icon = this.add.image(w * 0.5, h * 0.32, "pauseIcon").setOrigin(0.5);
        icon.clearTint();
        Align.scaleToGameW(icon, 0.16);

        ggMakeText(this, w * 0.5, h * 0.18, "PAUSED", ggGoldStyle(82, "#ffb43c"));
        ggMakeText(this, w * 0.5, h * 0.47, "Resume when ready", ggDisplayStyle(36, "#70fff2"));

        this.btnResume = this.add.image(w * 0.5, h * 0.66, "resume").setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.btnResume.clearTint();
        Align.scaleToGameW(this.btnResume, 0.18);
        this.btnResume.on("pointerover", function() {
            this.sfx.select.play();
            this.btnResume.setAlpha(0.82).setScale(this.btnResume.scaleX * 1.04, this.btnResume.scaleY * 1.04);
        }, this);
        this.btnResume.on("pointerout", function() {
            this.btnResume.setAlpha(1);
            Align.scaleToGameW(this.btnResume, 0.18);
        }, this);
        this.btnResume.on("pointerdown", function() {
            this.resumeGame();
        }, this);

        this.time.addEvent({
            delay: 100,
            callback: function() {
                if (this.keyEnter.isDown || this.keyP.isDown || controllerActionPressed("pause") || controllerActionPressed("resume")) {
                    this.resumeGame();
                }
            },
            callbackScope: this,
            loop: true
        });
    }

    resumeGame() {
        if (this.ggResumeLocked) return;
        this.ggResumeLocked = true;
        if (this.sfx && this.sfx.confirm) this.sfx.confirm.play();
        if (isPaused && isPaused.key) this.scene.resume(isPaused.key);
        this.scene.stop();
    }
}
