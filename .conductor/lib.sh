#!/usr/bin/env bash
# Shared helpers for Conductor setup/run/archive scripts.
# Sourced, not executed. Requires: docker, pnpm.

set -euo pipefail

ROOT="${CONDUCTOR_ROOT_PATH:?CONDUCTOR_ROOT_PATH not set — run via Conductor}"
WS_NAME="${CONDUCTOR_WORKSPACE_NAME:-$(basename "$PWD")}"
PORT="${CONDUCTOR_PORT:-3001}"

# Workspace database name: payload_<sanitized workspace name>.
# Postgres identifier limit is 63 chars; keep well under it.
DB_NAME="payload_$(printf '%s' "$WS_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/_/g' | cut -c1-40)"

# All compose commands target the MAIN repo checkout so every workspace shares
# the one postgres container (a worktree-local `docker compose up` would spawn a
# second container and fight over port 54320).
compose() {
  docker compose --project-directory "$ROOT" "$@"
}

psql_c() {
  compose exec -T postgres psql -U postgres -v ON_ERROR_STOP=1 -q "$@"
}

ensure_postgres() {
  if ! docker info >/dev/null 2>&1; then
    echo "conductor: Docker is not running — start Docker Desktop first." >&2
    exit 1
  fi
  compose up -d postgres
  local i=0
  until compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; do
    i=$((i + 1))
    if [ "$i" -gt 60 ]; then
      echo "conductor: postgres did not become healthy within 60s" >&2
      exit 1
    fi
    sleep 1
  done
}

db_exists() {
  [ "$(psql_c -tAc "SELECT 1 FROM pg_database WHERE datname='$1'")" = "1" ]
}

# Create the workspace DB as a clone (schema + content) of the main dev DB so
# the workspace starts with real content and drizzle push can diverge safely.
ensure_workspace_db() {
  if db_exists "$DB_NAME"; then
    return 0
  fi
  echo "conductor: creating database $DB_NAME"
  psql_c -c "CREATE DATABASE \"$DB_NAME\""
  if db_exists "payload"; then
    echo "conductor: cloning content from main dev database 'payload'"
    if ! compose exec -T postgres pg_dump -U postgres payload | psql_c -d "$DB_NAME" >/dev/null; then
      psql_c -c "DROP DATABASE IF EXISTS \"$DB_NAME\" WITH (FORCE)"
      echo "conductor: clone of 'payload' into $DB_NAME failed" >&2
      exit 1
    fi
  fi
  # Safety net — Ask RAG embeddings need it; a clone already carries it.
  psql_c -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS vector"
}

# Upsert KEY=VALUE in the workspace .env (BSD sed — macOS).
set_env() {
  local key="$1" value="$2"
  if grep -q "^${key}=" .env; then
    sed -i '' "s|^${key}=.*|${key}=${value}|" .env
  else
    printf '%s=%s\n' "$key" "$value" >>.env
  fi
}
