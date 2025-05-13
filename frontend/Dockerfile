ARG NODE_VERSION=20
ARG APP_ENV=production

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
ENV APP_ENV=$APP_ENV

WORKDIR /usr/src/app

# Build vitepress docs
RUN pnpm docs:build && mkdir -p public/docs && cp -r docs/.vitepress/dist/* public/docs/

# Build the Nuxt app
RUN echo "Building with NODE_ENV=$APP_ENV"
RUN pnpm build


FROM node:${NODE_VERSION}-slim AS prod

WORKDIR /usr/src/app

# Install system packages needed by sharp and font rendering
RUN apt-get update && apt-get install -y \
    libvips-dev \
    fontconfig \
    fonts-dejavu-core \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/src/app/.output ./.output

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
