# syntax=docker/dockerfile:1.4
ARG NODE_VERSION=24

# ============================================
# Base stage: Node with pnpm via corepack
# ============================================
FROM node:$NODE_VERSION-slim AS base

# Enable corepack and install pnpm (faster than npm install -g pnpm)
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# ============================================
# Dependencies stage: Install node_modules
# ============================================
FROM base AS deps

WORKDIR /app

# Copy workspace configuration files first (better cache)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY patches ./patches
COPY frontend/package.json ./frontend/

# Install dependencies with BuildKit cache mount for pnpm store
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --filter lfx-insights... --frozen-lockfile

# ============================================
# Builder stage: Build the application
# ============================================
FROM deps AS builder

ARG APP_ENV=production
ARG NUXT_REDIS_URL

ENV NUXT_APP_ENV=$APP_ENV
ENV NUXT_REDIS_URL=$NUXT_REDIS_URL
ENV NODE_OPTIONS=--max-old-space-size=4096

WORKDIR /app

# Copy frontend source
COPY frontend ./frontend

WORKDIR /app/frontend

# Build docs and blog in parallel using shell background processes
RUN pnpm docs:build & pnpm blog:build & wait && \
    mkdir -p public/docs public/blog && \
    cp -r docs/.vitepress/dist/* public/docs/ && \
    cp -r blog/.vitepress/dist/* public/blog/

# Build the Nuxt app
RUN echo "Building with APP_ENV=$APP_ENV" && \
    NUXT_APP_ENV=$APP_ENV pnpm build

# ============================================
# Production stage: Minimal runtime image
# ============================================
FROM node:${NODE_VERSION}-slim AS prod

# Install system packages needed by sharp and font rendering
# Combine update, install, and cleanup in single layer
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
    libvips42 \
    fontconfig \
    fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only the built output (Nuxt bundles dependencies)
COPY --from=builder /app/frontend/.output ./.output

# Set non-root user for security
RUN groupadd --gid 1001 nodejs && \
    useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nuxt && \
    chown -R nuxt:nodejs /app

USER nuxt

EXPOSE 3000

ENV NODE_OPTIONS=--max-old-space-size=1536

# Use exec form for proper signal handling
CMD ["node", ".output/server/index.mjs"]
