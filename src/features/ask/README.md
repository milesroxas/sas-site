# Ask — grounded Q&A over site content (RAG MVP)

Visitors ask a question at `/ask`; the site answers **only from published content**, with linked sources. This is a deliberately minimal retrieval-augmented generation (RAG) feature built to grow in stages — see the [build-up roadmap](../../../docs/ask-rag-roadmap.md) for where it goes next.

## How a request flows

```
/ask page (AskWidget)
  └─ POST /api/ask { question }
       ├─ config check      → 503 if OPENAI_API_KEY unset
       ├─ rate limit        → 429 (10 req/min per IP, per warm instance)
       ├─ validation        → 400 (question must be 3–500 chars)
       ├─ retrieveSources() → keyword match over the `search` collection,
       │                      top 4 docs hydrated to plaintext from Posts
       ├─ no sources?       → canned "couldn't find anything" answer, no model call
       └─ generateText()    → grounded answer + cited sources
```

## Files

| File | Role |
| --- | --- |
| [`retrieve.ts`](./retrieve.ts) | Retrieval: tokenize question → query search index → score → hydrate top posts to plaintext. **This is the seam the RAG grows through** — swapping keyword matching for embeddings later touches only this module. |
| [`model.ts`](./model.ts) | Provider seam. One line picks the model (`openai('gpt-5-mini')` via the Vercel AI SDK). Swap vendors here; nothing else knows which provider is underneath. |
| [`AskWidget.tsx`](./AskWidget.tsx) | Client component: question form, loading state, answer card, source links. |
| [`../../endpoints/ask.ts`](../../endpoints/ask.ts) | The `POST /api/ask` Payload endpoint — validation, rate limiting, prompt assembly, error mapping. Registered in `payload.config.ts` alongside the newsletter endpoints. |
| [`../../app/(frontend)/ask/page.tsx`](../../app/(frontend)/ask/page.tsx) | The `/ask` page. |

## Retrieval mechanics (MVP)

There are no embeddings yet. Retrieval reuses the index that `@payloadcms/plugin-search` already maintains (currently synced from **posts** — see `plugins/index.ts`):

1. The question is lowercased, split on non-word characters, stopwords and words under 3 chars dropped, capped at 8 unique terms.
2. One Payload query fetches up to 20 candidates where any term appears in `title` or `meta.description`.
3. Candidates are scored in-process (title hit = 2, description hit = 1), the top 4 kept.
4. Each winner's source post is fetched and its Lexical `content` converted to plaintext (`convertLexicalToPlaintext`), truncated to 6 000 chars.

Because retrieval reads the search plugin's index, **adding a collection to the search plugin config automatically puts it in Ask's reach** — you only need to add its URL prefix to `urlPrefixByCollection` in `retrieve.ts` and hydrate its body field (the plaintext step currently assumes the Posts `content` shape).

## Generation

The endpoint calls `generateText` (Vercel AI SDK) with:

- a system prompt that forbids outside knowledge, requires a refusal when sources don't cover the question, caps length, and asks for source titles in the answer;
- a single user message containing the sources as tagged blocks plus the question.

When retrieval returns nothing, the model is **not called** — the endpoint returns a canned answer. No tokens are spent inventing responses.

## API contract

`POST /api/ask` with `{ "question": string }`:

| Status | Body | When |
| --- | --- | --- |
| 200 | `{ answer, sources: [{ title, url }] }` | Answered (sources may be empty for the canned no-match answer) |
| 400 | `{ error }` | Question missing, under 3 or over 500 chars |
| 429 | `{ error }` | More than 10 requests/min from one IP |
| 502 | `{ error }` | Model call failed (details in server logs) |
| 503 | `{ error }` | `OPENAI_API_KEY` not configured |

## Configuration

| Env var | Effect |
| --- | --- |
| `OPENAI_API_KEY` | Enables the endpoint. Unset → every request answers 503 and the failure is logged once per request. |

Model choice lives in `model.ts` (`gpt-5-mini` by default — cheap and fast for grounded Q&A). To change providers, install the matching `@ai-sdk/*` package, change the one line, and set that provider's key env var.

## Known limits (accepted for the MVP)

- **Keyword recall.** Questions phrased without words that appear in titles/descriptions can miss relevant posts. Embeddings (roadmap stage 2) fix this class of miss.
- **Whole-post context.** Long posts are truncated at 6 000 chars rather than chunked; the relevant paragraph can fall outside the window. Chunking is roadmap stage 3.
- **Rate limiter is per warm serverless instance.** It is a cost fuse against naive abuse, not a guarantee. Move to a shared store (roadmap stage 5) before promoting the feature.
- **Coverage = the search index.** Only published posts are indexed today, and the index is small; answers are only as good as what's published.
