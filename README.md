# Galactic Gunners

Galactic Gunners is an Inceptivec Gamification product developed under Secuvara technical governance.

## Production architecture

The repository is being formed as a production-grade multi-client game platform:

```text
apps/web        Next.js product client
    ↓
game            Phaser + TypeScript game core
    ↓
backend         Django + Django REST Framework authoritative backend
    ↓
PostgreSQL      authoritative application data

packages/contracts
                versioned machine-readable contracts

Legacy_Game     temporary accepted/provisional legacy behavioural reference
```

## Governing rule

The browser is an untrusted client. Phaser owns moment-to-moment gameplay. Next.js owns the web product shell. Django owns identity, player authority, game-run authority, score validation and future entitlement authority.

## Branch promotion

```text
feature/* → dev → stage → main
```

Promotion is explicit and separately accepted. Merge is not deployment and deployment is not Founder acceptance.

## Legacy migration

`Legacy_Game/` is temporary. It exists so the new implementation can reproduce accepted game behaviour without destructive in-place rewriting. It is removed only after production behavioural coverage is complete and Founder / Secuvara CTAIO retirement authority is given.

## Planning

The only live programme steering documents under `docs/internal_governance/planning/` are the current Roadmap and Playlist. Supporting/historical planning material belongs in `_archive/`.
