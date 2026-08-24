class Entity extends Phaser.GameObjects.Sprite { //Inherit Entity class to Phaser.GameObjects.Sprite
    constructor(scene, x, y, key) { // constructor function to instantiate an sprite object
        super(scene, x, y, key); // call super class constructor
        this.scene.add.existing(this); //add Entity to this scene
        if (this.scene.physics && this.scene.physics.world) this.scene.physics.world.enableBody(this, 0); //enableBody on this scene in physics world
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
        Align.scaleToGameW(this, GG_SCALES.PLAYER); //set scale
        ggSetBodyEnvelope(this, GG_BODY_CONTRACTS.PLAYER);
        this.setFrame("0");
    }
}

class PlayerLaser extends Phaser.Physics.Arcade.Sprite { //Inherit PlayerLaser class to Arcade Sprite
    constructor(scene, x, y) { // constructor function to instantiate a player laser object
        super(scene, x, y, "sprLaserPlayer"); // call super class constructor
        scene.add.existing(this); //add PlayerLaser to this scene
        scene.physics.add.existing(this); //add existing game objects to the physics world
        this.setOrigin(0.5);
        Align.scaleToGameW(this, GG_SCALES.PLAYER_LASER); //set scale
        this.setAngle(-90);
        this.ggProjectileSide = "player";
        this.ggProjectileType = "PLAYER_LASER";
        ggSetVerticalProjectileBody(this, GG_BODY_CONTRACTS.PLAYER_LASER.w, GG_BODY_CONTRACTS.PLAYER_LASER.h);
        this.ggPreviousX = x;
        this.ggPreviousY = y;
    }
}

class Nuke extends Phaser.Physics.Arcade.Sprite { //Inherit Nuke class to Phaser.Physics.Arcade.Sprite
    constructor(scene, x, y, key) { // constructor function to instantiate a nuke object
        super(scene, x, y, "nuke"); // call super class constructor
        scene.add.existing(this); //add Nuke to this scene 
        scene.physics.add.existing(this); //add existing game objects to the physics world
        this.play("nuke");
        this.ggProjectileSide = "player";
        this.ggProjectileType = "PLAYER_NUKE";
        Align.scaleToGameW(this, 0.052); //set scale
        this.setAngle(0); //set angle to 0
        ggSetBodyEnvelope(this, GG_BODY_CONTRACTS.NUKE);
        this.ggPreviousX = x;
        this.ggPreviousY = y;
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
        this.ggHitTimer = null;
    }

    showHitState() {
        if (!this.active) return;
        this.setTexture("motherShipHit", "0");
        this.ggHitTimer = this.scene.time.delayedCall(180, function() {
            if (this.active) this.setTexture("motherShip", "0");
        }, null, this);
    }
}

class AlienScout extends Entity { //Inherit alienscout class to Entity
    constructor(scene, x, y, key) { // constructor function to instantiate an alienscout object
        super(scene, x, y, "alienscout"); // call super class constructor
        this.setOrigin(0.5); //set origin of AlienScout to center
        Align.scaleToGameW(this, GG_SCALES.SCOUT); //set scale
        ggSetBodyEnvelope(this, GG_BODY_CONTRACTS.SCOUT);
        this.setAngle(180);
        this.ggScoreEvent = "SCOUT_DESTROYED";
    }
}

class Enemy extends Entity { //Inherit Enemy class to Entity
    constructor(scene, x, y, key) { // constructor function to instantiate an enemy object
        super(scene, x, y, key); // call super class constructor
        this.setOrigin(0.5); //set origin of enemy to center
        ggSetEnemyScale(this, GG_SCALES.ENEMY); //set scale of enemy
        this.setAngle(180);
        this.ggScoreEvent = "SHIP_DESTROYED";
    }
}

class EnemyCruiser extends Entity { //Inherit Enemy class to Entity
    constructor(scene, x, y, key) { // constructor function to instantiate an enemy object
        super(scene, x, y, key); // call super class constructor
        this.setOrigin(0.5); //set origin of enemy to center
        Align.scaleToGameW(this, GG_SCALES.CRUISER); //set scale
        ggSetBodyEnvelope(this, GG_BODY_CONTRACTS.CRUISER);
        this.setAngle(180);
        this.ggScoreEvent = "SHIP_DESTROYED";
    }
}

class EnemyLaser extends Phaser.Physics.Arcade.Sprite { //Inherit EnemyLaser class to Arcade Sprite
    constructor(scene, x, y, key) { // constructor function to instantiate a enemy laser object
        super(scene, x, y, "sprLaserEnemy"); // call super class constructor
        scene.add.existing(this); //add EnemyLaser to this scene
        scene.physics.add.existing(this); //add existing game objects to the physics world
        this.setOrigin(0.5);
        Align.scaleToGameW(this, GG_SCALES.ENEMY_LASER); //set scale of enemy laser
        this.setAngle(90);
        this.ggProjectileSide = "enemy";
        this.ggProjectileType = "ENEMY_LASER";
        ggSetVerticalProjectileBody(this, GG_BODY_CONTRACTS.ENEMY_LASER.w, GG_BODY_CONTRACTS.ENEMY_LASER.h);
        this.ggPreviousX = x;
        this.ggPreviousY = y;
    }
}

class EnemyMotherShipLaser extends Phaser.Physics.Arcade.Sprite { //Inherit EnemyLaser class to Arcade Sprite
    constructor(scene, x, y, key) { // constructor function to instantiate a enemy laser object
        super(scene, x, y, "sprLaserEnemy"); // call super class constructor
        scene.add.existing(this); //add EnemyMotherShipLaser to this scene
        scene.physics.add.existing(this); //add existing game objects to the physics world
        this.setOrigin(0.5);
        Align.scaleToGameW(this, GG_SCALES.MOTHERSHIP_LASER); //set scale
        this.setAngle(90);
        this.ggProjectileSide = "enemy";
        this.ggProjectileType = "MOTHERSHIP_LASER";
        ggSetVerticalProjectileBody(this, GG_BODY_CONTRACTS.ENEMY_LASER.w, GG_BODY_CONTRACTS.ENEMY_LASER.h);
        this.ggPreviousX = x;
        this.ggPreviousY = y;
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
        this.ggVariant = Phaser.Math.RND.integerInRange(0, 5);
        this.setFrame(this.ggVariant);
        this.ggScoreEvent = "COMET_DESTROYED";
        Align.scaleToGameW(this, 0.062);
        ggSetBodyEnvelope(this, GG_BODY_CONTRACTS.COMET);
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
