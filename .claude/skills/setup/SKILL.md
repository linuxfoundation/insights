---
name: setup
description: >
  Full development environment setup from scratch — prerequisites, dependencies,
  .env file, optional local PostgreSQL database (for auth/collections/chat work),
  and dev server. Use for first-time setup, broken environments, missing env vars,
  or when the app won't start.
allowed-tools: Bash, AskUserQuestion
---

# Development Environment Setup

Walk through each step in order, verifying success before moving on.

---

## Step 1: Prerequisites

Check that the following are installed:

```bash
node --version    # must be 20+
pnpm --version    # must be 9+
docker info       # Docker must be running
```

If Node is missing or wrong version: install via [nvm](https://github.com/nvm-sh/nvm) or [nodejs.org](https://nodejs.org/).
If pnpm is missing: `npm install -g pnpm` or `corepack enable && corepack prepare pnpm@latest --activate`.
If Docker is not running: start Docker Desktop before continuing.

---

## Step 2: Install dependencies

Run from the repo root:

```bash
pnpm install --filter frontend
```

---

## Step 3: Environment variables

Create `frontend/.env` and populate it with the values below. Ask a team member for the secret values — they are shared via the team's secrets manager.

**Required secrets (get from team):**
- `NUXT_PUBLIC_AUTH0_CLIENT_ID`
- `NUXT_AUTH0_CLIENT_SECRET`
- `NUXT_JWT_SECRET`
- `NUXT_TINYBIRD_TOKEN` — data won't load without this

**Database — only needed if you will run Step 4 (Postgres). Use these exact values:**
```
NUXT_INSIGHTS_DB_WRITE_HOST=localhost
NUXT_INSIGHTS_DB_READ_HOST=localhost
NUXT_INSIGHTS_DB_PORT=5450
NUXT_INSIGHTS_DB_USERNAME=postgres
NUXT_INSIGHTS_DB_PASSWORD=example
NUXT_INSIGHTS_DB_DATABASE=insights
```

> Database, auth, and other runtime config vars must use the `NUXT_` prefix so Nuxt's runtime config picks them up automatically. A few server-only vars (e.g. `APP_ENV`) are read directly via `process.env` and do not need the prefix — check `frontend/setup/runtime-config.ts` for the full list.

**Collections feature** — only needed if working on collections endpoints:
```
NUXT_CM_DB_ENABLED=true
```
This also requires crowd.dev (`crowd-web`) DB credentials — ask the team for them.

Tell the user to let you know when their `.env` is ready, then continue to Step 4.

---

## Step 4: Start the local database (optional)

**Ask the user:** Do you need to work on any of the following features locally?
- Auth / login flow
- Collections pages (`/collection/*`, "add to collection" buttons)
- Copilot / chat

Use `AskUserQuestion` to confirm before proceeding. If the answer is **no**, skip to Step 5 — the dev server runs fine without Postgres, and any route that needs the DB will return an error only when hit directly.

If the answer is **yes**, continue with the steps below.

---

### 4a. Check for port conflicts

```bash
lsof -i :5450 | grep LISTEN
```

Use port `5450` (the port used throughout this guide — the Nuxt runtime default is `5432`, but we use `5450` here to avoid colliding with any local Postgres instance). If it's already occupied, pick a free port, use it in the `docker run -p` flag below, and update `NUXT_INSIGHTS_DB_PORT` in `frontend/.env` to match.

### 4b. Start Postgres

If the `insights-postgres` container already exists, just start it:
```bash
docker start insights-postgres
```

Otherwise create it:
```bash
docker run -d \
  --name insights-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=example \
  -e POSTGRES_DB=insights \
  -p 5450:5432 \
  postgres:15-alpine \
  postgres -c wal_level=logical
```

> `wal_level=logical` is required — one migration creates a logical replication slot for Sequin and will fail without it.

Wait for Postgres to be ready:
```bash
until docker exec insights-postgres pg_isready -U postgres; do sleep 1; done
```

### 4c. Run migrations

```bash
cd database && \
  PGHOST=host.docker.internal \
  PGPORT=5450 \
  PGDATABASE=insights \
  PGUSER=postgres \
  PGPASSWORD=example \
  bash migrate.sh
```

> **Linux:** `host.docker.internal` may not resolve. Use `PGHOST=localhost` with `--host-network` instead:
> ```bash
> cd database && PGHOST=localhost PGPORT=5450 PGDATABASE=insights PGUSER=postgres PGPASSWORD=example bash migrate.sh --host-network
> ```

### 4d. Verify

```bash
docker exec insights-postgres psql -U postgres -d insights -c "\dt"
```

Expected: tables including `chat_responses`, `project_costs`, `vulnerabilities`, etc.

---

## Step 5: Start the dev server

### 5a. Check for port :3000 conflicts

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
```

If a process is listed, **do not switch ports** — the Auth0 redirect URI and `appUrl` are hardcoded to `localhost:3000` in `frontend/setup/runtime-config.ts`. Switching the port will break login. Kill the existing listener instead:

```bash
lsof -ti tcp:3000 | xargs kill        # graceful (SIGTERM)
lsof -ti tcp:3000 | xargs kill -9     # force, if the above doesn't clear it
```

### 5b. Start the server

```bash
cd frontend && pnpm dev
```

The app will be available at `http://localhost:3000`.

---

## Verification

1. Open `http://localhost:3000` — the app should load
2. Auth0 login should work if the Auth0 env vars are set
3. Data should appear on project pages if the Tinybird token is set
4. If you skipped Step 4: analytics, leaderboards, reports, badges, and search work. Auth, collections, and chat will return errors — that's expected.
5. If you ran Step 4: check the container is running: `docker ps | grep insights-postgres`

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Port 3000 already in use | Run `lsof -ti tcp:3000 \| xargs kill` — do not switch ports, Auth0 callback is hardcoded to :3000 |
| DB errors but I skipped Step 4 | Expected for auth/collections/chat routes — run Step 4 if you need those features |
| Port 5450 already in use | Pick a free port (e.g. `-p 5455:5432`) and update `NUXT_INSIGHTS_DB_PORT` in `.env` |
| `host.docker.internal` not resolving (Linux) | Use `PGHOST=localhost` with `--host-network` |
| Migration checksum mismatch | Never edit an applied migration — create a new one with `/db-migrate new <name>` |
| Auth errors in browser | Check Auth0 env vars in `frontend/.env` |
| No data showing | Check `NUXT_TINYBIRD_TOKEN` is populated in `frontend/.env` |
| 503 on collections endpoints | Add `NUXT_CM_DB_ENABLED=true` and CM DB credentials to `frontend/.env` |
| DB env vars not picked up | Ensure all vars have the `NUXT_` prefix — e.g. `NUXT_INSIGHTS_DB_PORT`, not `INSIGHTS_DB_PORT` |
| Container exists but wrong settings | `docker rm -f insights-postgres` then re-run the `docker run` command |

---

## Teardown

```bash
docker stop insights-postgres && docker rm insights-postgres
```

---

> For running docs or blog locally, use `/setup-docs`.
> For applying new migrations, use `/db-migrate`.
