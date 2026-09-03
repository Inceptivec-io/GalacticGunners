# GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_015
## Platform Foundation, Campaign Continuity and Boarding Completion

**Authority:** Founder Michael / Secuvara CTAIO  
**Repository:** `Inceptivec-io/GalacticGunners`  
**Entry branch:** `dev`  
**Entry SHA:** `3270be64c67863dc848ebad26e2a33daf8b70742`  
**Required feature branch:** `feature/v1-platform-foundation-campaign-continuity`  
**Required PR base:** `dev`  
**Execution status:** AUTHORISED ON RECEIPT  
**Merge authority:** Founder only

This pack is the complete H015 construction authority. It supersedes the former use of H015 for native-client packaging. Native clients move to H016, commercial release operations to H017, and final regression/release to H018.

## Founder routing message

Development shall receive, preserve, hash, inventory and execute this pack as `GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_015`.

Create `feature/v1-platform-foundation-campaign-continuity` from exact `dev` SHA `3270be64c67863dc848ebad26e2a33daf8b70742`. Do not continue on the merged H014 branch. Open one draft PR to `dev`; Development must not merge it.

H015 closes the platform and runtime defects accepted for carry-forward from H014 while establishing a protected but deliberately simple Inceptivec Gamification foundation. Preserve the accepted visual direction. Do not redesign the Campaign Designer shell.

The official Galactic Gunners campaign is one canonical `CORE` game controlled by Platform Owner authority. Organisations and users may own isolated custom games and maps, but cannot mutate global Levels 1–6 or gain platform authority. Paid connected-app capability is represented by entitlements; billing, marketplace, enterprise SSO and multiplayer are not built in H015.

Development must implement the supplied models, constraints, APIs, schemas, state transitions, page behaviour, hostile tests and evidence gates. Refinement is permitted only where it preserves these semantics. Do not stop for a product decision already answered by this pack.

## Mandatory outcome

H015 is complete only when:

- an unauthenticated visitor cannot see a privileged shell and is sent to explicit login;
- Platform Owner, platform operations, organisation and player boundaries are enforced server-side;
- the Campaign Designer loads database content and uses an image-driven chooser with drag/drop;
- official Levels 1–6 are distinct, published database configurations and packaged fallbacks;
- Continue preserves cumulative score, lives, nukes, progression and run lineage;
- anonymous play remains free and unranked;
- registration/login with a case-insensitively unique username can claim only the caller's already server-validated anonymous campaign;
- Shooter and Boarding definitions are versioned database authority;
- the production imagery pack is visibly used in runtime and administration previews;
- H014 Boarding gaps are completed, including server replay/validation and exact Shooter restore;
- all required browser, API, hostile, Docker and CI gates pass at the returned SHA.

## Pack map

| Path | Authority |
|---|---|
| `01_ENTRY_AUTHORITY_AND_BOUNDARIES.md` | ancestry, receiving, exclusions and stop conditions |
| `02_PLANNING/` | sole proposed Roadmap/Playlist v1.3 currentness update |
| `03_ARCHITECTURE/` | exact domain, ownership, persistence and state models |
| `04_CONTRACTS/` | machine-readable H015 schemas and OpenAPI authority |
| `05_UI_UX/` | routes, page states and Campaign Designer interaction |
| `06_RUNTIME_AND_ASSETS/` | Shooter, Boarding and artwork integration corrections |
| `07_VALIDATION/` | test matrix and acceptance gates |
| `08_EXECUTION/` | ordered construction and return protocol |
| `09_GOVERNANCE/` | H014 reconciliation and programme resequencing |
| `MANIFEST_SHA256.json` | non-self-referential file inventory and hashes |

## Interpretation

`MUST`, `SHALL` and `REQUIRED` are acceptance conditions. `MAY` is permitted but optional. Later/future statements preserve compatibility only and grant no execution authority.

