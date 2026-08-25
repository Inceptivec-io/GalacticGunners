HANDOFF / COMMISSION:
GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_007

PURPOSE:
STEP 4 — ASSET / IP BASELINE

REPOSITORY:
Inceptivec-io/GalacticGunners

BASE:
feature/production-architecture-foundation

BASE / ENTRY SHA:
28cb3a9596962e4e29a0f959351d6b467613a2d3

EXECUTION BRANCH:
feature/asset-ip-baseline

INPUT:
Use the exact Founder-supplied Galactic Gunners asset/IP estate already present in the Development POST_BOX.

DO NOT REQUEST, CREATE OR COMMIT A DUPLICATE COPY.

EXPECTED INPUT SHA-256:
dc1f9ba259075364cf2a19c9be2aa48a83ea61735dbb3c2c248e0041005b8fca

FIRST ACTION:
1. Read root AGENTS.md and current Step 4 authority.
2. Fetch/reconcile branch and entry SHA.
3. Verify clean/known worktree state.
4. Identify the existing POST_BOX payload.
5. Hash it independently.
6. Compare to expected SHA-256.
7. If hash differs: STOP — SOURCE_PACKAGE_HASH_MISMATCH.

DO NOT MUTATE THE RECEIVED SOURCE PACKAGE.

============================================================
REQUIRED OUTCOME
============================================================

Establish one canonical production asset estate under repository-root:

assets/

Required core outputs:

assets/README.md

assets/OWNERSHIP_PROVENANCE_AND_IP_BASELINE.md

assets/registers/GG_ASSET_REGISTER.csv

assets/registers/GG_ASSET_PROVENANCE_REGISTER.csv

assets/registers/GG_FILENAME_RENAME_LOG.csv

assets/tools/UPDATE_ASSET_REGISTER.ps1

and the canonically organised admitted asset estate.

============================================================
IMPORTANT SOURCE FACTS
============================================================

CTO inspection found:

283 source files.

The supplied estate contains:
- audio;
- production fonts;
- images;
- branding/logo material;
- backgrounds;
- sprites;
- UI assets;
- key art/posters;
- platform/boarding imagery;
- visual-rights evidence;
- ownership/provenance material;
- registers;
- hash manifests;
- register-update tooling.

The existing visual-rights register contains only 8 records.

IT IS NOT THE COMPLETE CANONICAL REGISTER.

Build the canonical register for the WHOLE admitted estate.

Do not blindly copy the source directory tree.

============================================================
CANONICAL IDENTITY
============================================================

Every admitted material asset requires stable Asset ID.

Asset ID != filename.

Rename with same bytes:
SAME ID
SAME HASH
RENAME LOG

Edited/recompressed/transformed asset:
NEW VERSION OR DERIVATIVE RECORD
NEW HASH
LINEAGE REQUIRED

Use semantic durable IDs.

Do not place Handoff/Sprint sequence numbers into permanent production asset identities.

============================================================
RIGHTS / PROVENANCE
============================================================

Classify each admitted item using controlled provenance states including:

FOUNDER_PROJECT_OWNED_OUTPUT
PROJECT_DIRECTED_AI_ASSISTED_OUTPUT
FOUNDER_SUPPLIED_SOURCE_REFERENCE
DERIVATIVE_OF_PROJECT_SOURCE
THIRD_PARTY_LICENSED
OPEN_SOURCE_PERMISSIVE
HISTORICAL_REFERENCE_ONLY
UNKNOWN_HOLD

Rights status is separate from provenance.

Preserve supplied source declarations.

Do not fabricate:
- signatures;
- legal assignments;
- legal entity names;
- licences;
- copyright registrations;
- legal opinions.

Do not silently upgrade unresolved source evidence.

The source rights pack contains some records marked:
"Project output - rights-holder declaration required"

and one source/reference status:
"Background rights to be confirmed by rights holder"

Reconcile these honestly in the canonical engineering baseline.

Any genuinely uncertain third-party item:
UNKNOWN_HOLD or REFERENCE_ONLY.

EXIT REQUIREMENT:
UNKNOWN_PRODUCTION_RIGHTS = 0

Meaning:
nothing with genuinely unknown rights may be marked active production-cleared.

============================================================
CANONICAL STRUCTURE
============================================================

Use the semantic structure commissioned in Handoff 007.

Production-consumable assets must be clearly separated from:
- source evidence;
- legal/provenance documents;
- previews;
- source/master construction inputs;
- archive/reference-only items.

Do not make nested transport ZIPs production runtime authority.

Do not retain opaque transport packages without a recorded source-artifact reason.

Do not commit the POST_BOX transport ZIP.

============================================================
FILENAMES
============================================================

Normalize non-canonical filenames where necessary.

The inspected pack includes platform images named like:

ChatGPT Image ...

Those are not acceptable permanent production filenames.

Rename them semantically WITHOUT changing bytes.

Record:
Asset ID
old filename
new filename
unchanged SHA-256

Do not infer content lineage solely from filenames.

============================================================
AUDIO
============================================================

Preserve the supplied REV2 audio provenance/design authority.

It states:
- procedural Galactic Gunners generation;
- no third-party recordings;
- no commercial sample libraries;
- 48 kHz / 24-bit PCM stereo baseline.

Do not regenerate or normalize audio in this handoff.

============================================================
FONTS
============================================================

Preserve production font ownership/provenance evidence.

Where supplied declarations identify Inceptivec as owner, record that source evidence accurately.

Distinguish:
- production font binaries;
- web derivatives;
- specimen/previews;
- glyph source masks/RGBA;
- manifests/provenance.

Do not treat every source glyph PNG as a runtime font asset.

============================================================
VISUAL RIGHTS PACK
============================================================

Use the supplied rights pack as SOURCE EVIDENCE.

Do not blindly promote its README into canonical documentation.

It contains exported conversational text and legal caution/template material.

Canonical repository truth must be newly reconciled into:

assets/README.md

and

assets/OWNERSHIP_PROVENANCE_AND_IP_BASELINE.md

The formal baseline is engineering/governance provenance truth, NOT legal advice.

============================================================
REGISTER TOOLING
============================================================

Harden the supplied PowerShell register tool for the canonical repository model.

It must fail closed on:
- unknown Asset ID;
- path collision;
- hash mismatch;
- duplicate identity;
- invalid rename;
- content mutation being presented as rename-only.

Add verification capability sufficient to prove:
UNREGISTERED_PRODUCTION_ASSETS = 0
MISSING_REGISTERED_FILES = 0
HASH_MISMATCHES = 0
DUPLICATE_ASSET_IDS = 0
UNKNOWN_PRODUCTION_RIGHTS = 0

============================================================
DO NOT DO
============================================================

DO NOT:
- mutate Legacy_Game;
- integrate assets into gameplay/runtime;
- refactor production architecture;
- start Step 5;
- regenerate Founder-approved assets;
- recompress/resize approved masters;
- invent rights;
- add Git LFS without authority;
- merge the PR.

============================================================
POST_BOX
============================================================

Follow governed receiving:

RECEIVE
HASH
INVENTORY
UNPACK
CLASSIFY
PLACE CANONICALLY
RECORD SOURCE HASH / MEMBER PROVENANCE / DISPOSITION
VERIFY
REMOVE TRANSPORT PAYLOAD WHEN GOVERNED RECEIVING IS COMPLETE

POST_BOX returns to boundary controls only.

Do not keep the ZIP in repository history.

============================================================
ACCEPTANCE
============================================================

Required:

SOURCE_PACKAGE_HASH = PASS
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
REGISTER_TOOLING = PASS
UNREGISTERED_PRODUCTION_ASSETS = 0
DUPLICATE_ASSET_IDS = 0
MISSING_REGISTERED_FILES = 0
HASH_MISMATCHES = 0
UNKNOWN_PRODUCTION_RIGHTS = 0
LEGACY_GAME_MUTATED = NO
PRODUCTION_RUNTIME_INTEGRATION_PERFORMED = NO
GOVERNANCE_DEBT_COUNT = 0

Run repository quality checks and CI.

============================================================
PR
============================================================

Open one PR:

HEAD:
feature/asset-ip-baseline

BASE:
feature/production-architecture-foundation

TITLE:
Establish Galactic Gunners production asset and IP baseline

Leave:
OPEN
DRAFT
NOT MERGED

============================================================
RETURN
============================================================

Return:

GALACTIC_GUNNERS_DEVTEAM_HANDOFF_OUT_007

Include:
- entry/final SHAs;
- input hash verification;
- inventory and disposition counts;
- Asset ID count;
- rights/provenance counts;
- lineage count;
- rename count;
- source-to-canonical mapping evidence;
- hash/register verification;
- unknown production-rights count;
- runtime integration count;
- Legacy_Game mutation check;
- quality/CI;
- PR number/URL/state;
- local==remote;
- clean worktree;
- POST_BOX state;
- sealed return SHA-256.

DO NOT MERGE.

RETURN FOR CTO / FOUNDER REVIEW.
