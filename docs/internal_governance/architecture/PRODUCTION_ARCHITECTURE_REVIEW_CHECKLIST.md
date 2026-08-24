# Production Architecture Foundation Review Checklist

## Repository
- [ ] Root contains production product structure, not legacy runtime sprawl.
- [ ] `Legacy_Game/` is bounded and temporary.
- [ ] Governance/boundary/licence material remains at product root.

## Naming
- [ ] Permanent source names are semantic.
- [ ] No handoff/sprint/task numbers appear in permanent functions/modules/files except true execution records.
- [ ] Python/TypeScript/environment/URL naming conventions are consistent.

## Boundaries
- [ ] Next.js = product shell.
- [ ] Phaser = gameplay.
- [ ] Django = identity/application authority.
- [ ] PostgreSQL has no direct browser access.
- [ ] Contracts are versioned and machine-readable.

## Currentness
- [ ] Roadmap/Playlist remain the only live planning controls.
- [ ] Standards match topology.
- [ ] Guides match workflows.
- [ ] Contract/schema registers match code.
- [ ] Governance debt count = 0.

## Merge gate
- [ ] REV3 Founder-accepted GGF-1 HEAD received.
- [ ] `Legacy_Game/` resynchronised to exact accepted HEAD.
- [ ] dependency lockfiles generated.
- [ ] CI passes.
- [ ] Docker full stack passes.
- [ ] Founder / Secuvara CTAIO approves merge to `dev`.
