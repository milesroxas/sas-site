# SAS Site

Production website and CMS built on [Payload CMS](https://payloadcms.com) and [Next.js 16](https://nextjs.org), deployed to Vercel with Postgres and Blob storage. The frontend extends the Payload Website Template with an immersive WebGL layer, site-wide smooth scrolling, and React view transitions.

## Stack

| Layer | Technologies |
| --- | --- |
| App | Next.js 16 (App Router), React 19, TypeScript 6 |
| CMS | Payload 3.85, Lexical rich text, Postgres (`@payloadcms/db-vercel-postgres`) |
| Storage | Vercel Blob (`@payloadcms/storage-vercel-blob`) |
| UI | Tailwind CSS 4, shadcn/ui, Geist |
| Motion / 3D | Lenis, React Three Fiber, Three.js, Tempus |
| Tooling | pnpm, Biome, Vitest, Playwright |

## Features

**Content & CMS**

- Collections: `pages`, `posts`, `media`, `categories`, `users`
- Globals: `header`, `footer`
- Plugins: SEO, search, redirects, form builder, nested docs (categories)
- Draft preview, live preview, on-demand revalidation, scheduled publishing (jobs + Vercel cron)
- Admin seed workflow via dashboard **Seed the database**

**Frontend**

- Layout builder blocks on pages: Call to Action, Content, Media, Archive, Form
- Rich-text blocks on posts: Banner, Code, Media
- Hero variants: none, low / medium / high impact (high impact uses WebGL backdrop)
- Site search, redirects, dark mode, Payload Admin Bar
- React View Transitions (`experimental.viewTransition` in `next.config.ts`)
- Scroll-driven reveal sections on page blocks

**Immersive stack** (custom)

- Global WebGL canvas mounted once in the root layout (`GlobalCanvasRoot`)
- Tunnel pattern for DOM ↔ WebGL composition (`WebGLTunnel`, `DOMTunnel`)
- `ImmersiveShell` for opt-in GPU layers in page subtrees
- Site-wide Lenis smooth scroll via `SmoothScrollProvider`
- Demo page at [`/demo/immersive`](http://localhost:3001/demo/immersive)

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

Set at least:

| Variable | Purpose |
| --- | --- |
| `PAYLOAD_SECRET` | JWT signing; use a long random string |
| `POSTGRES_URL` | Database URL. Default matches Docker (`pnpm db:up`, port `54320`, db `payload`) |
| `NEXT_PUBLIC_SERVER_URL` | Public site URL, e.g. `http://localhost:3001` (no trailing slash) |
| `CRON_SECRET` | Auth for scheduled jobs / Vercel cron |
| `PREVIEW_SECRET` | Draft and live preview URLs |
| `BLOB_READ_WRITE_TOKEN` | Required for media uploads when using Vercel Blob; optional for most local work |

Use `.env.local` for overrides (gitignored). `.env.local` wins over `.env`.

> If `POSTGRES_URL` points at `localhost` or `127.0.0.1`, the app uses a standard Postgres driver path instead of Vercel’s pooled config.

### 3. Database

```bash
pnpm db:up    # Postgres 18 on host port 54320
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

See [AGENTS.md](./AGENTS.md) for Payload development patterns.

## Dev TUI

`pnpm dev:tui` opens an interactive menu (Node 20+, real TTY). Use **Database → Pull Vercel production env** when you need a fresh env download from Vercel.

| File | Role |
| --- | --- |
| `.env` | Local defaults from `.env.example` |
| `.env.local` | Overrides; highest priority for normal local env |
| `.env.production.local` | Written by **Pull Vercel production env**; source for DB import / remote DB workflows |

Typical flow: `pnpm db:up` → keep `POSTGRES_URL` on local Docker → optionally pull production env → **Import production data → local Docker** when you need a prod snapshot. Restart `pnpm dev` after changing `POSTGRES_URL`.

## Project structure

```
src/
├── app/
│   ├── (frontend)/          # Public site (pages, posts, search, demo/immersive)
│   └── (payload)/           # Admin panel + REST/GraphQL API
├── access/                  # Payload access control helpers
├── blocks/                  # Layout builder + rich-text block components
├── collections/             # Pages, Posts, Media, Categories, Users
├── features/immersive/      # Product-facing immersive feature (WebGL scene)
├── lib/
│   ├── interactions/        # ImmersiveShell, SmoothScroll
│   └── webgl/               # Global canvas, tunnels, RAF, GPU detection
├── widgets/immersive-demo/  # Composed demo page for /demo/immersive
├── shared/                  # View transitions, reveal sections
├── components/              # UI, AdminBar, Media, RichText, etc.
├── Header/ Footer/          # Globals (config + frontend components)
├── heros/                   # Page hero variants
├── providers/               # Theme, smooth scroll, header theme
├── plugins/                 # Payload plugin configuration
├── migrations/              # Postgres migrations
└── payload.config.ts
scripts/dev-tui/             # Interactive local dev tooling
tests/                       # Vitest integration + Playwright E2E
```

Path alias: `@/*` → `src/*`. Payload config: `@payload-config`.

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
| `pnpm test:int` | Vitest integration tests |
| `pnpm test:e2e` | Playwright E2E tests |
| `pnpm test` | Integration + E2E |
| `pnpm ci` | `payload migrate` then `pnpm build` (deploy pipeline) |

## Content model

### Collections

| Slug | Notes |
| --- | --- |
| `pages` | Layout builder, hero, drafts, SEO, live preview |
| `posts` | Rich text with blocks, categories, authors, drafts |
| `media` | Uploads via Vercel Blob; focal point and sizes |
| `categories` | Nested taxonomy (nested-docs plugin) |
| `users` | Auth-enabled admin users |

### Page layout blocks

Call to Action, Content, Media, Archive, Form

### Post rich-text blocks

Banner, Code, Media

### Access control

Published `pages` and `posts` are public; create/update/delete requires authentication. See `src/access/`.

## Database & migrations

**Local:** The Postgres adapter uses schema push in development for fast iteration.

**Production:** Use migrations; do not rely on push against production.

```bash
pnpm payload migrate:create   # after schema changes
pnpm payload migrate          # apply on deploy (also run by pnpm ci)
```

### Seed

From `/admin`, use **Seed the database** for sample content. **Warning:** seeding replaces existing data. Demo user: `demo-author@payloadcms.com` / `password`.

## Deployment

Deploy to Vercel with Neon Postgres and Vercel Blob. `vercel.json` runs `pnpm ci` on build and schedules daily job execution at `/api/payload-jobs/run`.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?build-command=pnpm%20run%20ci&demo-description=A%20production-ready%20website%20built%20with%20Payload%2C%20the%20only%20Next.js-native%20CMS.&demo-image=%2F%2Fimages.ctfassets.net%2Fe5382hct74si%2F1EyBgbstPv4d6NMwzldDyY%2F58d07399ce2a2bb51341125fe4f51572%2Fpayloadwebsitetempate_vercel_thumbnail.jpg&demo-title=Payload%20Website%20Starter&demo-url=https%3A%2F%2Fpayload-vercel-website-demo.vercel.app%2F&env=PAYLOAD_SECRET%2CCRON_SECRET%2CPREVIEW_SECRET&from=templates&project-name=Payload%20Website%20Starter&repository-name=payload-website-starter&repository-url=https%3A%2F%2Fgithub.com%2Fpayloadcms%2Fpayload%2Ftree%2Fmain%2Ftemplates%2Fwith-vercel-website&skippable-integrations=1&stores=%255B%257B%2522type%2522%253A%2522integration%2522%252C%2522productSlug%2522%253A%2522neon%2522%252C%2522integrationSlug%2522%253A%2522neon%2522%257D%252C%257B%2522type%2522%253A%2522blob%2522%257D%255D)

Required secrets: `PAYLOAD_SECRET`, `CRON_SECRET`, `PREVIEW_SECRET`. Connect Neon and Blob; `POSTGRES_URL` and `BLOB_READ_WRITE_TOKEN` are set by the integrations.

## Testing

```bash
pnpm test:int    # API / integration (Vitest)
pnpm test:e2e    # Browser flows (Playwright)
pnpm test        # both
```

## License

MIT
