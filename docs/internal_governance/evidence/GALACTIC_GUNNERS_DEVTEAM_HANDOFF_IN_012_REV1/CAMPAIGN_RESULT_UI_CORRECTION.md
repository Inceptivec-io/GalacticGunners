# H012 REV1 APP1 Campaign Result UI Correction

## Scope

This bounded correction makes the six-level packaged campaign playable through its actual result controls. It does not create a branch, PR, merge, or change the accepted Level 1 combat composition.

## Runtime Result Contract

- Non-final success uses `gg_victory_panel_v002_no_values.png` with runtime-derived score, wave and bonus values.
- Failure uses `gg_game_over_panel_v002.png` with runtime-derived score, wave and remaining lives.
- Level 1 through Level 5 expose three discrete controls: Continue, Replay and Main Menu.
- Continue resolves the next validated, checksummed packaged campaign definition. Level 6 is terminal and has no Continue action.
- Game Over exposes discrete Try Again and Main Menu controls.
- Replay, Try Again and Main Menu use their approved off/onclick source assets. No approved Continue art exists in the admitted estate, so Continue is a purpose-built production-styled control; a dedicated Continue asset is a non-blocking follow-up need.

## Automated Evidence

`npm run runtime:campaign` against the rebuilt Docker runtime passed:

- Level 1 complete panel and touch Continue to Level 2;
- Level 2 distinct formation topology;
- valid chain through Levels 2, 3, 4, 5 and 6;
- final terminal victory with no invalid Level 7;
- replay, Game Over, Try Again and Main Menu actions;
- dynamic values, zero console errors and zero unexpected network failures.

Screenshots and machine-readable results are in `campaign_runtime/`.

The complete existing hostile matrix was rerun against the same rebuilt Docker runtime. All hostile assertions, visual-matrix assertions, console checks and unexpected-network checks passed. Its report and screenshots are in `browser_runtime/`.

## Input Contract

Each visible result action has a discrete pointer/touch hit area. Keyboard Enter/Space and gamepad A/Start retain the existing `InputSystem` confirm contract, selecting Continue on non-final success, Replay at final victory and Try Again after failure. Escape/B/Back retains Main Menu routing.

Founder acceptance remains pending.
