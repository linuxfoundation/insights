ARG NODE_VERSION=22
ARG APP_ENV=production
ARG NUXT_REDIS_URL

FROM node:$NODE_VERSION-slim AS base

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

# Install dependencies using pnpm workspaces
FROM base AS deps

WORKDIR /app

# Copy workspace configuration files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy frontend package.json for dependency resolution
COPY frontend/package.json ./frontend/

# Install only frontend dependencies using workspace filter
RUN pnpm install --filter lfx-insights... --frozen-lockfile

# Copy frontend source files and build
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

# Build vitepress docs
RUN pnpm docs:build && mkdir -p public/docs && cp -r docs/.vitepress/dist/* public/docs/
RUN pnpm blog:build && mkdir -p public/blog && cp -r blog/.vitepress/dist/* public/blog/

# Build the Nuxt app
RUN echo "Building with APP_ENV=$APP_ENV" && \
    NUXT_APP_ENV=$APP_ENV pnpm build


FROM node:${NODE_VERSION}-slim AS prod

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

# Install system packages needed by sharp and font rendering
RUN apt-get update && apt-get install -y \
    libvips-dev \
    fontconfig \
    fonts-dejavu-core \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy the built output
COPY --from=builder /app/frontend/.output ./.output

# Install production dependencies in .output/server
# This ensures all modules required by the built app are available
WORKDIR /app/.output/server
RUN pnpm install --prod --shamefully-hoist || npm install --production

# Switch back to main working directory
WORKDIR /app

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
