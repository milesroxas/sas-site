#!/usr/bin/env bash
# Drop payload_* databases that no live Conductor workspace references.
# Orphans appear when an archive ran while Docker was down, or (before DB
# identity was keyed on the workspace directory) when a workspace was renamed.
#
#   bash .conductor/prune-dbs.sh          # dry run — lists what would be dropped
#   bash .conductor/prune-dbs.sh --yes    # drop them
#
# Run from any Conductor workspace terminal, or from the main checkout with
# WORKSPACES_DIR=~/conductor/workspaces/<repo>.
set -euo pipefail
source "$(dirname "$0")/lib.sh"

YES=0
[ "${1:-}" = "--yes" ] && YES=1

if [ -n "${CONDUCTOR_WORKSPACE_PATH:-}" ]; then
  WORKSPACES_DIR="$(dirname "$(cd "$WS_PATH" && pwd -P)")"
else
  WORKSPACES_DIR="${WORKSPACES_DIR:-$HOME/conductor/workspaces/$(basename "$(git rev-parse --show-toplevel)")}"
fi
[ -d "$WORKSPACES_DIR" ] || {
  echo "conductor: workspaces dir not found: $WORKSPACES_DIR" >&2
  exit 1
}

ensure_postgres

# Live = every DB a workspace directory (symlinks resolved) points at via its
# .env, plus the name setup would derive for a directory that has no .env yet.
live=" "
for d in "$WORKSPACES_DIR"/*/; do
  real="$(cd "$d" && pwd -P)"
  name="$(db_name_from_env_file "$real/.env" || sanitize_db_name "$(basename "$real")")"
  live="$live$name "
done

orphans=()
while IFS= read -r db; do
  [ -n "$db" ] || continue
  case "$live" in *" $db "*) continue ;; esac
  orphans+=("$db")
done < <(psql_c -tAc "SELECT datname FROM pg_database WHERE datname LIKE 'payload\\_%' ORDER BY 1")

if [ "${#orphans[@]}" -eq 0 ]; then
  echo "conductor: no orphan workspace databases (workspaces: $WORKSPACES_DIR)"
  exit 0
fi

echo "conductor: orphan workspace databases (no workspace under $WORKSPACES_DIR references them):"
for db in "${orphans[@]}"; do
  size="$(psql_c -tAc "SELECT pg_size_pretty(pg_database_size('$db'))")"
  printf '  %-45s %s\n' "$db" "$size"
done

if [ "$YES" != 1 ]; then
  echo "conductor: dry run — re-run with --yes to drop them"
  exit 0
fi

for db in "${orphans[@]}"; do
  echo "conductor: dropping $db"
  drop_workspace_db "$db"
done
