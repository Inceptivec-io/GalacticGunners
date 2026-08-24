# DOCKER FOUNDER PREVIEW REFRESH

At final exact pushed APP2 HEAD:

```powershell
cd C:\Users\Michael\dev\GalacticGunners
docker compose down
docker compose up --build -d
```

Founder URL:

```text
http://localhost:8027/
```

Required proof:
- Docker image rebuilt after final APP2 code;
- runtime represents exact final pushed HEAD;
- root HTTP 200;
- assets HTTP 200;
- no relevant console/network errors.

Capture screenshots:

```text
01_title.png
02_level1.png
03_level1_explosion.png
04_comet_variant_a.png
05_comet_variant_b.png
06_player_animation_state.png
07_game_over.png
08_victory.png
```

Where animation cannot be demonstrated by one frame, additionally record:
- frame sequence/config;
- video/GIF only if existing tooling supports it without adding unnecessary binary evidence.

Docker should be left running and ready for Founder review.

Founder acceptance remains:

```text
VISUAL = PENDING
FUNCTIONAL = PENDING
AUDIO-IN-CONTEXT = PENDING
```
