const GG_FONT_SILVER = "'Galactic Gunners Silver Display', 'GalacticGunnersDisplay', Arial, sans-serif";
const GG_FONT_GOLD = "'Galactic Gunners Gold Display', 'GalacticGunnersDisplay', Arial, sans-serif";
const GG_FONT_TITLE = GG_FONT_SILVER;
const GG_FONT_DISPLAY = GG_FONT_SILVER;

const GG_SCALES = Object.freeze({
    PLAYER: 0.036,
    ENEMY_LEVEL1: 0.029,
    ENEMY: 0.024,
    SCOUT: 0.025,
    CRUISER: 0.034,
    PLAYER_LASER: 0.026,
    ENEMY_LASER: 0.023,
    MOTHERSHIP_LASER: 0.027
});

const GG_BODY_CONTRACTS = Object.freeze({
    PLAYER: { w: 0.34, h: 0.54, ox: 0.5, oy: 0.36 },
    PLAYER_LASER: { w: 0.78, h: 0.36 },
    NUKE: { w: 0.24, h: 0.72, ox: 0.5, oy: 0.18 },
    SCOUT: { w: 0.42, h: 0.48, ox: 0.5, oy: 0.32 },
    ENEMY: { w: 0.45, h: 0.52, ox: 0.5, oy: 0.32 },
    CRUISER: { w: 0.46, h: 0.54, ox: 0.5, oy: 0.22 },
    MOTHERSHIP: { w: 0.48, h: 0.52, ox: 0.5, oy: 0.22 },
    ENEMY_LASER: { w: 0.78, h: 0.36 },
    COMET: { w: 0.52, h: 0.48, ox: 0.5, oy: 0.28 }
});

function ggSetBodyLocal(sprite, widthRatio, heightRatio, offsetXRatio, offsetYRatio) {
    if (!sprite || !sprite.body) return;
    var frameW = sprite.width || (sprite.frame && sprite.frame.realWidth) || sprite.displayWidth || 1;
    var frameH = sprite.height || (sprite.frame && sprite.frame.realHeight) || sprite.displayHeight || 1;
    var bodyW = Math.max(1, Math.round(frameW * widthRatio));
    var bodyH = Math.max(1, Math.round(frameH * heightRatio));
    var offsetX = Math.round((frameW - bodyW) * (typeof offsetXRatio === "number" ? offsetXRatio : 0.5));
    var offsetY = Math.round((frameH - bodyH) * (typeof offsetYRatio === "number" ? offsetYRatio : 0.5));
    sprite.body.setSize(bodyW, bodyH, false);
    sprite.body.setOffset(offsetX, offsetY);
}

function ggSetBodyEnvelope(sprite, contract) {
    if (!sprite || !sprite.body || !contract) return;
    ggSetBodyLocal(sprite, contract.w, contract.h, contract.ox, contract.oy);
}

function ggSetVerticalProjectileBody(sprite, sourceLengthRatio, sourceThicknessRatio) {
    if (!sprite || !sprite.body) return;
    var frameW = sprite.width || 1;
    var frameH = sprite.height || 1;
    var visualW = sprite.displayWidth || frameW;
    var visualH = sprite.displayHeight || frameH;
    var scaleX = Math.max(0.001, Math.abs(sprite.scaleX || 1));
    var scaleY = Math.max(0.001, Math.abs(sprite.scaleY || 1));
    var desiredBodyW = Math.max(14, Math.round(visualH * sourceThicknessRatio));
    var desiredBodyH = Math.max(32, Math.round(visualW * sourceLengthRatio));
    var bodyW = Math.round(desiredBodyW / scaleX);
    var bodyH = Math.round(desiredBodyH / scaleY);
    sprite.body.setSize(bodyW, bodyH, false);
    sprite.body.setOffset(Math.round((frameW - bodyW) * 0.5), Math.round((frameH - bodyH) * 0.5));
}

function ggPlayerLaserVelocity(scene) {
    return -(scene.game.config.height / 3);
}

function ggEnemyLaserVelocity(scene) {
    return scene.game.config.height * 0.078125;
}

function ggSetEnemyScale(enemy, scale) {
    if (!enemy) return;
    Align.scaleToGameW(enemy, scale || GG_SCALES.ENEMY);
    ggSetBodyEnvelope(enemy, GG_BODY_CONTRACTS.ENEMY);
}

function ggSetPlayerMovementState(scene, moving) {
    if (!scene || !scene.player || !scene.player.active) return;
    if (moving) {
        if (scene.ggPlayerMoving) return;
        scene.ggPlayerMoving = true;
        scene.player.play("playerShipThrust", true);
        return;
    }
    if (!scene.ggPlayerMoving) {
        if (!scene.player.anims || !scene.player.anims.currentAnim) scene.player.setFrame("0");
        return;
    }
    scene.ggPlayerMoving = false;
    scene.player.play("playerShipReturn", true);
    scene.player.once("animationcomplete-playerShipReturn", function() {
        if (scene.player && scene.player.active && !scene.ggPlayerMoving) scene.player.setFrame("0");
    });
}

function ggCullProjectiles(scene) {
    function cull(group, top, bottom, burst) {
        group.getChildren().slice().forEach(function(projectile) {
            if (!projectile || !projectile.active) return;
            if (projectile.y < top || projectile.y > bottom) {
                if (burst) burst(projectile);
                projectile.destroy();
            }
        });
    }
    cull(scene.playerLasers, -24, scene.game.config.height + 24, function(projectile) {
        projectile.ggDestructionReason = "OUT_OF_BOUNDS_QUIET_CULL";
    });
    cull(scene.enemyLasers, -24, scene.game.config.height + 24, function(projectile) {
        projectile.ggDestructionReason = "OUT_OF_BOUNDS_QUIET_CULL";
    });
}

function ggApplyCompletionBonusOnce(scene) {
    if (!scene) return 0;
    if (scene.ggCompletionBonusApplied) return scene.ggCompletionBonusAmount || 0;
    var bonus = ggPendingCompletionBonus();
    scene.ggCompletionBonusApplied = true;
    scene.ggCompletionBonusAmount = bonus;
    ggApplyScore(scene, bonus);
    return bonus;
}

function ggScoreValue(value) {
    return Math.max(0, value || 0);
}

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

function ggGoldStyle(size, color) {
    return {
        fontFamily: GG_FONT_GOLD,
        fontSize: size || 42,
        align: "center",
        color: color || "#ffb43c",
        stroke: "#190b03",
        strokeThickness: 4
    };
}

function ggMakeText(scene, x, y, text, style) {
    return scene.add.text(x, y, text, style).setOrigin(0.5);
}

function ggSceneWaveLabel(scene) {
    var key = scene && scene.scene && scene.scene.key ? scene.scene.key : "";
    if (key === "Level1") return "1";
    if (key === "Level2") return "2";
    if (key === "BossLevel" || key === "Victory") return "FINAL";
    return "CURRENT";
}

function ggPendingCompletionBonus() {
    return (currentLives + currentNukes + LevelRestart) * 100;
}

function ggAddImageButton(scene, x, y, offKey, onKey, callback, scaleW) {
    var button = scene.add.image(x, y, offKey).setOrigin(0.5).setDepth(25).setInteractive({ useHandCursor: true });
    Align.scaleToGameW(button, scaleW || 0.18);
    button.on("pointerover", function() {
        if (scene.sfx && (scene.sfx.select || scene.sfx.uiSelect)) (scene.sfx.select || scene.sfx.uiSelect).play();
        button.setTexture(onKey);
    });
    button.on("pointerout", function() {
        button.setTexture(offKey);
    });
    button.on("pointerdown", function() {
        button.setTexture(onKey);
        if (scene.sfx && (scene.sfx.confirm || scene.sfx.uiConfirm)) (scene.sfx.confirm || scene.sfx.uiConfirm).play();
        if (callback) callback();
    });
    button.ggButtonOffKey = offKey;
    button.ggButtonOnKey = onKey;
    return button;
}

function ggAddPanelHit(scene, role, x, y, width, height, callback) {
    var zone = scene.add.zone(x, y, width, height).setDepth(26).setInteractive({ useHandCursor: true });
    zone.ggButtonRole = role;
    zone.on("pointerover", function() {
        if (scene.sfx && (scene.sfx.select || scene.sfx.uiSelect)) (scene.sfx.select || scene.sfx.uiSelect).play();
    });
    zone.on("pointerdown", function() {
        if (scene.sfx && (scene.sfx.confirm || scene.sfx.uiConfirm)) (scene.sfx.confirm || scene.sfx.uiConfirm).play();
        if (callback) callback();
    });
    return zone;
}

function ggApplyScore(scene, amount) {
    if (RIP && finalScore !== null) return;
    score = ggScoreValue(score + amount);
    ggRefreshHud(scene);
}

function ggScoreEvent(scene, eventName) {
    ggApplyScore(scene, GG_SCORE_EVENTS[eventName]);
}

function ggExplosionAudioEvent(audioEvent) {
    if (audioEvent && typeof audioEvent === "object") return audioEvent.audioEvent;
    return audioEvent;
}

function ggRuntimeEventId(scene, prefix) {
    if (!scene) return prefix + "-UNKNOWN-" + Date.now();
    scene.ggRuntimeEventSerial = (scene.ggRuntimeEventSerial || 0) + 1;
    var sceneKey = scene.scene && scene.scene.key ? scene.scene.key : "UNKNOWN";
    return prefix + "-" + sceneKey + "-" + scene.ggRuntimeEventSerial;
}

function ggAssignEntityId(scene, entity, type) {
    if (!entity) return null;
    if (!entity.ggEntityId) entity.ggEntityId = ggRuntimeEventId(scene, type || "ENTITY");
    if (type && !entity.ggEntityType) entity.ggEntityType = type;
    return entity.ggEntityId;
}

function ggBodyTrace(entity) {
    if (!entity || !entity.body) return null;
    return {
        x: Math.round(entity.body.x),
        y: Math.round(entity.body.y),
        width: Math.round(entity.body.width),
        height: Math.round(entity.body.height)
    };
}

function ggCombatEvent(scene, eventSource, sourceEntity, targetEntity, audioEvent) {
    return {
        eventId: ggRuntimeEventId(scene, eventSource || "COMBAT"),
        audioEvent: audioEvent,
        eventSource: eventSource,
        sourceObject: sourceEntity && sourceEntity.ggEntityType ? sourceEntity.ggEntityType : (sourceEntity && sourceEntity.constructor ? sourceEntity.constructor.name : null),
        targetObject: targetEntity && targetEntity.ggEntityType ? targetEntity.ggEntityType : (targetEntity && targetEntity.constructor ? targetEntity.constructor.name : null),
        sourceEntityId: ggAssignEntityId(scene, sourceEntity, sourceEntity && sourceEntity.ggEntityType),
        targetEntityId: ggAssignEntityId(scene, targetEntity, targetEntity && targetEntity.ggEntityType),
        scoreBefore: typeof score === "number" ? score : 0,
        livesBefore: typeof currentLives === "number" ? currentLives : null
    };
}

function ggExplosionSourceEvent(audioEvent) {
    if (audioEvent && typeof audioEvent === "object" && audioEvent.eventSource) return audioEvent.eventSource;
    if (audioEvent === "playerHit") return "ENEMY_LASER_PLAYER_HIT";
    if (audioEvent === "mothershipHit") return "MOTHERSHIP_HIT_BY_REAL_COLLISION";
    if (audioEvent === "large") return "MOTHERSHIP_DESTROYED_REAL_COLLISION";
    return "UNATTRIBUTED_EXPLOSION";
}

function ggRecordExplosionEvent(scene, x, y, audioEvent, targetDestroyed, scoreBefore) {
    if (!window.ggExplosionTrace) window.ggExplosionTrace = [];
    var before = audioEvent && typeof audioEvent.scoreBefore === "number" ? audioEvent.scoreBefore : scoreBefore;
    var inShieldRegion = !!(scene && scene.game && y >= scene.game.config.height * 0.68);
    var eventSource = ggExplosionSourceEvent(audioEvent);
    var row = {
        eventId: audioEvent && audioEvent.eventId ? audioEvent.eventId : ggRuntimeEventId(scene, "EXPLOSION"),
        timestamp: Date.now(),
        scene: scene && scene.scene && scene.scene.key ? scene.scene.key : "UNKNOWN",
        x: Math.round(x),
        y: Math.round(y),
        inShieldRegion: inShieldRegion,
        sourceObject: audioEvent && audioEvent.sourceObject ? audioEvent.sourceObject : null,
        targetObject: audioEvent && audioEvent.targetObject ? audioEvent.targetObject : null,
        sourceEntityId: audioEvent && audioEvent.sourceEntityId ? audioEvent.sourceEntityId : null,
        targetEntityId: audioEvent && audioEvent.targetEntityId ? audioEvent.targetEntityId : null,
        eventSource: eventSource,
        targetDestroyed: !!targetDestroyed,
        scoreBefore: before,
        scoreAfter: audioEvent && typeof audioEvent.scoreAfter === "number" ? audioEvent.scoreAfter : (typeof score === "number" ? score : before),
        scoreDelta: (audioEvent && typeof audioEvent.scoreAfter === "number" ? audioEvent.scoreAfter : score) - before,
        livesBefore: audioEvent && typeof audioEvent.livesBefore === "number" ? audioEvent.livesBefore : (typeof currentLives === "number" ? currentLives : null),
        livesAfter: audioEvent && typeof audioEvent.livesAfter === "number" ? audioEvent.livesAfter : (typeof currentLives === "number" ? currentLives : null)
    };
    window.ggExplosionTrace.push(row);
    if (inShieldRegion && !eventSource) row.eventSource = "UNEXPLAINED";
    return row;
}

function ggShieldExplosionEvent(sourceObject, targetObject, eventSource) {
    return {
        eventId: ggRuntimeEventId(window.ggActiveHudScene, eventSource || "SHIELD_EXPLOSION"),
        audioEvent: "shieldHit",
        eventSource: eventSource,
        sourceObject: sourceObject,
        targetObject: targetObject,
        sourceEntityId: sourceObject,
        targetEntityId: targetObject,
        scoreBefore: typeof score === "number" ? score : 0
    };
}

function ggEnemyScoreEvent(enemy) {
    return enemy && enemy.ggScoreEvent ? enemy.ggScoreEvent : "SHIP_DESTROYED";
}

function ggCreateHud(scene, options) {
    var showReplay = options && options.showReplay;
    var w = scene.game.config.width;
    var h = scene.game.config.height;
    var margin = Math.max(18, Math.min(w, h) * 0.025);
    var topY = margin * 1.08;
    var iconUnit = Math.max(28, Math.min(w, h) * 0.052);
    var textStyle = ggGoldStyle(34, "#ffb43c");

    textScore = scene.add.text(margin, topY, "SCORE " + score, textStyle).setOrigin(0, 0.5);
    textScore.ggHudRole = "score";
    textLives = scene.add.text(w - margin, h - margin - iconUnit * 1.2, "LIVES", ggDisplayStyle(28, "#f6f7ff")).setOrigin(1, 0.5);
    textLives.ggHudRole = "lives-label";
    textNukes = scene.add.text(margin, h - margin - iconUnit * 1.55, "NUKES", ggDisplayStyle(28, "#f6f7ff")).setOrigin(0, 0.5);
    textNukes.ggHudRole = "nukes-label";
    textNukesLoad = scene.add.text(margin, h - margin - iconUnit * 0.18, "ARM NUKE", ggDisplayStyle(24, "#70fff2")).setOrigin(0, 0.5);
    textNukesLoad.ggHudRole = "arm-nuke-label";

    scene.ggHudLivesIcons = [];
    scene.ggHudNukeIcons = [];
    scene.ggHudArmBarBg = scene.add.rectangle(margin + iconUnit * 2.85, textNukesLoad.y, iconUnit * 3.4, Math.max(8, iconUnit * 0.18), 0x081226, 0.88).setOrigin(0, 0.5);
    scene.ggHudArmBarBg.setStrokeStyle(2, 0x70fff2, 0.9);
    scene.ggHudArmBarFill = scene.add.rectangle(scene.ggHudArmBarBg.x, scene.ggHudArmBarBg.y, 1, Math.max(6, iconUnit * 0.11), 0x70fff2, 0.92).setOrigin(0, 0.5);
    scene.ggHudArmBarFill.ggHudRole = "arm-nuke-bar";
    scene.ggHudNukeIcon = null;
    if (showReplay) {
        restartlevel = scene.add.text(scene.game.config.width * 0.5, topY, "Replay: " + LevelRestart, textStyle).setOrigin(0.5);
    }
    ggRefreshHud(scene);
}

function ggDestroyIfLive(item) {
    if (item && item.destroy) item.destroy();
}

function ggCreateSharedHud(scene, options) {
    ggDestroyIfLive(textScore);
    ggDestroyIfLive(textLives);
    ggDestroyIfLive(textNukesLoad);
    ggDestroyIfLive(textNukes);
    ggDestroyIfLive(restartlevel);
    if (scene.btnMute) ggDestroyIfLive(scene.btnMute);
    ggDestroyHudCollections(scene);

    ggCreateHud(scene, options || {});
    scene.btnMute = ggAddMuteButton(scene, 99);
    ggRefreshHud(scene);
    return {
        score: textScore,
        lives: textLives,
        rearm: textNukesLoad,
        nukes: textNukes,
        replay: restartlevel,
        mute: scene.btnMute
    };
}

function ggInstallNukeHud(scene) {
    if (!scene) return;
    var fireNuke = function() {
        if (scene.playerNukeTick < scene.playerNukeDelay || currentNukes <= 0) return;
        if (ggFirePlayerNuke(scene)) scene.playerNukeTick = 0;
    };
    ggGroupChildren({ getChildren: function() { return scene.ggHudNukeIcons || []; } }).forEach(function(target) {
        target.setInteractive({ useHandCursor: true });
        target.on("pointerdown", fireNuke);
    });
}

function ggSetHudVisible(visible) {
    [textScore, textLives, textNukesLoad, textNukes, restartlevel].forEach(function(item) {
        if (item && item.setVisible) item.setVisible(visible);
    });
    [window.ggActiveHudScene].forEach(function(scene) {
        if (!scene) return;
        (scene.ggHudLivesIcons || []).forEach(function(item) { if (item && item.setVisible) item.setVisible(visible); });
        (scene.ggHudNukeIcons || []).forEach(function(item) { if (item && item.setVisible) item.setVisible(visible); });
        [scene.ggHudArmBarBg, scene.ggHudArmBarFill, scene.btnMute].forEach(function(item) {
            if (item && item.setVisible) item.setVisible(visible);
        });
    });
}

function ggDestroyHudCollections(scene) {
    if (!scene) return;
    (scene.ggHudLivesIcons || []).forEach(ggDestroyIfLive);
    (scene.ggHudNukeIcons || []).forEach(ggDestroyIfLive);
    ggDestroyIfLive(scene.ggHudArmBarBg);
    ggDestroyIfLive(scene.ggHudArmBarFill);
    ggDestroyIfLive(scene.ggHudNukeIcon);
    scene.ggHudLivesIcons = [];
    scene.ggHudNukeIcons = [];
    scene.ggHudArmBarBg = null;
    scene.ggHudArmBarFill = null;
    scene.ggHudNukeIcon = null;
}

function ggRefreshHud(scene) {
    scene = scene || window.ggActiveHudScene;
    if (!scene || !scene.game) return;
    window.ggActiveHudScene = scene;
    var w = scene.game.config.width;
    var h = scene.game.config.height;
    var margin = Math.max(18, Math.min(w, h) * 0.025);
    var iconUnit = Math.max(28, Math.min(w, h) * 0.052);
    if (textScore && textScore.setText) {
        textScore.setText("SCORE " + ggScoreValue(score));
        if (textScore.setFontFamily) textScore.setFontFamily(GG_FONT_GOLD);
        if (textScore.setPosition) textScore.setPosition(margin, margin * 1.08);
    }
    if (textLives && textLives.setText) textLives.setText("LIVES");
    if (textNukes && textNukes.setText) textNukes.setText("NUKES");
    if (textNukesLoad && textNukesLoad.setText) textNukesLoad.setText("ARM NUKE");

    function renderIcons(listName, textureKey, count, startX, y, dir) {
        scene[listName] = scene[listName] || [];
        scene[listName].forEach(ggDestroyIfLive);
        scene[listName] = [];
        for (var i = 0; i < Math.max(0, count); i++) {
            var icon = scene.add.image(startX + (dir * i * iconUnit * 0.72), y, textureKey).setDisplaySize(iconUnit, iconUnit).setOrigin(0.5);
            icon.ggHudRole = listName === "ggHudLivesIcons" ? "life-icon" : "nuke-icon";
            scene[listName].push(icon);
        }
    }

    var livesY = h - margin - iconUnit * 0.42;
    if (textLives) textLives.setPosition(w - margin, h - margin - iconUnit * 1.2);
    renderIcons("ggHudLivesIcons", "hudLife", currentLives, w - margin - iconUnit * 0.5, livesY, -1);

    var nukeLabelY = h - margin - iconUnit * 1.55;
    var nukeIconY = h - margin - iconUnit * 0.92;
    if (textNukes) textNukes.setPosition(margin, nukeLabelY);
    renderIcons("ggHudNukeIcons", "hudNuke", currentNukes, margin + iconUnit * 0.5, nukeIconY, 1);
    scene.ggHudNukeIcon = scene.ggHudNukeIcons[0] || null;
    ggInstallNukeHud(scene);

    var barW = iconUnit * 3.4;
    var progress = scene.playerNukeDelay ? Math.min(1, Math.max(0, scene.playerNukeTick / scene.playerNukeDelay)) : 1;
    if (textNukesLoad) textNukesLoad.setPosition(margin, h - margin - iconUnit * 0.18);
    if (scene.ggHudArmBarBg) {
        scene.ggHudArmBarBg.setPosition(margin + iconUnit * 2.85, textNukesLoad.y);
        scene.ggHudArmBarBg.setSize(barW, Math.max(8, iconUnit * 0.18));
    }
    if (scene.ggHudArmBarFill) {
        scene.ggHudArmBarFill.setPosition(margin + iconUnit * 2.85, textNukesLoad.y);
        scene.ggHudArmBarFill.setSize(Math.max(1, barW * progress), Math.max(6, iconUnit * 0.11));
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
    var w = scene.game.config.width;
    var h = scene.game.config.height;
    var margin = Math.max(18, Math.min(w, h) * 0.025);
    var size = Math.max(32, Math.min(w, h) * 0.07);
    button.setDisplaySize(size, size);
    button.setPosition(w - margin - size * 0.5, margin + size * 0.5);
    button.ggHudRole = "sound-toggle";
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
            ggOrientCometToVelocity(comet);
            scene.comets.add(comet);
        },
        callbackScope: scene,
        loop: true
    });
}

function ggNullEmitter() {
    return {
        start: function() {},
        startFollow: function() {},
        stop: function() {}
    };
}

function ggOrientCometToVelocity(comet) {
    if (!comet || !comet.body || !comet.body.velocity) return;
    var vx = comet.body.velocity.x;
    var vy = comet.body.velocity.y;
    if (vx === 0 && vy === 0) return;
    comet.setRotation(Math.atan2(vy, vx) - Math.PI / 2);
    comet.body.angularVelocity = 0;
}

function ggInstallResultInputControls(scene, controls) {
    scene.ggResultActionLocked = false;
    function runOnce(callback) {
        if (!callback || scene.ggResultActionLocked) return;
        scene.ggResultActionLocked = true;
        callback();
    }
    scene.time.addEvent({
        delay: 100,
        callback: function() {
            if (!levelWon && !RIP) return;
            if (controls.next && (this.keyEnter && this.keyEnter.isDown || controllerActionPressed("start"))) runOnce(controls.next);
            if (controls.replay && (this.keyR && this.keyR.isDown || controllerActionPressed("restart"))) runOnce(controls.replay);
            if (controls.menu && (this.keyM && this.keyM.isDown || controllerActionPressed("info"))) runOnce(controls.menu);
        },
        callbackScope: scene,
        loop: true
    });
    return runOnce;
}

function ggPointerHitsInteractiveUi(scene, pointer) {
    if (!scene || !pointer || !scene.input || !scene.input.manager || !scene.children) return false;
    var camera = scene.cameras && scene.cameras.main ? scene.cameras.main : null;
    if (!camera || !scene.input.manager.hitTest) return false;
    var hits = scene.input.manager.hitTest(pointer, scene.children.list, camera);
    return hits.some(function(hit) {
        return hit && hit.input && hit.active !== false && hit !== scene.player;
    });
}

function ggSetProjectileIdentity(scene, projectile, side, type, sourceEntity) {
    if (!projectile) return;
    projectile.ggProjectileSide = side;
    projectile.ggProjectileType = type;
    projectile.ggSourceEntityId = ggAssignEntityId(scene, sourceEntity, sourceEntity && sourceEntity.ggEntityType ? sourceEntity.ggEntityType : "SOURCE");
    ggAssignEntityId(scene, projectile, type);
    if (!window.ggProjectileSpawnTrace) window.ggProjectileSpawnTrace = [];
    window.ggProjectileSpawnTrace.push({
        eventId: ggRuntimeEventId(scene, "PROJECTILE_SPAWN"),
        projectileId: projectile.ggEntityId,
        projectileSide: side,
        projectileType: type,
        sourceEntityId: projectile.ggSourceEntityId,
        scene: scene && scene.scene && scene.scene.key ? scene.scene.key : "UNKNOWN",
        timestamp: Date.now()
    });
}

function ggPlaceProjectile(projectile, x, y) {
    projectile.setPosition(x, y);
    if (projectile.body) projectile.body.reset(x, y);
    projectile.ggPreviousX = x;
    projectile.ggPreviousY = y;
}

function ggSpawnPlayerLaser(scene) {
    if (!scene || !scene.player || !scene.player.active) return null;
    ggAssignEntityId(scene, scene.player, "PLAYER");
    var laser = new PlayerLaser(scene, scene.player.x, scene.player.y);
    ggSetProjectileIdentity(scene, laser, "player", "PLAYER_LASER", scene.player);
    var laserVisualHalf = Math.max(4, (laser.displayHeight || laser.height || 8) * 0.5);
    var spawnY = scene.player.body ? scene.player.body.y - laserVisualHalf - 2 : scene.player.y - scene.player.displayHeight * 0.5 - 8;
    ggPlaceProjectile(laser, scene.player.x, spawnY);
    scene.playerLasers.add(laser);
    laser.body.setVelocityY(ggPlayerLaserVelocity(scene));
    return laser;
}

function ggSpawnPlayerNuke(scene) {
    if (!scene || !scene.player || !scene.player.active) return null;
    ggAssignEntityId(scene, scene.player, "PLAYER");
    var nuke = new Nuke(scene, scene.player.x, scene.player.y);
    ggSetProjectileIdentity(scene, nuke, "player", "PLAYER_NUKE", scene.player);
    var nukeVisualHalf = Math.max(6, (nuke.displayHeight || nuke.height || 12) * 0.5);
    var spawnY = scene.player.body ? scene.player.body.y - nukeVisualHalf - 2 : scene.player.y - scene.player.displayHeight * 0.5 - 14;
    ggPlaceProjectile(nuke, scene.player.x, spawnY);
    scene.starNukes.add(nuke);
    nuke.body.setVelocityY(-400);
    return nuke;
}

function ggSpawnEnemyLaser(scene, sourceEntity, LaserClass, offsetX) {
    if (!scene || !sourceEntity || !sourceEntity.active && !sourceEntity.body) return null;
    var type = LaserClass === EnemyMotherShipLaser ? "MOTHERSHIP_LASER" : "ENEMY_LASER";
    ggAssignEntityId(scene, sourceEntity, sourceEntity.ggEntityType || (LaserClass === EnemyMotherShipLaser ? "MOTHERSHIP" : "ENEMY"));
    var laser = new (LaserClass || EnemyLaser)(scene, sourceEntity.x, sourceEntity.y);
    ggSetProjectileIdentity(scene, laser, "enemy", type, sourceEntity);
    var x = sourceEntity.x + (offsetX || 0);
    var laserVisualHalf = Math.max(4, (laser.displayHeight || laser.height || 8) * 0.5);
    var sourceVisualHalf = Math.max(8, (sourceEntity.displayHeight || sourceEntity.height || 16) * 0.5);
    var y = sourceEntity.y + sourceVisualHalf + laserVisualHalf + 2;
    ggPlaceProjectile(laser, x, y);
    scene.enemyLasers.add(laser);
    laser.body.setVelocityY(ggEnemyLaserVelocity(scene));
    return laser;
}

function ggFirePlayerLaser(scene) {
    if (!scene || !scene.player || !scene.player.active || levelWon || RIP) return false;
    var laser = ggSpawnPlayerLaser(scene);
    if (!laser) return false;
    if (scene.sfx && scene.sfx.laserPlayer) scene.sfx.laserPlayer.play();
    return true;
}

function ggFirePlayerNuke(scene) {
    if (!scene || !scene.player || !scene.player.active || levelWon || RIP || currentNukes <= 0) return false;
    var nuke = ggSpawnPlayerNuke(scene);
    if (!nuke) return false;
    if (scene.sfx && scene.sfx.nukeFiring) scene.sfx.nukeFiring.play();
    currentNukes--;
    ggRefreshHud(scene);
    return true;
}

function ggHandlePlayerFiring(scene, fireDown, nukeDown) {
    if (!scene || !scene.player || !scene.player.active) return;
    if (fireDown) {
        if (!scene.ggFireHeld) {
            ggFirePlayerLaser(scene);
            scene.playerShootTick = 0;
        }
        else if (scene.playerShootTick < scene.playerShootDelay) {
            scene.playerShootTick++;
        }
        else if (ggFirePlayerLaser(scene)) {
            scene.playerShootTick = 0;
        }
    }
    else {
        scene.playerShootTick = scene.playerShootDelay;
    }
    scene.ggFireHeld = !!fireDown;

    if (nukeDown && currentNukes > 0) {
        if (scene.playerNukeTick < scene.playerNukeDelay) {
            scene.playerNukeTick++;
            ggRefreshHud(scene);
        }
        else if (ggFirePlayerNuke(scene)) {
            scene.playerNukeTick = 0;
        }
    }
    if (nukeDown && currentNukes === 0) ggRefreshHud(scene);
}

function ggInstallTouchFire(scene) {
    scene.playertouchShootTick = 1;
    scene.playertouchShootDelay = 1;
    scene.input.on("pointerdown", function(pointer) {
        if (!touch || levelWon || RIP || !scene.player || !scene.player.active) return;
        if (ggPointerHitsInteractiveUi(scene, pointer)) return;
        if (scene.playertouchShootTick < scene.playertouchShootDelay) {
            scene.playertouchShootTick++;
            return;
        }
        if (scene.playertouchShootTick === scene.playertouchShootDelay && ggFirePlayerLaser(scene)) {
            scene.playertouchShootTick = 0;
        }
    }, scene);
}

function ggAwardComet(scene, comet, nukeBurst) {
    if (RIP) return;
    if (!comet || !comet.active) return;
    ggPlayAudio(scene, GG_AUDIO.COMET_DESTROYED);
    var eventSource = nukeBurst ? "PLAYER_NUKE_COMET_HIT" : "PLAYER_LASER_COMET_HIT";
    var projectile = comet.ggHitByProjectile || null;
    var event = ggCombatEvent(scene, eventSource, projectile, comet, false);
    ggScoreEvent(scene, "COMET_DESTROYED");
    currentNukes++;
    ggRefreshHud(scene);
    event.scoreAfter = score;
    if (nukeBurst) {
        scene.createNukeExplosion(comet.x, comet.y, event);
    }
    else {
        scene.createExplosion(comet.x, comet.y, event);
    }
    comet.destroy();
}

function ggInstallCometCollisions(scene) {
    scene.physics.add.overlap(scene.playerLasers, scene.comets, function(laser, comet) {
        if (laser) {
            laser.ggResolved = true;
            comet.ggHitByProjectile = laser;
            laser.destroy();
        }
        ggAwardComet(scene, comet, false);
    }, null, scene);

    scene.physics.add.overlap(scene.starNukes, scene.comets, function(nuke, comet) {
        if (nuke) {
            nuke.ggResolved = true;
            comet.ggHitByProjectile = nuke;
            nuke.destroy();
            emitter.stop();
        }
        ggAwardComet(scene, comet, true);
    }, null, scene);
}

function ggResolveEnemyLaserPlayerHit(scene, laser, player) {
    if (!scene || !laser || laser.ggProjectileSide !== "enemy" || !player || !laser.active || !player.active || laser.ggResolved) return false;
    laser.ggResolved = true;
    var damage = {
        eventId: ggRuntimeEventId(scene, "PLAYER_DAMAGE"),
        scene: scene && scene.scene && scene.scene.key ? scene.scene.key : "UNKNOWN",
        timestamp: Date.now(),
        damageSource: laser.ggProjectileType || "ENEMY_LASER",
        projectileId: ggAssignEntityId(scene, laser, laser.ggProjectileType || "ENEMY_LASER"),
        projectileSide: laser.ggProjectileSide,
        playerBodyBounds: ggBodyTrace(player),
        projectileBodyBounds: ggBodyTrace(laser),
        livesBefore: typeof currentLives === "number" ? currentLives : null
    };
    if (!window.ggPlayerDamageTrace) window.ggPlayerDamageTrace = [];
    var hitX = player.x;
    var hitY = player.y;
    var explosionEvent = ggCombatEvent(scene, "ENEMY_LASER_PLAYER_HIT", laser, player, "playerHit");
    scene.onLifeDown();
    damage.livesAfter = typeof currentLives === "number" ? currentLives : null;
    explosionEvent.livesAfter = damage.livesAfter;
    window.ggPlayerDamageTrace.push(damage);
    scene.createExplosion(hitX, hitY, explosionEvent);
    if (player.body) player.body.reset(scene.game.config.width * 0.5, scene.game.config.height - 50);
    laser.destroy();
    return true;
}

function ggResolveHostileBodyPlayerHit(scene, hostile, player) {
    if (!scene || !hostile || !player || !hostile.active || !player.active || hostile.ggResolved) return false;
    hostile.ggResolved = true;
    var damage = {
        eventId: ggRuntimeEventId(scene, "PLAYER_DAMAGE"),
        scene: scene && scene.scene && scene.scene.key ? scene.scene.key : "UNKNOWN",
        timestamp: Date.now(),
        damageSource: hostile.ggEntityType || hostile.ggScoreEvent || (hostile.constructor ? hostile.constructor.name : "HOSTILE_BODY"),
        projectileId: null,
        projectileSide: "hostile-body",
        playerBodyBounds: ggBodyTrace(player),
        projectileBodyBounds: ggBodyTrace(hostile),
        livesBefore: typeof currentLives === "number" ? currentLives : null
    };
    if (!window.ggPlayerDamageTrace) window.ggPlayerDamageTrace = [];
    var hitX = player.x;
    var hitY = player.y;
    var explosionEvent = ggCombatEvent(scene, "HOSTILE_BODY_PLAYER_HIT", hostile, player, "playerHit");
    scene.onLifeDown();
    damage.livesAfter = typeof currentLives === "number" ? currentLives : null;
    explosionEvent.livesAfter = damage.livesAfter;
    window.ggPlayerDamageTrace.push(damage);
    scene.createExplosion(hitX, hitY, explosionEvent);
    hostile.destroy();
    if (player.body) player.body.reset(scene.game.config.width * 0.5, scene.game.config.height - 50);
    return true;
}

function ggClampPlayerToWorld(scene) {
    if (!scene || !scene.player || !scene.player.body) return;
    var body = scene.player.body;
    var dx = 0;
    var dy = 0;
    if (body.x < 0) dx = -body.x;
    if (body.x + body.width > scene.game.config.width) dx = scene.game.config.width - (body.x + body.width);
    if (body.y < 0) dy = -body.y;
    if (body.y + body.height > scene.game.config.height) dy = scene.game.config.height - (body.y + body.height);
    if (dx || dy) {
        scene.player.x += dx;
        scene.player.y += dy;
        body.reset(scene.player.x, scene.player.y);
    }
}

function ggGroupChildren(group) {
    return group && group.getChildren ? group.getChildren() : [];
}

function ggBoundsFor(item) {
    if (!item || !item.active) return null;
    function expand(bounds, minWidth, minHeight) {
        var width = bounds.right - bounds.left;
        var height = bounds.bottom - bounds.top;
        var cx = bounds.left + width * 0.5;
        var cy = bounds.top + height * 0.5;
        var nextW = Math.max(width, minWidth || width);
        var nextH = Math.max(height, minHeight || height);
        return { left: cx - nextW * 0.5, top: cy - nextH * 0.5, right: cx + nextW * 0.5, bottom: cy + nextH * 0.5 };
    }
    if (item.getBounds) {
        var bounds = item.getBounds();
        var current = { left: bounds.left, top: bounds.top, right: bounds.right, bottom: bounds.bottom };
        if (item.ggProjectileType === "PLAYER_LASER" || item.ggProjectileType === "ENEMY_LASER" || item.ggProjectileType === "MOTHERSHIP_LASER") return expand(current, 36, 32);
        if (item.ggProjectileType === "PLAYER_NUKE") return expand(current, 44, 44);
        return current;
    }
    if (item.body) {
        return {
            left: item.body.x,
            top: item.body.y,
            right: item.body.x + item.body.width,
            bottom: item.body.y + item.body.height
        };
    }
    return null;
}

function ggSweptBoundsFor(projectile) {
    var current = ggBoundsFor(projectile);
    if (!current) return null;
    var previousX = typeof projectile.ggPreviousX === "number" ? projectile.ggPreviousX : projectile.x;
    var previousY = typeof projectile.ggPreviousY === "number" ? projectile.ggPreviousY : projectile.y;
    var dx = projectile.x - previousX;
    var dy = projectile.y - previousY;
    return {
        left: Math.min(current.left, current.left - dx),
        top: Math.min(current.top, current.top - dy),
        right: Math.max(current.right, current.right - dx),
        bottom: Math.max(current.bottom, current.bottom - dy)
    };
}

function ggBoundsOverlap(a, b) {
    return !!(a && b && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top);
}

function ggMarkSweepPositions(group) {
    ggGroupChildren(group).forEach(function(projectile) {
        if (!projectile || !projectile.active) return;
        projectile.ggPreviousX = projectile.x;
        projectile.ggPreviousY = projectile.y;
    });
}

function ggDestroyEnemyTarget(scene, projectile, target, nuke) {
    if (!scene || !projectile || projectile.ggProjectileSide !== "player" || !target || !projectile.active || !target.active || target.ggSweptResolved) return false;
    target.ggSweptResolved = true;
    projectile.destroy();
    if (nuke && emitter && emitter.stop) emitter.stop();
    enemyShips--;
    enemyDeaths++;
    var event = ggCombatEvent(scene, nuke ? "PLAYER_NUKE_HOSTILE_HIT" : "PLAYER_LASER_HOSTILE_HIT", projectile, target, nuke ? false : undefined);
    ggScoreEvent(scene, ggEnemyScoreEvent(target));
    event.scoreAfter = score;
    if (nuke) scene.createNukeExplosion(target.x, target.y, event);
    else scene.createExplosion(target.x, target.y, event);
    target.destroy();
    return true;
}

function ggDestroyAsteroidTarget(scene, projectile, asteroid, nuke) {
    if (!scene || !projectile || projectile.ggProjectileSide !== "player" || !asteroid || !projectile.active || !asteroid.active || asteroid.ggSweptResolved) return false;
    asteroid.ggSweptResolved = true;
    projectile.destroy();
    if (nuke && emitter && emitter.stop) emitter.stop();
    var event = ggCombatEvent(scene, nuke ? "PLAYER_NUKE_ASTEROID_HIT" : "PLAYER_LASER_ASTEROID_HIT", projectile, asteroid, nuke ? false : undefined);
    ggScoreEvent(scene, "ASTEROID_DESTROYED");
    event.scoreAfter = score;
    if (nuke) scene.createNukeExplosion(asteroid.x, asteroid.y, event);
    else scene.createExplosion(asteroid.x, asteroid.y, event);
    asteroid.destroy();
    return true;
}

function ggHitMothershipTarget(scene, projectile, mothership, nuke) {
    if (!scene || !projectile || projectile.ggProjectileSide !== "player" || !mothership || !projectile.active || !mothership.active || projectile.ggResolved) return false;
    projectile.ggResolved = true;
    projectile.destroy();
    if (nuke && emitter && emitter.stop) emitter.stop();
    if (nuke) {
        var nukeEvent = ggCombatEvent(scene, "PLAYER_NUKE_MOTHERSHIP_HIT", projectile, mothership, "mothershipHit");
        ggScoreEvent(scene, "MOTHERSHIP_HIT");
        nukeEvent.scoreAfter = score;
        scene.createNukeExplosion(mothership.x, mothership.y, nukeEvent);
        scene.motherShipHit(2);
    }
    else {
        var laserEvent = ggCombatEvent(scene, "PLAYER_LASER_MOTHERSHIP_HIT", projectile, mothership, "mothershipHit");
        ggScoreEvent(scene, "MOTHERSHIP_HIT");
        laserEvent.scoreAfter = score;
        scene.createExplosion(mothership.x, mothership.y, laserEvent);
        scene.motherShipHit(1);
    }
    return true;
}

function ggHitPlayerTarget(scene, laser, player) {
    if (!scene || !laser || laser.ggSweptResolved) return false;
    laser.ggSweptResolved = true;
    return ggResolveEnemyLaserPlayerHit(scene, laser, player);
}

function ggResolveProjectileClash(scene, playerLaser, hostileLaser) {
    if (!scene || !playerLaser || !hostileLaser) return false;
    if (!playerLaser.active || !hostileLaser.active || playerLaser.ggProjectileSide !== "player" || hostileLaser.ggProjectileSide !== "enemy") return false;
    if (playerLaser.ggResolved || hostileLaser.ggResolved) return false;
    playerLaser.ggResolved = true;
    hostileLaser.ggResolved = true;
    if (!window.ggProjectileClashTrace) window.ggProjectileClashTrace = [];
    window.ggProjectileClashTrace.push({
        eventId: ggRuntimeEventId(scene, "PROJECTILE_CLASH"),
        scene: scene && scene.scene && scene.scene.key ? scene.scene.key : "UNKNOWN",
        timestamp: Date.now(),
        playerProjectileId: ggAssignEntityId(scene, playerLaser, playerLaser.ggProjectileType || "PLAYER_LASER"),
        hostileProjectileId: ggAssignEntityId(scene, hostileLaser, hostileLaser.ggProjectileType || "ENEMY_LASER"),
        playerProjectileBounds: ggBodyTrace(playerLaser),
        hostileProjectileBounds: ggBodyTrace(hostileLaser)
    });
    playerLaser.destroy();
    hostileLaser.destroy();
    return true;
}

function ggResolvePlayerLaserShieldHit(scene, laser, tile) {
    if (!scene || !laser || !tile || !laser.active || !tile.active || laser.ggProjectileSide !== "player" || laser.ggResolved) return false;
    laser.ggResolved = true;
    laser.destroy();
    scene.destroyShieldTile(tile, "PLAYER_LASER_HIT_SHIELD");
    return true;
}

function ggSweepProjectilesAgainst(scene, projectileGroup, targetGroup, hitCallback) {
    ggGroupChildren(projectileGroup).slice().forEach(function(projectile) {
        if (!projectile || !projectile.active) return;
        var swept = ggSweptBoundsFor(projectile);
        ggGroupChildren(targetGroup).slice().some(function(target) {
            if (!target || !target.active) return false;
            if (!ggBoundsOverlap(swept, ggBoundsFor(target))) return false;
            return hitCallback(projectile, target) === true;
        });
    });
}

function ggRunSweptCollisionContracts(scene) {
    if (!scene || RIP || levelWon) return;
    var playerGroup = { getChildren: function() { return scene.player && scene.player.active ? [scene.player] : []; } };
    ggSweepProjectilesAgainst(scene, scene.playerLasers, scene.enemyLasers, function(playerLaser, hostileLaser) {
        return ggResolveProjectileClash(scene, playerLaser, hostileLaser);
    });
    ggSweepProjectilesAgainst(scene, scene.playerLasers, scene.shieldTiles, function(laser, tile) {
        return ggResolvePlayerLaserShieldHit(scene, laser, tile);
    });
    ggSweepProjectilesAgainst(scene, scene.playerLasers, scene.enemies, function(laser, enemy) {
        return ggDestroyEnemyTarget(scene, laser, enemy, false);
    });
    ggSweepProjectilesAgainst(scene, scene.starNukes, scene.enemies, function(nuke, enemy) {
        return ggDestroyEnemyTarget(scene, nuke, enemy, true);
    });
    ggSweepProjectilesAgainst(scene, scene.playerLasers, scene.alienscouts, function(laser, scout) {
        return ggDestroyEnemyTarget(scene, laser, scout, false);
    });
    ggSweepProjectilesAgainst(scene, scene.starNukes, scene.alienscouts, function(nuke, scout) {
        return ggDestroyEnemyTarget(scene, nuke, scout, true);
    });
    if (scene.alienMothership && scene.alienMothership.active) {
        var mothershipGroup = { getChildren: function() { return [scene.alienMothership]; } };
        ggSweepProjectilesAgainst(scene, scene.playerLasers, mothershipGroup, function(laser, mothership) {
            return ggHitMothershipTarget(scene, laser, mothership, false);
        });
        ggSweepProjectilesAgainst(scene, scene.starNukes, mothershipGroup, function(nuke, mothership) {
            return ggHitMothershipTarget(scene, nuke, mothership, true);
        });
    }
    ggSweepProjectilesAgainst(scene, scene.playerLasers, scene.asteroids, function(laser, asteroid) {
        return ggDestroyAsteroidTarget(scene, laser, asteroid, false);
    });
    ggSweepProjectilesAgainst(scene, scene.starNukes, scene.asteroids, function(nuke, asteroid) {
        return ggDestroyAsteroidTarget(scene, nuke, asteroid, true);
    });
    ggSweepProjectilesAgainst(scene, scene.enemyLasers, playerGroup, function(laser, player) {
        return ggHitPlayerTarget(scene, laser, player);
    });
    ggSweepProjectilesAgainst(scene, scene.enemies, playerGroup, function(enemy, player) {
        return ggResolveHostileBodyPlayerHit(scene, enemy, player);
    });
    ggSweepProjectilesAgainst(scene, scene.alienscouts, playerGroup, function(scout, player) {
        return ggResolveHostileBodyPlayerHit(scene, scout, player);
    });
    ggSweepProjectilesAgainst(scene, scene.asteroids, playerGroup, function(asteroid, player) {
        return ggResolveHostileBodyPlayerHit(scene, asteroid, player);
    });
    ggSweepProjectilesAgainst(scene, scene.comets, playerGroup, function(comet, player) {
        return ggResolveHostileBodyPlayerHit(scene, comet, player);
    });
    ggMarkSweepPositions(scene.playerLasers);
    ggMarkSweepPositions(scene.starNukes);
    ggMarkSweepPositions(scene.enemyLasers);
}

function ggInstallSweptCollisionContracts(scene) {
    if (!scene || !scene.time || scene.ggSweptCollisionEvent) return;
    ggMarkSweepPositions(scene.playerLasers);
    ggMarkSweepPositions(scene.starNukes);
    ggMarkSweepPositions(scene.enemyLasers);
    scene.ggSweptCollisionEvent = scene.time.addEvent({
        delay: 16,
        callback: function() {
            ggRunSweptCollisionContracts(scene);
        },
        callbackScope: scene,
        loop: true
    });
}

function ggGameplayTestModeEnabled() {
    if (!window || !window.location || !window.location.search) return false;
    return new URLSearchParams(window.location.search).get("ggGameplayTest") === "1";
}

function ggInstallGameplayTestControls(scene) {
    if (!ggGameplayTestModeEnabled() || !scene || !scene.scene || !scene.scene.key) return;
    if (!window.ggGameplayTestControls) window.ggGameplayTestControls = {};
    scene.ggSuppressEnemyFire = true;
    var sceneKey = scene.scene.key;

    function addFixture(entity, group, type) {
        entity.ggTestFixture = true;
        ggAssignEntityId(scene, entity, type);
        if (entity.body) {
            entity.body.setVelocity(0, 0);
            entity.body.angularVelocity = 0;
        }
        if (group) group.add(entity);
        return entity;
    }

    function abovePlayer(offset) {
        var playerBody = scene.player && scene.player.body;
        return playerBody ? playerBody.y - offset : scene.player.y - offset;
    }

    window.ggGameplayTestControls[sceneKey] = {
        suppressEnemyFire: function(value) {
            scene.ggSuppressEnemyFire = value !== false;
            return scene.ggSuppressEnemyFire;
        },
        cleanupFixtures: function() {
            ["enemies", "alienscouts", "enemyLasers", "playerLasers", "starNukes", "asteroids", "comets", "shieldTiles"].forEach(function(groupName) {
                var group = scene[groupName];
                if (!group || !group.getChildren) return;
                group.getChildren().slice().forEach(function(child) {
                    if (child && child.ggTestFixture) child.destroy();
                });
            });
            return true;
        },
        clearRuntimeCollisionField: function() {
            ["enemies", "alienscouts", "enemyLasers", "playerLasers", "starNukes", "asteroids", "comets", "shieldTiles", "shieldHoles", "explosions", "nukeExplosions"].forEach(function(groupName) {
                var group = scene[groupName];
                if (!group || !group.getChildren) return;
                group.getChildren().slice().forEach(function(child) {
                    if (child && child.destroy) child.destroy();
                });
            });
            return true;
        },
        spawnEnemyInPlayerShotPath: function() {
            var enemy = new Enemy(scene, scene.player.x, abovePlayer(150), "enemyShip");
            if (enemy.play) enemy.play("enemyShip");
            return addFixture(enemy, scene.enemies, "ENEMY").ggEntityId;
        },
        spawnAsteroidInPlayerShotPath: function() {
            var asteroid = new Asteroid(scene, scene.player.x, abovePlayer(150));
            return addFixture(asteroid, scene.asteroids, "ASTEROID").ggEntityId;
        },
        spawnCometInPlayerShotPath: function() {
            var comet = new Comet(scene, scene.player.x, abovePlayer(150));
            return addFixture(comet, scene.comets, "COMET").ggEntityId;
        },
        spawnShieldInPlayerShotPath: function() {
            var tile = new ShieldTile(scene, scene.player.x, abovePlayer(115));
            return addFixture(tile, scene.shieldTiles, "SHIELD_TILE").ggEntityId;
        },
        spawnEnemyLaserAtPlayer: function() {
            var enemy = new Enemy(scene, scene.player.x, abovePlayer(90), "enemyShip");
            addFixture(enemy, scene.enemies, "ENEMY");
            var laser = ggSpawnEnemyLaser(scene, enemy, EnemyLaser);
            laser.ggTestFixture = true;
            return laser.ggEntityId;
        },
        placePlayerClearOfShields: function() {
            var x = scene.game.config.width * 0.08;
            var y = scene.game.config.height - 50;
            scene.player.setPosition(x, y);
            if (scene.player.body) scene.player.body.reset(x, y);
            return { x: x, y: y };
        },
        spawnEnemyLaserAtShield: function() {
            var tile = new ShieldTile(scene, scene.player.x, abovePlayer(55));
            addFixture(tile, scene.shieldTiles, "SHIELD_TILE");
            var enemy = new Enemy(scene, scene.player.x, abovePlayer(130), "enemyShip");
            addFixture(enemy, scene.enemies, "ENEMY");
            var laser = ggSpawnEnemyLaser(scene, enemy, EnemyLaser);
            laser.ggTestFixture = true;
            return { laserId: laser.ggEntityId, shieldId: tile.ggEntityId };
        },
        spawnPlayerBodyContacts: function() {
            addFixture(new Enemy(scene, scene.player.x, scene.player.y, "enemyShip"), scene.enemies, "ENEMY_BODY_CONTACT_FIXTURE");
            addFixture(new Asteroid(scene, scene.player.x, scene.player.y), scene.asteroids, "ASTEROID_BODY_CONTACT_FIXTURE");
            addFixture(new Comet(scene, scene.player.x, scene.player.y), scene.comets, "COMET_BODY_CONTACT_FIXTURE");
            return true;
        },
        state: function() {
            return {
                scene: sceneKey,
                score: score,
                currentLives: currentLives,
                currentNukes: currentNukes,
                sweptCollisionLoopInstalled: !!scene.ggSweptCollisionEvent,
                playerLasers: ggGroupChildren(scene.playerLasers).filter(function(item) { return item && item.active; }).map(function(item) {
                    return { id: item.ggEntityId, x: item.x, y: item.y, velocityY: item.body ? item.body.velocity.y : null, side: item.ggProjectileSide, type: item.ggProjectileType, active: item.active, body: item.body ? ggBodyTrace(item) : null };
                }),
                enemyLasers: ggGroupChildren(scene.enemyLasers).filter(function(item) { return item && item.active; }).map(function(item) {
                    return { id: item.ggEntityId, x: item.x, y: item.y, velocityY: item.body ? item.body.velocity.y : null, side: item.ggProjectileSide, type: item.ggProjectileType, active: item.active, body: item.body ? ggBodyTrace(item) : null };
                }),
                traces: {
                    explosions: window.ggExplosionTrace || [],
                    damage: window.ggPlayerDamageTrace || [],
                    projectileSpawns: window.ggProjectileSpawnTrace || [],
                    projectileClashes: window.ggProjectileClashTrace || []
                }
            };
        }
    };
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
    ggResumeGameplayWorld(scene);
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

function ggResumeGameplayWorld(scene) {
    if (scene && scene.physics && scene.physics.world && scene.physics.world.resume) scene.physics.world.resume();
    window.ggGameplayFrozenForResult = false;
}

function ggFreezeGameplayForResult(scene) {
    if (!scene || scene.ggGameplayFrozenForResult) return;
    scene.ggGameplayFrozenForResult = true;
    if (scene.time && scene.time.removeAllEvents) scene.time.removeAllEvents();
    if (scene.tweens && scene.tweens.killAll) scene.tweens.killAll();
    ["enemies", "alienscouts", "enemyLasers", "playerLasers", "starNukes", "asteroids", "comets"].forEach(function(groupName) {
        ggGroupChildren(scene[groupName]).forEach(function(item) {
            if (item && item.body) item.body.setVelocity(0, 0);
            if (item && item.anims && item.anims.pause) item.anims.pause();
        });
    });
    if (scene.player && scene.player.body) scene.player.body.setVelocity(0, 0);
    if (scene.physics && scene.physics.world && scene.physics.world.pause) scene.physics.world.pause();
    window.ggGameplayFrozenForResult = true;
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
    ggResumeGameplayWorld(scene);
    scene.scene.start(sceneKey);
}

function ggRenderGameOver(scene, menuCallback, replayCallback, tryAgainCallback) {
    RIP = true;
    finalScore = ggScoreValue(score);
    score = finalScore;
    ggFreezeGameplayForResult(scene);
    ggSetHudVisible(false);
    ggPlayAudioOnce(scene, "game-over-entry", GG_AUDIO.GAME_OVER_STINGER);
    var panel = scene.add.image(scene.game.config.width * 0.5, scene.game.config.height * 0.52, "gameOver").setOrigin(0.5);
    Align.scaleToGameW(panel, 0.78);
    panel.setDepth(20);

    ggMakeText(scene, scene.game.config.width * 0.5, scene.game.config.height * 0.86, "SCORE  " + finalScore, ggGoldStyle(42, "#ffb43c")).setDepth(27);

    var buttonY = scene.game.config.height * 0.742;
    var runOnce = ggInstallResultInputControls(scene, {
        next: tryAgainCallback || null,
        replay: replayCallback || null,
        menu: menuCallback || null
    });
    ggAddImageButton(scene, scene.game.config.width * 0.315, buttonY, "buttonMenuOff", "buttonMenuOn", function() { runOnce(menuCallback); }, 0.16);
    ggAddImageButton(scene, scene.game.config.width * 0.5, buttonY, "buttonReplayOff", "buttonReplayOn", function() { runOnce(replayCallback); }, 0.17);
    ggAddImageButton(scene, scene.game.config.width * 0.685, buttonY, "buttonTryAgainOff", "buttonTryAgainOn", function() { runOnce(tryAgainCallback); }, 0.16);
}

function ggRenderVictory(scene, title, body, nextLabel, nextCallback, options) {
    finalScore = ggScoreValue(score);
    score = finalScore;
    ggPlayAudioOnce(scene, "victory-entry", GG_AUDIO.VICTORY_STINGER);
    ggSetHudVisible(false);
    var panel = scene.add.image(scene.game.config.width * 0.5, scene.game.config.height * 0.54, "fireworks").setOrigin(0.5);
    Align.scaleToGameW(panel, 0.7);
    panel.setDepth(20);
    var bonus = options && typeof options.bonus === "number" ? options.bonus : 0;
    var wave = options && options.wave ? options.wave : ggSceneWaveLabel(scene);
    ggMakeText(scene, scene.game.config.width * 0.5, scene.game.config.height * 0.19, title, ggGoldStyle(74, "#ffb43c")).setDepth(21);
    ggMakeText(scene, scene.game.config.width * 0.31, scene.game.config.height * 0.66, String(finalScore), ggDisplayStyle(42, "#ffffff")).setDepth(21);
    ggMakeText(scene, scene.game.config.width * 0.50, scene.game.config.height * 0.66, String(wave), ggDisplayStyle(36, "#f6f7ff")).setDepth(21);
    ggMakeText(scene, scene.game.config.width * 0.69, scene.game.config.height * 0.66, String(bonus), ggDisplayStyle(36, "#f6f7ff")).setDepth(21);
    if (body) ggMakeText(scene, scene.game.config.width * 0.5, scene.game.config.height * 0.76, body, ggDisplayStyle(26, "#70fff2")).setDepth(21);
    var buttonY = scene.game.config.height * 0.865;
    var buttonW = scene.game.config.width * 0.18;
    var buttonH = scene.game.config.height * 0.085;
    var runOnce = ggInstallResultInputControls(scene, {
        next: nextCallback || null,
        replay: options && options.replayCallback ? options.replayCallback : null,
        menu: options && options.menuCallback ? options.menuCallback : null
    });
    if (nextCallback && nextLabel) {
        ggAddPanelHit(scene, "NEXT", scene.game.config.width * 0.34, buttonY, buttonW, buttonH, function() { runOnce(nextCallback); });
    }
    if (options && options.menuCallback) {
        ggAddPanelHit(scene, "MENU", scene.game.config.width * 0.66, buttonY, buttonW, buttonH, function() { runOnce(options.menuCallback); });
    }
    if (options && options.replayCallback) {
        ggAddPanelHit(scene, "REPLAY", scene.game.config.width * 0.5, buttonY, buttonW, buttonH, function() { runOnce(options.replayCallback); });
    }
}
