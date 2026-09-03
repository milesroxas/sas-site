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
       ├─ no sources?       → canned "couldn't find anything" answer streamed, no model call
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
| [`../../endpoints/ask.ts`](../../endpoints/ask.ts) | The `POST /api/ask` Payload endpoint — validation, rate limiting, prompt assembly. |
| [`../../../scripts/backfill-ask-index.ts`](../../../scripts/backfill-ask-index.ts) | Rebuilds ask_embeddings from all published docs: `pnpm payload run scripts/backfill-ask-index.ts`. |

## The corpus

What gets embedded is decided by the shared surface registry
([`src/shared/content/surfaces.ts`](../../shared/content/surfaces.ts)) — the same registry that
drives llms.txt, plugin-seo URLs, and the search index. All six public surfaces participate:
pages, posts, work-pages, lab-pages, expertise-pages, audience-pages.

Per document, [`extractDocMarkdown`](../../shared/content/extract.ts) produces markdown:

- **posts** — the `content` richText field, via the shared Lexical JSON walker.
- **layout surfaces** — a generic walker over hero groups and layout blocks: Lexical states plus
  an allowlist of content-bearing string keys (title, description, summary, …). Select/enum
  values, URLs, and `internal*` fields never reach the corpus.
- **work-pages / lab-pages** — additionally hydrate their canonical Content Hub record
  (case-studies / lab-projects) and walk its narrative fields; editing the canonical record
  re-embeds every published page that renders it.

The markdown is chunked (heading-aware, ~500 tokens), embedded with `embedMany`, and written to
`ask_embeddings` (delete + insert per doc). Chunks keep their heading trail; retrieval feeds it
to the model as `[Heading > Path]` context and sources link to the parent document.

## Retrieval

1. Embed the question (`text-embedding-3-small`, 1536 dims).
2. `ORDER BY embedding <=> $q LIMIT 12` with a **0.3 cosine-similarity floor** — below it, a
   chunk is not evidence. Empty result = refuse (the canned answer), preserving the MVP's
   "refuse rather than guess" property.
3. Chunks group into ≤4 document sources (≤3 chunks each, document order).
4. **Fallback:** no API key, empty index, or embedding-API failure → the original keyword match
   over the search-plugin index, hydrated through the same extractor.

## Keeping the index in sync

- Publish/update → re-embed (hooks from the ask-index plugin; failures log, never block saves).
- Draft-over-published keeps the published version's embeddings (they re-sync from the published
  version); true unpublish or delete removes rows.
- Canonical record edits re-embed dependent published pages.
- Drift repair / first run: `pnpm payload run scripts/backfill-ask-index.ts`.
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
- **No conversational query rewriting.** Retrieval embeds only the latest question; follow-ups
  that depend on prior turns ("what about for nonprofits?") may under-retrieve.
