#!/usr/bin/env bash
# Conductor archive script — runs before a workspace is archived.
# Drops the workspace's isolated database. Never touches the main 'payload' DB,
# the shared postgres container, or its volume. Never fails the archive:
# if Docker is down there is nothing to clean up that blocks archiving.
set -uo pipefail
source "$(dirname "$0")/lib.sh" 2>/dev/null || exit 0

# Hard guard: only ever drop payload_<workspace> databases.
case "$DB_NAME" in
payload_?*) ;;
*)
  echo "conductor: refusing to drop '$DB_NAME'" >&2
  exit 0
  ;;
esac

if ! docker info >/dev/null 2>&1; then
  echo "conductor: Docker not running — skipping DB cleanup for $DB_NAME"
  exit 0
fi

if compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
  echo "conductor: dropping database $DB_NAME"
  psql_c -c "DROP DATABASE IF EXISTS \"$DB_NAME\" WITH (FORCE)" || true
fi

exit 0
