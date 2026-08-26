# GG-H015 — NATIVE CLIENTS + CROSS-CLIENT RUNTIME CONTRACT

## Outcome

Deliver production-ready native packaging without rewriting the Phaser game.

Target clients:

```text
WEB
WINDOWS DESKTOP
ANDROID
IOS / IPADOS
```

Preferred wrappers:
- Desktop: Tauri unless a documented blocker requires Electron.
- Mobile: Capacitor.

## Cross-client architecture

One Phaser/TypeScript gameplay core.
One Next.js product shell where technically appropriate.
Django API remains client-independent authority.

No React Native / Flutter gameplay rewrite.

## Client contract

Define one client adapter:

```text
ClientPlatformAdapter
- platform
- app_version
- game_version
- api_base_url
- secure_storage
- open_external_url
- fullscreen
- haptics optional
- safe_area
- lifecycle pause/resume
- network_status
- update_channel
- diagnostics
```

Gameplay code must not contain wrapper-specific branches scattered through scenes.

## Environment routing

Each client/environment resolves:
- APP/API base URL;
- auth route;
- leaderboard route;
- admin route not exposed in player clients;
- privacy/terms/help routes;
- release channel;
- minimum supported client/game version.

Use ignored local `env.<environment>` files for local secrets/routing; production CI/CD uses provider secret stores, never committed credentials.

## Auth/session

Django remains identity authority.
Native clients require a documented secure session/token strategy.
Sensitive tokens use OS secure storage:
- Windows Credential Manager / Tauri secure storage equivalent;
- Android Keystore;
- iOS Keychain.

Do not store auth tokens in plaintext localStorage where native secure storage is available.

## Lifecycle

Required:
- app background pauses gameplay safely;
- resume does not double timers/listeners;
- suspended run state handled deterministically;
- network drop does not crash gameplay;
- orientation/safe-area handling;
- window resize/fullscreen on desktop.

## Input

Desktop:
- keyboard;
- Xbox/common controller;
- Haute M-series through existing gamepad abstraction.

Mobile:
- touch controls;
- safe-area aware;
- tablet support;
- optional supported external controller.

## Native filesystem/cache

Define storage for:
- validated packaged level definitions;
- validated remote cache;
- settings;
- non-sensitive diagnostics;
- optional local unranked run recovery.

No secrets in cache.

## Update/version contract

Every client sends:
- client_type;
- app_version;
- game_version.

Backend may return:
- supported;
- minimum_version;
- optional update available;
- hard upgrade required.

Do not brick offline packaged gameplay solely because update service is unavailable unless a security-critical minimum version is already cached/embedded.

## Build outputs

Windows:
- signed installer/build artifact path defined;
- icon/splash/product metadata;
- version metadata.

Android:
- AAB/APK build path;
- package/application ID;
- adaptive icons/splash;
- signing boundary documented.

iOS/iPadOS:
- Xcode/IPA archive path;
- bundle ID;
- signing/provisioning boundary documented.

Do not commit private signing keys/certificates.

## Platform permissions

Request only permissions actually required.
No unnecessary contacts/location/filesystem permissions.

## Deep links

If login/help/legal flows require deep links, define exact allowed schemes/domains and reject arbitrary redirects.

## Tests

Required automated/manual matrix:
- web regression;
- Windows package launches;
- Android phone/tablet;
- iPhone/iPad where build infrastructure available;
- keyboard/touch/gamepads;
- suspend/resume;
- offline start;
- backend outage;
- invalid remote level fallback;
- auth persistence/logout;
- fullscreen/window resize;
- safe areas/orientation;
- version compatibility.

## Exit gate

```text
ONE GAME CORE = PASS
WINDOWS BUILD = PASS
ANDROID BUILD = PASS
IOS/IPADOS BUILD READY = PASS OR EXTERNAL SIGNING/STORE BLOCKER DOCUMENTED
SECURE TOKEN STORAGE = PASS
OFFLINE LEVEL DELIVERY = PASS
INPUT MATRIX = PASS
LIFECYCLE = PASS
NO NATIVE SECRETS IN REPO = PASS
CI/BUILD EVIDENCE = PASS
```

PR target: `dev`, Draft, not merged by Development.
