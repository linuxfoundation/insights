MIG_NAME="$1"
MIG_VERSION=$(date +%s)
MIG_FILE="$(pwd)/migrations/V${MIG_VERSION}__${MIG_NAME}.sql"
touch $MIG_FILE
echo "Created ${MIG_FILE}"