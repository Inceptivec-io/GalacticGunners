FROM node:22-alpine
WORKDIR /workspace
COPY package.json ./package.json
COPY apps/web/package.json ./apps/web/package.json
COPY game/package.json ./game/package.json
RUN npm install
COPY apps/web ./apps/web
COPY game ./game
WORKDIR /workspace/apps/web
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]
