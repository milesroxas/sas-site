# Suits & Sandals — Website & Content Hub

Marketing website and structured content hub for Suits & Sandals, built on [Payload CMS](https://payloadcms.com) and [Next.js 16](https://nextjs.org), deployed to Vercel with Postgres and Blob storage.

Canonical client-work content (clients, projects, case studies, testimonials, approved assets) lives in a channel-agnostic **Content Hub**. The **Website** is one publishing surface composed from that content — future surfaces (pitch decks, proposals, email) consume the same source material through Payload's API. See [docs/architecture.md](docs/architecture.md) for the full model.

## Documentation

| Doc | For | Covers |
| --- | --- | --- |
| [docs/architecture.md](docs/architecture.md) | Developers | Headless CMS model, collection map, access control, publishing pipeline |
| [docs/editorial/content-hub.md](docs/editorial/content-hub.md) | Editors | Creating clients, projects, case study content, testimonials, assets |
| [docs/editorial/website.md](docs/editorial/website.md) | Editors | Website surfaces, composing work pages, preview and publishing |
| [docs/prds/content-hub.md](docs/prds/content-hub.md) | Reference | Original PRD and architecture amendment |
| [AGENTS.md](AGENTS.md) | Developers | Payload development patterns and security rules |

## Stack

| Layer | Technologies |
| --- | --- |
| App | Next.js 16 (App Router), React 19, TypeScript 6 |
| CMS | Payload 3.85, Lexical rich text, Postgres (`@payloadcms/db-vercel-postgres`) |
| Storage | Vercel Blob (`@payloadcms/storage-vercel-blob`) |
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

- Pages (layout builder), Posts with Insights topic hubs, Work Pages (`/works`), Expertise Pages (`/expertise`), Audience Pages (`/who-we-help`)
- Work Pages compose case-study content through typed blocks with override-then-canonical resolution
- Draft preview, live preview, on-demand revalidation, per-surface sitemaps, SEO, search, redirects

**Immersive stack** (custom)

- Global WebGL canvas mounted once in the root layout; tunnel pattern for DOM ↔ WebGL composition
- `ImmersiveShell` for opt-in GPU layers; site-wide Lenis smooth scroll; React View Transitions
- Demo page at `/demo/immersive`

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
| `BLOB_READ_WRITE_TOKEN` | Media uploads via Vercel Blob; optional for most local work |
| `RESEND_API_KEY`, `RESEND_FROM_ADDRESS`, `RESEND_FROM_NAME` | Transactional email via Resend |
| `EMAIL_ASSET_BASE_URL` | Public base URL for images in emails |
| `CHROMATIC_PROJECT_TOKEN` | Storybook publishing (`pnpm chromatic`) |

Use `.env.local` for overrides (gitignored). `.env.local` wins over `.env`.

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

`pnpm dev:tui` opens an interactive menu (Node 20+, real TTY) for the dev server, database tasks (Docker, pull Vercel production env, import production data), Payload CLI, quality checks, and builds.

| File | Role |
| --- | --- |
| `.env` | Local defaults from `.env.example` |
| `.env.local` | Overrides; highest priority for normal local env |
| `.env.production.local` | Written by **Pull Vercel production env**; source for DB import workflows |

## Project structure

```
src/
├── app/
│   ├── (frontend)/          # Public site: pages, posts, insights, works, expertise, who-we-help, search
│   └── (payload)/           # Admin panel + REST/GraphQL API
├── access/                  # Access control helpers (anyone, authenticated, authenticatedOrPublished)
├── blocks/                  # Generic page blocks + case-study blocks (blocks/case-study/)
├── collections/             # 15 collections — see Content model
├── endpoints/seed/          # Dev seed data (original template collections only)
├── features/immersive/      # WebGL scene feature
├── fields/                  # Shared fields (defaultLexical, link, linkGroup)
├── heros/                   # Page hero variants + CaseStudyHero
├── lib/                     # ImmersiveShell, SmoothScroll, WebGL canvas/tunnels
├── plugins/                 # SEO, redirects, search, form builder, nested docs
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
| Website | `pages`, `posts`, `work-pages`, `expertise-pages`, `audience-pages` | Publishing surfaces with public URLs |
| Content Hub | `organizations` (Clients), `projects`, `case-studies` (Case Study Content), `testimonials` | Canonical, channel-agnostic source material |
| Assets | `media`, `asset-libraries` | Uploads with approval status; project-scoped libraries |
| Taxonomy | `capabilities`, `industries`, `categories` | Shared vocabulary |
| System | `users` | Admin auth |

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
| `pnpm payload` | Payload CLI (e.g. `pnpm payload migrate`) |
| `pnpm lint` / `pnpm lint:fix` | Biome check / fix |
| `pnpm test:int` / `pnpm test:e2e` / `pnpm test` | Vitest integration / Playwright E2E / both |
| `pnpm storybook` / `pnpm chromatic` | Storybook dev server / publish to Chromatic |
| `pnpm email` | React Email template dev server |
| `pnpm ci` | `payload migrate` then `pnpm build` (deploy pipeline) |

## Database & migrations

**Local:** the Postgres adapter uses schema push in development for fast iteration.

**Production:** use migrations; never rely on push against production.

```bash
pnpm payload migrate:create   # after schema changes
pnpm payload migrate          # apply on deploy (also run by pnpm ci)
```

### Seed

From `/admin`, **Seed the database** loads sample template content (pages, posts, categories, media, forms). Demo user: `demo-author@example.com` / `password`.

> **Warning:** seeding is destructive — it deletes existing pages, posts, categories, media, and forms. Content Hub collections are not seeded, but deleting media breaks any Content Hub records that reference it. Use on fresh environments only.

## Deployment

Deploys to Vercel with Neon Postgres and Vercel Blob. `vercel.json` runs `pnpm ci` on build and schedules daily job execution at `/api/payload-jobs/run` (scheduled publishing).

Required secrets: `PAYLOAD_SECRET`, `CRON_SECRET`, `PREVIEW_SECRET`, Resend keys. `POSTGRES_URL` and `BLOB_READ_WRITE_TOKEN` are set by the Neon and Blob integrations.

## Testing

```bash
pnpm test:int    # API / integration (Vitest) — access control, content-hub rules, website structure
pnpm test:e2e    # Browser flows (Playwright) — admin, frontend, work-page rendering
pnpm test        # both
```

## License

MIT
