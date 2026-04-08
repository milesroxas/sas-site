# Payload Website Template

This is the official [Payload Website Template](https://github.com/payloadcms/payload/blob/main/templates/website). Use it to power websites, blogs, or portfolios from small to enterprise. This repo includes a fully-working backend, enterprise-grade admin panel, and a beautifully designed, production-ready website.

You can deploy to Vercel, using Neon and Vercel Blob Storage with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?build-command=pnpm%20run%20ci&demo-description=A%20production-ready%20website%20built%20with%20Payload%2C%20the%20only%20Next.js-native%20CMS.&demo-image=%2F%2Fimages.ctfassets.net%2Fe5382hct74si%2F1EyBgbstPv4d6NMwzldDyY%2F58d07399ce2a2bb51341125fe4f51572%2Fpayloadwebsitetempate_vercel_thumbnail.jpg&demo-title=Payload%20Website%20Starter&demo-url=https%3A%2F%2Fpayload-vercel-website-demo.vercel.app%2F&env=PAYLOAD_SECRET%2CCRON_SECRET%2CPREVIEW_SECRET&from=templates&project-name=Payload%20Website%20Starter&repository-name=payload-website-starter&repository-url=https%3A%2F%2Fgithub.com%2Fpayloadcms%2Fpayload%2Ftree%2Fmain%2Ftemplates%2Fwith-vercel-website&skippable-integrations=1&stores=%255B%257B%2522type%2522%253A%2522integration%2522%252C%2522productSlug%2522%253A%2522neon%2522%252C%2522integrationSlug%2522%253A%2522neon%2522%257D%252C%257B%2522type%2522%253A%2522blob%2522%257D%255D)

This template is right for you if you are working on:

- A personal or enterprise-grade website, blog, or portfolio
- A content publishing platform with a fully featured publication workflow
- Exploring the capabilities of Payload

Core features:

- [Pre-configured Payload Config](#how-it-works)
- [Authentication](#users-authentication)
- [Access Control](#access-control)
- [Layout Builder](#layout-builder)
- [Draft Preview](#draft-preview)
- [Live Preview](#live-preview)
- [On-demand Revalidation](#on-demand-revalidation)
- [SEO](#seo)
- [Search](#search)
- [Redirects](#redirects)
- [Jobs and Scheduled Publishing](#jobs-and-scheduled-publish)
- [Website](#website)

## Quick start – Deploying to Vercel

Click the 'Deploy' button to spin up this template directly into Vercel hosting. It will first prompt you save this template into your own Github repo so that you own the code and can make any changes you want to it. You will be prompted to set up the required services and secrets. Once the app is built and deployed, you can visit your site using the generated URL.

Set up the following services and secrets and then once the app has been built and deployed you will be able to visit your site at the generated URL.

From this point on you can access your admin panel at `/admin` of your app URL, create an admin user and then click the 'Seed the database' button in the dashboard to add content into your app.

### Services

This project uses the following services integrated into Vercel which you will need to click "Add" and "Connect" for:

Neon Database - Postgres-based cloud database used to host your data

Vercel Blob Storage - object storage used to host your files such as images and videos

The connection variables will automatically be setup for you on Vercel when these services are connected.

#### Secrets

You will be prompted to add the following secret values to your project. These should be long unguessable strong passwords, you can also use a password manager to generate one for these.

CRON_SECRET - used for running cron on Vercel

PAYLOAD_SECRET - used by Payload to sign secrets like JWT tokens

PREVIEW_SECRET - used by Payload for secured live previews of your content

## Local development

### Prerequisites

- **Node.js** `^18.20.2` or `>=20.9.0` (see `package.json` → `engines`)
- **[pnpm](https://pnpm.io)** — the repo pins a version via `packageManager`; use Corepack (`corepack enable`) if you need that exact version
- **Docker** (optional but recommended) — for the bundled Postgres service used by the default `POSTGRES_URL` in `.env.example`

### 1. Clone and install

```bash
git clone <your-fork-or-repo-url>
cd <project-directory>
pnpm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Edit `.env` and set at least:

| Variable | Purpose |
|----------|---------|
| `PAYLOAD_SECRET` | Required. Long random string for JWT signing. |
| `POSTGRES_URL` | Database connection string. The default in `.env.example` matches local Docker (`pnpm db:up`, port 54320, database `payload`). |
| `NEXT_PUBLIC_SERVER_URL` | Public site URL, e.g. `http://localhost:3001` (no trailing slash). |
| `CRON_SECRET` | Used for scheduled jobs / cron auth; set any strong value locally. |
| `PREVIEW_SECRET` | Used for draft/live preview URLs. |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob — needed for **Media** uploads when using cloud storage. Pull from your Vercel project when testing uploads; can be empty for other local work. |

You can add overrides in **`.env.local`** (gitignored) instead of committing secrets.

**Env files the app loads (Next.js):** values in `.env.local` override `.env`. The dev TUI can also write **`.env.production.local`** when you pull from Vercel (see [Dev TUI](#dev-tui)).

> **Note:** If `POSTGRES_URL` points at `localhost` or `127.0.0.1`, the app uses a standard Postgres driver path instead of Vercel’s pooled config.

### 3. Database (Postgres)

**Recommended (Docker):** from the project root:

```bash
pnpm db:up
```

This runs `docker compose up postgres -d` using `docker-compose.yml`: Postgres **18** on host port **54320**, database name **`payload`**, trust auth for local dev. Wait until the container is healthy, then start the app.

Stop the database:

```bash
pnpm db:down
```

**Alternative:** point `POSTGRES_URL` at any Postgres you control (e.g. Neon, a local install). Match the URL format to your provider.

### 4. Run the app

```bash
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001). Visit `/admin` and create your first user when prompted. Changes under `./src` hot-reload in dev.

### Dev TUI

Run **`pnpm dev:tui`** for an interactive menu (requires **Node 20+** and a real TTY). It does **not** run `vercel env pull` on startup (that needs the CLI, network, and often a logged-in session); choose **Database → Pull Vercel production env** when you want a fresh download.

| File | Role |
|------|------|
| `.env` | Committed template copy; your local values (often gitignored in forks—keep secrets out of git). |
| `.env.local` | Optional overrides; **highest priority** for local dev among “normal” env files. The TUI may set `POSTGRES_URL` here when you switch “point app at local vs remote”. |
| `.env.production.local` | Written by **Pull Vercel production env**; holds production `POSTGRES_URL` and other Vercel secrets. Gitignored. Used as the **source** for DB import and for “point app at remote DB”. |

**Recommended order (avoid missing-env issues):**

1. **Install and env:** `pnpm install`, copy `.env.example` → `.env`, fill `PAYLOAD_SECRET`, `POSTGRES_URL` (local Docker URL from `.env.example` is fine), `NEXT_PUBLIC_SERVER_URL`, etc.
2. **Start Postgres:** `pnpm db:up` (or **Database → Docker: start Postgres** in the TUI) and wait until the container is healthy.
3. **Optional — copy production env for sync/remote workflows:** Install the [Vercel CLI](https://vercel.com/docs/cli), run `vercel link` in the repo if needed, then in the TUI choose **Database → Pull Vercel production env**. That creates `.env.production.local` without overwriting `.env` / `.env.local`.
4. **Default:** keep **`POSTGRES_URL` in `.env` or `.env.local` pointing at local Docker** (`postgresql://postgres@127.0.0.1:54320/payload`). The TUI footer shows whether the app is using local or remote DB.
5. **Import production data into local Docker:** **Database → Import production data → local Docker**. For the “where to read production `POSTGRES_URL`” prompt, pressing Enter walks **`.env.production.local` → `.env.local` → `.env`** until it finds `POSTGRES_URL`. You can also paste the URL. This **only** runs `pg_dump` / restore into your local DB; it does not switch the app to production unless you separately use **Point app at remote DB**.
6. **Restart** `pnpm dev` after changing `POSTGRES_URL` on disk (Next loads env at startup).

**If something fails:**

| Symptom | What to check |
|---------|----------------|
| “No POSTGRES_URL” / import can’t find a file | Ensure at least one of `.env`, `.env.local`, or `.env.production.local` exists and contains `POSTGRES_URL`, or run **Pull Vercel production env** first. |
| “Vercel CLI not found” | Install globally: `npm i -g vercel` (or use your preferred install method). |
| Import fails on Docker | `pnpm db:up`, Docker running, port **54320** free. |
| App still uses wrong DB after TUI | Restart the dev server; confirm `.env.local` vs `.env` (`.env.local` wins). |

### Scripts

| Script | What it does |
|--------|----------------|
| `pnpm dev` | Next.js dev server (`next dev`). |
| `pnpm dev:tui` | Interactive dev menu (DB, Vercel env pull, Payload, tests). See [Dev TUI](#dev-tui). |
| `pnpm build` | Production build; `postbuild` runs `next-sitemap`. |
| `pnpm start` | Serve the production build. |
| `pnpm dev:prod` | Remove `.next`, build, then `start` (prod-style smoke test). |
| `pnpm db:up` | Start Docker Postgres (`docker compose up postgres -d`). |
| `pnpm db:down` | Stop compose stack. |
| `pnpm generate:types` | Regenerate Payload TypeScript types after schema changes. |
| `pnpm generate:importmap` | Regenerate `importMap.js` after changing admin components paths. |
| `pnpm payload` | Payload CLI passthrough (e.g. `pnpm payload migrate`). |
| `pnpm lint` / `pnpm lint:fix` | Biome check / fix. |
| `pnpm test:int` | Vitest integration tests. |
| `pnpm test:e2e` | Playwright E2E tests. |
| `pnpm test` | Runs `test:int` then `test:e2e`. |
| `pnpm ci` | `payload migrate` then `pnpm build` (typical deploy pipeline step). |

After schema or component-path changes, run `generate:types` and/or `generate:importmap` as needed (see [AGENTS.md](./AGENTS.md) in this repo).

## How it works

The Payload config is tailored specifically to the needs of most websites. It is pre-configured in the following ways:

### Collections

See the [Collections](https://payloadcms.com/docs/configuration/collections) docs for details on how to extend this functionality.

- #### Users (Authentication)

  Users are auth-enabled collections that have access to the admin panel and unpublished content. See [Access Control](#access-control) for more details.

  For additional help, see the official [Auth Example](https://github.com/payloadcms/payload/tree/main/examples/auth) or the [Authentication](https://payloadcms.com/docs/authentication/overview#authentication-overview) docs.

- #### Posts

  Posts are used to generate blog posts, news articles, or any other type of content that is published over time. All posts are layout builder enabled so you can generate unique layouts for each post using layout-building blocks, see [Layout Builder](#layout-builder) for more details. Posts are also draft-enabled so you can preview them before publishing them to your website, see [Draft Preview](#draft-preview) for more details.

- #### Pages

  All pages are layout builder enabled so you can generate unique layouts for each page using layout-building blocks, see [Layout Builder](#layout-builder) for more details. Pages are also draft-enabled so you can preview them before publishing them to your website, see [Draft Preview](#draft-preview) for more details.

- #### Media

  This is the uploads enabled collection used by pages, posts, and projects to contain media like images, videos, downloads, and other assets. It features pre-configured sizes, focal point and manual resizing to help you manage your pictures.

- #### Categories

  A taxonomy used to group posts together. Categories can be nested inside of one another, for example "News > Technology". See the official [Payload Nested Docs Plugin](https://payloadcms.com/docs/plugins/nested-docs) for more details.

### Globals

See the [Globals](https://payloadcms.com/docs/configuration/globals) docs for details on how to extend this functionality.

- `Header`

  The data required by the header on your front-end like nav links.

- `Footer`

  Same as above but for the footer of your site.

## Access control

Basic access control is setup to limit access to various content based based on publishing status.

- `users`: Users can access the admin panel and create or edit content.
- `posts`: Everyone can access published posts, but only users can create, update, or delete them.
- `pages`: Everyone can access published pages, but only users can create, update, or delete them.

For more details on how to extend this functionality, see the [Payload Access Control](https://payloadcms.com/docs/access-control/overview#access-control) docs.

## Layout Builder

Create unique page layouts for any type of content using a powerful layout builder. This template comes pre-configured with the following layout building blocks:

- Hero
- Content
- Media
- Call To Action
- Archive

Each block is fully designed and built into the front-end website that comes with this template. See [Website](#website) for more details.

## Lexical editor

A deep editorial experience that allows complete freedom to focus just on writing content without breaking out of the flow with support for Payload blocks, media, links and other features provided out of the box. See [Lexical](https://payloadcms.com/docs/lexical/overview) docs.

## Draft Preview

All posts and pages are draft-enabled so you can preview them before publishing them to your website. To do this, these collections use [Versions](https://payloadcms.com/docs/configuration/collections#versions) with `drafts` set to `true`. This means that when you create a new post, project, or page, it will be saved as a draft and will not be visible on your website until you publish it. This also means that you can preview your draft before publishing it to your website. To do this, we automatically format a custom URL which redirects to your front-end to securely fetch the draft version of your content.

Since the front-end of this template is statically generated, this also means that pages, posts, and projects will need to be regenerated as changes are made to published documents. To do this, we use an `afterChange` hook to regenerate the front-end when a document has changed and its `_status` is `published`.

For more details on how to extend this functionality, see the official [Draft Preview Example](https://github.com/payloadcms/payload/tree/examples/draft-preview).

## Live preview

In addition to draft previews you can also enable live preview to view your end resulting page as you're editing content with full support for SSR rendering. See [Live preview docs](https://payloadcms.com/docs/live-preview/overview) for more details.

## On-demand Revalidation

We've added hooks to collections and globals so that all of your pages, posts, footer, or header changes will automatically be updated in the frontend via on-demand revalidation supported by Nextjs.

> Note: if an image has been changed, for example it's been cropped, you will need to republish the page it's used on in order to be able to revalidate the Nextjs image cache.

## SEO

This template comes pre-configured with the official [Payload SEO Plugin](https://payloadcms.com/docs/plugins/seo) for complete SEO control from the admin panel. All SEO data is fully integrated into the front-end website that comes with this template. See [Website](#website) for more details.

## Search

This template also pre-configured with the official [Payload Search Plugin](https://payloadcms.com/docs/plugins/search) to showcase how SSR search features can easily be implemented into Next.js with Payload. See [Website](#website) for more details.

## Redirects

If you are migrating an existing site or moving content to a new URL, you can use the `redirects` collection to create a proper redirect from old URLs to new ones. This will ensure that proper request status codes are returned to search engines and that your users are not left with a broken link. This template comes pre-configured with the official [Payload Redirects Plugin](https://payloadcms.com/docs/plugins/redirects) for complete redirect control from the admin panel. All redirects are fully integrated into the front-end website that comes with this template. See [Website](#website) for more details.

## Jobs and Scheduled Publish

We have configured [Scheduled Publish](https://payloadcms.com/docs/versions/drafts#scheduled-publish) which uses the [jobs queue](https://payloadcms.com/docs/jobs-queue/jobs) in order to publish or unpublish your content on a scheduled time. The tasks are run on a cron schedule and can also be run as a separate instance if needed.

> Note: When deployed on Vercel, depending on the plan tier, you may be limited to daily cron only.

## Website

This template includes a beautifully designed, production-ready front-end built with the [Next.js App Router](https://nextjs.org), served right alongside your Payload app in a instance. This makes it so that you can deploy both your backend and website where you need it.

Core features:

- [Next.js App Router](https://nextjs.org)
- [TypeScript](https://www.typescriptlang.org)
- [React Hook Form](https://react-hook-form.com)
- [Payload Admin Bar](https://github.com/payloadcms/payload/tree/main/packages/admin-bar)
- [TailwindCSS styling](https://tailwindcss.com/)
- [shadcn/ui components](https://ui.shadcn.com/)
- User Accounts and Authentication
- Fully featured blog
- Publication workflow
- Dark mode
- Pre-made layout building blocks
- SEO
- Search
- Redirects
- Live preview

## Postgres, migrations, and seed

After you complete [Local development](#local-development), use the following for schema strategy and demo content. Postgres is configured via `POSTGRES_URL`; local Docker is started with `pnpm db:up` (see above).

### Working with Postgres

Postgres enforces a strict schema. Compared to MongoDB, there are a few extra steps when evolving the schema.

When making large schema changes you can risk losing data if you are not migrating carefully.

**Local / dev:** Prefer a dedicated local or staging database. In development, the Postgres adapter typically uses `push: true`, so you can add, change, or remove fields and collections without hand-written SQL for quick iteration.

**Production:** Pointing `POSTGRES_URL` at production with `push: true` is dangerous—use migrations and set `push: false` for production-style databases so the schema stays controlled.

### Migrations

[Migrations](https://payloadcms.com/docs/database/migrations) version your schema as SQL. For deployed Postgres you create migrations locally and run them on the server before `pnpm start`.

Create a migration after config changes:

```bash
pnpm payload migrate:create
```

Commit the generated files. On the host (or in CI), after build and before serving:

```bash
pnpm payload migrate
```

This applies pending migrations and records them in the database. The `pnpm ci` script runs `payload migrate` before `pnpm build` for deploy-style builds.

### Seed

From the admin dashboard, use **Seed the database** to load sample pages, posts, and related content.

The seed also creates a demo user (for demos only):

- Demo Author — `demo-author@payloadcms.com` / `password`

> **Warning:** Seeding is destructive: it replaces the current database with the seed template. Only use it on a fresh project or when you can afford to lose existing data.

## Questions

If you have any issues or questions, reach out to us on [Discord](https://discord.com/invite/payload) or start a [GitHub discussion](https://github.com/payloadcms/payload/discussions).
