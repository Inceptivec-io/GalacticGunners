class MainMenu extends Phaser.Scene { //creates a scene in the Phaser Object called SceneMainMenu, to be referenced in game.js
  constructor() { //call constructor method on the game object to create an instance of scene 
    super({ key: "MainMenu" }); //on the game object create a property of scene and set key to SceneMainMenu, used in config parameters for game
  }

  //preload function
  preload() {
    this.load.image("backgroundstars", "assets/images/owned/backgrounds/gg_bg_starfield_v002.png") //preload background stars image
    this.load.image("BtnPlay", "assets/images/owned/branding/gg_logo_compact_v002.png"); //preload the Play Button image
    this.load.image("BtnPlayHover", "assets/images/owned/branding/gg_logo_compact_v002.png"); //preload the Play Button Hover image
    this.load.image("logoPrimary", "assets/images/owned/branding/gg_logo_primary_v002.png");
    this.load.image("menuTitlecard", "assets/images/owned/branding/gg_logo_primary_words_v002.png");
    this.load.image("hero", "assets/images/owned/branding/gg_hero_image_player_fighting_v002_4k_uhd_master.png"); //preload the Founder REV5 4K landing hero
    this.load.image("BtnInfo", "assets/images/owned/ui/gg_ui_info_v002.png"); //preload the Info Button image
    this.load.spritesheet("BtnPoint", "assets/images/owned/ui/gg_ui_pointer_v002_sheet.png", { frameWidth: 724, frameHeight: 724 }); //preload the Pointer Button image
  }
  //END preload function

  //create function
  create() {
    this.heroBacking = this.add.image(this.game.config.width * 0.5, this.game.config.height * 0.5, "backgroundstars").setOrigin(0.5);
    this.heroBacking.setDepth(-11);
    this.background = this.add.image(this.game.config.width * 0.5, this.game.config.height * 0.5, "hero").setOrigin(0.5);
    this.background.setDepth(-10);

    //Create Grid
    this.aGrid = new AlignGrid({ scene: this, rows: 11, cols: 11 }); //create grid for positioning
    //END GRID

    //create sounds    
    this.sfx = ggCreateUiSfx(this);
    //END create sounds

    this.menuCard = this.add.image(0, 0, "menuTitlecard");
    this.menuCard.setAlpha(0.82);
    this.menuCard.setDepth(2);
    this.aGrid.placeAtIndex(60, this.menuCard);
    Align.scaleToGameW(this.menuCard, 1.0);

    this.logoPrimary = this.add.image(0, 0, "logoPrimary");
    this.logoPrimary.setOrigin(0.5);
    this.aGrid.placeAtIndex(5, this.logoPrimary);
    this.logoPrimary.y = this.game.config.height * 0.08;
    Align.scaleToGameW(this.logoPrimary, 0.58);

    //ADD MAIN MENU TEXT
    //Game Title Text
    this.textTitle = this.add.text( //Add Game Title Text
      0, //set x axis position
      0, //set y axis position
      "GALACTIC GUNNERS", //set text
      {
        fontFamily: GG_FONT_SILVER, //set font style
        fontSize: 120, //set font size
        align: "center" //set alignment
      }
    );
    this.textTitle.setTint(0xf6f7ff); //kept hidden; current hierarchy if shown
    this.textTitle.setOrigin(0.5, 0.3); //set position on grid
    this.aGrid.placeAtIndex(5, this.textTitle); //set position on grid
    Align.scaleToGameW(this.textTitle, 0.6); //set scale
    this.textTitle.setVisible(false);
    //END Game Title Text

    //Subheading text
    this.textTitle2 = this.add.text( //Add Question text
      0, //set x axis position
      0, //set y axis position
      "CAN YOU SAVE THE DAY?", //set text
      {
        fontFamily: GG_FONT_GOLD, //set font style
        fontSize: 80, //set font size
        align: "center" //set alignment
      }
    );
    this.textTitle2.setTint(0xffb43c); //set sub heading text to gold
    this.textTitle2.setOrigin(0.5); //set position on grid
    this.aGrid.placeAtIndex(16, this.textTitle2); //set position on grid
    Align.scaleToGameW(this.textTitle2, 0.4); //set scale
    //END Subheading text
    //Hero Image
    this.heroImage = this.add.image(0, 0, 'BtnPlay'); //use compact crest as the live play action
    this.heroImage.setOrigin(0.5, 0.45); //set origin point of image
    this.aGrid.placeAtIndex(71, this.heroImage); //set position on grid
    Align.scaleToGameW(this.heroImage, 0.2); //set scale
    this.heroImage.setInteractive(); //center crest is the primary play action
    this.heroImage.on("pointerover", function() {
      this.sfx.select.play();
      this.heroImage.setScale(this.heroImage.scaleX * 1.04, this.heroImage.scaleY * 1.04);
    }, this);
    this.heroImage.on("pointerout", function() {
      this.layoutMenu();
    }, this);
    this.heroImage.on("pointerdown", function() {
      this.startGame();
    }, this);
    //END Hero Image

    // BEST Played on text
    this.textBest = this.add.text( //create Best Played on text
      0, //set position on the x axis
      0, //set position on the y axis
      BestPlayedOn, //set text to variable
      {
        fontFamily: GG_FONT_SILVER, //set font style
        fontSize: 80, //set font size
        align: "center" //set alignment
      }
    );
    this.textBest.setTint(0xffb43c); // set current highlight colour
    this.textBest.setOrigin(0.5); //set the origin point of text
    this.aGrid.placeAtIndex(75, this.textBest); //set grid position of text
    Align.scaleToGameW(this.textBest, 0.12); //scale the text
    //END BEST Played on text

    //info button
    this.btnInfo = this.add.image( //create btnInfo and add it as image
      0, //set position on the x axis
      0, //set position on the y axis
      "BtnInfo" //add image key
    );
    this.btnInfo.clearTint(); // use supplied current art
    this.btnInfo.setInteractive(); //set button to be interactive
    this.aGrid.placeAtIndex(108, this.btnInfo); //set position on the grid
    Align.scaleToGameW(this.btnInfo, 0.08); //set scale


    this.btnInfo.on("pointerover", function() { //this Play Button when on method, in hover
      this.sfx.select.play();
      this.btnInfo.setAlpha(0.82); // hover feedback without recolouring art
    }, this); //this state only

    this.btnInfo.on("pointerout", function() { //this Play Button when on method, in hover
      this.btnInfo.setAlpha(1); // restore supplied art
    }, this); //this state only

    this.btnInfo.on("pointerdown", function() { //this Play Button when on method, when mouse clicks
      this.openInfo();
    }, this); //this state only
    //end info button     

    //pointer button
    this.textPoint = this.add.text( //create point select text
      0, //set position on the x axis
      0, //set position on the y axis
      TouchSelector, //set text to variable
      {
        fontFamily: GG_FONT_SILVER, //set font style
        fontSize: 80, //set font size
        align: "center" //set alignment
      }
    );
    this.textPoint.setTint(0x70fff2); // set current selector text colour
    this.textPoint.setOrigin(0.5); //set the origin point of text
    this.aGrid.placeAtIndex(67, this.textPoint); //set grid position of text
    Align.scaleToGameW(this.textPoint, 0.12); //scale the text

    this.btnPoint = this.add.sprite( //create animated pointer selector
      0, //set position on the x axis
      0, //set position on the y axis
      "BtnPoint" //add image key
    );
    this.btnPoint.clearTint(); // use supplied current pointer art
    this.btnPoint.setInteractive(); //set button to be interactive
    this.aGrid.placeAtIndex(68, this.btnPoint); //set grid position of button
    Align.scaleToGameW(this.btnPoint, 0.05); //scale the button
    this.btnPoint.play("BtnPoint"); //animate supplied pointer sheet

    this.btnPoint.on("pointerover", function() { //this Point Button when in hover
      if (!touch) {
        this.btnPoint.setAlpha(0.82); // hover feedback
      }
      else {
        this.btnPoint.setAlpha(1);
      }
    }, this); //this state only
    this.btnPoint.on("pointerout", function() { //this Point Button when off hover
      if (!touch) {
        this.btnPoint.setAlpha(1);
      }
      else {
        this.btnPoint.setAlpha(0.82);
      }
    }, this); //this state only

    this.btnPoint.on("pointerdown", function() { //this point Button when on selected
      this.sfx.select.play();
      if (!touch) {
        this.btnPoint.setAlpha(0.82); // selected feedback
        touch = true; //set touch variable
      }
      else {
        this.btnPoint.setAlpha(1); // deselected feedback
        touch = false; //set touch variable
      }
    }, this);
    //end point button  

    this.btnMute = ggAddMuteButton(this, 98);

    this.layoutMenu();
    this.scale.on("resize", this.layoutMenu, this);

    this.time.addEvent({
      delay: 100,
      callback: function() {
        if (controllerActionPressed("start")) {
          this.startGame();
        }
        if (controllerActionPressed("info")) {
          this.openInfo();
        }
      },
      callbackScope: this,
      loop: true
    });

  }
  //END Create Function

  layoutMenu() {
    var w = this.scale.width || this.game.config.width;
    var h = this.scale.height || this.game.config.height;
    var margin = Math.max(18, Math.min(w, h) * 0.025);
    var cyan = 0x70fff2;

    function fitImage(image, maxW, maxH) {
      var scale = Math.min(maxW / image.width, maxH / image.height);
      image.setScale(scale);
    }

    function fitText(text, maxW, maxH) {
      text.setScale(1);
      var scale = Math.min(1, maxW / text.width, maxH / text.height);
      text.setScale(scale);
    }

    if (this.background) {
      if (this.heroBacking) {
        this.heroBacking.setPosition(w * 0.5, h * 0.5);
        this.heroBacking.setScale(Math.max(w / this.heroBacking.width, h / this.heroBacking.height));
      }
      this.background.setPosition(w * 0.5, h * 0.5);
      var bgScale = Math.min(w / this.background.width, h / this.background.height);
      this.background.setScale(bgScale);
    }

    if (this.menuCard) {
      fitImage(this.menuCard, w * 0.40, h * 0.14);
      this.menuCard.setPosition(w * 0.5, margin + this.menuCard.displayHeight * 0.54);
      this.menuCard.setAlpha(0.82);
      this.menuCard.setDepth(2);
    }

    if (this.logoPrimary) {
      fitImage(this.logoPrimary, w * 0.50, h * 0.16);
      this.logoPrimary.setPosition(w * 0.5, margin + this.logoPrimary.displayHeight * 0.5);
      this.logoPrimary.clearTint();
      this.logoPrimary.setDepth(3);
    }

    if (this.textTitle2) {
      this.textTitle2.setTint(0xffb43c);
      this.textTitle2.setOrigin(0.5);
      fitText(this.textTitle2, w * 0.42, h * 0.064);
      var subtitleY = this.logoPrimary ? this.logoPrimary.y + this.logoPrimary.displayHeight * 0.5 + (margin * 0.55) + this.textTitle2.displayHeight * 0.5 : h * 0.28;
      this.textTitle2.setPosition(
        w * 0.5,
        Math.min(h * 0.315, subtitleY)
      );
    }

    if (this.heroImage) {
      fitImage(this.heroImage, w * 0.11, h * 0.16);
      this.heroImage.setPosition(w * 0.5, h * 0.78);
      this.heroImage.clearTint();
      this.heroImage.setDepth(4);
    }

    if (this.textPoint) {
      this.textPoint.setTint(0xffb43c);
      this.textPoint.setOrigin(0.5);
      fitText(this.textPoint, w * 0.17, h * 0.09);
      this.textPoint.setPosition(w * 0.12, h * 0.565);
    }

    if (this.btnPoint) {
      fitImage(this.btnPoint, w * 0.055, h * 0.09);
      this.btnPoint.setPosition(
        this.textPoint.x + this.textPoint.displayWidth * 0.5 + this.btnPoint.displayWidth * 0.62,
        this.textPoint.y
      );
      this.btnPoint.setAlpha(touch ? 0.82 : 1);
    }

    if (this.textBest) {
      this.textBest.setTint(0xffb43c);
      this.textBest.setOrigin(0.5);
      fitText(this.textBest, w * 0.20, h * 0.085);
      this.textBest.setPosition(w * 0.84, h * 0.565);
    }

    var iconSize = Math.min(w, h) * 0.078;
    if (this.btnInfo) {
      fitImage(this.btnInfo, iconSize, iconSize);
      this.btnInfo.setPosition(w - margin - iconSize * 0.5, h - margin - iconSize * 0.5);
      this.btnInfo.clearTint();
    }

    if (this.btnMute) {
      fitImage(this.btnMute, iconSize, iconSize);
      this.btnMute.setPosition(
        w - margin - iconSize * 1.8,
        h - margin - iconSize * 0.5
      );
      this.btnMute.setTint(isMuted ? 0xff4b5c : cyan);
    }
  }

  startGame() {
    this.sfx.confirm.play(); // set the sound to play
    this.scene.start("Level1"); // start level 1
  }

  openInfo() {
    this.sfx.confirm.play(); // set the sound to play
    this.scene.start("Info"); // open Info screen
  }
}
//END Scene
