# Input receiving and asset admission

## Required inbound object

| Field | Required value |
|---|---|
| Filename | `GalacticGunners_Imagery_Pack_v1.0_PRODUCTION.zip` |
| SHA-256 | `71a9fdde58bf84f3a01618cdc3cb72211cfe4f5cff4d5154f7455de94ec14930` |
| Role | Production visual input for brand, backgrounds, Boarding, UI, marketing, and source evidence |
| Repository treatment | Preserve in POST_BOX; never commit transport ZIP |

The attached `registers/IMAGERY_PACK_INVENTORY.csv` is the expected 129-file inventory. Recompute it after extraction and fail on any path, byte-size, or hash difference.

## Safe receiving sequence

1. Verify exact filename and outer SHA-256.
2. List ZIP members before extraction. Reject absolute paths, `..` traversal, symlinks, device files, encrypted members, duplicate normalized paths, or unexpected nested archives.
3. Extract to a newly created temporary directory outside the repository.
4. Run malware/secret scanning available in the project environment.
5. Execute the pack's `SHA256SUMS.txt` check from the pack root; every line must pass.
6. Compare the extracted inventory to `registers/IMAGERY_PACK_INVENTORY.csv`.
7. Review `README.md`, ownership/provenance material, source masters, visual previews, and registers.
8. Copy admitted files into the destinations below. Never edit the source evidence copy.
9. Update the repository's existing canonical asset and provenance registers. Pack registers are evidence inputs, not competing canonical authorities.
10. Update asset sync/manifest logic and prove that runtime copies equal canonical sources by hash.

## Admission destinations

| Pack source | Canonical destination |
|---|---|
| `brand/**` | `assets/branding/final_assault_v1.0/**` |
| `backgrounds/**` | `assets/backgrounds/final_assault_v1.0/**` |
| `boarding/backgrounds/**` | `assets/boarding/backgrounds/**` |
| `boarding/tiles/**` | `assets/boarding/tiles/**` |
| `boarding/props/**` | `assets/boarding/props/**` |
| `boarding/pickups/**` | `assets/boarding/pickups/**` |
| `boarding/vfx/**` | `assets/boarding/effects/**` |
| `boarding/transit/**` | `assets/boarding/transit/**` |
| `boarding/ui/**` | `assets/boarding/ui/**` |
| `ui/**` | `assets/ui/final_assault_v1.0/**` |
| `buttons/**` | `assets/ui/final_assault_v1.0/buttons/**` |
| `marketing/**` | `assets/key_art/marketing_v1.0/**` |
| `optional/**` | `assets/optional/final_assault_v1.0/**`; never load in production unless separately referenced |
| `README.md`, `SHA256SUMS.txt`, `register/**`, `source/**`, `previews/**` | `assets/source_evidence/imagery_pack_v1.0/**` |

Preserve filenames unless a runtime-safe rename is necessary. Every rename must be recorded old-to-new with both hashes in the existing filename/asset register mechanism.

## Runtime-use authority

`registers/H014_ASSET_USE_MATRIX.csv` is normative. `active` assets must be loaded by the H014 flow. `admitted-dormant` assets are committed and registered but must not change gameplay. `evidence-only` assets are never shipped as runtime dependencies.

## Character sheet normalization

Use only the repository-owned sources:

- Player: `assets/platform/player_platform/gg_player_platform_concept_001.png` through `_007.png`.
- Alien: `assets/platform/alien_platform/gg_alien_platform_concept_001.png` through `_006.png`.

Concept sheets with baked checker backgrounds are not production-ready. Create deterministic normalized derivatives under `assets/boarding/characters/` with true alpha, edge decontamination, uniform frame cells, and no checker pixels or matte halos. Preserve the original sources. Record source hash, derivative hash, crop bounds, frame count, cell dimensions, pivots, and collider in the canonical register. Do not paint missing anatomy or invent frames.

Required animations: player idle/walk/jump/fire/hit/death; alien idle/walk/fire/hit/death. If the alien lacks a discrete death sheet, the authorised v1 death is the final hit frame with a deterministic clockwise 90-degree rotation and alpha fade over 420 ms. This is code animation, not a new asset.

## Existing audio and projectile reuse

Use repository-owned audio only:

| Event | Canonical audio |
|---|---|
| Boarding entry | `gg_ui_confirm_v001.wav` |
| Return to ship | `gg_ui_back_v001.wav` |
| Player fire | `gg_player_laser_v001.wav` |
| Alien fire | `gg_enemy_laser_v001.wav` |
| Player hit | `gg_player_hit_v001.wav` |
| Alien death | `gg_explosion_small_v001.wav` |
| Timeout/ship loss | `gg_explosion_large_v001.wav` |
| Pickup | `gg_ui_select_v001.wav` |

Use `gg_player_laser_v002.png` and `gg_enemy_laser_v002.png`, rotated for side-view travel at runtime. Do not create replacements.

## Mandatory visual review

Capture lossless browser screenshots at 1280×720 for every state listed in the acceptance matrix. Inspect transparent edges, tile seams, text contrast, cropped sprites, VFX frame slicing, and the damaged/broken crate and barrel states. Any visible guide mark, checker residue, orange mask artifact, seam, or halo is a failure until corrected by non-inventive cleanup or explicitly rejected and made dormant.
