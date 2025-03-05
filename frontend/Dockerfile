ARG NODE_VERSION=20
ARG NGINX_VERSION=1.25.3

FROM node:$NODE_VERSION-slim AS base

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /usr/src/app

# Install dependencies
FROM base AS deps

ARG NPM_TOKEN

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --shamefully-hoist

# Copy dependencies into the files stage
FROM base AS files

WORKDIR /usr/src/app

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

# Build the application
FROM files as builder

WORKDIR /usr/src/app

RUN pnpm build

# Serve the app with Nginx
FROM nginx:$NGINX_VERSION-alpine-slim as production

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
# TODO: serve with nginx
