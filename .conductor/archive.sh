#!/usr/bin/env bash
# Conductor archive script — runs before a workspace is archived.
# Drops the workspace's isolated database (the one its .env points at). Never
# touches the main 'payload' DB, the shared postgres container, or its volume.
# Never fails the archive: a failed archive script blocks archiving, and if
# Docker is down there is nothing to clean up that should block it.
# Orphans (e.g. Docker was down) are reclaimed later by `bash .conductor/prune-dbs.sh`.
set -uo pipefail
CONDUCTOR_ARCHIVING=1 source "$(dirname "$0")/lib.sh" 2>/dev/null || exit 0

assert_workspace_db_name "$DB_NAME" || exit 0

if ! docker info >/dev/null 2>&1; then
  echo "conductor: Docker not running — skipping DB cleanup for $DB_NAME (prune-dbs.sh reclaims it later)"
  exit 0
fi

if postgres_running && compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
  echo "conductor: dropping database $DB_NAME"
  drop_workspace_db "$DB_NAME" || true
fi

exit 0
