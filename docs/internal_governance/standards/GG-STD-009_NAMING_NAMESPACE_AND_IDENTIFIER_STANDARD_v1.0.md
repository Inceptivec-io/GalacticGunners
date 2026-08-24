# GG-STD-009 Naming, Namespace and Identifier Standard v1.0

## Doctrine

Permanent engineering names describe enduring product meaning. Execution sequence is not product identity.

Forbidden in permanent functions/classes/modules/files except where the record itself is explicitly an execution artefact:
- handoff numbers;
- sprint numbers;
- arbitrary task sequence numbers;
- duplicated cross-institution work IDs.

Examples:
- GOOD: `GameRun`, `ScoreSystem`, `PlayerProfile`, `GameApiClient`, `score-submission.schema.json`.
- BAD: `handoff004ScoreFix`, `Sprint3GameRun`, `task34_player.js`.

Conventions:
- TypeScript classes/components/types: PascalCase.
- TypeScript functions/variables: camelCase.
- Python modules/functions: snake_case.
- Python classes/models: PascalCase.
- environment variables: UPPER_SNAKE_CASE.
- URL paths: lowercase kebab-case/plural resources as appropriate.
- machine contract filenames: lowercase kebab-case with semantic version only when interface identity requires it.
- governance document IDs may use stable semantic standard IDs and versions.

Names are not identity by themselves; stable product namespace and explicit references must disambiguate material contracts/objects.
