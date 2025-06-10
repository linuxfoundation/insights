# syntax=docker/dockerfile:1
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM node:22-alpine AS runtime
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile
COPY --from=build /app/dist ./dist

# Default command runs the main search-volume service
# For Temporal worker: docker run ... node --env-file=.env dist/temporal/index.js
CMD ["node", "--env-file=.env", "dist/search-volume.js"]
