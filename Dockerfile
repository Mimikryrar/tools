# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build React frontend.
# VITE_API_URL='' → frontend calls /api/... as same-origin relative paths,
# routed to Express API routes on the same port (8080 in production).
RUN VITE_API_URL='' npm run build

# Compile proxy server to a single standalone JS bundle (includes all deps).
RUN node_modules/.bin/esbuild src/server/proxy.ts \
    --bundle \
    --platform=node \
    --target=node20 \
    --outfile=proxy.js

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS server
WORKDIR /app

# Self-contained bundle — no npm install needed.
COPY --from=builder /app/proxy.js ./proxy.js

# Built frontend — served by Express as static files.
COPY --from=builder /app/dist ./dist

COPY start.sh ./
RUN chmod +x ./start.sh

EXPOSE 8080

CMD ["./start.sh"]
