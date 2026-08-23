const GG_FONT_TITLE = "'GalacticGunnersTitle', 'GalacticGunnersDisplay', Arial, sans-serif";
const GG_FONT_DISPLAY = "'GalacticGunnersDisplay', Arial, sans-serif";

const GG_SCORE_EVENTS = Object.freeze({
    LASER_TARGET: 5,
    ASTEROID_DESTROYED: 10,
    SCOUT_DESTROYED: 25,
    SHIP_DESTROYED: 50,
    MOTHERSHIP_HIT: 50,
    MOTHERSHIP_DESTROYED: 1000,
    COMET_DESTROYED: 500,
    SHIELD_TILE_ENEMY_HIT: -1
});

function ggTitleStyle(size) {
    return {
        fontFamily: GG_FONT_TITLE,
        fontSize: size || 96,
        align: "center",
        color: "#f6f7ff",
        stroke: "#0b173c",
        strokeThickness: 5,
        shadow: { offsetX: 0, offsetY: 2, color: "#00d9ff", blur: 8, fill: true }
    };
}

function ggDisplayStyle(size, color) {
    return {
        fontFamily: GG_FONT_DISPLAY,
        fontSize: size || 42,
        align: "center",
        color: color || "#f6f7ff",
        stroke: "#081226",
        strokeThickness: 4
    };
}

function ggMakeText(scene, x, y, text, style) {
    return scene.add.text(x, y, text, style).setOrigin(0.5);
}

function ggApplyScore(scene, amount) {
    score += amount;
    if (textScore && textScore.setText) textScore.setText("Score: " + score);
}

function ggScoreEvent(scene, eventName) {
    ggApplyScore(scene, GG_SCORE_EVENTS[eventName]);
}

function ggEnemyScoreEvent(enemy) {
    return enemy && enemy.ggScoreEvent ? enemy.ggScoreEvent : "SHIP_DESTROYED";
}

function ggCreateHud(scene, options) {
    var showReplay = options && options.showReplay;
    var topY = scene.game.config.height * 0.035;
    var bottomY = scene.game.config.height * 0.955;
    var textStyle = ggDisplayStyle(34, "#ffffff");

    textScore = scene.add.text(scene.game.config.width * 0.03, topY, "Score: " + score, textStyle).setOrigin(0, 0.5);
    textLives = scene.add.text(scene.game.config.width * 0.03, bottomY, "Lives: " + currentLives, textStyle).setOrigin(0, 0.5);
    textNukesLoad = scene.add.text(scene.game.config.width * 0.97, bottomY, "ReArm: 150/150", textStyle).setOrigin(1, 0.5);
    textNukes = scene.add.text(scene.game.config.width * 0.97, topY, "Nukes: " + currentNukes, textStyle).setOrigin(1, 0.5);

    if (scene.textures.exists("hudLife")) {
        scene.add.image(scene.game.config.width * 0.015, bottomY, "hudLife").setDisplaySize(28, 28).setOrigin(0, 0.5);
    }
    if (scene.textures.exists("hudNuke")) {
        scene.add.image(scene.game.config.width * 0.985, topY, "hudNuke").setDisplaySize(28, 28).setOrigin(1, 0.5);
    }
    if (showReplay) {
        restartlevel = scene.add.text(scene.game.config.width * 0.5, topY, "Replay: " + LevelRestart, textStyle).setOrigin(0.5);
    }
}

function ggToggleMute(scene, button) {
    isMuted = !isMuted;
    scene.game.sound.mute = isMuted;
    if (button) {
        button.setTexture(isMuted ? "mute" : "sound");
        button.setTint(isMuted ? 0xff4b5c : 0x70fff2);
    }
}

function ggAddMuteButton(scene, gridIndex) {
    var button = scene.add.image(0, 0, isMuted ? "mute" : "sound").setInteractive();
    if (scene.aGrid) scene.aGrid.placeAtIndex(gridIndex || 99, button);
    Align.scaleToGameW(button, 0.045);
    button.setTint(isMuted ? 0xff4b5c : 0x70fff2);
    button.on("pointerdown", function() { ggToggleMute(scene, button); });
    return button;
}

function ggCreateComets(scene) {
    scene.time.addEvent({
        delay: 9000,
        callback: function() {
            var fromLeft = Phaser.Math.Between(0, 1) === 0;
            var comet = new Comet(
                scene,
                fromLeft ? 0 : scene.game.config.width,
                Phaser.Math.RND.integerInRange(scene.game.config.height * 0.12, scene.game.config.height * 0.62)
            );
            comet.setVelocity(
                fromLeft ? Phaser.Math.RND.integerInRange(140, 240) : Phaser.Math.RND.integerInRange(-240, -140),
                Phaser.Math.RND.integerInRange(40, 160)
            );
            scene.comets.add(comet);
        },
        callbackScope: scene,
        loop: true
    });
}

function ggAwardComet(scene, comet, nukeBurst) {
    if (!comet || !comet.active) return;
    if (nukeBurst) {
        scene.createNukeExplosion(comet.x, comet.y);
    }
    else {
        scene.createExplosion(comet.x, comet.y);
    }
    ggScoreEvent(scene, "COMET_DESTROYED");
    currentNukes++;
    if (textNukes && textNukes.setText) textNukes.setText("Nukes: " + currentNukes);
    comet.destroy();
}

function ggInstallCometCollisions(scene) {
    scene.physics.add.overlap(scene.playerLasers, scene.comets, function(laser, comet) {
        if (laser) laser.destroy();
        ggAwardComet(scene, comet, false);
    }, null, scene);

    scene.physics.add.overlap(scene.starNukes, scene.comets, function(nuke, comet) {
        if (nuke) {
            nuke.destroy();
            emitter.stop();
        }
        ggAwardComet(scene, comet, true);
    }, null, scene);

    scene.physics.add.overlap(scene.player, scene.comets, function(player, comet) {
        if (comet) comet.destroy();
        if (player) {
            scene.createExplosion(player.x, player.y);
            player.body.reset(scene.game.config.width * 0.5, scene.game.config.height - 50);
            scene.onLifeDown();
        }
    }, null, scene);
}

function ggResetToMenu(scene) {
    enemyShips = 0;
    enemyDeaths = 0;
    totalEnemyShips = 0;
    currentLives = 0;
    currentNukes = 0;
    motherShipAlive = true;
    motherShipLives = maxMotherShipLives;
    RIP = false;
    levelWon = false;
    score = 0;
    scene.scene.start("MainMenu");
}

function ggResetRun() {
    enemyShips = 0;
    enemyDeaths = 0;
    totalEnemyShips = 0;
    currentLives = 0;
    currentNukes = 0;
    motherShipAlive = true;
    motherShipLives = maxMotherShipLives;
    RIP = false;
    levelWon = false;
    score = 0;
}

function ggRenderGameOver(scene, restartCallback, menuCallback) {
    RIP = true;
    if (textScore) textScore.setText("Final Score: " + score);
    if (textLives) textLives.setText("Lives: GAME OVER");
    var panel = scene.add.image(scene.game.config.width * 0.5, scene.game.config.height * 0.52, "gameOver").setOrigin(0.5);
    Align.scaleToGameW(panel, 0.78);
    panel.setDepth(20);

    ggMakeText(scene, scene.game.config.width * 0.5, scene.game.config.height * 0.18, "GAME OVER", ggTitleStyle(96)).setDepth(21);
    ggMakeText(scene, scene.game.config.width * 0.5, scene.game.config.height * 0.36, "Final Score: " + score, ggDisplayStyle(44, "#ffffff")).setDepth(21);

    var restart = ggMakeText(scene, scene.game.config.width * 0.42, scene.game.config.height * 0.76, "RESTART", ggDisplayStyle(38, "#70fff2")).setDepth(21).setInteractive();
    var menu = ggMakeText(scene, scene.game.config.width * 0.58, scene.game.config.height * 0.76, "MENU", ggDisplayStyle(38, "#70fff2")).setDepth(21).setInteractive();
    restart.on("pointerdown", restartCallback);
    menu.on("pointerdown", menuCallback);
}

function ggRenderVictory(scene, title, body, nextLabel, nextCallback) {
    var panel = scene.add.image(scene.game.config.width * 0.5, scene.game.config.height * 0.54, "fireworks").setOrigin(0.5);
    Align.scaleToGameW(panel, 0.7);
    panel.setDepth(20);
    ggMakeText(scene, scene.game.config.width * 0.5, scene.game.config.height * 0.18, title, ggTitleStyle(86)).setDepth(21);
    ggMakeText(scene, scene.game.config.width * 0.5, scene.game.config.height * 0.36, "Score: " + score, ggDisplayStyle(44, "#ffffff")).setDepth(21);
    ggMakeText(scene, scene.game.config.width * 0.5, scene.game.config.height * 0.49, body, ggDisplayStyle(34, "#f6f7ff")).setDepth(21);
    var next = ggMakeText(scene, scene.game.config.width * 0.5, scene.game.config.height * 0.76, nextLabel, ggDisplayStyle(38, "#70fff2")).setDepth(21).setInteractive();
    next.on("pointerdown", nextCallback);
}
