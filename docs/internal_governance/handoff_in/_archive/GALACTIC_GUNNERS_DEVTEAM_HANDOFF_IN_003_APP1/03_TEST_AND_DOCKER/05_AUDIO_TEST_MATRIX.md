# AUDIO TEST MATRIX

Development must test in actual runtime, not only file existence.

## File / load

For all 16 WAV files:
- HTTP 200;
- decode/load success;
- no console error;
- correct key;
- correct event.

## Event tests

- UI selector → correct select sound;
- confirm/start → correct confirm;
- back → correct back;
- player fire → one player laser event;
- enemy fire → correct enemy laser;
- enemy shield hit → shield impact;
- small explosion → small explosion;
- heavy/large explosion → large explosion where applicable;
- nuke launch → nuke fire;
- nuke detonation → nuke burst;
- comet destruction → comet destruction;
- player damage → player-hit audio only, gameplay logic unchanged;
- mothership hit → boss-hit sound;
- mothership destroyed → catastrophic destruction sound;
- Victory entry → stinger once;
- Game Over entry → stinger once.

## Negative tests

Prove:
- player fire does not play enemy laser;
- mothership hit does not trigger mothership destruction sound;
- player damage does not mutate score;
- comet sound does not duplicate score/nuke reward;
- result stingers do not retrigger continuously in update loop;
- mute/sound-off suppresses all new audio;
- no runaway overlap creates clipping.

## Regression

Rerun relevant DEVTEAM-003 tests:
- title;
- info;
- Level1;
- Level2;
- boss;
- pause/resume;
- Game Over;
- Victory;
- sprite animations;
- HUD;
- shield;
- scoring;
- controller/touch paths as applicable.

APP1 must not regress the accepted technical state returned by DEVTEAM-003.
