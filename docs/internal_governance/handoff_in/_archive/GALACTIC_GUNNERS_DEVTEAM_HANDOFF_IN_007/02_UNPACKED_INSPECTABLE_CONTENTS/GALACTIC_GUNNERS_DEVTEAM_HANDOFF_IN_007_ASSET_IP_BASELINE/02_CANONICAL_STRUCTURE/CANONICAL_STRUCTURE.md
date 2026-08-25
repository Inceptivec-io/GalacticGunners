# CANONICAL ASSET STRUCTURE

Establish one production asset estate at repository root:

```text
assets/
├── README.md
├── OWNERSHIP_PROVENANCE_AND_IP_BASELINE.md
├── registers/
│   ├── GG_ASSET_REGISTER.csv
│   ├── GG_ASSET_PROVENANCE_REGISTER.csv
│   └── GG_FILENAME_RENAME_LOG.csv
├── tools/
│   └── UPDATE_ASSET_REGISTER.ps1
├── audio/
├── fonts/
├── branding/
├── backgrounds/
├── sprites/
├── ui/
├── key_art/
├── platform/
├── source_evidence/
└── _archive/
```

The exact internal subfolders may be refined where the source estate proves a more useful semantic grouping, but the rules below are fixed.

## Rules

- Production-consumable files live in semantic canonical folders.
- Source/master/provenance/support material is distinguishable from runtime-consumable derivatives.
- Legal/provenance evidence does not masquerade as runtime assets.
- Nested transport ZIPs are not runtime authority.
- Redundant source packages are unpacked/classified; opaque transport archives are not retained merely for convenience unless they are themselves a deliberately retained source artifact with a recorded reason.
- `Legacy_Game/assets` remains legacy/reference-only and is not the source for this Step 4 baseline.
- No production code is required to consume the new assets during this handoff. Integration occurs in later build work.
