# RIGHTS / PROVENANCE MODEL

Canonical provenance classifications:

- `FOUNDER_PROJECT_OWNED_OUTPUT`
- `PROJECT_DIRECTED_AI_ASSISTED_OUTPUT`
- `FOUNDER_SUPPLIED_SOURCE_REFERENCE`
- `DERIVATIVE_OF_PROJECT_SOURCE`
- `THIRD_PARTY_LICENSED`
- `OPEN_SOURCE_PERMISSIVE`
- `HISTORICAL_REFERENCE_ONLY`
- `UNKNOWN_HOLD`

Rights status must be separate from provenance class.

Recommended rights states:

- `CLEARED_PROJECT_USE`
- `CLEARED_WITH_LICENCE_OBLIGATIONS`
- `REFERENCE_ONLY`
- `FOUNDER_CONFIRMATION_REQUIRED`
- `CONTRIBUTOR_ASSIGNMENT_REQUIRED`
- `UNKNOWN_HOLD`
- `SUPERSEDED_ARCHIVE_ONLY`

## Source declarations

Preserve the supplied audio provenance statement: the REV2 audio estate states it was procedurally generated for Galactic Gunners without third-party recordings or commercial sample libraries.

Preserve supplied font ownership declarations that identify Inceptivec as owner.

Preserve the visual-rights source records and their hashes as evidence.

Do not silently upgrade an unresolved source record to an absolute legal conclusion.

In particular, the inspected visual register contains records whose source rights status says:
- `Project output - rights-holder declaration required`
- `Background rights to be confirmed by rights holder`

Those source statements must be reconciled through the Founder-controlled baseline, not erased.

The canonical engineering baseline may state project control/commercial-use authority where supported by Founder direction and source evidence, but it must not invent:
- signatures;
- assignments;
- legal entity names not supplied;
- third-party licences;
- copyright registrations;
- legal opinions.

Unresolved legal paperwork may be recorded as a governance/documentation follow-up without automatically blocking use where commercial-use authority is otherwise established, but any genuinely uncertain third-party source must remain `UNKNOWN_HOLD` or `REFERENCE_ONLY`.

## Production gate

At Step 4 closure:

`UNKNOWN_PRODUCTION_RIGHTS = 0`

This means no asset with genuinely unknown rights may be marked active/production-cleared.

Unknown or unresolved items may remain in evidence/archive/reference status, but not as production authority.
