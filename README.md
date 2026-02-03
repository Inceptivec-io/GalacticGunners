![Galactic Gunners](assets/images/ReadMeImages/headerTitle.png)

###### Second Milestone Project - Interactive Frontend Development ######

This is my Space Invaders Style Game that I created for all ages. The game consists of a Main Menu with Info Page, 3 Levels, Pause Screen and Victory and Titles Page.
The game is responsive and incorporates a selector for those that are playing on touch screen devices, although the game is primarily to be played for best results on the Desktop or Laptop, which is mentioned on the Main Menu Screen.


## Demo ##

A deployed version of the game can be played [here](https://michael-leese.github.io/GallacticGunners/).

![Gallactic Gunners Main Menu](assets/images/screenShots/galacticgunnersmenu.png)

![Boss Level on Level 3](assets/images/screenShots/bosslevel.png)

## UX ##

My objective for this game was to create a fun and challenging game, based in part on the original Space Invaders.  
My goal for the design was to modernise the original, adding better graphics and more interactivity between the player and their surroundings, with added features not included on the original game.  
The design utilises a star background for the feeling of being in space and green colours highlighting the alien theme.  

For Players I wanted a game that started off easy and progressed getting harder through the levels, with the ability of pausing should they need a break.

The Players should be able to intuitively navigate through the game, with clear instructions and easy to use controls, along with a background story that helps to set the scene of the game.

The game should be responsive, although for best user experience Desktop/Laptop is advised and should be clearly identified at the main menu.

Using Balsamiq I created wireframes in order to layout how i expected each level to look upon completion, which on the whole has been carried out as I expected.

You can view all my wireframes by clicking [here](/assets/images/wireframes) to take you to the folder with them all in.

## Technologies ##

Used | <span style="color:white">Leave Blank</span>       
---------- | ----------
HTML5 | CSS3
Javascript ES6 | MarkDown
Bash | Ubuntu
GIT | GitHub
Cloud9 | VS Code
GIMP 2.10.10 | Balsamiq
[Phaser3](https://phaser.io) API | [phasergames.com](https://phasergames.com) (Utils API)
Chrome | web-server-for-chrome
FireFox | Microsoft Edge
Safari | Android Device
IoS Device | Windows LapTop
Chrome devTools inc Remote Device Debug | mybrowseraddon.com useragent-switcher
https://compresspng.com | https://tinypng.com
Balsamiq | <span style="color:white">Leave Blank</span> 

I have used the technologies above to build the game, create animations, view/play the game and test the game and code, as well as commit it to GitHub for deployment.

## Features ##

The site has a loose basis to the game [Saucer Invaders](/assets/images/ReadMeImages/Build-Arcade-Games-with-Phaser-3_-Saucer-Invaders-1.pdf) which was created by Jared York, however it has been entirely worked through, 
extended, scaled and re-positioned, with the addition of a lot of extra variables and functions in order to make the game logic my own and work for the result I have finished with.

The site is written in Javscript ES6 and is playable on all devices sizes, although, as mentioned on the Main Menu Screen it is best played on the Laptop or Desktop. The game is fully responsive to the viewport. 

The game has provision for turning on or off the touch control ability, this in turn changes the Game Controls Text automatically and disables the cursor keys from use.

#### Features for future Implementation ####

In the future, I would like to add the ability of storing and displaying the highscore, no matter who plays it and from any device.

## Testing ##

A thorough testing process was undertaken manually, however some testing was undertaken using Jasmine to ascertain variables, conifg and some basic functions were working correctly, although due to the nature of this API there it was not possible at this stage to undertake full testing with Jasmine.
See the [Testing Documentation](testing/tests.md) for further information.

## Deployment ##

I have hosted the game on GitHub pages which has been deployed directly from the Master Branch, using the index.html as the first page, all access to game functionality is accessed through this file using link and script tags.
If the game is to be updated or added to then further commits will automatically add to this branch and update any file changed/moved/deleted.

## Credits ##

The Game was based upon code from [Saucer Invaders](https://yorkcs.com/product/build-arcade-games-with-phaser-3-saucer-invaders/) which was 
manipulated, added to and extended and entirely rewritten in places. The code was entirely uncommented and all comments have been added in by myself.

The API is from www.phaser.io and has an additional API from https://phasergames.com/ for rendering and responsivity.

*	Courses undertaken in order to assist with project
       *	https://academy.zenva.com/product/html5-game-phaser-mini-degree/
       *	Phaser.io tutorials, for learning the Script/API/Logic
       *    https://phaser.io/learn
       *	https://rexrainbow.github.io/phaser3-rex-notes/docs/site/
       *	https://labs.phaser.io/index.html?dir=&q=
       *	https://photonstorm.github.io/phaser3-docs/index.html 

*	Phaser 3 code examples
       *	https://github.com/jaredyork/CourseSaucerInvaders used as a basis for my game
       *	https://yorkcs.com/product/build-arcade-games-with-phaser-3-saucer-invaders/ 
       *	[Saucer Invaders Documentation](/assets/images/ReadMeImages/Build-Arcade-Games-with-Phaser-3_-Saucer-Invaders-1.pdf)
       *	https://github.com/yandeu/phaser-project-template-es6/blob/master/src/scripts/objects/phaserLogo.js
       *	http://labs.phaser.io/edit.html?src=src\physics\arcade\sprite%20overlap%20group.js 
       *	https://yorkcs.com/2019/02/06/build-a-space-shooter-with-phaser-3/
       *	https://phaser.discourse.group/c/phaser3 
       *	http://www.html5gamedevs.com/topic/1380-how-to-scale-entire-game-up/
       *	https://www.youtube.com/watch?v=ZWIZeGAXuSA
       *	http://labs.phaser.io/edit.html?src=src\input\mouse\circle%20hit%20area.js
       *	https://rexrainbow.github.io/phaser3-rex-notes/docs/site/touchevents/#pointer
       *	https://phasergames.com/
       *	https://phaser.io/tutorials/getting-started-facebook-instant-games/part4
       *	https://stackoverflow.com/

#### Media ####

All media that has been used is free to use and has no licensing restrictions upon them, searched using the google images advanced search method with usage rights filter.
Some images and sounds were taken from the supplied assets folder from the saucer invaders game, which in turn have been taken from the open source [Phaser Examples](https://examples.phaser.io/assets/), 
however to make the game more Graphically appealing, further images were sort and I used [GIMP](https://www.gimp.org/) Image Manipulation Program to create my own sprite objects that could be animated.
Further images were incorporated to create part of the story that was created by myself and add to the general nature of it being a living story.

*	Images
       *	https://yorkcs.com/product/build-arcade-games-with-phaser-3-saucer-invaders/
       *	http://www.pngall.com/ 
       *	https://pixabay.com 
       *	https://www.publicdomainpictures.net 
       *	https://opengameart.org/content/space-ship-construction-kit
       *	https://all-free-download.com/font/ 
       *	http://www.pngall.com/evil-png/download/11139  
       *	https://www.deviantart.com

Sound were primarily taken from the supplied assets folder, however I added a sound of fireball to the nuke object when fired.

*	Sounds
       *	https://yorkcs.com/product/build-arcade-games-with-phaser-3-saucer-invaders/ stock sounds
       *	https://www.freesoundeffects.com/free-sounds/fireball-10079/


#### Acknowledgements ####


I would like to thank [Jared York](https://yorkcs.com/) for the inspiration behind my game and some of the logic within my game, 
however a bigger thank you to Phaser and Phaser Games for the API's that I have used.

The Phaser community for the documentation and assistance through threads found on StackOverflow and the Phaser forum.


###### This project has been created for educational use ######



