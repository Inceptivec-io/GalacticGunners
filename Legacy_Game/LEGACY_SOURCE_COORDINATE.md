# Galactic Gunners Legacy Source Coordinate

This directory is the contained legacy implementation used as the behavioural, historical and migration reference for the production architecture.

## Source authority

Source branch: `feature/GG-COM-001`

Source branch state synchronised for Step 3: `6cda67a3c539ae85d769a571eb4f5299ed9bc4e6`

Accepted v0.1 behavioural/runtime coordinate: `1539395a6e2eb3a8a0a571692c5425122ae0b82e`

The commits after the behavioural coordinate on the legacy branch are governance/currentness closure records and do not redefine the accepted gameplay baseline.

Historical educational provenance repository: `michael-leese/GallacticGunners`.

Commercial repository: `Inceptivec-io/GalacticGunners`.

## Authority status

`Legacy_Game/` is reference material only. It is not the production runtime authority for the v1.0 build.

Its purposes are:
- behavioural comparison;
- provenance and historical continuity;
- migration reference;
- regression reference;
- evidence of the accepted legacy implementation.

Known non-blocking legacy limitations accepted at v0.1 include nuke interaction/lifecycle imperfections and occasional collision-boundary inconsistencies.

Production migration must use `EXTRACT -> TYPE -> TEST -> PRESERVE BEHAVIOUR` and must not blindly reproduce known legacy defects.
