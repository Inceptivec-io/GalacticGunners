# Asset runtime contract

## Coordinate and rendering rules

- All Boarding world measurements use integer pixels in a 4096×720 world and 64 px logical grid.
- Tile art has a 256 px denominator and is rendered on integer coordinates without filtering seams. Collision geometry uses 64 px cells independent of decorative pixels.
- Backgrounds cover room segments without affecting collision.
- VFX sheets are 2048×256, sliced into eight 256×256 frames left-to-right unless the admitted register proves otherwise.
- UI numerical fields remain separate live text; never bake dynamic timer, lives, nukes, or tally values into imagery.
- Use nearest-neighbor sampling for pixel-art characters/projectiles and the pack's intended smoothing for painted backgrounds/UI. Do not mix sampling modes within one sprite.

## Production character derivatives

Create one metadata JSON beside every normalized sheet:

```json
{
  "schema_version": 1,
  "source_path": "assets/platform/player_platform/gg_player_platform_concept_002.png",
  "source_sha256": "<64 lowercase hex>",
  "output_sha256": "<64 lowercase hex>",
  "animation": "walk",
  "frame_count": 8,
  "frame_width_px": 256,
  "frame_height_px": 256,
  "origin": {"x": 0.5, "y": 1.0},
  "collider": {"width_px": 54, "height_px": 118, "offset_x_px": -27, "offset_y_px": -118},
  "cleanup": "alpha-extraction-and-edge-decontamination"
}
```

The example dimensions describe the required metadata shape, not permission to lie about source geometry. The normalizer must calculate actual uniform frame dimensions and fail if it cannot. Runtime scale sets the displayed player height to 128 px and alien height to 112 px. Origin is bottom-center. The world collider remains player 54×118 px and alien 52×102 px regardless of transparent padding.

## Active map assets

The fixture in `fixtures/interior-alien-frigate-v1.json` defines exact consumers. Use the three admitted Boarding backgrounds in order: airlock/corridor, cargo, engineering/exit. Tile/wall/module assets build floors, ceilings, bulkheads, and room transitions. Door closed/open states animate only by explicit state swap. Crate/barrel intact/damaged/broken states progress on hit; broken is terminal.

## UI states

- Use the admitted Boarding HUD frame with live lives/nukes/timer overlays.
- Use warning art during the final 10,000 ms, with deterministic 500 ms visible/hidden cadence.
- Use the tally panel on success only; show aliens killed, containers opened, lives found, and nukes found. Score is not displayed or modified in the Boarding tally.
- Use `Board Ship` OFF/ON for availability/pressed state and `Return to Ship` OFF/ON for exit availability/pressed state.
- Every interactive image has a programmatic accessible name and keyboard focus equivalent in the web shell.

## Runtime manifest

Extend the existing asset synchronization mechanism; do not add an ad hoc copy step. The runtime manifest records canonical path, runtime path, SHA-256, media type, dimensions, frame geometry, consumer, and admission status. CI fails when a referenced runtime asset is missing, stale, unregistered, or hash-divergent.
