# Product Model to Implementation Matrix

| Locked product concern | Primary implementation | Verification boundary |
| --- | --- | --- |
| Shooter | `game/src/scenes/Level1Scene.ts` | game tests and ordinary browser runtime |
| Boarding inside Shooter run | `game/src/boarding/`, `backend/boarding/` | Boarding API and ordinary journey |
| Campaign publication | `backend/campaigns/`, `backend/levels/` | publication and runtime tests |
| Command Post | `apps/web/app/command-post/` | authenticated browser journey |
| Gamification Admin/Designer | `apps/web/app/inceptivec-gamification-admin/` | tenant and Designer round-trip tests |
| Authoritative entity cards | catalogue and Designer data | Designer inspection tests |
| Guides by audience | `docs/H015_PRODUCT_DEFINITION/06_GUIDES/` and product routes | route/permission verification |

The exact requirement denominator remains `docs/assurance/H015_REQUIREMENTS_TRACEABILITY.yaml`.
