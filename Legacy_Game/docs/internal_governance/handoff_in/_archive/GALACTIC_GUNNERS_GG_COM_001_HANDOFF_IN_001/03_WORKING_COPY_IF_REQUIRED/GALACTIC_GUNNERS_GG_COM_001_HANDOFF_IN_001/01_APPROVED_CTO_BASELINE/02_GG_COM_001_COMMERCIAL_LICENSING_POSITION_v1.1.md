# GALACTIC GUNNERS
# COMMERCIAL LICENSING POSITION
## GG-COM-001 v1.0

## 1. Executive Position

**Commercial use of the core software foundation is presently supportable.**

The evidence establishes:

- Jared York's `CourseSaucerInvaders` repository is MIT licensed.
- MIT expressly allows use, modification, publication, distribution, sublicensing and sale.
- The required condition is preservation of the copyright and permission notice in copies or substantial portions.
- Phaser is released under the MIT License and may be used in commercial projects.
- The current Galactic Gunners repository contains substantial original/adapted work beyond the small upstream sample.

This does **not** automatically prove the commercial rights of every media asset or font.

---

## 2. Jared York / CourseSaucerInvaders

**Repository:** `jaredyork/CourseSaucerInvaders`  
**Licence:** MIT  
**Copyright:** `Copyright (c) 2019 Jared York`

### Commercial permission

The MIT licence permits the software to be:

- used;
- copied;
- modified;
- merged;
- published;
- distributed;
- sublicensed;
- sold.

### Obligation

The Jared York copyright notice and MIT permission notice must be retained in copies or substantial portions of the derived software.

### Classification

`MIT / PERMISSIVELY LICENSED — ATTRIBUTION/NOTICE RETENTION REQUIRED`

### Important distinction

Galactic Gunners does **not** need to be released as open source merely because it contains MIT-licensed code.

MIT is permissive, not copyleft.

Inceptivec may distribute proprietary code alongside MIT code, provided required MIT notices are preserved.

---

## 3. Phaser

The bundled `assets/js/phaser.js` in Galactic Gunners has Git blob SHA:

`a80489ce3764e3e5e02b602e48ff2cadd9b43266`

This is exactly the same blob SHA as `js/phaser.js` in Jared York's upstream repository.

The bundled file itself contains Phaser source notices identifying:

- Photon Storm Ltd.;
- 2019 copyright statements;
- MIT licence references.

The current official Phaser licensing position also states that Phaser is released under the MIT License and may be used in commercial projects.

### Classification

`MIT / PERMISSIVELY LICENSED — NOTICE RETENTION REQUIRED`

### Stage action

The commercial product must carry an appropriate Phaser notice in `THIRD_PARTY_NOTICES.md`.

The exact bundled Phaser version should be recorded during local execution by inspecting runtime/version metadata from the bundled file. Version must not be guessed.

---

## 4. Inceptivec / Michael Code

The historical repository documents that Michael Leese:

- used Saucer Invaders as a loose basis;
- worked through and extended it;
- scaled and repositioned it;
- added substantial variables and functions;
- rewrote areas;
- created a three-level structure including a boss level;
- added touch/responsive behaviour;
- added game story/presentation and other functionality.

The current commercial repository also contains later commercial additions.

### Classification approach

Original or substantially independently authored Galactic Gunners code:

`OWNED / COMMERCIAL PRODUCT CODE`

Derived code:

`MIT-DERIVED + MODIFIED — RETAIN UPSTREAM NOTICE`

Where line-by-line separation is not economically useful, retain the MIT notice across the product and record the provenance honestly.

---

## 5. Media and Fonts

The historical README states that media came from several sources, including:

- supplied Saucer Invaders assets;
- Phaser examples;
- Pixabay;
- publicdomainpictures.net;
- OpenGameArt;
- pngall.com;
- DeviantArt;
- all-free-download.com;
- freesoundeffects.com;
- Michael-created/modified media.

A statement that something was publicly downloadable or returned by a usage-rights search is not, on its own, adequate present-day commercial evidence.

Therefore:

- exact upstream identical assets may inherit the upstream MIT position **only where the upstream repository licence clearly covers the repository contents and no separate asset licence is identified**;
- assets with clear creator/source licences may be retained with required attribution;
- Michael-created assets may be classified `OWNED` where creation can be reasonably evidenced;
- legacy internet-sourced or otherwise externally sourced non-core assets are to be replaced with newly created Inceptivec-owned equivalents under the dedicated `IP_FREEDOM_LICENSE_PROTECTION_ASSET_CREATION` programme, even where historical use may have been permissible, because the commercial objective is a clean proprietary asset estate rather than minimum legal sufficiency.

---

## 6. Commercial Product Licence Presentation

Recommended product structure:

```text
/NOTICE or /THIRD_PARTY_NOTICES.md
    Jared York MIT notice
    Phaser MIT notice
    any other required third-party notices

/LICENSE
    product licensing statement appropriate to Inceptivec-owned code
    with clear exclusion/recognition of third-party components
```

Do **not** place a bare MIT `LICENSE` at root in a way that accidentally represents the entirety of Inceptivec-owned commercial code as MIT unless that is an intentional Founder decision.

Preferred current position:

> Galactic Gunners proprietary product code and content are reserved to Inceptivec/the applicable rights owner, except for identified third-party components distributed under their respective licences.

Legal/entity wording should be finalised consistently with the then-current legal ownership structure before store release.

---

## 7. Stage Gate

GG-COM-001 licensing closure requires:

- Jared York notice preserved;
- Phaser notice preserved;
- other code dependencies classified;
- all legacy non-core media/font/utility dependencies identified for replacement are either removed/replaced or explicitly tracked into the approved `IP_FREEDOM_LICENSE_PROTECTION_ASSET_CREATION` follow-on pack;
- third-party notice file complete;
- licensing position documented;
- no material asset remains in commercial release scope with unexplained rights provenance.
