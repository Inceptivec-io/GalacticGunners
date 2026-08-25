# AUDIO SOURCE / REPOSITORY POLICY

## Source

The WAV files in this Handoff are the current Founder-accepted owned audio source.

Technical baseline:

```text
48 kHz
24-bit PCM
stereo
```

## Repository placement

Runtime-ready WAVs must be stored in the project's purposeful runtime audio location, following existing repository convention.

Do not create a redundant second canonical runtime audio tree.

Audio design/provenance documents belong in the appropriate inspectable project governance/provenance location.

## Transport rule

This APP1 ZIP is transport only.

Required:

```text
HASH
→ INVENTORY
→ UNPACK
→ CANONICAL PLACEMENT
→ PROVENANCE RECORD
→ VERIFY
→ REMOVE TRANSPORT ZIP
```

Do not preserve this ZIP inside the repository.

Do not create Git LFS merely for the transport ZIP.

## Legacy audio disposition

Inspect existing audio estate.

For each pre-existing audio file classify:

```text
REPLACED_BY_OWNED_AUDIO
LEGITIMATE_RETAINED_DEPENDENCY
STILL_REQUIRED_UNCHANGED
UNUSED_LEGACY
UNKNOWN
```

For replaced/unused legacy runtime audio:
- remove from active runtime references;
- remove file if no longer purposeful and preservation is not required;
- record disposition in the asset/IP provenance record.

For legitimate MIT/upstream material:
- it may remain if still purposeful;
- do not delete merely because it is third-party;
- but do not keep dead files without reason.

UNKNOWN blocks deletion until classified.

Target:

```text
UNEXPLAINED_RUNTIME_AUDIO = 0
DEAD_AUDIO_REFERENCES = 0
```
