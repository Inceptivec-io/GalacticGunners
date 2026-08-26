# GG-H017 — FINAL REGRESSION / UI-UX / ACCESSIBILITY / RELEASE CANDIDATE

## Outcome

This is the final v1.0 construction/acceptance PR. It does not add major product architecture. It closes defects, polish gaps, accessibility, performance, documentation, release evidence, stage acceptance, and production promotion readiness.

## Entry

H013–H016 merged and accepted.
H012 six-level campaign accepted.
Stage contains the complete candidate product.

## Regression domains

Run and record full regression for:

### Product shell
- landing/menu;
- settings;
- help;
- credits;
- legal/privacy;
- auth/profile if enabled;
- leaderboard;
- hidden admin access boundaries.

### Core campaign
- Level 1–6 start/complete/fail;
- Continue progression;
- result panels;
- replay/current-level behavior;
- campaign replay/main-menu behavior;
- scoring;
- lives;
- nukes;
- Energise;
- pause;
- respawn;
- shields;
- hazards;
- drops/pickups;
- finale.

### Config platform
- create/edit/drag/drop;
- validate;
- same-runtime preview;
- publish;
- rollback;
- import/export;
- generator;
- offline fallback;
- invalid config rejection.

### Online authority
- GameRun validation;
- invalid score rejection;
- leaderboard;
- moderation;
- degraded/offline behavior.

### Boarding
- eligibility;
- enter;
- mechanics;
- timeout;
- success;
- state return;
- rewards;
- Game Over path.

### Native clients
- web;
- Windows;
- Android;
- iOS/iPadOS where available;
- keyboard;
- touch;
- Xbox/common gamepad;
- Haute M-series;
- suspend/resume;
- offline.

## Viewport/device matrix

At minimum:

```text
1024x768
1365x768
1440x900
1920x1080
2560x1440
mobile portrait representative
mobile landscape representative
tablet representative
```

No clipping, unintended black bars, seams, unreadable HUD, inaccessible result controls, or broken safe areas.

## UI/UX commercial gate

Review every player-facing screen for:
- approved production assets;
- correct brand name;
- production typography;
- clear hierarchy;
- spacing consistency;
- intentional animation;
- correct button off/hover/click states;
- no duplicate controls;
- no placeholder/debug/dev text;
- readable score/wave/bonus values;
- correct panel composition;
- useful loading/error/degraded states.

Create one canonical snag register:

```text
ID
surface
severity BLOCKER|HIGH|MEDIUM|LOW
viewport/client
steps
expected
actual
evidence
owner
status
fix_sha
verification
```

Release requires:

```text
BLOCKER = 0
HIGH = 0
MEDIUM = Founder/CTO accepted or 0
```

## Accessibility

Web/admin/product UI:
- keyboard navigation where applicable;
- visible focus;
- semantic labels;
- contrast review;
- no critical interaction dependent only on color;
- accessible form labels/errors;
- reduced-motion consideration where reasonable.

Gameplay accessibility remains compatible with intended arcade experience, but menus/settings/result/admin surfaces must not be unnecessarily inaccessible.

## Performance

Record budgets and evidence:
- initial web load;
- Phaser boot time;
- Level 1–6 frame stability;
- maximum entity-budget levels;
- generator/admin responsiveness;
- API latency under normal local/stage load;
- memory growth across replay/level transitions/Boarding transitions.

No progressive listener/timer/entity leak across repeated runs.

## Security final gate

Run:
- dependency scans;
- secret scan;
- admin RBAC hostile;
- import hostile;
- score validation hostile;
- auth/session tests;
- production settings inspection;
- CORS/CSRF/CSP/rate-limit tests.

## Documentation finalization

Update to actual shipped product:
- Player Guide;
- Admin Guide;
- Level Authoring Guide;
- Developer Guide;
- Regression Guide;
- UI/UX Snagging Guide;
- Environment/Routing/Secrets Guide;
- Release/Promotion Guide;
- API/OpenAPI;
- architecture diagrams;
- troubleshooting;
- support runbook.

No guide may describe planned functionality as already shipped unless implemented.

## Stage acceptance

Deploy exact candidate to stage.
Founder performs:
- campaign playthrough;
- result/progression review;
- leaderboard review;
- Boarding review;
- admin designer review;
- representative native client review;
- UI/UX snag review.

All release blockers corrected through the same H017 PR before final acceptance.

## Production promotion

After Founder/CTO acceptance:

```text
accepted dev
→ stage exact candidate
→ stage acceptance
→ prod
→ health/smoke
→ rollback readiness
→ release tag
→ release notes
```

Production admin credentials/routing are generated into ignored local `env.prod` and hosted provider secrets at commissioning time; never committed.

## Release artifacts

Required:
- release version/tag;
- release notes;
- final known-issues list;
- deployment SHA matrix dev/stage/prod;
- backup/rollback evidence;
- store/native build references;
- final test report;
- final snag register;
- final governance/currentness record.

## Exit gate

```text
FULL REGRESSION = PASS
UI/UX BLOCKERS = 0
HIGH SNAGS = 0
ACCESSIBILITY = PASS
PERFORMANCE = PASS
SECURITY = PASS
DOCUMENTATION = CURRENT
STAGE FOUNDER ACCEPTANCE = PASS
PROD PROMOTION = PASS
PROD SMOKE = PASS
RELEASE TAG/NOTES = PASS
GOVERNANCE_DEBT_COUNT = 0
```

This closes the planned v1.0 programme.
