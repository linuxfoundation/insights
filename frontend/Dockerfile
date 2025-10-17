ARG NODE_VERSION=22
ARG APP_ENV=production
ARG NUXT_REDIS_URL

FROM node:$NODE_VERSION-slim AS base

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /usr/src/app

# Install dependencies
FROM base AS deps

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --shamefully-hoist

# Copy dependencies into the files stage
FROM base AS files

WORKDIR /usr/src/app

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

# Build the Nuxt app first
FROM files AS builder

ARG APP_ENV=production
ARG NUXT_REDIS_URL
ENV NUXT_APP_ENV=$APP_ENV
ENV NUXT_REDIS_URL=$NUXT_REDIS_URL
ENV NODE_OPTIONS=--max-old-space-size=4096

WORKDIR /usr/src/app

# Build vitepress docs
RUN pnpm docs:build && mkdir -p public/docs && cp -r docs/.vitepress/dist/* public/docs/
RUN pnpm blog:build && mkdir -p public/blog && cp -r blog/.vitepress/dist/* public/blog/

# Build the Nuxt app
RUN echo "Building with APP_ENV=$APP_ENV" && \
    NUXT_APP_ENV=$APP_ENV pnpm build


FROM node:${NODE_VERSION}-slim AS prod

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /usr/src/app

# Install system packages needed by sharp and font rendering
RUN apt-get update && apt-get install -y \
    libvips-dev \
    fontconfig \
    fonts-dejavu-core \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy the built output
COPY --from=builder /usr/src/app/.output ./.output

# Install production dependencies in .output/server
# This ensures all modules required by the built app are available
WORKDIR /usr/src/app/.output/server
RUN pnpm install --prod --shamefully-hoist || npm install --production

# Switch back to main working directory
WORKDIR /usr/src/app

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
