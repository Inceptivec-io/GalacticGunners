class Entity extends Phaser.GameObjects.Sprite { //Inherit Entity class to Phaser.GameObjects.Sprite
    constructor(scene, x, y, key) { // constructor function to instantiate an sprite object
        super(scene, x, y, key); // call super class constructor
        this.scene.add.existing(this); //add Entity to this scene
        this.scene.physics.world.enableBody(this, 0); //enableBody on this scene in physics world
    }
}

class Background extends Entity { //Inherit Background class to Entity
    constructor(scene, x, y) { // constructor function to instantiate a background object
        super(scene, x, y, "backgroundstars"); // call super class constructor
        this.setOrigin(0.5); //set origin of image to center of itself
        this.setDisplaySize(scene.game.config.width, scene.game.config.height); //cover full viewport
        this.setDepth(-5); //set image depth so underneath all other images
    }
}

class Player extends Phaser.Physics.Arcade.Sprite { //Inherit Player class to Phaser.Physics.Arcade.Sprite
    constructor(scene, x, y) { // constructor function to instantiate a player object
        super(scene, x, y, "playerShip"); // call super class constructor
        scene.add.existing(this); //add Player to this scene 
        scene.physics.add.existing(this); //add existing game objects to the physics world
        this.setCollideWorldBounds(true); //set collide world bounds to true
        this.setOrigin(0.5, 0.5); //keep player hitbox stable through animation
        Align.scaleToGameW(this, 0.058); //set scale
        this.body.setSize(this.displayWidth * 0.42, this.displayHeight * 0.5, true);
        this.play("playerShip");
    }
}

class PlayerLaser extends Entity { //Inherit PlayerLaser class to Entity
    constructor(scene, x, y) { // constructor function to instantiate a player laser object
        super(scene, x, y, "sprLaserPlayer"); // call super class constructor
        this.setOrigin(0.5);
        Align.scaleToGameW(this, 0.052); //set scale
        this.setAngle(-90);
        this.body.setSize(this.displayWidth * 0.58, this.displayHeight * 0.16, true);
    }
}

class Nuke extends Phaser.Physics.Arcade.Sprite { //Inherit Nuke class to Phaser.Physics.Arcade.Sprite
    constructor(scene, x, y, key) { // constructor function to instantiate a nuke object
        super(scene, x, y, "nuke"); // call super class constructor
        scene.add.existing(this); //add Nuke to this scene 
        scene.physics.add.existing(this); //add existing game objects to the physics world
        this.play("nuke");
        Align.scaleToGameW(this, 0.052); //set scale
        this.setVelocity(0, -400); //create random x (left or right)value and fire up at -200
        this.setAngle(0); //set angle to 0
        this.body.setSize(this.displayWidth * 0.46, this.displayHeight * 0.62, true);
    }
}

class Explosion extends Entity { //Inherit Explosion class to Entity
    constructor(scene, x, y, large) { // constructor function to instantiate an explosion object
        super(scene, x, y, large ? "sprExplosionLarge" : "sprExplosion"); // call super class constructor
        this.play(large ? "sprExplosionLarge" : "sprExplosion"); //play explosion animation when created
        this.setOrigin(0.5); //sets the origin of the explosion to center of event
        this.setScale(large ? 0.28 : 0.16); //differentiate small and large explosion scale
        this.setBlendMode(Phaser.BlendModes.ADD);
        this.setAlpha(0.95);
        scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: large ? 520 : 380,
            ease: "Sine.easeOut"
        });
        this.on("animationcomplete", function() { //when animation complete
            if (this) {
                this.destroy(); //destroy object
            }
        });
    }
}

class NukeExplosion extends Entity { //Inherit NukeExplosion class to Entity
    constructor(scene, x, y) { // constructor function to instantiate a nuke explosion object
        super(scene, x, y, "nukeBurst"); // call super class constructor
        this.play("nukeBurst"); //play supplied nuke burst animation when created
        this.setOrigin(0.5); //sets the origin of the nuke explosion to center of event
        this.setScale(0.5); //set scale of the nuke explosion
        this.setBlendMode(Phaser.BlendModes.ADD);
        this.setAlpha(0.95);
        scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 620,
            ease: "Sine.easeOut"
        });
        this.on("animationcomplete", function() { //when animation complete
            if (this) {
                this.destroy(); //destroy object
            }
        });
    }
}

class AlienMothership extends Entity { //Inherit AlienMothership class to Entity
    constructor(scene, x, y, key) { // constructor function to instantiate an alien mothership object
        super(scene, x, y, "motherShip"); // call super class constructor
        this.setOrigin(0.5, 0.95); //set origin of AlienMothership to bottom and center
        this.ggScoreEvent = "MOTHERSHIP_DESTROYED";
    }
}

class AlienScout extends Entity { //Inherit alienscout class to Entity
    constructor(scene, x, y, key) { // constructor function to instantiate an alienscout object
        super(scene, x, y, "alienscout"); // call super class constructor
        this.setOrigin(0.5); //set origin of AlienScout to center
        Align.scaleToGameW(this, 0.021); //set scale
        this.ggScoreEvent = "SCOUT_DESTROYED";
    }
}

class Enemy extends Entity { //Inherit Enemy class to Entity
    constructor(scene, x, y, key) { // constructor function to instantiate an enemy object
        super(scene, x, y, key); // call super class constructor
        this.setOrigin(0.5); //set origin of enemy to center
        Align.scaleToGameW(this, 0.021); //set scale of enemy
        this.ggScoreEvent = "SHIP_DESTROYED";
    }
}

class EnemyCruiser extends Entity { //Inherit Enemy class to Entity
    constructor(scene, x, y, key) { // constructor function to instantiate an enemy object
        super(scene, x, y, key); // call super class constructor
        this.setOrigin(0.5); //set origin of enemy to center
        Align.scaleToGameW(this, 0.033); //set scale
        this.ggScoreEvent = "SHIP_DESTROYED";
    }
}

class EnemyLaser extends Entity { //Inherit EnemyLaser class to Entity
    constructor(scene, x, y, key) { // constructor function to instantiate a enemy laser object
        super(scene, x, y, "sprLaserEnemy"); // call super class constructor
        this.setOrigin(0.5);
        Align.scaleToGameW(this, 0.044); //set scale of enemy laser
        this.setAngle(90);
        this.body.setSize(this.displayWidth * 0.58, this.displayHeight * 0.16, true);
    }
}

class EnemyMotherShipLaser extends Entity { //Inherit EnemyLaser class to Entity
    constructor(scene, x, y, key) { // constructor function to instantiate a enemy laser object
        super(scene, x, y, "sprLaserEnemy"); // call super class constructor
        this.setOrigin(0.5);
        Align.scaleToGameW(this, 0.058); //set scale
        this.setAngle(90);
        this.body.setSize(this.displayWidth * 0.58, this.displayHeight * 0.16, true);
    }
}

class Asteroid extends Phaser.Physics.Arcade.Sprite { //Inherit Asteroid class to Phaser.Physics.Arcade.Sprite
    constructor(scene, x, y, key) { // constructor function to instantiate an asteroid object
        super(scene, x, y, "asteroid"); // call super class constructor
        scene.add.existing(this); //add asteroid to this scene 
        scene.physics.add.existing(this); //add existing game objects to the physics world
        this.play("asteroid");
        this.ggScoreEvent = "ASTEROID_DESTROYED";
        Align.scaleToGameW(this, Phaser.Math.FloatBetween(0.025, 0.045)); //create a random scale for each object created
        this.setDepth(Phaser.Math.RND.integerInRange(-1, 1)); //create a random depth for each object created
        this.setVelocity(Phaser.Math.RND.integerInRange(250, -250), Phaser.Math.RND.integerInRange(250, -250)); //create random velocity
        this.setAngle(0); //set angle to 0
        this.body.angularVelocity = 150; //set rotation speed to 150
    }
}

class Comet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "comet");
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.ggVariant = Phaser.Math.RND.integerInRange(0, 3);
        this.setFrame(this.ggVariant);
        this.ggScoreEvent = "COMET_DESTROYED";
        Align.scaleToGameW(this, 0.062);
        this.body.setSize(this.displayWidth * 0.55, this.displayHeight * 0.55, true);
        this.setVelocity(Phaser.Math.RND.integerInRange(180, -180), Phaser.Math.RND.integerInRange(180, -180));
        ggOrientCometToVelocity(this);
    }
}

class ShieldTile extends Entity { //Inherit ShieldTile class to Entity
    constructor(scene, x, y) { // constructor function to instantiate a shieldtile object
        super(scene, x, y, "sprShieldTile"); // call super class constructor
        this.setOrigin(0); //set origin of sheildTile to center
        Align.scaleToGameW(this, 0.008); //set scale of the shield tile
        this.setDepth(-4); //set the depth of the image allowing the explosion to affect finer pixelling fo sheildTiles
    }
}
