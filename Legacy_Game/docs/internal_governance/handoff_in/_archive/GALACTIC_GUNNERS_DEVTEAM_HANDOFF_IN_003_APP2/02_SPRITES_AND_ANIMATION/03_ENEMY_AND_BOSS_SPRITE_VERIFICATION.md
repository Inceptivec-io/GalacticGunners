# ENEMY / BOSS SPRITE VERIFICATION

Verify all sprite-based enemy families:

- scout;
- cruiser;
- destroyer;
- mothership/boss;
- asteroid.

For each:

- correct frame slicing;
- correct origin;
- correct scale;
- no sheet bleed;
- no source strip visible;
- no abrupt frame bounding-box jump;
- no unintended full-sheet cycling.

Animation should provide life/activity, not simply prove that frames change.

Where enemies use repeated formation rows, animation may use phase offset so all sprites do not pulse in perfect unnatural lockstep, provided this does not materially alter gameplay.
