# Galactic Gunners Production Application Architecture

```text
Next.js product client
        ↓
Phaser / TypeScript game core
        ↓
versioned HTTP and event contracts
        ↓
Django / DRF authoritative backend
        ↓
PostgreSQL
```

## Authority boundaries

- Next.js owns product/web presentation and authenticated player-facing surfaces.
- Phaser owns moment-to-moment gameplay.
- Django owns identity, player authority, game-run authority, score validation, administration and future entitlement authority.
- PostgreSQL is never accessed directly from browser/game code.
- `Legacy_Game/` is a temporary behavioural reference only.
