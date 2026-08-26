# H012 REV1 APP1 — CAMPAIGN PROGRESSION + RESULT UI CORRECTION

Repository:
`Inceptivec-io/GalacticGunners`

Branch:
`feature/v1-config-driven-campaign-platform`

PR:
`#8`

This APP1 is part of the existing H012 REV1 completion. Do not create another branch or PR. Do not merge.

Founder-observed failures:
1. completing Level 1 does not visibly progress into Level 2;
2. current complete/continue screen exposes only Replay/Main Menu;
3. result composition does not use the approved production panels/buttons;
4. campaign progression is therefore not commercially reviewable.

These are H012 exit blockers.

## Approved panel assets

Use the existing production assets:

- `assets/ui/panels/gg_victory_panel_v002_no_values.png`
- `assets/ui/panels/gg_game_over_panel_v002.png`

The no-values victory panel is the preferred victory/result surface where dynamic runtime values must be overlaid.

Approved button-state assets include:

- `assets/ui/buttons/gg_button_main_menu_v002_off.png`
- `assets/ui/buttons/gg_button_main_menu_v002_onclick.png`
- `assets/ui/buttons/gg_button_replay_v002_off.png`
- `assets/ui/buttons/gg_button_replay_v002_onclick.png`
- `assets/ui/buttons/gg_button_try_again_v002_off.png`
- `assets/ui/buttons/gg_button_try_again_v002_onclick.png`

Do not replace these with plain text buttons where the production artwork is designed to be used.

## Result-state doctrine

A successful non-final campaign level is NOT an end-of-game victory.

Required state model:

```text
LEVEL COMPLETE
→ show approved victory/complete panel
→ overlay dynamic score / wave / bonus values
→ expose CONTINUE TO NEXT LEVEL as primary campaign action
→ preserve REPLAY and MAIN MENU as secondary actions where appropriate
→ Continue loads the next validated campaign LevelDefinition
```

A failed run:

```text
GAME OVER
→ approved game-over panel
→ dynamic final score/status
→ TRY AGAIN
→ REPLAY where semantically distinct/approved
→ MAIN MENU
```

A final campaign completion:

```text
FINAL LEVEL COMPLETE
→ approved victory panel
→ final campaign values
→ REPLAY CAMPAIGN / REPLAY LEVEL as specified
→ MAIN MENU
```

Do not present a Level 1 completion as if the campaign is finished.

## Continue action

There is currently no approved standalone `CONTINUE` button asset in the known button set.

Therefore:
- use the approved panel composition;
- implement the Continue action in the panel's intended embedded/action area using the existing production typography/style system;
- do NOT invent a generic browser-looking button;
- if a dedicated Continue asset already exists elsewhere in the current asset estate, use it;
- otherwise implement a production-consistent runtime control and record the missing dedicated asset as a UI asset follow-up, not an execution blocker.

## Dynamic result values

The victory/result panel must support runtime overlay of:
- score;
- wave/level;
- bonus;
- campaign progression status.

No baked-in numbers.

One authoritative final score only.

## Progression contract

Campaign progression is definition-driven.

Required:

```text
currentLevel.sequence = N
successful completion
→ resolve campaign Level with sequence N+1
→ validate definition/checksum
→ load through LevelLoader
→ launch through CombatLevelScene
```

Do not restart Level 1 for Continue.

For Level 1:
`CONTINUE → Level 2`

For Level 2:
`CONTINUE → Level 3`

...through Level 6.

For final Level 6:
no next-level Continue action.

## State persistence between levels

Define and test campaign run state:

```text
CampaignRunState
- campaign
- current_level
- completed_levels
- cumulative_score OR governed scoring policy
- lives carry/reset policy
- nukes carry/reset policy
- bonuses
- seed lineage
```

Do not infer carry/reset values silently. Preserve current gameplay policy where already governed; otherwise explicitly document the chosen v1 campaign policy in current guides/governance before implementation.

## Required runtime tests

1. force/earn Level 1 completion;
2. approved victory/complete panel visible;
3. dynamic Level 1 values correct;
4. Continue visible and primary;
5. Continue loads Level 2 definition;
6. Level 2 visibly differs from Level 1;
7. replay reloads current level;
8. main menu returns to menu;
9. Game Over uses approved panel;
10. Try Again restarts appropriate level;
11. Level 2 completion routes to Level 3;
12. chain progression through all validated campaign levels;
13. Level 6 completion has final-campaign state, not invalid Level 7;
14. keyboard/gamepad/touch action parity;
15. no duplicate text controls over production embedded controls.

## Commercial visual gate

Required:

```text
APPROVED RESULT PANEL USED = PASS
PLAIN PLACEHOLDER RESULT UI = 0
DUPLICATE CONTROLS = 0
DYNAMIC SCORE/WAVE/BONUS = PASS
LEVEL NUMBER VISIBLE = PASS
NEXT LEVEL PROGRESSION = PASS
```

Capture screenshots:
- Level 1 complete
- Level 2 gameplay after Continue
- Level 2 complete
- Game Over
- final campaign complete
