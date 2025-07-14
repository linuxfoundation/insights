#!/usr/bin/env bash
set -ex
set +o history

# Grab all command line arguments to pass them into Docker, or default to "migrate".
if [ $# -eq 0 ]; then
    FLYWAY_COMMAND=("migrate")
else
    FLYWAY_COMMAND=("$@")
fi

echo "Running Flyway command: ${FLYWAY_COMMAND[@]} on jdbc:postgresql://${PGHOST}:${PGPORT}/${PGDATABASE}"

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
  "${FLYWAY_COMMAND[@]}"

set -o history