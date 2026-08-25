# EXACT IMPLEMENTATION

Required target shape:

```text
/
├── apps/
├── backend/
├── game/
├── packages/
├── docs/
├── scripts/
├── Legacy_Game/
│   ├── README.md
│   ├── LEGACY_SOURCE_COORDINATE.md
│   └── [complete closed legacy branch estate]
├── AGENTS.md
├── LICENSE
├── THIRD_PARTY_NOTICES.md
└── ...
```

Rules:

1. The complete source tree represented by `feature/GG-COM-001` at `6cda67...` must be present beneath `Legacy_Game/`.
2. Do not selectively omit old code, docs, tests, tools or governance records merely because they are obsolete for the new build.
3. Do not copy legacy implementation files back to production root.
4. No production code may import from `Legacy_Game/`.
5. Do not refactor, modernise, migrate or bug-fix the contained legacy tree.
6. Preserve source branch, source closure SHA, behavioural SHA, historical repo, commercial repo and containment purpose.
