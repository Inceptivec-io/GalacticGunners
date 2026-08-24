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

const GG_AUDIO = Object.freeze({
    UI_SELECT: "gg_ui_select_v001",
    UI_CONFIRM: "gg_ui_confirm_v001",
    UI_BACK: "gg_ui_back_v001",
    PLAYER_LASER: "gg_player_laser_v001",
    ENEMY_LASER: "gg_enemy_laser_v001",
    SHIELD_HIT: "gg_shield_hit_v001",
    EXPLOSION_SMALL: "gg_explosion_small_v001",
    EXPLOSION_LARGE: "gg_explosion_large_v001",
    NUKE_FIRE: "gg_nuke_fire_v001",
    NUKE_BURST: "gg_nuke_burst_v001",
    COMET_DESTROYED: "gg_comet_destroyed_v001",
    PLAYER_HIT: "gg_player_hit_v001",
    MOTHERSHIP_HIT: "gg_mothership_hit_v001",
    MOTHERSHIP_DESTROYED: "gg_mothership_destroyed_v001",
    VICTORY_STINGER: "gg_victory_stinger_v001",
    GAME_OVER_STINGER: "gg_game_over_stinger_v001"
});

const GG_AUDIO_FILES = Object.freeze([
    GG_AUDIO.UI_SELECT,
    GG_AUDIO.UI_CONFIRM,
    GG_AUDIO.UI_BACK,
    GG_AUDIO.PLAYER_LASER,
    GG_AUDIO.ENEMY_LASER,
    GG_AUDIO.SHIELD_HIT,
    GG_AUDIO.EXPLOSION_SMALL,
    GG_AUDIO.EXPLOSION_LARGE,
    GG_AUDIO.NUKE_FIRE,
    GG_AUDIO.NUKE_BURST,
    GG_AUDIO.COMET_DESTROYED,
    GG_AUDIO.PLAYER_HIT,
    GG_AUDIO.MOTHERSHIP_HIT,
    GG_AUDIO.MOTHERSHIP_DESTROYED,
    GG_AUDIO.VICTORY_STINGER,
    GG_AUDIO.GAME_OVER_STINGER
]);

const GG_AUDIO_VOLUME = Object.freeze({
    gg_ui_select_v001: 0.25,
    gg_ui_confirm_v001: 0.32,
    gg_ui_back_v001: 0.28,
    gg_player_laser_v001: 0.3,
    gg_enemy_laser_v001: 0.24,
    gg_shield_hit_v001: 0.34,
    gg_explosion_small_v001: 0.42,
    gg_explosion_large_v001: 0.52,
    gg_nuke_fire_v001: 0.48,
    gg_nuke_burst_v001: 0.62,
    gg_comet_destroyed_v001: 0.42,
    gg_player_hit_v001: 0.46,
    gg_mothership_hit_v001: 0.5,
    gg_mothership_destroyed_v001: 0.66,
    gg_victory_stinger_v001: 0.62,
    gg_game_over_stinger_v001: 0.58
});

const GG_AUDIO_THROTTLE_MS = Object.freeze({
    gg_ui_select_v001: 90,
    gg_player_laser_v001: 45,
    gg_enemy_laser_v001: 110,
    gg_explosion_small_v001: 35,
    gg_shield_hit_v001: 45
});

function ggPreloadAudio(scene) {
    GG_AUDIO_FILES.forEach(function(key) {
        scene.load.audio(key, "assets/audio/" + key + ".wav");
    });
}

function ggPlayAudio(scene, key, options) {
    if (!scene || !scene.sound || !key) return;
    var now = scene.time && typeof scene.time.now === "number" ? scene.time.now : Date.now();
    var throttle = GG_AUDIO_THROTTLE_MS[key] || 0;
    scene.ggAudioLastPlayed = scene.ggAudioLastPlayed || {};
    if (throttle && scene.ggAudioLastPlayed[key] && now - scene.ggAudioLastPlayed[key] < throttle) return;
    scene.ggAudioLastPlayed[key] = now;

    var volume = options && typeof options.volume === "number" ? options.volume : GG_AUDIO_VOLUME[key] || 0.45;
    scene.sound.play(key, { volume: volume });
}

function ggPlayAudioOnce(scene, marker, key) {
    if (!scene || !marker) return;
    scene.ggAudioOnce = scene.ggAudioOnce || {};
    if (scene.ggAudioOnce[marker]) return;
    scene.ggAudioOnce[marker] = true;
    ggPlayAudio(scene, key);
}

function ggAudioHandle(scene, key) {
    return {
        play: function() {
            ggPlayAudio(scene, key);
        }
    };
}

function ggCreateGameplaySfx(scene) {
    return {
        uiSelect: ggAudioHandle(scene, GG_AUDIO.UI_SELECT),
        uiConfirm: ggAudioHandle(scene, GG_AUDIO.UI_CONFIRM),
        uiBack: ggAudioHandle(scene, GG_AUDIO.UI_BACK),
        laserPlayer: ggAudioHandle(scene, GG_AUDIO.PLAYER_LASER),
        laserEnemy: ggAudioHandle(scene, GG_AUDIO.ENEMY_LASER),
        shieldHit: ggAudioHandle(scene, GG_AUDIO.SHIELD_HIT),
        explode: ggAudioHandle(scene, GG_AUDIO.EXPLOSION_SMALL),
        explosionSmall: ggAudioHandle(scene, GG_AUDIO.EXPLOSION_SMALL),
        explosionLarge: ggAudioHandle(scene, GG_AUDIO.EXPLOSION_LARGE),
        nukeFiring: ggAudioHandle(scene, GG_AUDIO.NUKE_FIRE),
        nukeBurst: ggAudioHandle(scene, GG_AUDIO.NUKE_BURST),
        cometDestroyed: ggAudioHandle(scene, GG_AUDIO.COMET_DESTROYED),
        playerHit: ggAudioHandle(scene, GG_AUDIO.PLAYER_HIT),
        mothershipHit: ggAudioHandle(scene, GG_AUDIO.MOTHERSHIP_HIT),
        mothershipDestroyed: ggAudioHandle(scene, GG_AUDIO.MOTHERSHIP_DESTROYED),
        victory: ggAudioHandle(scene, GG_AUDIO.VICTORY_STINGER),
        gameOver: ggAudioHandle(scene, GG_AUDIO.GAME_OVER_STINGER)
    };
}

function ggCreateUiSfx(scene) {
    return {
        select: ggAudioHandle(scene, GG_AUDIO.UI_SELECT),
        confirm: ggAudioHandle(scene, GG_AUDIO.UI_CONFIRM),
        back: ggAudioHandle(scene, GG_AUDIO.UI_BACK),
        btn: ggAudioHandle(scene, GG_AUDIO.UI_CONFIRM)
    };
}

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
    if (RIP && finalScore !== null) return;
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

function ggSetHudVisible(visible) {
    [textScore, textLives, textNukesLoad, textNukes, restartlevel].forEach(function(item) {
        if (item && item.setVisible) item.setVisible(visible);
    });
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
    if (RIP) return;
    if (!comet || !comet.active) return;
    ggPlayAudio(scene, GG_AUDIO.COMET_DESTROYED);
    if (nukeBurst) {
        scene.createNukeExplosion(comet.x, comet.y, false);
    }
    else {
        scene.createExplosion(comet.x, comet.y, false);
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
            scene.createExplosion(player.x, player.y, "playerHit");
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
    finalScore = null;
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
    finalScore = null;
}

function ggRestartGameplay(scene, sceneKey) {
    enemyShips = 0;
    enemyDeaths = 0;
    totalEnemyShips = 0;
    currentLives = maxLives;
    currentNukes = maxNukes;
    motherShipAlive = true;
    motherShipLives = maxMotherShipLives;
    RIP = false;
    levelWon = false;
    finalScore = null;
    score = 0;
    scene.scene.start(sceneKey);
}

function ggRenderGameOver(scene, menuCallback, replayCallback, tryAgainCallback) {
    RIP = true;
    finalScore = score;
    ggSetHudVisible(false);
    ggPlayAudioOnce(scene, "game-over-entry", GG_AUDIO.GAME_OVER_STINGER);
    if (textScore) textScore.setText("Final Score: " + finalScore);
    if (textLives) textLives.setText("Lives: GAME OVER");
    var panel = scene.add.image(scene.game.config.width * 0.5, scene.game.config.height * 0.52, "gameOver").setOrigin(0.5);
    Align.scaleToGameW(panel, 0.78);
    panel.setDepth(20);

    ggMakeText(scene, scene.game.config.width * 0.5, scene.game.config.height * 0.18, "GAME OVER", ggTitleStyle(96)).setDepth(21);
    ggMakeText(scene, scene.game.config.width * 0.5, scene.game.config.height * 0.36, "Final Score: " + finalScore, ggDisplayStyle(44, "#ffffff")).setDepth(21);

    var buttonY = scene.game.config.height * 0.735;
    var buttonW = scene.game.config.width * 0.18;
    var buttonH = scene.game.config.height * 0.08;
    var buttons = [
        { x: scene.game.config.width * 0.35, callback: menuCallback },
        { x: scene.game.config.width * 0.5, callback: replayCallback },
        { x: scene.game.config.width * 0.65, callback: tryAgainCallback }
    ];
    buttons.forEach(function(button) {
        scene.add.zone(button.x, buttonY, buttonW, buttonH).setDepth(24).setInteractive().on("pointerdown", button.callback);
    });
}

function ggRenderVictory(scene, title, body, nextLabel, nextCallback) {
    ggPlayAudioOnce(scene, "victory-entry", GG_AUDIO.VICTORY_STINGER);
    var panel = scene.add.image(scene.game.config.width * 0.5, scene.game.config.height * 0.54, "fireworks").setOrigin(0.5);
    Align.scaleToGameW(panel, 0.7);
    panel.setDepth(20);
    ggMakeText(scene, scene.game.config.width * 0.5, scene.game.config.height * 0.18, title, ggTitleStyle(86)).setDepth(21);
    ggMakeText(scene, scene.game.config.width * 0.5, scene.game.config.height * 0.36, "Score: " + score, ggDisplayStyle(44, "#ffffff")).setDepth(21);
    ggMakeText(scene, scene.game.config.width * 0.5, scene.game.config.height * 0.49, body, ggDisplayStyle(34, "#f6f7ff")).setDepth(21);
    var next = ggMakeText(scene, scene.game.config.width * 0.5, scene.game.config.height * 0.76, nextLabel, ggDisplayStyle(38, "#70fff2")).setDepth(21).setInteractive();
    next.on("pointerdown", nextCallback);
}
