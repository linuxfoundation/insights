ARG NODE_VERSION=24
ARG PNPM_VERSION=10.12.4
ARG PNPM_CACHE_DIR=/tmp/insights-search-volume-worker-pnpm-cache


## Builder stage
FROM node:${NODE_VERSION}-alpine AS builder
ARG PNPM_VERSION
ARG PNPM_CACHE_DIR

RUN apk add --no-cache python3 make g++

WORKDIR /insights-search-volume-app
RUN npm install -g corepack@latest && \
    corepack enable pnpm && \
    corepack prepare pnpm@${PNPM_VERSION} --activate

# Copy root-level files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY ./workers/temporal/search_volume_worker/package.json ./workers/temporal/search_volume_worker/

# Pre-fetch dependencies and use a Docker cache mount for pnpm to speed up subsequent builds
RUN --mount=type=cache,id=pnpm,target=${PNPM_CACHE_DIR} pnpm config set store-dir ${PNPM_CACHE_DIR} && \
    pnpm fetch --frozen-lockfile

COPY ./submodules ./submodules
COPY ./workers/temporal/base ./workers/temporal/base
COPY ./workers/temporal/search_volume_worker ./workers/temporal/search_volume_worker

RUN --mount=type=cache,id=pnpm,target=${PNPM_CACHE_DIR} pnpm config set store-dir ${PNPM_CACHE_DIR} && \
    pnpm install --frozen-lockfile


## Runner stage
FROM node:${NODE_VERSION}-bookworm-slim AS runner
ARG PNPM_VERSION

WORKDIR /insights-search-volume-app/workers/temporal/search_volume_worker

RUN npm install -g corepack@latest && corepack enable pnpm && \
    corepack prepare pnpm@${PNPM_VERSION} --activate && \
    apt update && \
    apt install -y ca-certificates --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

COPY ./workers/temporal/search_volume_worker/package.json ./package.json
COPY --from=builder /insights-search-volume-app/node_modules /insights-search-volume-app/node_modules
COPY --from=builder /insights-search-volume-app/submodules /insights-search-volume-app/submodules
COPY --from=builder /insights-search-volume-app/workers /insights-search-volume-app/workers

ENV PATH=/insights-search-volume-app/node_modules/.bin:$PATH
