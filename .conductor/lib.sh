#!/usr/bin/env bash
# Shared helpers for the workspace setup / run / archive / prune scripts.
# Sourced, not executed. Requires: Docker Desktop, pnpm.
#
# Two hosts run these scripts from the workspace directory, and a plain
# terminal inside a worktree works too (docs/conductor.md):
#
#   Conductor  CONDUCTOR_ROOT_PATH / CONDUCTOR_WORKSPACE_PATH / CONDUCTOR_PORT
#              (https://www.conductor.build/docs/reference/scripts)
#   T3 Code    T3CODE_PROJECT_ROOT (the main checkout) / T3CODE_WORKTREE_PATH;
#              T3 hands out no port, so `allocate_port` picks one and setup
#              stores it in the worktree's .env as DEV_PORT.
#   Terminal   neither set: the worktree is $PWD and the root is the git
#              main worktree.

set -euo pipefail

if [ -n "${CONDUCTOR_ROOT_PATH:-}" ]; then
  WORKSPACE_HOST="conductor"
  # Conductor's own clone (~/conductor/repos/<repo>), NOT your main checkout.
  ROOT="$CONDUCTOR_ROOT_PATH"
  WS_PATH="${CONDUCTOR_WORKSPACE_PATH:-$PWD}"
elif [ -n "${T3CODE_PROJECT_ROOT:-}" ]; then
  WORKSPACE_HOST="t3"
  ROOT="$T3CODE_PROJECT_ROOT"
  WS_PATH="${T3CODE_WORKTREE_PATH:-$PWD}"
else
  WORKSPACE_HOST="terminal"
  WS_PATH="$PWD"
  # The main worktree owns the shared git dir: its parent is the main checkout.
  ROOT="$(dirname "$(git -C "$WS_PATH" rev-parse --path-format=absolute --git-common-dir)")"
fi
# Only the root's untracked files matter here: .env (copied into each
# workspace) and, optionally, .env.production.pulled.
WS_NAME="${CONDUCTOR_WORKSPACE_NAME:-$(basename "$WS_PATH")}"

MAIN_DB="payload"
DB_HOST="127.0.0.1:54320"
# Same image as docker-compose.yml / scripts/dev-tui/constants.ts — dumping
# production with the container's own pg_dump avoids client/server mismatch.
POSTGRES_IMAGE="pgvector/pgvector:pg18"
# Vercel-pulled production env in the root (same file/convention as the dev
# TUI). Optional: only needed for `setup.sh --from production`.
PROD_ENV_FILE="$ROOT/.env.production.pulled"

# The main checkout is not a workspace: it keeps its own .env, the shared
# 'payload' DB and port 3001. T3 Code runs project scripts there too (a thread
# in local mode), so every script checks this before touching anything.
is_main_checkout() {
  [ "$(cd "$WS_PATH" && pwd -P)" = "$(cd "$ROOT" && pwd -P)" ]
}

require_root() {
  [ -d "$ROOT" ] || {
    echo "workspace: root checkout '$ROOT' not found." >&2
    exit 1
  }
  if is_main_checkout; then
    echo "workspace: this is the main checkout, not a worktree; it keeps its own .env and DB. Nothing to set up." >&2
    exit 1
  fi
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
        printf 'workspace: %s sets %s to a database other than %s (%s).\n' \
          "$f" "$key" "$DB_NAME" "$(printf '%s' "$url" | sed -E 's#://[^@]*@#://***@#')" >&2
        printf 'workspace: Next.js reads that file over .env. Remove it: mv %s %s.neon-bak\n' "$f" "$f" >&2
        exit 1
        ;;
      esac
    done
  done
}
# archive.sh sources lib.sh only to drop the DB; a stale .env.local must not block archiving.
# The main checkout is not a workspace and owns its override files.
[ "${CONDUCTOR_ARCHIVING:-0}" = 1 ] || is_main_checkout || assert_no_db_override


# ---------------------------------------------------------------------------
# Ports
#
# Conductor reserves CONDUCTOR_PORT..+9 per workspace without checking the
# port is free: an orphaned dev server from an earlier session (any repo) can
# still hold it, and the Open button would reach that project. Refuse to start.
# ---------------------------------------------------------------------------

# "<pid> <cwd>" of whatever listens on TCP port $1; fails when the port is free.
port_owner() {
  local pid cwd
  pid="$(lsof -nP -iTCP:"$1" -sTCP:LISTEN -t 2>/dev/null | head -n1 || true)"
  [ -n "$pid" ] || return 1
  cwd="$(lsof -a -p "$pid" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p' | head -n1)"
  printf '%s %s' "$pid" "${cwd:-unknown}"
}

assert_port_free() {
  local port="$1" owner pid cwd
  owner="$(port_owner "$port")" || return 0
  pid="${owner%% *}" cwd="${owner#* }"
  echo "workspace: port $port is already taken by pid $pid ($cwd)." >&2
  case "$cwd" in
  "$(cd "$WS_PATH" && pwd -P)"*)
    echo "workspace: that is this workspace's own server; stop it first: kill $pid" >&2
    ;;
  *)
    echo "workspace: it belongs to another checkout, so this workspace will not share it." >&2
    echo "workspace: stop it if it is stale (kill $pid), then Run again." >&2
    ;;
  esac
  exit 1
}

# T3 Code hands out no port. Each worktree takes the first even port in
# WORKTREE_PORT_FIRST..LAST (Next on it, Storybook on +1) that no other
# worktree's .env claims as DEV_PORT and nothing listens on, and setup stores
# it, so a worktree keeps its port across restarts. The range is this repo's
# in the machine registry (conductor-workspace-setup skill, registry.md).
WORKTREE_PORT_FIRST=3200
WORKTREE_PORT_LAST=3298

# DEV_PORT values every other worktree of this repo has claimed.
claimed_worktree_ports() {
  local wt real_ws
  real_ws="$(cd "$WS_PATH" && pwd -P)"
  git -C "$WS_PATH" worktree list --porcelain 2>/dev/null | sed -n 's/^worktree //p' |
    while IFS= read -r wt; do
      [ -d "$wt" ] || continue
      [ "$(cd "$wt" && pwd -P)" = "$real_ws" ] && continue
      read_env_key "$wt/.env" DEV_PORT 2>/dev/null || true
      echo
    done
}

allocate_port() {
  local claimed port
  claimed=" $(claimed_worktree_ports | tr '\n' ' ') "
  for ((port = WORKTREE_PORT_FIRST; port <= WORKTREE_PORT_LAST; port += 2)); do
    case "$claimed" in *" $port "*) continue ;; esac
    port_owner "$port" >/dev/null && continue
    port_owner "$((port + 1))" >/dev/null && continue
    printf '%s' "$port"
    return 0
  done
  echo "workspace: no free port pair in $WORKTREE_PORT_FIRST-$WORKTREE_PORT_LAST" >&2
  return 1
}

# This workspace's port: Conductor's, the main checkout's 3001, the one setup
# stored for a T3 worktree, else the next free pair (setup stores it).
if [ -n "${CONDUCTOR_PORT:-}" ]; then
  PORT="$CONDUCTOR_PORT"
elif is_main_checkout; then
  PORT=3001
else
  PORT="$(read_env_key "$WS_PATH/.env" DEV_PORT 2>/dev/null || true)"
  [ -n "$PORT" ] || PORT="$(allocate_port)"
fi

# The launcher (Conductor's Run button) can hand the script a process env that
# already contains POSTGRES_URL from the root clone's .env, and Next.js lets the
# process env win over the workspace .env — the dev server then silently uses
# the shared 'payload' DB while the banner claims payload_<city>. Pin both the
# DB URL and the public URL in the process env so .env and reality agree.
if ! is_main_checkout; then
  export POSTGRES_URL="postgresql://postgres@$DB_HOST/$DB_NAME"
  export NEXT_PUBLIC_SERVER_URL="http://localhost:$PORT"
fi

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

# 54320 must be this repo's container (compose project `sas-site`), never
# milesroxas-site's (54330) or anything else: the app connects by port, not by name.
assert_db_port_ours() {
  local port="${DB_HOST##*:}" project owner
  project="$(docker ps --filter "publish=$port" --format '{{.Label "com.docker.compose.project"}}' | head -n1)"
  if [ -n "$project" ]; then
    [ "$project" = sas-site ] && return 0
    echo "workspace: port $port is published by docker project '$project', not 'sas-site'." >&2
    exit 1
  fi
  if owner="$(port_owner "$port")"; then
    echo "workspace: port $port is held by pid ${owner%% *} (${owner#* }), not the sas-site postgres container." >&2
    exit 1
  fi
}

ensure_postgres() {
  if ! docker info >/dev/null 2>&1; then
    echo "workspace: Docker is not running — start Docker Desktop first." >&2
    exit 1
  fi
  # `up` only when nothing is running: `docker compose up` re-creates a running
  # container whenever the rendered config differs from the one it was started
  # with (e.g. compose.yml changed on this branch), which drops every other
  # workspace's DB connections mid-request.
  if ! postgres_running; then
    assert_db_port_ours
    compose up -d postgres
  fi
  assert_db_port_ours
  local i=0
  until compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; do
    i=$((i + 1))
    if [ "$i" -gt 60 ]; then
      echo "workspace: postgres did not become healthy within 60s" >&2
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
    echo "workspace: refusing to touch database '$1' (not a workspace DB)" >&2
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
    echo "workspace: vercel CLI not found (npm i -g vercel) — cannot pull production env" >&2
    return 1
  fi
  echo "workspace: pulling Vercel production env → $PROD_ENV_FILE"
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
    echo "workspace: no POSTGRES_URL in $PROD_ENV_FILE — re-pull production env" >&2
    return 1
  fi
  echo "workspace: dumping production content into $DB_NAME (this can take a minute)"
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
  echo "workspace: creating database $DB_NAME"

  if [ "$from" = "production" ]; then
    if ensure_production_env && seed_db_from_production; then
      WORKSPACE_DB_SOURCE="production"
      echo "workspace: $DB_NAME seeded from production"
      return 0
    fi
    echo "workspace: production seed unavailable — falling back to a clone of '$MAIN_DB'" >&2
    # A failed restore may be partial; start over clean.
    drop_workspace_db "$DB_NAME"
  fi

  if db_exists "$MAIN_DB"; then
    if clone_local_db; then
      WORKSPACE_DB_SOURCE="local"
      echo "workspace: $DB_NAME cloned from '$MAIN_DB'"
      return 0
    fi
    drop_workspace_db "$DB_NAME"
    echo "workspace: clone of '$MAIN_DB' into $DB_NAME failed" >&2
    exit 1
  fi

  # Nothing to copy from — empty DB; drizzle push builds the schema on first Run.
  psql_c -c "CREATE DATABASE \"$DB_NAME\""
  psql_c -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS vector"
  WORKSPACE_DB_SOURCE="empty"
  echo "workspace: $DB_NAME created empty ('$MAIN_DB' does not exist yet)"
}

# Upsert KEY=VALUE in the workspace .env (BSD sed — macOS). Delete-then-append
# so values with sed metacharacters (&, |, \ — e.g. secrets) survive intact.
set_env() {
  local key="$1" value="$2"
  sed -i '' "/^${key}=/d" .env
  printf '%s=%s\n' "$key" "$value" >>.env
}
