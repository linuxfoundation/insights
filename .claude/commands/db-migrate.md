# DB Migrate

Apply pending Flyway migrations to the local Insights PostgreSQL database.

## Usage

`/db-migrate`

Optional — create a new migration file:
`/db-migrate new <migration_name>`

## How It Works

Migrations live in `database/migrations/` and are managed by [Flyway](https://flywaydb.org/) running inside Docker. The `database/migrate.sh` script wraps the Docker invocation.

File naming convention: `V<unix_timestamp>__<description>.sql`

## Apply Pending Migrations

Run from the repo root:
```sh
cd database && \
  PGHOST=host.docker.internal \
  PGPORT=5450 \
  PGDATABASE=insights \
  PGUSER=postgres \
  PGPASSWORD=example \
  bash migrate.sh
```

> Flyway runs inside Docker, so use `host.docker.internal` (not `localhost`). Port `5450` is the host port mapped to the container's 5432. Adjust if you used a different port when creating the container.

This runs `flyway migrate` with `-outOfOrder=true` and `-baselineOnMigrate=true`.

## Create a New Migration File

Run from the `database/` directory:
```sh
cd database && bash create_migration.sh <migration_name>
```

Example:
```sh
cd database && bash create_migration.sh add_index_to_project_costs
```

This creates `database/migrations/V<timestamp>__<migration_name>.sql`. Open the file and write the SQL, then apply it with `/db-migrate`.

## Check Migration Status

To see which migrations have been applied:
```sh
cd database && \
  PGHOST=host.docker.internal \
  PGPORT=5450 \
  PGDATABASE=insights \
  PGUSER=postgres \
  PGPASSWORD=example \
  bash migrate.sh info
```

## Validate Migrations

```sh
cd database && \
  PGHOST=host.docker.internal \
  PGPORT=5450 \
  PGDATABASE=insights \
  PGUSER=postgres \
  PGPASSWORD=example \
  bash migrate.sh validate
```

## Troubleshooting

- **Docker not running**: start Docker Desktop first
- **Connection refused**: make sure the `insights-postgres` container is running (`docker start insights-postgres`)
- **Checksum mismatch**: never edit an already-applied migration — create a new one instead
- **Out of order**: the `-outOfOrder=true` flag is already set, so migrations with older timestamps applied after newer ones are allowed
