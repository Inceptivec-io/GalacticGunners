# STEP 4 ACCEPTANCE GATE

Required evidence:

```text
SOURCE_PACKAGE_HASH = PASS
SOURCE_PACKAGE_INVENTORIED = PASS
TRANSPORT_ZIP_COMMITTED = NO

ASSET_ESTATE_INGESTED = PASS
CANONICAL_ASSET_IDS = PASS
CANONICAL_FILENAMES = PASS
SHA256_BASELINE = PASS
RIGHTS_STATUS_CLASSIFIED = PASS
PROVENANCE_CLASSIFIED = PASS
DERIVATIVE_LINEAGE = PASS

ROOT_ASSET_README = CURRENT
OWNERSHIP_PROVENANCE_IP_BASELINE = CURRENT

ASSET_REGISTER = COMPLETE
PROVENANCE_REGISTER = COMPLETE
RENAME_LOG = PRESENT
REGISTER_TOOLING = PASS

UNREGISTERED_PRODUCTION_ASSETS = 0
DUPLICATE_ASSET_IDS = 0
MISSING_REGISTERED_FILES = 0
HASH_MISMATCHES = 0
UNKNOWN_PRODUCTION_RIGHTS = 0

LEGACY_GAME_MUTATED = NO
PRODUCTION_RUNTIME_INTEGRATION_PERFORMED = NO

GOVERNANCE_DEBT_COUNT = 0
```

## Quality

Run all applicable repository quality gates after the asset estate is introduced.

The existing production architecture quality workflow must remain green.

Large binary/source-master additions must be evaluated for repository suitability. Do not introduce Git LFS or external storage policy without Founder/CTO authority. If a file is too large for ordinary Git or creates a material repository constraint, stop and report that exact item rather than silently altering architecture.

## Visual / audio integrity

Do not recompress, resize, regenerate or visually alter Founder-approved masters merely to normalize storage.

Filename/path normalization must not alter bytes.

If a derived runtime asset is later needed, it is created as a derivative under a new lineage record.
