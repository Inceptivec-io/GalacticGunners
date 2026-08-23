# GALACTIC GUNNERS
# CODE PROVENANCE RECORD
## GG-COM-001 v1.0

## 1. Provenance Chain

```text
Jared York — CourseSaucerInvaders
MIT-licensed educational source
        ↓
Michael Leese — GallacticGunners
2019 educational project
substantial extension / adaptation / new game structure
        ↓
Inceptivec-io/GalacticGunners
commercial accession
        ↓
2026 commercial development
controller/gamepad capability
        ↓
future GG-COM programme
```

---

## 2. Upstream Software Evidence

Jared York upstream contains:

- `LICENSE` — MIT;
- `index.html`;
- `js/Entities.js`;
- `js/SceneMain.js`;
- `js/SceneMainMenu.js`;
- `js/game.js`;
- `js/phaser.js`;
- small game assets and sounds.

The upstream project is substantially smaller than current Galactic Gunners.

This supports the historical README's account that Galactic Gunners extended the original foundation rather than merely rebranding an unchanged tutorial.

---

## 3. Known Exact Binary/Blob Matches

### Phaser

Current:

`assets/js/phaser.js`

SHA:

`a80489ce3764e3e5e02b602e48ff2cadd9b43266`

Upstream:

`js/phaser.js`

Same SHA.

Classification:

`THIRD-PARTY — PHASER — MIT`

### Upstream sounds preserved unchanged

The following Galactic Gunners files are byte-identical by Git blob SHA to files in `jaredyork/CourseSaucerInvaders/content`:

| Galactic Gunners file | SHA | Upstream file | Classification |
|---|---|---|---|
| `assets/audio/sndBtn.wav` | `1b1d2f307f5071ad5a87e65ce1a9add4d9bec52e` | `content/sndBtn.wav` | UPSTREAM MIT REPOSITORY ASSET — retain notice |
| `assets/audio/sndExplode.wav` | `74671abe5784f846d6a8f7d774cff59a60ab43e8` | `content/sndExplode.wav` | UPSTREAM MIT REPOSITORY ASSET — retain notice |
| `assets/audio/sndLaserEnemy.wav` | `0e37f919bbae1b846a742c17369bfb8a3657edbf` | `content/sndLaserEnemy.wav` | UPSTREAM MIT REPOSITORY ASSET — retain notice |
| `assets/audio/sndLaserPlayer.wav` | `2abb250ae04669e8270a5e1f69f94afa1623e271` | `content/sndLaserPlayer.wav` | UPSTREAM MIT REPOSITORY ASSET — retain notice |

This is stronger evidence than the historical README alone.

---

## 4. Galactic Gunners Code Estate

Current principal code files include:

- `assets/js/bosslevel.js`
- `assets/js/controller.js`
- `assets/js/entities.js`
- `assets/js/game.js`
- `assets/js/info.js`
- `assets/js/level1.js`
- `assets/js/level2.js`
- `assets/js/mainmenu.js`
- `assets/js/paused.js`
- `assets/js/phaser.js`
- `assets/js/preloader.js`
- `assets/js/titles.js`
- `assets/js/victory.js`
- `assets/js/utils/UIBlock.js`
- `assets/js/utils/align.js`
- `assets/js/utils/alignGrid.js`
- `tools/controller_button_tester.py`

### Classification rule

Do not waste commercialisation time trying to prove individual authorship of every historical line where:

- the upstream is permissively MIT licensed;
- provenance is already disclosed;
- retaining the MIT notice resolves the relevant software licensing obligation.

Instead distinguish:

1. bundled third-party library;
2. known upstream-derived foundation;
3. Galactic Gunners authored/extended application code;
4. 2026 commercial additions;
5. utility/example code requiring separate attribution review.

---

## 5. Utility Code Risk

The historical README explicitly references external Phaser examples/tutorials and `phasergames.com` utilities.

The utility files:

- `UIBlock.js`;
- `align.js`;
- `alignGrid.js`;

must be checked against the cited source material during execution.

Current classification:

`ATTRIBUTION SOURCE REVIEW REQUIRED`

If their source licence cannot be established efficiently:

- replace with small internally authored equivalents;
- do not retain uncertain copied utility code merely because it is small.

---

## 6. 2026 Commercial Controller Contribution

Entry HEAD:

`87923524833b737c7e3bf1764dde0b6ebf495e62`

Verified commit:

`Add controller support`

Verified GitHub author identity:

`LccSalvoLeonardi`

Changes include:

- `assets/js/controller.js` added;
- controller support integrated into multiple scenes;
- `tools/controller_button_tester.py` added;
- gamepad configuration enabled;
- controller UI/control descriptions updated.

Founder evidence identifies Aurora Leonardi as the collaborating contributor behind this work and confirms joint implementation/testing with Michael Leese.

Current real-device tested controller families:

- Xbox controller;
- Haute M-series controller.

Classification:

`CURRENT COMMERCIAL CONTRIBUTION — CONTRIBUTOR CREDIT REQUIRED`

Ownership/rights treatment must follow the separate contributor/royalty record and any signed contributor terms.

---

## 7. Required Execution Verification

Development will later be instructed to:

- inspect Git history for utility/source lineage;
- record exact Phaser version;
- identify exact files retaining upstream-derived structures;
- record later commercial additions;
- avoid unnecessary rewriting where MIT notice is sufficient;
- replace code only where provenance cannot be resolved or commercial risk is disproportionate.
