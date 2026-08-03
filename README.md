# Suits & Sandals — Website & Content Hub

Marketing website and structured content hub for Suits & Sandals, built on [Payload CMS](https://payloadcms.com) and [Next.js 16](https://nextjs.org), deployed to Vercel with Neon Postgres and Cloudflare R2 media storage.

Canonical client-work content (clients, projects, case studies, testimonials, approved assets) lives in a channel-agnostic **Content Hub**. The **Website** is one publishing surface composed from that content — future surfaces (pitch decks, proposals, email) consume the same source material through Payload's API. See [docs/architecture.md](docs/architecture.md) for the full model.

## Documentation

| Doc | For | Covers |
| --- | --- | --- |
| [docs/architecture.md](docs/architecture.md) | Developers | Headless CMS model, collection map, access control, publishing pipeline |
| [docs/editorial/content-hub.md](docs/editorial/content-hub.md) | Editors | Creating clients, projects, case study content, testimonials, assets |
| [docs/editorial/website.md](docs/editorial/website.md) | Editors | Website surfaces, composing work pages, preview and publishing |
| [docs/aeo.md](docs/aeo.md) | Developers, Editors | Answer-engine optimization: llms.txt, IndexNow, JSON-LD, editorial guidance |
| [docs/mcp.md](docs/mcp.md) | Developers | Internal MCP server at `/api/mcp`: API keys, capabilities, security model |
| [docs/immersive-effects.md](docs/immersive-effects.md) | Developers | WebGL effects: architecture, defaults/presets contract, playground workflow |
| [docs/prds/content-hub.md](docs/prds/content-hub.md) | Reference | Original PRD and architecture amendment |
| [AGENTS.md](AGENTS.md) | Agents (Cursor / Claude / Codex) | Slim always-on contract: DB, security, tooling; Payload how-to in `.agents/skills/payload` |

## Stack

| Layer | Technologies |
| --- | --- |
| App | Next.js 16 (App Router), React 19, TypeScript 6 |
| CMS | Payload 3.85, Lexical rich text, Postgres (`@payloadcms/db-vercel-postgres`) |
| Storage | Cloudflare R2, S3-compatible (`@payloadcms/storage-s3`) |
| Email | Resend (`@payloadcms/email-resend`), React Email |
| UI | Tailwind CSS 4, shadcn/ui, Geist |
| Motion / 3D | Lenis, React Three Fiber, Three.js, Tempus, GSAP |
| Tooling | pnpm, Biome, Vitest, Playwright, Storybook + Chromatic |

## Features

**Content Hub** (canonical, channel-agnostic)

- Clients, Projects, Case Study Content, Testimonials — drafts, versions, scheduled publishing
- Asset Libraries scoping approved media to projects
- Approval workflows: media `usageStatus`, testimonial `approvalStatus`, per-metric `approvedForPublic`
- Internal fields (notes, sources, claims) hidden from anonymous API reads

**Website** (publishing surfaces)

- Pages (layout builder), Posts with Insights topic hubs, Work Pages (`/works`), Lab Pages (`/lab`), Expertise Pages (`/expertise`), Audience Pages (`/who-we-help`)
- Work Pages compose case-study content through typed blocks with override-then-canonical resolution
- Draft preview, live preview, on-demand revalidation, per-surface sitemaps, SEO, search, redirects

**Immersive stack** (custom)

- Global WebGL canvas mounted once in the root layout; tunnel pattern for DOM ↔ WebGL composition
- `ImmersiveShell` for opt-in GPU layers; site-wide Lenis smooth scroll; React View Transitions
- Demo page at `/demo/immersive`

**Agents & AI**

- AEO plugin: `/llms.txt`, IndexNow pings, JSON-LD, markdown alternates ([docs/aeo.md](docs/aeo.md))
- Internal MCP server at `/api/mcp` for agent-driven content authoring with per-key capabilities ([docs/mcp.md](docs/mcp.md))

## Prerequisites

- **Node.js** `>=22` (see `package.json` → `engines`)
- **[pnpm](https://pnpm.io)** — version pinned via `packageManager`; enable with Corepack (`corepack enable`)
- **Docker** (recommended) — for local Postgres via `pnpm db:up`

## Local development

### 1. Install

```bash
git clone <repo-url>
cd sas-site
pnpm install
```

### 2. Environment

```bash
cp .env.example .env
```

| Variable | Purpose |
| --- | --- |
| `PAYLOAD_SECRET` | JWT signing; use a long random string |
| `POSTGRES_URL` | Database URL. Default matches Docker (`pnpm db:up`, port `54320`, db `payload`) |
| `NEXT_PUBLIC_SERVER_URL` | Public site URL, e.g. `http://localhost:3001` (no trailing slash) |
| `CRON_SECRET` | Auth for scheduled jobs / Vercel cron |
| `PREVIEW_SECRET` | Draft and live preview URLs |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | Cloudflare R2 media storage (S3-compatible) |
| `R2_PUBLIC_URL`, `NEXT_PUBLIC_MEDIA_URL` | R2 custom domain; the public one lets client components load video direct from the CDN |
| `RESEND_API_KEY`, `RESEND_FROM_ADDRESS`, `RESEND_FROM_NAME` | Transactional email via Resend |
| `EMAIL_ASSET_BASE_URL` | Public base URL for images in emails |
| `CHROMATIC_PROJECT_TOKEN` | Storybook publishing (`pnpm chromatic`) |

`.env` is the single env file for local dev (gitignored). Avoid `.env.local`: it silently outranks `.env`, and a bare `vercel env pull` writes a full cloud-env dump there — including a `POSTGRES_URL` that hijacks your DB. Pull cloud envs through the dev TUI instead; it writes them to `.env.*.pulled` files that Next.js never auto-loads.

> If `POSTGRES_URL` points at `localhost` or `127.0.0.1`, the app uses a standard Postgres driver path instead of Vercel's pooled config.

### 3. Database

```bash
pnpm db:up    # Postgres on host port 54320
pnpm db:down  # stop compose stack
```

Or point `POSTGRES_URL` at any Postgres you control (e.g. Neon).

### 4. Run

```bash
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001). Admin panel: `/admin`. Create your first user on first visit.

After schema or admin component path changes:

```bash
pnpm generate:types
pnpm generate:importmap
```

## Dev TUI

`pnpm dev:tui` opens an interactive menu (Node 20+, real TTY) for the dev server, database tasks, Payload CLI, quality checks, and builds. The top-level entries cover the common database workflows:

- **Dev server — default env**: plain `pnpm dev`; `POSTGRES_URL` resolves from the `.env` chain (the footer shows which file wins).
- **Dev server — local Docker DB**: forces `POSTGRES_URL` to the compose Postgres for that run only (no env files edited) and starts/waits for the container.
- **Dev server — production DB**: forces `POSTGRES_URL` (and production's `PAYLOAD_SECRET`, so encrypted fields decrypt) from `.env.production.pulled`, with `PAYLOAD_DB_PUSH=false` so drizzle dev push can never touch the production schema. Writes from the admin panel are still real — read-mostly use.
- **Pull production content → local Docker DB**: `pg_dump` production (non-pooling URL) and restore into the Docker `payload` database, backing up the local DB first to `.dev-tui/local-backup.sql`.

Both production-DB options pull `.env.production.pulled` automatically when it is missing (needs the `vercel` CLI), so no separate step is required. They never refresh an existing file — use **Database… → Pull Vercel production env** to force a re-pull after credentials rotate.

| File | Role |
| --- | --- |
| `.env` | The local env file: Docker DB default plus secrets (from `.env.example`) |
| `.env.production.pulled` | Written by **Pull Vercel production env**; read only by the TUI, never auto-loaded by Next.js |
| `.env.development.pulled` | Optional `vercel env pull` of the development (Neon dev branch) env; reference only |

Deliberately not `.env.production.local` / `.env.local`: Next.js auto-loads those, which would point plain `pnpm dev` or a local `pnpm build` at a cloud database without asking.

## Project structure

```
src/
├── app/
│   ├── (frontend)/          # Public site: pages, posts, insights, works, expertise, who-we-help, search
│   └── (payload)/           # Admin panel + REST/GraphQL API
├── access/                  # Access control helpers (anyone, authenticated, authenticatedOrPublished)
├── blocks/                  # Generic page blocks + case-study blocks (blocks/case-study/)
├── collections/             # 20 collections — see Content model
├── endpoints/seed/          # Dev seed data (original template collections only)
├── features/immersive/      # WebGL scene feature
├── fields/                  # Shared fields (defaultLexical, link, linkGroup)
├── heros/                   # Page hero variants + CaseStudyHero
├── lib/                     # ImmersiveShell, SmoothScroll, WebGL canvas/tunnels
├── plugins/                 # SEO, redirects, search, forms, nested docs, AEO, ask-index, MCP, Sentry
├── search/                  # Search plugin sync + field overrides
├── shared/                  # View transitions, reveal sections, email templates
├── migrations/              # Postgres migrations
└── payload.config.ts
scripts/dev-tui/             # Interactive local dev tooling
tests/                       # Vitest integration + Playwright E2E
docs/                        # Architecture + editorial documentation
```

Path alias: `@/*` → `src/*`. Payload config: `@payload-config`.

## Content model

Full detail in [docs/architecture.md](docs/architecture.md).

| Group | Collections | Purpose |
| --- | --- | --- |
| Website | `pages`, `posts`, `work-pages`, `lab-pages`, `expertise-pages`, `audience-pages` | Publishing surfaces with public URLs |
| Content Hub | `organizations` (Clients), `projects`, `case-studies` (Case Study Content), `lab-projects`, `testimonials` | Canonical, channel-agnostic source material |
| Assets | `media`, `asset-libraries` | Uploads with approval status; project-scoped libraries |
| Taxonomy | `capabilities`, `industries`, `categories` | Shared vocabulary |
| Newsletter | `newsletters`, `audiences`, `subscribers` | Email sends via Resend; team-only access |
| System | `users`, `payload-mcp-api-keys` | Admin auth; MCP agent API keys ([docs/mcp.md](docs/mcp.md)) |

Globals: `header`, `footer`. Each Work Page presents exactly one Case Study (unique relationship); canonical content is resolved into blocks at render time and never copied.

## Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Next.js dev server on port 3001 |
| `pnpm dev:tui` | Interactive dev menu (DB, Vercel env, Payload, tests) |
| `pnpm build` | Production build (`postbuild`: sitemap) |
| `pnpm start` | Serve production build |
| `pnpm dev:prod` | Clean build + start (prod smoke test) |
| `pnpm db:up` / `pnpm db:down` | Start / stop Docker Postgres |
| `pnpm generate:types` | Regenerate `payload-types.ts` |
| `pnpm generate:importmap` | Regenerate admin `importMap.js` |
| `pnpm migrate:create` | Generate a migration file from the schema diff (review + commit) |
| `pnpm check:migrations` | Static check — fails if a migration `ADD VALUE`s an enum label and uses it in the same `up()` |
| `pnpm migrate:status` | Read-only — reports the **production** migration ledger |
| `pnpm payload` | Payload CLI (e.g. `pnpm payload generate:db-schema`) |
| `pnpm lint` / `pnpm lint:fix` | Biome check / fix |
| `pnpm test:int` / `pnpm test:e2e` / `pnpm test` | Vitest integration / Playwright E2E / both |
| `pnpm storybook` / `pnpm chromatic` | Storybook dev server / publish to Chromatic |
| `pnpm email` | React Email template dev server |
| `pnpm ci` | `payload migrate` then `pnpm build` (deploy pipeline) |

## Database & migrations

The workflow follows Payload's recommended split: **push in dev, migrations in CI.**

**Local:** the Postgres adapter uses Drizzle schema push for fast iteration. Just run `pnpm dev` and schema changes sync automatically. **Never run `payload migrate` locally** — Payload forbids mixing push and migrations on one database, and doing so corrupts the migration ledger. The dev TUI intentionally exposes only `migrate:create` (writes a file, touches nothing).

**Production:** migrations are the only writer of the production schema and the `payload_migrations` ledger. They run exclusively in CI via `pnpm ci` (`payload migrate && pnpm build`).

```bash
pnpm migrate:create     # after schema changes — generates a migration file to review + commit
pnpm check:migrations   # after migrate:create — catches unsafe enum ADD VALUE + use in one up()
pnpm migrate:status     # read-only — reports the PRODUCTION ledger (see note below)
# `payload migrate` is run only by `pnpm ci` in the deploy pipeline — do not run it by hand.
```

`pnpm migrate:status` always targets **production** (via `.env.production.pulled`), because the local push DB has no meaningful ledger. "No" = a committed migration not yet deployed; "Yes" = applied by CI. Use it before a deploy (expect your new migration "No") and after (expect "Yes"). Needs the Vercel-pulled prod env — run the dev TUI's "Pull Vercel production env" first if it is missing.

**Flow:** change config → `pnpm dev` (push syncs local) → `pnpm migrate:create` → review SQL → `pnpm check:migrations` → commit `.ts` + `.json` together → CI applies on deploy.

#### Postgres enum `ADD VALUE`

Payload runs each migration inside a **transaction**. Postgres will not let you use a label added with `ALTER TYPE ... ADD VALUE` until that transaction commits (`unsafe use of new value` on Neon/Vercel).

`migrate:create` often emits both in one file when you add a select option and change its default:

```sql
ALTER TYPE ... ADD VALUE 'split';
ALTER TABLE ... ALTER COLUMN ... SET DEFAULT 'split';  -- fails in the same transaction
```

**Fix before push:** recreate the enum in that migration (cast to `text` → drop/create type with the full value list → cast back), or split into two migrations (ADD VALUE first; use the label in the next). `pnpm check:migrations` and the pre-push hook catch the unsafe pattern.

**Agents / LLMs (Cursor, Claude Code, Codex):** root [`AGENTS.md`](AGENTS.md) is the shared always-on contract (Claude loads it via [`CLAUDE.md`](CLAUDE.md); Cursor also mirrors hard rules in `.cursor/rules/`). Do **not** run `pnpm migrate:create` unless the user explicitly asks. Never run `payload migrate` locally. After schema-impacting work, prescribe **create vs rename** answers. Deep Payload how-to lives in `.agents/skills/payload`, not in `AGENTS.md`.

> **Note:** the local DB has no meaningful migration ledger — its schema comes from push, not migrations, so a raw `payload migrate:status` against it would show every row "No". That is why `pnpm migrate:status` is wired to report **production** instead (see above). Don't run `payload migrate:status` directly against local.

### Reset local database

Wipes the local Docker DB and rebuilds the schema from scratch via push — use when local state is broken or you want a clean slate.

```bash
docker compose down -v   # stop container + DELETE the volume (all local data gone)
pnpm db:up               # fresh container; initdb auto-creates the pgvector extension
pnpm dev                 # Drizzle push rebuilds the full current schema
```

Irreversible — deletes all local pages/posts/media records. **Local only; production is untouched.** Reseed sample content from `/admin` → **Seed the database** afterward. The pgvector extension is recreated automatically on fresh init via `docker/initdb/01-extensions.sql`, so no manual `CREATE EXTENSION` is needed.

### Seed

From `/admin`, **Seed the database** loads sample template content (pages, posts, categories, media, forms). Demo user: `demo-author@example.com` / `password`.

> **Warning:** seeding is destructive — it deletes existing pages, posts, categories, media, and forms. Content Hub collections are not seeded, but deleting media breaks any Content Hub records that reference it. Use on fresh environments only.

## Deployment

Deploys to Vercel with Neon Postgres and Cloudflare R2. `vercel.json` runs `pnpm ci` on build and schedules daily job execution at `/api/payload-jobs/run` (scheduled publishing).

Required secrets: `PAYLOAD_SECRET`, `CRON_SECRET`, `PREVIEW_SECRET`, Resend keys, and the `R2_*` / `NEXT_PUBLIC_MEDIA_URL` media vars. `POSTGRES_URL` is set by the Neon integration.

## Testing

```bash
pnpm test:int    # API / integration (Vitest) — access control, content-hub rules, website structure
pnpm test:e2e    # Browser flows (Playwright) — admin, frontend, work-page rendering
pnpm test        # both
```

## License

MIT
