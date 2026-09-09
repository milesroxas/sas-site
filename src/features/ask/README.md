# Ask — grounded Q&A over site content (RAG)

Visitors ask a question at `/ask`; the site answers **only from published content**, with linked sources. Retrieval is embedding-based (pgvector) over every public content surface, with the original keyword search as a fallback — stages 1–3 of the [build-up roadmap](../../../docs/ask-rag-roadmap.md) are shipped; stage 5 (production hardening) gates promoting the widget beyond the `/ask` page.

## How a request flows

```
/ask page (AskWidget, useChat)
  └─ POST /api/ask { messages } (AI SDK UI-message protocol)
       ├─ config check      → 503 if OPENAI_API_KEY unset
       ├─ rate limit        → 429 (10 req/min per IP, per warm instance)
       ├─ validation        → 400 (last message must be a user question, 3–500 chars)
       ├─ retrieveSources() → embed question → cosine search over ask_embeddings
       │                      (chunks grouped into ≤4 doc sources); falls back to
       │                      keyword match over the search index when embeddings
       │                      are unavailable or empty
       ├─ no sources, first turn → canned "couldn't find anything" answer streamed, no model call
       ├─ no sources, follow-up  → chat-only prompt (no new facts allowed), 400-token cap
       └─ streamText()      → source-url parts first, then the grounded answer streamed
```

## Files

| File | Role |
| --- | --- |
| [`retrieve.ts`](./retrieve.ts) | Retrieval seam: `retrieveSources(payload, question)`. Embedding search primary, keyword fallback. The endpoint knows nothing about how sources are found. |
| [`embeddings.ts`](./embeddings.ts) | ask_embeddings storage/query: `embedMany` on write, cosine-distance SQL on read. |
| [`chunk.ts`](./chunk.ts) | Heading-aware markdown chunker (~500-token chunks, split on h2/h3 first, tiny sections merged). |
| [`schema.ts`](./schema.ts) | Drizzle table for ask_embeddings, registered via `beforeSchemaInit` in payload.config.ts. |
| [`indexSync.ts`](./indexSync.ts) | Publish/unpublish/delete → re-embed or remove; canonical Content Hub edits re-embed dependent pages. |
| [`../../plugins/ask-index.ts`](../../plugins/ask-index.ts) | Attaches the sync hooks to every surface collection (from the shared surface registry). |
| [`model.ts`](./model.ts) | Provider seam: answer model (`gpt-5-mini`) and embedding model (`text-embedding-3-small`), both via the Vercel AI SDK. |
| [`AskWidget.tsx`](./AskWidget.tsx) | Client component: `useChat` transcript, shimmer loading, streamed answers with source links. |
| [`messages.tsx`](./messages.tsx) | Transcript body shared by every surface. Holds the shimmer until the first token (an assistant message with only source parts stays unmounted) and renders source links only once the answer has settled, staggered in. |
| [`SubmitButton.tsx`](./SubmitButton.tsx) | The composer button shared by every surface: submit when idle, an enabled Stop while a reply is in flight. |
| [`../../endpoints/ask.ts`](../../endpoints/ask.ts) | The `POST /api/ask` Payload endpoint — validation, rate limiting, prompt assembly. The system prompt sets the studio voice, forbids inline citations (links render separately), and defines the partial-answer mode: say what is published, then one next step with a page path from the source `url`. |
| [`backfill.ts`](./backfill.ts) | One full pass over every surface and global with a per-instance run lock; shared by the CLI script and the admin rebuild. Stores the summary of the last pass in Payload KV (`ask:index-last-rebuild`). |
| [`admin/RebuildIndexPanel.tsx`](./admin/RebuildIndexPanel.tsx) | Site Info › Ask action panel: "Rebuild index" button, progress note, and when the index was last rebuilt (from `GET /api/ask/reindex`). |
| [`usage.ts`](./usage.ts) | OpenAI spend (Costs API) and tokens per model (Usage API) over the last 30 days, month-to-date split out. Needs `OPENAI_ADMIN_API_KEY` (an Admin key, not the project key); `OPENAI_PROJECT_ID` optionally scopes it. OpenAI is called only on an explicit refresh (its Admin API allows 30 requests a minute); the last report lives in Payload KV (`ask:usage-report`). OpenAI exposes no remaining-credit balance over the API. |
| [`admin/UsagePanel.tsx`](./admin/UsagePanel.tsx) | Site Info › Ask usage panel: spend tiles, cost by line item, tokens by model, "last refreshed" note. Opens from the stored report (`GET /api/ask/usage`); only the Refresh button fetches from OpenAI (`POST /api/ask/usage`). Both team-only. |
| [`../../../scripts/backfill-ask-index.ts`](../../../scripts/backfill-ask-index.ts) | CLI entry for the same pass: `pnpm exec tsx --env-file=.env scripts/backfill-ask-index.ts`. |

## The corpus

What gets embedded is decided by the shared surface registry
([`src/shared/content/surfaces.ts`](../../shared/content/surfaces.ts)) — the same registry that
drives llms.txt, plugin-seo URLs, and the search index. Every public collection participates
(pages, posts, work-pages, lab-pages, expertise-pages, audience-pages, contact-pages), plus the
global surfaces in `GLOBAL_SURFACES`: the homepage (`home`), the `/insights` and `/works` heroes,
and Site Info (name, tagline, description, founding year, address, contact email, inquiry
response time, social profiles) so "where are you", "how do I reach you", and "who are you"
questions have evidence.

Per document, [`extractDocMarkdown`](../../shared/content/extract.ts) produces markdown:

- **Every surface is walked**: a generic walker over hero groups, layout blocks, and nested
  arrays collects Lexical states plus an allowlist of content-bearing string keys (title,
  description, summary, standfirst, lead, …). Select/enum values, URLs, and `internal*` fields
  never reach the corpus.
- **work-pages / lab-pages** additionally hydrate their canonical Content Hub record
  (case-studies / lab-projects) and walk its narrative fields; editing the canonical record
  re-embeds every published page that renders it.
- **Relationships resolve to substance.** Allowlisted relationship keys hydrate in one batched
  query per collection: testimonials (quote and speaker), the case study's project (client
  organization, public title and summary, industries, capabilities, platforms, deliverables),
  and taxonomy terms on segment pages and lab projects. Other relationships (featured work,
  related pages, authors) stay bare ids: their targets are indexed on their own.
- **Structured arrays** render as compact lines: case-study metrics (only `approvedForPublic`
  rows) and contact-page details (`term: value`).
- **Access control decides visibility.** Every read the indexer makes (the surface document
  itself, canonical records, relationships) goes through the Local API with
  `overrideAccess: false` and no user, so collection read rules (published only, approved-public
  testimonials) and field-level rules (`authenticatedField`, e.g. the case-study claim log) apply
  exactly as they do for an anonymous visitor. The hook's own `doc` is never embedded directly:
  it is the editor's view.

The markdown is chunked (heading-aware, ~500 tokens), embedded with `embedMany`, and written to
`ask_embeddings` (delete + insert per doc). Chunks keep their heading trail; retrieval feeds it
to the model as `[Heading > Path]` context and sources link to the parent document (globals link
to their fixed path).

## Retrieval

1. Embed the retrieval query (`text-embedding-3-small`, 1536 dims). On follow-up turns the
   query is the previous user turn plus the current one (capped at 700 chars), so "what about
   for nonprofits?" carries its subject without a model rewrite call.
2. `ORDER BY embedding <=> $q LIMIT 12` with a **0.3 cosine-similarity floor** — below it, a
   chunk is not evidence. Empty result = refuse (the canned answer), preserving the MVP's
   "refuse rather than guess" property.
3. Chunks group into ≤4 document sources (≤3 chunks each, document order).
4. **Fallback:** no API key, empty index, or embedding-API failure → the original keyword match
   over the search-plugin index, hydrated through the same extractor.

## Keeping the index in sync

- Publish/update → re-embed (hooks from the ask-index plugin; failures log, never block saves).
  Chunk text already stored keeps its vector, so a publish that changes no copy (SEO, media, a
  canonical record re-syncing its dependents) costs no embedding tokens, and editing one section
  embeds only that section.
- Draft-over-published keeps the published version's embeddings (they re-sync from the published
  version); true unpublish or delete removes rows.
- Canonical record edits re-embed dependent published pages.
- Globals: a drafts global (home, index heroes) re-embeds on publish; Site Info on every save.
- Drift repair / first run: **Site Info › Ask › Rebuild index** in the admin (team only; calls
  `POST /api/ask/reindex`, runs inline, reports documents / passages / newly embedded). From a
  shell: `pnpm exec tsx --env-file=.env scripts/backfill-ask-index.ts`; against production,
  override `POSTGRES_URL` from `.env.production.pulled` and set `PAYLOAD_DB_PUSH=false`. Both
  paths run the same `backfillAskIndex` pass (`backfill.ts`).
- The **search-plugin index** (keyword fallback + /search page) has its own rebuild: the Reindex
  button on the Search collection (admin → System), or re-save documents.

## Infrastructure

- **pgvector** — `CREATE EXTENSION vector`, done in the `ask_embeddings` migration (prod) and
  required once per database. Local docker uses the `pgvector/pgvector:pg18` image; Neon ships
  the extension.
- The `ask_embeddings` table is drizzle-registered (not a Payload collection): no admin UI, no
  access control surface; rows are derived data.

## API contract

`POST /api/ask` with `{ "messages": UIMessage[] }` (what `useChat` + `DefaultChatTransport`
sends). Success responses are AI SDK UI-message SSE streams: `source-url` parts for the
retrieved docs, then streamed `text` parts. Model failures surface as an `error` part.

| Status | Body | When |
| --- | --- | --- |
| 200 | UI-message stream (`source-url` parts + `text`) | Answered (no `source-url` parts for the canned no-match answer) |
| 400 | `{ error }` | No user message last, or question under 3 / over 500 chars, or over 30 messages |
| 429 | `{ error }` | More than 10 requests/min from one IP |
| 503 | `{ error }` | `OPENAI_API_KEY` not configured |

`POST /api/ask/reindex` (team members only, admin cookie): rebuilds the index and returns
`{ finishedAt, documents, chunks, embedded, failures, durationMs }`. 401 for anonymous or MCP-key
callers, 409 while a rebuild is already running on that instance, 503 without the API key.
`GET /api/ask/reindex` returns `{ lastRebuild }`: that same summary from the last completed pass
(admin or CLI), or null.

`GET /api/ask/usage` (team only): `{ configured, report }`, the last stored OpenAI usage report
or null; never calls OpenAI. `POST /api/ask/usage` fetches a fresh report from OpenAI, stores it,
and returns the same shape. 503 with `configured: false` when `OPENAI_ADMIN_API_KEY` is unset,
502 with OpenAI's message when the Admin API rejects the call.

## Configuration

| Env var | Effect |
| --- | --- |
| `OPENAI_API_KEY` | Enables the endpoint, question embedding, and publish-time embedding sync. Unset → 503 answers; hooks skip embedding (warn once) until the backfill script runs. |

Models live in `model.ts`. Changing the **embedding** model or provider means re-embedding the
corpus: update `EMBEDDING_DIMENSIONS` in `schema.ts` if the size differs, migrate, and run the
backfill script.

## Turning Ask off

**Site Info › Ask › Hide Ask** removes the feature from the site in one place. Every surface
reads that flag:

| Surface | Hidden behavior |
| --- | --- |
| Takeover menu (`MenuAsk`) | Composer and transcript are not rendered; the preview slot stays (the docked page frame lands on it). |
| Closing band (`Footer/Closing`) | The address panel takes the composer's place: note from **Footer › Closing › Address panel**, postal lines from **Site Info › Address**. |
| `/ask` page | `notFound()`. |
| `POST /api/ask` | 404 before any model call, so stale clients and direct callers cannot keep billing. |

Header, closing band, and `/ask` read Site Info through `getCachedGlobal('site-info')`; the
global's `afterChange` hook revalidates that tag, so flipping the flag takes effect on the next
request. The endpoint reads the global per request. Indexing hooks keep running while hidden, so
the corpus is current the moment Ask comes back.

## Known limits (accepted for this stage)

- **Rate limiter is per warm serverless instance.** A cost fuse, not a guarantee. Move to a
  shared store (roadmap stage 5) before promoting the feature site-wide.
- **No retrieval evals yet.** The 0.3 similarity floor and chunk sizes are reasoned defaults,
  not measured ones — stage 5 adds a question → expected-source fixture set.
- **Answers are only as good as what's published.** Empty corpus = refusals; run the backfill
  after seeding content.
- **Follow-up retrieval is a concatenation, not a rewrite.** The previous user turn is
  prepended to the query. Good enough for one-hop follow-ups; a model-written standalone
  question is the next step if evals show multi-hop misses.
