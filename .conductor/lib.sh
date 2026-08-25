#!/usr/bin/env bash
# Shared helpers for the Conductor setup / run / archive / prune scripts.
# Sourced, not executed. Requires: Docker Desktop, pnpm.
#
# Conductor runs every script from the workspace directory and exposes
# CONDUCTOR_WORKSPACE_PATH / CONDUCTOR_ROOT_PATH / CONDUCTOR_PORT / CONDUCTOR_WORKSPACE_NAME
# (https://www.conductor.build/docs/reference/scripts). Human docs: docs/conductor.md.

set -euo pipefail

# Repository root — Conductor's own clone (~/conductor/repos/<repo>), NOT your
# main checkout. Only its untracked files matter here: .env (copied into each
# workspace) and, optionally, .env.production.pulled.
ROOT="${CONDUCTOR_ROOT_PATH:-}"
WS_PATH="${CONDUCTOR_WORKSPACE_PATH:-$PWD}"
WS_NAME="${CONDUCTOR_WORKSPACE_NAME:-$(basename "$WS_PATH")}"
PORT="${CONDUCTOR_PORT:-3001}"

MAIN_DB="payload"
DB_HOST="127.0.0.1:54320"
# Same image as docker-compose.yml / scripts/dev-tui/constants.ts — dumping
# production with the container's own pg_dump avoids client/server mismatch.
POSTGRES_IMAGE="pgvector/pgvector:pg18"
# Vercel-pulled production env in the Conductor root (same file/convention as
# the dev TUI). Optional: only needed for `setup.sh --from production`.
PROD_ENV_FILE="$ROOT/.env.production.pulled"

require_root() {
  [ -n "$ROOT" ] || {
    echo "conductor: CONDUCTOR_ROOT_PATH not set — run this from Conductor (or a Conductor terminal)." >&2
    exit 1
  }
}

# ---------------------------------------------------------------------------
# Workspace database identity
#
# Keyed on the workspace DIRECTORY (Conductor's city name under
# ~/conductor/workspaces/<repo>/), never on CONDUCTOR_WORKSPACE_NAME: the display
# name is renamed to the branch name after the first chat, so a name-keyed DB
# was re-created under the new name on the next Run and the archive dropped the
# wrong one — that is how the orphan payload_<city> databases appeared.
# Once the workspace has a .env, its POSTGRES_URL is the source of truth, so
# setup re-runs, renames and archives all agree on one database.
# ---------------------------------------------------------------------------
sanitize_db_name() {
  # Postgres identifiers cap at 63 chars; keep well under it.
  printf 'payload_%s' "$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/_/g' | cut -c1-40)"
}

# Conductor adds <branch-name> symlinks beside the real (city) directory —
# resolve them so both paths map to the same DB.
workspace_dir_name() {
  basename "$(cd "$WS_PATH" && pwd -P)"
}

# Read KEY from a dotenv-style file, stripping optional surrounding quotes.
read_env_key() {
  local file="$1" key="$2" line v
  line="$(grep "^${key}=" "$file" 2>/dev/null | tail -n1)" || return 1
  v="${line#*=}"
  v="${v%\"}" v="${v#\"}" v="${v%\'}" v="${v#\'}"
  printf '%s' "$v"
}

# DB name from a workspace .env POSTGRES_URL — only a local per-workspace DB
# (payload_*) counts; a URL pointing at the shared 'payload' DB or elsewhere
# means "no workspace DB yet".
db_name_from_env_file() {
  local url db
  url="$(read_env_key "$1" POSTGRES_URL 2>/dev/null || true)"
  case "$url" in
  *"$DB_HOST"/payload_*)
    db="${url##*/}"
    printf '%s' "${db%%\?*}"
    ;;
  *) return 1 ;;
  esac
}

DB_NAME="$(db_name_from_env_file "$WS_PATH/.env" || sanitize_db_name "$(workspace_dir_name)")"

# Next.js loads .env.local (and .env.development.local) OVER .env, so a
# `vercel env pull` run inside a workspace silently re-points POSTGRES_URL at
# Neon production — dev push would then prompt to drop production tables.
# Refuse to continue while any override file names a DB other than this
# workspace's. (Unset keys in those files are fine.)
assert_no_db_override() {
  local f url key
  for f in "$WS_PATH/.env.local" "$WS_PATH/.env.development.local"; do
    [ -f "$f" ] || continue
    for key in POSTGRES_URL DATABASE_URL POSTGRES_URL_NON_POOLING DATABASE_URL_UNPOOLED; do
      url="$(read_env_key "$f" "$key" 2>/dev/null || true)"
      [ -n "$url" ] || continue
      case "$url" in
      *"$DB_HOST/$DB_NAME"|*"$DB_HOST/$DB_NAME?"*) ;;
      *)
        printf 'conductor: %s sets %s to a database other than %s (%s).\n' \
          "$f" "$key" "$DB_NAME" "$(printf '%s' "$url" | sed -E 's#://[^@]*@#://***@#')" >&2
        printf 'conductor: Next.js reads that file over .env. Remove it: mv %s %s.neon-bak\n' "$f" "$f" >&2
        exit 1
        ;;
      esac
    done
  done
}
# archive.sh sources lib.sh only to drop the DB; a stale .env.local must not block archiving.
[ "${CONDUCTOR_ARCHIVING:-0}" = 1 ] || assert_no_db_override

# ---------------------------------------------------------------------------
# Postgres (one shared container, one DB per workspace)
# ---------------------------------------------------------------------------

# docker-compose.yml pins `name: sas-site`, so compose from any checkout
# addresses the same container/volume. Use the workspace's own compose file —
# it matches the code being run; the root clone's copy may lag main.
compose() {
  docker compose --project-directory "$WS_PATH" "$@"
}

psql_c() {
  compose exec -T postgres psql -U postgres -v ON_ERROR_STOP=1 -q "$@"
}

postgres_running() {
  [ -n "$(compose ps -q --status running postgres 2>/dev/null)" ]
}

ensure_postgres() {
  if ! docker info >/dev/null 2>&1; then
    echo "conductor: Docker is not running — start Docker Desktop first." >&2
    exit 1
  fi
  # `up` only when nothing is running: `docker compose up` re-creates a running
  # container whenever the rendered config differs from the one it was started
  # with (e.g. compose.yml changed on this branch), which drops every other
  # workspace's DB connections mid-request.
  if ! postgres_running; then
    compose up -d postgres
  fi
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

# Hard guard for every DROP in these scripts: only payload_<workspace>
# databases, never the shared 'payload' dev DB.
assert_workspace_db_name() {
  case "$1" in
  payload_?*) ;;
  *)
    echo "conductor: refusing to touch database '$1' (not a workspace DB)" >&2
    return 1
    ;;
  esac
}

drop_workspace_db() {
  assert_workspace_db_name "$1"
  psql_c -c "DROP DATABASE IF EXISTS \"$1\" WITH (FORCE)"
}

# Clone the main dev DB ('payload' — itself a production restore, see README
# "Reset local database") into the workspace DB.
# Fast path: CREATE DATABASE … TEMPLATE copies files in ~1s but needs no other
# session on the template, which fails whenever a dev server is running against
# 'payload' — then fall back to dump | restore.
clone_local_db() {
  if psql_c -c "CREATE DATABASE \"$DB_NAME\" TEMPLATE \"$MAIN_DB\"" 2>/dev/null; then
    return 0
  fi
  psql_c -c "CREATE DATABASE \"$DB_NAME\""
  compose exec -T postgres pg_dump -U postgres --no-owner --no-acl "$MAIN_DB" |
    psql_c -d "$DB_NAME" >/dev/null
}

# Pull production env from Vercel into the Conductor root if missing.
# Never refreshes an existing file (repo convention — see README).
ensure_production_env() {
  require_root
  if [ -f "$PROD_ENV_FILE" ]; then
    return 0
  fi
  if ! command -v vercel >/dev/null 2>&1; then
    echo "conductor: vercel CLI not found (npm i -g vercel) — cannot pull production env" >&2
    return 1
  fi
  echo "conductor: pulling Vercel production env → $PROD_ENV_FILE"
  (cd "$ROOT" && vercel env pull .env.production.pulled --environment=production --yes)
}

# pg_dump production straight into the workspace DB. Prefers the non-pooling
# URL (PgBouncer breaks pg_dump). PG17+ pg_dump emits `SET transaction_timeout`
# which older servers reject on restore — strip it (mirrors dev-tui pg-tools).
seed_db_from_production() {
  local dump_url
  dump_url="$(read_env_key "$PROD_ENV_FILE" POSTGRES_URL_NON_POOLING || true)"
  [ -n "$dump_url" ] || dump_url="$(read_env_key "$PROD_ENV_FILE" POSTGRES_URL || true)"
  if [ -z "$dump_url" ]; then
    echo "conductor: no POSTGRES_URL in $PROD_ENV_FILE — re-pull production env" >&2
    return 1
  fi
  echo "conductor: dumping production content into $DB_NAME (this can take a minute)"
  psql_c -c "CREATE DATABASE \"$DB_NAME\""
  docker run --rm "$POSTGRES_IMAGE" pg_dump "$dump_url" --no-owner --no-acl |
    sed '/^[[:space:]]*SET transaction_timeout/d' |
    psql_c -d "$DB_NAME" >/dev/null
}

# Create the workspace DB if missing. $1 = local (default) | production.
#   local      — clone of the main dev DB: fast, offline, prod-equivalent content.
#   production — pg_dump straight from Neon (needs .env.production.pulled in the
#                Conductor root, or a logged-in vercel CLI); falls back to local.
# Sets WORKSPACE_DB_SOURCE = existing | local | production | empty.
ensure_workspace_db() {
  local from="${1:-local}"
  WORKSPACE_DB_SOURCE="existing"
  if db_exists "$DB_NAME"; then
    return 0
  fi
  assert_workspace_db_name "$DB_NAME"
  echo "conductor: creating database $DB_NAME"

  if [ "$from" = "production" ]; then
    if ensure_production_env && seed_db_from_production; then
      WORKSPACE_DB_SOURCE="production"
      echo "conductor: $DB_NAME seeded from production"
      return 0
    fi
    echo "conductor: production seed unavailable — falling back to a clone of '$MAIN_DB'" >&2
    # A failed restore may be partial; start over clean.
    drop_workspace_db "$DB_NAME"
  fi

  if db_exists "$MAIN_DB"; then
    if clone_local_db; then
      WORKSPACE_DB_SOURCE="local"
      echo "conductor: $DB_NAME cloned from '$MAIN_DB'"
      return 0
    fi
    drop_workspace_db "$DB_NAME"
    echo "conductor: clone of '$MAIN_DB' into $DB_NAME failed" >&2
    exit 1
  fi

  # Nothing to copy from — empty DB; drizzle push builds the schema on first Run.
  psql_c -c "CREATE DATABASE \"$DB_NAME\""
  psql_c -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS vector"
  WORKSPACE_DB_SOURCE="empty"
  echo "conductor: $DB_NAME created empty ('$MAIN_DB' does not exist yet)"
}

# Upsert KEY=VALUE in the workspace .env (BSD sed — macOS). Delete-then-append
# so values with sed metacharacters (&, |, \ — e.g. secrets) survive intact.
set_env() {
  local key="$1" value="$2"
  sed -i '' "/^${key}=/d" .env
  printf '%s=%s\n' "$key" "$value" >>.env
}
