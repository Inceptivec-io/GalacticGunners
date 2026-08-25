# DOCKER FOUNDER PREVIEW GATE

APP1 is not complete merely because the audio tests pass.

Rebuild the Docker runtime after final APP1 commit.

Required sequence:

```powershell
cd C:\Users\Michael\dev\GalacticGunners
docker compose down
docker compose up --build -d
```

Verify:

```text
http://localhost:8027/
```

returns the final exact APP1 HEAD runtime.

Required:
- container healthy/running;
- root HTTP 200;
- all new audio HTTP 200;
- all visual assets still HTTP 200;
- no console exceptions;
- no relevant network failures;
- no audio decode errors.

The Docker instance must be left ready for Founder preview unless there is a documented local-environment reason this cannot safely be done.

## Founder preview state

Development Handoff-Out must explicitly state:

```text
FOUNDER PREVIEW URL:
http://localhost:8027/

DOCKER BUILD HEAD:
<exact final pushed SHA>

FOUNDER VISUAL ACCEPTANCE:
PENDING

FOUNDER FUNCTIONAL ACCEPTANCE:
PENDING

FOUNDER AUDIO-IN-CONTEXT ACCEPTANCE:
PENDING
```

Development must not claim final product acceptance.
