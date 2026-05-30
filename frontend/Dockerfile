# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:22-slim AS builder

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Vite reads VITE_* env vars at build time via import.meta.env
ARG GATEWAY_HOST
RUN if [ -n "$GATEWAY_HOST" ]; then \
      echo "VITE_API_GATEWAY_URL=https://${GATEWAY_HOST}.onrender.com/api" > .env; \
    else \
      echo "VITE_API_GATEWAY_URL=http://localhost:8000/api" > .env; \
    fi

RUN pnpm run build

# ── Stage 2: Serve ───────────────────────────────────────────────────────────
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
