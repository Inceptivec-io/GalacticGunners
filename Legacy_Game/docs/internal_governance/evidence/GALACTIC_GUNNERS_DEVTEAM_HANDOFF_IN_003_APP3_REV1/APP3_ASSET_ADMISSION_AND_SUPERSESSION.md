# APP3 Asset Admission and Supersession

Handoff: GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_003_APP3_REV1
Branch: feature/GG-COM-001
Entry SHA: 5ccd915ab9e11ff53ad1ae247fbe5a0c87710d43

## Intake

Founder-supplied APP3 POST_BOX payload was hashed and inventoried under eceiving/ before runtime mutation.

## Active Runtime Admission

Active admitted asset/font hashes are recorded in sset_admission/APP3_ACTIVE_ASSET_SHA256.csv.

## Superseded Active Runtime Assets

The previously active APP2 sprite/result assets superseded by APP3 were preserved under ssets/images/owned/_archive/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_003_APP3_REV1/ and inventoried in sset_admission/APP3_SUPERSEDED_ACTIVE_ARCHIVE_SHA256.csv.

## Runtime Corrections

- Player sprite animation is frame-stable and no longer cycles malformed neighbouring frames.
- Scout/player sheet extraction dimensions are explicitly verified by runtime semantic evidence.
- Latest comet, explosion, nuke projectile, nuke burst and victory panel art are active.
- Corrected game-over button state assets are active.
- Gold/silver production fonts are active for title/result surfaces.
- Favicon source remains the settled HUD life icon and was not revisited.

## Verification

Runtime semantic proof is recorded in untime_semantic/APP3_SEMANTIC_RUNTIME_REPORT.json with screenshots for menu, gameplay/projectiles/FX, victory and game-over.
