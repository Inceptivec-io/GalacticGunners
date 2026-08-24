# RESULT SCENE EVENT MODEL

Game Over and Victory must be actual runtime states.

Static result artwork is a visual shell.

Dynamic data remains runtime-driven.

Required live state includes:
- score;
- level/result status;
- button interactions;
- selection state;
- replay/restart state;
- audio cue.

Do not bake changing state into the image.

Do not render unrelated extra buttons outside the designed panel.

Do not allow result-state HUD/gameplay to continue updating behind the overlay unless explicitly intended.

On result entry:
- freeze/finalise the authoritative score;
- stop further gameplay score mutation;
- stop irrelevant enemy/projectile processing;
- render the result state deterministically.
