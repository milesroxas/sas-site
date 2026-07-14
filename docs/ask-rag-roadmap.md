# Ask / RAG build-up roadmap

The Ask feature ([feature README](../src/features/ask/README.md)) shipped as the smallest thing that is honestly RAG: retrieval over an index we already had, one grounded model call, cited sources. This document is the staged path from that MVP to a production-grade RAG system. Each stage is independently shippable and isolated behind an existing seam — mostly `retrieve.ts` — so no stage requires reworking the endpoint or UI.

## Design decisions the MVP locked in (and why)

- **Vercel AI SDK, not a vendor SDK.** `generateText` is provider-agnostic; the vendor is one line in `model.ts`. The SDK also ships `embed`/`embedMany` and `streamText`/`useChat`, which stages 2 and 4 need — no new dependency later.
- **Retrieval behind one module.** The endpoint knows nothing about *how* sources are found. Every retrieval upgrade below is a change to `retrieve.ts` internals with the same `retrieveSources(payload, question)` signature.
- **Refuse rather than guess.** Empty retrieval short-circuits before the model; the system prompt requires refusal when sources don't cover the question. Every stage keeps this property.

## Stage 0 — MVP (shipped)

Keyword retrieval over the `@payloadcms/plugin-search` index (posts only) → top 4 posts hydrated to plaintext → `gpt-5-mini` grounded answer with cited sources. Limits are documented in the feature README: keyword recall, whole-post truncation, per-instance rate limiter, small index.

## Stage 1 — Content coverage ✅ shipped

All six public surfaces are in the corpus, driven by the shared registry in
`src/shared/content/surfaces.ts` (one line per collection enrolls it in search, AEO, SEO URLs,
and Ask at once). Layout collections extract through a generic allowlist walker
(`src/shared/content/extract.ts`); work-pages and lab-pages hydrate their canonical Content Hub
records. The search plugin indexes all six; the /search page links each result to its own
collection's URL. Rebuild the search index with the admin Reindex button (Search collection,
System group).

## Stage 2 — Embedding retrieval (pgvector) ✅ shipped

`ask_embeddings` (drizzle table registered via `beforeSchemaInit`, HNSW index, 1536-dim
`text-embedding-3-small`) is the primary retrieval path with a 0.3 cosine-similarity floor;
the keyword path remains as fallback. Publish/unpublish/delete hooks
(`src/features/ask/indexSync.ts`, attached by `src/plugins/ask-index.ts`) keep the index in
step, including canonical-record edits re-embedding dependent pages. Backfill / drift repair:
`pnpm payload run scripts/backfill-ask-index.ts`. The migration enables the extension; local
docker runs `pgvector/pgvector:pg18`. Hybrid (vector + keyword fused) scoring remains open —
adopt if stage-5 evals show keyword-shaped misses.

## Stage 3 — Chunking ✅ shipped

Documents chunk before embedding (`src/features/ask/chunk.ts`): heading-aware (h1–h3 boundaries
first, then paragraph-boundary splits; tiny sections merged), ~500 tokens per chunk. Retrieval
returns chunks grouped into ≤4 document sources with their heading trail as `[Heading > Path]`
prompt context. Heading **deep-links** were dropped: the site's rendered headings carry no
anchor ids — add ids to the RichText heading converter first if source links should target
sections.

## Stage 4 — Streaming and conversation ✅ shipped

The endpoint streams via `streamText` + the UI-message protocol; the widget runs on `useChat`
with full conversation history sent per request. Retrieval still embeds only the latest
question — model-rewritten standalone queries remain open for when follow-ups like "what about
for nonprofits?" start failing retrieval.

## Stage 5 — Production hardening

Prerequisites for promoting Ask from a page to a site-wide widget:

- **Shared rate limiting:** replace the per-instance limiter with a shared store (Vercel KV / Upstash) keyed by IP; add a per-day cap.
- **Observability:** persist `{ question, matched sources, answer, usage, latency }` to a Payload collection. Unanswered questions are a **content-gap signal** — the list of things visitors want that the site doesn't say.
- **Evals:** a small fixture set of question → expected-source pairs, run as an integration test (`payload run`) so retrieval changes (stages 2–3) are measured, not vibed.
- **Answer caching:** normalize + hash the question, cache answers for identical questions (content changes invalidate via the same hooks that reindex).
- **Cost controls:** monthly token budget alarm; the model stays swappable in `model.ts` if unit economics change.

## Sequencing recommendation

1 → 2 → 3 ship as a unit of "answers get good" and are all behind `retrieve.ts`. 4 is UX polish once answers are worth streaming. 5 gates any promotion of the feature beyond the `/ask` page. Skip nothing in 5 if Ask ever lands in the site header.
