# GG-STD-015 Deployment and Environment Standard v1.0

Branch and environment promotion are separate concepts. Project branch authority is `feature/* → dev → stage → main`. Initial hosting direction is Next.js on Vercel and Django on Railway, with PostgreSQL selected deliberately between an approved managed provider. Deployment requires health checks, explicit environment bindings, rollback treatment, backup/recovery and evidence. Merge is not deployment; deployment is not Founder acceptance.
