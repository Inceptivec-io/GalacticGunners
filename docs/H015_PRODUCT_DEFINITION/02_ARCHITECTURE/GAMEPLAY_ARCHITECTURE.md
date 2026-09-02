# Gameplay Architecture

The Shooter is the primary game loop. It owns player movement, combat, hazards,
resources, shields, enemy formations, results and campaign progression.
Boarding is not a separate run: it is entered from a preserved Shooter session
and resolves back into that session. The shared runtime is in `game/src/`.
