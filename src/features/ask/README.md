# Ask — grounded Q&A over site content (RAG)

Visitors ask a question at `/ask`; the site answers **only from published content**, with linked sources. Retrieval is embedding-based (pgvector) over every public content surface, with the original keyword search as a fallback — stages 1–3 of the [build-up roadmap](../../../docs/ask-rag-roadmap.md) are shipped; stage 5 (production hardening) gates promoting the widget beyond the `/ask` page.

## How a request flows

```
/ask page (AskWidget, useChat)
  └─ POST /api/ask { id, messages, pagePath } (AI SDK UI-message protocol)
       ├─ config check      → 503 if OPENAI_API_KEY unset
       ├─ rate limit        → 429 (10 req/min per IP, per warm instance)
       ├─ validation        → 400 (last message must be a user question, 3–500 chars)
       ├─ retrieveSources() → embed question → cosine search over ask_embeddings
       │                      (chunks grouped into ≤4 doc sources); falls back to
       │                      keyword match over the search index when embeddings
       │                      are unavailable or empty
       ├─ recordAskQuestion() → redacted row in `ask-questions`, written after the response
       ├─ no sources, first turn → the handoff card (`no_answer`) streamed, no model call
       ├─ no sources, follow-up  → chat-only prompt (no new facts allowed), 400-token cap
       └─ streamText()      → source-url parts first, then the grounded answer streamed,
                              ending in a `handoff` tool call when a person is the next step
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
| [`messages.tsx`](./messages.tsx) | Transcript body shared by every surface. Holds the shimmer until there is something to read (an assistant message with only source parts stays unmounted), renders sources only once the answer has settled, gives a handoff card its own item after the answer, and closes a settled reply with the quiet "Talk to the team" row unless it already ended in a card. |
| [`Sources.tsx`](./Sources.tsx) | An answer's sources as a disclosure group: one "Sources" row with the count, a leading chevron that turns down, and inset rows (surface glyph, title, section from the surface registry, → arrow) on the shared `.disclosure-body` track. Collapsed by default. |
| [`HandoffCard.tsx`](./HandoffCard.tsx) | The card a reply ends with when a person should take it from here, finished in the chat: a title per reason, Site Info's reply promise, Name and Email in an inset field group, "Send to the team" posting the visitor's questions to the inquiries intake, then the receipt in place ("Book a call" there when Site Info has a booking link). Built only from `components/ui` (`Card variant="inset"`, `FieldGroup variant="inset"`, `Input variant="bare"`, `Button size="chat"`). |
| [`handoffTool.ts`](./handoffTool.ts) | Server side of the handoff: the `handoff` tool the model can call with a reason, and `resolveAskHandoff`, which fills the card from Site Info (reply time, booking link). Tested in `handoffTool.test.ts`. |
| [`messageText.ts`](./messageText.ts) | The words of a transcript message (text parts only), one reading for the endpoint, the transcript, and the handoff. |
| [`questions.ts`](./questions.ts) | `recordAskQuestion()`: stores each question for the team after the response, redacted, with the page it was asked on and the chat id. No IP, no analytics id. |
| [`redact.ts`](./redact.ts) | `redactFreeText()`: strips emails, phone and card numbers, URL query strings, and key-shaped strings before storage. Keeps budgets, years, dates, and page slugs. Tested in `redact.test.ts`. |
| [`retention.ts`](./retention.ts) | `ASK_QUESTION_RETENTION_DAYS` and `ASK_NOTICE`, the first line of every transcript. One constant, so the promise and the deletion job cannot drift. Client-safe. |
| [`handoff.ts`](./handoff.ts) | The handoff contract, client-safe: the reasons, each reason's card copy and destination form (`ASK_HANDOFFS`), the typed transcript message (`AskUIMessage`, with the `tool-handoff` part), `handoffOf`, and the sessionStorage carry to the contact form (`saveAskHandoff`, `readAskHandoff`, `clearAskHandoff`). Tested in `handoff.test.ts`. |
| [`TalkToTeam.tsx`](./TalkToTeam.tsx) | The quiet "Talk to the team" row under a finished answer that did not end in a card, through `HandoffLink` (saves the questions for the contact form, reloads when already there). |
| [`fixtures.ts`](./fixtures.ts) | Story fixtures shared by every surface's stories: a scripted chat typed with the handoff tool, a resolved handoff, two sources. |
| [`../../collections/AskQuestions.ts`](../../collections/AskQuestions.ts) | Admin › Inbox › Ask questions. Team-only read and delete; nobody creates or edits through the API. |
| [`../../jobs/askQuestionRetention.ts`](../../jobs/askQuestionRetention.ts) | Daily Payload task that deletes questions past the retention window, run by the existing `/api/payload-jobs/run` cron. |
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
retrieved docs, then streamed `text` parts, then optionally one `tool-handoff` part whose
output is the resolved card (`AskHandoff`: `reason`, `responseTime`, `scheduleUrl`).
Model failures surface as an `error` part. Incoming history keeps text parts only: a tool
part is never replayed to the model, and a turn left with no text is dropped.

| Status | Body | When |
| --- | --- | --- |
| 200 | UI-message stream (`source-url` parts + `text`, optional `tool-handoff`) | Answered; the no-match first turn is a `tool-handoff` part (`no_answer`) alone |
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

## What we keep

- **Questions, for the team.** Every accepted question lands in `ask-questions` (Admin › Inbox › Ask questions) after the response has gone out, so storage never adds latency. Filter `Answered` to No for the content-gap list: questions the site had nothing to ground an answer on. `Asked on` is the page path, and `Chat` groups one conversation. Team agents can read it over MCP when a key is granted the capability.
- **Redacted before it lands.** `redactFreeText()` is one layer, not a guarantee: a name or employer in plain words survives. The first line of every transcript (`ASK_NOTICE`) asks people to leave personal details out, and tells them the answers are AI-generated (EU AI Act transparency). It is not part of cookie consent: it covers what people type, which is stored whatever they chose on the banner.
- **Deleted on schedule.** `askQuestionRetention` removes rows older than `ASK_QUESTION_RETENTION_DAYS`. It is queued by Payload's scheduler from the daily cron, so the first run lands a day after deploy and a row can outlive the window by up to a day.
- **Nothing at OpenAI.** `store: false` stops the Responses API keeping each exchange for 30 days in the dashboard logs. The client resends the transcript every turn, and for reasoning models the SDK asks for encrypted reasoning instead of server-side item references. `sendReasoning: false` keeps that encrypted blob out of the browser.
- **Metadata only in PostHog.** `ask_questioned` carries length, source count, and the follow-up flag. Question text never goes to analytics: it could not be held to the retention window there, and it would sit next to a visitor id.

## Reaching a person

The chat never holds contact details: its log is anonymous and expires. Leads belong in Inquiries, which is owned, notifies the team, and confirms by email. Every surface (the `/ask` page, the menu, and the footer's closing band) renders the way to a person in `TranscriptItems`, so no surface can miss it. There are two forms of it:

- **The handoff card**, when a person is the next step, finished where the conversation is. The model calls the `handoff` tool with a reason: `estimate` (what their own project would cost, how long, when we could start), `project` (they want to start one), `person` (they asked for one), `contact_details` (they typed an email, phone number, or name), `no_answer` (nothing on the site answers it; also the no-match first turn, with no model call). The model only decides *that* and *why*. The card's title per reason and its promise live in code (`ASK_HANDOFFS`, `askHandoffPromise`), filled from Site Info's reply time. The visitor gives a name and an address in one inset block (AutoFill fills it in a tap; an address they already typed in the chat starts the field, marked "From your message") and presses "Send to the team". That posts their own questions (the same `From my Ask conversation:` text the contact form opens with) to `/api/inquiries/submit` through `postInquiry`, the intake the contact forms use, filed as a project inquiry for `estimate` and `project` and a general message otherwise, with `fromAsk`. The address is checked with the intake's own rule and words first (`isValidEmailAddress`, `INQUIRY_EMAIL_INVALID`). The card then becomes its receipt in place (the shared `useRevealSwap` with `morphHeight`): the email it will reply to, the reference, and "Book a call" when Site Info has a booking link, offered only after the commitment. What is typed in the card never reaches the model or the Ask log. A question only about price, timing, or availability gets the card as the whole reply; when the model also answers part of a question, its words and sources come first and the card lands once the reply settles (in practice gpt-5-mini usually lets the card stand alone, so each title is written to read as a complete answer).
- **The quiet row**, "Want a person to reply? Talk to the team", under any other finished answer, and in place of a reply that settled with nothing to read. It goes through `HandoffLink`:
  - The link prefills the contact form's message with the visitor's latest questions, still theirs to edit. The questions travel in this tab's sessionStorage, never the URL, so they stay out of PostHog's captured URLs and server logs, and the contact page stays static.
  - The handoff is read without being cleared: on a full page load the contact page remounts its form just after hydration, and a one-shot read would be spent on the first mount. It is cleared once the inquiry is sent, and ignored after 30 minutes.
  - Already on the destination, a push to the same path does nothing, so the link reloads the page to pick the handoff up.

Both paths file the inquiry with `fromAsk`, and `inquiry_submitted` in PostHog carries `from_ask`, so sales can count the leads Ask produced. `ask_questioned` carries `handoff_reason` (null when no card was shown). Arrows follow one rule across Ask: → stays on the site (source rows), ↗ leaves it ("Book a call", which opens in a new tab so the conversation survives). The prompts never let the model describe the card or restate the reply time, and never repeat an email, phone number, or name back.

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
