# Interface Register

| Interface | Provider | Consumers | Version | Authority | State |
|---|---|---|---|---|---|
| HTTP API | Django/DRF | Next.js, Phaser client, future native clients | v1 | `packages/contracts/openapi/galactic-gunners-api-v1.yaml` | GROUNDWORK |
| Score event summary | Game core | Django GameRun validation | v1 | `packages/contracts/schemas/score-event.schema.json` | GROUNDWORK |
| GameRun start/completion | Django | Game core | v1 | OpenAPI + JSON schemas | GROUNDWORK |
| Phaser GameHost boundary | Game core | Next.js | internal v1 groundwork | GG-STD-008 | GROUNDWORK |

Material changes update this register, contract, consumers, tests and currentness together.
