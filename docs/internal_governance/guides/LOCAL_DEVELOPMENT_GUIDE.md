# Local Development Guide

## Production architecture groundwork

1. Copy `.env.example` to `.env` and use local-only values.
2. Run `docker compose up --build` for the production stack when implementation dependencies are ready.
3. Web target: `http://localhost:3000`.
4. Backend target: `http://localhost:8000`.
5. Legacy runtime remains under `Legacy_Game/` and is not the production application root.

No guide may instruct developers to commit secrets or bypass migrations/contracts.
