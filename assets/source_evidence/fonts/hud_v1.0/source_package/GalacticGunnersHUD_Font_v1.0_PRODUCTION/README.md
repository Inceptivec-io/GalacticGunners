# Galactic Gunners HUD — Production Pack v1.0

Vector display font reconstructed from the supplied approved production type specimen.

## Included

- `fonts/GalacticGunnersHUD-Regular.otf` — desktop/OpenType build.
- `fonts/GalacticGunnersHUD-Regular.ttf` — desktop and game-engine TrueType build.
- `web/GalacticGunnersHUD-Regular.woff` — compressed webfont.
- `web/GalacticGunnersHUD-Regular.css` — ready-to-use `@font-face` declaration.
- `specimens/GalacticGunnersHUD-Regular_4K_SPECIMEN.png` — 3840×2160 visual QA specimen.
- `specimens/GalacticGunnersHUD-Regular_4K_TRANSPARENT.png` — transparent 4K rendering sheet.
- `source/glyph_metrics.json` — deterministic glyph widths and Unicode mapping.

## Character coverage

Approved A–Z and 0–9 silhouettes, lowercase keyboard mappings to the uppercase display forms,
ASCII punctuation, copyright, registered, en dash, em dash and bullet.

## Usage

Install the OTF or TTF for desktop tools. For games, load the TTF at runtime and render with
uppercase text. For websites, copy the `web` folder and import the CSS file.

The font is resolution-independent. “4K” applies to the included specimen renders; the OTF/TTF
remain sharp at any output size. Metallic orange bevel and glow are material effects and should
be applied by the game/UI renderer rather than baked into the outline font.

Recommended display settings: tracking 0.04em; line height 1.1; avoid synthetic bold/italic.
