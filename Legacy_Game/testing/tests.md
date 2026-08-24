# TESTING #

## Scope ##

Testing was performed using Manual Testing of all functionality and some basic Jasmine Tests were performed on some non-Phaser API reliant Functions which were
adapted to remove setText functions inorder to prove they worked.
Tests were performedboth using the keyboard whilst touch not selected and with the mouse/touchscreen while touch was enabled.

## Jasmine Testing ##

Jasmine Tests were performed in order to ascertain that the config was working correctly and that global variables and some basic functions were operating, in order to carry this out, due tot he API that I used, some functions had to have function within them commented out and a return statement included.
These were then put back to original state in order to deploy the game in a fully operational state.
Example of function alteration:  
  
  From:  
```
//create addScore function
  addScore(amount) { //addScore method passed with parameter amount
     score += amount; //raise score by amount                     
     textScore.setText('Score: ' + score); //sets score 
  }
//END addScore function

//create loseLives function
  loseLives(amount) { //loseLives method passed with parameter amount
     currentLives -= amount; // currentLives drop by amount
     textLives.setText('Lives: ' + currentLives); //sets lives remaining
  }
//END loseLives function
``` 
  To:  
```   
//create addScore function
  addScore(amount) { //addScore method passed with parameter amount
   return score += amount; //raise score by amount                     
    // textScore.setText('Score: ' + score); //sets score 
  }
//END addScore function

//create loseLives function
  loseLives(amount) { //loseLives method passed with parameter amount
    return currentLives -= amount; // currentLives drop by amount
    // textLives.setText('Lives: ' + currentLives); //sets lives remaining
  }
//END loseLives function
```
This enabled the testing to be performed without errors due to the nature of Phaser and the internal functions within the API.
Below is a screenshot of the Jasmine Testing screen that passes all the variables and functions I included in the test.

### Jasmine Test ScreenShot ###

![Jasmine Test Screen Shot](../assets/images/screenShots/JasmineTestImage.png)


### User Tests ###

Users were invited to play the game and give feedback on the game and carry out some testing so that game functionality and user experience was thought about.
The feedback given can be seen [here](testingfeedback/usertestfeedback.md).  

### Manual Testing ###

*	Individually test pages by setting startscene to scene name on main menu.
*	Test game entirely through on both touch and non touch settings to ensure operation.
*	Carry out staggered tests for shooting and ensuring all opbjects are destroyed and scores added if relevant.
*	Crash into all objects as player, Asteroids, Lasers, Enemy Ships on all levels.
*	Allow enemy to run to bottom to check they destroy shields and kill player.
*	Shoot at everything.
*	Check scores go up as they should. 10 points per enemy ship hit by laser, 20 points per mothership hit by laser and 100 points for nuke hit on object plus the value of the enemyHitValue/mothershipHitValue.
*	Check the lives lost are as should be, lose 1 life per death.
*	Check restartlevel is as should be, reset lives to 1.
*	Check nukes fired is correct and updated.
*	Check rearm text is updated and works correctly on non touch game.
*	Watch enemy movement so as to configure proper distances from game edge.
*	Press buttons P for pause, R for restart Q for mute/unmute and Enter for continue.
*	Ensure all touch controls work as they hsould for movement and continuation of game.
*	Go through each page and check functioning as should be for all objects.
*	Carryout console.logs for checking enemyships created, totalenemyships and enemydeaths.
*	Fire at mothership so as to check mothership lives lost on console, 1 for laser and 5 for nuke.
*	Test all buttons.
*	Check game on Chrome/Microsoft Edge/Firefox.
*	User-Agent Switcher addon for chrome to test with other browsers ie Safari.
*	Use remote debugging for android on chrome.
*	Request third party individuals play and provide feedback.

Back to [README](../README.md)