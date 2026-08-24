class Level2 extends Phaser.Scene { //creates a scene in the Phaser Object called Level1, to be referenced in game.js
    constructor() { //call constructor method on the game object to create an instance of scene 
        super({ key: "Level2" }); //on the game object create a property of scene and set key to Level1, used in config parameters for game
    }

    //create function 
    create() {
        //set world boundaries
        var body = this.physics.world.setBounds(0, 0, this.game.config.width, this.game.config.height); //set world boundaries up with originX, originY, Game Width, Game Height
        //END world bounds

        //add background
        this.background = new Background(this, this.game.config.width * 0.5, this.game.config.height * 0.5, "backgroundstars"); // add background image first
        //END background image

        //CREATE GRID
        this.aGrid = new AlignGrid({ scene: this, rows: 11, cols: 11 }); //add grid to screen for scaling and positioning
        //END GRID

        //create sfx
        this.sfx = ggCreateGameplaySfx(this);
        //END sfx

        //Mute Button
        this.btnMute = this.add.image( //create btnMute and add it as image
            0, //set position on the x axis
            0, //set position on the y axis
            "sound" //add image key
        );
        this.btnMute.setTint(0x00ff00); // set the mute button to green
        this.btnMute.setInteractive(); //set button to be interactive
        this.aGrid.placeAtIndex(99, this.btnMute); //set position on grid
        Align.scaleToGameW(this.btnMute, 0.04); //set scale
        //END Mute Button

        particles = null;
        emitter = ggNullEmitter();

        //SCORED POINTS  AND LIVES REMAINING METHODS 
        textScore = this.add.text(0, 0, 'Score: ' + score, { fontFamily: GG_FONT_DISPLAY, fontSize: 42, fill: '#ffffff' }); //create score text, position x and y, set text with score variable and add font styling
        textScore.setOrigin(0.2, 0.5); //set origin
        this.aGrid.placeAtIndex(0, textScore); //set position on the grid
        Align.scaleToGameW(textScore, 0.12); //set scale
        textLives = this.add.text(0, 0, 'Lives: ' + currentLives, { fontFamily: GG_FONT_DISPLAY, fontSize: 42, fill: '#ffffff' }); //create lives text, position x and y, set text with currentLives variable and add font styling
        textLives.setOrigin(0.2, 0.5); //set origin
        this.aGrid.placeAtIndex(110, textLives); //set position on the grid
        Align.scaleToGameW(textLives, 0.12); //set scale
        textNukesLoad = this.add.text(0, 0, 'ReArm: 150/150', { fontFamily: GG_FONT_DISPLAY, fontSize: 42, fill: '#ffffff' }); //create ReArm text, position x and y, add font styling
        textNukesLoad.setOrigin(0.85, 1); //set origin
        this.aGrid.placeAtIndex(120, textNukesLoad); //set position on the grid
        Align.scaleToGameW(textNukesLoad, 0.17); //set scale
        textNukesLoad.setPosition(this.game.config.width * 0.9, this.game.config.height * 0.91); //separate HUD labels
        textNukes = this.add.text(0, 0, String(currentNukes), { fontFamily: GG_FONT_DISPLAY, fontSize: 42, fill: '#ffffff' }); //create Nukes Left text, position x and y, set text with currentNukes variable and add font styling
        textNukes.setOrigin(0.8, 0.4); //set origin
        this.aGrid.placeAtIndex(120, textNukes); //set position on the grid
        Align.scaleToGameW(textNukes, 0.12); //set scale
        textNukes.setPosition(this.game.config.width * 0.9, this.game.config.height * 0.97); //separate HUD labels
        restartlevel = this.add.text(0, 0, 'Replay: ' + LevelRestart, { fontFamily: GG_FONT_DISPLAY, fontSize: 42, fill: '#ffffff' }); //show how times you can restart current level
        restartlevel.setOrigin(0.8, 0.5); //set origin
        this.aGrid.placeAtIndex(10, restartlevel); //set position on the grid
        Align.scaleToGameW(restartlevel, 0.12); //set scale
        //END score and lives

        //CREATE CONTROL METHODS
        //Keyboard methods created for use in update function
        cursors = this.input.keyboard.createCursorKeys(); //sets cursor keys up for operation
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); //sets SPACE as FIRE key
        this.keyN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N); //sets key N as NUKE key
        this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R); //sets key R as Restart Key on GAME OVER
        this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER); //sets key ENTER as continue button on level win
        this.keyM = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);

        this.input.keyboard.on('keydown-P', function() { //on pressing Key P
            this.pauseGame();
        }, this);

        //ADD MUTE FUNCTION
        this.input.keyboard.on('keydown-Q', function() { //on pressing Key Q
            if (!isMuted) { //if not muted
                this.btnMute.setTint(0xff0000); // set the mute button to red when Q pressed
                this.btnMute.setTexture("mute"); // set image to mute image
                isMuted = true; //set variable
                this.game.sound.mute = true; //set mute to true
            }
            else {
                this.btnMute.setTint(0x00ff00); // set the mute button to green when Q pressed
                this.btnMute.setTexture("sound"); // set image to sound image
                isMuted = false; //set variable
                this.game.sound.mute = false; //set mute to false
            }
        }, this);
        //END mute function

        //END Keyboard methods created for use in update function
        //TOUCH CONTROLS

        //touch mute function
        this.btnMute.on("pointerdown", function() { //this mute button when clicked
            if (!isMuted) { //if not muted
                this.btnMute.setTint(0xff0000); // set the mute button to red 
                this.btnMute.setTexture("mute"); // set image to mute image
                isMuted = true; //set variable
                this.game.sound.mute = true; //set mute to true
            }
            else {
                this.btnMute.setTint(0x00ff00); // set the mute button to green
                this.btnMute.setTexture("sound"); // set image to sound image
                isMuted = false; //set variable
                this.game.sound.mute = false; //set mute to false
            }
        }, this);
        //END touch mute function

        ggInstallTouchFire(this);
        if (touch) { //if touch true
            this.input.on('pointerout', function(pointer) { //when pointerout of circle 
                playerMoveX = "GO"; //set to GO
                playerMoveY = "GO"; //set to GO
            }, this);
            this.input.on('pointermove', function(pointer) { //if pointer moves
                if (pointer.x < this.player.x) { //if pointer left
                    playerDirX = "RIGHT"; //set var to right
                }
                else if (pointer.x > this.player.x) { //if pointer right
                    playerDirX = "LEFT"; //set var to left
                }
                if (pointer.y < this.player.y) { //if pointer above
                    playerDirY = "UP"; //set var to up
                }
                else if (pointer.y > this.player.y) { //if pointer below
                    playerDirY = "DOWN"; //set var to down
                }
            }, this);
        }

        if (touch) {
            this.GameContinue = ["Tap to Continue"];
            this.Restart = ["Tap to Restart"];
        }
        else {
            this.GameContinue = ["Press ENTER to Continue"];
            this.Restart = ["Press R to Restart"];
        }
        ggCreateSharedHud(this, { showReplay: true });
        //END TOUCH CONTROLS
        //END CONTROL METHODS

        //set scene variables for shooting delays
        this.playerShootDelay = 20; //sets the Delay value for the player laser, lower the value the faster it shoots
        this.playerShootTick = 0; //sets the playerShootTick to 0, for using in the updatePlayerShooting function
        this.playerNukeDelay = 150; //sets the Delay value for the player Nuke, lower the value the faster it shoots
        this.playerNukeTick = 150; //sets the playerNukeTick to 150, for using in the updatePlayerShooting function
        //END set scene variables for shooting delays

        //create classes on the this.Object to assign the grouping method to  
        this.enemies = this.add.group(); //create enemies group
        this.enemyLasers = this.add.group(); //create enemyLaser group
        this.playerLasers = this.add.group(); //create playerLaser group
        this.starNukes = this.add.group(); //create starNukes group 
        this.explosions = this.add.group(); //create explosions group
        this.nukeExplosions = this.add.group(); //create nukeExplosions group
        this.shieldTiles = this.add.group(); //create sheildTiles group
        this.shieldHoles = this.add.group(); //create sheildHoles group     
        this.asteroids = this.add.group(); //create asteroids group
        this.comets = this.add.group(); //create comet group
        //END classes grouping


        //Create enemies and set positions movement directions
        this.lastEnemyMoveDir = "RIGHT"; //create a variable to hold last enemy movement
        this.enemyMoveDir = "LEFT"; //create a variable to hold this enemy movement
        this.enemyRect = new Phaser.Geom.Rectangle( //for moving the enemy rectangle around
            0, //set the x position of rectangle
            0, //set the y position of rectangle
            Math.round(this.game.config.width / 11) * 10, //sets the width of rectangle
            Math.round(this.game.config.height / 11) * 4 //sets the height of rectangle
        );
        this.aGrid.placeAtIndex(11, this.enemyRect); //set rect at grid position

        this.createEnemies(); //create function for enemies
        //END Create enemies

        // Create callback methods
        this.updateEnemiesShooting(); //create callback method for updating enemy shots 
        this.updateEnemiesMovement(); //create callback method for updating enemy moves 
        this.createPlayer(); //create callback method for creating player
        this.updatePlayerMovement(); //create callback method for updating player movement
        this.updatePlayerTouchMovement(); //create callback method for updating player touch moving
        this.updatePlayerShooting(); //create callback method for updating player shots
        this.updateLasers(); //create callback method for updating shots
        this.updateNukes(); //create callback method for updating Nukes
        this.createAsteroids(); //create callback method for asteroids
        ggCreateComets(this); //create supplied animated comet events
        //END callback methods

        //COLLISION DETECTION

        this.physics.add.overlap(this.asteroids, this.player, function(asteroid, player) { //create a physics overlap event between object1 and object2, followed by collideCallback function

            if (asteroid) { //if asteroid
                asteroid.destroy(); //destroy asteroid
            }
            //ALSO
            if (player) { //if player  
                this.createExplosion(player.x, player.y, "playerHit"); //call createExplosion method
                player.body.reset(this.game.config.width * 0.5, this.game.config.height - 50); //reset player to opening position
                this.onLifeDown(); //start onLifeDown Method
            }
        }, null, this);

        this.physics.add.overlap(this.starNukes, this.enemies, function(nuke, enemy) { //create a physics overlap event between object1 and object2, followed by collideCallback function

            if (nuke) { //if player nuke
                nuke.destroy(); //destroy nuke object 
                emitter.stop(); //stop particles emitting
            }
            //ALSO
            if (enemy) { //if enemy  
                enemyShips--; //decrement enemyShips by 1 (used for testing)
                enemyDeaths++; //increment enemyDeaths by 1 for game win logic
                this.createNukeExplosion(enemy.x, enemy.y); //call createNukeExplosion method
                ggScoreEvent(this, ggEnemyScoreEvent(enemy)); //locked score event for destroyed enemy                 
                enemy.destroy(); //destroy enemy object
            }
        }, null, this);

        this.physics.add.overlap(this.nukeExplosions, this.enemies, function(explosion, enemies) { //create a physics overlap event between object1 and object2, followed by collideCallback function

            if (enemies) { //if enemies (plural hit)  
                enemyShips--; //decrement enemyShips by 1 (used for testing)
                enemyDeaths++; //increment enemyDeaths by 1 for game win logic
                this.createExplosion(enemies.x, enemies.y); //call creatExplosion method on each object
                ggScoreEvent(this, ggEnemyScoreEvent(enemies)); //locked score event for destroyed enemy
                enemies.destroy(); //destroy enemies that are hit
            }
        }, null, this);

        this.physics.add.overlap(this.playerLasers, this.enemies, function(laser, enemy) { //create a physics overlap event between object1 and object2, followed by collideCallback function

            if (laser) { //if player laser
                laser.destroy(); //destroy laser object
            }
            //ALSO
            if (enemy) { //if enemy  
                enemyShips--; //decrement enemyShips by 1 (used for testing)
                enemyDeaths++; //increment enemyDeaths by 1 for game win logic
                this.createExplosion(enemy.x, enemy.y); //call creatExplosion method
                ggScoreEvent(this, ggEnemyScoreEvent(enemy)); //locked score event for destroyed enemy
                enemy.destroy(); //destroy enemy object
            }
        }, null, this); //processCallback set to null and context set to this

        this.physics.add.overlap(this.playerLasers, this.asteroids, function(laser, asteroid) { //create a physics overlap event between object1 and object2, followed by collideCallback function

            if (laser) { //if player laser
                laser.destroy(); //destroy laser object
            }
            //ALSO
            if (asteroid) { //if asteroid  
                this.createExplosion(asteroid.x, asteroid.y); //call createExplosion method
                ggScoreEvent(this, "ASTEROID_DESTROYED"); //locked asteroid score event
                asteroid.destroy(); //destroy asteroid object
            }
        }, null, this);

        this.physics.add.overlap(this.starNukes, this.asteroids, function(nuke, asteroid) { //create a physics overlap event between object1 and object2, followed by collideCallback function

            if (nuke) { //if player nuke
                nuke.destroy(); //destroy nuke object
                emitter.stop(); //stop particles emitting    
            }
            //ALSO
            if (asteroid) { //if asteroid  
                this.createNukeExplosion(asteroid.x, asteroid.y); //call createNukeExplosion method
                ggScoreEvent(this, "ASTEROID_DESTROYED"); //locked asteroid score event
                asteroid.destroy(); //destroy asteroid object
            }
        }, null, this);

        this.physics.add.overlap(this.playerLasers, this.enemyLasers, function(playerLaser, enemyLaser) { //create a physics overlap event between object1 and object2, followed by collideCallback function

            if (playerLaser) { //if playerLaser
                playerLaser.destroy(); //destroy enemy object
            }
            //ALSO
            if (enemyLaser) { //if enemyLaser 
                enemyLaser.destroy(); //destroy enemyLaser object
            }

        }, null, this); //processCallback set to null and context set to this

        this.physics.add.overlap(this.playerLasers, this.shieldTiles, function(laser, tile) { //create a physics overlap event between object1 and object2, followed by collideCallback function
            if (laser) { //if playerLaser
                laser.destroy(); //destroy laser object
            }
            //ALSO
            this.destroyShieldTile(tile, false); //player fire destroys shield tile without score penalty
        }, null, this); //processCallback set to null and context set to this

        this.physics.add.overlap(this.shieldTiles, this.enemies, function(tile, enemy) { //create a physics overlap event between object1 and object2, followed by collideCallback function
            if (enemy) { //if enemy
                this.destroyShieldTile(tile, true); //enemy contact destroys one shield tile
            }
        }, null, this); //processCallback set to null and context set to this

        this.physics.add.overlap(this.enemyLasers, this.shieldTiles, function(laser, tile) { //create a physics overlap event between object1 and object2, followed by collideCallback function
            if (laser) { //if enemyLaser 
                laser.destroy(); //destroy laser object
            }
            //ALSO
            this.destroyShieldTile(tile, true); //enemy fire destroys one shield tile
        }, null, this); //processCallback set to null and context set to this

        this.physics.add.overlap(this.player, this.enemies, function(player, enemy) { //create a physics overlap event between object1 and object2, followed by collideCallback function
            if (player) { //if player collides with enemy
                this.createExplosion(player.x, player.y, "playerHit"); //create explosion at player.x, player.y coordinates
                player.body.reset(this.game.config.width * 0.5, this.game.config.height - 50); //reset player to opening position
                this.onLifeDown(); //start lifeDown function to lose life and check if GAME OVER
            }
        }, null, this); //processCallback set to null and context set to this

        this.physics.add.overlap(this.player, this.enemyLasers, function(player, laser) { //create a physics overlap event between object1 and object2, followed by collideCallback function
            if (player) { //if player hit by enemyLaser
                this.createExplosion(player.x, player.y, "playerHit"); //create explosion at player.x, player.y coordinates
                player.body.reset(this.game.config.width * 0.5, this.game.config.height - 50); //reset player to opening position
                this.onLifeDown(); //start lifeDown function to lose life and check if GAME OVER
            }

            if (laser) { //if an enemyLaser
                laser.destroy(); //destroy laser
            }
        }, null, this); //processCallback set to null and context set to this
        ggInstallCometCollisions(this); //install supplied comet collision rules
        ggInstallSweptCollisionContracts(this); //install stable swept projectile collision contracts
        // END COLLISION DETECTION


        //create sheilds
        this.shieldPattern = [ //property of sheildPattern a nested array, 
            [1, 1, 1, 1, 1, 1, 1, 1], //gives structure to sheild, 1 = image 0 = blank
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 0, 0, 0, 0, 1, 1],
            [1, 1, 0, 0, 0, 0, 1, 1],
            [1, 1, 0, 0, 0, 0, 1, 1],
        ];

        var sheildWidth = Math.round(this.game.config.width * 0.1); //define sheildwidth as 10% of game width
        for (var i = 0; i < level2Shields; i++) { //for loop to create an inset row of sheilds based on this levels sheild count 
            this.addShield( //add shield on each iteration
                (Math.round((this.game.config.width / 2) - ((level2Shields / 2) * sheildWidth))) + (i * sheildWidth), //set the x coordinates by dividing game width by 2 minus level sheilds divided by 2 and multiplying i by sheildWidth, we can center the sheilds by offsetting from the edge then add offset to each sheild
                this.game.config.height * 0.81 //set the y position of the sheilds
            );
        }
        //END create sheilds
    }
    //end create function 

    ////////////////////////////////////////////////////////////
    // NOW CREATE OWN FUNCTIONS OUTSIDE OF THE CREATE FUNCTION//
    //create asteroids function
    createAsteroids() {
        this.time.addEvent({ //add a time event on asteroid
            delay: 2000, //set delay to 2000
            callback: function() { //create call back function for time event
                if (leftAsteroid) { //if asteroid switch is true
                    var asteroid = new Asteroid( //create new asteroid instance
                        this, //in this scene
                        0, //set x position to to left
                        Phaser.Math.RND.integerInRange(0, this.game.config.height) //set y position to random y height
                    );
                    this.asteroids.add(asteroid); //add asteroid to group
                    leftAsteroid = false; //set leftAsteroid switch to false
                };
                if (!leftAsteroid) { //if asteroid switch is false
                    var asteroid = new Asteroid( //create new asteroid instance
                        this, //in this scene
                        this.game.config.width, //set x position to right
                        Phaser.Math.RND.integerInRange(0, this.game.config.height) //set y position to random y height
                    );
                    this.asteroids.add(asteroid); //add asteroid to group
                    leftAsteroid = true; //set leftAsteroid switch to true
                };
            },
            callbackScope: this, //set call back scope to this function
            loop: true //set loop to true
        });
    }
    //END create asteroids function

    //create enemies function
    createEnemies() {
        this.time.addEvent({
            delay: 10,
            callback: function() {
                var cols = 29;
                var rows = 3;
                var minX = this.game.config.width * 0.06;
                var maxX = this.game.config.width * 0.94;
                var rowY = this.game.config.height * 0.14;
                var rowGap = Math.max(this.game.config.height * 0.078, this.game.config.width * GG_SCALES.ENEMY * 0.62);
                for (var col = 0; col < cols; col++) {
                    for (var y = 0; y < rows; y++) { //restore full population and reflow it inside the playfield
                        var x = minX + ((maxX - minX) * (col / (cols - 1)));
                        var enemy = new Enemy(this, x, rowY + (y * rowGap), "enemyShip"); //set coordinates for image with spacing on x and y and assign a key from preloaded images to add the enemyship image sprite
                        enemy.play("enemyShip"); //start animation of the enemyShip
                        enemyShips++; //add a ship to total enemy ships created
                        this.enemies.add(enemy); //draw an enemy ship on the screen at x and y
                    }
                    totalEnemyShips = enemyShips; //set totalEnemy ships to equal enemyShips created for use in Victory function
                }
            },
            callbackScope: this,
            loop: false //dont loop
        });
    }
    //END create enemies function

    //create loseLives function
    loseLives(amount) { //loseLives method passed with parameter amount
        currentLives -= amount; // currentLives drop by amount
        textLives.setText('Lives: ' + currentLives); //sets lives remaining
    }
    //END loseLives function

    //create addScore function
    addScore(amount) { //addScore method passed with parameter amount
        ggApplyScore(this, amount); //raise score by locked/runtime amount
    }
    //END addScore function

    //create createPlayer function
    createPlayer() {
        if (this.player) this.player.destroy();
        this.player = new Player( //create new player instance
            this, //in this scene
            this.game.config.width * 0.5, //set playerShip to center of screen on x axis
            this.game.config.height - 50 //set playerShip to position 50 pixels up from bottom on y axis
        );
    }
    //END createPlayer function

    //create setEnemyDirection function
    setEnemyDirection(direction) { //set enemy movement direction with direction parameter
        this.lastEnemyMoveDir = this.enemyMoveDir; //sets enemyMoveDir as lastEnemyMoveDir
        this.enemyMoveDir = direction; //enemyMoveDir is equal to direction parameter
    }
    //END setEnemyDirection function

    //create updateEnemiesMovement function
    updateEnemiesMovement() { //update Enemy Movement
        this.enemyMoveTimer = this.time.addEvent({ //adds time event to enemy movement
            delay: 1500, //set the delay to enemy movement
            callback: function() { //delay callback function

                if (this.enemyMoveDir == "RIGHT") { //if enemyMoveDir is RIGHT
                    this.enemyRect.x += 15; //Move enemy right by 15

                    if (this.enemyRect.x + this.enemyRect.width > this.game.config.width - 10) { //if enemy is past this point on x axis 
                        this.setEnemyDirection("DOWN"); //setEnemyDirection to DOWN
                    }
                }
                else if (this.enemyMoveDir == "LEFT") { //enemyMoveDir is LEFT
                    this.enemyRect.x -= 15; //Move enemy left by 15

                    if (this.enemyRect.x < (this.game.config.width - this.game.config.width) + 10) { //if enemy is past this point on x axis 
                        this.setEnemyDirection("DOWN"); //setEnemyDirection to DOWN
                    }
                }
                else if (this.enemyMoveDir == "DOWN") { //enemyMoveDir is DOWN
                    this.enemyMoveTimer.delay -= 75; //reduce enemy timer delay by 50 (speeding up the loop)
                    this.moveEnemiesDown(); //call function moveEnemiesDown
                }

                for (var i = this.enemies.getChildren().length - 1; i >= 0; i--) { //for each enemy in the enemies array
                    var enemy = this.enemies.getChildren()[i]; //select this enemy with index[i]

                    if (this.enemyMoveDir == "RIGHT") { //if enemyMoveDir is RIGHT
                        enemy.x += 15; //Move enemy RIGHT 15
                    }
                    else if (this.enemyMoveDir == "LEFT") { //if enemyMoveDir is LEFT
                        enemy.x -= 15; //Move enemy LEFT 15
                    }
                }
            },
            callbackScope: this, //set call back scope to this function
            loop: true //set loop to true
        });
    }
    //END updateEnemiesMovement function

    //create moveEnemiesDown function
    moveEnemiesDown() {
        for (var i = this.enemies.getChildren().length - 1; i >= 0; i--) { //for each enemy in the enemies array
            var enemy = this.enemies.getChildren()[i]; //select this enemy with this index

            enemy.y += 13; //Move enemy DOWN by 13

            if (this.lastEnemyMoveDir == "LEFT") { //if lastEnemyMoveDir is LEFT
                this.setEnemyDirection("RIGHT"); //setEnemyDirection to RIGHT
            }
            else if (this.lastEnemyMoveDir == "RIGHT") { //if lastEnemyMoveDir is RIGHT
                this.setEnemyDirection("LEFT"); //setEnemyDirection to LEFT
            }
        }
    }
    //END moveEnemiesDown function

    //create updateEnemiesShooting function
    updateEnemiesShooting() { //enemy Shooting function
        this.time.addEvent({ // add time delay event
            delay: 125, //set delay to 125
            callback: function() { //create callback function on time event
                for (var i = 0; i < this.enemies.getChildren().length; i++) { //for each enemy in the enemies array
                    var enemy = this.enemies.getChildren()[i]; //select this enemy with index[i]

                    if (Phaser.Math.Between(0, 1000) > 995) { //for each enemy, if number generated is greater than 995 FIRE (lower the number the higher the fire rate)
                        var laser = new EnemyLaser(this, enemy.x, enemy.y); //add a new EnemyLaser object
                        this.enemyLasers.add(laser); //draw a new enemyLaser

                        this.sfx.laserEnemy.play(); //play the sound laserEnemy
                    }
                }
            },
            callbackScope: this, //set call back scope to this function
            loop: true //set loop to true
        });
    }
    //END updateEnemiesShooting function

    //create updatePlayerMovement function
    updatePlayerMovement() { //update player movement
        this.time.addEvent({ //add time event
            delay: 60, //set delay to 60
            callback: function() { //create call back function for time event
                if (controllerActionPressed("pause")) {
                    this.pauseGame();
                }
                var moved = false;
                if (!touch || getController()) {
                    if (cursors.left.isDown || controllerDirectionDown("left")) { //if key A pressed down
                        this.player.x -= this.game.config.height * 0.007; //Move left
                        moved = true;
                    }
                    if (cursors.right.isDown || controllerDirectionDown("right")) { //if key D pressed down
                        this.player.x += this.game.config.height * 0.007; //Move right
                        moved = true;
                    }
                    if (cursors.up.isDown || controllerDirectionDown("up")) { //if key W pressed down
                        this.player.y -= this.game.config.height * 0.007; //Move up   
                        moved = true;
                    }
                    if (cursors.down.isDown || controllerDirectionDown("down")) { //if key S pressed down
                        this.player.y += this.game.config.height * 0.007; //Move down
                        moved = true;
                    }
                }
                ggSetPlayerMovementState(this, moved);
            },
            callbackScope: this, //set call back scope to this function
            loop: true //set loop to true
        });
    }
    //END updatePlayerMovement function

    //create updatetouchPlayerMovement function
    updatePlayerTouchMovement() { //update touch player movement
        this.time.addEvent({ //add time event
            delay: 60, //set delay to 60
            callback: function() { //create call back function for time event
                if (touch && this.player.active) { //if touch is true
                    var shape = new Phaser.Geom.Circle(40, 40, 75); //create a circle for interactivity
                    this.player.setInteractive(shape, Phaser.Geom.Circle.Contains); //set player interactive with the shape created

                    this.player.on('pointerover', function(pointer) { //if pointerover circle
                        playerMoveX = "STOP"; //set var to stop
                        playerMoveY = "STOP"; //set var to stop
                    }, this);
                    if (playerMoveX == "STOP") { //if stop 
                        this.player.x += 0; //dont move
                    }
                    else if (playerMoveX == "GO") { //if go
                        if (playerDirX == "RIGHT") { //and var is right
                            this.player.x -= this.game.config.height * 0.007; //move player right
                        }
                        if (playerDirX == "LEFT") { //and var is left
                            this.player.x += this.game.config.height * 0.007; //move player left
                        }
                    }
                    if (playerMoveY == "STOP") { //if stop 
                        this.player.y += 0; //dont move
                    }
                    else if (playerMoveY == "GO") { //if go
                        if (playerDirY == "UP") { //and var is up
                            this.player.y -= this.game.config.height * 0.007; //move player up
                        }
                        if (playerDirY == "DOWN") { //and var is down
                            this.player.y += this.game.config.height * 0.007; //move player down
                        }
                    }
                }
                else {
                    this.player.disableInteractive();
                }
            },
            callbackScope: this, //set call back scope to this function
            loop: true //set loop to true
        });
    }
    //END updatetouchPlayerMovement function

    //create updatePlayerShooting function
    updatePlayerShooting() {
        this.time.addEvent({ //add a time event on player shooting
            delay: 15, //set delay to 15
            callback: function() { //create a callback function 
                var fireDown = this.keySpace.isDown || controllerActionDown("fire");
                var nukeDown = this.keyN.isDown || controllerActionDown("nuke");

                if (fireDown && this.player.active) { //if SPACE is down && player is active still
                    if (this.playerShootTick < this.playerShootDelay) { //if playerShootTick is less than the playerShootDelay
                        this.playerShootTick++; //add 1 to Tick count, which will repeat until it hits 30
                    }
                    else {
                        ggFirePlayerLaser(this);
                        this.playerShootTick = 0; //set shootTick back to 0
                    }
                }
                if (nukeDown && this.player.active && currentNukes > 0) { //if N is down && player is active still && nukes available
                    if (this.playerNukeTick < this.playerNukeDelay) { //if playerNukeTick is less than the playernukeDelay
                        this.playerNukeTick++; //add 1 to Tick count, which will repeat until it hits 150
                        textNukesLoad.setText('ReArm: ' + this.playerNukeTick + '/' + this.playerNukeDelay); //set rearm text to count the nuke tick number
                    }
                    else {
                        ggFirePlayerNuke(this);
                        this.playerNukeTick = 0; //set nukeTick back to 0
                    }
                }
                if (nukeDown && this.player.active && currentNukes == 0) { //if SPACE is down && no nukes left
                    textNukesLoad.setText('ReArm: OUT'); //set nukes rearming text to out
                }
            },
            callbackScope: this, //set call back scope to this function
            loop: true //set loop to true
        });
    }
    // END updatePlayerShooting function

    //create updateNukes function
    updateNukes() {
        this.time.addEvent({ //add a time event on player laser
            delay: 30, //set delay to 30
            callback: function() { //create call back function for time event
                for (var i = 0; i < this.starNukes.getChildren().length; i++) { //for each enemy in the enemies array
                    var nuke = this.starNukes.getChildren()[i]; //this nuke = starNukes[i]
                    if (nuke.y < 10) { //if laser is less than 5 away from screen edge
                        this.createNukeExplosion(nuke.x, nuke.y); //create an explosion at this nuke.x and nuke.y
                        emitter.stop(); //stope emitting particles
                        if (nuke) { //if nuke         
                            nuke.destroy(); //destroy this nuke
                        }
                    }
                }
            },
            callbackScope: this, //set call back scope to this function
            loop: true //set loop to true
        });
    }
    //END updateNukes function

    //create updateLaser function
    updateLasers() { //update laser movement
        this.time.addEvent({ //add a time event on player laser
            delay: 30, //set delay to 30
            callback: function() { //create call back function for time event
                for (var i = 0; i < this.playerLasers.getChildren().length; i++) { //for each enemy in the enemies array
                    var laser = this.playerLasers.getChildren()[i]; //this laser = playerLaser[i]

                    if (laser.y < 10) { //if laser is less than 10 away from screen edge
                        this.createExplosion(laser.x, laser.y); //create an explosion at this laser.x and laser.y

                        if (laser) { //if laser         
                            laser.destroy(); //destroy this laser
                        }
                    }
                }
            },
            callbackScope: this, //set call back scope to this function
            loop: true //set loop to true
        });

        this.time.addEvent({ //add a time event on enemy laser
            delay: 128, //set delay to 128
            callback: function() { //create call back function for time event
                for (var i = 0; i < this.enemyLasers.getChildren().length; i++) { //for each enemyLaser in the enemyLaser group
                    var laser = this.enemyLasers.getChildren()[i]; //set

                    if (laser.y > this.game.config.height - 10) { //if laser is less than 10 away from screen edge
                        this.createExplosion(laser.x, laser.y); //create an explosion at this laser.x and laser.y

                        if (laser) { //if laser         
                            laser.destroy(); //destroy this laser
                        }
                    }
                }
            },
            callbackScope: this, //set call back scope to this function
            loop: true //set loop to true
        });
    }
    //END updateLaser function

    //create addSheild function
    addShield(posX, posY) { //create an addSheild function with posX, posY as paramaters
        for (var y = 0; y < this.shieldPattern.length; y++) { //iterate through sheildPattern nested array to obtain the number of rows to create on y axis
            for (var x = 0; x < this.shieldPattern[y].length; x++) { //for each row iterate through the array and add a sheildTile to the position on x axis
                if (this.shieldPattern[y][x] == 1) { //if the array.value is == 1
                    var tile = new ShieldTile( //then add a new tile object
                        this, //this game object
                        posX + (x * (this.game.config.width / 100)), //set new position of tile object on x axis with padding
                        posY + (y * (this.game.config.height / 100)) //set new position of tile object on y axis with padding
                    );
                    this.shieldTiles.add(tile); //draw tile image in location 
                }
            }
        }
    }
    //END addSheild function

    //create destroySheildTile function
    destroyShieldTile(tile, enemyHit) {
        if (tile) { //if(tile)
            if (enemyHit) ggScoreEvent(this, "SHIELD_TILE_ENEMY_HIT"); //locked shield penalty only for enemy hits
            this.createExplosion(tile.x, tile.y, "shieldHit"); //create explosion at x and y of tile

            for (var i = 0; i < Phaser.Math.Between(10, 20); i++) { //for loop to iterate through sheildtile array randomly
                var shieldHole = this.add.graphics({ //create sheildhole var and add graphics
                    fillStyle: { //create style
                        color: 0x000000 //set colour of sheildHole
                    }
                });
                shieldHole.setDepth(-1); //set depth of sheildHole

                var size = Phaser.Math.Between(2, 4); //create a random size variable on each iteration

                if (Phaser.Math.Between(0, 100) > 25) { //if number generated is over 25
                    var rect = new Phaser.Geom.Rectangle( //create rectangle over tile
                        tile.x + (Phaser.Math.Between(-2, tile.displayWidth + 2)), //using tile.x coordinates +or- 2
                        tile.y + (Phaser.Math.Between(-2, tile.displayHeight + 2)), //using tile.y coordinates +or- 2
                        size, //width is size 
                        size //height is size 
                    );
                }
                else {
                    var rect = new Phaser.Geom.Rectangle( //create rectangle over tile 
                        tile.x + (Phaser.Math.Between(-4, tile.displayWidth + 4)), //using tile.x coordinates +or- 4
                        tile.y + (Phaser.Math.Between(-4, tile.displayHeight + 4)), //using tile.y coordinates +or- 4
                        size, //width is size 
                        size //height is size 
                    );
                }

                shieldHole.fillRectShape(rect); //fill random rect shape created with sheildholes at random

                this.shieldHoles.add(shieldHole); //add sheildhole to the group
            }
            tile.destroy(); //destroy tile
        }
    }
    //END destroySheildTile function

    //create Explosion function
    createExplosion(x, y, audioEvent) {
        if (audioEvent !== false) {
            if (audioEvent == "playerHit") this.sfx.playerHit.play();
            else if (audioEvent == "shieldHit") this.sfx.shieldHit.play();
            else if (audioEvent == "large") this.sfx.explosionLarge.play();
            else this.sfx.explosionSmall.play();
        }
        var explosion = new Explosion(this, x, y, audioEvent == "large" || audioEvent == "mothershipHit"); //create a new instance of explosion
        this.explosions.add(explosion); //add it to the explosions group
        if (totalEnemyShips == enemyDeaths) { //if totalEnemyShips is same as totalDeaths
            this.win(); //start win method
            levelWon = true;
        }
    }
    //end explosion function

    //create nuke explosion function 
    createNukeExplosion(x, y, audioEvent) {
        if (audioEvent !== false) this.sfx.nukeBurst.play(); //play sound fx
        var nukeExplosion = new NukeExplosion(this, x, y); //create a new instance of nukeExplosion
        this.nukeExplosions.add(nukeExplosion); //add it to the nukeExplosions group
        if (totalEnemyShips == enemyDeaths) { // if totalEnemyShips is same as totalDeaths
            this.win(); //start win method
            levelWon = true;
        }
    }
    //END nuke explosion function

    //create life down function
    onLifeDown() {
        if (currentLives == 0) { //if lives = 0
            this.gameOver(); //start gameover method
        }
        else if (currentLives > 0) { //else if lives greater than 0
            this.loseLives(enemyHitStrength); //lose a life by value of enemyHitStrength
        }
    }
    //end life down function

    //create win function
    win() {
        if (this.ggWinHandled) return;
        this.ggWinHandled = true;
        levelWon = true;
        this.player.destroy(); //destroy player if victory to stop losing any lives 
        var completionBonus = ggApplyCompletionBonusOnce(this);
        ggRenderVictory(
            this,
            "LEVEL 2 COMPLETE",
            "CRUISER WAVE CLEARED",
            "NEXT",
            function() {
                levelWon = false;
                gameWinPrize = true;
                this.addWinPrize();
                this.scene.start("BossLevel");
            }.bind(this),
            {
                wave: "2",
                bonus: completionBonus,
                menuCallback: function() { ggResetToMenu(this); }.bind(this),
                replayCallback: function() { ggRestartGameplay(this, "Level2"); }.bind(this)
            }
        );
        enemyShips = 0; //set enemyShips to 0
        enemyDeaths = 0; //set enemyDeaths to 0
        totalEnemyShips = 0; //reset total enemyships
        winTick = true; //set winTick true
    }
    //END win function

    //continue function
    updateContinue() { //update method to restart game in event of GAME OVER
        this.time.addEvent({ //add timed event
            delay: 60, //set delay to 60
            callback: function() { //create a callback function
                if ((this.keyEnter.isDown || controllerActionPressed("start")) && levelWon && (!touch || getController())) { //if the Space key is pressed and levelWon is true
                    levelWon = false; //set variable
                    gameWinPrize = true; //set gameWinPrize true
                    this.addWinPrize(); //goto function
                    this.scene.start("BossLevel"); //set scene start for BossLevel
                }
            },
            callbackScope: this, //set call back scope to this
            loop: true //set loop to true checking parameters
        });
    }
    // end continue function

    //create addWinPrize function
    addWinPrize() {
        if (gameWinPrize && winTick) { //if gameWinPrize and winTick are true
            currentNukes++; //Add a nuke 
            LevelRestart++; //Add a level restart ability as reward for completing level
            gameWinPrize = false; //set gameWinPrize false
            winTick = false; //set winTick false
        }
    }
    //END create addWinPrize function

    //create gameover function
    gameOver() {
        if (this.player) this.player.destroy(); //destroy player
        ggRenderGameOver(
            this,
            function() { ggResetToMenu(this); }.bind(this),
            function() { ggRestartGameplay(this, "Level2"); }.bind(this),
            function() { ggRestartGameplay(this, "Level2"); }.bind(this)
        );
    }
    //END gameover function

    //restart function
    updateRestart() { //update method to restart game in event of GAME OVER
        this.time.addEvent({ //add timed event
            delay: 100, //set delay to 100
            callback: function() { //create a callback function
                if ((this.keyR.isDown || controllerActionPressed("restart")) && RIP && (!touch || getController())) { //if the R key is pressed and RIP is true
                    if (LevelRestart > 0) { //if levelRestart = 1 
                        enemyShips = 0; //set enemyShips to 0
                        enemyDeaths = 0; //set enemyDeaths to 0
                        totalEnemyShips = 0; //reset total enemyships
                        currentLives = LevelRestartLives; //reset lives to LevelRestartLives
                        this.loseRestartLife(); //lose level restart
                        RIP = false; //set RIP to false so restart cant happen in game
                        this.scene.start("Level2"); //Restart Game
                    }
                    else {
                        enemyShips = 0; //set enemyShips to 0
                        enemyDeaths = 0; //set enemyDeaths to 0
                        totalEnemyShips = 0; //reset total enemyships
                        currentLives = 0; //reset lives
                        currentNukes = 0; //reset nukes
                        RIP = false; //set RIP to false so restart cant happen in game
                        score = 0; //set the score back to 0
                        this.scene.start("MainMenu"); //Restart Game
                    }
                }
            },
            callbackScope: this, //set call back scope to this
            loop: true //set loop to true checking parameters
        });
    }
    // end restart function

    loseRestartLife() {
        LevelRestart--;
    }

    pauseGame() {
        if (this.scene.get("Paused").scene.isActive()) return;
        isPaused = this.scene; //set isPasued to this.scene to get key
        this.scene.pause(); //pause this scene
        this.scene.launch('Paused'); //launch paused scene
    }
}
//END scene
