# DB Setup

Start a local PostgreSQL instance for Insights development using Docker.

## Usage

`/db-setup`

## What This Does

Starts a PostgreSQL container with the default local credentials matching the Nuxt runtime config defaults, then runs Flyway migrations to bring the schema up to date.

## Steps

### 1. Check prerequisites

Verify Docker is running:
```sh
docker info > /dev/null 2>&1 || echo "Docker is not running — start Docker Desktop first"
```

### 2. Check for port conflicts

Port 5432 may already be in use (e.g. by another Postgres instance or Docker Desktop). Check first:
```sh
lsof -i :5432 | grep LISTEN
```

- If free → use `-p 5432:5432` and `PGPORT=5432` throughout
- If occupied → use `-p 5450:5432` and `PGPORT=5450` (default below)

### 3. Start the PostgreSQL container

```sh
docker run -d \
  --name insights-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=example \
  -e POSTGRES_DB=insights \
  -p 5450:5432 \
  postgres:15-alpine \
  postgres -c wal_level=logical
```

> **`wal_level=logical` is required** — migration `V1749196362__createSequinReplicationSlot.sql` creates a logical replication slot for Sequin. Without it, migrations fail.

If the container already exists and was created with the correct settings, just start it:
```sh
docker start insights-postgres
```

Wait for Postgres to be ready:
```sh
until docker exec insights-postgres pg_isready -U postgres; do sleep 1; done
```

### 4. Apply migrations

Flyway runs inside Docker so use `host.docker.internal` (not `localhost`) to reach the host:
```sh
cd database && \
  PGHOST=host.docker.internal \
  PGPORT=5450 \
  PGDATABASE=insights \
  PGUSER=postgres \
  PGPASSWORD=example \
  bash migrate.sh
```

### 5. Verify

```sh
docker exec insights-postgres psql -U postgres -d insights -c "\dt"
```

Expected: 11 tables including `chat_responses`, `project_costs`, `vulnerabilities`, etc.

## Default Credentials

These match the runtime config defaults in `frontend/setup/runtime-config.ts`:

| Variable | Value |
|---|---|
| Host | `localhost` |
| Port | `5450` (host port mapped to container's 5432) |
| Database | `insights` |
| Username | `postgres` |
| Password | `example` |

## .env Configuration

These map to the following Nuxt env vars in `frontend/.env`:
```
NUXT_INSIGHTS_DB_WRITE_HOST=localhost
NUXT_INSIGHTS_DB_READ_HOST=localhost
NUXT_INSIGHTS_DB_PORT=5450
NUXT_INSIGHTS_DB_USERNAME=postgres
NUXT_INSIGHTS_DB_PASSWORD=example
NUXT_INSIGHTS_DB_DATABASE=insights
```

## Teardown

To stop and remove the container:
```sh
docker stop insights-postgres && docker rm insights-postgres
```
