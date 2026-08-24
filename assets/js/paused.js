class Paused extends Phaser.Scene {
    constructor() {
        super({ key: "Paused" });
    }

    create() {
        this.sfx = ggCreateUiSfx(this);
        this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.ggResumeLocked = false;

        var w = this.game.config.width;
        var h = this.game.config.height;
        this.background = this.add.image(w * 0.5, h * 0.5, "pauseScreen").setOrigin(0.5);
        var scale = Math.max(w / this.background.width, h / this.background.height);
        this.background.setScale(scale);
        this.background.setDepth(0);

        this.resumeZone = this.add.zone(w * 0.5, h * 0.5, w, h).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.resumeZone.setDepth(3);
        this.resumeZone.on("pointerdown", function() {
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
