HANDOFF / COMMISSION:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_003_APP1

PARENT:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_003

PURPOSE:
Integrate the Founder-accepted owned modern audio estate into the completed DEVTEAM-003 commercial reconstruction, verify no regression, and rebuild Docker ready for Founder audiovisual preview.

TARGET:
C:\Users\Michael\dev\GalacticGunners

REMOTE:
https://github.com/Inceptivec-io/GalacticGunners.git

BRANCH:
feature/GG-COM-001

EXPECTED ENTRY HEAD:
ccb80c298dd10e0c971c62f50a7c60d3b4cd614d

The returned DEVTEAM-003 commit has been externally confirmed to exist at that SHA.

DO NOT CREATE A NEW BRANCH.
DO NOT CREATE A NEW WORKTREE.
DO NOT MERGE.

FIRST:

- read root AGENTS.md;
- fetch origin;
- verify local HEAD == ccb80c298dd10e0c971c62f50a7c60d3b4cd614d;
- verify origin/feature/GG-COM-001 == same;
- verify worktree clean;
- record entry evidence.

If not exact:
STOP — ENTRY_STATE_MISMATCH.

INBOUND:

GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_003_APP1.zip

This single transport contains:
- the APP1 commission/specification;
- 16 Founder-accepted WAV files under PAYLOAD/audio;
- audio design/provenance documents.

There is NO nested audio ZIP.

LOCKED TRANSPORT PROCESS:

HASH
→ INVENTORY
→ UNPACK
→ CANONICAL PLACEMENT
→ RECORD PROVENANCE / DISPOSITION
→ VERIFY
→ REMOVE TRANSPORT ZIP

Do not preserve the APP1 ZIP in the repository.
Do not introduce Git LFS for it.

AUDIO AUTHORITY:

Use the included WAV files exactly by event meaning:

gg_ui_select_v001.wav
= UI selection movement

gg_ui_confirm_v001.wav
= confirm/start/action

gg_ui_back_v001.wav
= back/cancel

gg_player_laser_v001.wav
= player energy weapon fire

gg_enemy_laser_v001.wav
= hostile alien weapon fire

gg_shield_hit_v001.wav
= enemy/projectile impact against defensive shield tile

gg_explosion_small_v001.wav
= small/standard explosion

gg_explosion_large_v001.wav
= large/heavy explosion

gg_nuke_fire_v001.wav
= nuke launch

gg_nuke_burst_v001.wav
= nuke detonation

gg_comet_destroyed_v001.wav
= comet destruction/fracture

gg_player_hit_v001.wav
= player ship taking legitimate damage

gg_mothership_hit_v001.wav
= legitimate mothership hit

gg_mothership_destroyed_v001.wav
= final mothership destruction

gg_victory_stinger_v001.wav
= Victory entry cue

gg_game_over_stinger_v001.wav
= Game Over entry cue

DO NOT REINTERPRET EVENTS.

Integrate the files into the existing purposeful runtime audio location.

Inspect existing audio and classify every relevant predecessor:

REPLACED_BY_OWNED_AUDIO
LEGITIMATE_RETAINED_DEPENDENCY
STILL_REQUIRED_UNCHANGED
UNUSED_LEGACY
UNKNOWN

Remove dead/replaced runtime references.
Do not retain files without purpose.
Do not indiscriminately remove legitimate MIT material.
UNKNOWN blocks deletion.

Update the existing Asset/IP Provenance Register.
DO NOT CREATE A COMPETING REGISTER.

CRITICAL GAMEPLAY NON-MUTATION:

The player-hit sound is AUDIO FEEDBACK ONLY.

DO NOT CHANGE:
- player damage;
- player lives;
- player death flow;
- player scoring.

PLAYER DAMAGE SCORE PENALTY = NONE.

Shield scoring remains:
enemy/alien hit destroying one shield tile = -1.

Comet remains:
+500 score
+1 nuke.

Mothership remains:
+50 per legitimate hit
+1000 destruction bonus.

Audio hooks must not duplicate any scoring/reward callback.

AUDIO PLAYBACK:

- no uncontrolled clipping;
- no runaway overlapping laser instances;
- UI subordinate to gameplay;
- nuke/boss events retain greatest perceived weight;
- Victory/Game Over stingers play once on scene/result entry;
- sound-off/mute must control all new audio.

REGRESSION:

Re-test DEVTEAM-003 visual/runtime state.

APP1 must not regress:
- v002 graphics;
- sprite animation;
- title events;
- Game Over events;
- Victory events;
- HUD;
- shield;
- scoring;
- controls.

DOCKER:

At final exact pushed HEAD run:

cd C:\Users\Michael\dev\GalacticGunners
docker compose down
docker compose up --build -d

Verify:
http://localhost:8027/

The Docker runtime MUST be rebuilt from the final APP1 HEAD and left ready for Founder preview.

Return exact proof:

DOCKER BUILD HEAD = FINAL PUSHED HEAD

Verify:
- root HTTP 200;
- all 16 new audio files load successfully;
- visual assets remain available;
- no audio decode failures;
- no new browser console exceptions;
- no relevant network failures.

RETURN:

GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_003_APP1

Required closure:

OWNED_AUDIO_FILES_INTEGRATED = 16/16
AUDIO_EVENT_MAPPING = PASS
UNKNOWN_AUDIO_PROVENANCE = 0
DEAD_AUDIO_REFERENCES = 0
MUTE/SOUND_TOGGLE = PASS
AUDIO_DECODE_ERRORS = 0
PLAYER_DAMAGE_LOGIC_CHANGED = NO
PLAYER_DAMAGE_SCORE_MUTATION = 0
COMET_REWARD_DUPLICATION = 0
DEVTEAM_003_VISUAL_REGRESSION = PASS
SPRITE_ANIMATION_REGRESSION = 0
SCORING_REGRESSION = 0

DOCKER_REBUILT = PASS
FOUNDER URL = http://localhost:8027/
DOCKER_HEAD = FINAL PUSHED HEAD

POST_BOX_PAYLOAD = 0
TRANSPORT_ZIP_PRESERVED_IN_REPO = NO
WORKTREE = CLEAN
ALL AUTHORISED WORK = COMMITTED + PUSHED
LOCAL HEAD = REMOTE feature/GG-COM-001 HEAD
ACTIVE FEATURE BRANCHES = 1

FOUNDER VISUAL ACCEPTANCE = PENDING
FOUNDER FUNCTIONAL ACCEPTANCE = PENDING
FOUNDER AUDIO-IN-CONTEXT ACCEPTANCE = PENDING

Do not merge.

Founder Michael retains acceptance, PR finalisation and merge authority.
