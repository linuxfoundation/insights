FROM node:20-alpine as builder

RUN apk add --no-cache python3 make g++

WORKDIR /usr/insights/app
RUN npm install -g corepack@latest && corepack enable pnpm && corepack prepare pnpm@9.15.0 --activate

COPY ./package.json ./pnpm-workspace.yaml ./pnpm-lock.yaml ./
RUN pnpm fetch

COPY ./submodules ./submodules
COPY ./workers/temporal/base ./workers/temporal/base
COPY ./workers/temporal/package_downloads_worker ./workers/temporal/package_downloads_worker

RUN pnpm i --frozen-lockfile

FROM node:20-bookworm-slim as runner

WORKDIR /usr/insights/app
RUN npm install -g corepack@latest && corepack enable pnpm && corepack prepare pnpm@9.15.0 --activate && apt update && apt install -y ca-certificates --no-install-recommends && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/insights/app/node_modules ./node_modules
COPY --from=builder /usr/insights/app/submodules ./submodules
COPY --from=builder /usr/insights/app/workers ./workers
