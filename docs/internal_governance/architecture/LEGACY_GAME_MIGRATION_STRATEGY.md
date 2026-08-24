# Legacy Game Migration Strategy

1. Freeze exact Founder-accepted GGF-1 HEAD.
2. Synchronise `Legacy_Game/` to that exact state.
3. Inventory behaviour, state, scenes, entities, inputs, audio, scoring and collisions.
4. Migrate one bounded semantic capability at a time.
5. Prove behavioural equivalence against accepted fixtures.
6. Keep standards/guides/schemas/currentness updated in the same change.
7. Retire `Legacy_Game/` only after complete production coverage and Founder authority.

Current branch snapshot is provisional at `5b91bed73ce8846ec577575dab10de1527084820` pending final REV3 GGF-1 acceptance.
