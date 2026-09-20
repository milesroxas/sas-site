# Ask — grounded Q&A over site content (RAG)

Visitors ask from the takeover menu, the footer's closing band, or `/ask`, and all three are one conversation ([One session, and the journey](#one-session-and-the-journey)). The site answers **only from published content**, with linked sources. Retrieval is embedding-based (pgvector) over every public content surface, with keyword search as a fallback. Stages 1–4 of the [build-up roadmap](../../../docs/ask-rag-roadmap.md) are shipped. Stage 5 (shared rate limiting, retrieval evals, answer caching, a monthly token-budget alarm) is still open; capture, ratings, and the inbox shipped with the [insights work](../../../docs/ask-insights-roadmap.md). Ask is already site-wide; **Site Info › Ask › Hide Ask** takes it off every surface. The decisions of a turn (offer a person, say the site has nothing, acknowledge a thanks) can be made by the judge, TypeSafe's Jev, instead of the writing model: see [The judge](#the-judge-jev) and the [Ask + Jev roadmap](../../../docs/ask-jev-roadmap.md).

## How a request flows

```
menu / closing band / /ask (useAskChat)
  └─ POST /api/ask { id, messages, pagePath, journey, handoff } (AI SDK UI-message protocol)
       ├─ hide check        → 404 if Site Info › Ask › Hide Ask is on
       ├─ config check      → 503 if OPENAI_API_KEY unset
       ├─ rate limit        → 429 (10 req/min per IP, per warm instance)
       ├─ validation        → 400 (last message must be a user question, 3–500 chars,
       │                      or more than 30 messages)
       ├─ retrieveSources() → embed the retrieval query (current question, or previous
       │                      user turn + current, capped at 700 chars) → cosine search
       │                      over ask_embeddings (chunks grouped into ≤4 doc sources);
       │                      falls back to keyword match over the search index when
       │                      embeddings are unavailable, nothing clears the
       │                      similarity floor, or the embedding call fails
       ├─ no sources, first turn → the handoff (`no_answer`) streamed, no model call
       ├─ no sources, follow-up  → chat-only prompt (no new facts allowed), 400-token cap
       ├─ streamText()      → source-url parts first, then the grounded answer streamed
       │                      (1,200-token cap), with the `handoff` tool on offer until
       │                      the visitor has sent
       └─ recordAskQuestion() → one redacted row per turn in `ask-questions`, written after
                                the response from whichever callback closed the stream
                                (finish, abort/Stop, or error): question, answer,
                                sources with similarity, outcome, tokens, latency
  └─ POST /api/ask/feedback { id, turn, rating?, reason?, handoff? } → the visitor's word on
     a stored turn (thumbs, or the contact-page click); the inquiry intake marks `inquiry_sent`
```

That is the flow with the judge `off` (the default). With `ASK_JEV=on` the decisions move out of the writing model:

```
POST /api/ask
  ├─ hide / config / rate limit / validation          (unchanged)
  ├─ contact details in the question? (regex, code)   → card `contact_details`, no Jev, no model
  ├─ in parallel:
  │    ├─ resolveJourney() the journey's paths → titles from the Ask index
  │    ├─ judgeTurn()      one Jev request: `request` Choice, the `own_project`,
  │    │                   `general_question` and `names_work` Nouls,
  │    │                   `depends_on_previous` on a follow-up, and
  │    │                   `open_reference` on a page about one thing
  │    └─ embedMany()      [question], + [previous + question] on a follow-up,
  │                        + ["About {page title}: question"] on such a page
  ├─ routeTurn()           plain `if`s over ASK_JUDGE_THRESHOLDS
  │    ├─ card             → the handoff card, no retrieval, no model
  │    ├─ conversation     → chat-only prompt, no retrieval, no tool
  │    ├─ evidence         → pgvector with the query form `depends_on_previous` picked,
  │    │                     and the page form beside it when `open_reference` says so
  │    └─ fallback         → the flow above, tool and all (unsure or failed judgment)
  ├─ judgePassages()       one Jev request per candidate chunk, all in parallel:
  │                        `is_relevant`, `has_evidence` → keep or drop in code
  │    └─ nothing kept     → card (`no_answer`, or the turn's own reason), no model
  ├─ streamText()          kept chunks only, NO tools, prompt without the tool rules
  └─ card after the text   written by code when the route carries a reason
```

## Files

| File | Role |
| --- | --- |
| [`retrieve.ts`](./retrieve.ts) | Retrieval seam: `prepareRetrieval(payload, queries)` embeds every query form at once and returns a `search()` that picks one, so the endpoint can decide which while the embedding is in flight; `retrieveSources(payload, question)` is the one-query shorthand. Returns the sources (each with its best chunk similarity), the path that found them, and the chunk counts. Embedding search primary, keyword fallback. A `check` handed to `search()` may veto chunks before they become sources (the judge's passage check; the similarity floor then drops from 0.3 to 0.2, since the check is the real filter); `observe` sees the same chunks and changes nothing. The endpoint knows nothing about how sources are found, and retrieval knows nothing about Jev. `retrievalQueries()` builds the follow-up query forms. |
| [`judge.ts`](./judge.ts) | The judge, server only: `askJudgeMode()` (`ASK_JEV`, always `off` without `TYPESAFE_API_KEY`), a lazy TypeSafe client pinned to one Jev version with a 400 ms timeout and no retries, `judgeTurn()` and `judgePassages()` (both answer null on any failure and never throw), every threshold in `ASK_JUDGE_THRESHOLDS`, and the pure routing: `routeTurn()`, `routePassage()`, `dependsOnPrevious()`. The question is redacted before it is sent. Tested in `judge.test.ts` (routing, mode parsing, null handling; no network). |
| [`AskSession.tsx`](./AskSession.tsx) | The site's one conversation, mounted in the root providers: one AI SDK `Chat`, the handoff the visitor sent, and the ratings, read by every surface through `useAskChat`. Also keeps the journey (in refs, nothing renders from it) and sends it beside every question. |
| [`journey.ts`](./journey.ts) | The visitor's journey, client-safe and pure: a visit is a path, seconds on screen in a visible tab, and scroll depth. `journeyDigest()` is what the browser sends (one entry per path, the most recent eight), `journeyFrom()` is how the endpoint reads it (plain paths, clamped numbers, anything else dropped), `journeyEngagement()` is the one judgment made of it, in code: `read` or `skimmed`. Tested in `journey.test.ts`. |
| [`journeyPages.ts`](./journeyPages.ts) | Server half: `resolveJourney()` matches each path to a document in the Ask index, so every title a model or the prompt sees is one the site published, and a path the index does not know is dropped. One `SELECT DISTINCT` per instance per minute. `subject` marks pages about one thing (work, lab, expertise, audience pages, posts): only those can stand in for a question's missing subject. |
| [`vocabulary.ts`](./vocabulary.ts) | The words Ask and the team agree on, client-safe: the question length rule, the outcomes a turn can have (`askOutcome()` derives one from what the endpoint knows), retrieval paths, ratings and their reasons, handoff signals, triage statuses. The collection, the endpoint, the composer and the admin panels all read these lists. Tested in `vocabulary.test.ts`. |
| [`embeddings.ts`](./embeddings.ts) | ask_embeddings storage/query: `embedMany` on write, cosine-distance SQL on read. |
| [`chunk.ts`](./chunk.ts) | Heading-aware markdown chunker (~500-token chunks, split on h1–h3 first, tiny sections merged). |
| [`schema.ts`](./schema.ts) | Drizzle table for ask_embeddings, registered via `beforeSchemaInit` in payload.config.ts. |
| [`indexSync.ts`](./indexSync.ts) | Publish/unpublish/delete → re-embed or remove; canonical Content Hub edits re-embed dependent pages. |
| [`../../plugins/ask-index.ts`](../../plugins/ask-index.ts) | Attaches the sync hooks to every surface collection (from the shared surface registry). |
| [`model.ts`](./model.ts) | Provider seam: answer model (`gpt-5-mini`) and embedding model (`text-embedding-3-small`), both via the Vercel AI SDK. The endpoint sets the reasoning effort: `low` while the model also decides (judge off, or a turn that fell back), `minimal` with a 400-token cap once the judge has routed the turn and the model only writes. |
| [`AskWidget.tsx`](./AskWidget.tsx) | The `/ask` page surface. Wires `useAskChat` into a standalone card: transcript, shimmer, streamed answers with source links. |
| [`useAskChat.ts`](./useAskChat.ts) | Chat wiring shared by every surface: composer state, Stop, one handoff per conversation (`handoff` in the request body), and visitor feedback. On the site it reads the one conversation in `AskSession`; a scripted surface (a `transport` or seeded messages: stories, tests) keeps a chat of its own. |
| [`MenuAsk.tsx`](./MenuAsk.tsx) | Takeover-menu surface. Composer and transcript sit in the docked preview slot; hidden when Site Info › Ask › Hide Ask is on. |
| [`../../Footer/Closing/ClosingAsk.tsx`](../../Footer/Closing/ClosingAsk.tsx) | Closing-band surface. Suggestion chips are hardcoded in this file (not a Payload field). From `md` the conversation is an in-card panel; on a phone it is a full-screen sheet. |
| [`Composer.tsx`](./Composer.tsx) | `AskTextarea`: the composer's text box wherever it is a textarea (the page, the closing band, its phone sheet). Enter sends, Shift+Enter breaks a line, the cap is the endpoint's. |
| [`Rating.tsx`](./Rating.tsx) | Two thumbs under every settled reply, after the sources and before the handoff. Thumbs down asks one more question in the same row (wrong, incomplete, off topic). |
| [`feedback.tsx`](./feedback.tsx) | The visitor's word on a turn, filed under the chat id and the question's own message id (`turn`), so no row id ever reaches the browser. The transcript provides it; the rating control and the handoff read it. `postAskFeedback` fires and forgets. |
| [`motion.ts`](./motion.ts) | The transcript's entrance classes, shared by the transcript, the rating, and every surface's error line. |
| [`messages.tsx`](./messages.tsx) | Transcript body shared by every surface. Holds the shimmer until there is something to read (an assistant message with only source parts stays unmounted), renders sources only once the answer has settled, renders a handoff-only reply's lead line as the assistant's words, and closes the last settled reply (even one that settled with nothing to read) with one handoff per conversation. |
| [`Sources.tsx`](./Sources.tsx) | An answer's sources as a disclosure group: one "Sources" row with the count, a leading chevron that turns down, and inset rows (surface glyph, title, section from the surface registry, → arrow) on the shared `.disclosure-body` track. Collapsed by default. |
| [`HandoffPanel.tsx`](./HandoffPanel.tsx) | The way to a person under a finished reply, in three states on one surface: the **offer** (a line per kind and a "Talk to the team" chip, the footprint of a quiet row), the **form** it opens into in place (Site Info's reply promise, Name and Email in an inset field group, "Send to the team" posting the visitor's questions to the inquiries intake), and the **receipt** it becomes ("Book a call" there when Site Info has a booking link). Every state change rides `useRevealSwap` with `morphHeight`. Built only from `components/ui` (`Card variant="inset"`, `FieldGroup variant="inset"`, `Input variant="bare"`, `Button size="chat"`). The file is not named `Handoff.tsx`: that collides with `handoff.ts` on a case-insensitive filesystem and TypeScript refuses both. |
| [`handoffTool.ts`](./handoffTool.ts) | Server side of the handoff: the `handoff` tool the model can call with a reason, and `resolveAskHandoff`, which pairs it with Site Info's terms (reply time, booking link). The tool's description and every reason's wording exclude questions the sources answer, so a visitor asking how projects start gets an answer rather than a form. Tested in `handoffTool.test.ts`. |
| [`messageText.ts`](./messageText.ts) | The words of a transcript message (text parts only), one reading for the endpoint, the transcript, and the handoff. |
| [`questions.ts`](./questions.ts) | `recordAskQuestion()`: stores each turn for the team after the response, redacted (question and answer), with its sources, outcome, tokens and latency, the page it was asked on, and the chat and message ids. No IP, no analytics id. `markAskTurn()`: the visitor's rating and handoff signal onto that row, first rating wins, a sent inquiry never steps back to a click. |
| [`redact.ts`](./redact.ts) | `redactFreeText()`: strips emails, phone and card numbers, URL query strings, and key-shaped strings before storage. Keeps budgets, years, dates, and page slugs. Tested in `redact.test.ts`. |
| [`retention.ts`](./retention.ts) | `ASK_QUESTION_RETENTION_DAYS` and `ASK_NOTICE`, the first line of every transcript. One constant, so the promise and the deletion job cannot drift. Client-safe. |
| [`handoff.ts`](./handoff.ts) | The handoff contract, client-safe: the reasons, the copy per kind (`ASK_HANDOFFS`, each with the lead line, the offer line, and the destination form), Site Info's terms (`AskHandoffTerms`, `resolveAskHandoffTerms`), the typed transcript message (`AskUIMessage`, with the `tool-handoff` part), `handoffOf`, the conversation's state (`askHandoffState`: none, offered, sent), and the sessionStorage carry to the contact form (`saveAskHandoff`, `readAskHandoff`, `clearAskHandoff`). Tested in `handoff.test.ts`. |
| [`prompts.ts`](./prompts.ts) | `askSystemPrompt()`: the system prompt per turn, grounded or chat-only, with the handoff tool's rules while the tool is on offer and without a word of it once the visitor has sent (`offersAskHandoff`), so the prompt and the tool list never disagree. Tested in `prompts.test.ts`. |
| [`history.ts`](./history.ts) | `askHistory()`: the transcript as the model may see it. Roles and text parts only, one character budget, and a handoff-only reply kept as the lead line the visitor read, so the model never faces an unanswered turn. Tested in `history.test.ts`. |
| [`fixtures.ts`](./fixtures.ts) | Story fixtures shared by every surface's stories: a scripted chat typed with the handoff tool, Site Info's terms, a resolved handoff, two sources. |
| [`storyPlays.ts`](./storyPlays.ts) | Play steps shared by every surface's stories: opening the handoff, sending it, and standing in for the inquiries intake. Separate from `fixtures.ts`, which the unit tests import and which must stay free of Storybook's runtime. Never assert `toBeVisible()` inside the transcript: `MessageScrollerItem` uses `content-visibility: auto`, so the matcher fails on a field the visitor can read. |
| [`../../collections/AskQuestions.ts`](../../collections/AskQuestions.ts) | Admin › Inbox › Ask questions. Team-only; nobody creates through the API, and only the triage fields (status, topic, note, planned content) can be edited. |
| [`../../collections/AskQuestions/components/`](../../collections/AskQuestions/components/) | The admin's reading room: `AskFilters` (New, Content gaps, Thumbs down, Went to a person), `AskConversation` (the whole chat a row belongs to, also shown on an inquiry that came from Ask), `AskDashboard` (the week's counts and the newest untriaged gaps), and the list queries they share. |
| [`../../jobs/askQuestionRetention.ts`](../../jobs/askQuestionRetention.ts) | Daily Payload task that deletes questions past the retention window, run by the existing `/api/payload-jobs/run` cron. |
| [`SubmitButton.tsx`](./SubmitButton.tsx) | The composer button shared by every surface: submit when idle, an enabled Stop while a reply is in flight. |
| [`../../endpoints/ask.ts`](../../endpoints/ask.ts) | The `POST /api/ask` Payload endpoint: validation, rate limiting, retrieval, prompt assembly from `prompts.ts` (the studio voice, no inline citations since links render separately, the partial-answer mode: say what is published, then one next step with a page path from the source `url`), and where the conversation stands with the team appended, so the model never offers twice. |
| [`backfill.ts`](./backfill.ts) | One full pass over every surface and global with a per-instance run lock; shared by the CLI script and the admin rebuild. Stores the summary of the last pass in Payload KV (`ask:index-last-rebuild`). |
| [`admin/RebuildIndexPanel.tsx`](./admin/RebuildIndexPanel.tsx) | Site Info › Ask action panel: "Rebuild index" button, progress note, and when the index was last rebuilt (from `GET /api/ask/reindex`). |
| [`usage.ts`](./usage.ts) | OpenAI spend (Costs API) and tokens per model (Usage API) over the last 30 days, month-to-date split out. Needs `OPENAI_ADMIN_API_KEY` (an Admin key, not the project key); `OPENAI_PROJECT_ID` optionally scopes it. OpenAI is called only on an explicit refresh (its Admin API allows 30 requests a minute); the last report lives in Payload KV (`ask:usage-report`). OpenAI exposes no remaining-credit balance over the API. |
| [`admin/UsagePanel.tsx`](./admin/UsagePanel.tsx) | Site Info › Ask usage panel: spend tiles, cost by line item, tokens by model, "last refreshed" note. Opens from the stored report (`GET /api/ask/usage`); only the Refresh button fetches from OpenAI (`POST /api/ask/usage`). Both team-only. |
| [`../../../scripts/backfill-ask-index.ts`](../../../scripts/backfill-ask-index.ts) | CLI entry for the same pass: `pnpm exec tsx --env-file=.env scripts/backfill-ask-index.ts`. |
| [`../../../scripts/ask-cases.ts`](../../../scripts/ask-cases.ts) | The shared fixture: what a visitor asks, the card the turn must end in, whether it must have words, and the pages retrieval must find. Read by the three scripts below. |
| [`../../../scripts/ask-bench.ts`](../../../scripts/ask-bench.ts) | `capture <label> [base-url]` runs the fixture three times against a running site (paced under the rate limit, stream read incrementally for time to first output) into `docs/perf/ask-jev/<label>.json`; `compare <label> <label> ...` prints the table and writes `docs/perf/ask-jev/report.md`. |
| [`../../../scripts/ask-judge-eval.ts`](../../../scripts/ask-judge-eval.ts) | The judge's tuning tool, no server needed: Jev's probabilities beside the fixture's expectation. `--passages` retrieves candidates and prints per-chunk relevance and evidence; `--from-db` replays stored `ask-questions` rows for an agreement rate. |

## The corpus

What gets embedded is decided by the shared surface registry
([`src/shared/content/surfaces.ts`](../../shared/content/surfaces.ts)) — the same registry that
drives llms.txt, plugin-seo URLs, and the search index. Every public collection participates
(pages, posts, work-pages, lab-pages, expertise-pages, audience-pages, contact-pages), plus the
global surfaces in `GLOBAL_SURFACES`: the homepage (`home`), the `/insights` and `/works` heroes,
and Site Info (name, tagline, description, legal name when it differs, founding year, address,
contact email, inquiry response time, booking link, social profiles, and any `llmsNotes`) so
"where are you", "how do I reach you", and "who are you" questions have evidence.

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
   chunk is not evidence.
3. Chunks group into ≤4 document sources (≤3 chunks each, document order).
4. **Fallback** to the original keyword match over the search-plugin index (hydrated through
   the same extractor) when there is no API key, the embedding call fails, the index is empty,
   or nothing clears the similarity floor. Both paths empty = refuse on a first turn (the
   `no_answer` handoff, no model call) and chat-only on a follow-up.

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
sends), plus `id`, `pagePath`, `journey`, and `handoff` from the client body: the AI SDK chat id, the
page the composer sits on, the pages this tab has shown (`{ path, seconds, depth }[]`, read by
`journeyFrom`; malformed entries are dropped and a missing journey is an empty one), and where
the conversation stands with the team (`none` / `offered` / `sent`; anything else reads as `none`). Success responses are AI SDK
UI-message SSE streams: `source-url` parts for the retrieved docs, then streamed `text`
parts, then optionally one `tool-handoff` part whose output is the resolved handoff
(`AskHandoff`: `reason`, `responseTime`, `scheduleUrl`).
Model failures surface as an `error` part. Incoming history (`askHistory`) keeps text parts
only: a tool part is never replayed to the model, a handoff-only reply is kept as its lead
line, and a turn left with nothing to say is dropped.

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

`POST /api/ask/feedback` (public, its own 10-per-minute budget) with `{ id, turn, rating?, reason?, handoff? }`:
`id` is the chat id and `turn` the user message's id, as `useChat` holds them. The first rating
wins and its reason may follow once (the thumb posts before the reason is picked); `handoff` may
only be `clicked`, since `inquiry_sent` is the inquiries intake's to write. Unknown values are
ignored, an unknown pair is a quiet `{ ok: true }`, and nothing about what is stored is revealed.
400 when neither a rating nor a handoff signal is present.

`GET /api/ask/usage` (team only): `{ configured, report }`, the last stored OpenAI usage report
or null; never calls OpenAI. `POST /api/ask/usage` fetches a fresh report from OpenAI, stores it,
and returns the same shape. 503 with `configured: false` when `OPENAI_ADMIN_API_KEY` is unset,
502 with OpenAI's message when the Admin API rejects the call.

## Configuration

| Env var | Effect |
| --- | --- |
| `OPENAI_API_KEY` | Enables the endpoint, question embedding, and publish-time embedding sync. Unset → 503 answers; hooks skip embedding (warn once) until the backfill script runs. |
| `OPENAI_ADMIN_API_KEY` | Admin key for the Site Info › Ask usage panel (Costs and Usage APIs). Unset → the panel is marked unconfigured; Refresh returns 503. Not the project key. |
| `OPENAI_PROJECT_ID` | Optional. Scopes the usage report to one OpenAI project; omit it to read the whole organization. |
| `TYPESAFE_API_KEY` | The judge's key (TypeSafe, Jev). Unset → the judge is `off`, whatever `ASK_JEV` says. |
| `ASK_JEV` | The judge's mode: `off` (default; the writing model decides, with the `handoff` tool), `shadow` (Jev runs beside that path and is measured, deciding nothing), `on` (Jev routes the turn and checks passages). Rollback is this value and a redeploy, no code revert. |

Models live in `model.ts`. Changing the **embedding** model or provider means re-embedding the
corpus: update `EMBEDDING_DIMENSIONS` in `schema.ts` if the size differs, migrate, and run the
backfill script.

## What we keep

- **Every turn, for the team.** Each accepted question lands in `ask-questions` (Admin › Inbox › Ask questions) after the response has gone out, so storage never adds latency: the question and the answer (both redacted), the sources with their best chunk similarity and which path found them, the outcome, the handoff reason if one was offered, latency, and tokens. `outcome` is what the visitor got, derived from what the endpoint knows (`askOutcome()`): `answered`, `partial` (a grounded reply that ended in a handoff other than `no_answer`), `no_sources` (a `no_answer` handoff: first-turn miss, the model found the sources irrelevant, or the judge's passage check kept nothing), `chat_only` (a reply with no sources behind it: a source-less follow-up, or a card the judge routed straight to a person), `stopped`, `error`. It is not a quality signal; the visitor's rating is. `Asked on` is the page path; `Chat` groups one conversation, which the row shows in full. Team agents can read it over MCP when a key is granted the capability.
- **The visitor's word.** Every settled reply can be rated (thumbs, one-tap reason after a thumbs down) and every handoff leaves a signal: `clicked` when the contact-page fallback was taken, `inquiry_sent` when the intake filed an inquiry from that chat (the inquiry carries `askConversation`, and its document shows the conversation). `POST /api/ask/feedback` finds the row by the chat id and the question's message id, keeps the first rating, and never lets a sent inquiry step back to a click.
- **Triage.** Status (new, reviewed, content planned, ignored), topic from the site's categories, a note, and the draft that closes the gap. The dashboard card counts the week (asked, answered from the site, gaps, thumbs down, went to a person, inquiries from Ask) and lists the newest gaps nobody has looked at.
- **Redacted before it lands.** `redactFreeText()` is one layer, not a guarantee: a name or employer in plain words survives. The first line of every transcript (`ASK_NOTICE`) tells people they are chatting with an AI (EU AI Act transparency) and that chats are saved anonymously for `ASK_QUESTION_RETENTION_DAYS` days. It does not ask them to leave personal details out. It is not part of cookie consent: it covers what people type, which is stored whatever they chose on the banner.
- **Deleted on schedule.** `askQuestionRetention` removes rows older than `ASK_QUESTION_RETENTION_DAYS`. It is queued by Payload's scheduler from the 10-minute jobs cron, so the first run lands at the first 05:00 UTC after deploy and a row can outlive the window by up to a day.
- **One more processor with the judge on.** In `shadow` and `on` the redacted question (and, for the passage check, the site's own published passages) goes to TypeSafe. It does not train on requests; zero retention is an enterprise plan. The privacy page must list it before the judge sees production traffic.
- **The journey is not kept.** It lives in the tab's memory, is read for the one turn it arrives with, and is not stored on the `ask-questions` row (which keeps `Asked on`, as before). PostHog gets a count (`journey_pages`) and two flags, never the paths. With the judge on, Jev's one journey question reads the question alone, and the only piece of the journey it ever sees is the current page's published title inside a search query it checks passages against; OpenAI sees the titles of the site's own pages in the prompt.
- **Nothing at OpenAI.** `store: false` stops the Responses API keeping each exchange for 30 days in the dashboard logs. The client resends the transcript every turn, and for reasoning models the SDK asks for encrypted reasoning instead of server-side item references. `sendReasoning: false` keeps that encrypted blob out of the browser.
- **Metadata only in PostHog.** `ask_questioned` carries length, source count, the follow-up flag, `outcome`, `retrieval`, `latency_ms`, `page_path` and `handoff_reason`, plus the judge's facts about the turn (`judge_mode`, `judge_ms`, `judge_failed`, `judge_request`, `judge_confidence`, `judge_agrees`, `chunks_candidates`, `chunks_kept`, `passages_ms`, `first_output_ms`, `model_skipped`, `fell_back`, `answer_model`, `journey_pages`, `page_leaned`, `page_attached`; the registry in the `posthog-analytics` skill defines each): a label, a count or a duration, never a probability beside text; `ask_rated` carries the rating, its reason and the turn's outcome; `ask_handoff_clicked` the contact-page fallback. Question text never goes to analytics: it could not be held to the retention window there, and it would sit next to a visitor id. PostHog is where the funnel is counted; the admin is where a question is read.

## Reaching a person

The chat never holds contact details: its log is anonymous and expires. Leads belong in Inquiries, which is owned, notifies the team, and confirms by email. Every surface (the menu, the footer's closing band, and the `/ask` page) renders the way to a person in `TranscriptItems`, so no surface can miss it.

**One handoff per conversation, three states.** The last settled reply closes with it; a newer reply takes it along. The words are code-owned throughout, so the model can offer a person but never word a promise:

- **The offer.** One line and a "Talk to the team" chip, the footprint of a plain row, so a finished answer is never followed by a form nobody asked for. When a person is the better next step the model calls the `handoff` tool with a reason: `estimate` (what their own project would cost, how long, when we could start), `project` (they say they have one, or ask us to do something for them), `person` (they asked for one by name or role, or to be called), `contact_details` (they typed an email address or phone number), `no_answer` (nothing on the site answers it; also the no-match first turn, with no model call). The model only decides *that* and *why*. Every reason's offer line, and the **lead line** shown as the assistant's words when the handoff is the whole reply, live in code (`ASK_HANDOFFS`; studio-voice drafts, not approved copy). Any other finished answer offers quietly, with no lead and the `none` kind. A reason this build has no copy for shows the quiet offer instead.
- **The form**, opened by the chip, in place on the same surface. Site Info's reply promise (`askHandoffPromise`, from `AskHandoffTerms`), a name and an address in one inset block (AutoFill fills it in a tap; an address they already typed in the chat starts the field, marked "From your message", and `contact_details` lands on the form directly), and "Send to the team". That posts their own questions (the same `From my Ask conversation:` text the contact form opens with) to `/api/inquiries/submit` through `postInquiry`, the intake the contact forms use, filed as a project inquiry for `estimate` and `project` and a general message otherwise, with `fromAsk`. The address is checked with the intake's own rule and words first (`isValidEmailAddress`, `INQUIRY_EMAIL_INVALID`). What is typed here never reaches the model or the Ask log. The form scrolls to its own top as it opens, since on a short panel it is taller than the transcript and the promise must not land above the fold.
- **The receipt**, in place again: the email it will reply to, the reference, and "Book a call" when Site Info has a booking link, offered only after the commitment.

Each state change rides the site's panel swap (`useRevealSwap` with `morphHeight`): the outgoing copy fades, the surface resizes, the incoming copy fades in staggered, and the card ground fades in on the same duration, so the offer reads as becoming the form rather than being replaced by it. Keyboard users land on the first field, then on the receipt; a finger is never handed a raised keyboard it did not ask for (`focusForKeyboard`, plus a fine-pointer check).

**The conversation remembers.** `askHandoffState` reads the transcript and the surface's own sent flag into `none` / `offered` / `sent`, and `useAskChat` sends it with every question. The endpoint appends one line to the system prompt from it, and once the visitor has sent it withholds the tool and drops every prompt line that named it (`prompts.ts`), so nothing offers twice and the model is never asked for a tool it does not have. On the server side `askHistory` keeps a handoff-only reply in the model's history as its lead line: dropping it (the old behavior) left the model facing two unanswered questions in a row, and it offered the same handoff again.

**The contact page is the fallback, not the path.** A "Prefer the full form? Contact page" link inside the form goes through `HandoffLink` (`saveAskHandoff` / sessionStorage). Retire that carry once inquiries from the form are the usual path.

- The link prefills the contact form's message with the visitor's latest questions, still theirs to edit. The questions travel in this tab's sessionStorage, never the URL, so they stay out of PostHog's captured URLs and server logs, and the contact page stays static.
- The handoff is read without being cleared: on a full page load the contact page remounts its form just after hydration, and a one-shot read would be spent on the first mount. It is cleared once the inquiry is sent, and ignored after 30 minutes.
- Already on the destination, a push to the same path does nothing, so the link reloads the page to pick the handoff up.

Both paths file the inquiry with the chat id (`askConversation`, with the turn it closes), so the inquiry's document shows what the lead asked before reaching out and the turn is marked `inquiry_sent`; `inquiry_submitted` in PostHog carries `from_ask`, derived from that id, so sales can count the leads Ask produced. `ask_questioned` carries `handoff_reason` (null when no offer was shown). Arrows follow one rule across Ask: → stays on the site (source rows, the contact-page fallback), ↗ leaves it ("Book a call", which opens in a new tab so the conversation survives). The prompts never let the model describe the offer or restate the reply time, and never repeat an email, phone number, or name back.

**Checking the triggers.** `scripts/ask-eval.ts` asks a running site a fixed set of six questions (three that must stay grounded with no offer, three that must reach a person) and reports the sources retrieved and the reason offered for each. The first three were the closing band's chips when the eval was written; the live chips in `ClosingAsk.tsx` can differ. Run it after any prompt or tool-description edit: `pnpm exec tsx scripts/ask-eval.ts http://localhost:3001`.

## One session, and the journey

**One conversation.** The menu, the closing band and `/ask` used to mount a chat each, so a question asked in the menu was unknown to the band under the same page, and the log filed them as unrelated chats. `AskSessionProvider` (root providers, above the header and every page) holds one `Chat`; every surface's `useAskChat` reads it. One transcript, one chat id in `ask-questions`, one handoff and one receipt, one set of ratings. Only the composer's draft and what a surface does on send (open its panel) are its own: a question sent from the menu leaves the band closed with "Resume conversation" on its composer. "New conversation" anywhere starts a new chat everywhere. The session survives client-side navigation; a full reload starts over, as before.

**The journey.** The session also keeps which pages this tab has shown, for how long in a visible tab, and how far each was scrolled (`journey.ts`). It is memory only: nothing is written to the device, nothing carries an id, and it leaves the browser only beside a question the visitor chose to ask. The browser sends paths and numbers, never words; the endpoint resolves each path against the Ask index (`journeyPages.ts`), so a made-up path is dropped and no client text reaches a prompt by this route. Code decides `read` or `skimmed` (20 s on screen, or 60 percent deep after 8 s), the order, and the cap: Jev does not count or compare times.

With `ASK_JEV=on` the journey does two things, and in `off` nothing reads it:

- **It gives "it" a subject.** "What did you do for them?" asked on `/works/interchecks` names nobody. Jev answers one more Noul in the turn's one request, `open_reference` (does the question point at something it does not name?), asked only when the page is about one thing. At 0.8 or more the search also runs as "About Interchecks: What did you do for them?", each form's candidates are checked against its own words, and the kept chunks are pooled. Beside, never instead: the idiom in "What does it cost?" reads as a reference too (0.96), and the plain search still finds the pricing answer. Measured live: the same question answered about GentleBeast without the page and about Interchecks with it.
- **It tells the writing model where the visitor is.** Two lines under "This conversation:" on a grounded, routed turn: the page asked from (title and section, no path), and up to four pages read before it, to pick what to lead with among the sources. The sources stay the only facts, and the model is told never to hint at what the visitor viewed.

What it costs: nothing new is called. One more question in the existing Jev request (about 950 input tokens a turn, $0.00004), one more short string in the existing `embedMany` call, up to twelve more passage checks only on a turn that leans on its page, and about 60 tokens of prompt. No new round trip on the path to first output.

Tuning: `scripts/ask-judge-eval.ts --journey [--passages]` runs `ASK_JOURNEY_CASES` (13 of 13 on 2026-09-19) and replays the turn fixture with the new question asked (19 of 19: no route moved).

## The judge (Jev)

Ask spent a full writing-model call on every turn, including turns whose only output is a decision. Jev (TypeSafe's System One model) cannot write, but it returns typed answers with calibrated probabilities in roughly 150 to 350 ms. With `ASK_JEV=on` the decisions move to Jev and code, and the writing model is left one job: write a grounded answer from passages that were already vetted. Turns that need no writing skip it entirely.

- **Code owns the workflow.** Jev returns probabilities; every number lives in `ASK_JUDGE_THRESHOLDS` and every branch is a plain `if` in `routeTurn()` and `routePassage()`. Changing policy is a number edit, never a reworded question.
- **The turn, one request, asked beside the embedding call** so it adds no wait: `request` (a Choice: information, estimate, project, person, conversation, other), three Nouls that tell whether only a person could settle it (`own_project`, `general_question`, `names_work`), and on a follow-up `depends_on_previous`.
- **The route.** `person` at confidence 0.6 or more is the card alone. An `estimate` is the card alone when it is plainly the visitor's own project (`own_project` at 0.6 or more) and no general question rides along (`general_question` under 0.5); a `project` when it names no kind of work ("I have a project"), where "can you fix my Webflow site?" names work the site may speak to. Every other estimate or project retrieves, answers from what is kept, and closes with its card, written by code after the text, so the partial answer the writing model could not do reliably (words and a tool call in one turn) now always lands. `conversation` on a follow-up is the chat-only prompt with no retrieval. Everything else retrieves and answers.
- **The passages.** One Jev request per candidate chunk, all in parallel, each judged alone against the query (a large state full of unrelated text costs Jev accuracy): `is_relevant` below 0.45 drops it, `has_evidence` above 0.55 keeps it, otherwise dropped. Sources shown to the visitor are only documents with kept chunks. Nothing kept means the card (`no_answer`, or the turn's own reason) with no model call, on first turns and follow-ups alike.
- **Fail open.** A missing key, a timeout, a 429, or a `request` confidence under 0.35 is the judge-off path for that turn, tool and all (`fell_back`); a passage whose check failed is kept. A visitor never sees a Jev error.
- **Contact details stay in code.** `findEmailAddress` and the digit-run rule in `redact.ts` find them before Jev or the model is asked, and the question Jev sees is redacted.
- **Once the visitor has sent, never a card**, exactly as `offersAskHandoff` rules the tool.
- **`shadow`** runs both Jev requests beside the judge-off path, awaits neither in the response, and records what Jev would have done (`judge_agrees`, `chunks_kept`, the timings), so latency and agreement are known before Jev decides anything.

Tuning: `pnpm exec tsx --env-file=.env scripts/ask-judge-eval.ts [--passages] [--from-db]`. Before and after: `scripts/ask-bench.ts`, captures and the report in [`docs/perf/ask-jev/`](../../../docs/perf/ask-jev/report.md). The model is pinned (`ASK_JUDGE_MODEL`), not `jev-latest`: re-run the eval before bumping it.

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
  shared store (roadmap stage 5) if the endpoint draws real traffic. Ask is already on the
  menu and the closing band; Hide Ask is the off switch.
- **Retrieval evals are young.** `scripts/ask-cases.ts` is the question → expected-source
  fixture, and `scripts/ask-judge-eval.ts --passages` measured the floor once (2026-09-19): 0.3
  cut a chunk that answers "What does it cost?" (similarity 0.23), so the floor is 0.2 when the
  judge's passage check runs and 0.3 when nothing else filters. Chunk sizes are still reasoned
  defaults.
- **Answers are only as good as what's published.** Empty corpus = refusals; run the backfill
  after seeding content.
- **Follow-up retrieval is a concatenation, not a rewrite.** The previous user turn is
  prepended to the query. Good enough for one-hop follow-ups; a model-written standalone
  question is the next step if evals show multi-hop misses.
- **The judge reads literally.** Jev answers the question as written, not as meant: a universal ("is every part of it...") read low on plainly own-project questions, which is why that judgment is three literal Nouls combined in code. It does not count, compare dates, or reason over several hops, and it does not treat state as hostile; the passages it reads are the studio's own published content. Thresholds were tuned on a 19-case fixture and a 370-chunk corpus, not on production traffic: shadow mode is where they meet it.
- **An abandoned handoff form loses its draft.** The offer follows the latest reply, so a
  form opened and then left for a new question closes. A send already in flight still lands:
  `markSent` lives in the surface hook, so the receipt pins to the reply it was sent from.
