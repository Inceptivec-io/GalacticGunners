# GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_003_APP3_REV1

## Classification

P1 acceptance-blocking production-surface correction  
Branch-constrained  
No merge  
No scope expansion outside stated boundary

---

## 1. Direction and purpose

This handoff reissues the current completion correction with the latest Founder-authoritative asset direction now added to the post box.

The purpose is to correct the active gameplay/runtime surface so that:

- the correct Founder-supplied sprite and FX assets are used;
- sprite extraction is clean and frame-accurate;
- gameplay layout and enemy density are no longer cramped;
- lasers visually face their direction of travel;
- the correct Founder-supplied fonts are used;
- result/panel/button surfaces are truthful and functional; and
- the full APP1 + APP2 bounded surface is genuinely ready for Founder acceptance.

This is **not** a new feature sprint. It is a bounded correction and completion pass.

---

## 2. Boundary

### 2.1 Authorised branch

`feature/GG-COM-001`

### 2.2 Entry state

Use provider state already identified by Founder review and prior correction routing:

`5ccd915ab9e11ff53ad1ae247fbe5a0c87710d43`

### 2.3 Merge rule

No merge is authorised. Founder remains the only merge authority.

### 2.4 Scope rule

Only perform changes required to complete the bounded APP1/APP2 correction surface described in this handoff. Do not introduce unrelated improvements.

---

## 3. Founder-authoritative asset sources for this correction

The following are now Founder-authoritative for this pass and must be acceded correctly.

### 3.1 Existing authoritative pack already in post box

- `assets.zip`
  - owned audio estate REV2
  - existing owned image estate
  - existing owned fonts / specimen / provenance material

### 3.2 Newly added runtime art references / source assets

Use the newly supplied Founder images added to the post box / current intake for the following runtime surfaces:

- comet strip (multi-colour comet variants);
- orange explosion strip;
- purple nuclear projectile strip;
- purple nuclear burst strip;
- `VICTORY / MISSION CLEARED` result panel;
- orange enemy ship / destruction strip.

These are now the visual authority for those corresponding runtime surfaces. Do not substitute older active assets where these new Founder-supplied assets are intended to replace them.

### 3.3 Newly added button pack

- `gg_game_over_buttons_v002_states_corrected.zip`
  - use these corrected button states where applicable;
  - ensure state/off/on-click mapping is correct and interactive.

### 3.4 Newly added font packs

- `GG_Gold_Font_Production_v1.zip`
- `GG_Silver_Font_Production_v1.zip`

These now provide the authoritative production font direction for runtime use in this correction.

---

## 4. Mandatory asset accession and estate hygiene

1. Compare the newly supplied authority assets against the active repository asset estate.
2. Promote the Founder-authoritative assets required by this handoff into the active production runtime.
3. Remove superseded duplicates from active production use.
4. Move superseded assets to an `_archive/` structure with lineage preserved.
5. Do **not** delete provenance or ownership evidence.
6. Update the asset registers/currentness/evidence so it is obvious:
   - what is current;
   - what is superseded;
   - what is archived;
   - what is source authority; and
   - what is actually consumed by the runtime.
7. No undocumented duplicate production assets are to remain in active runtime directories.

---

## 5. Sprite extraction / frame-boundary correction

### 5.1 Core issue

The Founder has identified that the player ship and scout sprite usage appears to be using blanket frame dimensions rather than tightly and correctly respecting the actual white-space-separated source imagery.

### 5.2 Required correction

For the player and scout sprite sheets:

1. Validate the intended frame count.
2. Validate the intended frame boundaries.
3. Ensure extraction/cropping uses the correct per-frame slice, including whitespace and content boundaries.
4. Remove any visible bleed, mis-cutting, partial neighbouring-frame content or rotational/cylindrical artefacting caused by incorrect frame assumptions.
5. If the supplied source sheet demands a different frame strategy than the current blanket px assumption, change the runtime implementation accordingly.
6. Do **not** mutilate the Founder source art to hide a frame-loading defect.

### 5.3 Player-ship animation rule

The player ship must remain visually stable and correct in play. If multiple frames are thrust/energy-state variants, use them in a restrained and visually coherent manner. If the full current cycle causes deformation or a spinning/cylindrical look, use the correct canonical frame set or a reduced, correct animation strategy instead.

---

## 6. Enemy layout / density / UX correction

The Founder has identified that the current alien-ship presentation is cramped and creates poor UX.

### Required outcomes

1. Rebalance enemy screen occupancy.
2. Reduce overcrowding caused by current enemy count, sizing, shape spacing or formation placement.
3. Ensure the playfield remains readable and fair.
4. Maintain challenge while improving clarity.
5. Validate the correction across representative gameplay states, not just a static spawn state.

This is a UX correction, not merely a cosmetic change.

---

## 7. Laser orientation and legibility

### 7.1 Direction rule

All lasers must visually face their direction of travel.

- **Alien / enemy lasers:** travel downward and therefore must be rotated **90 degrees clockwise**.
- **Player lasers:** travel upward and therefore must be rotated **90 degrees counter-clockwise**.

### 7.2 Legibility rule

The laser assets must be large and clear enough to be meaningfully visible during live play.

### 7.3 Required correction

1. Apply the Founder-supplied laser art only.
2. Correct runtime orientation to match the direction-of-travel rule above.
3. Increase legibility to a production-acceptable level.
4. Ensure collision bodies follow the meaningful projectile core rather than decorative excess glow/transparent margins.
5. Keep player and enemy projectile presentation clearly distinguishable.

---

## 8. Result / victory / game-over surfaces

### 8.1 Truthful dynamic overlay rule

Any score, wave, mission, bonus or equivalent displayed on a result surface must be dynamic, truthful and runtime-derived.

No embedded placeholder values may be presented as live state.

### 8.2 Mission-cleared panel

Use the Founder-supplied `VICTORY / MISSION CLEARED` panel authority for this runtime surface.

Required:

1. No centre logo/crest obstruction over the panel.
2. Dynamic score/wave/bonus overlay only.
3. Overlay styling consistent with the panel and approved fonts.
4. No inaccurate baked values.

### 8.3 Button functionality

The visible result/game-over buttons must be real controls, not decorative art.

Required:

1. Correct button off/on-click states from the corrected pack.
2. Distinct interactive hit areas.
3. Correct mouse behaviour.
4. Correct touchscreen behaviour.
5. Keyboard/controller equivalents retained.
6. No “tap anywhere = continue” behaviour where visible discrete buttons are shown.

### 8.4 Context rule

Buttons must do the correct context-appropriate action:

- `NEXT` -> correct next progression state only where one exists;
- `REPLAY` -> replay correct level/run context;
- `MENU` -> governed menu return/reset.

Do not present a false NEXT action where there is no valid next progression state.

---

## 9. Font and typography implementation

### 9.1 Source rule

Use only the Founder-supplied post-box font authority for this correction.

### 9.2 Runtime hierarchy

Use the supplied silver/gold production fonts appropriately and consistently.

Recommended implementation direction:

- silver treatment for principal/futuristic heading/title-state usage where aligned to the Founder authority;
- gold/orange treatment for high-energy accent or secondary title treatment where aligned to the Founder authority;
- maintain clean supporting typography hierarchy where required for dynamic HUD/result values.

### 9.3 Requirements

1. Replace incorrect generic/legacy title-state typography where applicable.
2. Align major title/result surfaces to the Founder-authoritative font treatment.
3. Ensure runtime loading is correct and stable.
4. Validate that actual rendered font family matches the intended authority.
5. Do not improvise an unrelated arcade look.

---

## 10. Gameplay art replacement scope

The following runtime classes/surfaces must be reconciled against the latest Founder-supplied visual authority:

- player ship;
- scout ship;
- enemy ship strip / destruction strip;
- comet variants;
- explosion strip;
- nuclear projectile strip;
- nuclear burst strip;
- mission-cleared/victory panel;
- corrected game-over/result buttons;
- relevant font surfaces.

Where the Founder has supplied a newer authoritative visual for a given role, use that visual and retire the superseded active equivalent from runtime use.

---

## 11. Regression requirement

This is not a narrow one-surface patch. Regress the complete bounded APP1 + APP2 production surface, including:

- main menu;
- info / settings / sound;
- gameplay across levels;
- touch path;
- controller path;
- pause/resume;
- result/victory states;
- game over;
- boss/final states;
- scoring continuity;
- asset loading;
- runtime errors;
- small-surface/responsive sanity.

---

## 12. Required verification

Automated verification must move beyond “HTTP 200” asset presence and prove meaningful correction.

Minimum required evidence/assertions:

1. Player and scout sprite extraction is frame-correct and visually clean.
2. No neighbouring-frame bleed or incorrect blanket slice behaviour.
3. Player ship does not exhibit cylindrical/spinning artefacts.
4. Enemy screen occupancy has been rebalanced and is no longer cramped.
5. Player lasers render facing upward.
6. Enemy lasers render facing downward.
7. Laser visibility is materially improved.
8. Result/victory panel values are runtime-correct.
9. Result/game-over buttons have real, separate interactive zones.
10. Touch interaction honours discrete buttons.
11. Correct Founder-supplied assets are actually loaded.
12. Superseded active assets are not still referenced by production runtime.
13. Correct fonts are rendered on intended surfaces.
14. Runtime exceptions remain zero.
15. Network failures / missing assets remain zero.

---

## 13. Evidence return requirements

Return updated evidence showing at minimum:

- main menu;
- representative gameplay state;
- corrected player ship;
- corrected scout/enemy surface;
- player laser in motion;
- enemy laser in motion;
- corrected mission-cleared panel with truthful overlay;
- corrected button states and touch interaction proof;
- corrected game-over surface;
- evidence of asset accession/archive/register updates.

---

## 14. Closure requirements

Return only when all of the following are true:

- all authorised work committed and pushed;
- local HEAD == remote HEAD;
- worktree clean;
- Docker rebuilt from final HEAD;
- preview live at `http://localhost:8027/`;
- stop command `docker compose down`;
- POST_BOX reduced to boundary controls only;
- no merge performed;
- Founder acceptance still marked pending.

---

## 15. Return format

Return in the normal governed completion structure and include:

- final pushed HEAD;
- concise change summary;
- verification summary;
- evidence location summary;
- currentness/register/archive update summary;
- closure state summary; and
- sealed external return package hash.

