# Production Asset Integration Specification

## Source authority

The Founder imagery transport retained after H014 has SHA-256:

`71A9FDDE58BF84F3A01618CDC3CB72211CFE4F5CFF4D5154F7455DE94EC14930`

H014 admitted 129 imagery-pack files and recorded 128 internal asset checksums. H015 shall use the admitted canonical copies and records; it shall not recommit the transport ZIP or create a second asset estate.

## Required visible use

- Campaign Designer canvas: actual selected player/enemy/bunker/shield/pickup/anchor imagery.
- Asset chooser: generated thumbnails from the registered canonical asset.
- Boarding: production character frames, backgrounds, walls/floors/platforms, doors, containers, pickups, effects and HUD.
- Public shell/game: preserve existing production logo/background/HUD/terminal art.

Text labels may supplement assets but may not stand in for available production artwork.

## Character contact-sheet correction

H014 evidence identified fully opaque checkerboard character sheets without valid uniform Phaser frame geometry. H015 must resolve them rather than rendering a whole sheet as one sprite.

Permitted deterministic processing:

1. preserve source unchanged;
2. detect checkerboard colours from verified background-only regions;
3. create an alpha mask with tolerance and connected-component cleanup;
4. remove background while preserving character pixels and edge anti-aliasing;
5. segment character poses into named frames using detected bounds/manual governed frame map;
6. normalize each frame to one transparent canvas, consistent foot baseline/origin and padding;
7. generate animation metadata and contact-sheet/frame checksums;
8. visually inspect every frame at original and runtime scale;
9. register derivatives with `derived_from`, method/version and checksum.

Do not generate new character design, substitute unrelated AI artwork or erase provenance. If one source pose cannot be separated without materially changing the character, record the exact asset/frame as blocked and use another valid admitted pose only where the animation remains truthful; this is a genuine asset blocker, not permission to use checkerboard rectangles.

## Asset registry rules

- Stable AssetRecord UUID is the config reference.
- Runtime/thumbnail path is resolved server/client-side from an authorised record.
- Dimensions, frames, origin, collider, animation and checksum must match actual bytes.
- Retired/missing/checksum-invalid asset blocks draft validation/publish.
- CORE assets are readable by all games when their use rights permit, but writable only through core asset authority.
- Organisation/user assets remain isolated and require future upload security; H015 need not expose public binary upload if it cannot meet scanning/provenance requirements. Catalogue/database foundations and existing CORE selection are mandatory.

## Evidence

Capture asset chooser for at least one item in every required category, actual canvas placements, Shooter Level 1/2/4/6, and Boarding entry/gameplay/result. Automated checks verify HTTP 200, decoded dimensions, checksum, alpha/frame geometry and no missing runtime texture keys.
