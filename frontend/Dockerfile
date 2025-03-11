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

COPY --from=builder /usr/src/app/.output ./.output

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
