# NEXT.JS WEB FOUNDATION SPECIFICATION

Enhance existing:

`apps/web/`

Do not create another web app.

## Required foundation

- Next.js + TypeScript remains the commercial web/product shell.
- TypeScript strictness must be enabled/retained.
- production build must pass.
- game mount boundary must be client-only where Phaser/browser APIs require it.
- server components must not accidentally instantiate Phaser.
- environment access must be centralized and validated.
- API base URL must come from configuration.
- no secrets may use `NEXT_PUBLIC_*`.

## Required semantic boundaries

Recommended paths if compatible with current structure:

```text
apps/web/
├── app/
├── components/
├── lib/
│   ├── api/
│   └── config/
└── game/
    └── GameMount.tsx
```

Do not create folders solely to match this example if an equivalent existing semantic location already exists.

## API client

One typed/small API client boundary should provide foundation methods such as:

```text
health()
startGameRun(...)
completeGameRun(...)
getLeaderboard(...)
```

Do not scatter raw `fetch()` calls through UI components.

Do not generate a large SDK unless justified.

## Failure behaviour

API/network failures must:
- reject/return typed error;
- never fabricate successful score submission;
- never silently mark a local score authoritative.

## Build acceptance

Required:

```text
npm --workspace apps/web run typecheck = PASS
npm --workspace apps/web run build = PASS
```

If lint exists, it must pass.

No final product UI construction is required in this sprint.
