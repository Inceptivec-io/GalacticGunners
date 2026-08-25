# GALACTIC GUNNERS
# ASSET PROVENANCE REGISTER
## GG-COM-001 v1.0 — CTO Pre-Execution Classification

## 1. Classification Vocabulary

- `OWNED`
- `MIT / PERMISSIVELY LICENSED`
- `ATTRIBUTION REQUIRED`
- `COMMERCIAL USE VERIFIED`
- `REPLACE`
- `UNKNOWN — REPLACE / RESOLVE`

---


## 1A. Founder Commercial Asset Policy — v1.1

For the commercial product, the strategy is not to preserve questionable legacy media simply because a licence may eventually be found.

The approved direction is:

```text
LEGACY / THIRD-PARTY / UNCERTAIN NON-CORE MEDIA
            ↓
IDENTIFY IN GG-COM-001
            ↓
REMOVE FROM COMMERCIAL DEPENDENCE
            ↓
REPLACE WITH INCEPTIVEC-OWNED MATERIAL
            ↓
EVIDENCE CREATION / OWNERSHIP
            ↓
CLEAN COMMERCIAL ASSET ESTATE
```

This replacement policy applies to:

- legacy internet-sourced imagery;
- sprites derived from unclear source images;
- the separate nuke/fireball sound;
- arcade fonts of uncertain exact provenance;
- small tutorial/example utility code where separate provenance is not worth retaining;
- unnecessary bundled third-party documentation such as the Saucer Invaders course PDF.

The replacement assets should deliberately retain the **90s arcade/space-shooter character** Michael wants, without looking stale or merely retro for nostalgia's sake.

Target creative direction:

- 1990s arcade / console-space-shooter influence;
- crisp, readable silhouettes;
- strong contrast;
- restrained but vivid sci-fi colour;
- satisfying sprite animation;
- modern display scaling;
- current mobile/desktop visual expectations;
- no photorealistic visual overhaul;
- no generic AI-art aesthetic;
- no loss of the original arcade identity.

The separate creation programme is:

`IP_FREEDOM_LICENSE_PROTECTION_ASSET_CREATION`

GG-COM-001 identifies/removes dependencies and sets the authority/provenance rules. The dedicated asset-creation pack defines and commissions the replacement work.


## 2. Audio

| Path | Evidence | CTO Classification | Action |
|---|---|---|---|
| `assets/audio/sndBtn.wav` | Exact SHA match to Jared York upstream `content/sndBtn.wav` | `MIT / PERMISSIVELY LICENSED` | KEEP + upstream notice |
| `assets/audio/sndExplode.wav` | Exact SHA match to Jared York upstream | `MIT / PERMISSIVELY LICENSED` | KEEP + upstream notice |
| `assets/audio/sndLaserEnemy.wav` | Exact SHA match to Jared York upstream | `MIT / PERMISSIVELY LICENSED` | KEEP + upstream notice |
| `assets/audio/sndLaserPlayer.wav` | Exact SHA match to Jared York upstream | `MIT / PERMISSIVELY LICENSED` | KEEP + upstream notice |
| `assets/audio/nukefiring.wav` | Historical README identifies separate fireball sound source | `REPLACE` | Replace with newly created Inceptivec-owned nuke/fire sound |

### CTO position

The four exact upstream sounds need not be replaced merely because they originated elsewhere: the upstream repository is MIT licensed and their exact inclusion is evidence-backed.

The nuke/fireball sound should be treated separately.

---

## 3. Fonts

Current files:

- `assets/fonts/ARCADE.TTF`
- `assets/fonts/ARCADEPIX.ttf`

Historical README cites a general free-font source, but present repository evidence does not establish commercial rights for these exact files.

The upstream Jared York repository contains `content/ARCADEPI.TTF`, but its blob SHA does **not** match either current Galactic Gunners font file.

Therefore:

| Path | CTO Classification | Action |
|---|---|---|
| `assets/fonts/ARCADE.TTF` | `REPLACE` | Replace with an Inceptivec-owned or specifically commissioned custom arcade font/wordmark system |
| `assets/fonts/ARCADEPIX.ttf` | `REPLACE` | Replace with an Inceptivec-owned or specifically commissioned custom arcade font/wordmark system |

### Required remediation

Both legacy fonts are removed from commercial dependency.

The replacement should preserve a clean 90s arcade character while meeting current readability, scaling and cross-platform requirements.

Where a fully custom font is disproportionate, the product may use a commercially safe permissive system font for body/UI text while creating proprietary display lettering/logo treatment for the recognisable Galactic Gunners identity. The exact solution belongs to the dedicated asset-creation pack.

---

## 4. Images / Sprites

Current repository contains, among others:

- `Alien-Destroyer-withexhaust-3frame.png`
- `AlienSkullCrossBonesWhite.png`
- `InfoWhite.png`
- `MotherShip-Flash.png`
- `alien.png`
- `alienCruiser.png`
- `asteroid.png`
- `comet.png`
- `darkstars.jpg`
- `explosion.png`
- `fireworks.png`
- `mute.png`
- `pointericon.png`
- `resume.png`
- `resumeHover.png`
- `scifiwarriors.png`
- `scoutship.png`
- screenshots;
- README images;
- wireframes;
- additional assets deeper in the tree.

Historical evidence says Michael used GIMP to create/modify sprite objects and created elements of the visual story, but it also lists several third-party websites.

### Current classification rule

Each runtime image must be classified individually or by defensible family.

#### `OWNED`

Use only where:

- Michael created the asset from scratch; or
- a contributor created it under an appropriate commercial contribution arrangement; or
- source working files/history make authorship reasonably evident.

#### `COMMERCIAL USE VERIFIED` / `ATTRIBUTION REQUIRED`

Use where:

- the exact source asset can be identified;
- its licence permits commercial derivative use;
- required attribution can be preserved.

#### `UNKNOWN — REPLACE / RESOLVE`

Use where:

- the source is merely remembered as “public” or “free”;
- the historical source URL is dead/unclear;
- licence terms cannot be reconstructed;
- DeviantArt/PNG aggregation provenance is uncertain;
- a derivative was made from an image whose underlying rights are unclear.

### Required commercial policy

Legacy runtime art that is not clearly owned by Michael/Inceptivec or a retained MIT upstream component is to be replaced.

The game should enter store packaging with a deliberately clean **Inceptivec-owned visual-rights estate**.

The replacement art direction must retain the arcade identity:

- 90s-inspired rather than artificially aged;
- visually current;
- readable on mobile and desktop;
- recognisable silhouettes;
- modern polish without losing sprite-driven character;
- coherent art direction across ships, enemies, bosses, backgrounds, explosions, UI icons and effects.

---

## 5. Documentation Assets

Documentation-only material includes:

- historical screenshots;
- wireframes;
- README header art;
- user testing screenshots;
- historical course/reference PDF.

### Special issue — included Saucer Invaders course PDF

The commercial repository currently contains:

`assets/images/ReadMeImages/Build-Arcade-Games-with-Phaser-3_-Saucer-Invaders-1.pdf`

This is not needed to run Galactic Gunners.

Even if historically useful, redistribution of an entire course/reference PDF should not be assumed to be covered merely because the source-code repository is MIT licensed.

CTO classification:

`REMOVE FROM COMMERCIAL DISTRIBUTION`

Required action:

- remove the bundled PDF from the commercial product repository;
- do not spend commercialisation time attempting to preserve it;
- preserve historical citation/provenance through a normal external reference to the upstream project/course;
- do not bundle the course document with the commercial product.

---

## 6. Screenshots and Wireframes

If screenshots are captures of Galactic Gunners itself and were created by Michael/contributors:

`OWNED / PRODUCT DOCUMENTATION`

If screenshots contain third-party websites, identifiable personal information or unrelated copyrighted material:

review before commercial publication.

Wireframes created by Michael as part of the original project:

`OWNED`, subject to ordinary confirmation from project history.

---

## 7. Required Development Output

The final register after execution must add:

- exact SHA/file identity;
- runtime vs documentation-only role;
- claimed creator;
- exact source;
- exact licence;
- attribution requirement;
- commercial decision;
- replacement file if applicable;
- evidence reference.

No runtime asset may remain `UNKNOWN` at commercial release.
