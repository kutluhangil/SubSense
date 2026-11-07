# ── Aboneyim Backend API (Express + Firebase Admin + Cron) ──────────────────
FROM node:20-alpine

WORKDIR /app

COPY functions/package*.json ./
RUN npm ci --prefer-offline

COPY functions/tsconfig.json ./
COPY functions/src ./src

RUN npm run build && npm prune --omit=dev

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1:4000/health >/dev/null || exit 1

CMD ["node", "lib/server.js"]

