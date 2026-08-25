# APP2 TEST MATRIX

## Player
- correct frame slicing;
- no rotation artefact;
- correct intended flash/activity;
- collider stable;
- scale acceptable.

## Enemies
- no sheet bleed;
- animation intentional;
- scale readable.

## Comets
Spawn enough comets to prove:
- exactly one visual per spawn;
- multiple variants observed;
- one collider;
- +500;
- +1 nuke.

## Explosions
- small explosion non-square;
- large explosion non-square;
- alpha fade;
- no black frame;
- no sprite-boundary artefact.

## Playfield
- player readable;
- enemies readable;
- no huge dead middle;
- bunkers balanced;
- full viewport starfield;
- no black bars.

## Viewport
- no clipped HUD;
- no off-screen result buttons;
- no unintended page overflow.

## Game Over
- no duplicate Restart/Menu text buttons;
- Main Menu works;
- Replay direct gameplay;
- Try Again direct gameplay;
- no menu misroute;
- final score consistent.

## Victory
- preserve live/runtime values/actions;
- no duplicated controls;
- within safe area.

## Audio regression
- APP1 audio still loads;
- sound toggle still works;
- no mapping regression.

## Scoring regression
- all locked score events still pass;
- final score freezes on result transition.

## Browser/runtime
- no new console exceptions;
- no required asset 404;
- no texture/frame warnings;
- no new audio decode errors.
