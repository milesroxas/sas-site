# Suits & Sandals

The website and content hub for [Suits & Sandals](https://www.suits-sandals.com). Payload CMS runs inside this Next.js app: the admin and the API live at `/admin` and `/api`, and the public site reads content through the Local API. Postgres stores the records. Cloudflare R2 stores media.

Client work is written once in the Content Hub. The website is a publishing surface composed from those records. Work Pages and Lab Pages select, order, and style that material. They do not copy it. The full model is in [docs/architecture.md](docs/architecture.md). Editorial rules for the site are in [docs/editorial/website.md](docs/editorial/website.md). House voice is in [docs/editorial/voice.md](docs/editorial/voice.md).

## Documentation

| Doc | For | Covers |
| --- | --- | --- |
| [docs/architecture.md](docs/architecture.md) | Developers | Content model, access control, how a page resolves canonical copy |
| [docs/editorial/content-hub.md](docs/editorial/content-hub.md) | Editors | Clients, projects, case studies, lab projects, testimonials, assets |
| [docs/editorial/website.md](docs/editorial/website.md) | Editors | Surfaces, composition, preview, publishing |
| [docs/editorial/editorial-guide.md](docs/editorial/editorial-guide.md) | Editors | Structure and writing standards for service, audience, and industry pages |
| [docs/editorial/voice.md](docs/editorial/voice.md) | Editors, agents | House voice, and what a save refuses |
| [docs/inquiries.md](docs/inquiries.md) | Developers, editors | Contact templates, the inquiries inbox, email notification |
| [docs/cms-naming.md](docs/cms-naming.md) | Developers, editors | Admin names: tabs, groups, field labels, blocks |
| [docs/aeo.md](docs/aeo.md) | Developers, editors | Answer-engine optimization: llms.txt, IndexNow, JSON-LD |
| [docs/mcp.md](docs/mcp.md) | Developers | Internal MCP server at `/api/mcp` |
| [docs/figures.md](docs/figures.md) | Developers | Chart, diagram, and bespoke figure blocks |
| [docs/animations.md](docs/animations.md) | Developers | Route transitions, scroll reveals, tuning |
| [docs/immersive-effects.md](docs/immersive-effects.md) | Developers | WebGL effects, defaults, and presets |
| [docs/streak-field.md](docs/streak-field.md) | Developers, editors | Streak Field as CMS media |
| [docs/studio-effects.md](docs/studio-effects.md) | Developers | Studio authoring contract and adding an effect |
| [docs/conductor.md](docs/conductor.md) | Developers | Parallel workspaces and per-workspace databases |
| [docs/lab-journal/README.md](docs/lab-journal/README.md) | The team | Recording a feature, then drafting its Lab Page |
| [src/features/ask/README.md](src/features/ask/README.md) | Developers | Ask: retrieval, surfaces, inbox, handoff |
| [AGENTS.md](AGENTS.md) | Agents | Always-on contract for Cursor, Claude Code, and Codex |

## Stack

| Layer | Choice |
| --- | --- |
| App | Next.js 16 (App Router), React 19, TypeScript 6 |
| CMS | Payload 3.88, Lexical, Postgres (`@payloadcms/db-vercel-postgres`) |
| Storage | Cloudflare R2 (`@payloadcms/storage-s3`) |
| Email | Resend, React Email |
| UI | Tailwind CSS 4, shadcn/ui |
| Motion and 3D | Lenis, GSAP, React Three Fiber |
| AI | Vercel AI SDK, OpenAI, pgvector embeddings for `/ask` |
| Analytics | PostHog, Sentry, Vercel Speed Insights, c15t consent |
| Tooling | pnpm, Biome, Vitest, Playwright, Storybook |

## Local development

### Prerequisites

- Node.js `>=22` (`package.json` → `engines`)
- [pnpm](https://pnpm.io), version pinned in `packageManager`. Enable it with Corepack: `corepack enable`
- Docker, for local Postgres via `pnpm db:up`

### Install

```bash
git clone https://github.com/milesroxas/sas-site.git
cd sas-site
pnpm install
```

### Environment

```bash
cp .env.example .env
```

| Variable | Purpose |
| --- | --- |
| `PAYLOAD_SECRET` | JWT signing. Use a long random string. |
| `POSTGRES_URL` | Database URL. The default matches Docker (`pnpm db:up`, port `54320`, database `payload`). |
| `NEXT_PUBLIC_SERVER_URL` | Public site URL, for example `http://localhost:3001`. No trailing slash. |
| `CRON_SECRET` | Bearer token for the jobs runner at `/api/payload-jobs/run`. |
| `PREVIEW_SECRET` | Draft and live preview URLs. |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | Cloudflare R2 media storage. |
| `R2_PUBLIC_URL`, `NEXT_PUBLIC_MEDIA_URL` | Public R2 domain. Client components load video from the CDN. |
| `RESEND_API_KEY`, `RESEND_FROM_ADDRESS`, `RESEND_FROM_NAME` | Transactional email. |
| `EMAIL_ASSET_BASE_URL` | Public base URL for images in emails. |

Anything else in `.env.example` is optional. The feature stays off when its variable is unset. That includes Ask (`OPENAI_API_KEY`), Sentry, PostHog, c15t, IndexNow, and the CMS upload script (`CMS_MCP_API_KEY`, `CMS_UPLOAD_SERVER`).

`.env` is the env file for local dev, and it is gitignored. Do not add `.env.local`. Next.js loads that file ahead of `.env`, and a bare `vercel env pull` writes a full cloud dump there, including a `POSTGRES_URL` that points this checkout at a remote database. Pull cloud envs through the dev TUI. It writes `.env.*.pulled` files, which Next.js never auto-loads.

### Database

```bash
pnpm db:up      # Postgres on host port 54320
pnpm db:down    # stop the compose stack
```

Or point `POSTGRES_URL` at a Postgres instance you control.

### Run

```bash
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001). The admin panel is `/admin`. Create the first user on the first visit.

After schema or admin component changes:

```bash
pnpm generate:types
pnpm generate:importmap
```

## Dev TUI

`pnpm dev:tui` opens an interactive menu in a real TTY: the dev server, database tasks, the Payload CLI, checks, and builds.

- **Dev server, default env.** Plain `pnpm dev`. `POSTGRES_URL` comes from the `.env` chain.
- **Dev server, local Docker DB.** Forces `POSTGRES_URL` to the compose Postgres for that run and starts the container. No env file is edited.
- **Dev server, production DB.** Reads `POSTGRES_URL` and `PAYLOAD_SECRET` from `.env.production.pulled`, and sets `PAYLOAD_DB_PUSH=false` so dev push cannot change the production schema. Admin writes are still real.
- **Pull production content into the local Docker DB.** Dumps production and restores it over the local `payload` database. Local data is replaced and is not backed up. Use **Database → Back up local Docker DB** first if the local database holds work you need.

**Database** also covers seed, `seed:drop`, and start, stop, and backup.

Both production options pull `.env.production.pulled` when it is missing (the `vercel` CLI). They do not refresh a file that already exists. Use **Database → Pull Vercel production env** after credentials rotate.

| File | Role |
| --- | --- |
| `.env` | Local env: Docker database URL and secrets, copied from `.env.example` |
| `.env.production.pulled` | Written by **Pull Vercel production env**. Read by the TUI only. |
| `.env.development.pulled` | Optional pull of the development env. Reference only. |

Keep production credentials out of `.env.local` and `.env.production.local`. Next.js auto-loads those names, which would send a plain `pnpm dev` or `pnpm build` at a cloud database.

## Layout

```
src/
├── app/(frontend)/          # Public site
├── app/(payload)/           # Admin, REST, GraphQL
├── collections/             # The 24 collections registered in payload.config.ts
├── blocks/                  # Layout and story blocks
├── features/                # ask, immersive, figures, cursor, contents, editorial
├── plugins/                 # SEO, search, forms, AEO, MCP, Studio, figures, house style
├── Header/ Footer/ Home/    # Globals
├── CollectionIndexes/       # insights-index, lab-index, works-index
├── migrations/
└── payload.config.ts
scripts/                     # Dev TUI, seed, migration checks, cms upload
docs/
tests/                       # Vitest and Playwright
```

Path alias: `@/*` → `src/*`. Payload config: `@payload-config`.

## Content model

Detail is in [docs/architecture.md](docs/architecture.md). Surfaces and how to compose them are in [docs/editorial/website.md](docs/editorial/website.md).

`src/payload.config.ts` registers 24 collections:

| Group | Collections | Role |
| --- | --- | --- |
| Website | `pages`, `posts`, `work-pages`, `lab-pages`, `expertise-pages`, `audience-pages`, `contact-pages` | Publishing surfaces with public URLs |
| Content Hub | `organizations`, `projects`, `case-studies`, `lab-projects`, `testimonials` | Canonical source material |
| Assets | `media`, `asset-libraries` | Uploads and project-scoped libraries |
| Taxonomy | `capabilities`, `industries`, `platforms`, `categories` | Shared vocabulary |
| Inbox | `inquiries`, `ask-questions` | Contact submissions and Ask questions. Team-only. |
| Newsletter | `newsletters`, `audiences`, `subscribers` | Sends through Resend. Team-only. |
| System | `users` | Admin auth |

Plugins add `redirects`, `forms`, `form-submissions`, `search`, `streak-looks`, `streak-releases`, `streak-renders`, and `payload-mcp-api-keys`.

Globals: `home`, `insights-index`, `lab-index`, `works-index`, `header`, `footer`, and `site-info` (the AEO plugin). Each Work Page presents one Case Study. Each Lab Page presents one Lab Project. Both records share the same narrative sections, and the page blocks resolve a section or one story beat at render time.

Public URLs:

| Surface | URL |
| --- | --- |
| Home | `/` |
| Insights, Lab, Works | `/insights`, `/lab`, `/works` |
| Posts, topic hubs | `/posts/[slug]`, `/insights/[topic]` |
| Work, Lab, Expertise, Audience | `/works/[slug]`, `/lab/[slug]`, `/expertise/[slug]`, `/who-we-help/[slug]` |
| Pages, Contact | `/[slug]`, `/contact`, `/contact/[slug]` |

## Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Next.js dev server on port 3001 |
| `pnpm dev:tui` | Interactive dev menu |
| `pnpm build` / `pnpm start` | Production build (sitemap in `postbuild`) / serve it |
| `pnpm dev:prod` | Clean build, then start |
| `pnpm db:up` / `pnpm db:down` / `pnpm db:reset` | Start Postgres / stop it / destroy the volume and start empty |
| `pnpm generate:types` | Regenerate `payload-types.ts` |
| `pnpm generate:importmap` | Regenerate the admin `importMap.js` |
| `pnpm migrate:create` | Write a migration from the schema diff. Review it, then commit the `.ts` and `.json` together. |
| `pnpm check:migrations` | Fail a migration that adds an enum label and uses it in the same `up()`, or casts text to an enum without a normalizing `UPDATE` |
| `pnpm check:migrations:drift` | Compare the newest migration snapshot with the current Payload config. No database. |
| `pnpm migrate:status` | Read-only report of the production migration ledger |
| `pnpm seed` / `pnpm seed:drop` | Upsert local review content / wipe content collections, then seed |
| `pnpm cms:upload` | Upload an image for CMS review. See [docs/figures.md](docs/figures.md). |
| `pnpm editorial:voice` | List house-voice problems in a document. See [docs/editorial/voice.md](docs/editorial/voice.md). |
| `pnpm lab:journal` | Lab journal CLI. See [docs/lab-journal/README.md](docs/lab-journal/README.md). |
| `pnpm lint` / `pnpm lint:fix` | Biome |
| `pnpm test:int` / `pnpm test:e2e` / `pnpm test` | Vitest / Playwright / both |
| `pnpm storybook` | Storybook on port 6006 |
| `pnpm email` | React Email template preview |
| `pnpm ci` | Guard the preview database, run `payload migrate`, then build. This is the deploy command. |

## Database & migrations

Push in development. Migrations in CI.

**Local.** `pnpm dev` syncs the schema with Drizzle push. Do not run `payload migrate` on the local database. Push and migrations on one database corrupt the migration ledger. The dev TUI exposes `migrate:create` only, which writes a file and changes nothing.

**Production.** `pnpm ci` is the only writer of the production schema and the `payload_migrations` ledger: `payload migrate`, then `pnpm build`.

```bash
pnpm migrate:create           # after schema changes: a file to review and commit
pnpm check:migrations         # enum safety
pnpm check:migrations:drift   # newest snapshot against the current config
pnpm migrate:status           # production ledger only
```

`pnpm migrate:status` reads production through `.env.production.pulled`. The local database has no meaningful ledger, because its schema comes from push. "No" means a committed migration is not deployed yet. "Yes" means CI has applied it. Pull the production env from the dev TUI first if the file is missing. Do not run `payload migrate:status` against the local database.

**Flow.** Change the config, run `pnpm dev` so push syncs locally, run `pnpm migrate:create`, review the SQL, run both checks, and commit the `.ts` and `.json` together. CI applies the migration on deploy.

**Parallel workspaces.** Each Conductor workspace has its own database. `migrate:create` diffs against the newest snapshot file, so the last migration to merge has to be generated on top of the others. [docs/conductor.md](docs/conductor.md).

**Postgres enum values.** Payload runs each migration inside a transaction. A label added with `ALTER TYPE ... ADD VALUE` cannot be used until that transaction commits. If `migrate:create` both adds a label and sets it as a default in one `up()`, recreate the enum in that migration, or split the add and the use across two migrations. `pnpm check:migrations` and the pre-push hook catch the unsafe pattern.

**Pre-push.** `.githooks/pre-push` (installed by `pnpm install`) rejects a push that changes schema files without a new migration. It also runs the enum check on changed migrations and the drift check when schema or migrations changed. `SKIP_MIGRATION_GUARD=1 git push` skips the guard. Use it only when you are sure no migration is required.

Agents follow [AGENTS.md](AGENTS.md): do not run `pnpm migrate:create` unless someone asks, and do not run `payload migrate` locally.

### Reset the local database

```bash
pnpm db:reset   # destroy the volume and start a fresh container
pnpm dev        # push rebuilds the schema
```

This deletes local content. Production is untouched. The pgvector extension is created on a fresh init by `docker-compose.yml`. Reseed with `pnpm seed`, then `pnpm exec tsx --env-file=.env scripts/seed-contact-page.ts` for `/contact`.

### Seed

`pnpm seed` upserts placeholder review content into the local Docker database: taxonomy, clients, projects, case studies, work pages, posts, lab, expertise, and audience pages, and the Home global. It reuses existing media. It refuses to run unless `POSTGRES_URL` is local (`127.0.0.1` or `localhost`). Pass `--allow-remote` to override.

`pnpm seed:drop` wipes content collections first, then seeds. The wipe covers pages, posts, work, lab, expertise, and audience pages, testimonials, case studies, lab projects, asset libraries, projects, organizations, categories, newsletter audiences, forms, and form submissions. Users, media, newsletters, subscribers, redirects, contact pages, inquiries, and Ask questions are left in place.

## Deployment

Production is [www.suits-sandals.com](https://www.suits-sandals.com), on Vercel, with Neon Postgres and Cloudflare R2. `vercel.json` sets the build to `pnpm ci` and a cron every 10 minutes against `/api/payload-jobs/run`.

`ignoreCommand` points at `scripts/vercel-ignore-build.sh`. The build is canceled when every file changed since the last successful deployment on the branch is one the site never reads (docs, agent config, tests, stories, lint, Storybook). An unlisted path, a missing base commit, or a same-commit redeploy still builds. A skipped push shows as Canceled in Vercel. To force a build, redeploy from the dashboard with **Use project's Ignore Build Step** unchecked. New inert paths go in `INERT_RES` in that script.

The job queue sends newsletters, runs scheduled publishing, and retains Ask questions. It drains when `/api/payload-jobs/run` is called. The Vercel cron is the scheduler. `.github/workflows/payload-jobs.yml` declares the same 10-minute cadence, but GitHub drops most scheduled runs, so that workflow is a backstop. It needs the `PAYLOAD_JOBS_URL` and `CRON_SECRET` repository secrets. `VERCEL_AUTOMATION_BYPASS_SECRET` matters only if production sits behind Vercel Deployment Protection.

Required Vercel env vars: `PAYLOAD_SECRET`, `CRON_SECRET`, `PREVIEW_SECRET`, the Resend keys, and the `R2_*` / `NEXT_PUBLIC_MEDIA_URL` media vars. The Neon integration sets `POSTGRES_URL`. `PRODUCTION_DB_ENDPOINT` (the production Neon endpoint id, `ep-...`) feeds `scripts/guard-preview-db.ts`, which `pnpm ci` runs before `payload migrate`. Preview deploys receive a Neon branch (`preview/<git-branch>`). The guard aborts a non-production build that still sees the production endpoint. Git pushes build `main` only (`vercel.json`).

## Testing

```bash
pnpm test:int    # Vitest
pnpm test:e2e    # Playwright
pnpm test        # both
```

## License

Noncommercial use only, under [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0). The terms are in [LICENSE](LICENSE). You may copy, run, change, and share this repository for a noncommercial purpose, including research, experiment, study, and hobby projects. Commercial use, including client work and resale, needs a separate license from Suits & Sandals.

Code that came from the Payload website template stays under that template's MIT license. Dependencies keep their own licenses.
