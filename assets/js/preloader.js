class Preloader extends Phaser.Scene {

    constructor() {
        super('Preloader');
    }

    preload() {
        this.load.image("backgroundstars", "assets/images/owned/backgrounds/gg_starfield_16x9_v001.png") //preload background stars image
        this.load.image("BtnPlay", "assets/images/owned/branding/gg_symbol_v001.png"); //preload the Play Button image
        this.load.image("BtnPlayHover", "assets/images/owned/branding/gg_symbol_v001.png"); //preload the Play Button Hover image
        this.load.image("logoPrimary", "assets/images/owned/branding/gg_logo_primary_v001.png");
        this.load.image("menuTitlecard", "assets/images/owned/branding/gg_menu_titlecard_v001.png");
        this.load.image("hero", "assets/images/owned/branding/gg_symbol_v001.png"); //preload the hero image
        this.load.image("BtnInfo", "assets/images/owned/ui/gg_ui_info_v001.png"); //preload the Info Button image
        this.load.image("BtnPoint", "assets/images/owned/ui/gg_ui_pointer_v001.png"); //preload the Pointer Button image
        this.load.audio("sndBtn", "assets/audio/sndBtn.wav"); //preload the Button Sound
        this.load.spritesheet("playerShip", "assets/images/owned/sprites/gg_player_v001_sheet.png", {
            frameWidth: 128,
            frameHeight: 128
        });
        this.load.spritesheet("motherShip", "assets/images/owned/sprites/gg_boss_v001_sheet.png", { //preload Alien Mothership spritesheet to the game, assign key name and src, object frameWidth and frameheight
            frameWidth: 128,
            frameHeight: 128
        });
        this.load.spritesheet("alienscout", "assets/images/owned/sprites/gg_scout_v001_sheet.png", { //preload alienscout spritesheet to the game, assign key name and src, object frameWidth and frameheight
            frameWidth: 128,
            frameHeight: 128
        });
        this.load.spritesheet("enemyCruiser", "assets/images/owned/sprites/gg_cruiser_v001_sheet.png", { //preload enemyCruiser spritesheet to the game, assign key name and src, object frameWidth and frameheight
            frameWidth: 128,
            frameHeight: 128
        });
        this.load.spritesheet("enemyShip", "assets/images/owned/sprites/gg_destroyer_v001_sheet.png", { //preload enemyShip spritesheet to the game, assign key name and src, object frameWidth and frameheight
            frameWidth: 128,
            frameHeight: 128
        });
        this.load.image("sprShieldTile", "assets/images/sprShieldTile.png"); //preload sheild image to the game, assign key name and src
        this.load.image("sprLaserEnemy", "assets/images/sprLaserEnemy.png"); //preload enemyLaser image to the game, assign key name and src
        this.load.image("sprLaserPlayer", "assets/images/sprLaserPlayer.png"); //preload playerLaser image to the game, assign key name and src
        this.load.spritesheet("nuke", "assets/images/owned/sprites/gg_nuke_v001_sheet.png", {
            frameWidth: 128,
            frameHeight: 128
        });
        this.load.spritesheet("sprExplosion", "assets/images/owned/sprites/gg_explosion_v001_sheet.png", { //preload explosion spritesheet to the game, assign key name and src, object frameWidth and frameheight
            frameWidth: 128,
            frameHeight: 128
        });
        this.load.image('alien', "assets/images/owned/branding/gg_game_over_v001.png"); //preload alien image
        this.load.image('mute', "assets/images/owned/ui/gg_ui_sound_off_v001.png"); //preload mute image
        this.load.image('sound', "assets/images/owned/ui/gg_ui_sound_on_v001.png"); //preload sound image
        this.load.image('gameOver', "assets/images/owned/branding/gg_game_over_v001.png"); //preload gameover explosion image
        this.load.image('hero', "assets/images/owned/branding/gg_symbol_v001.png"); //preload heroin image
        this.load.image('fireworks', "assets/images/owned/branding/gg_victory_v001.png"); //preload fireworks image
        this.load.image("asteroid", "assets/images/owned/sprites/gg_asteroid_v001.png"); //perload the asteroid image
        this.load.audio("sndExplode", "assets/audio/sndExplode.wav"); //preload audio files, assign key name and src
        this.load.audio("sndLaserPlayer", "assets/audio/sndLaserPlayer.wav"); //preload audio files, assign key name and src
        this.load.audio("sndLaserEnemy", "assets/audio/sndLaserEnemy.wav"); //preload audio files, assign key name and src
        this.load.audio("nukefiring", "assets/audio/gg_nuke_v001.wav"); //preload audio files, assign key name and src

    }
    create() {
        //create animations
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
            frameRate: 15, //set frame rate speed
            repeat: 5 //turns on then off higher equals longer on
        });
        this.anims.create({
            key: "nuke",
            frames: this.anims.generateFrameNumbers("nuke"),
            frameRate: 15,
            repeat: -1
        });
        //END animations

        this.startGame(); //create function to startGame
    }

    startGame() {
        this.scene.start('MainMenu'); //start this scene on completion of loading assets.
    }

}
