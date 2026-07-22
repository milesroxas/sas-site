# Architecture

How the Suits & Sandals site works as a headless CMS, and the principles behind its content model.

## The headless model

Payload CMS runs embedded inside the Next.js app — one codebase, one deployment. There is no separate CMS service:

- `src/app/(payload)/` serves the admin panel at `/admin` and the REST/GraphQL API.
- `src/app/(frontend)/` serves the public site. Server components query Payload through the **Local API** (direct function calls, no HTTP hop).
- Postgres stores content; Vercel Blob stores uploaded files; Resend sends email.

"Headless" here means content is modeled independently of any one presentation. The same structured content that renders the website is available through Payload's API for future consumers — pitch decks, proposals, email — without those consumers parsing website layouts.

## Core principle: canonical content vs. presentation

The defining architectural decision (see the [PRD amendment](prds/content-hub.md)):

> The Website is a publishing surface, not the source of truth.

Content splits into two layers:

1. **Content Hub** — canonical, channel-agnostic facts about client work: who the client is, what the project was, what happened, what the outcomes were. Modeled as explicit fields and relationships, written once.
2. **Website** — one presentation of that material. Work Pages select, order, and style canonical content through blocks; they override copy where the web needs different phrasing, but never copy or mutate the source.

Consequences:

- A future consumer can retrieve a case study's challenge, metrics, or testimonials as fields — never by parsing website blocks.
- Each Work Page presents exactly one Case Study (`caseStudy` relationship is required and unique). Future surfaces get their own presentation collections; canonical data is never forked.
- Editing a website override never writes back to canonical fields.

## Collection map

```
Website (presentation)                Content Hub (canonical)
├── pages ──────────── /[slug]        ├── organizations (Clients)
├── posts ──────────── /posts/[slug]  ├── projects ──→ organizations
├── work-pages ─────── /works/[slug] ──→ case-studies ──→ projects
├── expertise-pages ── /expertise/[slug]  ├── testimonials ──→ organizations, projects
└── audience-pages ─── /who-we-help/[slug]└── (metrics, decisions, outcomes live on case-studies)

Assets                                Taxonomy
├── media (usageStatus gates reads)   ├── capabilities (expertise vocabulary)
└── asset-libraries ──→ projects      ├── industries (audience vocabulary)
    (scope approved media)            └── categories (post topics → /insights)
```

| Group | Collection | Notes |
| --- | --- | --- |
| Website | `pages` | Generic layout-builder pages (CTA, Content, Media, Archive, Form blocks) |
| Website | `posts` | Blog; categories power `/insights/[topic]` hubs |
| Website | `work-pages` | Case-study presentation; blocks resolve canonical content at render time |
| Website | `expertise-pages` | Positioning by `capabilities`; auto-matches related work |
| Website | `audience-pages` | Positioning by `industries`; auto-matches related work |
| Content Hub | `organizations` | Clients; public description vs. auth-only `internalNotes` |
| Content Hub | `projects` | Factual engagement record; no layout fields |
| Content Hub | `case-studies` | Canonical narrative + evidence (tabs: Overview, Story, Evidence, Asset Libraries) |
| Content Hub | `testimonials` | Approval-gated quotes |
| Assets | `media` | Uploads; `usageStatus` + `approvedChannels` govern reuse |
| Assets | `asset-libraries` | Per-project groupings of approved media |
| Taxonomy | `capabilities`, `industries`, `categories` | Fully public read |
| System | `users` | Admin auth |

Globals: `header`, `footer` (site navigation).

## How a Work Page resolves content

`/works/[slug]` queries the Work Page with its Case Study populated (depth 4), then renders:

1. **Hero** (`CaseStudyHero`) — override-then-canonical at each field: `titleOverride` → study title; `summaryOverride` → short summary → one-line → thesis; hero media → cover asset; eyebrow → client short name → client name.
2. **Blocks** (`RenderCaseStudyBlocks`) — each block declares a `source` and optional overrides:
   - `caseStudyStorySection` — picks a canonical rich-text field (context, challenge, strategy, approach, outcome summary, learnings) or `custom`; `bodyOverride` wins when present.
   - `caseStudyKeyDecisions` / `caseStudyMetrics` — read arrays from the study, filtered by `featured` flags and (for metrics) `approvedForPublic`.
   - `caseStudyTestimonial` — renders only published, `approved-public` testimonials.
   - `caseStudyMediaShowcase` / `caseStudyTransition` — website-only media and copy.
   - `caseStudyRelatedWork` — manual selection or automatic capability match.

Publish-time integrity (`validateWorkPage`): the linked Case Study must itself be published and have at least one Asset Library, and every media reference on the page (cover, hero, downloads, block media) must be `public-approved` **and** belong to one of the study's libraries. Deleting a Case Study that a Work Page references is blocked.

## Access control

Three base helpers (`src/access/`), plus per-collection refinements:

| Rule | Applies to |
| --- | --- |
| Write requires auth; anonymous reads published only (`authenticatedOrPublished`) | All Website collections, organizations, projects, case-studies |
| Anonymous reads require published **and** `approvalStatus = approved-public` | testimonials |
| Anonymous reads require `usageStatus = public-approved` | media |
| Anonymous reads require `libraryStatus = active` | asset-libraries |
| Fully public read (`anyone`) | capabilities, industries, categories |

Field-level: `internalNotes`, `usageNotes`, testimonial/metric `source`, and `approvedClaims` are readable only by authenticated users — they never appear in anonymous API responses.

**Known limitation:** media documents are access-filtered, but Vercel Blob file URLs are public. Do not upload confidential files.

## Publishing pipeline

- **Drafts & versions** — Website collections and Content Hub narrative collections use drafts with autosave, version history (max 50), and scheduled publishing (jobs run via Vercel cron, daily, authenticated by `CRON_SECRET`).
- **Preview** — `generatePreviewPath` maps collections to URL prefixes (`work-pages` → `/works`, `expertise-pages` → `/expertise`, `audience-pages` → `/who-we-help`, `posts` → `/posts`, `pages` → `/`). Draft preview and live preview (mobile/tablet/desktop breakpoints) use `/next/preview` guarded by `PREVIEW_SECRET`.
- **Revalidation** — `afterChange`/`afterDelete` hooks revalidate the document's path, its index page, and its sitemap tag. Case Study edits revalidate every published Work Page that consumes them (`revalidateCaseStudyConsumers`).
- **Sitemaps** — one route handler per surface (`pages`, `posts`, `works`, `expertise`, `who-we-help`), stitched together by `next-sitemap` in `postbuild`, which also generates robots.txt.
- **SEO** — plugin generates titles (`{title} | Suits & Sandals`) and per-collection URLs.
- **Redirects** — managed in admin (System group) for all five Website collections.
- **Search** — plugin indexes `posts` only; served at `/search`.

## Frontend routes

| Route | Collection | Renderer |
| --- | --- | --- |
| `/`, `/[slug]` | `pages` | `RenderHero` + `RenderBlocks` |
| `/posts`, `/posts/[slug]` | `posts` | Archive / `PostHero` + rich text |
| `/insights`, `/insights/[topic]` | `categories` + `posts` | Topic hubs |
| `/works`, `/works/[slug]` | `work-pages` (+ `case-studies`) | Card grid / `CaseStudyHero` + `RenderCaseStudyBlocks` |
| `/expertise`, `/expertise/[slug]` | `expertise-pages` | `RenderBlocks` + related work by capability |
| `/who-we-help`, `/who-we-help/[slug]` | `audience-pages` | `RenderBlocks` + related work by industry |
| `/search` | search index | Search + archive |
| `/demo/immersive` | — | WebGL demo (noindex) |

All dynamic routes use `generateStaticParams`, React `cache()` on queries, draft-mode gating, and `PayloadRedirects` fallback.

## Development conventions

- [AGENTS.md](../AGENTS.md) is the rulebook: access control in Local API queries, transaction safety in hooks (`req` passing), avoiding hook loops, server-first components.
- After schema changes: `pnpm generate:types`, `pnpm generate:importmap`, `pnpm migrate:create`. Dev iterates via Drizzle push; migrations apply only in CI (`pnpm ci`) against production. Never run `payload migrate` locally — mixing push and migrations on one DB corrupts the ledger.
- Tests assert the access and integrity rules above (`tests/int/content-hub.int.spec.ts`, `tests/int/website-structure.int.spec.ts`, `tests/e2e/content-hub.e2e.spec.ts`).
