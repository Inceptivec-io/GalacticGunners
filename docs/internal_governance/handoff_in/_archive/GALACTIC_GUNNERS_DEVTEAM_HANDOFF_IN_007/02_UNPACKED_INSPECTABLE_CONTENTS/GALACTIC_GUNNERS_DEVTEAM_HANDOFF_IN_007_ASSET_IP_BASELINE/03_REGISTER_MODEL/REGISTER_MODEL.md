# CANONICAL REGISTER MODEL

Every material asset admitted to the production asset estate must have stable identity independent of filename.

Minimum `GG_ASSET_REGISTER.csv` fields:

```text
asset_id
asset_class
canonical_path
canonical_filename
version
sha256
size_bytes
media_type
width
height
duration_ms
sample_rate_hz
bit_depth
channels
runtime_status
rights_status
provenance_status
source_asset_id
derivative_of_asset_id
supersedes_asset_id
notes
created_or_source_date
registered_date
```

Fields not applicable to an asset may be blank; they must not be fabricated.

`GG_ASSET_PROVENANCE_REGISTER.csv` must record at minimum:

```text
asset_id
provenance_class
source_description
source_package
source_path
source_sha256
creator_or_origin
human_direction_or_contribution
third_party_dependency
licence_or_rights_basis
rights_evidence_path
production_clearance
lineage_notes
```

`GG_FILENAME_RENAME_LOG.csv` must preserve identity across filename changes.

## Stable identity rule

Rename with unchanged bytes:

`SAME ASSET ID + SAME HASH + RENAME LOG`

Content edit/recompression/transformation:

`NEW VERSION OR DERIVATIVE RECORD + NEW HASH + LINEAGE`

Do not use filename as asset identity.

## ID semantics

Use durable semantic classes, not handoff/sprint sequence identifiers.

Examples:

```text
GG-BRAND-LOGO-PRIMARY-001
GG-BG-STARFIELD-LANDSCAPE-001
GG-SPR-PLAYER-SHIP-001
GG-SFX-PLAYER-LASER-001
GG-FONT-DISPLAY-001
GG-KEYART-PAUSE-001
GG-PLATFORM-PLAYER-001
```

Exact scheme must be documented and deterministic.
