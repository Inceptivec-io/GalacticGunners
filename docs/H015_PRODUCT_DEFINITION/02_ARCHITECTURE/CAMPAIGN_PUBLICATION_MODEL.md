# Campaign Publication Model

Authoritative campaign content follows `draft -> preview -> validate -> publish
-> versioned campaign -> runtime`. Runtime must consume a pinned published
version, not a silently mutable designer draft. Relevant ownership lives in
`backend/campaigns/`, `backend/levels/` and `game/src/levels/`.
