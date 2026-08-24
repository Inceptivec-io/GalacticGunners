class Preloader extends Phaser.Scene {

    constructor() {
        super('Preloader');
    }

    preload() {
        this.load.image("backgroundstars", "assets/images/owned/backgrounds/gg_bg_starfield_v002.png") //preload background stars image
        this.load.image("backgroundstarsPortrait", "assets/images/owned/backgrounds/gg_bg_starfield_portrait_v002.png");
        this.load.image("landscapeBackground", "assets/images/owned/backgrounds/Galaxy_Landscape_different.png");
        this.load.image("BtnPlay", "assets/images/owned/branding/gg_logo_compact_v002.png"); //preload the Play Button image
        this.load.image("BtnPlayHover", "assets/images/owned/branding/gg_logo_compact_v002.png"); //preload the Play Button Hover image
        this.load.image("logoPrimary", "assets/images/owned/branding/gg_logo_primary_v002.png");
        this.load.image("menuTitlecard", "assets/images/owned/branding/gg_logo_primary_words_v002.png");
        this.load.image("hero", "assets/images/owned/branding/gg_logo_compact_v002.png"); //preload the hero image
        this.load.image("BtnInfo", "assets/images/owned/ui/gg_ui_info_v002.png"); //preload the Info Button image
        this.load.spritesheet("BtnPoint", "assets/images/owned/ui/gg_ui_pointer_v002_sheet.png", {
            frameWidth: 724,
            frameHeight: 724
        });
        ggPreloadAudio(this);
        this.load.spritesheet("playerShip", "assets/images/owned/sprites/gg_player_ship_v002_sheet.png", {
            frameWidth: 724,
            frameHeight: 724
        });
        this.load.spritesheet("motherShip", "assets/images/owned/sprites/gg_boss_mothership_v002_sheet.png", { //preload Alien Mothership spritesheet to the game, assign key name and src, object frameWidth and frameheight
            frameWidth: 724,
            frameHeight: 724
        });
        this.load.spritesheet("alienscout", "assets/images/owned/sprites/gg_enemy_scout_v002_sheet.png", { //preload alienscout spritesheet to the game, assign key name and src, object frameWidth and frameheight
            frameWidth: 661,
            frameHeight: 793
        });
        this.load.spritesheet("enemyCruiser", "assets/images/owned/sprites/gg_enemy_cruiser_v002_sheet.png", { //preload enemyCruiser spritesheet to the game, assign key name and src, object frameWidth and frameheight
            frameWidth: 836,
            frameHeight: 941
        });
        this.load.spritesheet("enemyShip", "assets/images/owned/sprites/gg_enemy_destroyer_v002_sheet.png", { //preload enemyShip spritesheet to the game, assign key name and src, object frameWidth and frameheight
            frameWidth: 724,
            frameHeight: 724
        });
        this.load.image("sprShieldTile", "assets/images/owned/sprites/gg_shield_tile_v002.png"); //preload shield image to the game, assign key name and src
        this.load.image("sprLaserEnemy", "assets/images/owned/sprites/gg_enemy_laser_v002.png"); //preload enemyLaser image to the game, assign key name and src
        this.load.image("sprLaserPlayer", "assets/images/owned/sprites/gg_player_laser_v002.png"); //preload playerLaser image to the game, assign key name and src
        this.load.spritesheet("nuke", "assets/images/owned/sprites/gg_nuke_projectile_v002_sheet.png", {
            frameWidth: 512,
            frameHeight: 768
        });
        this.load.spritesheet("sprExplosion", "assets/images/owned/sprites/gg_explosion_small_v002_sheet.png", { //preload explosion spritesheet to the game, assign key name and src, object frameWidth and frameheight
            frameWidth: 658,
            frameHeight: 797
        });
        this.load.spritesheet("nukeBurst", "assets/images/owned/sprites/gg_nuke_burst_v002_sheet.png", {
            frameWidth: 512,
            frameHeight: 512
        });
        this.load.image('alien', "assets/images/owned/branding/gg_game_over_panel_v002.png"); //preload alien image
        this.load.image('mute', "assets/images/owned/ui/gg_ui_sound_off_v002.png"); //preload mute image
        this.load.image('sound', "assets/images/owned/ui/gg_ui_sound_on_v002.png"); //preload sound image
        this.load.image('gameOver', "assets/images/owned/branding/gg_game_over_panel_v002.png"); //preload gameover shell image
        this.load.image('fireworks', "assets/images/owned/branding/gg_victory_panel_v002.png"); //preload victory panel image
        this.load.image("hudLife", "assets/images/owned/ui/gg_hud_life_icon_v002.png");
        this.load.image("hudNuke", "assets/images/owned/ui/gg_hud_nuke_icon_v002.png");
        this.load.spritesheet("asteroid", "assets/images/owned/sprites/gg_asteroid_v002_sheet.png", {
            frameWidth: 724,
            frameHeight: 724
        });
        this.load.spritesheet("comet", "assets/images/owned/sprites/gg_comet_v002_sheet.png", {
            frameWidth: 836,
            frameHeight: 940
        });
    }
    create() {
        //create animations
        this.anims.create({ //animation object create
            key: "playerShip",
            frames: this.anims.generateFrameNumbers("playerShip", { frames: [0, 1, 0, 2] }),
            frameRate: 4,
            repeat: -1
        });
        this.anims.create({ //animation object create
            key: "enemyShip", //set the image key name to be used
            frames: this.anims.generateFrameNumbers("enemyShip"), //set image to be used to generate frames
            frameRate: 5, //set frame rate speed
            repeat: -1 //set to -1, continuous
        });
        this.anims.create({ //animation object create
            key: "enemyCruiser", //set the image key name to be used
            frames: this.anims.generateFrameNumbers("enemyCruiser"), //set image to be used to generate frames
            frameRate: 5, //set frame rate speed
            repeat: -1 //set to -1, continuous
        });
        this.anims.create({ //animation object create
            key: "motherShip", //set the image key name to be used
            frames: this.anims.generateFrameNumbers("motherShip"), //set image to be used to generate frames
            frameRate: 5, //set frame rate speed
            repeat: -1 //set to -1, continuous
        });
        this.anims.create({ //animation object create
            key: "alienscout", //set the image key name to be used
            frames: this.anims.generateFrameNumbers("alienscout"), //set image to be used to generate frames
            frameRate: 5, //set frame rate speed
            repeat: -1 //set to -1, continuous
        });
        this.anims.create({ //animation object create
            key: "sprExplosion", //set the image key name to be used
            frames: this.anims.generateFrameNumbers("sprExplosion"), //set image to be used to generate frames
            frameRate: 18, //set frame rate speed
            repeat: 0 //play once and clean up
        });
        this.anims.create({
            key: "nuke",
            frames: this.anims.generateFrameNumbers("nuke"),
            frameRate: 15,
            repeat: -1
        });
        this.anims.create({
            key: "nukeBurst",
            frames: this.anims.generateFrameNumbers("nukeBurst"),
            frameRate: 18,
            repeat: 0
        });
        this.anims.create({
            key: "asteroid",
            frames: this.anims.generateFrameNumbers("asteroid"),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: "comet",
            frames: this.anims.generateFrameNumbers("comet"),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: "BtnPoint",
            frames: this.anims.generateFrameNumbers("BtnPoint"),
            frameRate: 5,
            repeat: -1
        });
        //END animations

        this.startGame(); //create function to startGame
    }

    startGame() {
        var startMainMenu = function() {
            this.scene.start('MainMenu'); //start this scene on completion of loading assets.
        }.bind(this);

        if (document.fonts && document.fonts.load) {
            Promise.all([
                document.fonts.load("96px GalacticGunnersTitle"),
                document.fonts.load("80px GalacticGunnersDisplay"),
                document.fonts.ready
            ]).then(startMainMenu).catch(startMainMenu);
            return;
        }

        startMainMenu();
    }

}
