# API Development Guide

Start at `/api/v1/`. Update OpenAPI and JSON schemas in `packages/contracts/` in the same change as implementation. Breaking changes require explicit version/migration/deprecation treatment. The game remains playable when nonessential leaderboard/network services are unavailable.
