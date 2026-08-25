# REGISTER TOOLING

The supplied PowerShell update tool is useful source material but must be hardened against the canonical repository model.

Required capabilities:

- resolve canonical asset root;
- validate Asset ID uniqueness;
- validate canonical path uniqueness;
- validate SHA-256 after rename/move;
- preserve previous filenames;
- append rename-log evidence;
- refuse overwriting existing destination;
- refuse unknown Asset ID;
- fail closed on hash mismatch;
- preserve derivative/version rules;
- deterministic CSV output ordering/encoding;
- dry-run / `WhatIf` support where practical;
- clear non-zero failure behaviour.

The tool must never convert a content mutation into a rename-only event.

Add a verification mode or companion script if needed to:
- recompute hashes;
- detect missing registered files;
- detect unregistered production files;
- detect duplicate Asset IDs;
- detect conflicting hashes/paths;
- detect active assets with unresolved rights.

Tooling must not rename/mutate the source POST_BOX payload.
