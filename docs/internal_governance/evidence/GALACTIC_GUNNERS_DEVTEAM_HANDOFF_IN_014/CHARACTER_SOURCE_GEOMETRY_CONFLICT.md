# H014 Character Source Geometry Conflict

Date recorded: 2026-08-27

## Governing Requirement

`04_ASSET_RUNTIME_CONTRACT.md` requires the H014 character normalizer to calculate actual uniform frame dimensions and to fail when it cannot. It also requires true-alpha character derivatives and metadata for every normalized sheet.

## Observed Founder-Supplied Source State

The admitted `assets/platform/player_platform/*.png` and `assets/platform/alien_platform/*.png` inputs were inspected directly.

- All 13 source dimensions are non-uniform and not divisible into 256 px cells.
- Player sources `001` through `007` have alpha extrema `255..255`; they are fully opaque.
- `gg_player_platform_concept_001.png` visibly contains a checkerboard-composited multi-character sheet at `1881×836`, rather than transparent, separable animation frames.
- Alien inputs also lack declared frame geometry and are not uniform sheets.

Representative inventory:

| Source | Dimensions | Alpha extrema | Uniform 256-cell geometry |
|---|---:|---:|---|
| `gg_player_platform_concept_001.png` | 1881×836 | 255..255 | no |
| `gg_player_platform_concept_002.png` | 1983×793 | 255..255 | no |
| `gg_player_platform_concept_004.png` | 2172×724 | 255..255 | no |
| `gg_alien_platform_concept_001.png` | 1831×859 | 255..255 | no |
| `gg_alien_platform_concept_002.png` | 2079×756 | 0..255 | no |
| `gg_alien_platform_concept_006.png` | 2172×724 | 0..255 | no |

## Disposition

The existing `H014_CHARACTER_NORMALIZATION.json` is not sufficient evidence of compliant H014 character derivatives: alpha-bounds cropping of a fully opaque checkerboard canvas retains the checkerboard rather than producing true-alpha frames.

No fabricated frame grid, background-keying threshold, artistic reconstruction, or substitute character asset has been applied. The required authoritative input is either true-alpha source frames/sheets with exact frame metadata, or a Founder-issued deterministic extraction specification that identifies every frame boundary and permitted transparency cleanup rule.

Until that authority is supplied, H014 acceptance row A04 cannot be truthfully marked PASS.
