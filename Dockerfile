# ─── Pixora – Next.js + Bun (Docker) ───────────────────────────────────────────
# Usage: docker compose up --build

# Debian-based Bun image (Prisma works out of the box, no OpenSSL issues)
FROM oven/bun:1 AS base

# ── Stage 1: Install dependencies ──────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json bun.lock* ./
COPY prisma ./prisma
RUN bun install

# ── Stage 2: Build the app ─────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG CLERK_SECRET_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV CLERK_SECRET_KEY=$CLERK_SECRET_KEY
ENV NEXT_TELEMETRY_DISABLED=1

RUN bunx prisma generate
RUN bun run build

# ── Stage 3: Production runner ─────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/prisma ./prisma

USER nextjs
EXPOSE 3000

CMD ["sh", "-c", "bunx prisma db push --accept-data-loss 2>/dev/null || true && bun server.js"]
