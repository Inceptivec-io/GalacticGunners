class Titles extends Phaser.Scene { //creates a scene in the Phaser Object called Title, to be referenced in game.js
  constructor() { //call constructor method on the game object to create an instance of scene 
    super({ key: "Titles" }); //on the game object create a property of scene and set key to Title, used in config parameters for game
  }

  //preload function to load all assets
  preload() {
    this.load.image("backgroundstars", "assets/images/owned/backgrounds/gg_starfield_16x9_v001.png") //preload background stars image
    this.load.image('hero', "assets/images/owned/branding/gg_symbol_v001.png"); //preload heroin image
    this.load.image('fireworks', "assets/images/owned/branding/gg_victory_v001.png"); //preload fireworks image
  }
  //end preload function

  //Create function
  create() {
    //add background
    this.background = new Background(this, this.game.config.width * 0.5, this.game.config.height * 0.5, "backgroundstars"); // add background image first
    //END background image

    //Create Grid
    this.aGrid = new AlignGrid({ scene: this, rows: 11, cols: 11 }); //create grid for positioning
    //END GRID

    this.titlesFunction(); //create titles function
  }
  //END Create function

  //titles function
  titlesFunction() {
    this.fireworksVictory1 = this.add.image(0, 0, 'fireworks'); //add fireworks image
    this.aGrid.placeAtIndex(34, this.fireworksVictory1); //set position on the grid
    Align.scaleToGameW(this.fireworksVictory1, 0.3); //scale image
    this.fireworksVictory2 = this.add.image(0, 0, 'fireworks'); //add fireworks image
    this.aGrid.placeAtIndex(42, this.fireworksVictory2); //set position on the grid
    Align.scaleToGameW(this.fireworksVictory2, 0.3); //scale image
    this.textTitleHead = this.add.text( //create Titles Header text
      0, //set x axis position
      0, //set y axis position
      "TITLES", //set text
      {
        fontFamily: "Arial, Helvetica, sans-serif", //set font type
        fontSize: 120, //set font size
        align: "center" //set text alignment
      }
    );
    this.textTitleHead.setOrigin(0.5); //set origin of text to center of itself
    this.textTitleHead.setTint(0x00ff00); //set colour of text to green
    this.aGrid.placeAtIndex(27, this.textTitleHead); //set position on the grid
    Align.scaleToGameW(this.textTitleHead, 0.3); //scale image

    this.textTitles = this.add.text( //create Titles text
      this.game.config.width * 0.5, //set x axis position
      this.game.config.height * 0.6, //set y axis position
      TitlesText, //set text
      {
        fontFamily: "Arial, Helvetica, sans-serif", //set font type
        fontSize: 55, //set font size
        align: "center" //set text alignment
      }
    );
    this.textTitles.setOrigin(0.5); //set origin of text to center of itself
    this.textTitles.setTint(0x00ff00); //set colour of text to green
    this.aGrid.placeAtIndex(71, this.textTitles); //set position on the grid
    Align.scaleToGameW(this.textTitles, 0.6); //scale image
    
    score = 0; //set score to zero

    this.time.addEvent({ //add timed event
      delay: 15000, //set delay to 15000
      callback: function() { //create callback function
        this.scene.start("MainMenu"); //set scene start for main game if lives is greater than 0
      },
      callbackScope: this, //set call back scope to this
      loop: false //set loop to false only play once
    });
  }
  //END titles function
}
//END scene
