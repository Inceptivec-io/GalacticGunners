# GG-STD-013 Configuration, Secret and Environment Standard v1.0

- Secrets are environment-bound and never committed.
- `NEXT_PUBLIC_*` values are treated as public.
- Browser/game code receives no DB/admin/signing/payment secrets.
- Environment meaning is explicit: local, dev, stage, production.
- Configuration changes update currentness and operator/developer guidance in the same change.
