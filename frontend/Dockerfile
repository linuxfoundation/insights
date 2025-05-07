ARG NODE_VERSION=20

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

# Build the application
FROM files AS builder

WORKDIR /usr/src/app

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
