# Runtime Test Results

Result: PASS
Command: node docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_002/runtime_regression/run_cdp_regression.mjs
Server: python -m http.server 8026
Browser: Chrome headless via CDP on clean port 9228

Coverage executed:
- menu boot and owned logo/menu/symbol render;
- info screen;
- Level1 gameplay screen;
- nuke visual/audio trigger path;
- pause and resume;
- Level2 gameplay screen;
- boss scene;
- game-over surface;
- victory surface;
- owned texture-key existence check;
- network 404/error check;
- browser console exception check.

Final result file: runtime_regression/browser-regression-result.json
Screenshots: runtime_regression/01_main_menu.png through runtime_regression/10_victory.png
