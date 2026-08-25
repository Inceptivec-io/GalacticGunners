# INBOUND PRESERVATION / POST_BOX CLEARANCE

For each of the three Founder-supplied ZIPs:

1. calculate SHA-256;
2. inventory ZIP members;
3. preserve immutable source under:

```text
docs/internal_governance/handoff_in/_archive/
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_003/
```

Use exact substructure:

```text
docs/internal_governance/handoff_in/_archive/
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_003/
├── 00_RECEIVING_RECORD.md
├── 01_SOURCE_AS_RECEIVED/
│   ├── GALACTIC_GUNNERS_ASSET_ALIGNMENT_AND_IMPLEMENTATION_PACK_v1.0.zip
│   ├── GALACTIC_GUNNERS_MASTER_ROADMAP_AND_PLAYLIST_v1.0.zip
│   └── GalacticGunners_ASSETS.zip
└── 02_INVENTORY/
    ├── ASSET_ALIGNMENT_PACK_CONTENTS.txt
    ├── ROADMAP_PLAYLIST_PACK_CONTENTS.txt
    ├── ASSET_ARCHIVE_CONTENTS.txt
    └── INPUT_SHA256.txt
```

4. register all three inputs in Handoff/Evidence registers;
5. unpack authorised working copies outside POST_BOX;
6. use the working copies;
7. after governed preservation/consumption, remove all three transient ZIPs from POST_BOX.

## Closed POST_BOX state

Exactly:

```text
_EXTERNAL_GalacticGunners/
└── _GalacticGunners_MAIN_POST_BOX/
    ├── BOUNDARY.md
    ├── README.md
    └── _WORK_00000001_POST_BOX/
        ├── BOUNDARY.md
        └── README.md
```

Forbidden at closure:
- ZIPs;
- `_archive`;
- `handoff_in`;
- `handoff_out`;
- `evidence`;
- `registers`;
- unpacked assets;
- working copies;
- manifests.

Durable material belongs under `docs/internal_governance/`.
