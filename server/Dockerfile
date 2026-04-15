# ── Stage 1: Build Vite app ────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --prefer-offline

# Copy source and build
# Build args for Vite env vars (set these in docker-compose or CI)
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_GEMINI_API_KEY

COPY . .
RUN npm run build

# ── Stage 2: Serve with lightweight Nginx ─────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy built app to Nginx html dir
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA fallback — all routes serve index.html
COPY server/nginx/spa.conf /etc/nginx/conf.d/spa.conf

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
