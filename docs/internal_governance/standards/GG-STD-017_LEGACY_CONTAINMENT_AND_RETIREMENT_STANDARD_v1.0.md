# GG-STD-017 Legacy Containment and Retirement Standard v1.0

`Legacy_Game/` is a temporary bounded behavioural reference during production migration.

Rules:
- no new product capability is developed there after GGF-1 freeze except critical baseline regression repair explicitly authorised;
- production code is copied/reimplemented only through semantic behaviour contracts and tests;
- legacy globals/names are not automatically inherited;
- the exact Founder-accepted baseline HEAD is recorded before merge to `dev`;
- retirement requires complete accepted production behavioural coverage and explicit Founder / Secuvara CTAIO authority;
- retirement removes the folder from the production repository while preserving Git history and governed baseline records.
