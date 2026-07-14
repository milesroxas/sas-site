# Ask / RAG build-up roadmap

The Ask feature ([feature README](../src/features/ask/README.md)) shipped as the smallest thing that is honestly RAG: retrieval over an index we already had, one grounded model call, cited sources. This document is the staged path from that MVP to a production-grade RAG system. Each stage is independently shippable and isolated behind an existing seam — mostly `retrieve.ts` — so no stage requires reworking the endpoint or UI.

## Design decisions the MVP locked in (and why)

- **Vercel AI SDK, not a vendor SDK.** `generateText` is provider-agnostic; the vendor is one line in `model.ts`. The SDK also ships `embed`/`embedMany` and `streamText`/`useChat`, which stages 2 and 4 need — no new dependency later.
- **Retrieval behind one module.** The endpoint knows nothing about *how* sources are found. Every retrieval upgrade below is a change to `retrieve.ts` internals with the same `retrieveSources(payload, question)` signature.
- **Refuse rather than guess.** Empty retrieval short-circuits before the model; the system prompt requires refusal when sources don't cover the question. Every stage keeps this property.

## Stage 0 — MVP (shipped)

Keyword retrieval over the `@payloadcms/plugin-search` index (posts only) → top 4 posts hydrated to plaintext → `gpt-5-mini` grounded answer with cited sources. Limits are documented in the feature README: keyword recall, whole-post truncation, per-instance rate limiter, small index.

## Stage 1 — Content coverage

**Problem:** Ask can only answer from posts; the site's substance lives in case studies, expertise pages, and work pages.

**Change:**
1. Add collections to `searchPlugin({ collections: [...] })` in `src/plugins/index.ts`.
2. Extend `beforeSyncWithSearch` if the new collections need different excerpt fields.
3. In `retrieve.ts`: add entries to `urlPrefixByCollection` and teach the hydration step each collection's body shape (which richtext/field carries the substance).

**Effort:** small. **Risk:** low — search page already consumes the same index, so coverage changes are visible in two features at once. Reindex existing docs by re-saving them (the plugin syncs on save).

## Stage 2 — Embedding retrieval (pgvector on Neon)

**Problem:** keyword matching misses questions phrased differently from the content ("how do you help startups look credible?" won't match a post titled "Brand systems for early-stage teams").

**Change:**
1. Enable `pgvector` on the Neon database (`CREATE EXTENSION vector`) via a Payload migration with raw SQL.
2. Add an `embeddings` table (or Payload collection with a vector column via a custom migration): `{ collection, docId, chunkIndex, text, embedding vector(1536) }`.
3. Index content on publish with an `afterChange` hook (mirror the search plugin's sync pattern): embed with the AI SDK's `embedMany` + `openai.textEmbedding('text-embedding-3-small')`.
4. Rewrite `retrieveSources` internals: embed the question, `ORDER BY embedding <=> $1 LIMIT k` (cosine distance). Keep the keyword path as a fallback and consider **hybrid** scoring (vector + keyword) — cheap and measurably better than either alone.

**Effort:** medium — the first stage that adds infrastructure (one table, one extension, one hook). **Risk:** index drift (docs edited without re-embedding); the hook must also handle deletes and unpublish. Backfill with a one-off `payload run` script.

## Stage 3 — Chunking

**Problem:** whole-document embeddings blur topics together, and whole-post context windows waste tokens or truncate the relevant paragraph.

**Change:** split documents into ~500-token chunks (heading-aware: split on `h2`/`h3` boundaries first, then by size) before embedding in the stage-2 hook. Retrieval returns chunks; the prompt cites the parent document. Store `chunkIndex` + heading path so sources can deep-link (`/posts/slug#heading`).

**Effort:** small once stage 2 exists — it's a change to the indexing hook and hydration, not to schema or endpoint.

## Stage 4 — Streaming and conversation

**Problem:** answers arrive all-at-once (multi-second wait), and each question is independent — no follow-ups.

**Change:**
1. Swap `generateText` for `streamText` in the endpoint and return `result.toUIMessageStreamResponse()`.
2. Swap the widget's hand-rolled fetch for the AI SDK's `useChat`, which handles streaming state, message history, and retries.
3. Send prior turns with each request; retrieval runs on the latest question (or a model-rewritten standalone query once follow-ups like "what about for nonprofits?" start failing retrieval).

**Effort:** medium — this is the first stage that rewrites the endpoint/UI seam rather than `retrieve.ts`. Do it when the answer quality justifies the UX investment, not before.

## Stage 5 — Production hardening

Prerequisites for promoting Ask from a page to a site-wide widget:

- **Shared rate limiting:** replace the per-instance limiter with a shared store (Vercel KV / Upstash) keyed by IP; add a per-day cap.
- **Observability:** persist `{ question, matched sources, answer, usage, latency }` to a Payload collection. Unanswered questions are a **content-gap signal** — the list of things visitors want that the site doesn't say.
- **Evals:** a small fixture set of question → expected-source pairs, run as an integration test (`payload run`) so retrieval changes (stages 2–3) are measured, not vibed.
- **Answer caching:** normalize + hash the question, cache answers for identical questions (content changes invalidate via the same hooks that reindex).
- **Cost controls:** monthly token budget alarm; the model stays swappable in `model.ts` if unit economics change.

## Sequencing recommendation

1 → 2 → 3 ship as a unit of "answers get good" and are all behind `retrieve.ts`. 4 is UX polish once answers are worth streaming. 5 gates any promotion of the feature beyond the `/ask` page. Skip nothing in 5 if Ask ever lands in the site header.
