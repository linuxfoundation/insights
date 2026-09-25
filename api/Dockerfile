# syntax=docker/dockerfile:1.4
ARG NODE_VERSION=24

FROM node:$NODE_VERSION-slim AS base
RUN corepack enable && corepack prepare pnpm@10.18.2 --activate
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY api/package.json ./api/
COPY libs/tinybird-client/package.json ./libs/tinybird-client/
COPY libs/types/package.json ./libs/types/

FROM base AS builder
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --filter @lfx-insights/api... --frozen-lockfile
COPY api ./api
COPY libs/tinybird-client ./libs/tinybird-client
COPY libs/types ./libs/types
RUN pnpm --filter @lfx-insights/types build && \
    pnpm --filter @lfx-insights/tinybird-client build && \
    pnpm --filter @lfx-insights/api build

# Production dependencies only, so vitepress and the rest of the build tooling stay out of the runtime image.
FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --filter @lfx-insights/api... --prod --frozen-lockfile

FROM node:${NODE_VERSION}-slim AS prod
ENV NODE_ENV=production
WORKDIR /app
COPY --from=prod-deps /app ./
# The workspace symlinks in node_modules resolve to these package dirs.
COPY --from=builder /app/libs/types/dist ./libs/types/dist
COPY --from=builder /app/libs/tinybird-client/dist ./libs/tinybird-client/dist
COPY --from=builder /app/api/dist ./api/dist
COPY --from=builder /app/api/docs/site/.vitepress/dist ./api/docs/site/.vitepress/dist
WORKDIR /app/api
USER node
EXPOSE 4000
CMD ["node", "dist/server.js"]
