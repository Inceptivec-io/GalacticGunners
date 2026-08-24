var config = { //game configuration parameters
    type: Phaser.AUTO, //set Phaser to Auto, rather than webGL or Canvas
    width: window.innerWidth, //sets the game viewport width
    height: window.innerHeight, //sets the game viewport height
    scale: { //set scale property game
        mode: Phaser.Scale.RESIZE, //fill browser viewport
        autoCenter: Phaser.Scale.CENTER_BOTH //center both axis
    },
    backgroundColor: "#020817", //sets the game viewport background
    physics: { //load the physics property to game
        default: "arcade", //set default property key to arcade
        arcade: { //arcade properties set
            gravity: { //gravity
                x: 0, // set to 0
                y: 0 // set to 0
            },
            debug: false, //used to debug, if true
        }
    },
    input: {
        gamepad: true
    },
    scene: [ //load scene properties and their keys
        Preloader,
        MainMenu,
        Info,
        Level1,
        Level2,
        BossLevel,
        Victory,
        Titles,
        Paused
    ],
};

var maxLives = 3; //declares maxLives Global Variable
var currentLives = 0; //declares current lives Global Variable
var RIP = false; //declares RIP switch Global Variable
var LevelRestartLives = 1; //set restart lives to 1
var LevelRestart = 0; //declare level restart available as 0
var playerHitstrength = 1; //declares playerHitStrength
var maxNukes = 2; //declares maxNukes Global Variable
var currentNukes = maxNukes; //set currentNukes = maxNukes Global Variable
var nukeHitStrength = 5; //declares nukeHitStrength
var nukeScore = GG_SCORE_EVENTS.SHIP_DESTROYED; //retained compatibility; enemy class scoring is authoritative
var particles; //declares particles Global Variable			
var emitter; //declares emitter Global Variable

var enemyShips = 0; //declares number of enemyShips Global Variable
var totalEnemyShips = 0; //declares totalEnemyShips Global Variable
var enemyDeaths = 0; //declares enemyDeaths Global Variable
var enemyHitStrength = 1; //declares enemyHitStrength Global Variable
var enemyValue = GG_SCORE_EVENTS.SHIP_DESTROYED; //declares enemyValue Global Variable
var maxMotherShipLives = 15; //add lives to mothership
var motherShipLives; //declares mothership lives
var mothershipHitValue = GG_SCORE_EVENTS.MOTHERSHIP_HIT; //declares mothershipHitValue
var motherShipAlive = true; //add mothership alive variable

var level1Shields = 8; //declares the number of sheilds in Level 1
var level2Shields = 6; //declares the number of sheilds in Level 2
var levelBShields = 4; //declares the number of sheilds in Boss Level

var score = 0; //declares score Global Variable
var finalScore = null; //declares authoritative frozen result score
var textScore; //declares score text Global Variable
var textLives; //declares lives left text Global Variable
var textNukes; //declares Nuke text Global Variable
var textNukesLoad; //declare Nuke ReArming 
var restartlevel; //declares level restart text Global Variable
var winTick = false;
var gameWinPrize = false;
var leftAsteroid = true; //set leftAsteroid variable so as to switch sides asteroids fly from


var cursors; //declares cursors Global Variable
var touch = false; //touch variable switch
var playerDirX; //add variable for player touch movement
var playerDirY; //add variable for player touch movement
var playerMoveX; //add variable for player touch movement
var playerMoveY; //add variable for player touch movement
var isPaused; //set scene paused name
var isMuted = false; //set ismuted variable
var levelWon = false; //set level won variable

const StoryContent = [ //set story text variable
    "The Year 3001 AD...",
    "The Alien Hoards are battling through the Galaxy, on a quest to destroy ALL mankind!",
    "The Human Fleet, on intel gathered from an Alien Satellite, has gone out to get the",
    "Mothership and put an end to this reign of terror!",
    "Not knowing this is a devious Alien trick, YOU are the only ship left behind to",
    "protect our Outpost on Gamma10 and uphold peace in the sector...",
    "",
    "On the scanner, in the distance, what seems to be an asteroid field is heading straight",
    "towards Gamma 10. But wait, whats that moving inside it?????",
    "",
    "BATTLE STATIONS!! We have been dooped, the Alien Hoard is in this sector! CONTACT the Fleet!",
    "You must ATTACK and slow them down until the Fleet arrives! Your our only HOPE!",
    "WATCH OUT FOR THE ASTEROIDS!"
];

const TouchSelector = [ //set touch selector text
    "  SELECT  ",
    "FOR  TOUCH"
];

const Controls = [ //set controls text variable
    "GAME CONTROLS - Press Q to Mute Sound",
    "Use Cursors/D-Pad to FLY      Hold Space/X for LASERS      Press N/Y for NUKES"
];
const TouchControls = [ //set touch controls text variable
    "GAME CONTROLS - Tap Speaker Icon to Mute",
    "Use Finger to FLY       Tap Screen for LASERS      Press Label for NUKES"
];

const GameOver = ["GAME OVER"]; //set Gameover text variable

const BestPlayedOn = [
    "Best Played On",
    "Desktop/Laptop"
];

const TitlesText = [ //set titles text variable
    "CREATED BY MICHAEL LEESE 2019",
    "",
    "THANKS TO PHASER 3 FOR THEIR API",
    "",
    "THANKS TO GIMP FOR IMAGE MANIPULATION PROGRAM",
    "",
    "FOR FURTHER CREDITS SEE MY GITHUB REPO README.MD",
    "",
    "I HOPE YOU HAD FUN!           THANKS FOR PLAYING!"
];

var game = new Phaser.Game(config); //sets game variable to new Phaser Game with parameters of config
