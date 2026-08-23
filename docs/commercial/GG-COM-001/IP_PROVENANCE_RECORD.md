# IP Provenance Record

Handoff: GALACTIC_GUNNERS_GG_COM_001_HANDOFF_IN_001
Date: 2026-08-23

## Authority Boundaries

- Commercial repository: Inceptivec-io/GalacticGunners
- Historical evidence repository: michael-leese/GallacticGunners (read-only reference)
- Institutional parent: Inceptivec Gamification
- CLOM status: read-only governing reference only; no CLOM mutation authorized.

## Historical Origin

Galactic Gunners originated as Michael Leese's 2019 educational interactive frontend development milestone project. The historical repository remains provenance evidence and must not be rewritten as if it had always been a commercial Inceptivec product.

## Upstream Code Foundation

Jared York's CourseSaucerInvaders is MIT licensed and provided the early Saucer Invaders code foundation. The current product has substantial added and modified game logic, levels, UI, input handling, controller support, story/presentation and media.

## Exact Upstream Blob Matches

| Current file | Git blob SHA | Provenance decision |
|---|---|---|
| assets/js/phaser.js | a80489ce3764e3e5e02b602e48ff2cadd9b43266 | Retain; Phaser MIT notice required; version 3.16.2. |
| assets/audio/sndBtn.wav | 1b1d2f307f5071ad5a87e65ce1a9add4d9bec52e | Retain; Jared York MIT notice required. |
| assets/audio/sndExplode.wav | 74671abe5784f846d6a8f7d774cff59a60ab43e8 | Retain; Jared York MIT notice required. |
| assets/audio/sndLaserEnemy.wav | 0e37f919bbae1b846a742c17369bfb8a3657edbf | Retain; Jared York MIT notice required. |
| assets/audio/sndLaserPlayer.wav | 2abb250ae04669e8270a5e1f69f94afa1623e271 | Retain; Jared York MIT notice required. |

## Commercial Controller Work

Current commercial HEAD contains controller/gamepad support under commit 87923524833b737c7e3bf1764dde0b6ebf495e62 (Add controller support). Founder evidence records Michael Leese and Aurora Leonardi jointly implemented/tested controller support with Xbox and Haute M-series controllers.

## Utility Code Finding

| Path | Git Blob SHA | Provenance Finding | Classification | Decision |
|---|---|---|---|---|
| `assets/js/utils/UIBlock.js` | `f0e73b4c809dbf6884fa7beaf8656ef27e9ba2fe` | Historical README references phasergames.com utility/API material; independent commercial provenance not established in this execution. | `UNKNOWN - REPLACE / RESOLVE` | Retain for current runtime only; replace with internally authored equivalent in the later IP Freedom pack. |
| `assets/js/utils/align.js` | `8f9f895fbfab03741429977332edb66972a0118b` | Same utility/example-code provenance concern. | `UNKNOWN - REPLACE / RESOLVE` | Retain for current runtime only; replace later. |
| `assets/js/utils/alignGrid.js` | `b28a06551fd4c970dcc7166de47d1145bf4c0643` | Same utility/example-code provenance concern. | `UNKNOWN - REPLACE / RESOLVE` | Retain for current runtime only; replace later. |

## Course PDF

assets/images/ReadMeImages/Build-Arcade-Games-with-Phaser-3_-Saucer-Invaders-1.pdf is not needed to run the game and was removed from the commercial repository. Provenance is preserved by external reference only.
