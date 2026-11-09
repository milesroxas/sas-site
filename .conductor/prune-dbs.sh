#!/usr/bin/env bash
# Drop payload_* databases that no live workspace references, Conductor
# workspace or T3 Code worktree. Orphans appear when an archive ran while
# Docker was down, when T3 Code removes a worktree (it has no archive hook, so
# this is how T3 worktree DBs are reclaimed), or (before DB identity was keyed
# on the workspace directory) when a workspace was renamed.
#
#   bash .conductor/prune-dbs.sh          # dry run — lists what would be dropped
#   bash .conductor/prune-dbs.sh --yes    # drop them
#
# Run from any workspace, worktree or the main checkout. A DB is live when any
# of these directories points at it, so neither host's DBs look orphaned from
# the other: Conductor's workspaces dir, T3 Code's worktrees dir, and every
# git worktree of this checkout. Extra dirs: WORKSPACES_DIRS="dir1 dir2".
set -euo pipefail
source "$(dirname "$0")/lib.sh"

YES=0
[ "${1:-}" = "--yes" ] && YES=1

REPO="$(basename "$(cd "$ROOT" && pwd -P)")"
candidates=()
for parent in "$HOME/conductor/workspaces/$REPO" "$HOME/.t3/worktrees/$REPO" ${WORKSPACES_DIRS:-}; do
  [ -d "$parent" ] || continue
  for d in "$parent"/*/; do
    [ -d "$d" ] && candidates+=("$d")
  done
done
while IFS= read -r wt; do
  [ -d "$wt" ] && candidates+=("$wt")
done < <(git -C "$WS_PATH" worktree list --porcelain 2>/dev/null | sed -n 's/^worktree //p')

ensure_postgres

# Live = every DB a candidate directory (symlinks resolved) points at via its
# .env, plus the name setup would derive for a directory that has no .env yet.
live=" "
for d in "${candidates[@]}"; do
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
  echo "workspace: no orphan workspace databases (${#candidates[@]} live directories checked)"
  exit 0
fi

echo "workspace: orphan workspace databases (no workspace or worktree references them):"
for db in "${orphans[@]}"; do
  size="$(psql_c -tAc "SELECT pg_size_pretty(pg_database_size('$db'))")"
  printf '  %-45s %s\n' "$db" "$size"
done

if [ "$YES" != 1 ]; then
  echo "workspace: dry run — re-run with --yes to drop them"
  exit 0
fi

for db in "${orphans[@]}"; do
  echo "workspace: dropping $db"
  drop_workspace_db "$db"
done
