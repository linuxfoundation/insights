#!/usr/bin/env bash
set -ex
set +o history

echo "Migrating jdbc:postgresql://${PGHOST}:${PGPORT}/${PGDATABASE}"

docker run --rm \
  -v "$(pwd)/migrations:/tmp/migrations" \
  flyway/flyway:latest-alpine \
  -locations="filesystem:/tmp/migrations" \
  -url="jdbc:postgresql://${PGHOST}:${PGPORT}/${PGDATABASE}" \
  -user="$PGUSER" \
  -password="$PGPASSWORD" \
  -connectRetries=60 \
  -outOfOrder=true \
  -placeholderReplacement=false \
  -schemas=public \
  -baselineOnMigrate="true" \
  -X \
  migrate

set -o history