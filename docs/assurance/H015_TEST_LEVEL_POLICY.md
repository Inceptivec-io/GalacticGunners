# H015 Test-Level Policy

H015 recovery distinguishes test levels by the proof they can provide.

| Level | Permitted proof |
| --- | --- |
| `UNIT` | Pure game/domain logic, validators, state transitions, checksums and scoring. |
| `COMPONENT` | React controls and isolated Phaser systems through explicit seams. |
| `API` | Django/DRF behaviour against PostgreSQL, including permission and concurrency rejection. |
| `INTEGRATION` | Typed browser-to-API or system-boundary behaviour. |
| `E2E_ORDINARY_USER` | Product UI using Playwright mouse, keyboard or touchscreen with QA hooks disabled. |
| `QA_DIAGNOSTIC` | Deterministic inspection or setup using a QA adapter, direct state mutation, forced terminal state, or synthetic event. |

`QA_DIAGNOSTIC` output can diagnose a fault or prepare deterministic test data. It cannot satisfy an ordinary-user, real-play, touch, pointer, accessibility, campaign-completion or closure gate.

Every H015 requirement needs a positive and negative test. A temporary `PENDING` row is an honest incomplete state, not a pass.
