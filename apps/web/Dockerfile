FROM node:22-alpine AS deps
WORKDIR /workspace
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json
COPY apps/web/package.json ./apps/web/package.json
COPY game/package.json ./game/package.json
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /workspace
ARG NEXT_PUBLIC_GG_QA_MODE=false
ENV NEXT_PUBLIC_GG_QA_MODE=$NEXT_PUBLIC_GG_QA_MODE
COPY --from=deps /workspace/node_modules ./node_modules
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json
COPY apps/web ./apps/web
COPY game ./game
COPY assets ./assets
COPY scripts ./scripts
COPY docs/internal_governance/handoff_in/_archive/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_014 ./docs/internal_governance/handoff_in/_archive/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_014
RUN npm run assets:sync
WORKDIR /workspace/apps/web
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/web/public ./apps/web/public
USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
