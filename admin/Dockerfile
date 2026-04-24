# ── Stage 1: Install dependencies (cached unless package-lock changes) ──
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts

# ── Stage 2: Build the application ──
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js (standalone output)
RUN npm run build

# ── Stage 2b: Minimal pg-only node_modules for sync-schema.cjs ──
FROM node:20-alpine AS pg-deps
WORKDIR /app
RUN npm init -y && npm install pg@latest --ignore-scripts 2>/dev/null

# ── Stage 3: Production runner ──
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone server (includes all needed node_modules)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy Prisma runtime files
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/package.json ./package.json

# Merge pg module into standalone node_modules for sync-schema.cjs
COPY --from=pg-deps /app/node_modules/ ./node_modules/

# Scripts
COPY entrypoint.sh ./entrypoint.sh
COPY sync-schema.cjs ./sync-schema.cjs

# Webseiten-Metadaten für die kombinierte Changelog-Seite
# (wird vom CI-Workflow befüllt, lokal leer wenn nicht gespiegelt)
COPY --from=builder /app/.webseite ./.webseite

RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "entrypoint.sh"]
