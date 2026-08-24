# Galactic Gunners Legacy Game

This directory contains the provisional behavioural legacy runtime snapshot used during GGF-2 Production Application Architecture Formation.

## Purpose

The legacy implementation is retained temporarily so that the production architecture can reproduce accepted gameplay, timing, scoring, controls, collision behaviour, visual treatment and audio without destructive in-place rewriting.

## Authority

This directory is **not** the production architecture and must not become the location for new product capability. The production implementation lives under `apps/`, `game/`, `backend/` and `packages/`.

The provisional snapshot in this branch originates from commit `5b91bed73ce8846ec577575dab10de1527084820`. Before this architecture branch is eligible to merge into `dev`, this directory must be resynchronised to the exact Founder-accepted GGF-1 baseline HEAD produced by the final legacy-runtime stabilisation movement.

## Migration rule

Copy or reimplement behaviour from here into the production structures only through explicit behavioural contracts and tests. Do not move arbitrary global state or historical naming into the new architecture merely because it existed here.

## Retirement

`Legacy_Game/` is temporary. It may be removed only when the production implementation has complete accepted behavioural coverage and the Founder / Secuvara CTAIO authorises retirement.
