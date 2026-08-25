# Conductor workspaces

[Conductor](https://www.conductor.build/docs) runs several agents in parallel, each in its own git worktree. This repo's shared settings live in `.conductor/settings.toml`; the scripts it points at live in `.conductor/*.sh`. Personal overrides go in `.conductor/settings.local.toml` (gitignored).

## What a workspace gets

| Thing | Where it comes from |
|-------|---------------------|
| Worktree | `~/conductor/workspaces/sas-site/<city>` — Conductor also adds a `<branch-name>` symlink beside it once the branch is renamed |
| `.env` | Copied from the Conductor root checkout (`$CONDUCTOR_ROOT_PATH` = `~/conductor/repos/sas-site`, Conductor's own clone — **not** your main checkout). Keep that `.env` in sync with your main one; only `POSTGRES_URL` and `NEXT_PUBLIC_SERVER_URL` are rewritten per workspace |
| Ports | `$CONDUCTOR_PORT` for Next, `+1` for Storybook (Conductor reserves `CONDUCTOR_PORT..+9`) |
| Database | `payload_<city>` in the one shared `sas-site-postgres` container, cloned from the main dev DB `payload` |
| Media / R2, Resend, Sentry, … | Shared with your main checkout — same keys, same buckets |

Never create `.env.local` in a workspace. Next.js loads it **over** `.env`, and `vercel env pull` writes it by default with `POSTGRES_URL` = Neon production — dev push would then offer to drop production tables. `lib.sh` refuses to run setup/dev/storybook while `.env.local` or `.env.development.local` names any DB other than the workspace one (`mv .env.local .env.local.neon-bak`). Pull production env only from the main checkout via the dev TUI, which writes `.env.production.pulled`.

`run_mode = "concurrent"`: because port and DB are per-workspace, any number of workspaces can run at once.

## Scripts

| Script | When | What |
|--------|------|------|
| `setup.sh` | Workspace created; re-runnable | Copy `.env`, rewrite `POSTGRES_URL` / `NEXT_PUBLIC_SERVER_URL`, `pnpm install`, start postgres if needed, create the workspace DB |
| `run-dev.sh` | Run ▶ (default) | Re-ensure postgres + DB, `next dev -p $CONDUCTOR_PORT` |
| `run-storybook.sh` | Run ▶ Storybook | `storybook dev -p $((CONDUCTOR_PORT+1))` |
| `archive.sh` | Before archive | Drop the workspace DB. Never fails the archive |
| `prune-dbs.sh` | Manual | Drop `payload_*` DBs no live workspace references (dry run unless `--yes`) |

All of them source `lib.sh`, run from the workspace directory, and only touch the DB named in the workspace's `.env`.

### Database identity

The DB is keyed on the workspace **directory** (`payload_<city>`), and once `.env` exists its `POSTGRES_URL` is the source of truth. It is deliberately not keyed on `$CONDUCTOR_WORKSPACE_NAME`: Conductor renames the workspace to the branch name after the first chat, so a name-keyed DB got re-created under the new name on the next Run and the archive dropped the wrong one — orphans accumulated at ~50 MB each. Reclaim any leftovers:

```bash
bash .conductor/prune-dbs.sh        # list orphans
bash .conductor/prune-dbs.sh --yes  # drop them
```

### Seeding and reseeding

New workspace DBs are cloned from the main dev DB `payload` (`CREATE DATABASE … TEMPLATE` when nothing is connected to `payload`, otherwise `pg_dump | psql`). `payload` is itself a production restore (see README → Reset local database), so a clone is prod-equivalent content in seconds, offline. Options from a workspace terminal:

```bash
bash .conductor/setup.sh --reseed                    # fresh clone of payload
bash .conductor/setup.sh --reseed --from production  # pg_dump straight from Neon
```

`--from production` needs `.env.production.pulled` in the Conductor root (`~/conductor/repos/sas-site`) or a logged-in `vercel` CLI; it falls back to the local clone otherwise, and sets `PAYLOAD_SECRET` to production's so encrypted fields decrypt.

### Shared container, never re-created from a workspace

`docker-compose.yml` pins `name: sas-site`, so every checkout addresses the same container. `docker compose up` re-creates a running container whenever the rendered config differs from the one it started with, dropping every workspace's connections — so `lib.sh` only runs `up` when nothing is running, and the compose file keeps the initdb SQL inline (a bind-mounted directory's absolute path made the config differ per checkout).

## Schema changes across workspaces

At the database level nothing is shared: each workspace's DB is drizzle-**push**-synced from its own branch on `pnpm dev`, exactly like the main checkout. Two workspaces can add, rename or drop fields independently.

The coupling is in the **migration files**. `payload migrate:create` does not look at any database — it diffs the current config against the newest `src/migrations/*.json` snapshot (newest by filename). That gives one rule:

> **Your migration's snapshot must be generated on top of the newest migration on `main` at the time you merge.**

Why: workspace A and workspace B both branch from `main` whose newest snapshot is S₀. A generates `T1_a` (snapshot S₀+A), B generates `T2_b` (snapshot S₀+B). Both migrations apply cleanly in CI. But after both merge, the newest snapshot is S₀+B — it does not know about A. The next `migrate:create` on any branch diffs against S₀+B and re-emits A's `ADD COLUMN`s; CI's `payload migrate` then fails on `already exists` and the deploy is dead.

Procedure for a branch that carries a migration:

1. Before opening / merging the PR: `git fetch origin && git rebase origin/main`.
2. Did `origin/main` gain migration files newer than the one your migration was generated against? Then delete your migration (`.ts` **and** `.json`), and regenerate it — `pnpm migrate:create <name>` (ask first, per `AGENTS.md`) — so its snapshot includes main's changes and its timestamp sorts last.
3. `pnpm check:migrations` (enum safety) and `pnpm check:migrations:drift` (newest snapshot == config). The pre-push hook runs both whenever schema source or migrations changed.
4. `src/migrations/index.ts` conflicts: keep both branches' imports/entries in filename order, or just let `migrate:create` rewrite it.

`pnpm check:migrations:drift` is the same diff `migrate:create` would run, with no DB connection and no files written. It also catches the older failure mode — a field added after the migration was generated. If drizzle asks a create-vs-rename question during the check, the answer is irrelevant: a prompt already means the snapshot and the config disagree.

Merge order does not matter as long as the last migration to land was regenerated on top of the others. Two workspaces should never generate a migration for the *same* change; one branch owns a schema change.

After rebasing, `pnpm dev` push re-syncs the workspace DB. If push warns about data loss (a column removed on `main`), accept — the workspace DB is disposable — or `bash .conductor/setup.sh --reseed`.

## Worktrees outside Conductor

A hand-made worktree (`git worktree add …`) that copies the main `.env` shares the `payload` DB and port 3001 with the main checkout. Two branches pushing different schemas into one DB fight each other (columns added/dropped on every restart, data-loss prompts). Either run that branch in Conductor, or give it its own DB the same way: `CREATE DATABASE payload_x TEMPLATE payload` and point its `.env` at it.

## Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| Run: `no .env in this workspace` | Setup never ran — Conductor → Run setup script, or `bash .conductor/setup.sh` |
| `Docker is not running` | Start Docker Desktop; Run re-ensures the container |
| Dev server reads/writes the shared `payload` DB although `.env` names `payload_<city>` | Launcher injected `POSTGRES_URL` into the process env (Next.js prefers process env over `.env`). `lib.sh` exports the workspace URL explicitly; restart Run ▶ |
| `.env.local sets POSTGRES_URL to a database other than …` | `vercel env pull` ran in the workspace. `mv .env.local .env.local.neon-bak`, restart |
| `$CONDUCTOR_ROOT_PATH/.env not found` | Copy your main checkout's `.env` to `~/conductor/repos/sas-site/.env` |
| Setup slow (~30 s) on "creating database" | Something is connected to `payload` (main dev server), so `TEMPLATE` was refused and it fell back to dump/restore. Normal |
| Dev server exits right after a schema change | Drizzle push asked to confirm data loss and got no TTY. Run `pnpm dev` once in the workspace terminal and answer, or `setup.sh --reseed` |
| Disk filling with `payload_*` DBs | `bash .conductor/prune-dbs.sh --yes` |
| CI `payload migrate`: `column … already exists` | The snapshot rule above was broken — regenerate the last-merged migration on top of main |
