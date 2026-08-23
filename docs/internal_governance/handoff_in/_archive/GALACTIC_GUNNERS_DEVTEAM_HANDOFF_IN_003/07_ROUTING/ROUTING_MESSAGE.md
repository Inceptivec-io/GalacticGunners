HANDOFF / COMMISSION:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_003

PURPOSE:
Faithful visual reconstruction, supplied-font integration, restored animation, event-driven Title/Victory/Game Over reconstruction, shield-tile fidelity, locked core scoring implementation, and Roadmap/Playlist currentness reconciliation.

TARGET:
C:\Users\Michael\dev\GalacticGunners

REMOTE:
https://github.com/Inceptivec-io/GalacticGunners.git

AUTHORISED BRANCH:
feature/GG-COM-001

DO NOT CREATE ANOTHER BRANCH OR WORKTREE.

ACTIVE FEATURE BRANCHES MUST REMAIN:
1

CURRENT POST_BOX PAYLOAD:

_WORK_00000001_POST_BOX/
├── BOUNDARY.md
├── GALACTIC_GUNNERS_ASSET_ALIGNMENT_AND_IMPLEMENTATION_PACK_v1.0.zip
├── GALACTIC_GUNNERS_MASTER_ROADMAP_AND_PLAYLIST_v1.0.zip
├── GalacticGunners_ASSETS.zip
└── README.md

These three ZIPs are the complete Founder-supplied inbound authority set for this movement.

PRECEDENCE:

1. Direct Founder instruction + DEVTEAM_HANDOFF_IN_003
2. root AGENTS.md
3. current Galactic Gunners internal governance/standards
4. GALACTIC_GUNNERS_MASTER_ROADMAP_AND_PLAYLIST_v1.0.zip
5. GALACTIC_GUNNERS_ASSET_ALIGNMENT_AND_IMPLEMENTATION_PACK_v1.0.zip
6. GalacticGunners_ASSETS.zip
7. historical repo for behaviour/visual-grammar reference only

DO NOT DERIVE ALTERNATIVE VISUAL DIRECTION OR GOVERNANCE.

FIRST:

- verify branch;
- fetch origin;
- prove local HEAD == remote feature HEAD;
- prove worktree clean;
- record ENTRY_HEAD;
- hash and inventory all 3 ZIPs;
- preserve all 3 unchanged under:
  docs/internal_governance/handoff_in/_archive/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_003/
- register receipt/evidence;
- unpack authorised working copies outside POST_BOX.

ROADMAP / PLAYLIST CURRENTNESS:

The Founder-supplied Roadmap/Playlist v1.0 is the current programme baseline.

Admit exactly:

docs/internal_governance/planning/GALACTIC_GUNNERS_MASTER_ROADMAP_v1.0.md
docs/internal_governance/planning/GALACTIC_GUNNERS_MASTER_PLAYLIST_v1.0.md

Any predecessor/superseded Roadmap or Playlist currently in the living planning root must be:

- inventoried;
- preserved unchanged;
- moved to:
  docs/internal_governance/planning/_archive/
- marked SUPERSEDED / PRESERVED;
- removed from the living current root.

DO NOT DELETE PREDECESSOR PLANNING.

Required result:

CURRENT ROADMAP = 1
CURRENT PLAYLIST = 1
SUPERSEDED ROADMAPS/PLAYLISTS = planning/_archive
CURRENTNESS AMBIGUITY = 0

Then clear all consumed ZIPs from POST_BOX.

POST_BOX MUST CLOSE WITH ONLY:

MAIN POST_BOX:
- BOUNDARY.md
- README.md

WORK POST_BOX:
- BOUNDARY.md
- README.md

NO archive/handoff/evidence/register/ZIP/working folders in POST_BOX.

IMPLEMENTATION:

Use GalacticGunners_ASSETS.zip as the current visual/font authority.

Use the alignment pack for exact integration expectations.

Use the Roadmap/Playlist for locked programme rules and gates.

Integrate the supplied:
- player;
- scout;
- cruiser;
- destroyer;
- mothership;
- asteroid;
- comet;
- lasers;
- explosions;
- nuke projectile/burst;
- backgrounds;
- logos;
- HUD icons;
- UI icons;
- shield tile;
- Game Over style panel;
- Victory style panel;
- font packages.

SPRITE SHEETS MUST BE ANIMATED.
DO NOT USE THE NEW SHIPS AS STATIC IMAGES.

Preserve the historical game's activity/animation character.

SHIELD:

gg_shield_tile_v002.png is ONE modular shield segment.

Keep the existing code-generated shield matrix and per-tile destruction.

DO NOT create one bunker image.

TITLE / GAME OVER / VICTORY:

These are event-driven runtime scenes.

Static art is a decorative/style layer only.

Buttons, scores, counters, selector state, sound state and changing values MUST be live runtime elements.

Do not bake variable values into one flat screen.

Use supplied fonts rather than generic Arial/Helvetica presentation.

GAME OVER:
- live final score;
- live Restart/Menu actions;
- no nested mini Game Over panel;
- no duplicate title;
- no clipped HUD.

VICTORY:
- live score/result/bonus values;
- live Next/Replay/Menu actions as applicable;
- panel art may frame the UI but may not replace runtime events.

TITLE:
- one coherent logo hierarchy;
- live Start/Info/Sound actions;
- visible keyboard/touch/controller selection;
- no duplicate competing title treatment.

LOCKED CORE SCORING:

Laser target: +5
Asteroid: +10
Scout: +25
Ship: +50
Mothership hit: +50
Mothership destroyed: +1000
Comet: +500
Comet: +1 nuke
Alien/enemy hit destroying one shield tile: -1

DO NOT CHANGE PLAYER SHIP HIT/DAMAGE/LIFE GAMEPLAY.

PLAYER DAMAGE HAS NO NEW SCORE PENALTY.

Player fire hitting a shield tile has NO authorised score penalty.

Implement deterministic score events and test every case.

BOARDING MODE:
NOT AUTHORISED IN THIS HANDOFF.
It remains Roadmap/Playlist future work only.

TEST:

Run full menu/info/Level1/Level2/boss/pause/game-over/victory regression.

Test every animation family.

Test every scoring event.

Test event-driven UI with keyboard, touch and controller paths where available.

Rebuild/update Docker runtime as required.

Return Founder-operable localhost runtime and screenshots.

At completion return:

GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_003

Required final state:

CURRENT ROADMAP = 1
CURRENT PLAYLIST = 1
SUPERSEDED PLANNING = PRESERVED IN planning/_archive
CURRENTNESS AMBIGUITY = 0

FOUNDER_ASSET_SET_INTEGRATED = PASS
SUPPLIED_FONTS_INTEGRATED = PASS
CORE SHIP ANIMATION = PASS
TITLE_EVENT_DRIVEN = PASS
GAME_OVER_EVENT_DRIVEN = PASS
VICTORY_EVENT_DRIVEN = PASS
HUD_OVERLAP = 0
SHIELD_MATRIX_PRESERVED = PASS
LOCKED_SCORE_MODEL = PASS
PLAYER_DAMAGE_SCORE_MUTATION = 0
RUNTIME_REGRESSION = PASS
POST_BOX_PAYLOAD = 0
INTERNAL_GOVERNANCE = CURRENT
WORKTREE = CLEAN
ALL AUTHORISED WORK = COMMITTED + PUSHED
LOCAL HEAD = REMOTE feature/GG-COM-001 HEAD
ACTIVE_FEATURE_BRANCHES = 1
UNTRACKED_OPERATIONAL_MATERIAL = 0

FOUNDER VISUAL/GAMEPLAY ACCEPTANCE REMAINS PENDING.

Do not merge.

Founder Michael retains acceptance, PR finalisation and merge authority.
