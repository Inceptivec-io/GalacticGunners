class Info extends Phaser.Scene { //creates a scene in the Phaser Object called Info, to be referenced in game.js
  constructor() { //call constructor method on the game object to create an instance of scene 
    super({ key: "Info" }); //on the game object create a property of scene and set key to Info, used in config parameters for game
  }

  //preload function
  preload() {
    this.load.image("backgroundstars", "assets/images/owned/backgrounds/gg_bg_starfield_v002.png") //preload background stars image
    this.load.image("hero", "assets/images/owned/branding/gg_logo_compact_v002.png"); //preload the hero image
    this.load.image("BtnBack", "assets/images/owned/ui/gg_ui_back_v002.png"); //preload the Info Button image
  }
  //END preload function

  //create function
  create() {
    //add background
    this.background = new Background(this, this.game.config.width * 0.5, this.game.config.height * 0.5, "backgroundstars"); // add background image first
    //END background image

    //Create Grid
    this.aGrid = new AlignGrid({ scene: this, rows: 11, cols: 11 }); //create grid for positioning
    //END GRID

    this.sfx = ggCreateUiSfx(this);
    //END create function

    //Title, story and controls text
    //Game Title text
    this.textTitle = this.add.text( //Add Title Text
      0, //set x axis position
      0, //set y axis position
      "GALACTIC GUNNERS", //set text
      {
        fontFamily: GG_FONT_DISPLAY, //set font style
        fontSize: 120, //set font size
        align: "center" //set alignment
      }
    );
    this.textTitle.setTint(0x00ff00); //set color of story text to green
    this.textTitle.setOrigin(0.5, 0.3); //set text box origin to center of itself
    this.aGrid.placeAtIndex(5, this.textTitle); //set position on th grid
    Align.scaleToGameW(this.textTitle, 0.6); //set scale
    //END Game Title text

    //Info Title text
    this.textInfo = this.add.text( //Add Question text
      0, //set x axis position
      0, //set y axis position
      "USER INFO", //set text
      {
        fontFamily: GG_FONT_DISPLAY, //set font style
        fontSize: 85, //set font size
        align: "center" //set alignment
      }
    );
    this.textInfo.setTint(0x009000); //set color of story text to green
    this.textInfo.setOrigin(0.5); //set text box origin to center of itself
    this.aGrid.placeAtIndex(16, this.textInfo); //set position on th grid
    Align.scaleToGameW(this.textInfo, 0.2); //set scale
    //END Info Title text

    //Story text
    this.textStory = this.add.text( //Add Question text
      0, //set x axis position
      0, //set y axis position
      StoryContent, //set the text to variable Story
      {
        fontFamily: GG_FONT_DISPLAY, //set font style
        fontSize: 44, //set font size
        align: "center" //set alignment
      }
    );
    this.textStory.setTint(0x00ff00); //set color of story text to green
    this.textStory.setOrigin(0.5); //set text box origin to center on x and top on y
    this.aGrid.placeAtIndex(60, this.textStory); //set position on th grid
    Align.scaleToGameW(this.textStory, 0.9); //set scale
    //END story text

    //controls text
    if (!touch) { //if touch variable false
      this.textControls = this.add.text( //Add Question text
        0, //set x axis position
        0, //set y axis position
        Controls, //set the text to variable Controls
        {
          fontFamily: GG_FONT_DISPLAY, //set font style
          fontSize: 50, //set font size
          align: "center" //set alignment
        }
      );
      this.textControls.setTint(0x009500); //set color of controls text to green
      this.textControls.setOrigin(0.5, 0.8); //set text origin 
      this.aGrid.placeAtIndex(115, this.textControls); //set position on th grid
      Align.scaleToGameW(this.textControls, 0.7); //set scale
    }
    else {
      this.textTouchControls = this.add.text( //Add Question text
        0, //set x axis position
        0, //set y axis position
        TouchControls, //set the text to variable Controls
        {
          fontFamily: GG_FONT_DISPLAY, //set font style
          fontSize: 50, //set font size
          align: "center" //set alignment
        }
      );
      this.textTouchControls.setTint(0x009500); //set color of controls text to green
      this.textTouchControls.setOrigin(0.5, 0.8); //set origin
      this.aGrid.placeAtIndex(115, this.textTouchControls); //set position on th grid
      Align.scaleToGameW(this.textTouchControls, 0.7); //set scale
    }
    //ENDcontrols text
    //END title, story and controls text

    //ADD RETURN BUTTON AND INTERACTIVITY
    //return to main screen button
    this.textExit = this.add.text( //Add Exit text
      0, //set x axis position
      0, //set y axis position
      "EXIT", //set the text to variable Controls
      {
        fontFamily: GG_FONT_DISPLAY, //set font style
        fontSize: 50, //set font size
        align: "center" //set alignment
      }
    );
    this.textExit.setTint(0x00ff00); //set color of exit text to green
    this.textExit.setOrigin(0.5); //set text box origin to center of itself
    this.aGrid.placeAtIndex(120, this.textExit); //set position on the grid
    Align.scaleToGameW(this.textExit, 0.05); //set scale

    this.btnBack = this.add.image( //create btnBack and add it as image
      0, //set position on the x axis
      0, //set position on the y axis
      "BtnBack" //add image key
    );
    this.btnBack.setTint(0x00ff00); //set button colour to green
    this.aGrid.placeAtIndex(109, this.btnBack); //set position on the grid
    Align.scaleToGameW(this.btnBack, 0.05); //set scale of button
    this.btnBack.setInteractive(); //set button to be interactive

    this.btnBack.on("pointerover", function() { //this Back Button when on method, in hover
      this.sfx.select.play();
      this.btnBack.setTint(0xff0000) // set the play button to red on hover
    }, this); //this state only

    this.btnBack.on("pointerout", function() { //this Back Button when on method, in hover
      this.btnBack.setTint(0x00ff00); // set the Back button back to green when not hovering
    }, this); //this state only

    this.btnBack.on("pointerdown", function() { //this Back Button when on method, when mouse clicks
      this.backToMenu();
    }, this); //this state only
    //END return to main screen button

    this.time.addEvent({
      delay: 100,
      callback: function() {
        if (controllerActionPressed("start") || controllerActionPressed("info")) {
          this.backToMenu();
        }
      },
      callbackScope: this,
      loop: true
    });
  }
  //END create function

  backToMenu() {
    this.sfx.back.play(); // set the sound to play
    this.scene.start("MainMenu"); // back to Main Menu
  }
}
//END Scene
