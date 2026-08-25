# Galactic Gunners Ownership, Provenance And IP Baseline

## Scope

This baseline records the Founder-supplied Galactic Gunners asset estate admitted under `GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_007`. It covers the project asset root, canonical registers, source evidence, filename normalization and rights/provenance classification for the asset/IP baseline branch.

## Input Authority

The controlling source package is `GalacticGunners.zip` with SHA-256 `DC1F9BA259075364CF2A19C9BE2AA48A83EA61735DBB3C2C248E0041005B8FCA`, received through the governed POST_BOX. The companion instruction pack is `GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_007_ASSET_IP_BASELINE_PACK.zip` with SHA-256 `DD47A5CEAC9A135929CBF4717760005B5405E3737EFEAE8C01E63912DAFA54EC`.

## Nature Of This Record

This is an engineering and governance provenance baseline. It records project control, source custody, classifications, hashes, lineage and change-control rules. It is not a legal opinion and does not replace Founder, CTO or legal acceptance.

## Commercial Control And Provenance

Active production assets in this baseline are classified as Founder-supplied project assets for Galactic Gunners. Source evidence, partial historical registers and legal/provenance templates are retained as inspectable evidence and are not treated as competing living registers.

## Project-Owned And Project-Directed Assets

Audio and production fonts are treated as Founder project-owned output according to the supplied estate and declarations. Visual, UI, sprite, platform and key-art assets are treated as project-directed output admitted by Founder authority. Where AI-assisted origin is indicated or reasonably inferable from the source packaging, the active classification is project-directed AI-assisted output under Founder supply and selection.

## Contributor, Open-Source And Third-Party Material

No third-party runtime asset dependency is admitted by this baseline for active production assets. Any later contributor-created or third-party asset must be admitted through the same register model with explicit rights evidence before production use. Historical, uncertain or reference-only material remains outside active production clearance.

## Source Reference And Evidence Material

Files under `assets/source_evidence/` preserve inspectable source documents, manifests, proofs, glyph/source material and partial source registers. They are evidence/reference material, not live production runtime references.

## Lineage And Asset IDs

Each admitted file receives a stable canonical Asset ID in `assets/registers/GG_ASSET_REGISTER.csv`. IDs are semantic and path-based, not tied to a sprint or handoff sequence. Source package path, SHA-256 and lineage are recorded in `assets/registers/GG_ASSET_PROVENANCE_REGISTER.csv` and `docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_007/asset_ip_baseline/SOURCE_TO_CANONICAL_MAPPING.csv`.

## Filename, Hash And Version Policy

Canonical filenames use stable lowercase snake-case where normalization is required. Bytes are not recompressed, resized, regenerated or visually altered by this baseline. Every canonical file hash is computed from its admitted repository path.

## Supersession And Archive Policy

Superseded project assets must move to the appropriate `_archive/` surface with register updates before replacement. Transport ZIPs are intake-only and must not be committed as permanent evidence unless a later Founder/CTO authority explicitly changes that rule.

## Production-Clearance Rule

No asset may be marked `ACTIVE_PRODUCTION` unless its rights status is classified as production-cleared. Files with unknown, reference-only or contributor-confirmation status must remain non-production until resolved.

## Relationship To Legacy_Game

`Legacy_Game/` remains a contained historical source estate. This baseline does not mutate `Legacy_Game/` and does not make runtime references to it.

## Relationship To Runtime Integration

This handoff establishes the asset/IP baseline only. It does not integrate these assets into production runtime code. Later runtime work must reference this baseline and update the registers as assets become active dependencies.

## Change Control

Future asset moves, renames, replacements and derivative creation must be performed through the project register model and validated with `assets/tools/UPDATE_ASSET_REGISTER.ps1 -Verify`.
